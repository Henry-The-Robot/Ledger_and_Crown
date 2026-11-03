// Study kit — the game arm's host (card MBA-ST11). study.html loads this file for the game arm only.
// It opens game.html in a frame (?study=1&frame=1: see core/study/frame.js), waits for the real game to be ready, then plays the route's steps
// one by one: the route runner (route.js) opens each step and writes the log row; the frame plays it with the real scene player and dialog.
(function (root) {
  const param = (search, k) => { const m = new RegExp("(?:^|[?&])" + k + "=([^&#]*)").exec(String(search || "")); return m ? m[1] : null; };

  // search: the study page's own query string. route: the parsed study-route.json (its engine seed makes the same numbers for everyone).
  function host(search, route) {
    const seed = route && route.engine && route.engine.newGame ? route.engine.newGame.seed : 11;
    const vo = param(search, "vo") === "0" ? "&vo=0" : "";
    let frame = null, fw = null;
    const open = () => {
      if (frame) return;
      frame = document.createElement("iframe");
      frame.title = "The game"; frame.id = "sp-frame";
      frame.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;background:#000;visibility:hidden";
      frame.src = "game.html?study=1&frame=1&new=1&intro=0&seed=" + seed + vo;
      document.body.appendChild(frame);
      fw = () => frame.contentWindow;
    };
    // The frame loads while the learner answers form A, so the game is ready when play starts.
    open();
    const names = () => { const w = fw && fw(); return { records: w && w.Lessons ? Object.keys(w.Lessons.BY) : [], scenes: w && w.Scenes ? Object.keys(w.Scenes.BY) : [] }; };
    return {
      get known() { return names(); },
      stop() { try { fw().StudyFrame.stop(); } catch (e) { /* frame gone */ } },
      async play({ shell, runner }) {
        open();
        frame.style.visibility = "visible";
        await new Promise((res, rej) => { const t0 = Date.now(), tick = () => { try { if (fw().StudyFrame && fw().StudyFrame.whenReady) return fw().StudyFrame.whenReady().then(res, rej); } catch (e) { /* not loaded yet */ } if (Date.now() - t0 > 30000) rej(new Error("The game did not load.")); else setTimeout(tick, 100); }; tick(); });
        const ctx = { route, outcome: f => shell.outcome(f) };
        while (runner.state() === "playing") {
          const cur = runner.current();
          await fw().StudyFrame.playStep(cur.step, ctx);
          if (runner.state() === "playing" && runner.current().id === cur.id) runner.next(); // the 90-second frame may already have moved the runner on
        }
        frame.style.visibility = "hidden";
      },
    };
  }

  const api = { host };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.StudyGame = api;
})(typeof window !== "undefined" ? window : globalThis);
