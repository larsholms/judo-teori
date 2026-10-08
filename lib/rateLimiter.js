'use strict';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

// Best-effort, pr.-proces hukommelse. Da serverless-instanser er kortlivede og kan
// være flere samtidig, er dette IKKE en garanteret grænse på tværs af alle forespørgsler,
// men det bremser simple gentagne indsendelser inden for samme varme instans.
function createRateLimiter(options) {
  const windowMs = (options && options.windowMs) || WINDOW_MS;
  const maxRequests = (options && options.maxRequests) || MAX_REQUESTS;
  const hits = new Map();

  return {
    isRateLimited: function (key, now) {
      for (const [storedKey, storedTimestamps] of hits) {
        const current = storedTimestamps.filter(function (t) { return now - t < windowMs; });
        if (current.length) hits.set(storedKey, current);
        else hits.delete(storedKey);
      }
      const timestamps = (hits.get(key) || []).filter(function (t) { return now - t < windowMs; });
      timestamps.push(now);
      hits.set(key, timestamps);
      return timestamps.length > maxRequests;
    },
    entryCount: function () { return hits.size; }
  };
}

module.exports = { createRateLimiter, WINDOW_MS, MAX_REQUESTS };
