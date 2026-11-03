// FIXTURE sections for the reading page tests (card MBA-ST6). Not the study text: knowledge/mba/study/clep-fa-slice/reading.md
// does not exist yet (card MBA-STUDY-READ). Replace this list with that document's sections; the ids must stay unique.
(function (root) {
  const SECTIONS = [
    { id: "fx-1", title: "Fixture section one", text: "Fixture text. Not study content." },
    { id: "fx-2", title: "Fixture section two", text: "Fixture text. Not study content." },
    { id: "fx-3", title: "Fixture section three", text: "Fixture text. Not study content." },
    { id: "fx-4", title: "Fixture section four", text: "Fixture text. Not study content." },
  ];
  const api = { SECTIONS };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.StudyReadingFixture = api;
})(typeof window !== "undefined" ? window : globalThis);
