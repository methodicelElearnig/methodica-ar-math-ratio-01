'use strict';
/* ═══════════ methodica-ar-math-ratio-01-06 — component 6 of 6 of methodica-ar-math-ratio-01 ═══════════
   רכיב 6 — שאלת שיא  (script slides 59–66).

   The six components ARE the script's six רכיבים: every boundary here is a divider
   slide of מתמטיקה_יחס_יעד 1.1 (slides 2, 30, 38, 49, 53, 58), and every item id
   below is the מספר פריט printed on the slide it covers.

   Screens keep the unit's ORIGINAL global numbering (37–45); markup for other
   screens is absent and unit-js/30-nav's goTo() guard makes a stray number a no-op.
   Shared behaviour comes from ../unit-js (see its README); this file is this
   component's CONFIGURATION ONLY. The screen logic of all six components, and the
   hook contract, live in ../unit-js/70-screens.js, which loads right after it. */

var TOTAL_SCREENS = 46;                    // unit-wide numbering (goTo bound)
var PART_FIRST = 37;
var PART_LAST  = 45;

/* The components on either side of this one. Empty means an edge of the unit:
   PART_NEXT '' is the last component, PART_PREV '' the first. */
var PART_NEXT = '';
var PART_PREV = 'methodica-ar-math-ratio-01-05';

var XAPI_COMP_SLUG = 'methodica-ar-math-ratio-01-06';
var XAPI_COMP_ID   = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';
var XAPI_METADATA_FILE = '../metadata/methodica-ar-math-ratio-01-06.json';

/* screen -> [subContent suffix, page-in-item] */
var SCREEN_TO_SUBCONTENT = {37: ["001", 1], 38: ["001", 2], 39: ["001", 3], 40: ["001", 4], 41: ["001", 5], 42: ["001", 6], 43: ["001", 7], 44: ["001", 8], 45: ["001", 9]};

/* Items that carry a code-graded question. */
var XAPI_EVAL_ITEMS = { '001': 1 };


/* ═══════════════ xAPI — the per-component reporting seam ═══════════════
   Every graded question in the UNIT is listed once, keyed by its element-id prefix
   (which is what each check function already has in hand). The value is the screen
   plus the question key WITHIN its item.

   The ITEM is deliberately NOT listed here — it is read from SCREEN_TO_SUBCONTENT, so
   an xAPI statement and a learner problem report can never disagree about where the
   learner was standing.

   One map serves all six components because all six script.js are the same file:
   xapiKeyFor() returns null for a screen this component does not own (its
   SCREEN_TO_SUBCONTENT has no such key), so the entries for other components are
   inert here rather than wrong. */
/* ── qKeys are the catalogue's, not a running count ──
   Each value's second element is the questionId suffix inside THIS screen's item, as
   metadata/*.json declares it. Where one screen resolves several declared questions
   at once (the applets: one verdict over two inputs), the screen reports the FIRST id
   of that run and the rest go unreported rather than being asserted from a verdict
   that was never computed per input. Unreported today, listed so it is not lost:
   02-003/q2 + q4 (s17/s18 — the second flower of each bouquet), 03-001/q2..q5 (s21's
   rows ב–ה), 03-002/q2..q4 (s22's rows ב–ד), 03-004/q2 + q4 (s24/s25 — the sweets
   beside the bars). Splitting those into per-input statements is a grading change and
   belongs to the learning developer, not to this realignment. */
var XAPI_QMAP = {
  /* רכיב 1 */
  s1:   [1,  'q1'],                                     /* 001 */
  s2:   [2,  'q1'],  s3:   [3,  'q2'],                  /* 002 — מדבקות */
  s4q1: [4,  'q3'],  s4q2: [4,  'q4'],
  s4q3: [4,  'q5'],  s4q4: [4,  'q6'],                  /* 002 — screen 4's four */
  s12:  [12, 'q1'],                                     /* 004 — חימום */
  /* רכיב 2 */
  s14:  [14, 'q1'],                                     /* 001 — פיצות */
  s15:  [15, 'q1'],  s16:  [16, 'q2'],                  /* 002 — שוקולד */
  s17:  [17, 'q1'],  s18:  [18, 'q3'],  s19:  [19, 'q5'], /* 003 — זרים */
  /* רכיב 3 */
  s21:  [21, 'q1'],                                     /* 001 — צמצום */
  s22:  [22, 'q1'],                                     /* 002 — הרחבה */
  s23:  [23, 'q1'],                                     /* 003 — גרביים */
  s24:  [24, 'q1'],  s25:  [25, 'q3'],                  /* 004 — ממתקים */
  s27:  [27, 'q1'],  s28:  [28, 'q2'],                  /* 005 — פנקייקים */
  s29:  [29, 'q1'],                                     /* 006 — קינוחים */
  /* רכיב 5 */
  s34:  [34, 'q1'],  s35:  [35, 'q1'],  s36:  [36, 'q1'], /* 001 / 002 / 003 */
  /* רכיב 6 — שאלת השיא, סעיפים א/ב/ג/ד */
  s39:  [39, 'q1'],  s40:  [40, 'q2'],  s42:  [42, 'q3'],  s43:  [43, 'q4'],
};

function xapiKeyFor(sid) {
  var e = XAPI_QMAP[sid];
  if (!e) return null;
  var m = SCREEN_TO_SUBCONTENT[e[0]];
  if (!m) return null;                 /* another component's screen */
  return { item: m[0], qKey: e[1] };
}

/* One graded answer.
     isLast   'answered.last' — the final answer to this question, and the only verb
              that enters a score denominator. Every question in this unit allows two
              attempts, so it is uniformly `correct || attempts >= 2`.
     answer   the learner's answer text, as they see it. */
function reportAnswer(sid, correct, isLast, answer) {
  var k = xapiKeyFor(sid);
  if (!k) return;
  xapiAnswered(k.item, k.qKey, correct, isLast, answer);
}

/* A hint request. openHint() is the single choke point and it OPENS rather than
   toggles, so this cannot double-report on a close; xapiRequestedHint dedupes per
   question anyway, through the state document's `hints` ledger. */
function reportHint(sid) {
  var k = xapiKeyFor(sid);
  if (!k) return;
  xapiRequestedHint(k.item, k.qKey);
}

/* Every graded question belonging to one item, as XAPI_Q_RESULTS keys. */
function itemQuestionKeys(item) {
  return Object.keys(XAPI_QMAP).reduce(function (acc, sid) {
    var k = xapiKeyFor(sid);
    if (k && k.item === item) acc.push(item + '/' + k.qKey);
    return acc;
  }, []);
}

/* Item-level result for the item 'completed'. MOE v2.4 requires success + score on
   any item carrying answered interactions, and the library's own aggregation is an
   all-correct AND that would report success:false for a partial pass. Derived from
   XAPI_Q_RESULTS, so the item can never disagree with the answers already reported.
   0.6 is the threshold MOE's own example uses ("success true אם score > 0.6"). */
function itemResultFor(item) {
  var keys = itemQuestionKeys(item);
  if (!keys.length) return null;
  var ok = keys.filter(function (k) { return XAPI_Q_RESULTS[k] === true; }).length;
  var scaled = ok / keys.length;
  return { success: scaled >= 0.6, score: { scaled: scaled } };
}

/* Read by unit-js/20-xapi.js's xapiItemResult(). Built from XAPI_EVAL_ITEMS rather
   than written out per component, so all six script.js stay identical here. */
var XAPI_ITEM_RESULT = {};
Object.keys(XAPI_EVAL_ITEMS).forEach(function (it) {
  XAPI_ITEM_RESULT[it] = function () { return itemResultFor(it); };
});

/* ── Per-component score record ───────────────────────────────────
   Each graded component records its scaled score into the unit state document as it is
   left. Component 04 is the off-computer class task with nothing to grade and is
   excluded.

   ⚠️ NOT a statement input. These used to be averaged into the unit 'completed'; that
   average is gone — see finishUnit for why. They are kept as a durable per-component
   record: docs-and-tools/save-restore-state.html surfaces them, and ?resetState clears
   them through RESULT_KEYS in ../unit-js/40-resume.js.

   Values are STRINGS: getUnitResult falls back to localStorage when there is no
   document, and that store holds strings only. */
var UNIT_SCORE_KEYS = {
  'methodica-ar-math-ratio-01-01': 'ratio01_c01_scaled',
  'methodica-ar-math-ratio-01-02': 'ratio01_c02_scaled',
  'methodica-ar-math-ratio-01-03': 'ratio01_c03_scaled',
  'methodica-ar-math-ratio-01-05': 'ratio01_c05_scaled',
  'methodica-ar-math-ratio-01-06': 'ratio01_c06_scaled',
};

function recordPartResult(res) {
  var key = UNIT_SCORE_KEYS[XAPI_COMP_SLUG];
  if (!key || !res || !res.score) return;
  try { setUnitResult(key, String(res.score.scaled)); } catch (e) {}
}

/* ── This component's result ──────────────────────────────────────
   Reported on EVERY exit, including a failing one — a component the learner did not
   clear still has to be reported, or their whole attempt goes unrecorded. Routing a
   failing learner is the platform's job, via the component's recommendedAfterFail.

   One item — שאלת השיא, parts א/ב/ג/ד on screens 39, 40, 42, 43. The peak carries no
   progress strip, so its correctness lives only in XAPI_Q_RESULTS — which is exactly
   why xapiAnswered writes that map before its own XAPI_USING_G guard and outside its
   try: scoring behaves identically with reporting off.

   success is the peak's own stated gate, screen 37: "יש בה 3 סעיפים. עליכם לענות נכון
   על 2 לפחות." ⚠️ CONTENT/CODE MISMATCH, reported not patched: four peak parts were
   built (א/ב/ג/ד), not three, and the script's own metadata titles the item
   "(4 סעיפים)". The gate below reads "most of them" as 3 of 4, matching the reference
   unit's own peak rule. Which side is wrong is a content call. */
function partResult() {
  var peak = ['q1', 'q2', 'q3', 'q4'].filter(function (q) {
    return XAPI_Q_RESULTS['001/' + q] === true;
  }).length;
  return { success: peak >= 3, score: { scaled: peak / 4 } };
}
