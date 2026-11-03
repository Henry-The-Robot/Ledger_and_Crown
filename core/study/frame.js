// Study kit — the game side of the study page (card MBA-ST11). Loaded by game.html, and inert unless the URL has ?study=1&frame=1.
// study.html opens game.html in a frame with that URL; game.js then skips the story, the saves and the opening, and calls StudyFrame.ready(G).
// The page calls StudyFrame.playStep(step) for each step the route runner (core/study/route.js) opens; this file plays that step with the real
// scene player (core/scene.js through Story.playRec), the real dialog (G.say, G.ask) and the real engine. Route file: projects/mba-game/study-route.json.
(function (root) {
  const q = new URLSearchParams(root.location ? root.location.search : "");
  const on = q.get("study") === "1" && q.get("frame") === "1";
  if (!on) { root.StudyFrame = { wanted: () => false }; return; }
  root.__studyFrame = true; // game.js reads this: no saves, no opening, no Court inside closeBooks

  let G = null, readyRes;
  const readyP = new Promise(r => { readyRes = r; });
  const S = () => root.Spring, Sel = () => root.StudySelect, Mode = () => root.StudyMode;
  const modeFor = route => Mode().mode("?study=1", route);

  // ---- ops (study-route.json "ops") ----
  const OPS = {
    harvest: () => { const s = G.s; s.plots.forEach(p => { if (p.crop && S().stage(s, p) === 4) S().act(s, p.i); }); },
    ship: (op, ctx) => { const s = G.s, o = Mode().openOrderFor(s, op.who); if (o) Mode().autoShip(S(), s, o.id, ctx.mode); },
    placeOffer: op => {
      const s = G.s, m = /^R\.deposits\[(\d+)\]$/.exec(op.from || ""), row = m && S().R.deposits[+m[1]];
      if (!row) throw new Error("study placeOffer: no deposit row " + op.from);
      const [, who, sacks, price, dueIn, share, say] = row;
      s.offers.push({ id: s.nextId++, who, sacks, price, terms: 0, due: Math.min(S().R.days, s.day + dueIn), expires: s.day + 3, value: sacks * price, deposit: share, say, reserve: price + 1 });
    },
  };
  const runOps = (list, ctx) => (list || []).forEach(op => { if (!OPS[op.op]) throw new Error("study: unknown op '" + op.op + "'"); OPS[op.op](op, ctx); });

  // The engine runs the days between steps: field work every morning, notices declined, nothing else.
  function toDay(day, ctx) {
    const s = G.s;
    while (s.day < day && !s.over) {
      root.Bot.farm(s);
      S().sleep(s);
      Mode().declineNotices(s, ctx.mode, st => { if (S().notice(st)) S().answerNotice(st, 2); });
      Mode().holdQuiet(s, ctx.mode);
    }
    G.hud();
  }

  // A three-option check as a dialog: the pick is logged as an outcome with ok and rt.
  const vm = (scene, id) => { try { if (root.Voice) root.Voice.mark(scene, id); } catch (e) { /* voice is optional */ } }; // the box ids come from StudySelect.extraBoxes (MBA-VO2)
  async function check(c, ctx, i) {
    const t0 = Date.now();
    vm(ctx.step.id, "check" + i);
    const pick = await G.say("maud", c.text, c.options);
    ctx.outcome({ scene: ctx.step.id, concept: c.concept || ctx.step.concept, choice: String(pick), ok: pick === c.right, rt: Date.now() - t0 });
    vm(ctx.step.id, "check" + i + (pick === c.right ? "-yes" : "-no"));
    await G.say("maud", pick === c.right ? Sel().CHECK_YES : Sel().CHECK_NO, ["Next"]);
  }
  // A typed problem on the player's own books (Practice.BANK).
  async function practice(x, ctx) {
    const b = root.Practice.BANK.find(p => p.id === x.practice);
    if (!b) throw new Error("study practice: no problem '" + x.practice + "'");
    const q = b.make(G.s, 1);
    if (!q) return;
    const t0 = Date.now();
    const r = await G.ask("maud", q.text, q.answer, q.hints, undefined, q.tol, undefined, q.work, q.how);
    ctx.outcome({ scene: ctx.step.id, concept: x.concept || ctx.step.concept, choice: "typed", ok: !!r, rt: Date.now() - t0 });
  }

  async function playRecord(id, steps, init) { await root.Story.playRec({ id, steps }, init); }

  const KINDS = {
    async frame(step) {
      const f = Sel().frameSteps(step, "Thornfield");
      await playRecord("study-frame", f.steps);
    },
    async lesson(step, ctx) {
      const rec = root.Lessons.BY[step.record];
      if (!rec) throw new Error("study: no record '" + step.record + "'");
      if (step.record === "close") await G.closeBooks(); // the close record needs the books panel (veiled statements): closeBooks builds it and plays the record; Court waits for its own step
      else {
        const init = Object.assign({}, step.init);
        if (step.record === "ch4b") init.order = G.s.orders.filter(o => o.who === "hobb").pop(); // the game calls ch4b(order) when Hobb's sale ships: the route's ship op has just done that
        if (step.record === "ch5" && step.select && step.select.skipWindow) init.m = Math.round(50 / 150 * 100); // skipWindow drops { calc: "markupMargin" } (story.js CALC), but the Cash-forecast card still prints {m}
        if (step.record === "ch7" && (step.select || {}).skipVerbs && step.select.skipVerbs.includes("timeline")) { // the route drops Ezra's forecast exercise; the route's check (2.5% a week) assumes the cut he gives for a right forecast
          const al = S().forecast(G.s, 14), lw = al.reduce((a, r) => r.close < a.close ? r : a, al[0]);
          init.r = { okLow: true, okDay: true, low: lw.close, lowDay: lw.day };
        }
        await playRecord(step.id, Sel().overrideVerbs(Sel().select(rec.steps, step.select, root.Lessons.BY), step.verbs), init);
      }
      for (const [i, x] of (step.after || []).entries()) { if (x.check) await check(x.check, ctx, i); else if (x.practice) await practice(x, ctx); }
    },
    async scene(step) {
      const sc = root.Scenes.BY[step.scene];
      if (!sc) throw new Error("study: no scene '" + step.scene + "'");
      await G.runScene(sc);
    },
    async deposit(step, ctx) {
      const s = G.s, o = s.offers.find(x => x.who === (step.steps.find(y => y.accept) || {}).accept && x.deposit);
      if (!o) throw new Error("study deposit: no deposit offer on the table");
      vm(step.id, "deposit");
      const k = await G.say(o.who, o.say || "I can pay part now, the rest when you deliver.", ["Accept", "No thanks"]);
      if (k === 0) S().accept(s, o.id);
      G.hud();
      for (const [i, x] of step.steps.entries()) if (x.check) await check(x.check, ctx, i);
    },
    async advance(step, ctx) { toDay(step.toDay, ctx); },
    async court(step, ctx) {
      const s = G.s, st = root.Books.close(s);
      await root.Court.run({ G, s, Story: root.Story, Endings: root.Endings, st, verdict: S().crownFund(s).verdict, ending: root.Endings.ending(s), study: ctx.route.court });
      G.hidePanel();
    },
  };

  // ctx: { route, step, mode, outcome(f) }. A step may name a day: the engine runs forward to it first (the route lists days, not the sleeps between).
  async function playStep(step, ctx) {
    await readyP;
    ctx.mode = ctx.mode || modeFor(ctx.route); ctx.step = step;
    Mode().holdQuiet(G.s, ctx.mode);
    if (step.kind !== "advance" && step.kind !== "frame" && step.day && G.s.day < step.day) toDay(step.day, ctx);
    runOps(step.pre, ctx);
    const fn = KINDS[step.kind];
    if (!fn) throw new Error("study: unknown step kind '" + step.kind + "'");
    await fn(step, ctx);
    runOps(step.post, ctx);
    G.hud();
  }

  root.StudyFrame = {
    wanted: () => true,
    ready: g => { G = g; readyRes(g); },
    whenReady: () => readyP,
    playStep,
    stop: () => { try { G.closeDlg(); G.hidePanel(); } catch (e) { /* the frame may be mid-load */ } },
    get state() { return G && G.s; },
  };
})(typeof window !== "undefined" ? window : globalThis);
