'use strict';

const LIMITS = {
  belt: 60,
  question: 300,
  correctAnswer: 200,
  userAnswer: 200,
  description: 1000,
  correction: 500,
  email: 254
};

const MIN_SUBMIT_MS = 3000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimmed(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function tooLong(value, max) {
  return value.length > max;
}

function validateFeedback(body, now) {
  const source = body && typeof body === 'object' ? body : {};
  const belt = trimmed(source.belt);
  const question = trimmed(source.question);
  const correctAnswer = trimmed(source.correctAnswer);
  const userAnswer = trimmed(source.userAnswer);
  const description = trimmed(source.description);
  const correction = trimmed(source.correction);
  const email = trimmed(source.email);
  const website = trimmed(source.website);
  const openedAt = Number(source.openedAt);

  const errors = [];

  if (!belt || tooLong(belt, LIMITS.belt)) errors.push('Bælteniveau mangler.');
  if (!question || tooLong(question, LIMITS.question)) errors.push('Spørgsmålet mangler.');
  if (!correctAnswer || tooLong(correctAnswer, LIMITS.correctAnswer)) errors.push('Det korrekte svar mangler.');
  if (tooLong(userAnswer, LIMITS.userAnswer)) errors.push('Dit svar er for langt.');
  if (!description || tooLong(description, LIMITS.description)) {
    errors.push('Beskriv venligst fejlen (op til ' + LIMITS.description + ' tegn).');
  }
  if (tooLong(correction, LIMITS.correction)) errors.push('Forslaget til rettelse er for langt.');
  if (email && (tooLong(email, LIMITS.email) || !EMAIL_RE.test(email))) {
    errors.push('E-mailadressen ser ikke gyldig ud.');
  }
  if (!Number.isFinite(openedAt) || openedAt <= 0 || openedAt > now) {
    errors.push('Formularen kunne ikke bekræftes. Prøv at åbne den igen.');
  }

  if (errors.length) {
    return { valid: false, errors, spam: false, feedback: null };
  }

  const spam = website.length > 0 || (now - openedAt) < MIN_SUBMIT_MS;

  return {
    valid: true,
    errors: [],
    spam,
    feedback: {
      belt,
      question,
      correctAnswer,
      userAnswer: userAnswer || null,
      description,
      correction: correction || null,
      email: email || null
    }
  };
}

module.exports = { validateFeedback, MIN_SUBMIT_MS, LIMITS };
