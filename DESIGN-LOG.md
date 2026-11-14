# DESIGN-LOG: Human History, phone/tablet polish run (DADA)

Mode: **Adaptive** (a public research tool; the brief names approachability). Run type: **Polish** (concept accepted; frozen: concept, six views and their
navigation entries, palette and type system, all data). Floor: **Mobile Floor** (no freeze waives it).
Tools: Playwright (headless Chromium, touch emulation) for rendering and measurement; DADA `pick_panel.py` for the panel; sub-agents for the seats, each
filing a verdict to a panel directory; no graph tooling (anchor graph kept as text here). The skill's `tools/measure.py` was not present, so a probe for rows
M1 to M11 was written for this app: `scripts/measure-mobile.cjs` (also `npm run floor`).

## 1. Traversal Plan

Brief: fix the mobile layout (390 and 768 px) and polish the dark research-map UI without touching the evidence data.

Seed (labels verbatim from `references/anchor-graph.md`):
`Make It Bigger (Paula Scher)` [Stance] → `Visual Hierarchy (Arnheim, Dondis)` [Rules] → `Universal Principles of Design (Lidwell, Holden, Butler)` [Rules]
→ `Making and Breaking the Grid (Timothy Samara)` [Breaker]; counterpoint reached by the dotted edge `Make It Bigger (Paula Scher)` -.-> `The Vignelli Canon (Massimo Vignelli)`.
Welcome anchor: `MAYA: Most Advanced Yet Acceptable (Raymond Loewy)`.

Panel (from `pick_panel.py --mode adaptive --run-type polish`): Critic: Evidence (Cairo) (measurement seat), Critic: Usability (Krug), Critic: Provocateur (Debord)
(claims), Critic: Inclusion (Mace) (polish target: access). Dotted pair: Krug -.- Debord.

Premortem R0: **a measured premortem, not a panel round.** The inherited app was measured at 360/390/430/768 across 7 views (28 combinations) and screenshotted;
all 28 failed the floor. No R0 panel was convened: that is a skipped step, stated in the Compliance Check.

### Frontier (final state)
| Candidate | Reached via | From anchor | Status |
|---|---|---|---|
| Floor rows (targets, type floor, inputs, hover, safe area, h1, bars) | incoming: measured defects | Universal Principles of Design | TAKEN (M1) |
| Phone navigation reachable by thumb | outgoing solid | Visual Hierarchy | TAKEN (M2) |
| Globe-first phone first screen, compact dock, bottom sheet | Breaker: escalate the signature device | Make It Bigger / Making and Breaking the Grid | TAKEN (M3) |
| Tables to cards, filters collapsed, portrait graph | incoming: R0 screenshots | Visual Hierarchy | TAKEN (M4) |
| Caveats on the phone map (Debord F1-F4, N1) | R1 sharpest disagreement | Make It Bigger -.- Vignelli Canon (restraint) | TAKEN (M5, M10) |
| Orientation: hint, scroll cues, graph legibility (Krug F2-F6) | R1 | Visual Hierarchy | TAKEN (M6-M9) |
| Contrast and operability (Cairo F5, Mace F1-F6) | R1 | Universal Principles of Design | TAKEN (M11, M12) |
| Graph label collision in the dense centre | R2 (Krug F3) | Visual Hierarchy | DEFERRED: needs label culling by priority; tap-to-select works; offered for a later run |
| Hardware verification (real phone, keyboard, notch) | Mobile Floor | n/a | DEFERRED: needs a phone |

## 2. Decision Records (condensed; each written before its move, fields kept)

**M1 Floor system (KEEP-THE-RULE).** Depends on: none. Anchors: Stance Make It Bigger; Rule Universal Principles of Design; Counterpoint The Vignelli Canon (restraint: no new decoration).
Intent: nothing unreadable or untappable. Argument: 12px type floor (CSS sizes under 12 raised), 44px targets on coarse pointers, 16px inputs, `:hover` gated behind `(hover:hover) and (pointer:fine)`,
safe-area insets, `h1` brand. Rejected: shrink-to-fit with extra breakpoints (the standard forbids it); `overflow-x:hidden` (hides M1). Consequence: denser pages grow taller. Fence: the floor exists because a finger is 44px.
Adaptive: Advanced pole = dense research instrument kept; Acceptable pole = every control a thumb can hit.

**M2 Phone navigation (KEEP-THE-RULE).** Depends: M1. Six views move from a cut-off top tab row to a bottom tab bar with icon+label; top bar keeps brand+Search.
Same six entries (freeze respected: a measured defect, the tabs were clipped at "Hypothesis l" and out of thumb reach). Rejected: hamburger (hides the views); scrolling tabs.

**M3 Phone map first screen (BREAK: escalate the existing globe).** Depends: M1, M2. On phones the globe is the default projection and fills the stage; the dock becomes a compact grid
(play/prev/next 44px, readout, compare, timeline, one-line chip scrollers); the record opens as a bottom sheet (half height, handle expands, swipe closes) and the map re-centres the selected record above it;
pinch zoom on the globe. Rejected: flat 2:1 map on a portrait screen (a 190px strip in an empty stage, measured at R0); a full-screen modal for the record (hides the map). Consequence: first screen is the figure.
Mode field: Advanced = globe-as-first-screen; Acceptable = tap, label, caveat, one thumb.

**M4 Wide tables and dense panels on one column (KEEP-THE-RULE).** Ledger and audit tables become cards, stats a swipe strip, status chart collapsible, graph relations filter collapsed, graph layout stretched for portrait, lab question list becomes a select.

**M5 Caveats on the map (ADAPT from R1 Debord F1-F4, Cairo F2-F3).** A persistent card on the map: "Tap a dot for its evidence. Dashed ring = claimed date. Routes and the sand-tint shelf are schematic. Positions approximate; records unverified. Method";
the dock line always says "shelf tint schematic" and wraps (never ellipsised). Rejected: banner/modal disclaimer (wallpaper, licenses the image). Counterpoint applied: plain text, no ornament.

**M6-M9 Orientation and reach (ADAPT from R1 Krug).** Graph labels rescaled to render at 12px with a persistent hint; lab select visible (a CSS order bug fixed); ledger stats a strip, chart collapsible;
sheet gets a sticky Close, swipe-down, and hides the dock chip rows while open; era chips get a clock glyph and an edge fade; zoom stack hidden while a record is open.

**M10 Honesty that survives shrinking (ADAPT from R1 Debord F6, N1).** "Prompts for review, not verdicts" kept visible outside the collapsed audit intro; the sheet carries a one-line caveat while open.

**M11 Contrast (ADAPT from R1 Cairo F5, Mace F3).** `--faint` #5b6c88 → #8294b3 (computed 5.14 to 6.41:1 on the four panel greys); audit heat-map cells recoloured in two lightness bands with a computed label colour; decorative dots aria-hidden.
A contrast probe (alpha-composited) added to the measurer so the floor can fail on it.

**M12 Operability (ADAPT from R1 Mace).** Canvas focus ring; keyboard on the canvas (arrows/PageUp/PageDown step through visible records, Enter opens, +/- zoom, Esc) with an aria-live announcement; layers sheet is a modal dialog
(map column `inert`, focus in/out, Esc); record panel takes focus and returns it to the opener; forced-colors rules; stable "n of m" per keyboard session.

## 3. Panel Reports

R0: not convened (see §1). R0 measurement recorded in the Compliance table.

### Panel, WHOLE, round R1 (artifact: dist at http://127.0.0.1:4173; screenshots r0 and r3)
| Critic | Anchor used | Observed in the work | Verdict | Requested change |
|---|---|---|---|---|
| Cairo | How Charts Lie | Floor script reproduces 28/28 green on size rows; sea-level line measured 0px wide at 390; legend only behind Layers; --faint 2.97-3.70:1 | OBJECT | F2 wrap the readout; F3 key on the map; F4 label counts; F5 raise --faint; F6 the floor overstates (no contrast) |
| Krug | Don't Make Me Think | Tab bar answers "where am I" (win); nothing says "tap a dot"; graph/ledger/lab first actions hidden | OBJECT | F2 hint + scroll cues; F3 graph hint/legend/labels; F4 visible question picker; F5 filters first; F6 reachable close |
| Debord | Society of the Spectacle | Lit globe with no caveat; "schematic" ellipsised; legend hidden; audit intro collapsed | OBJECT | F1/F2 caveat line; F3 never ellipsise; F4 legend; F6 keep "not verdicts" |
| Mace | Principles of Universal Design | Canvas focus ring none; no keyboard way to select a record; layers not modal; sheet no focus; forced colours | OBJECT | F1-F6 as filed |

#### Resolutions, round R1
| Seat: finding | Resolution |
|---|---|
| Cairo: F2 readout 0px wide | ADAPT (M5/M3): readout row wraps, caveat never ellipsised |
| Cairo + Debord: F3/F4 legend hidden | ADAPT (M5): persistent card on the map |
| Cairo: F4 counts unlabelled | ADAPT: "numbers = records active at this date" |
| Cairo + Mace: --faint contrast | ADAPT (M11): premise tested by computing WCAG ratios, true |
| Cairo: F6 floor overstated | ADAPT: contrast probe added to the measurer |
| Krug: F2 nothing says tap a dot | ADAPT (M5/M6) |
| Krug: F3 graph labels 6-7px | ADAPT (M6): premise tested, labels scale with zoom, true |
| Krug: F4 no visible picker | ADAPT (M7): premise tested, a later `display:none` rule overrode the media query, true |
| Krug: F5 stats not a strip | ADAPT (M8): premise tested, `flex-wrap` still wrapped, true |
| Krug: F6 close out of reach | ADAPT (M9) |
| Debord: F1/F2 no caveat on first screen | ADAPT (M5) |
| Debord: F3 caveat ellipsised | ADAPT (M5): never ellipsised |
| Debord: F5 lab chips truncated | ADAPT (M7): full names, no clamp |
| Debord: F6 audit caveat hidden | ADAPT (M10) |
| Mace: F1 canvas focus ring | ADAPT (M12) |
| Mace: F2 no keyboard selection | ADAPT (M12) |
| Mace: F4 layers not modal | ADAPT (M12) |
| Mace: F5 sheet does not take focus | ADAPT (M12) |
| Mace: F6 forced colours | ADAPT (M12) |

### Panel, WHOLE, round R2 (artifact: the ADAPTed build; the same four seats resumed so each judged its own findings)
| Critic | Verdict | Findings |
|---|---|---|
| Krug | PASS | F2/F4 resolved; F3/F6 mostly; F5 partly (filters stack). New N1 swipe-strip gutter; N2 record count changed; N3 stray divider in the audit |
| Debord | PASS, conditional | F1, F3, F4, F5, F6 resolved; F2 partly (say "routes" schematic); N1 caveat missing while the sheet is open; N2 wallpaper risk moderate, do not lengthen the card |
| Mace | OBJECT (narrow) | F1-F6 verified fixed; new: focus not restored after a keyboard-opened record (early return skipped it); "n of m" unstable |
| Cairo | PASS | F2-F5 fixed (recomputed --faint 5.14-6.41:1; 0 contrast failures at all 28 rows); F6 narrowed (focus and real devices unmeasured). Optional: a cue while the sheet is open |

#### Resolutions, round R2
| Seat: finding | Resolution |
|---|---|
| Krug: N2 "count changed 262 → 321, data frozen" | OVERRULE (premise refuted: the 59 new records come from a separate task, closing gaps in design/ledger.md and design/master-prompt.md, committed apart from the CSS; the CSS run changed no data file) |
| Krug: N1 strip gutter | ADAPT: `scroll-padding-inline` |
| Krug: N3 stray divider | ADAPT: hidden on phones |
| Krug: F5 ledger filter stack | ADAPT: selects two per row |
| Krug: F3 graph label collisions | DEFERRED: needs priority-based label culling; logged on the Frontier |
| Debord: F2 "routes" schematic | ADAPT: caveat names routes |
| Debord: N1 caveat hidden while sheet open | ADAPT (M10): one-line note in the sheet |
| Debord: N2 wallpaper | KEEP the card as short plain text; not grown into a disclaimer |
| Mace: focus not restored | ADAPT (M12): premise tested by reading the code, the restore sat after an early return, true |
| Mace: unstable n of m | ADAPT (M12): one snapshot per keyboard session |

### Panel, WHOLE, round R3 (final build; the same four seats resumed)
| Critic | Verdict | New or reopened findings |
|---|---|---|
| Cairo | PASS | none (fixed bars 15% with the sheet open, at the limit; the sheet caveat omits "dashed = claimed", covered by the date card's own label) |
| Krug | PASS | N1 gutter, N3 divider, F5 filters resolved; N4 the pinned Close bar half-covers the date card in the open sheet |
| Debord | PASS | F2, N1 resolved, no wallpaper; R3-1 same date-card point (date kind/method hidden until scrolled) |
| Mace | OBJECT (minor) | keyboard-opened path verified; reopened: after a Search-opened record, Esc leaves focus on BODY |

#### Resolutions, round R3
| Seat: finding | Resolution |
|---|---|
| Krug + Debord: N4 / R3-1 date card under the Close bar | ADAPT (M13): statuses side by side in the sheet; the date, its kind and method now sit above the bar (measured on the render) |
| Mace: palette opener focus | ADAPT (M12): premise tested, true (the palette input was the recorded opener and is hidden); focus falls back to the canvas; tested Search-open then Esc |
| Krug: N2 count | OVERRULE (premise refuted, see R2) |
| Cairo: optional sheet cue | OVERRULE: the sheet already leads with a caveat line and the date card labels claimed dates |

Both ADAPTs above were made after the Polish cap of three WHOLE rounds: **applied and measured, not re-judged.**

## 4. Anchor Ledger
| Anchor | Role | Status | Evidence | Note |
|---|---|---|---|---|
| Make It Bigger (Paula Scher) | Stance | KEEP | Globe fills the phone first screen (M3) | Strongest objection survived: Debord F1, a lit globe with no caveat; answered by M5 |
| Visual Hierarchy (Arnheim, Dondis) | Rules | KEEP | Bottom tab bar, sheet, dock grid | Krug R1: nothing says "tap a dot"; answered by M5/M6 |
| Universal Principles of Design (Lidwell, Holden, Butler) | Rules | KEEP | Floor rows, contrast, focus | Cairo F6: the floor overstated; answered by the contrast probe |
| Making and Breaking the Grid (Timothy Samara) | Breaker | KEEP | Landscape world map broken for a portrait first screen | Escalated, not replaced |
| The Vignelli Canon (Massimo Vignelli) | Counterpoint (dotted from Make It Bigger) | KEEP (applied) | Caveat as plain text, no decoration; dock restrained | Applied in M5 |
| MAYA: Most Advanced Yet Acceptable (Raymond Loewy) | Welcome | KEEP | Advanced and Acceptable poles recorded per move | |

## 5. Stop conditions and Step 2g

- **S1** Frontier has no OPEN items: **met** (two items DEFERRED with reasons: graph label culling; hardware verification).
- **S2** A WHOLE round with every required critic PASS and no Andon: **not met cleanly.** R3: Cairo, Krug, Debord PASS; Mace OBJECT (minor, one path). No Andon was pulled.
- **S3** Two quiet rounds / one quiet WHOLE round after the last move (Polish): **not met.** R3 produced one new finding each from Krug and Debord (shared) and one reopened from Mace; the fixes were applied after the cap and not re-judged.
- **S4** Ambition push (Polish: the single refinement with the largest measured effect, pushed once more): the largest measured effect was moving to a globe-first phone map; the push was the record-aware inset (the focus point centred above the sheet) and the compact dock grid. Measured: map stage 549 → 595 px of 844 with the sheet open, dock 55% → under 30% of the viewport, fixed bars 34% → at most 15%. **met**.
- **S5** Dotted edges applied or declined: Make It Bigger -.- The Vignelli Canon applied (M5); no other dotted edge used.
The run is therefore reported **incomplete under the bound**: S2 and S3 not cleanly met; resume point = a fourth WHOLE round on the build at the commit that follows this log.

**Step 2g, figures the artifact prints, re-measured at the final state** (procedure: `npm run floor`, `npx tsx` count script, Playwright read of the rendered tiles):
| Printed figure | Procedure | Value | Result |
|---|---|---|---|
| Ledger tiles: 321 built, 43 queued, 84/187/50 full/partial/stub, 521 links, 33 events, 32 routes, 36 questions, 555 sources | count of the data arrays and `depth()` vs the rendered `.stat` text | identical | reproducible |
| Evidence status bars 240/41/17/2/21/0/0/0 | count of `ev` per status vs rendered `.bar-n` | identical | reproducible |
| "364 shown" | built + queued | 321 + 43 | reproducible |
| Audit tiles 0 errors / 16 warnings / 341 notes | `npm run audit` | 0 / 16 / 341 | reproducible |
| Mobile Floor "holds" | `npm run floor` at 360/390/430/768 × 7 views | all rows 0, bars ≤ 15% | reproducible |
| Sea level at 9,000 BCE "−51 m" | `seaLevel(-9000)` from the hand tabulated curve (labelled schematic) | −51 | reproducible; schematic by label |

## 6. Compliance Check
- [x] Tooling inventory done (Playwright, sub-agents for seats, DADA picker; no graph tool; skill's measure.py absent, own probe written)
- [x] Mode stated with the reason (Adaptive: public tool, brief names approachability)
- [x] Panel seated from `pick_panel.py`, seats briefed from their seat files; no bound stated by the person
- [x] Seed with exact labels, one dotted-edge counterpoint, living Frontier
- [x] Run type stated (Polish); no move broke a freeze (M2 moved navigation entries, not changed them: a measured defect)
- [x] Mobile Floor measured at R0 (28/28 failing) and at the final state (holds); what needs a phone stated below
- [ ] Website Shadw/Vercel configuration: **not done.** This is a Vite app deployed by GitHub Pages in this repository, not a static Shadw site; `vercel.json`/`fluid.json` were not created. Flagged for the owner.
- [ ] Palette derived from topic with ΔE ≥ 30: **not done** (Polish froze the palette; contrast was measured and fixed, ΔE between category hues was not computed)
- [ ] First screen rule (landing graphic summarising every topic, measured at 1280×800 and 375×812): **not satisfied as a rule** (the first screen is the globe map; no per-topic summary). Measured: globe fully inside the first viewport at 390×844 (bottom edge at 468 of 844)
- [x] At least one BREAK (escalating the globe to the phone first screen, M3)
- [x] Decision Record per move; [x] Panel Report per round (R0 not convened: skipped, stated)
- [x] Every OBJECT resolved (ADAPT / OVERRULE / DEFERRED); dependents reopened where they existed
- [~] WHOLE rounds run (R1, R2, R3); S1, S4, S5 met; S2 and S3 not cleanly met
- [x] Every figure re-measured at the final state (§5)
- [x] Anchor Ledger complete; graph kept as text
- [x] Double-loop paragraph (below)
- [ ] Run recorded in the DADA ledger (`import_log.py`): **not done**, the dada repository is not at hand
- [x] Final reply states mode, tools, stop conditions and skips

**What needs a phone** (not verifiable from emulation): thumb reach and one-handed comfort of the bottom bar and Close bar; keyboard avoidance and iOS zoom on the ledger/palette inputs; notch and home-bar behaviour (`env(safe-area-inset-*)`); real pinch and swipe feel on the globe and sheet; scroll-snap on the stat strips; performance of the 321-record canvas on a mid-range phone.

**Double loop.** The criterion held (MAYA: the advanced pole survived, a lit globe with an evidence-status system; the acceptable pole was reach and honesty). The panel failed in one place and the process in another: the panel was right on four measurable premises but could not see what the first probe could not measure (contrast, focus), so a green "Floor holds" overstated for two rounds, and R0 was skipped. Graph amendment: add `Critic: Inclusion (Mace)` to the Polish panel minimum for any app with a canvas or custom controls, and make a contrast probe part of the floor probe set from R0.


## 6. Carry-Forward Ledger (facts about the medium, measured)
- A later plain rule beats an earlier media-query rule at equal specificity: `.lab-sel{display:none}` after a `@media` block hid the phone select (Krug R1 F4; premise tested on the render).
- A decorative probe is blind to what it does not measure: the first floor probe printed "holds" while `--faint` text sat at 2.97:1; an alpha-composited contrast probe was added and immediately found 11 failing audit cells.
- A force layout built while its container is `display:none` measures a fallback 900x600 and lays out landscape; defer the build one frame after the view is shown (graph looked identical for two rounds because of this).
- SVG text inside a scaled group renders at font-size × zoom: set `font-size = 12 / k` on zoom to hold a floor.
- An early `return` in a render function silently skips the code after it: focus restore never ran on close (Mace R2).
- A sticky element inside a bottom sheet counts as a fixed bar in the M8 probe (21% → 15% after the handle was made static).
- A map projection centred on the canvas hides the focus point under a bottom sheet: centre on `(height - sheetHeight) / 2` and tween the inset.
