# WORK ORDER — Chapter 1 pack (v1.1, 2026-10-04, creative lead)

**Start gate:** Kyle approved the plan on 2026-10-04 (Phase S: yes). The **platform pack's work runs first** (`docs/builders/platform/WORK-ORDER.md`), so cutscenes and the living
map are built once, on the new core. One task per PR (`ch1/<topic>`) into `master`, merged by the creative lead.

| Phase | Status |
|---|---|
| S · Spring final (v1.0) | GO once the platform pack reaches P8 (cutscenes and props exist) |
| U · Summer | WAITING (after S; season design first) |
| A · Autumn, W · Winter | later |

## Phase S — Spring final, on the new core (master plan §7, items 2–9)
| Id | Task | Done means | Status |
|---|---|---|---|
| S1 | **Cut the load.** Spring teaches the 8 core ideas and ≤ 6 previews. One skippable "desk question" a day replaces the standing order, Maud's daily problem and the night question. Market Day ideas become previews (no transcript credit). | A day never asks more than one question unprompted. The transcript tags each concept `core` or `preview`. | WAITING |
| S2 | **What Summer needs:** the cash-cycle days count (receivable, inventory and payable days on the player's own books, after the Duke scene); one "who gets paid first" decision; naming passes for sunk cost, anchoring, the walk-away option, and legal / ethical / smart (one line each, inside existing scenes). | Each checked against its session (C2.09, the waterfall note, C7.01, C16.12, C12.02). | WAITING |
| S3 | **Make Vane visible.** A "Vane's notes" desk card counting the notes he buys; grey cloaks on the map (props); three favours that pay off at the Court (Hobb, Ashby, Crane); one night scene at the well. | Flags drive all of it; a test for each payoff. | WAITING |
| S4 | **Living valley v1** (props): week 2 carts and stalls; week 3 a house going up; week 4 a new family and a sapling; Ashby's new sign if you helped her; the Traveller and his cow on day 18 (his tale: a firm that grew itself broke; a hint that the King's purveyor is coming). | Screens of days 1, 8, 15, 22, 28 in the PR. | WAITING |
| S5 | **Five cutscenes** (data): Vane arrives (day 12); "It's only my name" (day 21); the night the pigs got in; Market Day opens (short, varies by week); Crane reads the seal. Plus **Spring's short opening** (≤ 8 s) for re-entry from the main menu. Each has a stable id. | Each ≤ 25 s (opening ≤ 8 s), skippable, in the journal. | WAITING |
| S6 | **Hearts that unlock terms.** Visible trust; 3+ hearts unlock Ashby's deposits, Hobb paying in 7 days, Tomas's credit limit. | Bots unchanged; tests. | WAITING |
| S7 | **Fill the iPad screen** at 1194 × 834 (no empty band). | Screens, portrait and landscape. | WAITING |
| S8 | **Release candidate** for the creative lead's quality gate (CHARTER), then a fresh-player run. | Tag `v1.0-spring` after sign-off. Release note `docs/releases/v1.0-spring.md` written. Spring's golden runs re-recorded and frozen. | WAITING |

## Phase U — Summer (after S)
| Id | Task | Status |
|---|---|---|
| U0 | Fill `docs/builders/SEASON-DESIGN-TEMPLATE.md` for Summer from the master plan §4, reading every Summer session in `docs/curriculum-coverage.json` (`home` = `1SU`) with its answers → PR of `chapters/ch1/summer/DESIGN.md`. It must include **Summer's opening animation** (the first season opening after Spring's) and its cutscene list (master plan §13). The creative lead reviews; Kyle approves. **No Summer code before approval.** | GO (docs only, Lead 2026-10-05; split into cards U0a curriculum notes `chapters/ch1/summer/CURRICULUM-NOTES.md`, then U0b this design as `chapters/ch1/summer/DESIGN-DRAFT.md`; renamed `DESIGN.md` after Kyle approves) |
| U1+ | Written by the creative lead after U0 is approved. | — |
