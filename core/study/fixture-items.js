// FIXTURE items for the study kit tests. Not real study items: the MBA curriculum builder writes those. Every item is marked fixture:true.
(function (root) {
  const items = [
    { id: "fx-margin", concept: "margin", fixture: true, forms: {
      A: { stem: "A loaf costs 6 coins to make and sells for 10. What is the margin?", options: ["40 percent", "60 percent", "66 percent", "10 percent"], answer: 0 },
      B: { stem: "Flour and labor for a sack cost 30. It sells for 50. What share of the price is margin?", options: ["20 percent", "40 percent", "60 percent", "67 percent"], answer: 1 },
      C: { stem: "A lamp costs 15 to make. The price is 25. How much of the price is profit?", options: ["10 percent", "60 percent", "40 percent", "67 percent"], answer: 2 } } },
    { id: "fx-tvm", concept: "tvm", fixture: true, forms: {
      A: { stem: "Which is worth more: 100 coins today or 100 coins in a year, at 5 percent interest?", options: ["Today", "In a year", "They are equal"], answer: 0 },
      B: { stem: "A debtor offers 200 now or 200 in two years. Interest is 4 percent. Which should you take?", options: ["In two years", "Now", "Neither"], answer: 1 },
      C: { stem: "A baker is offered 50 coins today or 50 coins in a year. Savings pay 3 percent. Which is the better offer?", options: ["In a year", "Equal", "Today"], answer: 2 } } },
    { id: "fx-breakeven", concept: "breakeven", fixture: true, forms: {
      A: { stem: "Fixed cost is 100 a week. Each unit earns 5 above its own cost. How many units break even?", options: ["20", "5", "100", "500"], answer: 0 },
      B: { stem: "Rent is 60 a week. Each sale leaves 3 after its own cost. How many sales cover the rent?", options: ["3", "180", "20", "60"], answer: 2 },
      C: { stem: "A stall pays 90 a week to stand. Each pie earns 6 over its cost. Pies to break even?", options: ["15", "96", "6", "90"], answer: 0 } } },
  ];
  const api = { items };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.StudyFixtureItems = api;
})(typeof window !== "undefined" ? window : globalThis);
