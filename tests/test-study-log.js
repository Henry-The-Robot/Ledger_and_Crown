// Study kit event log + result code (MBA-ST1). Run: node tests/test-study-log.js
// Decoding uses the shared Python decoder (projects/studio/tools/decode_result.py), so the code format is checked
// against the independent reference, not against this module's own encoder.
const path = require("path"), cp = require("child_process"), fs = require("fs");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const Study = require("../core/study/log.js");

const DECODER = [path.join(__dirname, "..", "..", "..", "studio", "tools", "decode_result.py"), path.join(__dirname, "..", "..", "studio", "tools", "decode_result.py")].find(p => fs.existsSync(p));
const decode = code => { const r = cp.spawnSync("python", ["-I", DECODER, code], { encoding: "utf8" }); return { status: r.status, rows: r.status === 0 ? JSON.parse(r.stdout) : null, err: r.stderr }; };
const clock = () => { let t = 1000; return () => (t += 250); };

ok(!!DECODER, "shared decoder found");

// 1. Study mode on: 3 scripted decisions -> 3 decoded decision rows with the shared fields
const s = Study.create({ search: "?study=1", pc: "ab12", seed: 7, now: clock() });
ok(s.enabled === true, "?study=1 turns the log on");
s.start();
s.sceneStart("farm-day1", "margin");
s.decision({ scene: "farm-day1", concept: "margin", choice: "price-12", ok: true, rt: 4100 });
s.decision({ scene: "farm-day1", concept: "tvm", choice: "take-loan", ok: false, rt: 9300 });
s.decision({ scene: "farm-day2", concept: "breakeven", choice: "sell-40", ok: true, rt: 2800 });
s.end();
const code = s.resultCode();
ok(typeof code === "string" && /^[A-Za-z0-9_-]+\.[0-9a-f]{4}$/.test(code), "result code is body.checksum");
ok(code.length < 4000, "result code under 4,000 characters (" + code.length + ")");
const d = decode(code);
ok(d.status === 0, "shared decoder accepts the code");
const rows = d.rows || [];
const dec = rows.filter(r => r.ev === "outcome");
ok(dec.length === 3, "3 scripted decisions -> 3 decoded decision rows (got " + dec.length + ")");
const FIELDS = ["t", "pc", "game", "build", "seed", "ev"];
ok(rows.length > 0 && rows.every(r => FIELDS.every(f => f in r)), "every row has the shared base fields t, pc, game, build, seed, ev");
ok(rows.every(r => r.game === "ledger-crown" && r.pc === "ab12" && r.seed === 7), "game, participant code and seed are carried on every row");
ok(dec.map(r => r.choice).join() === "price-12,take-loan,sell-40" && dec.map(r => r.ok).join() === "true,false,true", "decision choice and ok match what was played, in order");
ok(dec.map(r => r.concept).join() === "margin,tvm,breakeven" && dec.map(r => r.rt).join() === "4100,9300,2800", "decision concept and rt match");
ok(rows.every((r, i) => i === 0 || r.t >= rows[i - 1].t), "t never goes backwards");
ok(rows[0].ev === "start" && rows[rows.length - 1].ev === "end", "log starts with start and ends with end");
ok(rows.some(r => r.ev === "scene_start" && r.scene === "farm-day1" && r.concept === "margin"), "scene_start row logged");

// 2. Failure case: without ?study=1 nothing is logged
for (const search of ["", "?study=0", "?other=1", "?mystudy=1"]) {
  const off = Study.create({ search, pc: "ab12", seed: 7, now: clock() });
  off.start(); off.decision({ scene: "x", concept: "margin", choice: "a", ok: true, rt: 1 }); off.end();
  ok(off.enabled === false && off.rows().length === 0 && off.resultCode() === "", "no ?study=1 (" + JSON.stringify(search) + "): nothing logged, empty code");
}

// 3. A bad checksum is rejected by the shared decoder
const bad = code.slice(0, -4) + (code.slice(-4) === "0000" ? "0001" : "0000");
ok(decode(bad).status === 1, "tampered checksum rejected");

// 4. No personal data: only the fixed field names appear
const ALLOWED = ["t", "pc", "game", "build", "seed", "ev", "scene", "concept", "item", "form", "choice", "ok", "rt"];
ok(rows.every(r => Object.keys(r).every(k => ALLOWED.includes(k))), "rows carry only schema fields");
const x = Study.create({ search: "?study=1", pc: "ab12", seed: 1, now: clock() });
x.decision({ scene: "s", concept: "margin", choice: "a", ok: true, rt: 5, name: "Kyle", email: "k@x.com" });
ok(x.rows().every(r => Object.keys(r).every(k => ALLOWED.includes(k))), "unknown fields (name, email) are dropped");

// 5. Pauses over 60 s are logged as pause rows
let t = 0; const p = Study.create({ search: "?study=1", pc: "zz99", seed: 2, now: () => t });
p.start(); t = 5000; p.input("click"); t = 5000 + 61000; p.input("click"); t = 80000; p.end();
ok(p.rows().filter(r => r.ev === "pause").length === 1, "a gap over 60 seconds logs one pause row");
ok(p.rows().filter(r => r.ev === "pause")[0].rt === 61000, "pause row carries the gap length in rt");

// 6. Participant code must be a random code, not a name or email; a late code reaches every row
const q = Study.create({ search: "?study=1", pc: "kyle@x.com", seed: 3, now: clock() });
q.start();
ok(q.rows()[0].pc === "", "an email-shaped code is rejected (row pc is empty)");
ok(q.setCode("Kyle Skinner") === false && q.setCode("k7m2p9") === true, "setCode rejects a name with a space and accepts a random code");
ok(q.rows().every(r => r.pc === "k7m2p9"), "a code typed after start() is on every row");
q.decision({ scene: "s", concept: "margin", choice: "x".repeat(200), ok: true, rt: 1 });
ok(q.rows().pop().choice.length === 40, "free text values are capped at 40 characters");

// 7. A long pause before end() is logged
let t2 = 0; const e = Study.create({ search: "?study=1", pc: "pp77", seed: 4, now: () => t2 });
e.start(); t2 = 1000; e.input("go"); t2 = 90000; e.end();
ok(e.rows().some(r => r.ev === "pause" && r.rt === 89000), "a pause just before end is logged");

// 8. Size: about 300 rows stay under 4,000 characters
let t3 = 0; const big = Study.create({ search: "?study=1", pc: "big01", seed: 5, now: () => (t3 += 5000) });
big.start();
for (let i = 0; i < 100; i++) { big.sceneStart("farm-day" + (i % 10), "margin"); big.decision({ scene: "farm-day" + (i % 10), concept: ["margin", "tvm", "breakeven", "ev"][i % 4], choice: "opt-" + ((i * 7) % 5), ok: i % 3 !== 0, rt: 2000 + ((i * 937) % 9000) }); big.sceneEnd("farm-day" + (i % 10), "margin"); }
big.end();
const bc = big.resultCode();
ok(big.rows().length >= 300 && bc.length < 4000, "302 rows give a code under 4,000 characters (" + bc.length + ")");
ok(decode(bc).rows.length === big.rows().length, "the large code decodes to the same row count");

// 9. Disabled build: input, items and end are also silent
const off2 = Study.create({ search: "", pc: "ab12", seed: 1, now: clock() });
off2.input("a"); off2.itemShown({ item: "i1", form: "A" }); off2.itemAnswer({ item: "i1", form: "A", choice: "b", ok: true, rt: 5 }); off2.sceneStart("s", "c"); off2.sceneEnd("s", "c"); off2.end();
ok(off2.rows().length === 0, "disabled: input, item and scene calls log nothing");

// 10. The browser path (CompressionStream) gives a code the shared decoder accepts; a tampered body is rejected
(async () => {
  if (typeof CompressionStream !== "undefined") {
    const a = await s.resultCodeAsync();
    const da = decode(a);
    ok(da.status === 0 && da.rows.filter(r => r.ev === "outcome").length === 3, "resultCodeAsync decodes to the same 3 decisions");
    const body = code.split(".")[0], flipped = (body[5] === "A" ? "B" : "A");
    ok(decode(body.slice(0, 5) + flipped + body.slice(6) + "." + code.split(".")[1]).status === 1, "tampered body rejected by the checksum");
  } else console.log("skip CompressionStream not in this node");
  console.log(fail ? fail + " FAILED" : "ALL STUDY LOG TESTS PASS"); process.exitCode = fail ? 1 : 0;
})();
if (false) console.log(fail ? fail + " FAILED" : "ALL STUDY LOG TESTS PASS"); process.exitCode = fail ? 1 : 0;
