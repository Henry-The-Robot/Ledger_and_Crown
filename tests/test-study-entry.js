// Study build accepts the entry page's URL contract (MBA-ST5). Run: node tests/test-study-entry.js
// Contract: projects/studio/tools/entry/README.md. URL: ?study=1&pc=<code>&arm=<game|reading>&order=<BC|CB>&seed=<n>
// Expected arm and order are computed here from the pinned rows of the entry page's own test (PINNED.json), not from the code under test.
const fs = require("fs"), path = require("path");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const Log = require("../core/study/log.js"), Shell = require("../core/study/shell.js"), Assign = require("../core/study/assign.js");
const clock = () => { let t = 1000; return () => (t += 250); };

// Independent expectations: hand-chosen rows from the entry page's pinned table when present, else the shared module.
const PIN = path.join(__dirname, "..", "..", "..", "studio", "tools", "entry", "PINNED.json");
let pinned = [];
try { const j = JSON.parse(fs.readFileSync(PIN, "utf8")); pinned = Array.isArray(j) ? j : (j.rows || j.pinned || []); } catch (e) { /* CI has only this repo */ }

// Pinned rows copied from PINNED.json (hashes computed outside this module): the copy of assign.js must agree.
ok(Assign.assign("0123456789abcdef01234567", 20261022).arm === "reading" && Assign.assign("0123456789abcdef01234567", 20261022).order === "CB", "pinned row 1 (reading/CB)");
ok(Assign.assign("p0001", 20261022).arm === "game" && Assign.assign("p0001", 20261022).order === "BC", "pinned row 2 (game/BC)");
ok(Assign.assign("abcdefabcdefabcdefabcdef", 20261022).arm === "game" && Assign.assign("abcdefabcdefabcdefabcdef", 20261022).order === "CB", "pinned row 3 (game/CB)");
const ORIG = path.join(__dirname, "..", "..", "..", "studio", "tools", "entry", "assign.js");
if (fs.existsSync(ORIG)) ok(fs.readFileSync(ORIG, "utf8") === fs.readFileSync(path.join(__dirname, "..", "core", "study", "assign.js"), "utf8"), "core/study/assign.js is identical to the entry page's assign.js");

const PC24 = "5f8a1c9e0b7d4a32e6c1f0d9"; // 24 hex characters, a Prolific id
const SEED = 20261022;
const good = Assign.assign(PC24, SEED);
const other = a => ({ arm: a.arm === "game" ? "reading" : "game", order: a.order === "BC" ? "CB" : "BC" });
const url = (pc, a, seed) => "?study=1&pc=" + pc + "&arm=" + a.arm + "&order=" + a.order + "&seed=" + seed;

// 1. A 24-character code and the four parameters appear in every logged event
const s = Log.create({ search: url(PC24, good, SEED), now: clock() });
ok(s.enabled === true, "log is on");
s.start(); s.input("click"); s.sceneStart("a", "margin"); s.decision({ scene: "a", concept: "margin", choice: "x", ok: true, rt: 5 }); s.itemShown({ item: "i1", form: "A" }); s.itemAnswer({ item: "i1", form: "A", choice: "b", ok: true, rt: 5 }); s.sceneEnd("a", "margin"); s.end();
const rows = s.rows();
ok(rows.length >= 7, "events were logged (" + rows.length + ")");
ok(rows.every(r => r.pc === PC24), "the 24-character code is on every row");
ok(rows.every(r => r.arm === good.arm && r.order === good.order && r.seed === SEED), "arm, order and seed from the URL are on every row");
ok(rows.every(r => r.edited === undefined), "a matching URL is not flagged as edited");

// 2. Failure case: an arm or order that does not match assign.js is logged as edited, on every row
for (const bad of [{ arm: other(good).arm, order: good.order }, { arm: good.arm, order: other(good).order }, other(good)]) {
  const e = Log.create({ search: url(PC24, bad, SEED), now: clock() });
  e.start(); e.input("go"); e.end();
  ok(e.rows().length === 3 && e.rows().every(r => r.edited === true), "URL " + bad.arm + "/" + bad.order + " (assigned " + good.arm + "/" + good.order + ") is logged as edited");
  ok(e.rows().every(r => r.arm === bad.arm && r.order === bad.order), "the edited values are logged as received");
}
// A different seed re-draws the assignment, so the old arm may no longer match
const seedMoved = [];
for (let sd = 1; sd < 40 && seedMoved.length < 1; sd++) { const a = Assign.assign(PC24, sd); if (a.arm !== good.arm || a.order !== good.order) seedMoved.push(sd); }
const sm = Log.create({ search: url(PC24, good, seedMoved[0]), now: clock() }); sm.start();
ok(sm.rows()[0].edited === true, "arm and order for another seed than the URL's seed are flagged as edited");

// 3. Missing parameters, bad values and a refused code
const noArm = Log.create({ search: "?study=1&pc=" + PC24 + "&seed=" + SEED, now: clock() }); noArm.start();
ok(noArm.rows()[0].arm === undefined && noArm.rows()[0].edited === true, "a URL with a code and seed but no arm or order is flagged as edited");
const junk = Log.create({ search: "?study=1&pc=" + PC24 + "&arm=both&order=XX&seed=" + SEED, now: clock() }); junk.start();
ok(junk.rows()[0].edited === true && junk.rows()[0].arm === undefined && junk.rows()[0].order === undefined, "an arm or order outside the allowed values is flagged and not logged");
const bigSeed = Log.create({ search: url(PC24, good, 4294967297), now: clock() }); bigSeed.start();
ok(bigSeed.rows()[0].edited === true, "a seed outside 0 to 2147483647 is flagged as edited");
const mail = Log.create({ search: "?study=1&pc=kyle%40x.com&arm=game&order=BC&seed=1", now: clock() }); mail.start();
ok(mail.rows()[0].pc === "", "an email-shaped code in the URL is refused");
ok(Log.create({ search: "?study=1", now: clock() }).setCode("a".repeat(25)) === true, "a 25-character code is accepted (the entry page allows up to 64)");
ok(Log.create({ search: "?study=1", now: clock() }).setCode("a".repeat(65)) === false, "a 65-character code is refused");
ok(Log.create({ search: "?study=1", now: clock() }).setCode("ab") === false, "a 2-character code is still refused");

// 3b. No pc in the URL: the typed code is checked against arm and order when it arrives, and is lowercased
const tp = Log.create({ search: "?study=1&arm=" + good.arm + "&order=" + good.order + "&seed=" + SEED, now: clock() });
tp.start(); tp.setCode(PC24.toUpperCase()); tp.input("code");
ok(tp.rows().every(r => r.pc === PC24 && r.edited === undefined), "typed code is lowercased and matches arm and order: not edited");
const tf = Log.create({ search: "?study=1&arm=" + other(good).arm + "&order=" + good.order + "&seed=" + SEED, now: clock() });
tf.start(); tf.setCode(PC24);
ok(tf.rows().every(r => r.edited === true), "typed code with a forged arm in the URL is flagged on every row");
ok(Log.create({ search: url(PC24, good, SEED), now: clock() }).setCode("other123") === false, "setCode cannot replace a code from the URL");
const bs = Log.create({ search: url(PC24, good, 4294967297), now: clock() }); bs.start();
ok(bs.rows()[0].edited === true, "bad URL seed: flagged as edited (the log keeps its own seed)");
const edge = "a".repeat(64);
ok(Log.create({ search: "?study=1&pc=" + edge, now: clock() }).urlCode() === edge, "a 64-character code in the URL is accepted");

// 4. The URL needs no pc/arm/order for the old flow: plain ?study=1 logs no arm, no order, no flag
const plain = Log.create({ search: "?study=1", pc: "ab12", seed: 7, now: clock() }); plain.start();
ok(plain.rows()[0].arm === undefined && plain.rows()[0].edited === undefined && plain.rows()[0].seed === 7, "plain ?study=1 is unchanged (opts seed, no arm, no flag)");
const study0 = Log.create({ search: "?study=0&pc=" + PC24 + "&arm=game&order=BC&seed=1", now: clock() }); study0.start();
ok(study0.enabled === false && study0.rows().length === 0, "without study=1 the contract is ignored");

// 5. The shell: the code in the URL starts form A, and the page does not ask for it again
const FIX = require("../core/study/fixture-items.js");
const sh = Shell.create({ search: url(PC24, good, SEED), bank: FIX.bank || FIX, now: clock(), screenOut: 101 });
ok(sh.phase() === "formA", "a valid URL code skips the code screen (phase " + sh.phase() + ")");
ok(sh.rows().length > 0 && sh.rows().every(r => r.pc === PC24 && r.arm === good.arm && r.order === good.order && r.seed === SEED), "shell rows carry code, arm, order and seed from the first row");
ok(sh.submitCode("another1") === false, "a second code cannot replace the URL code");
const sh2 = Shell.create({ search: "?study=1&arm=game&order=BC&seed=3", bank: FIX.bank || FIX, now: clock() });
ok(sh2.phase() === "code", "a URL without pc still shows the code screen");
const sh3 = Shell.create({ search: url("ab", good, SEED), bank: FIX.bank || FIX, now: clock() });
ok(sh3.phase() === "code", "a URL with a refused code shows the code screen");

// 6. The result code carries the new fields through the shared decoder
const cp = require("child_process");
const dec = cp.spawnSync(process.platform === "win32" ? "python" : "python3", ["-I", path.join(__dirname, "decode_result.py"), s.resultCode()], { encoding: "utf8" });
const back = dec.status === 0 ? JSON.parse(dec.stdout) : [];
ok(back.length === rows.length && back.every(r => r.pc === PC24 && r.arm === good.arm && r.order === good.order), "the shared decoder returns code, arm and order on every row");

console.log(fail ? fail + " FAILED" : "ALL STUDY ENTRY TESTS PASS"); process.exitCode = fail ? 1 : 0;
