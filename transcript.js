// Spring at Thornfield — the transcript (T key). All 17 core courses are visible from the first minute; only C0-C2
// are active in Spring, the rest are locked behind the act that unlocks them. A concept moves unseen -> used (did it
// in play) -> mastered (explained it correctly to Ezra or Maud, or used it well 3 times). Earned by playing only.
// Persists in localStorage; concept ids that exist in poc/codex.js are mirrored there so the hub's Almanac fills too.
(function (root) {
  const KEY = "lc_transcript_v1";
  const COURSES = [
    ["C0", "Quantitative Readiness", 0], ["C1", "Financial Accounting", 0], ["C2", "Managerial Accounting", 0],
    ["C3", "Data, Statistics & Decisions", 2], ["C4", "Microeconomics & Pricing", 2], ["C5", "Finance I: Valuation", 3],
    ["C6", "Finance II: Corporate Finance", 3], ["C7", "Leading People & Teams", 3], ["C8", "Marketing", 2], ["C9", "Operations", 2],
    ["C10", "Strategy", 4], ["C11", "Macroeconomics", 4], ["C12", "Ethics & Non-market Strategy", 3], ["C13", "Communication & Negotiation", 4],
    ["C14", "The Entrepreneurial Manager", 4], ["C15", "AI & Data for Leaders", 4], ["C16", "The General Manager (capstone)", 5],
  ];
  const ACTS = { 2: "Act II: The Trading House", 3: "Act III: The Barony", 4: "Act IV: The Kingdom", 5: "Act V: The Grand Audit" };
  const CONCEPTS = {
    C0: [["margin", "Margin vs markup"], ["tvm", "Interest & the time value of money"], ["pct", "Ratios & percentages"]],
    C1: [["equation", "Assets = Liabilities + Owner's equity"], ["accrual", "Accrual vs cash"], ["ar", "Accounts receivable"], ["ap", "Accounts payable"],
      ["inventory", "Inventory & Cost of goods sold"], ["gross", "Gross profit"], ["depreciation", "Depreciation"], ["statements", "The three statements"],
      ["cfs", "Cash-flow statement (indirect method)"], ["ratios", "Current ratio"]],
    C2: [["operating", "Operating income"], ["breakeven", "Break-even"], ["wc", "Working capital"], ["overtrading", "Overtrading"], ["insolvency", "Profitable but broke"]],
  };
  const CODEX_IDS = ["accrual", "ar", "ap", "inventory", "gross", "operating", "wc", "overtrading", "insolvency", "breakeven", "margin", "tvm", "statements"];
  let mem = {};
  const store = root.localStorage ? { get: () => { try { return JSON.parse(root.localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }, set: d => { try { root.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} } }
    : { get: () => mem, set: d => { mem = d; } };
  const codex = (id, st) => { if (root.Codex && CODEX_IDS.indexOf(id) >= 0) try { root.Codex.mark(id, st); } catch (e) {} };

  function use(id, well) { // returns "used" | "mastered" when the state changed, else null
    const d = store.get(), c = d[id] || (d[id] = { used: 0, mastered: false }); let changed = null;
    if (!c.used) changed = "used"; if (well !== false) c.used++; else c.used = Math.max(c.used, 1);
    if (!c.mastered && c.used >= 3) { c.mastered = true; changed = "mastered"; }
    store.set(d); codex(id, "felt"); if (changed === "mastered") codex(id, "named"); return changed;
  }
  function master(id) { const d = store.get(), c = d[id] || (d[id] = { used: 1, mastered: false }), was = c.mastered; c.mastered = true; c.used = Math.max(c.used, 1); store.set(d); codex(id, "named"); return was ? null : "mastered"; }
  const state = id => { const c = store.get()[id]; return !c ? "unseen" : c.mastered ? "mastered" : "used"; };
  const name = id => { for (const k in CONCEPTS) for (const [i, n] of CONCEPTS[k]) if (i === id) return n; return id; };
  function progress(code) { const cs = CONCEPTS[code] || []; if (!cs.length) return 0; return cs.reduce((a, [i]) => a + ({ unseen: 0, used: .4, mastered: 1 })[state(i)], 0) / cs.length; }
  function reset() { store.set({}); }
  function html() {
    const row = ([code, title, act]) => { const p = Math.round(progress(code) * 100), locked = act > 0;
      return `<div class="course${locked ? " locked" : ""}"><div class="ch"><b>${code}</b> ${title}<span>${locked ? "&#128274; " + ACTS[act] : p + "%"}</span></div>` +
        (locked ? "" : `<div class="bar"><i style="width:${p}%"></i></div>` + CONCEPTS[code].map(([i, n]) => { const st = state(i);
          return `<div class="cx ${st}"><span>${st === "unseen" ? "? ? ?" : n}</span><span>${st === "mastered" ? "mastered &#9733;" : st === "used" ? "used" : "unseen"}</span></div>`; }).join("")) + "</div>"; };
    return `<h2>Transcript <span class="hint">Thornfield School of the Vale · MBA core</span></h2><div class="courses">${COURSES.map(row).join("")}</div>` +
      `<div class="diploma">&#128274; Diploma: sealed until the Grand Audit</div>`;
  }
  root.Transcript = { COURSES, CONCEPTS, use, master, state, name, progress, reset, html };
  if (typeof module !== "undefined") module.exports = root.Transcript;
})(typeof window !== "undefined" ? window : globalThis);
