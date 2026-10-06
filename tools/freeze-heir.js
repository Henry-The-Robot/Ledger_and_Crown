// Freezes the canonical heir (docs/design/save-and-carry.md, Lead review 2): the careful bot's Spring at seed 0, ending "heir".
// Run: node tools/freeze-heir.js   Re-run when a later Chapter 1 season ships. closedAt is fixed so the file is stable.
const fs = require("fs"), path = require("path");
const S = require("../core/engine.js"), Bot = require("../core/bot.js"); require("../core/books.js");
const Save = require("../core/save.js");
const g = S.newGame({ story: true, seed: 0 }); let n = 0;
while (!g.over && n++ < 40) { Bot.careful.day(g); S.sleep(g); }
const rec = Save.carryFrom(g, "ch1/spring", { ending: "heir", examPassed: false, transcript: {}, closedAt: "2026-01-01T00:00:00.000Z" });
const file = path.join(__dirname, "..", "tests", "golden", "heir-ch1-spring.json");
fs.writeFileSync(file, JSON.stringify(rec, null, 1) + "\n");
console.log(`froze heir: ${g.outcome}, cash ${rec.cash}, ${rec.debts.length} debts -> ${path.relative(process.cwd(), file)}`);
