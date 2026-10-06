// The desk question (S1b): a day asks at most ONE unprompted question. Three things used to ask on their own: a standing order
// on the board, Maud's daily problem, and the night "what will Cash be?". pick() chooses the one for today; the others stay quiet.
// A question the player goes looking for (walks to Maud, opens the board) is prompted and is never limited here.
// Order: a standing order (real money, and it expires) beats Maud's problem (keeps all day) beats the night question (skippable).
(function (root) {
  const ORDER = ["standing", "maud", "night"], SKIPPABLE = { night: true };
  // avail: which of the three have something to ask today, e.g. { standing: true, maud: false, night: true }.
  // The first call of a game day fixes the answer in s.deskQ; later calls that day return the same kind (a call never changes it).
  function pick(s, avail) {
    const d = s.deskQ;
    if (d && d.day === s.day) return d.kind;
    const a = avail || {}; let kind = null;
    for (const k of ORDER) if (a[k]) { kind = k; break; }
    s.deskQ = { day: s.day, kind, done: false };
    return kind;
  }
  // May this source ask unprompted today? True only for today's pick, and only until it has been asked.
  function allowed(s, kind) { const d = s.deskQ; return !!d && d.day === s.day && d.kind === kind && !d.done; }
  // The source asked (or the player waved it away): no second unprompted question today.
  function done(s, kind) { if (allowed(s, kind)) { s.deskQ.done = true; return true; } return false; }
  const skippable = kind => !!SKIPPABLE[kind];
  root.DeskQuestion = { ORDER, pick, allowed, done, skippable };
  if (typeof module !== "undefined") module.exports = root.DeskQuestion;
})(typeof window !== "undefined" ? window : globalThis);
