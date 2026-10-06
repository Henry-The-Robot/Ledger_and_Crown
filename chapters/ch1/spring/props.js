// Spring at Thornfield — the map's props as data (P8). The order below is the draw order for props on the same row, and it is the order the old code pushed them.
// `at` names a place that core/game.js owns (CRATE, WELL, CHEST, SACKS, FWELL, BOARD). Format: core/map.js.
(function () {
  const bush = (id, x, y) => ({ id, sprite: "bush", x, y });
  const PROPS = [
    bush("bush-1", 10, 2), bush("bush-2", 21, 12), bush("bush-3", 23, 13), bush("bush-4", 36, 23), bush("bush-5", 40, 23), bush("bush-6", 15, 21), bush("bush-7", 45, 13), bush("bush-8", 11, 17), bush("bush-9", 29, 10),
    { id: "crate", sprite: "crate", at: "CRATE" }, { id: "village-well", sprite: "well", at: "WELL" },
    // WS3: the cold-open scene: the cash chest, sacks stacked by the crate, and a farm well (a decoy for the tag verb)
    { id: "chest", sprite: "chest", at: "CHEST" }, { id: "sacks", sprite: "sacks", at: "SACKS" }, { id: "farm-well", sprite: "well", at: "FWELL" }, { id: "notice-board", sprite: "board", at: "BOARD" },
  ];
  if (typeof window !== "undefined") window.SpringProps = PROPS;
  if (typeof module !== "undefined" && module.exports) module.exports = PROPS;
})();
