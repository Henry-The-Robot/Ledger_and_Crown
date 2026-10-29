// Study kit — event log and result code (card MBA-ST1). Format: projects/studio/STUDY-LOG-SCHEMA.md (shared by both games).
// Off unless the URL has ?study=1: then every call is a no-op and the code is "". No personal data: the only id is the
// participant code the learner types. The log is in memory only (no saves, no server).
// Result code = base64url(deflate(JSON rows)) + "." + 4 hex of CRC32(body) & 0xFFFF; decoded by projects/studio/tools/decode_result.py.
(function (root) {
  const GAME = "ledger-crown", BUILD = "lc-study-0.1", PAUSE_MS = 60000;
  const FIELDS = ["t", "pc", "game", "build", "seed", "ev", "scene", "concept", "item", "form", "choice", "ok", "rt"];
  const EVENTS = ["start", "scene_start", "scene_end", "input", "outcome", "item_shown", "item_answer", "pause", "end"];

  // The one rule for a participant code is assign.js normalize (4 to 64 ASCII letters, digits, - and _; a Prolific id has 24): called, never copied.
  const cleanPc = c => { try { return assignMod().normalize(String(c || "")); } catch (e) { return ""; } }; // normalize also lowercases, as the entry page does
  const cleanVal = v => (typeof v === "string" ? v.slice(0, 40) : v);
  const flagOn = search => /(?:^|[?&])study=1(?:&|$|#)/.test(String(search || ""));
  const param = (search, k) => { const m = new RegExp("(?:^|[?&])" + k + "=([^&#]*)").exec(String(search || "")); try { return m ? decodeURIComponent(m[1]) : null; } catch (e) { return m ? m[1] : null; } };

  // Entry page contract (projects/studio/tools/entry/README.md): ?study=1&pc&arm&order&seed. Arm and order are logged as received
  // (only the allowed values); "edited" = they differ from what assign.js gives for this code and seed, or cannot be checked.
  const assignMod = () => (typeof module !== "undefined" && module.exports ? require("./assign.js") : root.StudyAssign);
  function readUrl(search) {
    const pc = param(search, "pc"), arm = param(search, "arm"), order = param(search, "order"), seedRaw = param(search, "seed");
    if (pc === null && arm === null && order === null && seedRaw === null) return null;
    const u = { pc: pc === null ? "" : cleanPc(pc.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, "")), edited: false };
    if (arm === "game" || arm === "reading") u.arm = arm;
    if (order === "BC" || order === "CB") u.order = order;
    if (seedRaw !== null && /^[0-9]{1,10}$/.test(seedRaw) && +seedRaw <= 2147483647) u.seed = +seedRaw;
    // The rule needs a code, a seed and both fields; anything missing or different is an edit. A code typed later is checked in setCode.
    u.check = c => {
      let a = null;
      try { if (c && u.seed !== undefined) a = assignMod().assign(c, u.seed); } catch (e) { a = null; }
      return !a || a.arm !== u.arm || a.order !== u.order;
    };
    if (pc !== null) u.edited = u.check(u.pc);
    return u;
  }

  let crcTable = null;
  const crc32 = bytes => {
    if (!crcTable) { crcTable = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; } }
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  };
  const checksum = body => { const h = (crc32(asciiBytes(body)) & 0xFFFF).toString(16); return "0000".slice(h.length) + h; };
  function asciiBytes(s) { const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 255; return a; }
  const b64url = bytes => {
    let b = "";
    if (typeof Buffer !== "undefined") b = Buffer.from(bytes).toString("base64");
    else { let s = ""; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); b = root.btoa(s); }
    return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const utf8 = s => (typeof TextEncoder !== "undefined" ? new TextEncoder().encode(s) : Uint8Array.from(Buffer.from(s, "utf8")));
  const finish = deflated => { const body = b64url(deflated); return body + "." + checksum(body); };

  // opts: { search, pc, seed, now, build }
  function create(opts) {
    opts = opts || {};
    const enabled = flagOn(opts.search !== undefined ? opts.search : (root.location && root.location.search));
    const now = opts.now || (() => Date.now());
    const t0 = now(), build = opts.build || BUILD;
    const url = enabled ? readUrl(opts.search !== undefined ? opts.search : (root.location && root.location.search)) : null;
    const seed = url && url.seed !== undefined ? url.seed : opts.seed | 0;
    let pc = cleanPc(opts.pc) || (url ? url.pc : ""), lastInput = null;
    const log = [];

    const add = (ev, f) => {
      if (!enabled) return;
      const row = { t: Math.max(0, now() - t0), pc, game: GAME, build, seed, ev };
      if (url) { if (url.arm) row.arm = url.arm; if (url.order) row.order = url.order; }
      f = f || {};
      for (const k of FIELDS) if (k in f && !(k in row) && f[k] !== undefined) row[k] = cleanVal(f[k]); // unknown fields (name, email...) are dropped
      log.push(row);
    };
    const touch = () => { // a gap over 60 s between inputs is a pause (time on task = first input to end, minus pauses)
      const n = now();
      if (lastInput !== null && n - lastInput > PAUSE_MS) add("pause", { rt: n - lastInput });
      lastInput = n;
    };

    const self = {
      enabled,
      urlCode: () => (url ? url.pc : ""), // a valid code that came in the URL: the page does not ask again
      urlSeed: () => (url && url.seed !== undefined ? url.seed : null),
      clock() { return now(); }, // the log's own clock, so item timers and log rows agree
      setCode(c) {
        if (url && url.pc) return false; // the entry page's code stands
        pc = cleanPc(c);
        if (url && pc) url.edited = url.check(pc);
        return pc !== "";
      }, // false = rejected; every row gets the final code
      start() { add("start"); },
      sceneStart(scene, concept) { add("scene_start", { scene, concept }); },
      sceneEnd(scene, concept) { add("scene_end", { scene, concept }); },
      input(choice, f) { if (!enabled) return; touch(); add("input", Object.assign({}, f, { choice })); },
      decision(f) { if (!enabled) return; lastInput = now(); add("outcome", f); }, // its rt already holds the thinking time: not a pause // one row per scored decision
      // Reading arm (card MBA-ST6): activity() marks the learner as present without a row; a gap over 60 s becomes one pause row.
      activity() { if (enabled) touch(); },
      readStart() { if (enabled) { lastInput = now(); add("read_start"); } },
      readSection(scene) { add("read_section", { scene }); },
      readEnd() { if (enabled) { const n = now(); if (lastInput !== null && n - lastInput > PAUSE_MS) add("pause", { rt: n - lastInput }); } lastInput = enabled ? now() : lastInput; add("read_end"); },
      itemShown(f) { add("item_shown", f); },
      itemAnswer(f) { if (!enabled) return; touch(); add("item_answer", f); },
      end() { if (enabled) { const n = now(); if (lastInput !== null && n - lastInput > PAUSE_MS) add("pause", { rt: n - lastInput }); } add("end"); },
      rows() { return log.map(r => Object.assign({}, r, { pc }, url && url.edited ? { edited: true } : {})); }, // a late code reaches every row, and so does the edited flag
      // Synchronous (node, tests) when a deflate function is injected or zlib is present; browsers use resultCodeAsync().
      resultCode(deflateSync) {
        if (!enabled || !log.length) return "";
        let z = deflateSync;
        if (!z && typeof require === "function") { try { const zl = require("zlib"); z = b => zl.deflateSync(Buffer.from(b), { level: 9 }); } catch (e) { z = null; } }
        if (!z) throw new Error("no sync deflate here; use resultCodeAsync()");
        return finish(z(utf8(JSON.stringify(self.rows()))));
      },
      async resultCodeAsync() {
        if (!enabled || !log.length) return "";
        if (typeof CompressionStream === "undefined") return self.resultCode();
        const cs = new CompressionStream("deflate"), w = cs.writable.getWriter();
        const done = Promise.all([w.write(utf8(JSON.stringify(self.rows()))), w.close()]);
        const out = new Response(cs.readable).arrayBuffer();
        await done;
        return finish(new Uint8Array(await out));
      },
    };
    return self;
  }

  const api = { create, flagOn, checksum, FIELDS, EVENTS, GAME, BUILD };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Study = api;
})(typeof window !== "undefined" ? window : globalThis);
