// Study content converter (MBA-ST12): the generated items-clep.js and reading-clep.js match a fresh conversion of the curriculum sources.
// Run: node tests/test-study-content.js
const fs = require("fs"), path = require("path");
let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const Conv = require("../tools/study-content.js");
const Forms = require("../core/study/forms.js");
const Items = require("../core/study/items-clep.js"), Reading = require("../core/study/reading-clep.js");

// 1. The shipped files are the real bank, by hand-checked facts (these run in CI, where the sources are absent)
ok(!Forms.loadBank(Items).error, "the CLEP bank loads in forms.js");
ok(Items.items.map(i => i.concept).join() === "S1,S2,S3,S4,S5,S6,S7,S8,S9,S10", "one item per concept S1-S10");
ok(!Items.items.some(i => i.fixture || /^fx-/.test(i.id)), "no fixture item in the bank");
const a1 = Items.items[0].forms.A;
ok(/bike shop/.test(a1.stem) && a1.source === "A-01", "the first item is A-01, the bike shop");
ok(a1.options.length === 5 && a1.options[a1.answer] === "−1,200", "A-01 key is -1,200 by hand (9,200 - 10,400)");
ok(Items.items.every(i => ["A", "B", "C"].every(f => i.forms[f].options.length === 5 && i.forms[f].answer >= 0 && i.forms[f].answer < 5)), "every form of every item has 5 options and a key in range");
ok(Reading.SECTIONS.map(s => s.id).join() === "S1,S2,S3,S4,S5,S6,S7,S8,S9,S10", "the reading has sections S1-S10");
ok(Reading.SECTIONS.every(s => s.title && s.text.length > 1500 && !/\*\*|`|knowledge\/mba/.test(s.text)), "each section has a title and body text, with no markdown marks or internal paths");

// 2. The converter on a tiny source: keys, option order, second items dropped, bad key refused (a failure case)
const item = (id, form, concept, key) => ({ id, form, concept, stem: id + "?", options: { A: "a", B: "b", C: "c", D: "d", E: "e" }, key });
const mini = { items: [item("A-01", "A", "S1", "C"), item("B-01", "B", "S1", "A"), item("B-02", "B", "S1", "E"), item("C-01", "C", "S1", "D")] };
const conv = Conv.convertItems(mini);
ok(conv.items.length === 1 && conv.items[0].forms.A.answer === 2 && conv.items[0].forms.B.answer === 0 && conv.items[0].forms.C.answer === 3, "keys become option indexes on each form");
ok(conv.items[0].forms.B.source === "B-01", "the first item of a concept is the one kept");
let threw = false; try { Conv.convertItems({ items: [item("A-01", "A", "S1", "Z"), item("B-01", "B", "S1", "A"), item("C-01", "C", "S1", "A")] }); } catch (e) { threw = /key Z/.test(e.message); }
ok(threw, "a key that is not an option fails the conversion");
threw = false; try { Conv.convertItems({ items: [item("A-01", "A", "S1", "A"), item("B-01", "B", "S1", "A")] }); } catch (e) { threw = /no item on form C/.test(e.message); }
ok(threw, "a concept missing from a form fails the conversion");
const rd = Conv.convertReading("---\ntitle: x\n---\n# T\n\n## S1 First\n\nOne **bold** `code`.\n\n**Source.** `knowledge/x.md`\n\n## S2 Second\n\nTwo.\n\nLine one.\n1. step\n");
ok(rd.SECTIONS.length === 2 && rd.SECTIONS[0].text === "One bold code." && rd.SECTIONS[1].text === "Two.\n\nLine one.\n1. step", "reading sections drop the Source line and the marks, and keep paragraphs");

// 3. No drift: the written files equal a fresh conversion of the sources (the sources sit outside the repo, so CI skips this)
if (!fs.existsSync(path.join(Conv.SRC, "items.json"))) console.log("SKIP drift check: the curriculum sources are not beside the repo (CI has the repo only; the checks above still ran)");
else {
  const fresh = Conv.build();
  for (const name of Object.keys(fresh)) {
    const have = fs.readFileSync(path.join(Conv.OUT, name), "utf8");
    ok(have === fresh[name], name + " equals a fresh conversion of the source");
    ok(have !== fresh[name].replace(/[0-9]/, d => String((Number(d) + 1) % 10)), name + " a one-digit change to the source output would be caught");
  }
}
console.log(fail ? fail + " FAILED" : "all passed");
process.exit(fail ? 1 : 0);
