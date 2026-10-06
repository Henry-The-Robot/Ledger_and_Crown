// Spring's cutscenes (S5): the stable ids, where each plays, and its story-bible voice. The data lives beside this file, one file per cutscene; tests/test-cutscenes-spring.js checks them all.
(function () {
  const LIST = [
    { id: "vane-arrives", when: "day 12 morning, before the steward's scene (story.js)", file: "vane-arrives.js" },
    { id: "only-my-name", when: "day 21+, before Ashby's guarantee scene (scenes.js `cutscene`)", file: "only-my-name.js" },
    { id: "pigs-night", when: "the morning after the pigs' night (story.js, S.eventDay)", file: "pigs-night.js" },
    { id: "market-open-1", when: "Market Day, day 7 (core/market.js)", file: "market-open.js" },
    { id: "market-open-2", when: "Market Day, day 14", file: "market-open.js" },
    { id: "market-open-3", when: "Market Day, day 21", file: "market-open.js" },
    { id: "crane-seal", when: "day 23+, before Crane's seal scene (scenes.js `cutscene`)", file: "crane-seal.js" },
    { id: "spring-opening", when: "re-entry from the main menu (P14 wires the trigger)", file: "spring-opening.js" },
  ];
  if (typeof window !== "undefined") window.SpringCutscenes = LIST;
  if (typeof module !== "undefined" && module.exports) module.exports = LIST;
})();
