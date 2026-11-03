/*
 * assign.js - arm and form-order assignment for the study entry page (card STD-FORM1).
 * One file, no dependencies.  Works in Node (require) and in the browser (global StudyAssign).
 *
 * Built from:
 *  - STUDY-DESIGNS.md section 0.4: "a hash of the participant id plus a sealed salt; even = game,
 *    odd = reading. Forms B and C are swapped for half of each arm (same hash, next bit)."
 *  - FNV-1a 32-bit (Fowler, Noll, Vo; offset 2166136261, prime 16777619; test vectors from
 *    http://www.isthe.com/chongo/tech/comp/fnv/ : "a" -> 0xe40c292c, "foobar" -> 0xbf9cf968).
 *  - Murmur3 fmix32 finalizer (Austin Appleby, public domain).  Plain FNV-1a mixes its low bits
 *    poorly (bit 0 is only the parity of the low bits of the input bytes), and this design reads
 *    the two lowest bits.  The finalizer makes every output bit depend on every input bit.
 *
 * Contract:
 *   assign(code, studySeed) -> { arm: "game" | "reading", order: "BC" | "CB" }
 *   - same code and same seed always give the same answer (no randomness, no clock, no storage);
 *   - the seed is part of the hashed text, so a changed seed re-draws the assignment;
 *   - arm = bit 0 of the hash (even = game, odd = reading); order = bit 1 (0 = BC, 1 = CB);
 *   - an empty or malformed code throws an Error (the page shows a message and does not start).
 *
 * Limits, stated plainly:
 *   - A client-side hash cannot meet "nobody can choose or predict an arm" (0.4) against a determined
 *     learner: the seed is in the page source and the arm is in the next page's URL, so anyone can
 *     compute an arm for any code, or edit arm and order in the URL.  The page only stops the casual
 *     cases (no link or arm is shown before Start; a code from the platform link is locked).
 *   - The real defence is the analysis: it recomputes assign(pc, seed) for every result code (assign.py
 *     is a port for that) and excludes a result whose arm or order differs, and it ties pc to the
 *     platform's own export, which the learner cannot edit.  For the proof study 0.4 also names a
 *     blocked list served by a small Apps Script page; that is the stronger option.
 *   - The code is trimmed and lowercased before hashing, so "ABC " and "abc" are one person.
 *   - A fair hash gives a binomial split, not an exact one: 1,000 codes land outside 47-53 percent
 *     about 6 percent of the time.  ANCOVA absorbs a small imbalance (STUDY-DESIGNS.md 0.4).
 */
(function (root, factory) {
  if (typeof module === 'object' && module && module.exports) module.exports = factory();
  else root.StudyAssign = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Checked on the trimmed text BEFORE lowercasing: toLowerCase turns the Kelvin sign U+212A into "k".
  // ASCII only. Prolific ids are 24 hex characters.
  var CODE_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

  // FNV-1a, 32-bit, over UTF-16 code units (the code pattern is ASCII, so this equals bytes).
  function fnv1a32(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  // Murmur3 32-bit finalizer.
  function fmix32(h) {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
  }

  // Returns the normalised code, or throws.  Exposed so the page and the analysis use the same rule.
  function normalize(code) {
    if (typeof code !== 'string') throw new Error('Participant code is required');
    // Trim ASCII whitespace only (space, tab, CR, LF), the same as assign.py.  String.trim would also
    // strip U+FEFF and Unicode spaces, which Python's strip handles differently.
    var c = code.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
    if (c.length === 0) throw new Error('Participant code is empty');
    if (!CODE_PATTERN.test(c)) {
      throw new Error('Participant code must be 4 to 64 letters (A to Z), digits, hyphens or underscores, with no spaces');
    }
    return c.toLowerCase();
  }

  // The seed is an integer from 0 to 2147483647 (the study log stores an integer, and the builds read it with
  // `seed | 0`, which wraps above 2^31; a bigger or negative seed would make the builds log a different seed
  // than the one hashed here).  "007" and 7 are the same seed.
  function normalizeSeed(seed) {
    if (typeof seed === 'string' && /^-?[0-9]{1,15}$/.test(seed.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, ''))) seed = parseInt(seed, 10);
    if (typeof seed !== 'number' || !isFinite(seed) || Math.floor(seed) !== seed || seed < 0 || seed > 2147483647) {
      throw new Error('study seed must be an integer from 0 to 2147483647');
    }
    return String(seed);
  }

  function hashFor(code, studySeed) {
    return fmix32(fnv1a32(normalizeSeed(studySeed) + '|' + normalize(code)));
  }

  function assign(code, studySeed) {
    var h = hashFor(code, studySeed);
    return {
      arm: (h & 1) === 0 ? 'game' : 'reading',
      order: (h & 2) === 0 ? 'BC' : 'CB'
    };
  }

  return { assign: assign, normalize: normalize, normalizeSeed: normalizeSeed, fnv1a32: fnv1a32, fmix32: fmix32 };
});
