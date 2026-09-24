# `unit-js/` — the shared layer

One copy of every behaviour that is the same in all **six** components of this unit. Each
`methodica-ar-math-ratio-01-0N/script.js` keeps only that component's configuration and screen logic,
and fills in the hook contract below.

The layer implements three features: **xAPI (720) reporting**, **learner problem reporting**
("מצאתם בעיה?") and **resume** (the xAPI State API). It is vendored from
`methodica-math-scale-01`, which is the reference implementation.

Companions:
[`ADDING-REPORTING-AND-RESUME.md`](../../../../Documentation/reporting-and-resume/ADDING-REPORTING-AND-RESUME.md)
— the authoritative guide ·
[`KNOWN-ISSUE-dismissal-state-write.md`](../../../../Documentation/reporting-and-resume/KNOWN-ISSUE-dismissal-state-write.md)
— open, accepted, do not "fix"

MOE standard: **metadata v2.5** (adopted 03.09.26 — live Kata implements 2.5 and its
OpenAPI has no 2.4 field names at all); **xAPI v2.4**, which v2.5 did not change beyond
requiring the `X-Experience-API-Version: 1.0.3` header the CDN library already sends.

---

## Load order

Every part's `index.html` ends with exactly this, in this order:

```html
<script src="../unit-js/10-identity.js?v=3"></script>
<script src="../unit-js/15-ui.js?v=3"></script>
<script src="../unit-js/20-xapi.js?v=3"></script>
<script src="../unit-js/25-report.js?v=3"></script>
<script src="../unit-js/28-feedback-drag.js?v=3"></script>
<script src="../unit-js/30-nav.js?v=3"></script>
<script src="../unit-js/40-resume.js?v=3"></script>
<script src="../unit-js/50-loader.js?v=3"></script>
<script src="../unit-js/60-devbridge.js?v=3"></script>
<script src="script.js?v=N"></script>              <!-- per-part: DEFINITIONS + CONFIG ONLY -->
<script src="../unit-js/90-boot.js?v=3"></script>  <!-- the ONLY side effects -->
```

**What the numeric prefixes mean.** There is no module system here — eleven `<script>` tags execute
in document order, and without the prefix the only record of that order would be six separate
`index.html` files. The number puts it next to the code, and counting by 5s and 10s leaves room to
insert a file without renumbering. **What they do not mean:** nothing reads them, and because every
file except `90-boot.js` is definition-only, the order among `10-`–`60-` is nearly arbitrary in
practice. Only two positions carry real weight — `script.js` before `90-boot.js`, and `90-boot.js`
last.

> **`?v=` invariant.** All six `index.html` reference the same shared URLs, so a given shared
> file's `?v=` **must be identical in all six**. A mismatch means one part fetches a second copy
> under a different URL, and two parts can execute different versions of the same logic inside one
> learner session. Per-part `script.js?v=` may differ freely.

The 720 xAPI library is **not** in this repo. `50-loader.js` fetches it at runtime from
`https://lomdot.education.gov.il/metodica/720active/common/`, choosing `xapi-720-k.js` because
`RESUME_ENABLED` is `true` (`-i` is the non-State build). It is a **shared, cross-unit** file:
never ship a copy, and treat any library change as affecting every 720 lomda that loads it.

---

## The hook contract

Every `script.js` must define these. The shared layer reads them **at call time**, never at load
time, which is why `script.js` may load after the shared files.

### Configuration

| Name | Kind | Read by |
|---|---|---|
| `TOTAL_SCREENS` | number (46 — unit-wide, see below) | `goTo`, `applyExecutionState` |
| `PART_FIRST`, `PART_LAST` | number | that part's `goTo` wrapper, `partBoot` |
| `currentScreen` | number (owned by `30-nav.js`) | `submitReport`, resume |
| `SCREEN_TO_SUBCONTENT` | object, numeric keys | `xapiOnScreen`, `submitReport` |
| `XAPI_COMP_SLUG`, `XAPI_COMP_ID` | string | `xapiItemId`, `xapiQ` |
| `XAPI_EVAL_ITEMS` | object | `xapiOnScreen`, `xapiFinishItems` |
| `XAPI_METADATA_FILE` | string | `bootXAPI` |
| `XAPI_ITEM_RESULT` | object, *optional* | `xapiItemResult` |
| `RESUME_PLAIN_VARS` | array | that part's own capture/apply |
| `RESUME_INPUT_IDS`, `RESUME_TEXT_IDS` | array | that part's own `applyResumeDom` |

### Functions

| Name | Notes |
|---|---|
| `resetScreenState(n)` | dispatches to the screen's `sNEnter()`; runs **before** the screen is shown |
| `restoreScreenUI(n)` | repaints an answered screen; **must be exception-safe** and must never mutate state or send a statement |
| `capturePartPayload()` | returns this part's payload, including `currentScreen` |
| `applyResumeVars(st)` | **the parameter must be named `st`** — see the warning below |
| `applyResumeDom(st)` | restores answers that live only in the DOM |
| `partBoot()` | *optional* — anything only this component needs at startup |
| `onXapiReady()` | *optional* — part 01 only; opens the unit metadata and emits the unit `initialized` |

> ⚠️ **`applyResumeVars`'s parameter must stay named `st`.** It runs
> `eval(k + ' = st.vars[k];')`, which resolves `st` lexically. Renaming it fails **silently**: the
> assignment throws, the surrounding `try/catch` swallows it, and the learner's answers quietly
> vanish. Nothing enforces this.

### What the layer provides in return

`20-xapi.js` — `xapiAnswered`, `xapiRequestedHint`, `xapiCompleteComponent`, `xapiCompleteUnit`,
`xapiOnScreen`, `xapiFinishItems`, `xapiQ`, `xapiAnswerText`, `xapiFieldsAnswer`, `xapiMultiAnswer`,
`xapiZoneAnswer`, `XAPI_Q_RESULTS`, `xapiCorrectCount`, `xapiWireVideos`.

`40-resume.js` — the v6 state document (one per part: `component` + `payload`; `migrateState`
from v5), four statement ledgers (`done` / `doneItems` / `hints` / `picks`) via `sendStatementOnce` /
`sendCompletedOnce`, the part's own `ui`/`results` (`getUnitCharacter` / `setUnitCharacter` /
`adoptUnitCharacter`, `getUnitResult` / `setUnitResult`), `writeForwardState` /
`goBackToPreviousPart` (`?dev=1` only), `scheduleResumeSave` / `flushResumeSave`,
`resumeIsPainting`, `dropBootCover`, `initResumeResetHatch`.

`30-nav.js` — `currentScreen`, `goTo(n)`, `applyExecutionState(st, screenOverride)`.

---

## Why boot order is explicit

`90-boot.js` is the only file here with top-level side effects, and its order is load-bearing:

1. **`initResumeResetHatch()` first** — it rewrites the URL and raises the reset flag, so it must
   run before anything reads the query string or touches the state document.
2. **`scaleApp()` before `initFeedbackDrag()`** — the latter's `getAppTransform()` parses
   `#app.style.transform`, which does not exist until `scaleApp` has written it.
3. **`initFeedbackDrag()` must be the last thing that wraps `goTo`.** It replaces `window.goTo`
   with a wrapper; because a top-level `function goTo(){}` is also a window property, a bare
   `goTo(n)` call anywhere then reaches the wrapper too. Anything installed after it is bypassed.
4. **`partBoot()` before `bootXAPI()`** — a component's own wiring must be in place before a
   resume can replay onto it.
5. **`hideCrossPartBack()` after `partBoot()`** — the `PART_FIRST` screen's "חזרה" is hidden
   unless `DEV_NAV` (`10-identity.js`); the platform owns routing since 2026-09-16 (root
   `README.md`).
6. **`bootXAPI()` last.** (Until 2026-09-16 it could `window.location.replace()` to another
   component — the resume hop, now removed.)

No `DOMContentLoaded` wrapper is needed: `90-boot.js` sits immediately before `</body>`.

---

## This unit's deviations from the reference

Four, all deliberate. Anything else differing from `methodica-math-scale-01/unit-js/` is drift.

1. **Screen numbering is unit-wide, 0–45**, and `TOTAL_SCREENS = 46` in all six parts, while each
   part's DOM holds only its own slice (`-01` 0–12, `-02` 13–19, `-03` 20–29, `-04` 30–32,
   `-05` 33–36, `-06` 37–45 — the script's six רכיבים). What makes this safe is `goTo`'s
   null-screen guard: part 04 calling `goTo(40)` is a silent no-op.
   Two consequences:
   - `SCREEN_TO_SUBCONTENT` covers each part's own `[PART_FIRST..PART_LAST]` range, **not**
     `0..TOTAL_SCREENS-1`. The completeness check in `_test/` asserts against that range.
   - `writeForwardState(destSlug, returnHash, destFirstScreen)` takes a **third argument** here.
     The reference seeds a never-visited destination with `{ currentScreen: 0 }`, which under
     unit-wide numbering points at a screen the destination does not own.
2. **`scaleApp()` uses a 1280×710 grid with fluid width and `left = 0`** (`15-ui.js`), not the
   reference's 1280×720 centred canvas. This unit's chrome is anchored to the canvas edges and must
   reach the real screen edges.
3. **`NAV_EDGE_KEY = 'lomda_nav_edges::methodica-ar-math-ratio-01'`** — it must carry the unit slug.
   Two units sharing this key share a ledger and silently suppress each other's reports.
4. **`XAPI_ID_PREFIX`** and `window.XAPI_UNIT_ID` in `10-identity.js`. Ids carry **trailing
   slashes** at unit, component and item level (question ids do not), matching `metadata/*.json`
   byte-for-byte.

`REPORT_FORM_ACTION` is **not** a deviation: one Google Form serves all of 720, by the content
owner's decision of 2026-08-13. Rows are disambiguated by the unit-slug and component-slug fields,
both read from `window.METADATA`. Do not create a per-unit form and do not rename a `REPORT_FIELDS`
key — that would break every unit reporting to the same form.

---

## Adding to the shared layer

Two rules, both of which exist because failures here are silent:

**No identifier may be declared at top level in both a shared file and a part file.** A
`let`/`const` collision is a loud `SyntaxError`, but a **`var`/`function` collision is a silent
last-wins overwrite** — and `script.js` loads *after* the shared files, so a leftover part-local
copy wins and the extraction looks successful while shipping the old code. Check it from the repo
root:

```bash
node -e "const fs=require('fs');const s=new Map();fs.readdirSync('unit-js').filter(f=>f.endsWith('.js')).forEach(f=>fs.readFileSync('unit-js/'+f,'utf8').split('\n').forEach(l=>{const m=l.match(/^(?:function|var|let|const)\s+([A-Za-z0-9_$]+)/);if(m)s.set(m[1],f)}));['01','02','03','04'].forEach(p=>{const h=[];fs.readFileSync('methodica-ar-math-ratio-01-'+p+'/script.js','utf8').split('\n').forEach((l,i)=>{const m=l.match(/^(?:function|var|let|const)\s+([A-Za-z0-9_$]+)/);if(m&&s.has(m[1]))h.push(m[1]+'@'+(i+1))});console.log(p+': '+(h.length?h.join(', '):'clean'))})"
```

Hook names are the expected exceptions.

**When components disagree, take the superset and prove it inert.** Adopt the newest version plus
any guard another part added, then verify the difference cannot fire elsewhere. Do not average two
drifted copies.

---

## Files

| File | Purpose |
|---|---|
| `10-identity.js` | The unit's canonical id prefix, unit id, `shortId()`, `RESUME_ENABLED`, `DEV_NAV` (`?dev=1` and no `?registration` — the only state in which the unit navigates between parts). The main per-unit seam. |
| `15-ui.js` | `announce()`, `scaleApp()`, image zoom, `initA11yWiring()`, small shared helpers. |
| `20-xapi.js` | Item scope, question-id resolution from metadata, every statement-building call-site helper — including `xapiEndComponent` (report, then disable the button), which replaced `xapiCompleteUnit` on 2026-09-16. |
| `25-report.js` | The whole "מצאתם בעיה?" layer: three dialogs, validation, custom select, Google-Forms transport. |
| `28-feedback-drag.js` | `initFeedbackDrag()` — scale-aware draggable feedback popups. Wraps `goTo`; must stay last. |
| `30-nav.js` | `currentScreen`, `goTo()` (navigation + item scope + repaint + resume save), `applyExecutionState()`. |
| `40-resume.js` | The v6 state document — one per part (`component` + `payload`, v5 migrated in place), the four ledgers, the part's own `ui`/`results` with `adoptUnitCharacter`, cross-part edges (`?dev=1` only) and `hideCrossPartBack`, boot cover, reset hatch. |
| `50-loader.js` | `bootXAPI()` — CDN load, three gates, capped metadata poll, two-phase resume read (the cross-part hop was removed 2026-09-16), component `initialized`. |
| `60-devbridge.js` | `initDevBridge()` — the `postMessage` bridge to `index_dev.html`. Not deployed-facing. |
| `90-boot.js` | The only file with top-level side effects. Fixed startup order. |

Sibling unit-level folders: **`unit-css/styles.css`** is the one stylesheet for the unit,
linked by every component as `../unit-css/styles.css?v=N`. **`unit-assets/`** holds
everything more than one component uses — `fonts/` (the Assistant faces) and `img/` +
`img/hint/` (the 44-file shared image set), reached as `../unit-assets/…`.

⚠️ The `@font-face` `url()` resolve from the **stylesheet's** directory, `unit-css/`, not
from the component page that links it — hence one `../`, and hence the strings did not
change when the stylesheet moved up.

**The asset rule:** anything more than one component uses is in `unit-assets/`. A bare
`assets/…` reference means a file genuinely belonging to that one component — after the
hoist, only component 01's two selection clips.

⚠️ **Do ship `unit-css/` and `unit-assets/`**, as siblings of the six part folders.
Omitting `unit-css/` ships a unit with no stylesheet; omitting `unit-assets/` ships one
with no fonts and no images. Neither announces itself, and the CDN answers 200 with 0
bytes for paths that do not exist, so a status check will not catch it.

**Never ship** `index_dev.html`, `README.md`, `_test/` (**including its stub library** — it shares a
basename with the real one by design), `docs-and-tools/` or `.git/`. **Deploy all six parts
atomically** — together with `unit-js/`, `unit-css/` and `unit-assets/`: a part left
on an older state-document version beside v6 parts writes a document the others discard and
rewrite, a reset loop that wipes the `done` ledger each cycle and re-sends `completed` every time.
The same applies to a rollback.

### None of that is yours to remember any more

What ships is defined in **`docs-and-tools/package-allowlist.ps1`** and enforced by two scripts that
both read it, so a package cannot be built to one definition and checked against another:

```bash
pwsh -File docs-and-tools/build-package.ps1 -DryRun    # what ships, and what does not
pwsh -File docs-and-tools/build-package.ps1            # cut today's package
pwsh -File docs-and-tools/verify-package.ps1           # re-check any package, any time
```

Do not hand-copy a package, and do not keep a second copy of the rules anywhere — including in this
file. The list above is a description; the allowlist is the definition. If they ever disagree, the
allowlist is right and this paragraph is stale.

⚠️ Two things that specifically concern **this** layer:

- **`unit-js/*.js` ships, its `README.md` does not.** The allowlist takes `unit-js/*.js` and nothing
  else from this folder, which is why the file you are reading never reaches the CDN.
- **`unit-css/` and `unit-assets/` ship too**, as siblings of `unit-js/` and the six part folders. A
  package missing them is a unit with no stylesheet and no fonts — and the CDN answers 200 with 0
  bytes for absent paths, so a status check will not tell you. Verify an upload by **byte size**.

The full rundown — the four checks, the refusals, why `-Force` preserves `DEPLOY.md` — is in the
root `README.md` under *Deployments*.
