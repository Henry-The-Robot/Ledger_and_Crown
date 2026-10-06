// Ledger & Crown — the map prop layer (P8). A prop is a record (data); a sprite registry holds the code that draws each kind. A season lists its props and never writes drawing code.
//   prop = { id, sprite, x, y } or { id, sprite, at: "CRATE" }   (`at` names a place the game owns, so a coordinate lives in one file)
//          + optional { solid: false (default true: blocks walking), also: [[x, y], ...] (more blocked tiles), sort: y used for draw order (default y + 1),
//                       when: { dayFrom?, dayTo?, flag? } (shown only on those days and when s.flags[flag] is set) }
//   MapProps.register(name, fn(prop))   MapProps.build(props, env)   MapProps.visible(prop, state)   MapProps.validate(props)
//   env = { solid: Set of "x,y", props: [] (the game's draw list), state: () => game state, places: { NAME: { x, y } } }
// A hidden prop is skipped at draw time. `solid` blocks a tile whether or not the prop is shown, so a prop that appears later should say `solid: false`.
(function () {
  "use strict";
  const SPR = {}, key = (x, y) => x + "," + y;
  const register = (name, fn) => { SPR[name] = fn; };
  function visible(p, s) {
    const w = p.when; if (!w) return true; s = s || {};
    if (w.dayFrom != null && !(s.day >= w.dayFrom)) return false;
    if (w.dayTo != null && !(s.day <= w.dayTo)) return false;
    if (w.flag && !(s.flags && s.flags[w.flag])) return false;
    return true;
  }
  function validate(props, places) { // the problems in a prop list; empty means it can build
    const bad = [], ids = new Set();
    props.forEach((p, i) => {
      if (!p.id || ids.has(p.id)) bad.push(`prop ${i}: missing or duplicate id ${p.id}`); ids.add(p.id);
      if (!p.sprite) bad.push(`${p.id}: needs a sprite`);
      if (p.at ? (places && !places[p.at]) : !(Number.isInteger(p.x) && Number.isInteger(p.y))) bad.push(`${p.id}: needs integer x and y, or a known \`at\``);
      if (p.when && p.when.dayFrom != null && p.when.dayTo != null && p.when.dayFrom > p.when.dayTo) bad.push(`${p.id}: dayFrom is after dayTo`);
    });
    return bad;
  }
  function build(props, env) { // adds each prop's blocked tiles and one draw entry (in list order, so draw ties keep their order)
    props.forEach(d => {
      if (!SPR[d.sprite]) throw new Error("map: no sprite registered for " + d.sprite);
      const at = d.at ? env.places[d.at] : null; if (d.at && !at) throw new Error("map: unknown place " + d.at);
      const p = at ? Object.assign({}, d, { x: at.x, y: at.y }) : d;
      if (p.solid !== false) env.solid.add(key(p.x, p.y)); (p.also || []).forEach(([x, y]) => env.solid.add(key(x, y)));
      env.props.push({ y: p.sort != null ? p.sort : p.y + 1, id: p.id, draw: () => { if (visible(p, env.state())) SPR[p.sprite](p); } });
    });
  }
  const api = { register, build, visible, validate, sprites: () => Object.keys(SPR) };
  if (typeof window !== "undefined") window.MapProps = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
