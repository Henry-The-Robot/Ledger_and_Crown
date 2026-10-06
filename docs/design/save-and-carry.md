# Save and carry-record design (card G1, platform task P4a)

Status: DRAFT for the Lead's review. P4b (`core/save.js`) builds from this file. Written 2026-10-05 from the code in `core/game.js`, `core/codex.js`, `core/transcript.js`, `core/fx.js`, `core/intro.js`, `chapters/ch1/spring/endings.js` and `docs/wiki/platform/save.md`.

## 1. Every localStorage key today
| Key | Owner (file, symbol) | Shape | Deleted by |
|---|---|---|---|
| `lc_spring_save_v3` | `core/game.js` `SAVE`, `save()`, `start()` | `{s, story, calm, usePtr, fairSeen}` (see section 3) | `review()` (line ~822), `restart()` (line ~834) |
| `lc_transcript_v2` | `core/transcript.js` `store` | `{ [conceptId]: { ev: [{day, kind, real}] } }`. `real` is an ISO date. | Never |
| `lc_codex_v1` | `core/codex.js` `KEY` | `{ [id]: {state: felt\|named, at, hits, due} }` (ms timestamps) | `Codex.reset()` |
| `lc_level_v1` | `core/codex.js` `LEVEL_KEY` | String, default `"apprentice"` | Never |
| `lc_prestige_v1` | `core/codex.js` `PKEY` | Number. Read at new game as a Cash bonus. | Never |
| `lc_unlocks_v1` | `endings.js` `KEY`, `unlock()` | `{ [unlockId]: {kind, term, text, ending} }` | Never |
| `lc_sfx`, `lc_music` | `core/fx.js` `K`, `save()` | `"1"` or `"0"` | Never |
| `lc_sound` | `core/fx.js` `K.old` | Old one-switch key. Read only. | Never |
| `lc_intro_seen` | `core/intro.js` | `"1"`. No code reads it. | Never |
| `lc_bug_reports` | `core/game.js` `pauseMenu` | `[{at, day, stage, question, expected}]` | Never |

Rule: every read and write stays inside try/catch. A blocked store leaves the game playable and unsaved.

## 2. Save v4 layout
One new key, `lc_save_v4`, holds one JSON object. The old per-concept keys fold into it. Nothing in `profile` is ever deleted by a season ending or "Start a new game".
```
{ "v": 4,
  "profile": {                       // never deleted
    "id": "<random 8 chars, made once>", "created": "<ISO>", "rngSeed": <int 1..2147483646>, "games": <count>,
    "level": "apprentice", "prestige": 0,
    "settings": { "sfx": true, "music": true, "introSeen": false },
    "transcript": { ...lc_transcript_v2 object... },
    "codex": { ...lc_codex_v1 object... },
    "unlocks": { ...lc_unlocks_v1 object... },
    "carry": { "ch1": <carry record, section 4> } },
  "slot": {                          // the open season; null between seasons
    "season": "ch1/spring", "savedAt": "<ISO>",
    "s": <engine state>, "story": <Story.state>, "calm": 0, "usePtr": 0, "fairSeen": {} },
  "closed": {                        // one frozen record per finished season, kept forever
    "ch1/spring": { "closedAt": "<ISO>", "outcome": "closed|insolvent|sold", "seed": 3,
                    "statements": <Books.close(s)>, "exam": {passed, score, attempts, certificate}, "carry": <carry record> } },
  "bugReports": [ ... last 20 ... ] }
```
Rules:
- `slot` is replaced by `save()` at the same call sites as today. `closeBooks()` moves the result into `closed[season]` and sets `slot` to null only after the Court and ending screens finish. This fixes the known issue that a finished season is lost.
- Writes go through one function: `Save.write(patch)`. It reads, merges, stamps `v` and `savedAt`, then writes. It keeps the previous blob under `lc_save_v4_prev` as one-step rollback.
- Each module keeps its public API (`Codex.mark`, `Transcript.record`, `Endings.unlock`). Only the storage behind `store.get/set` changes to read and write `profile.*`.

## 3. Migration from `lc_spring_save_v3`
The v3 blob has no version field. Detect it by the key name.
1. On `Save.load()`: if `lc_save_v4` exists and `v === 4`, use it. Stop.
2. Else read `lc_spring_save_v3`. If it parses and has an `s` object, go to step 3. If not, go to step 8.
3. Create `profile` with `id`, `created`, `games: 1`, and `rngSeed` from section 7.
4. Copy `lc_transcript_v2`, `lc_codex_v1`, `lc_unlocks_v1` into `profile.transcript`, `.codex`, `.unlocks`.
5. Copy `lc_level_v1` to `profile.level`, `lc_prestige_v1` to `profile.prestige` (number, default 0), `lc_sfx`/`lc_music` (else `lc_sound`) to `profile.settings`, `lc_intro_seen` to `profile.settings.introSeen`.
6. If `v3.s.over` is false: `slot = {season: "ch1/spring", s, story, calm, usePtr, fairSeen}`. If `v3.s.over` is true: build `closed["ch1/spring"]` from `v3.s` (outcome, seed, `Books.close(s)`), build the carry record from it (section 4), and set `slot = null`.
7. Write `lc_save_v4` and read it back. Only if the read-back parses and equals what was written: leave the old keys in place (do not delete them in P4b; a later release removes them). Set `lc_save_v3_migrated = "1"`.
8. Nothing to migrate: write an empty v4 (`slot: null`, `closed: {}`).
Failure at any step: leave every old key untouched, keep playing from v3 in memory, show no error to the player.

Sample v3 save (trimmed from `tests/stability.html`, which builds one with `Spring.newGame({story:true, seed:3})` and the careful bot to day 28):
```
{"s":{"day":28,"over":true,"outcome":"closed","seed":3,"events":[...],"trust":{"maud":2,"ezra":4,"ashby":4,"hobb":4,"tomas":4,"duke":4,"mira":4,"abbey":4,"pell":4,"pedlar":4},
      "bal":{"cash":412,"loan":-100,"crown":-1250,"...":0},"flags":{"guarantee":true,"vane":"asked"},"journal":[...],"plots":[...]},
 "story":{"ch":9,"stage":"done","notebook":[],"pages":[],"pageDays":{},"clues":[],"weeks":[],"farm":"Thornfield"},
 "calm":0,"usePtr":153,"fairSeen":{}}
```
The migration test (section 8) uses the full object the test builds, not this trimmed copy.

## 4. Carry record ch1 to ch2
Schema file: `docs/design/carry-record.schema.json` (JSON Schema draft 2020-12). It follows the README "Chapter hand-off contract" draft. Fields:
- `ending`: `closed`, `insolvent`, `sold`, `seized`, `bridged`, `free`, or `heir`.
- `cash`: integer. `debts`: `[{to, amount, rateBp, callable}]`. Today's engine holds the Ezra loan in `bal.loan` and the Crown debt in `bal.crown`; the carry record turns each into one entry. `rateBp` comes from `terms(s).rateBp`.
- `stakes`: `{mill, bakery}` booleans or share numbers. Spring has neither; both are `0` here and Summer fills them.
- `relations`: `{maud, crane, ezra, ashby, hobb, jory, tomas}` integers from `s.trust` (0 to 10). A name Spring does not track (crane, jory) is `4`, the default trust.
- `flags`: `{vaneFinal, guarantee, hobbExt, ashbyPromise, craneVane, maudConfessed, examPassed, ...}`. Booleans except `vaneFinal` and `vane` (strings). Unknown flags are allowed.
- `transcript`: the concept-evidence snapshot (`profile.transcript` at closing).
- `statements`: `Books.close(s)` at Midwinter: income statement, balance sheet, cash-flow.
- `season`, `seed`, `closedAt`, `v: 1`.

Canonical heir (a player who lost, or who starts Chapter 2 with no Chapter 1 record). Proposed values, the Lead decides:
```
{ "v":1, "season":"ch1/spring", "ending":"heir", "cash":200, "debts":[{"to":"ezra","amount":100,"rateBp":350,"callable":false},{"to":"crown","amount":1250,"rateBp":0,"callable":false}],
  "stakes":{"mill":0,"bakery":0}, "relations":{"maud":2,"crane":4,"ezra":4,"ashby":4,"hobb":4,"jory":4,"tomas":4},
  "flags":{"examPassed":false}, "transcript":{}, "statements":null, "seed":0, "closedAt":null }
```
These are the opening values from `newGame` (cash 200, loan 100, Crown 1250, trust defaults). Chapter 2 reads only `profile.carry.ch1`; if it is missing it writes the heir.

## 5. Export and import
- Export button in the pause menu. It calls `Save.export()`, which returns a text code and also offers a file download.
- Code format: `LC4.` + base64url of the deflate-compressed JSON (`CompressionStream("deflate-raw")`; fallback: no compression, prefix `LC4U.`). The JSON is the whole v4 object minus `bugReports`.
- File: `ledger-and-crown-<profile.id>-<YYYYMMDD>.lcsave`, content = the same code, UTF-8 text.
- Import: paste or choose a file, strip whitespace, check prefix, decode, parse, check `v === 4` and `profile` exists. Show the day, chapter and savedAt, ask to confirm, then keep the old blob in `lc_save_v4_prev` and write the new one.
- Size limit: 1 MB of code (about 3 MB of JSON before compression). Larger input is refused with "That save is too big." A live save over 2 MB shows a warning; the journal and `plots` are the large parts.
- A v3-shaped import (object with `s` and `story`) goes through the migration in section 3.

## 6. Persistence and the iPad
- On first save, call `navigator.storage.persist()` once (try/catch; ignore a refusal) and store the answer in `profile.settings.persisted`.
- Safari on iPad can clear a site's storage after seven days without a visit unless the page is added to the Home Screen. Show one line the first time `persist()` is refused or absent: "On iPad: tap Share, then Add to Home Screen, so your game is kept." Show it once (`profile.settings.hintShown`).
- The pause menu keeps a visible "Export my game" so a player can always back up.

## 7. The two unseeded Math.random calls that change the game
1. New-game seed, `core/game.js` line ~928: `1 + Math.floor(Math.random() * 2147483646)`. Replace with a seed drawn from `profile.rngSeed`: `seed = mulberry32(profile.rngSeed + profile.games)()` scaled to 1..2147483646. Then `profile.games += 1`. `profile.rngSeed` is made once from `crypto.getRandomValues`, with `Math.random` as fallback. `?seed=N` still wins.
2. Review option order, `core/game.js` line ~828: `.sort(() => Math.random() - .5)`. Replace with a seeded shuffle keyed on `s.seed` and the question index, so a reload shows the same order.
Left as is on purpose: `codex.js` `shuffle` (line 46, Speak the Word order) and the cosmetic `fx.js` calls (sound jitter, floating-number drift). They change no game state.

## 8. Tests P4b will write (each can fail)
1. `tests/test-save.js` (node, fake localStorage): v3 fixture with `over:false` migrates to `slot` set, `closed` empty, transcript/codex/unlocks/level/prestige copied by value.
2. Same, `over:true`: `slot` null, `closed["ch1/spring"]` present with the outcome, carry record validates against the schema.
3. Corrupt v3 JSON: no throw, old keys untouched, an empty v4 is written.
4. Round trip: `export()` then `import()` on a fresh store gives a deep-equal object (hand-check three fields).
5. Import refusals: wrong prefix, over 1 MB, `v: 5`, missing `profile`.
6. Seed: two new games on one profile get different seeds; the same `rngSeed` and `games` always give the same seed (value checked by hand against `mulberry32`).
7. Review order: same `s.seed` and question index give the same option order twice.
8. Browser (`tests/stability.html` updated): finished season survives "Start a new game" in `closed`, `profile` survives, a reload returns to the books.
9. Heir record: `Save.heir()` validates against the schema and equals section 4's values.
10. Every old v3 key still readable after migration (rollback safety).

## Lead review (2026-10-05) — APPROVED with these changes; P4b builds the changed version
1. **Season record vs chapter record.** Chapter 1 has four seasons. `profile.carry.ch1` is written only when Chapter 1
   ends (Midwinter, after Winter). Each season's `closed[season]` holds `next`: the end state the following season reads
   (same field shapes as the carry record). P4b writes `closed["ch1/spring"].next`; it does not write `profile.carry.ch1`.
   The schema keeps `season`, so it validates both.
2. **Canonical heir** is not the opening state: a Chapter 2 start with the Crown debt still unpaid contradicts the end of
   Chapter 1. The heir = the careful bot's season at seed 0 (the golden run `careful@seed0`), `ending: "heir"`,
   computed once by a tool and frozen as `tests/golden/heir-ch1-spring.json`. `Save.heir()` returns it. Re-freeze it
   when a later season of Chapter 1 ships (the heir always reflects the latest finished season).
3. **`stakes`** are numbers only (share 0 to 1); `0` = none. No booleans.
4. Keep everything else, including the rollback blob, the try/catch rule and the left-alone `Math.random` calls.

## Lead review of P4b (`core/save.js`, 2026-10-05) — sound core; three MAJOR integration gaps (card P4c)
Good: one versioned blob; a migration that never deletes old keys; rollback blob; every store call guarded; seeded new
games and review order; export/import with plain and compressed codes; the heir frozen from careful@seed0; 25+ node
checks that can fail (`tests/test-save.js`). Accepted deviation: the small stores (transcript, codex, unlocks, level,
prestige, switches) stay live in their old keys; `snapshot()` folds them in at freeze/export and `restoreStores()` writes
them back on import. That is lower risk than rewriting five modules now.
1. **MAJOR:** the season freezes only inside Ezra's review (`core/game.js:831`), so "again" or a reload loses it.
   Freeze when the closing books first show.
2. **MAJOR:** `exam.passed` and `flags.examPassed` come from Ezra's review, not the Court (`court.js` ~261). Use the
   Court's result.
3. **MAJOR:** `Save.persist()` is never called, so the iPad hint never shows.
4. MINOR: `load()` ignores `lc_save_v4_prev` when `lc_save_v4` is corrupt. 5. MINOR: import accepts any slot shape.
5. Note: `Save.heir()` returns null in the browser (it reads the file through `require`). This is fine until Chapter 2
   loads it; then ship the heir as a script.
