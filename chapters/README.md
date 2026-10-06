# Chapters — how to add scene content (one page)

A chapter folder holds content as data. Core code plays it. Write no scene code.
A scene is a record in `chapters/chN/<season>/scenes.js`. `core/scene.js` plays it. Example: `chapters/ch1/spring/scenes.js`.

## A scene record
```js
{ id: "hobb_extension", who: "hobb", from: 14, to: 20, at: [32, 10],
  card: ["Term", "number or quote"],        // optional: pins a clue card when the scene has a clue step
  need: { invoiceOpen: "hobb" },            // optional condition: { flag: "key" } or { invoiceOpen: "who" }
  bind: { invoice: "hobb" },                // optional: text may use {amt} and {half} of that person's invoice
  hint: "One line shown to the player.",
  steps: [ ...steps ] }
```

## Steps (each step has one key)
| Step | Does |
|---|---|
| `{ say: "maud", lines: ["Box one.", "Box two."] }` | One dialogue box per line. |
| `{ ask: "maud", text: "Prompt", options: [{ label: "A", then: [steps] }, ...] }` | A choice. The picked option's `then` steps run. |
| `{ maud: "Aside" }` | A Maud aside (two sentences at most). |
| `{ flag: ["key", value] }` · `{ trust: ["who", 1] }` · `{ clue: 1 }` · `{ letter: 7 }` | State changes. |
| `{ op: "delay", who, days }` | Pushes that person's invoice due date out. |
| `{ op: "halfNow", who, days, note }` | They pay half now (a `collect` entry); the rest is due `days` later. |

## Story steps (the lesson chapters: `chapters/ch1/spring/lessons.js`)
A chapter of the story is a record `{ id, steps }`. It is played with `SceneKit.play(record, ctx, startVariables)`. `ctx` is the chapter's code (story.js). Text may use `{name}` (any variable) and `{name|money}`. An unknown `{name}` throws.
| Step | Does |
|---|---|
| `{ tell: "Maud box", spot: ["h-cash"] }` | One Maud box. `spot` names the books she points at. |
| `{ speak: "tomas", text, buttons: ["A", { label: "B", off: "var" }], as: "c" }` | One box with buttons. The picked index goes to variable `c`. `off` greys a button when that variable is true. |
| `{ quiz: text, answer: "var", hints: [..], spot, tol, docs: ["notebook"], work, how }` | The player types a number. Maud checks it against the variable. |
| `{ calc: "name" }` | A formula in story.js (`CALC`). It reads the variables and returns new ones. Numbers and short phrases only. |
| `{ set: [name, value] }` · `{ let: [name, "text {x}"] }` · `{ remember: [key, value or {var}] }` | A variable, a filled text, or the chapter's story state. |
| `{ if: cond, then: [..], else: [..] }` | `cond` is a variable name, `{ not: cond }` or `{ eq: [name, value] }`. |
| `{ pick: "var", cases: [[..], [..]] }` | Runs the case at that index (out of range: the last). |
| `{ keep: { id, term, line, example, num?, from? } }` · `{ addEx: [id, text] }` · `{ pin: [id, term, num, from, kind?] }` | Notebook and case board. |
| `{ to: [chapter, stage] }` · `{ page: 5 }` · `{ master: "id", if?: cond }` · `{ end: 1 }` | Move the story, show Edric's letter, credit a skill, stop the scene (`play` then answers `false`). |
| `{ verb: "name", args: {..}, lazy: {..}, as: "r" }` | A game action or verb the chapter owns (`VERB` in story.js). `args` are filled. `lazy` texts stay unfilled for the verb. |
Words a player reads live in `lessons.js`. Formulas and game actions live in `story.js`. A test (`test-story-trace.js`) fails when a record names a formula or verb that does not exist.

## Rules
- Every number in player text comes from state (`{amt}`, `{half}`), never a literal.
- A scene that moves money uses an `op` step. Never edit balances.
- Add a test in `tests/test-scene.js` for any new step kind. An unknown step throws.
- Update `docs/wiki/platform/scene-player.md` when the format changes.
