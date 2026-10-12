// SM4: the season loader picks the season (pure part), and the stamp tool covers a season's own data-src script tags.
// By hand: no slot and nothing closed -> spring; spring closed -> summer; an open summer slot -> summer; ?season=ch1/spring forces spring even with a summer slot; an unknown ?season= is ignored.
// Run: node tests/test-season-loader.js
const L = require("../core/season-loader.js"), { stamp } = require("../tools/stamp.js"); let fail = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const P = o => L.pick(Object.assign({ search: "", slot: null, closed: {} }, o));
ok(P({}) === "ch1/spring", "a new player plays spring");
ok(P({ closed: { "ch1/spring": {} } }) === "ch1/summer", "spring closed: the next unplayed season is summer");
ok(P({ closed: { "ch1/spring": {}, "ch1/summer": {} } }) === "ch1/summer", "every season closed: the last one");
ok(P({ slot: { season: "ch1/summer" } }) === "ch1/summer", "an open summer slot wins over nothing closed");
ok(P({ slot: { season: "ch1/spring" }, closed: { "ch1/spring": {} } }) === "ch1/spring", "an open spring slot wins over the next unplayed season");
ok(P({ search: "?season=ch1/spring", slot: { season: "ch1/summer" } }) === "ch1/spring", "?season= forces spring over a summer slot");
ok(P({ search: "?season=ch1/summer" }) === "ch1/summer", "?season=ch1/summer forces summer for a new player");
ok(P({ search: "?season=nope" }) === "ch1/spring", "an unknown ?season= is ignored");
ok(P({ search: "?season=ch1/summer", known: ["ch1/spring"] }) === "ch1/spring", "a season that is not registered cannot be forced");
ok(L.prev("ch1/summer") === "ch1/spring" && L.prev("ch1/spring") === null, "summer starts from spring; spring has no earlier season");
const tag = '<script data-season="ch1/summer" data-src="chapters/ch1/summer/x.js"></script>';
const r = stamp(tag, "1.2.3"); ok(r.out.includes('data-src="chapters/ch1/summer/x.js?v=1.2.3"') && r.diffs.length === 1, "stamp.js stamps a season's data-src tag");
process.exit(fail ? 1 : 0);
