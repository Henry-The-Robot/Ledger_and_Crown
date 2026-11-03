// MBA-VO2: writes assets/voice/LINES-study.json, the list of every dialogue box the study page shows: { scene, id, who, text } per box.
// It reads study-route.json (beside this repo's index) and builds each step with the same code the study page plays: StudySelect.select and
// overrideVerbs for a lesson, SceneKit.boxes for the boxes, StudySelect.frameSteps for the frame, StudySelect.extraBoxes for the deposit, the checks and
// the Court's opening. The scene of a box is the id the page passes to the voice: the step id for a lesson, "study-frame" for the frame, the scene id for a scene.
// A voice file for a box is assets/voice/<scene>/<id>.mp3. Run: node tools/voice-lines.js   (node tests/test-voice.js checks the file is current)
// A box with "dynamic": true takes its numbers from the player's books (a typed practice problem): it has no fixed words to record.
const fs = require("fs"), path = require("path");
global.window = global; if (!global.location) global.location = { search: "" }; if (!global.document) global.document = { readyState: "complete", addEventListener() {} }; // court.js and practice.js load in node with these stubs
const S = require("../core/engine.js"); global.Spring = S;
const K = require("../core/scene.js"), Lessons = require("../chapters/ch1/spring/lessons.js"), Sel = require("../core/study/select.js");
require("../chapters/ch1/spring/cast.js"); require("../chapters/ch1/spring/scenes.js"); require("../chapters/ch1/spring/court.js"); require("../chapters/ch1/spring/practice.js");
const routeFile = path.join(__dirname, "..", "study-route.json");

const deps = () => ({
  deposits: S.R.deposits,
  introLines: window.Court.introLines,
  practiceText: id => { if (!window.Practice.BANK.some(p => p.id === id)) throw new Error("voice-lines: no practice problem '" + id + "'"); return "Practice problem '" + id + "': typed, the numbers come from the player's books."; },
});

// route: the parsed study-route.json (default: the file). Returns [{ scene, id, who, text }] in the order the player meets them.
function build(route) {
  route = route || JSON.parse(fs.readFileSync(routeFile, "utf8"));
  const out = [], d = deps(), push = list => list.forEach(b => out.push(b));
  route.route.forEach(s => {
    if (s.kind === "frame") push(K.boxes({ id: "study-frame", steps: Sel.frameSteps(s, "Thornfield").steps }));
    else if (s.kind === "lesson") {
      const rec = Lessons.BY[s.record];
      if (!rec) throw new Error("voice-lines: no record '" + s.record + "' for step " + s.id);
      if (s.record === "close") push(K.boxes(rec)); // the page plays the close record whole, under its own id
      else push(K.boxes({ id: s.id, steps: Sel.overrideVerbs(Sel.select(rec.steps, s.select, Lessons.BY), s.verbs) }));
    } else if (s.kind === "scene") {
      const sc = window.Scenes.BY[s.scene];
      if (!sc) throw new Error("voice-lines: no scene '" + s.scene + "' for step " + s.id);
      push(K.boxes(sc));
    } else if (!{ advance: 1, deposit: 1, court: 1 }[s.kind]) throw new Error("voice-lines: unknown step kind '" + s.kind + "' (" + s.id + ")");
    push(Sel.extraBoxes(s, route, d));
  });
  return out;
}
if (require.main === module) {
  const dir = path.join(__dirname, "..", "assets", "voice"), list = build();
  fs.writeFileSync(path.join(dir, "LINES-study.json"), JSON.stringify(list, null, 1) + "\n"); fs.writeFileSync(path.join(dir, "FILES.json"), JSON.stringify(files(), null, 1) + "\n");
  console.log("wrote " + list.length + " lines and " + files().length + " files");
}
// The box voice files that exist: "<scene>/<box id>.mp3" under assets/voice (the opening's own folder, intro, is not a scene).
function files() {
  const dir = path.join(__dirname, "..", "assets", "voice"), out = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(d => { if (d.isDirectory() && d.name !== "intro") fs.readdirSync(path.join(dir, d.name)).forEach(f => { if (/\.mp3$/.test(f)) out.push(d.name + "/" + f); }); });
  return out.sort();
}
module.exports = { build, files };
