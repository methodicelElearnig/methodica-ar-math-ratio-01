# `_test/` — headless regression oracle

**Not deployed.** Development tooling only — exclude the whole folder from any release
package, **including the stub library**. `xapi-720-k.js` shares a basename with the
real CDN library by design (the `XAPI_USING_G` gate reads the filename), and in a
sibling project the stub was once pushed under the library's name.

That is no longer left to whoever cuts the package. `docs-and-tools/package-allowlist.ps1`
excludes this folder twice over — `_test` by name, and any path segment starting with an
underscore — and `verify-package.ps1`'s HYGIENE check scans a finished package for `_*`
again, so the stub reaching a release now fails a script rather than a code review.
Neither guard replaces the rule; they just stop it depending on memory.

## What is here

| File | What it does |
|---|---|
| `verify-report.js` | **Structure.** 1882 assertions. Loads the real `index.html`, `script.js` and every `unit-js/*.js` of all six components into jsdom, runs the script tags in document order from disk, and asserts against what actually ran. It does not call the code in isolation — it runs it. |
| `statement-flow.js` | **Behaviour.** 63 assertions. Which statements actually leave when a learner does something, in what order, carrying what result — and, more importantly, which ones do **not** leave when the same screen is reached again by a reload or the back button. |
| `xapi-720-k.js` | A local stand-in for the CDN library, backed by `sessionStorage`. Loaded in the browser through `?xapiLib=`, and executed directly by both harnesses. It also models the real library's **deferral guard** — an item's `completed` is dropped, with no queue and no retry, unless an `answered` for that item passed through in the same page load. Keep it: without the guard the suite is blind to a whole class of permanently lost statements, which is how one survived every assertion here until it was found live against Kata. |

## Running

jsdom is not in the repo and there is no `package.json`. **Do not install it inside
the project folder** — it sits in a synced OneDrive directory, and jsdom's
`node_modules` is around 26MB that would be synced for nothing. Install elsewhere and
point `NODE_PATH` at it:

```bash
mkdir -p /tmp/lomda-test && cd /tmp/lomda-test && npm install jsdom
```

Then from the unit root:

```bash
NODE_PATH=/tmp/lomda-test/node_modules node _test/verify-report.js && NODE_PATH=/tmp/lomda-test/node_modules node _test/statement-flow.js
```

Exit 0 means everything passed; failures print as a list at the end. Both accept an
alternative base path as the first argument; without one they assume their own parent
directory.

### Pointing the suite at a deployment package

That base-path argument is worth using before an upload: it asserts against the bytes
that will actually ship, not against the tree they were copied from.

```bash
NODE_PATH=... node _test/verify-report.js ../../deployments/2026-09-07
```

⚠️ **Expect failures, and know which ones are fine.** A package deliberately excludes
development files, and some assertions here need them. Against the 2026-09-07 package:
**1674 pass, 10 fail** — one `[lib]` assertion that wants `_test/xapi-720-k.js`, eight
`[devhar]` assertions that want the six `index_dev.html`, and one `[resume]` assertion on
the s17 wrong-answer title. The first nine are absent by design, so those failures are the
exclusions *working*. The tenth is not an exclusion: that package predates the 08.09
client-QA round and still carries the old title copy, so it is **superseded**, not broken.

The total is lower than a working-tree run for two duller reasons. A package holds only
`DEPLOY.md`, which carries no links, so the `docs resolve` section has nothing to check and
contributes 25 fewer assertions. And that package predates the hoist of the warm-up clips to
`unit-assets/video/`, so the twelve `css + html assets resolve` assertions those references
add never run. 1674 + 10 + 25 + 12 = 1,721 — the working-tree total **at the time that
package was cut**. Today's tree runs 1876 (2026-09-16: the routing and per-component-state groups were
added; the 09.2026 unit-score fix had deleted `unitResult()` and six `PART_HOOKS` assertions).

So this run is a useful cross-check, not a gate — read the failure list rather than the
exit code. The gate for a package is `docs-and-tools/verify-package.ps1`, which knows
what a package is meant to contain and exits 0 on a good one.

> ⚠️ If you do install locally anyway, install every package in **one** command.
> `npm install X --no-save` in a folder with no `package.json` can **remove** a
> package installed earlier in that same folder.

> ⚠️ A POSIX `NODE_PATH` works only because Git Bash translates it when **it** launches
> node. Anything else spawning node (a Python subprocess, a CI runner) must pass a
> native path, or node reads `/tmp/...` as `C:\tmp\...` and cannot find jsdom.

## What each suite covers

`verify-report.js`:

| Area | What is asserted |
|---|---|
| **The regression gate** | With no `?slxapi`: `sendStatement720` does not exist, and `xapiOnScreen`, `xapiCompleteComponent`, `xapiEndComponent` and `reportHint` are inert no-ops that do not throw — while `xapiAnswered` still records the score, so scoring and routing behave identically with reporting off. Note the guarantee is *not* that `XAPI_USING_G` is false: `bootXAPI` derives it from the library filename synchronously, so it is legitimately true while nothing has loaded. |
| **The shared layer** | All 46 shared functions and all 16 per-component hooks exist in every component; `script.js` precedes `90-boot.js` and `90-boot.js` is the last tag. |
| **The deploy contract** | Every shared file carries an identical `?v=` in all six components; the library letter the loader names is one the `XAPI_USING_G` regex accepts; no library copy is shipped outside `_test/`. |
| **The six `script.js` are twins** | Everything below `var RESUME_PLAIN_VARS = [` is **byte-identical** across all six. This is what makes the 6× duplication safe: an edit that lands in one component and not the others is otherwise silent, because each component only ever runs its own screens. |
| **The screen map** | Each component's `SCREEN_TO_SUBCONTENT` covers exactly its own `[PART_FIRST..PART_LAST]` range, with **numeric** keys, no holes; the DOM holds exactly those screens; `_goToCore` on a screen the component does not have is a silent no-op. |
| **Metadata agreement** | Trailing slashes at unit/component/item level; `XAPI_COMP_ID` equals the metadata component id; every mapped item exists in the catalogue and every catalogue item is reachable from a screen; every graded item supplies an explicit item result; and the **2.5** field names are intact — `targetSectors`, single-value `targetAudience`, `cognitiveLevels`, unit-level numeric `manufacturer`, no `prerequisiteLearningObjective` — with the 2.4 names asserted absent. |
| **The question map** | All 29 graded questions resolve, each in exactly one component, with no key claimed twice, and **every reported key names a `questionId` the catalogue declares**. That last check replaced a `q1..qN with no gaps` rule, which was the right test only while `metadata/` had no `questions[]`: three screens legitimately resolve one id out of a run of two to five, because the code computes a single verdict over the whole screen. |
| **Flush on commit** | Every function that commits an answer flushes the resume state synchronously, brace-matched per function rather than grepped — the reference unit found 13 of 25 committing functions with a correct-answer branch that returned before a tail flush, and a grep for the call passed all 13. |
| **The painters** | `restoreScreenUI(n)` never throws, for every screen of every component, on a clean load — and is idempotent. |
| **Resume round-trips** | Answer through the real handlers, capture, wipe the way a reload does, apply back, and assert the answer is in the variables *and* on the screen. Covers a correct answer, an unresolved wrong attempt (including the retry lock), a final wrong answer where `done !== correct`, the applet whose reveal overwrites the learner's counts, screen 4's four embedded questions, the guided example, the class task's free text, and back-navigation onto an answered screen. |
| **The cross-part seam** | The `sessionStorage` hop is gone; `leaveToPart` ends the component via `xapiEndComponent(res, lastScreenButton())` and hops **only inside `if (DEV_NAV)`**; `finishUnit` reports the component only; the back edge routes through `goBackToPreviousPart`; every jump carries `window.location.search`; the duplicate dev bridge is gone. |
| **The platform routes** (`routing`, `devnav`, 2026-09-16) | Source scan of every shipped script: no `xapiCompleteUnit(` and no `scope: 'unit'` outside comments; every `location.href =` / `location.replace(` gated on `DEV_NAV`; the loader's resume hop gone and its harness flag reading `DEV_NAV`; `DEV_NAV` needs `?dev=1` **and** no `?registration`; `hideCrossPartBack` sets the attribute **and** inline `display:none` (the attribute alone lost to `.scq-back`'s own display rule in a sibling unit). Live production boots of all six parts: `DEV_NAV === false`, `xapiCompleteUnit` undefined, `lastScreenButton()` resolves, and for 02–06 the `PART_FIRST` screen's "חזרה" is hidden, `goBackToPreviousPart()` moves nothing, `goTo(PART_FIRST - 1)` stays put. Three boots of part 03: no query / `?dev=1` / `?dev=1&registration=r1`. |
| **The report layer** | The shared 720 endpoint and all eleven `entry.*` keys are unchanged; form-encoded, `no-cors`, failure cannot block the learner; delegation wiring; all three dialogs present and shipping hidden. |
| **The boot cover** | Present, inline-styled, a sibling of `#app`, with a dependency-free failsafe whose ceiling matches the loader's 10s metadata poll. |
| **The ledger** | `sendStatementOnce` bails out entirely while restoring and does so *first*; checks before sending; marks only after; `markSent` persists synchronously; all four ledgers exist; `initialized` is not guarded; the document is at v5. |

`statement-flow.js`: a fresh load; answering (verb, result, `student_answer`, and the
v2.4-mandatory `parent`); a non-final wrong attempt vs. the resolving one; hint
dedupe including across a reload; **no duplicate `completed`** across a forward walk,
a backward walk and a reload; the component `completed` with an explicit result — and
nothing unit-level: the production `leaveToPart` reports once, moves no pointer and
disables the button, the `?dev=1` twin still hands over, and part 06's finale sends item
+ component only; a resumed session emitting exactly one item `initialized` and nothing else;
the `#screen=` override restoring state while choosing its own landing screen; and
the regression gate asserted behaviourally, by driving a real answer and confirming
nothing reached the network.

## Negative-test everything you add

An assertion that cannot fail is worse than none. Both suites have been checked by
breaking one thing at a time and confirming the right suite catches it. Three of the
first eleven attempts did **not** fail, and each taught something:

- **Reordering the `_restoring` and `alreadySent` guards is nearly a no-op** — nothing
  is sent or marked either way. The mutation that matters is *removing* the guard. The
  assertion now also pins the order.
- **Clearing the `XAPI_HINTS_SENT` memory latch does not duplicate a hint** — the latch
  is only a fast path; the document's `hints` ledger is the guarantee. The mutation has
  to break the ledger call.
- **The query-string assertion was dead**: it looked for `location.replace =`, an
  assignment, while the code is a call. It now checks every navigation whose target
  mentions `index.html`.

A mutation applied to one component alone trips the twins assertion first and masks
whatever was under test, so shared-layer mutations belong in all six.

## What these suites cannot cover

- **Appearance.** They assert classes, text and disabled flags, not pixels. The
  painted states and the RTL layout still need a browser pass.
- **Scroll gates.** jsdom reports every element as zero-height, so screen 1's and
  screen 4's scroll gates cannot be exercised.
- **Delivery.** Stubs prove payload shape, never delivery. Reporting and resume are
  not verified until they run against Kata with a real `?slxapi` + `?registration`.
- **The page number in `SCREEN_TO_SUBCONTENT`.** Both suites read the item (the first
  element) and nothing reads the second. Moving a screen between two ADJACENT items —
  e.g. giving component 03's screen 26 to item `004` as its third page instead of to
  `005` as its first — changes neither the set of items nor the order they are
  crossed in, so every assertion still passes. Only the issue-report form would show
  it, as a learner problem filed against the wrong item. Negative-tested and confirmed
  during the six-רכיב re-cut (03.09.26); a mutation that makes an item *unreachable*
  is caught by four assertions across both suites.
