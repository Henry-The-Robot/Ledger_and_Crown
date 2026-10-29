// Ledger & Crown — voice for dialogue boxes (MBA-VO1). The scene player (core/scene.js) calls mark() before it shows boxes; the dialog (core/game.js dlg)
// calls start() when a box opens and stop() when the player taps past. A box with a voice file plays assets/voice/<scene id>/<box id>.mp3 through the shared
// WebAudio context (Cutscene.clip, as the opening does). A box with no file is silent: no error, nothing thrown.
// On only for the study build (?study=1) or ?vo=1. ?vo=0 turns it off and then no file is requested. Box ids: see core/scene.js (boxes()).
(function (root) {
  const BASE = "assets/voice";
  function create(deps) { // deps: { clip(src, vol, loop) -> { play, stop } }
    let on = false, queue = [], scene = "", cur = null;
    const stop = () => { const c = cur; cur = null; if (c) try { c.stop(); } catch (e) {} };
    return {
      // search: the page's query string. Returns whether voice is on.
      configure(search) { const q = new URLSearchParams(search || ""), vo = q.get("vo"); on = vo === "0" ? false : vo === "1" || q.get("study") === "1"; if (!on) { queue = []; stop(); } return on; },
      get on() { return on; },
      // The next boxes belong to this scene and have these ids, in order (an id or a list). null clears what is queued.
      mark(sceneId, ids) { scene = sceneId; queue = ids == null ? [] : [].concat(ids); },
      // A box opens: the voice of the previous box ends, and this box's file starts if it is a marked box.
      start() { stop(); if (!on || !queue.length) return null; const id = queue.shift(); try { cur = deps.clip(`${BASE}/${scene}/${id}.mp3`, 1, false); cur.play(); } catch (e) { cur = null; } return id; },
      stop,
    };
  }
  const api = { create, BASE };
  if (typeof window !== "undefined") { window.VoiceKit = api; window.Voice = create({ clip: (src, vol, loop) => window.Cutscene.clip(src, vol, loop) }); window.Voice.configure(window.location && window.location.search); }
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
