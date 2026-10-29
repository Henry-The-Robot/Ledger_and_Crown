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
  const file = path.join(__dirname, "..", "assets", "voice", "LINES-study.json"), list = build();
  fs.writeFileSync(file, JSON.stringify(list, null, 1) + "\n"); console.log("wrote " + list.length + " lines to " + file);
}
module.exports = { build };
