// Saves (platform P4b): v3 migration, closed seasons, export/import, seeds, carry record vs its schema. Run: node tests/test-save.js
const fs = require("fs"), path = require("path");
const S = require("../core/engine.js"), Bot = require("../core/bot.js"); require("../core/books.js");
const Save = require("../core/save.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "docs", "design", "carry-record.schema.json"), "utf8"));

// A small JSON-Schema checker: only the keywords carry-record.schema.json uses. Returns a list of problems.
function check(v, sc, at) {
  const bad = [], t = x => x === null ? "null" : Array.isArray(x) ? "array" : Number.isInteger(x) ? "integer" : typeof x;
  const types = sc.type ? [].concat(sc.type) : null, ty = t(v);
  if (types && !types.some(k => k === ty || (k === "number" && ty === "integer"))) return [`${at}: ${ty} is not ${types}`];
  if ("const" in sc && v !== sc.const) bad.push(`${at}: not ${sc.const}`);
  if (sc.enum && !sc.enum.includes(v)) bad.push(`${at}: ${v} not in enum`);
  if (sc.pattern && !new RegExp(sc.pattern).test(v)) bad.push(`${at}: pattern`);
  if (sc.minimum != null && v < sc.minimum) bad.push(`${at}: below ${sc.minimum}`);
  if (sc.maximum != null && v > sc.maximum) bad.push(`${at}: above ${sc.maximum}`);
  if (ty === "object") {
    for (const r of sc.required || []) if (!(r in v)) bad.push(`${at}: missing ${r}`);
    for (const k in v) { const p = (sc.properties || {})[k];
      if (p) bad.push(...check(v[k], p, at + "." + k));
      else if (sc.additionalProperties === false) bad.push(`${at}: extra ${k}`);
      else if (typeof sc.additionalProperties === "object") bad.push(...check(v[k], sc.additionalProperties, at + "." + k)); }
  }
  if (ty === "array" && sc.items) v.forEach((x, i) => bad.push(...check(x, sc.items, at + "[" + i + "]")));
  return bad;
}
const valid = r => check(r, schema, "carry");

function fakeStore(init) { const m = Object.assign({}, init); return { m, getItem: k => k in m ? m[k] : null, setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; }
const T0 = "2026-10-05T10:00:00.000Z";
function fresh(init) { const st = fakeStore(init); Save._use({ store: st, clock: () => T0 }); return st; }

// the v3 fixture: a real season played by the careful bot
function season(over) { const g = S.newGame({ story: true, seed: 3 }); let n = 0; while (!g.over && n++ < 40) { if (over === false && g.day >= 10) break; Bot.careful.day(g); S.sleep(g); } return g; }
const done = season(true), open = season(false);
ok(done.over && !open.over, `fixtures: a finished season (${done.outcome}) and an open one (day ${open.day})`);
const legacy = { lc_transcript_v2: JSON.stringify({ margin: { ev: [{ day: 3, kind: "answer", real: "2026-10-01" }] } }), lc_codex_v1: JSON.stringify({ margin: { state: "named", at: 5, hits: 2, due: 9 } }),
  lc_unlocks_v1: JSON.stringify({ u1: { kind: "term", term: "Cash", text: "t", ending: "sold" } }), lc_level_v1: "scholar", lc_prestige_v1: "3", lc_sfx: "0", lc_music: "1", lc_intro_seen: "1" };
const v3 = (g, extra) => JSON.stringify({ s: g, story: { ch: 4, stage: "x" }, calm: 2, usePtr: 7, fairSeen: { a: 1 } , ...extra });

// 1. open v3 save -> slot set, closed empty, stores copied by value
let st = fresh(Object.assign({ lc_spring_save_v3: v3(open) }, legacy)); let b = Save.load();
ok(b.v === 4 && b.slot && b.slot.season === "ch1/spring" && b.slot.s.day === open.day && Object.keys(b.closed).length === 0, "open v3: slot holds day " + open.day + ", closed is empty");
ok(b.slot.story.ch === 4 && b.slot.calm === 2 && b.slot.usePtr === 7 && b.slot.fairSeen.a === 1, "open v3: story, calm, usePtr, fairSeen copied");
ok(b.profile.transcript.margin.ev[0].day === 3 && b.profile.codex.margin.hits === 2 && b.profile.unlocks.u1.term === "Cash", "open v3: transcript, codex, unlocks copied by value");
ok(b.profile.level === "scholar" && b.profile.prestige === 3 && b.profile.settings.sfx === false && b.profile.settings.music === true && b.profile.settings.introSeen === true, "open v3: level, prestige, switches copied");
ok(JSON.parse(st.m.lc_save_v4).v === 4 && st.m.lc_save_v3_migrated === "1", "open v3: v4 written and marked migrated");

// 10. rollback safety: every old key survives migration
ok(Object.keys(legacy).concat("lc_spring_save_v3").every(k => k in st.m), "every old v3-era key is still in storage");

// 2. finished v3 save -> slot null, closed record, carry validates
st = fresh({ lc_spring_save_v3: v3(done) }); b = Save.load(); const c = b.closed["ch1/spring"];
ok(b.slot === null && c && c.outcome === done.outcome && c.seed === 3, "finished v3: slot is null, closed record has outcome and seed");
ok(valid(c.next).length === 0, "finished v3: carry record passes the schema " + valid(c.next).join("; "));
ok(c.next.cash === Math.round(done.bal.cash) && c.next.ending === done.outcome, `finished v3: cash ${c.next.cash} and ending match the engine (hand check: Math.round of bal.cash)`);
ok(c.next.debts.every(d => d.amount === -done.bal[d.to === "ezra" ? "loan" : "crown"]), "finished v3: each debt equals the negative balance");

// 3. corrupt v3: no throw, old key untouched, empty v4 written
st = fresh({ lc_spring_save_v3: "{not json" }); b = Save.load();
ok(b.slot === null && Object.keys(b.closed).length === 0 && st.m.lc_spring_save_v3 === "{not json" && JSON.parse(st.m.lc_save_v4).v === 4, "corrupt v3: empty v4 written, old key untouched");

// a closed season is frozen and the profile survives clearing the slot
st = fresh({ lc_spring_save_v3: v3(open) }); Save.load(); const pid = Save.profile().id;
const rec = Save.closeSeason("ch1/spring", done, { examPassed: true, score: 3, attempts: 1 }); Save.clearSlot();
b = JSON.parse(st.m.lc_save_v4);
ok(b.slot === null && b.closed["ch1/spring"].exam.passed === true && b.profile.id === pid && b.profile.level === "apprentice" && valid(rec.next).length === 0 && rec.next.flags.examPassed === true,
  "closing a season freezes it, clearing the slot keeps the profile, examPassed carried");
ok(st.m.lc_save_v4_prev !== undefined, "the previous blob is kept for one-step rollback");

// 4. round trip export -> new empty store -> import
st = fresh(Object.assign({ lc_spring_save_v3: v3(open) }, legacy)); Save.load(); Save.saveSlot("ch1/spring", { s: open, story: { ch: 6, stage: "y" }, calm: 0, usePtr: 1, fairSeen: {} });
(async () => {
  const code = Save.export(), codeZ = await Save.exportCompressed(); const before = JSON.parse(st.m.lc_save_v4);
  ok(/^LC4U\./.test(code) && /^LC4/.test(codeZ), "export gives an LC4 code (plain and compressed)");
  for (const [name, cd] of [["plain", code], ["compressed", codeZ]]) {
    const st2 = fresh({}); const r = await Save.import(cd); const after = JSON.parse(st2.m.lc_save_v4);
    ok(r.ok && after.slot.s.day === open.day && after.slot.story.ch === 6 && after.profile.id === before.profile.id, `round trip (${name}): same day ${open.day}, story chapter 6, same profile id`);
    ok(st2.m.lc_level_v1 === "scholar" && st2.m.lc_prestige_v1 === "3" && JSON.parse(st2.m.lc_transcript_v2).margin.ev[0].day === 3, `round trip (${name}): small stores restored for the modules`);
    ok(JSON.stringify(after.slot.s) === JSON.stringify(before.slot.s), `round trip (${name}): the engine state is byte-equal`);
  }
  // 5. refusals
  fresh({});
  const bad = async (cd, re, m) => { const r = await Save.parseCode(cd); ok(!r.ok && re.test(r.why), m + ": " + r.why); };
  await bad("XX9." + code.slice(5), /not a Ledger/, "wrong prefix");
  await bad("LC4U." + "A".repeat(1048577), /too big/, "over 1 MB");
  const enc = o => "LC4U." + Buffer.from(JSON.stringify(o)).toString("base64url");
  await bad(enc({ v: 5, profile: {} }), /different version/, "v 5");
  await bad(enc({ v: 4 }), /no profile/, "missing profile");
  await bad("LC4U.!!!", /could not be read/, "garbage body");
  // v3-shaped import goes through migration
  const st3 = fresh({}); const r3 = await Save.import(v3(done)); ok(r3.ok && JSON.parse(st3.m.lc_save_v4).closed["ch1/spring"].outcome === done.outcome, "a v3-shaped import is migrated");
  // import keeps the old blob
  const st4 = fresh({ lc_save_v4: JSON.stringify({ v: 4, profile: { id: "OLDPROFILE" }, slot: null, closed: {} }) }); await Save.import(code);
  ok(JSON.parse(st4.m.lc_save_v4_prev).profile.id === "OLDPROFILE", "import keeps the replaced blob as lc_save_v4_prev");

  // 6. seeds
  const pf = { rngSeed: 12345, games: 0 };
  ok(Save.seedFrom(12345, 0) === Save.seedFrom(12345, 0) && Save.seedFrom(12345, 0) !== Save.seedFrom(12345, 1), "seedFrom is stable and differs by game count");
  // hand calculation of mulberry32(12345): a = 12345 + 0x6D2B79F5 | 0 ... checked once by hand, frozen here
  const hand = (() => { let a = (12345 + 0x6D2B79F5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return 1 + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * 2147483646); })();
  ok(Save.seedFrom(12345, 0) === hand && hand >= 1 && hand <= 2147483646, `seed for rngSeed 12345, game 0 is ${hand}`);
  fresh({}); const p = Save.profile(), s1 = Save.newSeed(), s2 = Save.newSeed();
  ok(s1 !== s2 && Save.profile().games === 2 && s1 === Save.seedFrom(p.rngSeed, 0) && s2 === Save.seedFrom(p.rngSeed, 1), "two new games on one profile get different seeds, drawn from rngSeed + games");
  ok(Save.newSeed(7) === 7 && Save.profile().games === 2, "?seed=N wins and does not use up a game");

  // 7. review order
  const opts = ["a", "b", "c", "d"], o1 = Save.shuffleSeeded(opts, 3, 2), o2 = Save.shuffleSeeded(opts, 3, 2);
  ok(JSON.stringify(o1) === JSON.stringify(o2) && o1.slice().sort().join() === "a,b,c,d" && opts.join() === "a,b,c,d", "same seed and question give the same order; the input is untouched");
  const orders = new Set(); for (let i = 0; i < 12; i++) orders.add(Save.shuffleSeeded(opts, 3, i).join()); ok(orders.size > 1, "the order varies by question index");

  // 9. heir
  const h = Save.heir();
  ok(h && valid(h).length === 0 && h.ending === "heir" && h.season === "ch1/spring", "the heir validates against the schema " + (h ? valid(h).join("; ") : "missing"));
  const g0 = S.newGame({ story: true, seed: 0 }); let n = 0; while (!g0.over && n++ < 40) { Bot.careful.day(g0); S.sleep(g0); }
  ok(h.cash === Math.round(g0.bal.cash) && h.seed === 0, `the heir is the careful bot at seed 0 (cash ${h.cash}; hand check against a fresh run)`);
  const rel = Save.carryFrom({ ...g0, bal: { ...g0.bal, loan: 0, crown: -50 }, outcome: "closed" }, "ch1/spring", { closedAt: T0 });
  ok(valid(rel).length === 0 && rel.debts.length === 1 && rel.debts[0].to === "crown", "carryFrom drops a paid-off debt and keeps the open one");
  ok(valid(Object.assign({}, rel, { ending: "bogus" })).length > 0 && valid(Object.assign({}, rel, { cash: 1.5 })).length > 0, "the schema check can fail (bad ending, non-integer cash)");

  // storage blocked: no throw
  Save._use({ store: { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } } });
  let threw = false; try { Save.load(); Save.saveSlot("ch1/spring", { s: open }); Save.newSeed(); } catch (e) { threw = true; }
  ok(!threw, "a blocked store never throws");
  console.log(fail ? `${fail} FAILED` : "ALL SAVE TESTS PASS"); process.exitCode = fail ? 1 : 0;
})();
