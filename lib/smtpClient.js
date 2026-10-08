'use strict';

const tls = require('tls');

const CRLF = '\r\n';
const DEFAULT_TIMEOUT_MS = 15000;

class SmtpError extends Error {}

function encodeBase64(value) {
  return Buffer.from(String(value), 'utf8').toString('base64');
}

function sanitizeHeaderValue(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function dotStuff(body) {
  return String(body)
    .split(/\r\n|\n/)
    .map(function (line) { return line.startsWith('.') ? '.' + line : line; })
    .join(CRLF);
}

function createResponseReader(socket) {
  let buffer = '';
  let lineQueue = [];
  let waiter = null;

  function findFinalLineIndex() {
    for (let i = 0; i < lineQueue.length; i++) {
      const line = lineQueue[i];
      if (line.length >= 4 && line[3] === ' ') return i;
      if (line.length === 3) return i;
    }
    return -1;
  }

  function tryDeliver() {
    if (!waiter) return;
    const finalIndex = findFinalLineIndex();
    if (finalIndex === -1) return;
    const lines = lineQueue.splice(0, finalIndex + 1);
    const resolve = waiter.resolve;
    waiter = null;
    resolve(lines);
  }

  socket.on('data', function (chunk) {
    buffer += chunk.toString('utf8');
    let idx;
    while ((idx = buffer.indexOf(CRLF)) !== -1) {
      lineQueue.push(buffer.slice(0, idx));
      buffer = buffer.slice(idx + 2);
    }
    tryDeliver();
  });

  return {
    nextResponse: function (timeoutMs) {
      return new Promise(function (resolve, reject) {
        const timer = setTimeout(function () {
          waiter = null;
          reject(new SmtpError('Timeout ved svar fra SMTP-serveren.'));
        }, timeoutMs);
        waiter = {
          resolve: function (lines) {
            clearTimeout(timer);
            resolve(lines);
          }
        };
        tryDeliver();
      });
    }
  };
}

function assertCode(lines, expectedCodes, context) {
  const code = Number(lines[lines.length - 1].slice(0, 3));
  if (!expectedCodes.includes(code)) {
    throw new SmtpError('Uventet SMTP-svar under ' + context + ': ' + lines.join(' | '));
  }
  return code;
}

async function runSmtpSession(socket, options) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const reader = createResponseReader(socket);

  function write(command) {
    socket.write(command + CRLF);
  }

  assertCode(await reader.nextResponse(timeoutMs), [220], 'forbindelse');

  write('EHLO judoteori.dk');
  assertCode(await reader.nextResponse(timeoutMs), [250], 'EHLO');

  write('AUTH LOGIN');
  assertCode(await reader.nextResponse(timeoutMs), [334], 'AUTH LOGIN');

  write(encodeBase64(options.user));
  assertCode(await reader.nextResponse(timeoutMs), [334], 'brugernavn');

  write(encodeBase64(options.password));
  assertCode(await reader.nextResponse(timeoutMs), [235], 'adgangskode');

  write('MAIL FROM:<' + sanitizeHeaderValue(options.from) + '>');
  assertCode(await reader.nextResponse(timeoutMs), [250], 'MAIL FROM');

  write('RCPT TO:<' + sanitizeHeaderValue(options.to) + '>');
  assertCode(await reader.nextResponse(timeoutMs), [250, 251], 'RCPT TO');

  write('DATA');
  assertCode(await reader.nextResponse(timeoutMs), [354], 'DATA');

  const headerLines = [
    'From: ' + sanitizeHeaderValue(options.from),
    'To: ' + sanitizeHeaderValue(options.to),
    options.replyTo ? 'Reply-To: ' + sanitizeHeaderValue(options.replyTo) : null,
    'Subject: ' + sanitizeHeaderValue(options.subject),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8'
  ].filter(Boolean).join(CRLF);

  write(headerLines + CRLF + CRLF + dotStuff(options.text) + CRLF + '.');
  assertCode(await reader.nextResponse(timeoutMs), [250], 'besked');

  write('QUIT');
  await reader.nextResponse(timeoutMs).catch(function () {});
}

async function sendMail(options, deps) {
  deps = deps || {};
  const tlsConnect = deps.tlsConnect || tls.connect;
  const socket = tlsConnect({ host: options.host, port: options.port, servername: options.host });
  socket.setEncoding('utf8');

  try {
    await new Promise(function (resolve, reject) {
      socket.once('secureConnect', resolve);
      socket.once('error', reject);
    });
    await runSmtpSession(socket, options);
  } finally {
    socket.destroy();
  }
}

module.exports = {
  sendMail,
  runSmtpSession,
  encodeBase64,
  sanitizeHeaderValue,
  dotStuff,
  SmtpError
};
