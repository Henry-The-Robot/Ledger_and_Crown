// MBA-VO1: writes assets/voice/LINES-study.json, the list of every dialogue box in projects/mba-game/study-route.json's lesson and scene steps:
// { scene, id, who, text } per box. A voice file for a box is assets/voice/<scene>/<id>.mp3. Run: node tools/voice-lines.js   (node tests/test-voice.js checks the file is current)
// The route file lives in the Agent System; the repo keeps a copy of the step list it needs in tools/study-route-steps.json (records and scenes only).
const fs = require("fs"), path = require("path");
global.window = global;
const S = require("../core/engine.js"); global.Spring = S;
const K = require("../core/scene.js"), Lessons = require("../chapters/ch1/spring/lessons.js");
require("../chapters/ch1/spring/cast.js"); require("../chapters/ch1/spring/scenes.js");
const steps = require("./study-route-steps.json");

function build() {
  const out = [];
  steps.forEach(s => {
    const rec = s.record ? Lessons.BY[s.record] : window.Scenes.BY[s.scene];
    if (!rec) throw new Error("voice-lines: no record or scene for step " + s.id);
    K.boxes(rec).forEach(b => out.push(b));
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
