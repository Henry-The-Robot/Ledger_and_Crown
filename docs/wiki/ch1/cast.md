---
title: The cast (voices, greetings, topics, chat menu)
type: system
pack: ch1
season: spring
files: [cast.js, game.js]
symbols: [WHO, greet, topics, locked, short, chat, hash]
concepts: []
sessions: []
tests: [tests/test-cast.js, tests/chat.html]
links: [ch1/village-scenes, ch1/standing-orders, ch1/lessons-week1]
updated: 2026-10-05
---

## What it does
Eleven characters, each with a look, a verbal habit, a mantra and a voice. Walk up to someone with no business to do,
and they say a greeting. Then a menu offers "Ask about..." topics, buyers' standing deals, and Leave. Asking a new topic raises trust.
Voices are written down in `docs/STORY-BIBLE.md`.

## Where
| File · symbol | What |
|---|---|
| `cast.js` · `WHO` (~6) | One entry per person: `name`, `look`, `habit`, `mantra`, `voice`, `greet[]`, optional `low[]`, `rich[]`, `rain[]`, and `topics[]`. |
| `cast.js` · `greet(who, s)` (~114) | Picks a line from weather and chest first, else from `greet[]`. Never repeats the last line. |
| `cast.js` · `topics(who, s)` (~122) | Topics the player may ask now. Each has `id`, `label`, `lines`, optional `need`. Adds `heard`. |
| `cast.js` · `locked(who, s)` (~127) | How many topics are still locked. |
| `cast.js` · `short(id)`, `name(id)` | Short name for clue cards ("Maud"). Full name. |
| `game.js` · `chat(who, note)` (~540) | The menu. See below. |
| `game.js` · `maud()` (~513), `ezra()`, `tomas()` | Their own menus, which call `chat(who)` for "Ask about something else". |

### The cast
`maud`, `crane`, `ashby`, `hobb`, `tomas`, `ezra`, `duke` (Corvin Vane), and the visitors `pell`, `pedlar`, `mira`, `abbey`.

### How `greet` chooses
1. Rain, a thin chest (Cash under 70) or a fat chest (over 450) gives a special line on about one day in three, never twice in a row.
2. Otherwise `greet[]` is indexed by day and a hash of the name, so a day always gives the same line.
3. It never returns the line it said last.

### How `chat` runs (`game.js`)
1. List `Cast.topics(who, s)` not yet heard.
2. Show the greeting. A buyer with no offer today adds "isn't buying today".
3. Menu: topic labels, then `Deal: ...` rows from `Standing.today(s)` for that buyer, then Leave.
4. A topic plays its `lines` one by one. The first time, trust +1 (cap 10) and a toast.
5. If locked topics remain and none is left to ask, a toast says "There's more they'd say, with time."
6. A standing deal opens `standingOrder` (see `ch1/standing-orders`).
7. The menu repeats until Leave.

## Data and state
`s.trust[who]` (0-10). `s.heard["who:topic"] = day`. `s.said` (last greeting index and tag). `s.flags` for topics with `need.flag`.
A topic's `need` can be `{trust}`, `{flag}` or `{day}`. The module changes no books.

## Invariants
- Every person has at least 3 greetings and a topic (`test-cast.js`).
- No empty or unfilled line. Greetings fit 190 characters. Topic lines fit 290 (`test-cast.js`).
- Greetings vary over 14 days. A deep topic needs trust and, for Ashby, the story flag `ashbyAsked` (`test-cast.js`).
- An asked topic leaves the menu. A buyer says when she is not buying (`chat.html`).
- Crane's "Item:" is at most 15% of his sentences (`docs/STORY-BIBLE.md`; `test-t3b.js` checks the tic).

## How to change it safely
- Add a topic to `WHO[x].topics`. Keep each line one idea. Give `need` a flag only if a scene sets it.
- Keep the voice. Crane numbers sentences rarely. Hobb pauses. Tomas sells in superlatives.
- Never put a number in a line that the engine owns. Use the scene or the notice board.
- A new person needs a `WHO` entry, an `S.NAMES` entry in `engine.js`, and `s.trust` support.

## Known issues
None recorded.

## History
- 2026-10-03: cast, scenes and letters (PR #28; `ch1/LOG`).
- T3b: Crane's "Item:" capped.
- Chat fixes: a heard topic leaves the menu; buyers say when they are not buying.
