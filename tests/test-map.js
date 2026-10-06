// P8: the map prop layer (core/map.js) and Spring's props as data (chapters/ch1/spring/props.js). Run: node tests/test-map.js
global.window = global; const fs = require("fs"), M = require("../core/map.js"), PROPS = require("../chapters/ch1/spring/props.js");
let fail = 0; const ok = (c, m) => { console.log((c ? "ok   " : "FAIL ") + m); if (!c) fail++; };
const game = fs.readFileSync(__dirname + "/../core/game.js", "utf8");
// the places the props name are the ones game.js owns (a changed coordinate in game.js must change here too)
const PLACES = { CRATE: { x: 9, y: 7 }, WELL: { x: 34, y: 9 }, CHEST: { x: 5, y: 7 }, SACKS: { x: 10, y: 7 }, FWELL: { x: 13, y: 7 }, BOARD: { x: 18, y: 7 } };
ok(game.includes("const CRATE = { x: 9, y: 7 }, WELL = { x: 34, y: 9 }") && game.includes("const CHEST = { x: 5, y: 7 }, SACKS = { x: 10, y: 7 }, FWELL = { x: 13, y: 7 }") && game.includes("BOARD = { x: 18, y: 7 }"), "the test's places match the constants in core/game.js");
ok(game.includes("MapProps.build(SpringProps") && !game.includes("props.push({ y: CRATE.y + 1") && !game.includes("props.push({ y: SACKS.y + 1"), "game.js builds its still props from the data list, not inline");
const calls = []; for (const n of ["bush", "crate", "chest", "sacks", "well", "board"]) M.register(n, p => calls.push([n, p.x, p.y]));
const solid = new Set(), props = [], day = { day: 1, flags: {} }, env = { solid, props, state: () => day, places: PLACES };
ok(M.validate(PROPS, PLACES).length === 0, "Spring's props pass validate: " + M.validate(PROPS, PLACES).join("; "));
M.build(PROPS, env);
ok(props.length === 15 && PROPS.length === 15, "15 props: 9 bushes, crate, village well, chest, sacks, farm well, notice board");
const solidWant = ["10,2", "21,12", "23,13", "36,23", "40,23", "15,21", "45,13", "11,17", "29,10", "9,7", "34,9", "5,7", "10,7", "13,7", "18,7"];
ok(solidWant.length === solid.size && solidWant.every(k => solid.has(k)), "the 15 blocked tiles are the ones the old inline code blocked");
ok(props.map(p => p.y).join() === "3,13,14,24,24,22,14,18,11,8,10,8,8,8,8", "draw rows are y + 1 for every prop, in the old push order: " + props.map(p => p.y).join());
props.forEach(p => p.draw());
ok(JSON.stringify(calls.slice(9)) === JSON.stringify([["crate", 9, 7], ["well", 34, 9], ["chest", 5, 7], ["sacks", 10, 7], ["well", 13, 7], ["board", 18, 7]]) && JSON.stringify(calls[0]) === '["bush",10,2]', "each prop's sprite is drawn at the tile its place names (the farm well is the second well)");
// a prop shown from day 8 only while its flag is set
{ const c2 = [], e2 = { solid: new Set(), props: [], state: () => day, places: PLACES }; M.register("testsign", p => c2.push(p.id));
  M.build([{ id: "t", sprite: "testsign", x: 3, y: 3, solid: false, when: { dayFrom: 8, flag: "tp" } }], e2); const d = e2.props[0].draw, tryAt = (n, fl) => { day.day = n; day.flags = fl; d(); return c2.length; };
  ok(tryAt(7, { tp: 1 }) === 0 && tryAt(8, {}) === 0 && tryAt(8, { tp: 1 }) === 1 && tryAt(20, { tp: 1 }) === 2, "a test prop appears on day 8 and later, and only when its flag is set"); ok(e2.solid.size === 0, "a `solid: false` prop blocks no tile"); }
{ const w = { dayFrom: 3, dayTo: 5 }, v = d => M.visible({ when: w }, { day: d }); ok(!v(2) && v(3) && v(5) && !v(6) && M.visible({}, { day: 1 }), "when: dayFrom and dayTo are inclusive; no `when` is always shown"); }
{ const v = M.validate([{ id: "a", sprite: "bush", x: 1, y: 1 }, { id: "a", sprite: "bush", x: 1, y: 1 }, { id: "b" }, { id: "c", sprite: "x", at: "NOPE" }, { id: "d", sprite: "x", x: 1, y: 1, when: { dayFrom: 9, dayTo: 2 } }], PLACES).join("|");
  ok(/duplicate id a/.test(v) && /b: needs a sprite/.test(v) && /c: needs integer x and y, or a known/.test(v) && /d: dayFrom is after dayTo/.test(v), "validate finds a duplicate id, a missing sprite, an unknown place and an upside-down day window"); }
{ let m = ""; try { M.build([{ id: "z", sprite: "nope", x: 1, y: 1 }], env); } catch (e) { m = e.message; } ok(/no sprite registered for nope/.test(m), "build throws on an unregistered sprite"); }
process.exit(fail ? 1 : 0);
