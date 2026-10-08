const assert = require('assert');
const net = require('net');
const {
  sendMail,
  runSmtpSession,
  encodeBase64,
  sanitizeHeaderValue,
  dotStuff,
  SmtpError
} = require('./lib/smtpClient');

function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(function () { console.log('✓ ' + name); })
    .catch(function (err) {
      console.error('✗ ' + name + '\n  ' + (err && err.stack ? err.stack : err));
      process.exitCode = 1;
    });
}

test('dotStuff escaper linjer der starter med punktum', function () {
  assert.strictEqual(dotStuff('Hej\n.Skjult linje\nResten'), 'Hej\r\n..Skjult linje\r\nResten');
});

test('sanitizeHeaderValue fjerner linjeskift for at forhindre header-injektion', function () {
  assert.strictEqual(
    sanitizeHeaderValue('ond@example.com\r\nBcc: alle@example.com'),
    'ond@example.com Bcc: alle@example.com'
  );
});

test('encodeBase64 koder brugernavn og adgangskode', function () {
  assert.strictEqual(encodeBase64('bruger'), Buffer.from('bruger').toString('base64'));
});

// Starter en lokal, ren TCP-server på 127.0.0.1, der taler en minimal SMTP-dialog
// (EHLO/AUTH LOGIN/MAIL FROM/RCPT TO/DATA/QUIT). Ingen forbindelse til internettet
// eller nogen tredjepart indgår i denne test — alt kører på loopback.
function startFakeSmtpServer() {
  return new Promise(function (resolve, reject) {
    let resolveReceived;
    const receivedPromise = new Promise(function (r) { resolveReceived = r; });

    const server = net.createServer(function (socket) {
      let buffer = '';
      let collectingData = false;
      let dataBuffer = '';
      const received = { commands: [], dataLines: null };

      socket.write('220 fake.smtp.local ready\r\n');

      socket.on('data', function (chunk) {
        buffer += chunk.toString('utf8');
        let idx;
        while ((idx = buffer.indexOf('\r\n')) !== -1) {
          const line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          if (collectingData) {
            if (line === '.') {
              collectingData = false;
              received.dataLines = dataBuffer;
              socket.write('250 OK: besked modtaget\r\n');
            } else {
              dataBuffer += (dataBuffer ? '\r\n' : '') + line;
            }
            continue;
          }

          received.commands.push(line);
          if (line === 'EHLO judoteori.dk') socket.write('250 fake.smtp.local\r\n');
          else if (line === 'AUTH LOGIN') socket.write('334 VXNlcm5hbWU6\r\n');
          else if (line === encodeBase64('feedback@example.com')) socket.write('334 UGFzc3dvcmQ6\r\n');
          else if (line === encodeBase64('hemmelighed')) socket.write('235 Authentication successful\r\n');
          else if (line.startsWith('MAIL FROM:')) socket.write('250 OK\r\n');
          else if (line.startsWith('RCPT TO:')) socket.write('250 OK\r\n');
          else if (line === 'DATA') { socket.write('354 Send besked\r\n'); collectingData = true; }
          else if (line === 'QUIT') { socket.write('221 Bye\r\n'); socket.end(); }
          else socket.write('500 uventet kommando\r\n');
        }
      });

      socket.on('close', function () { resolveReceived(received); });
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', function () { resolve({ server: server, receivedPromise: receivedPromise }); });
  });
}

// Server der afviser login uanset adgangskode, til at teste fejlhåndtering.
function startRejectingSmtpServer() {
  return new Promise(function (resolve, reject) {
    const server = net.createServer(function (socket) {
      let buffer = '';
      socket.write('220 fake.smtp.local ready\r\n');
      socket.on('data', function (chunk) {
        buffer += chunk.toString('utf8');
        let idx;
        while ((idx = buffer.indexOf('\r\n')) !== -1) {
          const line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          if (line === 'EHLO judoteori.dk') socket.write('250 fake.smtp.local\r\n');
          else if (line === 'AUTH LOGIN') socket.write('334 VXNlcm5hbWU6\r\n');
          else socket.write('535 Authentication failed\r\n');
        }
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', function () { resolve(server); });
  });
}

async function connectTo(server) {
  const port = server.address().port;
  const socket = net.connect({ host: '127.0.0.1', port: port });
  await new Promise(function (resolve, reject) {
    socket.once('connect', resolve);
    socket.once('error', reject);
  });
  return socket;
}

test('runSmtpSession gennemfører en fuld AUTH LOGIN-dialog mod en lokal testserver', async function () {
  const { server, receivedPromise } = await startFakeSmtpServer();
  const clientSocket = await connectTo(server);

  await runSmtpSession(clientSocket, {
    user: 'feedback@example.com',
    password: 'hemmelighed',
    from: 'feedback@example.com',
    to: 'lars@example.com',
    replyTo: 'bruger@example.com',
    subject: 'Judo-Teori feedback: 2. kyu',
    text: 'Bælte: 2. kyu\nBeskrivelse: test.\n.linje der starter med punktum'
  });

  const received = await receivedPromise;
  server.close();

  assert.deepStrictEqual(received.commands, [
    'EHLO judoteori.dk',
    'AUTH LOGIN',
    encodeBase64('feedback@example.com'),
    encodeBase64('hemmelighed'),
    'MAIL FROM:<feedback@example.com>',
    'RCPT TO:<lars@example.com>',
    'DATA',
    'QUIT'
  ]);
  assert.ok(received.dataLines.includes('Subject: Judo-Teori feedback: 2. kyu'));
  assert.ok(received.dataLines.includes('Reply-To: bruger@example.com'));
  assert.ok(received.dataLines.includes('..linje der starter med punktum'), 'linjer med indledende punktum skal escapes');
});

test('runSmtpSession kaster SmtpError, når serveren afviser login', async function () {
  const server = await startRejectingSmtpServer();
  const clientSocket = await connectTo(server);

  await assert.rejects(
    runSmtpSession(clientSocket, {
      user: 'feedback@example.com',
      password: 'forkert',
      from: 'feedback@example.com',
      to: 'lars@example.com',
      subject: 'Test',
      text: 'test'
    }),
    SmtpError
  );

  clientSocket.destroy();
  server.close();
});

test('sendMail lukker socketen, når TLS-forbindelsen fejler', async function () {
  const { EventEmitter } = require('events');
  const socket = new EventEmitter();
  socket.destroyedByClient = false;
  socket.setTimeout = function () {};
  socket.setEncoding = function () {};
  socket.end = function () {};
  socket.destroy = function () { this.destroyedByClient = true; };

  const promise = sendMail({
    host: 'smtp.example.test',
    port: 465,
    user: 'feedback@example.com',
    password: 'hemmelighed',
    from: 'feedback@example.com',
    to: 'lars@example.com',
    subject: 'Test',
    text: 'test'
  }, {
    tlsConnect: function () {
      process.nextTick(function () { socket.emit('error', new Error('TLS fejlede')); });
      return socket;
    }
  });

  await assert.rejects(promise, /TLS fejlede/);
  assert.strictEqual(socket.destroyedByClient, true);
});
