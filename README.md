# methodica-ar-math-ratio-01 — זיהוי מצבי יחס (יעד 1.1)

The client-approved unit (QA closed 20.08.26), recreated 31.08.26 in the client's
multi-component structure — the layout of `methodica-math-scale-01`, which is the
reference for everything here — and re-cut 03.09.26 onto the **six רכיבים the
production script actually declares**.

## Component boundaries come from the script

`storyboard/מתמטיקה_יחס_יעד 1.1_090826_מוכן להפקה.pptx` carries six divider slides
(2, 30, 38, 49, 53, 58), each naming a רכיב and its `methodica-ar-math-ratio-01-0N` id,
and every content slide carries the `מספר פריט` of the item it belongs to. Those
dividers and those tags **are** the component and item ids used here — nothing in this
repo re-derives them from the screen flow.

| רכיב | slides | component | screens | items |
|---|---|---|---|---|
| 1 — הקנייה ותרגול מונחה | 3–29 | `-01` | 0–12 | 001–004 |
| 2 — תרגול סטנדרטי | 31–37 | `-02` | 13–19 | 001–003 |
| 3 — תרגול בסיסי וסטנדרטי ב | 39–48 | `-03` | 20–29 | 001–006 |
| 4 — משימת כיתה | 50–52 | `-04` | 30–32 | 001 |
| 5 — תרגול מתקדם | 54–57 | `-05` | 33–36 | 001–003 |
| 6 — שאלת שיא | 59–66 | `-06` | 37–45 | 001 |

Screen 45 (the unit finale) has no slide of its own; it belongs to רכיב 6.

> **Item `-03-006`.** The script tags slide 48 (הזמנות קינוחים) `-03-007` and has no
> `-03-006` at all — a gap left by authoring. The prepared metadata closes it, and the
> content owner chose the closed numbering (03.09.26), so the item ships as
> **`-03-006`**. It is the one id here that does not match the slide byte-for-byte.

## Layout

- `index.html` — redirects to component 01.
- `methodica-ar-math-ratio-01-01 … -06/` — six standalone component apps
  (`index.html` + `script.js` + `index_dev.html`). `script.js` is that component's
  **configuration only** (about 180–200 lines: screen range, ids, maps, scoring); the screen
  logic is `unit-js/70-screens.js`. No stylesheet and no images of their
  own. Only component 01 still has an `assets/` folder at all, holding the two character
  selection clips that its own markup names.
- `unit-js/` — the shared layer, vendored from scale-01 at its **v4** generation. Four
  deliberate differences: the unit identity, the nav-edge key, the canvas height (710,
  fluid width) and `writeForwardState`'s third argument. See its README for the load
  order, the hook contract and those deviations. It also holds **`70-screens.js`**, the
  screen logic of all 46 screens: until 2026-09-23 that was six byte-identical copies at
  the foot of every `script.js` (about 2,940 lines each), held together only by a
  test. It is one file now, as in `methodica-math-ratio-02`.
- `unit-css/styles.css` — **one** stylesheet for the whole unit, linked by every
  component as `../unit-css/styles.css?v=N`. It used to be six byte-identical copies that
  had to be edited in lockstep, with nothing asserting they matched — the same silent
  divergence the six copies of the screen logic had, until they became one file too.
- `unit-assets/` — everything shared by more than one component, **once for the unit**:
  - `fonts/` — the 7 Assistant faces. They used to be duplicated into every component
    while the CSS pointed one level too high, so no component ever loaded them and the
    whole lomda rendered in a fallback typeface with no error anywhere.
  - `img/` and `img/hint/` — the 44-file image set. It used to be copied into all six
    components: 6,350,299 B × 6, which was **77.4% of every asset byte in the unit** and
    the dominant cost of every package cut before 2026-09-07.
  - `video/` — the two warm-up clips. The 08.09 client-QA round made screen 11's
    companion a real clip per monster, and `CHARACTER_ASSETS` sits **below** the config
    head, so all six `script.js` carry the reference whether or not they own that screen.
    A bare `assets/video/…` there would not resolve from five of them, so the clips are
    hoisted and read as `../unit-assets/video/…`. Only component 01 ever plays one.

### The asset rule

> Anything more than one component uses lives in `unit-assets/` and is reached as
> `../unit-assets/…`. A bare `assets/…` reference means a file that genuinely belongs to
> that one component — after the hoist, only component 01's two selection clips.

⚠️ The `@font-face` `url()` resolve from **the stylesheet's own directory**, `unit-css/`,
not from the component page that links it. That is why they are `../unit-assets/fonts/…`
with **one** `../` — and it is why the string did not change when the stylesheet moved.

`_test/verify-report.js` §14 enforces all of it: every `url()` resolved from the
stylesheet's directory, every image reference in **both** `index.html` **and** the screen logic (`script.js` + `70-screens.js`)
resolved from its component, no component re-growing a `styles.css` or an `assets/img/`,
no bare `assets/img/` surviving, and lowercase directory segments. It is mutation-tested
five ways.
- `metadata/` — unit + per-component JSONs, a **straight copy of
  `../../metadata-src/`**, which is the source of truth. Built to MOE **v2.5**
  (`targetSectors`, single-value `targetAudience`, `cognitiveLevels`, unit-level numeric
  `manufacturer`, no `prerequisiteLearningObjective`) — the shape the live Kata API
  actually implements, verified against its OpenAPI on 03.09.26. Eighteen items and
  **42 `questions[]`**. `informationToBot` is the מפתחת's text from the script extraction;
  `informationToBot` and the catalogue fields come from the script extraction;
  `masteryLevel` is `null` throughout (optional in תשפ״ז, and accepted as null by Kata).
  Both `subTopic` and `learningObjective` are confirmed against Kata's live objectives
  index: `…RATIO.RECOG` resolves to *"התלמיד יזהה מצבים שבהם מופיע יחס (כגון: מתכון,
  מהירות נסיעה)"* — this unit's יעד 1.1 exactly. (The `…RATIO.IDENTIFY` this repo
  carried before the v2.5 migration is **not** a real code; the migration fixed it.)
- `_test/` — the headless regression oracle (1951 + 63 assertions across two harnesses) plus the
  local stand-in for the CDN library. **Not deployed** — the allowlist excludes it twice over, by
  name and by the leading-underscore rule. See its README for what each suite covers, and
  [`Documentation/GITHUB-GH.md`](../../../Documentation/GITHUB-GH.md) for how to run them:
  jsdom must be installed **outside** this OneDrive-synced folder, and a POSIX `NODE_PATH` only
  works when Git Bash is what launches node.

## Deviations from the scale reference (deliberate, documented)

1. **Screens keep the unit's original global numbering** (0–45) instead of restarting
   each component at 0 — the approved 46-screen build moves in whole, and
   `unit-js/30-nav`'s missing-markup guard makes foreign numbers a no-op. Two
   consequences are handled rather than worked around: `SCREEN_TO_SUBCONTENT` covers
   each component's own `[PART_FIRST..PART_LAST]` range (the test suite asserts against
   that range, not `0..TOTAL_SCREENS-1`), and `writeForwardState` takes a third
   argument so a never-visited destination is seeded with its own first screen rather
   than 0.
2. The unit keeps its own zoom listener (no shared collision; verified with the
   collision audit from unit-js/README).

## Reporting, issue reporting and resume

All three are wired to resume state-document **v6**. **Metadata** follows MOE **v2.5**;
the **xAPI** rules followed are v2.4's, which v2.5 left unchanged apart from requiring
`X-Experience-API-Version: 1.0.3` — already sent by the CDN library.
Authoritative guide:
`Documentation/reporting-and-resume/ADDING-REPORTING-AND-RESUME.md`.

- **xAPI** — component `initialized`; item `initialized`/`completed`;
  `answered`/`answered.last` for all 29 graded questions; `requested.1` on hint open;
  component `completed` with an explicit `success` + `score`. **Nothing unit-level**
  since 2026-09-16 — see *The platform owns routing* below. The companion-character
  pick is decoration, not a learning-format preference, so it deliberately emits no
  `selected`.
- **Issue reporting** — one Google Form for all of 720 (content owner, 2026-08-13);
  rows are disambiguated by the unit-slug and component-slug fields. Do not create a
  per-unit form and do not rename a `REPORT_FIELDS` key.
- **Resume** — one state document **per component**, addressed by `?registration` alone
  (Kata's registration is per {learner, component}); this part's screen pointer and
  answers, its own copy of the companion character and its own score, and four statement
  ledgers so nothing is re-reported. See *One document per component* below. Silent and automatic: there is no
  "continue where you left off" dialog, only the boot cover.

### Scoring

Scoring is per COMPONENT and per ITEM. **There is no unit-level score**: MOE v2.5
pp. 21-22 defines `completed` at the פריט and רכיב levels only — told apart by the
`object` — and requires `success` + `score` on "בכל פריט או רכיב הכולל אינטראקציות
מסוג answered". A unit is neither — and since 2026-09-16 there is **no unit `completed`
at all** (nor a unit `initialized`): the platform derives the unit outcome itself, and
the grading lives in the six component statements and the item ones beneath them.

> History: until 09.2026 the unit `completed` carried a mean over a fixed five
> components, which reported a learner who reached רכיב 6 without the earlier ones at
> (c06 / 5) — 10% with `success: false`. Because `sendCompletedOnce` latches the unit
> key for the whole registration, that first wrong value could never be corrected. From
> 09.2026 to 2026-09-16 it went out with no result; since then it does not go out.

Each component still records its own scaled score into the state document
(`ratio01_c01/c02/c03/c05/c06_scaled`, `UNIT_SCORE_KEYS` in `script.js`), as a durable
per-component record rather than a statement input. Component 04 (the off-computer
class task) reports `success: true` with **no** score; there is nothing to grade, and a
resultless success is valid under v2.4.

| component | denominator | gate |
|---|---|---|
| `-01` | its 8 graded questions (item 003, the guided example, grades nothing) | ≥ 0.6 — **draft** |
| `-02` | the six-station strip on screens 14–19 | 4 of 6 |
| `-03` | six stations (set B ×4 + set C ×2) | 3 of set B, per screen 20 |
| `-04` | — | `success: true` |
| `-05` | set D ×3 | 2 of 3 — **draft** |
| `-06` | the peak's four parts | 3 of 4 |

The two **draft** gates are new: רכיב 1 and רכיב 5 were inside larger components
before the re-cut and had no gate of their own, and the script states no threshold for
either. They need the learning developer's confirmation.

### The platform owns routing (2026-09-16)

**Kata decides what the learner does next.** It launches each component on its own URL —
`POST /api/v1/launcher/context` takes a *component* key and returns a per-component
`launchUrl` and `registrationId` — reads our `completed` statements, and routes on the
catalogue (`recommendedAfterFail`, `isRequired`, order). The spec pairs two sentences
(v2.7 p.23): *"כאשר נשלח completed עבור רכיב תוכן, הפלטפורמה מסירה את הרכיב מהמסך"*, so
`completed` only *"לאחר סיום מלא של הרכיב, לרבות הצגת משוב"*.

Until this date the unit routed itself: `goTo(n)` past `PART_LAST` called `leaveToPart`
(report → `writeForwardState` → `location.replace` to the next component), `goTo(n)`
below `PART_FIRST` called `goBackToPreviousPart`, and the loader hopped to the saved
part on load. **That was a live reporting defect, not only an ownership question**:
Kata's `registration` is per *component*, and every hop appended
`window.location.search`, so a learner walking the unit from 01 reported every part
under part 01's registration and saved every part's resume slot into part 01's state
blob.

| | before | after |
|---|---|---|
| `leaveToPart` (last screen, parts 01–05) | `xapiCompleteComponent` → `writeForwardState` → `location.replace` | `xapiEndComponent(res, lastScreenButton())` — report, then the button **disables itself**. No new text. |
| `finishUnit` ("סיימתי", part 06) | component `completed` **+ unit `completed`** | component `completed` only, button disabled |
| the `PART_FIRST` screen's "חזרה" (`.scq-back`, parts 02–06) | `goBackToPreviousPart` → previous component | **hidden** by `hideCrossPartBack()` (`90-boot.js`); the function returns at once |
| loader phase A | `location.replace` to `_saved.part` | **removed** — the part Kata launched is the part shown, its own slot restored |
| unit-level statements | `initialized` (01 `onXapiReady`) and `completed` (06) with `{ scope: 'unit' }` | **none**; `xapiCompleteUnit` deleted. `XAPI_UNIT_ID` stays — it keys the localStorage fallback and matches the catalogue; Kata's State API never sees it |

The navigation code is not deleted. It runs only under **`DEV_NAV`** (`unit-js/10-identity.js`):
`?dev=1` in the URL **and no `?registration`**. Every Kata launch URL carries a registration,
so a launch URL with `&dev=1` appended still behaves as production; navigation is possible
only on a page nobody's learning is recorded on — the local walkthrough and `index_dev.html`,
whose harness flag in the loader now reads `DEV_NAV` too. Inside `leaveToPart` the pointer
write and the hop sit in one `if (DEV_NAV) { … }`; the `completed` never depends on the flag.

`completed` was already the learner's **last click** in every component here — the
`PART_LAST` screen's check/continue button (`lastScreenButton()`) — so nothing had to be
re-ordered, unlike `mass-measure-02` and `scale-01`.

Asserted by `_test/verify-report.js` (`routing`, `devnav`, and the rewritten `seam` rows)
and `_test/statement-flow.js` (`exit`: production `leaveToPart` reports once, moves no pointer,
records no edge, disables the button; under `?dev=1` the old handover still works; part 06's
finale sends item + component and nothing unit-scoped). **Not observed:** Kata removing a
component on `completed` — our content never let it happen. If Kata does not act, the learner
sees a disabled button and nothing else; visible on the first integration run.

### One document per component (2026-09-16, state v6)

Two platform statements fixed the model. **MOE:** the platform remembers per learner which
components are done, not started or in progress, and brings the learner back to *the last component
in progress*. **Kata:** the `registration` our content saves State under is a **{user, component}**
pair — a different one per component for the same learner — and the platform may **clear one
component's State** on a repeat entry (a re-take of an assessment component).

The wire was already per component (`xapi-720-k.js` addresses Kata's State API by `?registration`
alone, and since *The platform owns routing* no part copies its query into another). The document's
**content** was still unit-shaped — a landing pointer `part`, a back-edge map `prev`, `parts{}` with
every part's payload — and that shape hid a live defect: `applyUnitProfile` read a null
`ui.character` as "no character", nulled the in-memory value and **deleted the localStorage
mirror**, so under Kata every part ≥ 02 opened with the default companion and destroyed the choice
for the parts after it.

| | before | after |
|---|---|---|
| the document | `{ v:5, part, parts{}, prev{}, done, doneItems, hints, picks, ui, results }` — one per unit | `{ v:6, component, payload, done, doneItems, hints, picks, ui, results }` — **one per part**; `component` checked on every read, another part's document discarded with `console.warn`; **v5 migrated in place** (`payload = parts[<this slug>]`, ledgers/character/results kept) |
| `RESUME_STATE_ID` | `'execution-state'` | `'execution-state::<slug>'` — the localStorage fallback (`?dev=1`, no registration) is one slot per part too |
| the companion character | `applyUnitProfile`: document → memory + mirror, **deleting** the mirror on null | `adoptUnitCharacter`: own document → same-browser mirror → default; a mirror hit is copied into this part's document (persisted in phase B); the mirror is **never deleted**; `?resetState` adopts nothing |
| `writeForwardState` / `goBackToPreviousPart` (`?dev=1` only) | moved the landing pointer, wrote `prev`, seeded the destination, refused to navigate on a failed write | record the `sessionStorage` edge, save **this** part, navigate. `destFirstScreen` stays in the signature and is ignored |
| re-take (Kata clears the document) | untested | fresh attempt: nothing restored, ledgers empty (`completed` again — intended), the empty `results` section beats the localStorage mirrors. Tested (`retake`) |

**Known cost, accepted:** a learner who switches devices mid-unit sees the default companion in parts
not yet opened on the new device. Reading part 01's document by `studentId+componentKey` was
neither asked of Kata nor built.

Every `?v=` in the unit moved with the version (the rule above). Tests: `shape` / `isolation` /
`retake` / `character` in `_test/verify-report.js`; the seam assertions now read the edge map and
this part's own document.

### Open before release

1. **Three screens report one catalogue question out of a run of several.** The
   applets grade a whole screen with one verdict, while the catalogue declares a
   question per input. Unreported today: `02-003/q2 + q4` (s17/s18), `03-001/q2..q5`
   (s21), `03-002/q2..q4` (s22), `03-004/q2 + q4` (s24/s25). The code reports the
   FIRST id of each run rather than asserting per-input results it never computed.
   Splitting them into per-input statements is a grading change — a learning-developer
   call, not a realignment one. See the `XAPI_QMAP` header in any `script.js`.
2. **Two content/code mismatches**, reported rather than patched — both are content
   calls, and both are commented at the `partResult()` that depends on them:
   component 02's screen 13 promises "3 תרגילים ... 2 לפחות" while six graded screens
   and a six-station strip were built; component 06's screen 37 promises "3 סעיפים"
   while שאלת השיא has four parts (א/ב/ג/ד) — and the script's own item title says
   "(4 סעיפים)".
3. **The two draft gates above**, plus the draft catalogue fields in `metadata/`.
4. **The companion character now shows on screen 0 after a reload.** It used to always
   start unselected; the state document is now the source of truth. Worth confirming
   with the producer.
5. **A real Kata run** with `?slxapi` + `?registration`. Stubs prove payload shape,
   never delivery.
6. **Kata's hand-off on `completed`** — asserted from the spec, never seen (above).

**Deploy all six components atomically.** They are separate deployables, and a
component left on an older state-document version beside v6 components writes a
document the others discard and rewrite — a reset loop that wipes the `done` ledger
each cycle and re-sends `completed` every time. The same applies to a rollback.

> **v5 → v6 (2026-09-16) migrates in place** — see *One document per component*. The earlier bump:
>
> **The v4 → v5 state bump discards every document in the field.** That is deliberate:
> a v4 document is keyed by the OLD four part slugs over the OLD screen ranges, so its
> `parts`, `prev`, `done`, `doneItems` and `results` all name components whose content
> has moved. Reading one back would land a learner on a screen the part no longer owns.
> Every `?v=` on `unit-js/*.js` moved 2 → 3 in the same change, for the same reason.

## Deployments

`deployments/` sits **outside** this repo, beside `git-repo/`, and is not version-controlled.
`git status` here will never mention it and `git checkout` can never bring it back — which is why
the tooling below exists.

### Build and verify with the tools, not by hand

Three PowerShell 7 scripts in `docs-and-tools/`, byte-identical to
`methodica-math-ratio-02`'s — both units have had the same shape since the 2026-09-07 asset hoist,
so one definition covers both:

| script | what it is |
|---|---|
| `package-allowlist.ps1` | the **single** definition of what ships. Dot-sourced by the other two; not runnable alone. |
| `build-package.ps1` | cuts a package containing exactly that, then verifies its own output |
| `verify-package.ps1` | asserts an existing package **is** exactly that, at any later date |

```bash
pwsh -File docs-and-tools/build-package.ps1 -DryRun    # what ships, and what does not
pwsh -File docs-and-tools/build-package.ps1            # cut today's package
pwsh -File docs-and-tools/verify-package.ps1           # re-check the newest package, any time
```

Both tools read the one allowlist, so a package cannot be built to one definition and checked
against another. `verify-package.ps1` exits 0/1 and runs four checks: **FORWARD** (every packaged
file byte-identical to the tree), **REVERSE** (every file the allowlist says should ship is
present), **HYGIENE** (no secret or dev file), **COMMIT** (tree clean, and no *shipped* file changed
since the commit `DEPLOY.md` names). REVERSE is the one a plain diff misses — a file *added* to the
tree after a package was cut is invisible to a forward-only comparison and ships as a 404.

Worth knowing before you run them:

- ⚠️ **Allowlist, never denylist.** `docs-and-tools/` holds `kata-api-key.txt`; one missing denylist
  entry would publish a live key. `-DryRun` prints the excluded set too — read that half, it is
  where a secret would hide if a rule were wrong.
- The builder **refuses a dirty tree** (a package must be reproducible from a commit) and **refuses
  to overwrite a non-empty target without `-Force`**. `-Force` preserves `DEPLOY.md`, the one file
  in a package written by hand and not reproducible from the tree.
- `DEPLOY.md` must keep its ``commit **`<sha>`**`` line — `verify-package.ps1` parses the first such
  match to tell a current package from a stale one.

### Packages on disk

- **`2026-09-07/`** — current. 85 files, 9,028,381 bytes ≈ 8.6 MiB, built by `build-package.ps1`
  from commit `3af6eeb` and verified: 84/84 both directions, zero drift, **zero duplicate blobs**.
  The first package without the six-fold asset duplication — 32,184,462 bytes smaller than
  `2026-09-03`, a 78.1% reduction, with no content removed. Ships `unit-css/` and `unit-assets/` as
  new top-level folders; five of the six component folders no longer have an `assets/` folder at
  all. See its `DEPLOY.md`.
- **`2026-09-03/`** — superseded. 310 files, 39.3 MB, byte-verified against commit `e99b9e6`
  (the merge of the v2.5 metadata work with the client-QA round). Six components; metadata at
  MOE v2.5 with all 42 `questions[]`; state document v5; `?v=3`; screen 0's character cards are
  video. Assembled from an **allowlist**, not by exclusion — `docs-and-tools/` is tracked now
  and holds the Kata API key, so a forgotten exclusion would ship a live secret. The only files
  under `assets/` deliberately withheld are the two 2.6 MB video **source masters** in
  `_source-originals/`, which nothing references. See its `DEPLOY.md`.
  *(Re-cut in place after `main` was merged; an earlier same-date package built against
  `5072926` was never uploaded and has been replaced.)*
- `2026-09-02/` — the **four**-component build at `80f588a`, superseded. Never uploaded.

**None of the three has been uploaded to the CDN**: every `math/ratio/01/…` path still returns HTTP
200 with **0 bytes**, re-measured 2026-09-07 against a deliberately bogus path and a live control.
That CDN answers 200 for absent paths, so verify an upload by **byte size**, never by status code —
and check `unit-css/styles.css` and one file under `unit-assets/` specifically, since those are the
two an upload checklist written before the asset hoist would silently omit.
