'use strict';
/* ═══════════ methodica-math-ratio-01-05 — component 5 of 6 of methodica-math-ratio-01 ═══════════
   רכיב 5 — תרגול מתקדם  (script slides 54–57).

   The six components ARE the script's six רכיבים: every boundary here is a divider
   slide of מתמטיקה_יחס_יעד 1.1 (slides 2, 30, 38, 49, 53, 58), and every item id
   below is the מספר פריט printed on the slide it covers.

   Screens keep the unit's ORIGINAL global numbering (33–36); markup for other
   screens is absent and unit-js/30-nav's goTo() guard makes a stray number a no-op.
   Shared behaviour comes from ../unit-js (see its README); this file is this
   component's configuration + screen logic + the hook contract. */

var TOTAL_SCREENS = 46;                    // unit-wide numbering (goTo bound)
var PART_FIRST = 33;
var PART_LAST  = 36;

/* The components on either side of this one. Empty means an edge of the unit:
   PART_NEXT '' is the last component, PART_PREV '' the first. */
var PART_NEXT = 'methodica-math-ratio-01-06';
var PART_PREV = 'methodica-math-ratio-01-04';

var XAPI_COMP_SLUG = 'methodica-math-ratio-01-05';
var XAPI_COMP_ID   = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';
var XAPI_METADATA_FILE = '../metadata/methodica-math-ratio-01-05.json';

/* screen -> [subContent suffix, page-in-item] */
var SCREEN_TO_SUBCONTENT = {33: ["001", 1], 34: ["001", 2], 35: ["002", 1], 36: ["003", 1]};

/* Items that carry a code-graded question. */
var XAPI_EVAL_ITEMS = { '001': 1, '002': 1, '003': 1 };


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
  'methodica-math-ratio-01-01': 'ratio01_c01_scaled',
  'methodica-math-ratio-01-02': 'ratio01_c02_scaled',
  'methodica-math-ratio-01-03': 'ratio01_c03_scaled',
  'methodica-math-ratio-01-05': 'ratio01_c05_scaled',
  'methodica-math-ratio-01-06': 'ratio01_c06_scaled',
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

   Denominator: set D, the three advanced-practice stations promised on screen 33
   ("הגענו ל-3 שאלות של תרגול מתקדם") — one per item (ריבועים, משולש, שתייה).

   ⚠️ The script states no pass threshold for רכיב 5. The gate below is 2 of 3, the
   same "most of them" rule the peak uses and the same ratio screen 13 states for its
   own set. NEEDS THE LEARNING DEVELOPER'S CONFIRMATION. */
function partResult() {
  var d = 0;
  for (var i = 0; i < QSET_SIZE.D; i++) { if (qprogStationState('D', i) === true) d++; }
  return { success: d >= 2, score: { scaled: QSET_SIZE.D ? d / QSET_SIZE.D : 0 } };
}

/* ═══════════════ resume — the payload contract ═══════════════
   These three lists plus capturePartPayload / applyResumeVars / applyResumeDom /
   restoreScreenUI at the foot of this file are the whole per-component half of
   resume. The rest lives in ../unit-js/40-resume.js and 30-nav.js.

   Everything named here is a file-scope `let` of a classic script, so it lives in the
   global LEXICAL environment and is NOT reachable as a window property. That is why
   the shared apply assigns through eval — whitelisted against this same list, so a
   tampered state document cannot assign an arbitrary name.

   The const REGISTRIES (MCQ, SCQ, BQ, GSTEPS, s1State, s4State, practiceResults,
   qprogSubResults) are deliberately absent: a const binding cannot be reassigned, so
   they are captured and re-applied field by field in capturePartPayload /
   applyResumeVars instead. */
var RESUME_PLAIN_VARS = [
  /* screen 4 — the four embedded questions (s4State itself is a const registry) */
  's4q1Attempts', 's4q1LastWrong',
  's4q2Attempts',
  's4q3Attempts',
  's4q4Attempts', 's4q4LastWrong',
  /* the value-input and dropdown screens */
  's14Attempts', 's14Done', 's14LastWrong',
  's16Attempts', 's16Done', 's16LastWrong',
  's21Attempts', 's21Done', 's21LastWrong',
  's22Attempts', 's22Done', 's22LastWrong',
  's28Attempts', 's28Done', 's28LastWrong',
  's39Attempts', 's39Done', 's39LastWrong',
  /* screen 19 — a single-choice question with its own bespoke engine */
  's19qSelected', 's19qAttempts', 's19qDone', 's19qLastWrong'
];

/* Typed text and dropdown values, read by element id at capture time. Safe because no
   submit branch in this unit ever CLEARS one of these inputs — it only disables it.

   ⚠️ On a second wrong attempt every one of these screens REVEALS the answer by
   writing the correct values into the inputs, and the capture that follows therefore
   stores the revealed values, not what the learner typed. That is faithful: it is
   exactly what was on screen when they left. Their actual answer is not lost from the
   record either — reportAnswer already sent it, from before the overwrite. */
var RESUME_INPUT_IDS = [
  's4q2-left', 's4q2-right',
  's4q3-input',
  's14-sel-0', 's14-sel-1', 's14-sel-2', 's14-sel-3',
  's16-in-0', 's16-in-1', 's16-in-2', 's16-in-3',
  's21-in-0a', 's21-in-0b', 's21-in-1a', 's21-in-1b', 's21-in-2a', 's21-in-2b',
  's21-in-3a', 's21-in-3b', 's21-in-4a', 's21-in-4b',
  's22-in-0', 's22-in-1', 's22-in-2', 's22-in-3',
  's28-in-0', 's28-in-1', 's28-in-2', 's28-in-3', 's28-in-4', 's28-in-5',
  's32-in-0', 's32-in-1', 's32-in-2',
  's39-input'
];

/* Empty on purpose. This is for answers that exist ONLY as DOM text — the sibling
   units need it for custom dropdowns whose visible label is a separate node written
   by the click handler. Screen 14's dropdowns here are native <select> elements, so
   their label follows from the value already carried in RESUME_INPUT_IDS. The list is
   kept so the hook contract stays the same shape across units. */
var RESUME_TEXT_IDS = [];

'use strict';

/* =====================================================================
   js/main.js — methodica-math-ratio-01-01 (part 01)
   Engine vendored verbatim from the approved methodica-math-percent-02
   part-01 (client-QA'd behavior: nav-label width mechanism, popup
   conventions, navigation, character system). Screens S0-S1 so far.
   ===================================================================== */

/* ─── Constants ─────────────────────────────────────────── */
/* TOTAL_SCREENS declared in the config header above */

/* Set a nav-style button's label through the .nav-label wrapper (see
   style.css "Nav-button width consistency") instead of raw textContent —
   a plain textContent assignment would destroy the wrapper structure
   the hover width-reservation mechanism depends on. */
function setNavLabel(btn, label) {
  btn.innerHTML = '';
  const wrap = document.createElement('span');
  wrap.className = 'nav-label';
  wrap.dataset.label = label;
  const inner = document.createElement('span');
  inner.textContent = label;
  wrap.appendChild(inner);
  btn.appendChild(wrap);
}

/* Videos play once (no loop). Freeze on the clean opening frame instead
   of dropping into the player's black "ended" state. */
function freezeVideoOnEnd(vid) {
  if (!vid || vid._freezeWired) return;
  vid._freezeWired = true;
  function showRestFrame() { try { vid.currentTime = 0; } catch (e) {} vid.pause(); }
  vid.addEventListener('timeupdate', function () {
    if (vid.duration && vid.currentTime >= vid.duration - 0.3) showRestFrame();
  });
  vid.addEventListener('ended', showRestFrame);
}

/* ─── Companion character persistence ───────────────────────
   The choice now travels in the unit resume state document, through
   setUnitCharacter/getUnitCharacter in ../unit-js/40-resume.js, with localStorage kept
   as the synchronous cache behind it.

   ⚠️ This key must equal UI_CHARACTER_KEY in ../unit-js/40-resume.js — they name the
   same cache.

   ── Two behaviours this changed, both deliberate ──
   1. The key used to be WRITE-ONLY: nothing ever read it back, so components 02-04
      resolved their art through characterAsset()'s 'character-1' fallback and a
      learner who picked the purple character saw the gray one for three quarters of
      the unit. Reading it fixes that.
   2. Screen 0 used to start unselected even on reload ("approved percent-02 producer
      instruction"). It now shows the remembered choice, because the document is the
      source of truth and a resumed learner's earlier choice is real. Worth confirming
      with the producer; in normal use a returning learner lands where they stopped
      rather than on screen 0, so this is only visible on a deliberate walk back. */
const CHARACTER_STORAGE_KEY = 'methodica_math_ratio_01_selectedCharacter';

/* ─── Companion character asset map ─────────────────────────
   Logical IDs only — never hardcode a character file on a screen.
   character-1 = gray elderly monster with glasses (right card);
   character-2 = purple monster (left card).
   All current files are PPTX-extracted PLACEHOLDERS (marked in the
   name) — production assets replace them 1:1 as they arrive. */
/* 'peak' gray art still not supplied by the producer — falls back to the
   selection pose until it arrives (see CHARACTER_ASSETS access below).
   08.09: the producer supplied the warm-up clips, one per monster, so the
   `workout` pose is now a real asset for BOTH characters and the gray
   placeholder for it is gone. */
const CHARACTER_ASSETS = {
  'character-1': {
    selection: '../unit-assets/img/character-1-selection.png',
    detective: '../unit-assets/img/character-1-detective.png',
    workout: '../unit-assets/video/character-1-workout.mp4',
    // gray mountain-peak art pending from the producer — selection stands in
    peak: '../unit-assets/img/character-1-selection.png',
  },
  'character-2': {
    selection: '../unit-assets/img/character-2-selection.png',
    detective: '../unit-assets/img/character-2-detective.png',
    workout: '../unit-assets/video/character-2-workout.mp4',
    peak: '../unit-assets/img/character-2-peak.png',
  },
};

function characterAsset(pose) {
  const id = CHARACTER_ASSETS[window.lomdaState.selectedCharacter]
    ? window.lomdaState.selectedCharacter
    : 'character-1';
  return CHARACTER_ASSETS[id][pose];
}

/* ─── Global lomda state ─────────────────────────────────────
   Single source of truth for the whole session. Seeded from the localStorage cache at
   load time, because ../unit-js/40-resume.js is already loaded but the state document
   is not: getUnitCharacter falls back to the cache while _unitState is still null.
   Loader phase A then calls adoptUnitCharacter(): this part's document, else the cache
   (copied into the document), else the default — and a choice made in THIS session beats
   both (drainPendingUnitState). */
window.lomdaState = window.lomdaState || {
  selectedCharacter: (typeof getUnitCharacter === 'function') ? getUnitCharacter() : null
};

/* ─── State ─────────────────────────────────────────────── */
/* currentScreen lives in unit-js/30-nav.js */

/* ─── Scale App — 1280×710 design grid, scale-to-fit + extend the
   canvas to fill the viewport (no letterboxing) so chrome anchored to
   canvas edges (flag button, bottom bar) reaches the actual screen
   edges on any aspect ratio. ─── */
/* [scaleApp — provided by unit-js] */

/* ─── Navigation ────────────────────────────────────────── */
/* [goTo — unit-js/30-nav.js; the popup-closing + DEV sync moved into resetScreenState] */

/* An answered screen keeps its feedback when the learner comes back
   (producer 03.09, unit-wide). resetScreenState() closes every overlay on
   entry, so the screen's own popup is re-opened at the END of it. */
function restoreFeedback(n) {
  const popup = document.getElementById('s' + n + '-popup');
  if (!popup) return;
  if (window._lastPopup && window._lastPopup[popup.id]) popup.classList.remove('hidden');
}

function resetScreenState(n) {
  // fold-in from the unit's original goTo(): overlays never carry across screens,
  // and the DEV harness stays in sync on internal navigation
  document.querySelectorAll('[id$="-popup"], [id$="-hint-overlay"]')
    .forEach(el => el.classList.add('hidden'));
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'DEV_SCREEN', screen: n }, '*');
  }

  if (n === 0) {
    // In-session return restores the current selection; a fresh load
    // always starts unselected (write-only storage contract).
    const saved = window.lomdaState.selectedCharacter;
    document.querySelectorAll('#s0 .option-card').forEach(card => {
      const isSelected = !!saved && card.dataset.value === saved;
      card.classList.toggle('selected', isSelected);
      card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });
    const continueBtn = document.getElementById('s0-continue');
    if (continueBtn) continueBtn.disabled = !saved;
  }
  if (n === 1) {
    s1Enter();
  }
  // S2/S3 — resume-state on return; a full reset only while unanswered
  // (percent-02 S25 convention).
  if (n === 2) { if (!MCQ.s2.done) mcqReset(MCQ.s2); }
  if (n === 3) { if (!MCQ.s3.done) mcqReset(MCQ.s3); }
  if (n === 4) { s4Enter(); }
  if (n === 6) {
    const img = document.getElementById('s6-char');
    if (img) img.src = characterAsset('selection');
    /* the exercise is meant to be read first: the companion (and with it
       המשך) arrives a couple of seconds later — producer 03.09 */
    s6RevealCompanion();
  }
  if (n === 11) {
    /* 08.09 — the warm-up pose is a clip now. Setting .src alone leaves the
       previous character's frame on screen when the learner navigates back in,
       so reload and restart it the way the transition screens elsewhere do. */
    const vid = document.getElementById('s11-char');
    if (vid) {
      const src = characterAsset('workout');
      if (vid.getAttribute('src') !== src) { vid.setAttribute('src', src); vid.load(); }
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }
  }
  if (n === 13) {
    const img = document.getElementById('s13-char');
    if (img) img.src = characterAsset('selection');
  }
  if (n === 12 && !MCQ.s12.done) mcqReset(MCQ.s12);
  if (n === 15 && !MCQ.s15.done) mcqReset(MCQ.s15);
  if (n === 14 && !s14Done) s14Reset();
  if (n === 16 && !s16Done) s16Reset();
  if (n === 17) bqEnter('s17');
  if (n === 18) bqEnter('s18');
  if (n === 19) s19qEnter();
  // hint buttons hide once their question is resolved
  const HINT_DONE = { s12: () => MCQ.s12.done, s14: () => s14Done, s15: () => MCQ.s15.done,
                      s16: () => s16Done, s17: () => BQ.s17.done, s18: () => BQ.s18.done,
                      s19: () => s19qDone };
  if (HINT_DONE['s' + n]) {
    const hb = document.getElementById('s' + n + '-hint');
    if (hb) hb.style.visibility = HINT_DONE['s' + n]() ? 'hidden' : 'visible';
  }
  // part-02+ screens
  const CHAR_SCREENS = { 20: 's20-char', 21: 's21-char', 26: 's26-char', 30: 's30-char',
                         31: 's31-char', 33: 's33-char', 22: 's22-char', 45: 's45-char' };
  if (CHAR_SCREENS[n]) {
    const img = document.getElementById(CHAR_SCREENS[n]);
    if (img) img.src = characterAsset('selection');
  }
  if (n === 37) {
    const img = document.getElementById('s37-char');
    if (img) img.src = characterAsset('peak');
  }
  if (n === 24) bqEnter('s24');
  if (n === 25) bqEnter('s25');
  if (n === 31 || n === 32) s32Sync();
  const HINT_DONE2 = { s21: () => s21Done, s22: () => s22Done, s23: () => SCQ.s23.done,
                       s24: () => BQ.s24.done, s25: () => BQ.s25.done, s27: () => SCQ.s27.done,
                       s28: () => s28Done, s29: () => MCQ.s29.done, s34: () => MCQ.s34.done,
                       s35: () => SCQ.s35.done, s36: () => MCQ.s36.done,
                       s39: () => s39Done, s40: () => SCQ.s40.done,
                       s42: () => MCQ.s42.done, s43: () => SCQ.s43.done };
  if (HINT_DONE2['s' + n]) {
    const hb = document.getElementById('s' + n + '-hint');
    if (hb) hb.style.visibility = HINT_DONE2['s' + n]() ? 'hidden' : 'visible';
  }
  // practice progress strips (both parts)
  if (QPROG_INDEX['s' + n] !== undefined || QPROG2['s' + n]) renderQprog('s' + n);
  restoreFeedback(n);
}

function advanceScreen() {
  // Per-screen gates hold for keyboard navigation too (percent-02
  // convention — the ArrowLeft path must not skip an unfinished screen).
  if (currentScreen === 0 && !window.lomdaState.selectedCharacter) return;
  if (currentScreen === 1 && document.getElementById('s1-continue')?.disabled) return;
  if (currentScreen === 2 && !MCQ.s2.done) return;
  if (currentScreen === 3 && !MCQ.s3.done) return;
  if (currentScreen === 4 && document.getElementById('s4-continue')?.disabled) return;
  if ([7, 8, 9].includes(currentScreen) && !GSTEPS['s' + currentScreen].answered) return;
  if (currentScreen === 12 && !MCQ.s12.done) return;
  if (currentScreen === 14 && !s14Done) return;
  if (currentScreen === 15 && !MCQ.s15.done) return;
  if (currentScreen === 16 && !s16Done) return;
  if (currentScreen === 17 && !BQ.s17.done) return;
  if (currentScreen === 18 && !BQ.s18.done) return;
  if (currentScreen === 19 && !s19qDone) return;
  if (currentScreen === 21 && !s21Done) return;
  if (currentScreen === 22 && !s22Done) return;
  if (currentScreen === 23 && !SCQ.s23.done) return;
  if (currentScreen === 24 && !BQ.s24.done) return;
  if (currentScreen === 25 && !BQ.s25.done) return;
  if (currentScreen === 27 && !SCQ.s27.done) return;
  if (currentScreen === 28 && !s28Done) return;
  if (currentScreen === 29 && !MCQ.s29.done) return;
  if (currentScreen === 31 && document.getElementById('s31-continue')?.disabled) return;
  if (currentScreen === 32 && document.getElementById('s32-continue')?.disabled) return;
  if (currentScreen === 34 && !MCQ.s34.done) return;
  if (currentScreen === 35 && !SCQ.s35.done) return;
  if (currentScreen === 36 && !MCQ.s36.done) return;
  if (currentScreen === 39 && !s39Done) return;
  if (currentScreen === 40 && !SCQ.s40.done) return;
  if (currentScreen === 42 && !MCQ.s42.done) return;
  if (currentScreen === 43 && !SCQ.s43.done) return;
  goTo(currentScreen + 1);
}

function goBack() {
  goTo(currentScreen - 1);
}

/* ─── S6 — the companion is held back, and holds המשך with it ─── */
var s6CharTimer = null;
function s6RevealCompanion() {
  const stage = document.getElementById('s6-char-stage');
  const btn = document.getElementById('s6-continue');
  if (!stage) return;
  if (stage.dataset.shown === '1') { if (btn) btn.disabled = false; return; }
  stage.classList.add('is-pending');
  if (btn) btn.disabled = true;
  clearTimeout(s6CharTimer);
  s6CharTimer = setTimeout(function () {
    stage.classList.remove('is-pending');
    stage.dataset.shown = '1';
    if (btn) btn.disabled = false;
  }, 2200);
}

/* ─── Keyboard navigation ───────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;
  if (e.target && e.target.tagName === 'INPUT') return;
  // No screen navigation while the report modal (or its confirm) is open
  if (document.getElementById('report-modal')?.hasAttribute('hidden') === false ||
      document.getElementById('report-confirm-modal')?.hasAttribute('hidden') === false) return;
  if (e.key === 'ArrowLeft')  advanceScreen();
  if (e.key === 'ArrowRight') goBack();
});

/* ═══════════════════════════════════════════════════════════
   TEMPLATE — TwoOptionSelection (Screen 01, character selection)
   Selecting a card stores the choice and enables Continue. No modal,
   no auto-advance. See 720-templates → references/TwoOptionSelection.md
   ═══════════════════════════════════════════════════════════ */
function selectOption(cardEl) {
  document.querySelectorAll('#s0 .option-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });
  cardEl.classList.add('selected');
  cardEl.setAttribute('aria-checked', 'true');

  /* Beside the payload, not inside it: captureUnitState() REPLACES the payload on every
     save. setUnitCharacter puts the choice in doc.ui (this part's document) and in the
     localStorage mirror the later parts adopt from (v6), and queues the write when the
     document has not arrived yet — which it has not, since the picker is screen 0 and the
     document comes after two CDN scripts. */
  if (typeof setUnitCharacter === 'function') {
    setUnitCharacter(cardEl.dataset.value);
  } else {
    window.lomdaState.selectedCharacter = cardEl.dataset.value;
    try { localStorage.setItem(CHARACTER_STORAGE_KEY, cardEl.dataset.value); } catch (e) {}
  }

  const continueBtn = document.getElementById('s0-continue');
  if (continueBtn) continueBtn.disabled = false;
}

/* Continue ("בחרתי") → advance. */
function advanceFromS0() {
  advanceScreen();
}


/* ═══════════════════════════════════════════════════════════
   S1 — scroll acquisition screen (slides 4-9)
   Continue gates on: scroll reached the end + the single-attempt
   question answered + all three flip cards revealed. All three
   survive navigation (resume-state).
   ═══════════════════════════════════════════════════════════ */
const S1Q_CORRECT = 'a';   // "הכפלנו רק חלק מהמרכיבים במתכון ולא את כולם"
const s1State = {
  scrolledEnd: false,
  selected: null,
  answered: false,
  flipped: [false, false, false],
};

function s1UpdateGate() {
  const btn = document.getElementById('s1-continue');
  if (!btn) return;
  btn.disabled = !(s1State.scrolledEnd && s1State.answered && s1State.flipped.every(Boolean));
}

/* scroll-end tracking (one-way latch) */
document.getElementById('s1-scroll')?.addEventListener('scroll', function () {
  if (s1State.scrolledEnd) return;
  if (this.scrollTop + this.clientHeight >= this.scrollHeight - 24) {
    s1State.scrolledEnd = true;
    s1UpdateGate();
  }
});

/* §3 — single-attempt question (slide 6: "ניסיון אחד למענה. משוב עולה
   ותשובה נכונה מסומנת.") */
function s1qSelect(id) {
  if (s1State.answered) return;
  s1State.selected = id;
  document.querySelectorAll('#s1 .scq-opt').forEach(o => {
    const sel = o.dataset.id === id;
    o.classList.toggle('selected', sel);
    o.setAttribute('aria-checked', sel ? 'true' : 'false');
  });
  const check = document.getElementById('s1q-check');
  if (check) check.disabled = false;
}

function s1qCheck() {
  if (s1State.answered || !s1State.selected) return;
  s1State.answered = true;
  const wasCorrect = s1State.selected === S1Q_CORRECT;
  /* One attempt only on this screen, so every answer is the last one. */
  try {
    reportAnswer('s1', wasCorrect, true,
      xapiAnswerText(document.querySelector('#s1 .scq-opt[data-id="' + s1State.selected + '"]')));
  } catch (e) { console.error('[xAPI] s1', e); }
  document.querySelectorAll('#s1 .scq-opt').forEach(o => {
    o.disabled = true;
    if (o.dataset.id === S1Q_CORRECT) o.classList.add('correct');
    else if (o.dataset.id === s1State.selected) o.classList.add('wrong');
  });
  const fb = document.getElementById('s1q-feedback');
  if (fb) {
    fb.textContent = (wasCorrect ? 'صحيح! ' : 'هذا على الأرجح ليس السبب.. ') + 'استمروا في التمرير لفهم السبب.';
    fb.classList.add(wasCorrect ? 'is-correct' : 'is-wrong');
  }
  const check = document.getElementById('s1q-check');
  if (check) check.disabled = true;
  s1UpdateGate();
  try { flushResumeSave(); } catch (e) {}
}

/* §5 — flip cards (FlipCardsReveal — one-way reveal) */
function s1Flip(cardEl) {
  const i = Number(cardEl.dataset.index);
  if (!cardEl.classList.contains('is-flipped')) {
    cardEl.classList.add('is-flipped');
    cardEl.setAttribute('aria-expanded', 'true');
    const front = cardEl.querySelector('.frc-card-front');
    const back  = cardEl.querySelector('.frc-card-back');
    if (front) front.setAttribute('aria-hidden', 'true');
    if (back)  back.removeAttribute('aria-hidden');
  }
  if (!s1State.flipped[i]) {
    s1State.flipped[i] = true;
    s1UpdateGate();
  }
}

/* entry/restore — called from resetScreenState(1) */
function s1Enter() {
  // companion characters re-resolve on every entry
  const img = document.getElementById('s1-q-char');
  if (img) img.src = characterAsset('detective');
  const defChar = document.getElementById('s1-def-char');
  if (defChar) defChar.src = characterAsset('selection');
  // hints can only be measured once the screen is visible
  if (window.s1PlaceCardsHint) window.s1PlaceCardsHint();
  s1UpdateGate();
}


/* ═══════════════════════════════════════════════════════════
   Click-gesture hints (Figma Desktop Click Hint / Cursor Drag) —
   S1: one over the first flip card (dismissed on first flip), one
   beside the scrollbar (dismissed on first scroll).
   ═══════════════════════════════════════════════════════════ */
const SPARK_DIRS = [
  [0, -80], [56.57, -56.57], [80, 0], [56.57, 56.57],
  [0, 80], [-56.57, 56.57], [-80, 0], [-56.57, -56.57],
];
function makeClickHint(id) {
  const el = document.createElement('div');
  el.className = 'click-hint';
  el.id = id;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="click-hint__ripple1"><img src="../unit-assets/img/hint/ripple-ring-1.svg" alt=""></div>' +
    '<div class="click-hint__ripple2"><img src="../unit-assets/img/hint/ripple-ring-2.svg" alt=""></div>' +
    SPARK_DIRS.map(([dx, dy], i) =>
      `<div class="click-hint__spark" style="--dx:${dx}px; --dy:${dy}px; --d:${i * 3}ms"><img src="../unit-assets/img/hint/spark.svg" alt=""></div>`
    ).join('') +
    '<div class="click-hint__cursor"><img src="../unit-assets/img/hint/cursor.svg" alt=""></div>';
  return el;
}

(function s1WireHints() {
  const screen = document.getElementById('s1');
  if (!screen) return;

  // cards hint — centered over the FIRST card (rightmost in RTL), inside
  // the scroll content so it scrolls with the cards
  const cards = screen.querySelector('.rs-cards');
  const firstCard = screen.querySelector('.frc-card[data-index="0"]');
  if (cards && firstCard) {
    cards.style.position = 'relative';
    const hint = makeClickHint('s1-hint-cards');
    cards.appendChild(hint);
    const place = () => {
      if (!firstCard.offsetWidth) return;   // screen not visible yet
      hint.style.left = (firstCard.offsetLeft + firstCard.offsetWidth / 2 - 150) + 'px';
      hint.style.top  = (firstCard.offsetTop  + firstCard.offsetHeight / 2 - 150) + 'px';
    };
    place();
    window.addEventListener('resize', place);
    window.s1PlaceCardsHint = place;
    // dismiss permanently on the first flip of ANY card
    cards.addEventListener('click', () => hint.classList.add('hidden'), { once: true });
  }

  // scrollbar hint — anchored to the screen (not the scroll content),
  // drifting down beside the bar; dismissed on the first real scroll
  const scroller = document.getElementById('s1-scroll');
  if (scroller) {
    const hint = makeClickHint('s1-hint-scroll');
    screen.appendChild(hint);
    /* NOT `once`: answering a question opens a feedback block and pushes the
       rest of the screen below the fold, so the cue is shown again and
       dismissed again on the next scroll (producer 03.09) */
    scroller.addEventListener('scroll', () => hint.classList.add('hidden'));
    window.s4ShowScrollHint = function () {
      if (scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 24) {
        hint.classList.remove('hidden');
      }
    };
  }
})();

/* ═══════════════════════════════════════════════════════════
   S2 + S3 — standalone MultipleChoiceQuestion screens (slides 10-11).
   Engine is percent-02's S25, behavior-identical, parameterized so the
   two screens share one implementation: toggle → هل إجابتي صحيحة؟ → first wrong
   marks ONLY the learner's wrong picks + retry popup; final wrong
   reveals the full correct set; correct/final relabel to متابعة.
   Popups are draggable (percent-02 drag/clamp machinery, vendored).
   ═══════════════════════════════════════════════════════════ */
const CANVAS_W = 1280, CANVAS_H = 710, BOTTOM_BAR_H = 74;

function getAppScale() {
  const app = document.getElementById('app');
  const m = app.style.transform.match(/scale\(([^)]+)\)/);
  return m ? parseFloat(m[1]) : 1;
}
function clampPopupPosition(x, y, popupEl) {
  const w = popupEl.offsetWidth, h = popupEl.offsetHeight;
  return {
    x: Math.min(Math.max(x, 0), CANVAS_W - w),
    y: Math.min(Math.max(y, 0), (CANVAS_H - BOTTOM_BAR_H) - h),
  };
}
function resetPopupPosition(popup) {
  // floats above the bottom-bar buttons, beside the answers (producer 12.08)
  popup.style.left   = '24px';
  popup.style.top    = 'auto';
  popup.style.bottom = '130px';
}
function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

/* shared popup drag (one pointermove/up pair for all draggable popups) */
let mcqDragPopup = null, mcqDragOffX = 0, mcqDragOffY = 0;
function mcqPopupPointerDown(e, popupId) {
  const popup = document.getElementById(popupId);
  const app   = document.getElementById('app');
  if (!popup || !app) return;
  mcqDragPopup = popup;
  const scale = getAppScale();
  const canvasX = (e.clientX - (parseFloat(app.style.left) || 0)) / scale;
  const canvasY = (e.clientY - (parseFloat(app.style.top)  || 0)) / scale;
  const topPx = parseFloat(popup.style.top);
  const popupTop = isNaN(topPx) ? popup.offsetTop : topPx;
  popup.style.top    = popupTop + 'px';
  popup.style.bottom = 'auto';
  mcqDragOffX = canvasX - (parseFloat(popup.style.left) || 2);
  mcqDragOffY = canvasY - popupTop;
  e.preventDefault();
}
window.addEventListener('pointermove', e => {
  if (!mcqDragPopup) return;
  const app = document.getElementById('app');
  if (!app) return;
  const scale = getAppScale();
  const rawX = (e.clientX - (parseFloat(app.style.left) || 0)) / scale - mcqDragOffX;
  const rawY = (e.clientY - (parseFloat(app.style.top)  || 0)) / scale - mcqDragOffY;
  const c = clampPopupPosition(rawX, rawY, mcqDragPopup);
  mcqDragPopup.style.left = c.x + 'px';
  mcqDragPopup.style.top  = c.y + 'px';
});
window.addEventListener('pointerup',     () => { mcqDragPopup = null; });
window.addEventListener('pointercancel', () => { mcqDragPopup = null; });

/* slide feedback lines: "كل الاحترام! / זה לא מדוייק" — retry line is the
   percent-02 universal standard */
function mcqPopupCfg() {
  return {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق.', body: ['هل نحاول مجدداً؟'] },
    correct: { bg: '#edf8ed', title: 'كلّ الاحترام!', body: [] },
    wrong2:  { bg: '#ffdbdc', title: 'هذا غير دقيق، الإجابة الصحيحة معروضة.<br>هيا نفهم لماذا:', body: ['الإجابات الصحيحة محددة.'] },
  };
}

const MCQ = {
  /* s2: all four options describe 4 black : 8 red correctly, so all four are
     keyed correct (producer 20.08 — overrides the V-badge positions on slide 10,
     which mark only a, c, d).
     s3 answer key read from the script's own V-badge positions (slide 11). */
  s2: { id: 's2', correctIds: new Set(['a', 'b', 'c', 'd']), maxAttempts: 2,
        selected: new Set(), attempts: 0, answered: false, done: false, lastWrong: null,
        popups: mcqPopupCfg() },
  s3: { id: 's3', correctIds: new Set(['a', 'c', 'd']), maxAttempts: 2,
        selected: new Set(), attempts: 0, answered: false, done: false, lastWrong: null,
        popups: mcqPopupCfg() },
};

function mcqSnapshot(set) { return JSON.stringify([...set].sort()); }

function mcqToggle(q, id) {
  if (q.answered) return;
  if (q.selected.has(id)) q.selected.delete(id); else q.selected.add(id);
  if (q.attempts > 0) {
    document.getElementById(q.id + '-popup')?.classList.add('hidden');
    document.querySelectorAll('#' + q.id + ' ' + (q.optSelector || '.scq-opt')).forEach(o => o.classList.remove('wrong', 'correct'));
  }
  document.querySelectorAll('#' + q.id + ' ' + (q.optSelector || '.scq-opt')).forEach(o => {
    const on = q.selected.has(o.dataset.id);
    o.classList.toggle('selected', on);
    o.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  mcqUpdateBar(q);
}

function mcqShowPopup(q, type) {
  const popup = document.getElementById(q.id + '-popup');
  if (!popup) return;
  const cfg = q.popups[type];
  popup.style.background = cfg.bg;
  resetPopupPosition(popup);
  document.getElementById(q.id + '-popup-title').innerHTML = cfg.title;
  document.getElementById(q.id + '-popup-body').innerHTML = cfg.body.map(p => '<p>' + p + '</p>').join('');
  popup.classList.remove('hidden');
  window._lastPopup = window._lastPopup || {};
  window._lastPopup[popup.id] = true;
}

function mcqMark(q, id, cls) {
  const opt = document.querySelector('#' + q.id + ' ' + (q.optSelector || '.scq-opt') + '[data-id="' + id + '"]');
  if (!opt) return;
  opt.classList.remove('selected');
  opt.classList.add(cls);
}

function mcqCheck(q) {
  if (q.answered) { advanceScreen(); return; }   // label is متابعة → go next
  if (q.selected.size < 1) return;

  q.attempts++;
  const isCorrect = setsEqual(q.selected, q.correctIds);
  /* One injection for all eight screens on this engine. Placed here, before any
     branch: the final-wrong branch reveals the correct set, and reporting after it
     would send the answer key back as the learner's own answer. */
  try {
    reportAnswer(q.id, isCorrect, isCorrect || q.attempts >= q.maxAttempts,
      xapiMultiAnswer([...q.selected], function (id) {
        return document.querySelector('#' + q.id + ' ' + (q.optSelector || '.scq-opt') + '[data-id="' + id + '"]');
      }));
  } catch (e) { console.error('[xAPI] ' + q.id, e); }

  if (isCorrect) {
    q.correctIds.forEach(id => mcqMark(q, id, 'correct'));
    mcqShowPopup(q, 'correct');
    mcqFinish(q);
  } else if (q.attempts >= q.maxAttempts) {
    // final wrong: reveal the FULL correct set AND the learner's wrong picks
    q.correctIds.forEach(id => mcqMark(q, id, 'correct'));
    q.selected.forEach(id => { if (!q.correctIds.has(id)) mcqMark(q, id, 'wrong'); });
    mcqShowPopup(q, 'wrong2');
    mcqFinish(q);
  } else {
    // first wrong: mark ONLY the learner's own incorrect selections
    q.selected.forEach(id => { if (!q.correctIds.has(id)) mcqMark(q, id, 'wrong'); });
    q.lastWrong = mcqSnapshot(q.selected);
    mcqShowPopup(q, 'retry');
    mcqUpdateBar(q);
  }
}

function mcqFinish(q) {
  q.answered = true;
  q.done = true;
  /* Synchronous, not debounced: goTo()'s debounced save can otherwise fire AFTER a
     cross-part write and send the next launch back into a component just finished. */
  try { flushResumeSave(); } catch (e) {}
  document.querySelectorAll('#' + q.id + ' ' + (q.optSelector || '.scq-opt')).forEach(o => { o.disabled = true; });
  const chk = document.getElementById(q.id + '-check');
  if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
}

function mcqUpdateBar(q) {
  if (q.answered) return;
  const chk = document.getElementById(q.id + '-check');
  if (chk) chk.disabled = q.selected.size < 1 || mcqSnapshot(q.selected) === q.lastWrong;
}

function mcqReset(q) {
  q.selected = new Set();
  q.attempts = 0;
  q.answered = false;
  q.lastWrong = null;
  document.querySelectorAll('#' + q.id + ' ' + (q.optSelector || '.scq-opt')).forEach(o => {
    o.classList.remove('selected', 'correct', 'wrong');
    o.disabled = false;
    o.setAttribute('aria-checked', 'false');
  });
  document.getElementById(q.id + '-popup')?.classList.add('hidden');
  if (window._lastPopup) delete window._lastPopup[q.id + '-popup'];
  const chk = document.getElementById(q.id + '-check');
  if (chk) { setNavLabel(chk, 'هل إجابتي صحيحة؟'); chk.disabled = true; }
}

function s2Toggle(id) { mcqToggle(MCQ.s2, id); }
function s2Check()    { mcqCheck(MCQ.s2); }
function s3Toggle(id) { mcqToggle(MCQ.s3, id); }
function s3Check()    { mcqCheck(MCQ.s3); }

/* ═══════════════════════════════════════════════════════════
   S4 — scroll acquisition screen (slides 12-21).
   Continue gates on: scroll end + all four embedded questions
   answered + all four reduction cards flipped. Embedded questions
   are 2-attempt with inline feedback (first wrong → retry line;
   final wrong → explanation + reveal, percent-02 reveal rules).
   ═══════════════════════════════════════════════════════════ */
const s4State = {
  scrolledEnd: false,
  q1: false, q2: false, q3: false, q4: false,
  flipped: [false, false, false, false],
};

function s4UpdateGate() {
  const btn = document.getElementById('s4-continue');
  if (!btn) return;
  btn.disabled = !(s4State.scrolledEnd && s4State.q1 && s4State.q2 &&
                   s4State.q3 && s4State.q4 && s4State.flipped.every(Boolean));
}

document.getElementById('s4-scroll')?.addEventListener('scroll', function () {
  if (s4State.scrolledEnd) return;
  if (this.scrollTop + this.clientHeight >= this.scrollHeight - 24) {
    s4State.scrolledEnd = true;
    s4UpdateGate();
  }
});

function s4Feedback(id, ok, html) {
  const fb = document.getElementById(id);
  if (!fb) return;
  fb.innerHTML = html;
  fb.classList.remove('is-correct', 'is-wrong');
  fb.classList.add(ok ? 'is-correct' : 'is-wrong');
}

/* §4 — embedded multi-select MCQ (slide 15). Correct: a + c. */
const S4Q1_CORRECT = new Set(['a', 'c']);
const S4Q1_EXPLAIN = 'العبارات المتعلقة بعدد المحلات في المركز التجاري وعدد الأسماك في الحوض تمثل نسبة بين كميتين.<br>' +
                     'العبارات الأخرى تمثل معلومات لا تمثل نسبة بين كميتين.';
let s4q1Selected = new Set(), s4q1Attempts = 0, s4q1LastWrong = null;

function s4q1Toggle(id) {
  if (s4State.q1) return;
  if (s4q1Selected.has(id)) s4q1Selected.delete(id); else s4q1Selected.add(id);
  if (s4q1Attempts > 0) {
    document.querySelectorAll('#s4 .rs-block:nth-of-type(4) .scq-opt').forEach(o => o.classList.remove('wrong', 'correct'));
    const fb = document.getElementById('s4q1-feedback');
    if (fb) { fb.innerHTML = ''; fb.classList.remove('is-correct', 'is-wrong'); }
  }
  document.querySelectorAll('#s4 .rs-block:nth-of-type(4) .scq-opt').forEach(o => {
    const on = s4q1Selected.has(o.dataset.id);
    o.classList.toggle('selected', on);
    o.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  const chk = document.getElementById('s4q1-check');
  if (chk) chk.disabled = s4q1Selected.size < 1 || mcqSnapshot(s4q1Selected) === s4q1LastWrong;
}

function s4q1Check() {
  if (s4State.q1 || s4q1Selected.size < 1) return;
  s4q1Attempts++;
  const opts = document.querySelectorAll('#s4 .rs-block:nth-of-type(4) .scq-opt');
  const isCorrect = setsEqual(s4q1Selected, S4Q1_CORRECT);
  try {
    reportAnswer('s4q1', isCorrect, isCorrect || s4q1Attempts >= 2,
      xapiMultiAnswer([...s4q1Selected], function (id) {
        return document.querySelector('#s4 .rs-block:nth-of-type(4) .scq-opt[data-id="' + id + '"]');
      }));
  } catch (e) { console.error('[xAPI] s4q1', e); }
  const finish = () => {
    s4State.q1 = true;
    opts.forEach(o => { o.disabled = true; });
    const chk = document.getElementById('s4q1-check');
    if (chk) chk.disabled = true;
    s4UpdateGate();
  if (window.s4ShowScrollHint) window.s4ShowScrollHint();
    try { flushResumeSave(); } catch (e) {}
  };
  if (isCorrect) {
    opts.forEach(o => { if (S4Q1_CORRECT.has(o.dataset.id)) { o.classList.remove('selected'); o.classList.add('correct'); } });
    s4Feedback('s4q1-feedback', true, '<strong>كلّ الاحترام!</strong><br>' + S4Q1_EXPLAIN);
    finish();
  } else if (s4q1Attempts >= 2) {
    opts.forEach(o => {
      o.classList.remove('selected');
      if (S4Q1_CORRECT.has(o.dataset.id)) o.classList.add('correct');
      else if (s4q1Selected.has(o.dataset.id)) o.classList.add('wrong');
    });
    s4Feedback('s4q1-feedback', false, '<strong>هذا غير دقيق.</strong><br>' + S4Q1_EXPLAIN);
    finish();
  } else {
    s4q1Selected.forEach(id => {
      if (!S4Q1_CORRECT.has(id)) {
        const o = document.querySelector('#s4 .rs-block:nth-of-type(4) .scq-opt[data-id="' + id + '"]');
        if (o) { o.classList.remove('selected'); o.classList.add('wrong'); }
      }
    });
    s4q1LastWrong = mcqSnapshot(s4q1Selected);
    s4Feedback('s4q1-feedback', false, 'هذا غير دقيق. هل نحاول مجدداً؟');
    const chk = document.getElementById('s4q1-check');
    if (chk) chk.disabled = true;
  }
}

/* §5א — ratio input (slide 16). Verbal order: green first → LEFT in the
   mathematical notation. Correct: 1 : 4. */
const S4Q2_EXPLAIN = 'سنكتب النسبة بالكتابة الرياضية وفق الترتيب الذي تظهر فيه الكميات في الكتابة اللفظية – ' +
                     'عدد الملصقات الخضراء (1) يظهر أولاً في الكتابة اللفظية، ولذلك سيُكتب على اليسار ' +
                     'بالكتابة الرياضية: <span dir="ltr"><strong>1: 4</strong></span>';
let s4q2Attempts = 0;

function s4q2OnInput() {
  if (s4State.q2) return;
  const l = document.getElementById('s4q2-left').value.trim();
  const r = document.getElementById('s4q2-right').value.trim();
  const chk = document.getElementById('s4q2-check');
  if (chk) chk.disabled = !(l !== '' && r !== '');
  const fb = document.getElementById('s4q2-feedback');
  if (fb && s4q2Attempts > 0) { fb.innerHTML = ''; fb.classList.remove('is-wrong'); }
  document.getElementById('s4q2-left').classList.remove('error');
  document.getElementById('s4q2-right').classList.remove('error');
}

function s4q2Check() {
  if (s4State.q2) return;
  const left  = document.getElementById('s4q2-left');
  const right = document.getElementById('s4q2-right');
  if (left.value.trim() === '' || right.value.trim() === '') return;
  s4q2Attempts++;
  const isCorrect = Number(left.value) === 1 && Number(right.value) === 4;
  try {
    reportAnswer('s4q2', isCorrect, isCorrect || s4q2Attempts >= 2,
      xapiFieldsAnswer(['s4q2-left', 's4q2-right']));
  } catch (e) { console.error('[xAPI] s4q2', e); }
  const finish = () => {
    s4State.q2 = true;
    left.disabled = true; right.disabled = true;
    const chk = document.getElementById('s4q2-check');
    if (chk) chk.disabled = true;
    s4UpdateGate();
  if (window.s4ShowScrollHint) window.s4ShowScrollHint();
    try { flushResumeSave(); } catch (e) {}
  };
  if (isCorrect) {
    left.classList.add('correct'); right.classList.add('correct');
    s4Feedback('s4q2-feedback', true, 'صحيح' + S4Q2_EXPLAIN);
    finish();
  } else if (s4q2Attempts >= 2) {
    left.value = 1; right.value = 4;
    left.classList.remove('error'); right.classList.remove('error');
    left.classList.add('correct'); right.classList.add('correct');
    s4Feedback('s4q2-feedback', false, '<strong>هذا غير دقيق.</strong><br>' + S4Q2_EXPLAIN +
      '<br>الإجابة الصحيحة هي <span dir="ltr"><strong>1: 4</strong></span>');
    finish();
  } else {
    left.classList.add('error'); right.classList.add('error');
    s4Feedback('s4q2-feedback', false, 'هذا غير دقيق. هل نحاول مجدداً؟');
    const chk = document.getElementById('s4q2-check');
    if (chk) chk.disabled = true;
  }
}

/* §5ב — value input (slide 17). Correct: 12. */
const S4Q3_EXPLAIN = 'إذا كانت النسبة بين عدد الملصقات الخضراء وعدد الملصقات الزرقاء هي ' +
                     '<span dir="ltr">1: 4</span>،    إذًا لكل ملصقة خضراء توجد 4 ملصقات زرقاء. ' +
                     'لذلك، إذا كان لدينا 3 ملصقات خضراء، سيكون لدينا 12 ملصقة زرقاء.';
let s4q3Attempts = 0;

function s4q3OnInput() {
  if (s4State.q3) return;
  const v = document.getElementById('s4q3-input').value.trim();
  const chk = document.getElementById('s4q3-check');
  if (chk) chk.disabled = v === '';
  const fb = document.getElementById('s4q3-feedback');
  if (fb && s4q3Attempts > 0) { fb.innerHTML = ''; fb.classList.remove('is-wrong'); }
  document.getElementById('s4q3-input').classList.remove('error');
}

function s4q3Check() {
  if (s4State.q3) return;
  const input = document.getElementById('s4q3-input');
  if (input.value.trim() === '') return;
  s4q3Attempts++;
  const isCorrect = Number(input.value) === 12;
  try {
    reportAnswer('s4q3', isCorrect, isCorrect || s4q3Attempts >= 2,
      xapiFieldsAnswer(['s4q3-input']));
  } catch (e) { console.error('[xAPI] s4q3', e); }
  const finish = () => {
    s4State.q3 = true;
    input.disabled = true;
    const chk = document.getElementById('s4q3-check');
    if (chk) chk.disabled = true;
    s4UpdateGate();
  if (window.s4ShowScrollHint) window.s4ShowScrollHint();
    try { flushResumeSave(); } catch (e) {}
  };
  if (isCorrect) {
    input.classList.add('correct');
    s4Feedback('s4q3-feedback', true, '<strong>صحيح!</strong><br>' + S4Q3_EXPLAIN);
    finish();
  } else if (s4q3Attempts >= 2) {
    input.value = 12;
    input.classList.remove('error');
    input.classList.add('correct');
    s4Feedback('s4q3-feedback', false, '<strong>هذا غير دقيق.</strong><br>' + S4Q3_EXPLAIN +
      '<br>الإجابة الصحيحة هي <strong>12</strong>');
    finish();
  } else {
    input.classList.add('error');
    s4Feedback('s4q3-feedback', false, 'هذا غير دقيق. هل نحاول مجدداً؟');
    const chk = document.getElementById('s4q3-check');
    if (chk) chk.disabled = true;
  }
}

/* §5ג — statement assessment (slide 18). The ratio holds only where
   blue = 4 × green: a(2,4)=לא, b(6,24)=כן, c(20,80)=כן, d(3,7)=לא. */
const S4Q4_CORRECT = { a: 'no', b: 'yes', c: 'yes', d: 'no' };
const S4Q4_EXPLAIN = 'النسبة بين عدد الملصقات الخضراء وعدد الملصقات الزرقاء هو ' +
                     '<span dir="ltr">1: 4</span>، ولذلك ستُقبل إجابة "نعم" فقط في الحالات التي يُوصف فيها ' +
                     'كمية الملصقات الزرقاء أكبر بـ 4 أضعاف من كمية الملصقات الخضراء، وبذلك يُحافَظ على نسبة.';
let s4q4Picks = {}, s4q4Attempts = 0, s4q4LastWrong = null;

function s4q4Pick(rowId, val, btn) {
  if (s4State.q4) return;
  s4q4Picks[rowId] = val;
  if (s4q4Attempts > 0) {
    document.querySelectorAll('#s4 .saq-row').forEach(r => r.classList.remove('row-correct', 'row-wrong'));
    const fb = document.getElementById('s4q4-feedback');
    if (fb) { fb.innerHTML = ''; fb.classList.remove('is-wrong'); }
  }
  btn.closest('.saq-toggle').querySelectorAll('.saq-pill').forEach(p => {
    const on = p === btn;
    p.classList.toggle('selected', on);
    p.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  const chk = document.getElementById('s4q4-check');
  if (chk) {
    const all = Object.keys(S4Q4_CORRECT).every(k => s4q4Picks[k]);
    chk.disabled = !all || JSON.stringify(s4q4Picks) === s4q4LastWrong;
  }
}

function s4q4Check() {
  if (s4State.q4) return;
  if (!Object.keys(S4Q4_CORRECT).every(k => s4q4Picks[k])) return;
  s4q4Attempts++;
  const isCorrect = Object.keys(S4Q4_CORRECT).every(k => s4q4Picks[k] === S4Q4_CORRECT[k]);
  try {
    reportAnswer('s4q4', isCorrect, isCorrect || s4q4Attempts >= 2,
      xapiFieldsAnswer(Object.keys(S4Q4_CORRECT), s4q4Picks));
  } catch (e) { console.error('[xAPI] s4q4', e); }
  const markRows = (revealCorrect) => {
    document.querySelectorAll('#s4 .saq-row').forEach(row => {
      const id = row.dataset.id;
      const ok = s4q4Picks[id] === S4Q4_CORRECT[id];
      row.classList.add(ok ? 'row-correct' : 'row-wrong');
      if (revealCorrect && !ok) {
        row.querySelectorAll('.saq-pill').forEach(p => {
          const on = p.dataset.val === S4Q4_CORRECT[id];
          p.classList.toggle('selected', on);
          p.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        row.classList.remove('row-wrong');
        row.classList.add('row-revealed');
      }
    });
  };
  const finish = () => {
    s4State.q4 = true;
    document.querySelectorAll('#s4 .saq-pill').forEach(p => { p.disabled = true; });
    const chk = document.getElementById('s4q4-check');
    if (chk) chk.disabled = true;
    try { flushResumeSave(); } catch (e) {}
    s4UpdateGate();
  if (window.s4ShowScrollHint) window.s4ShowScrollHint();
  };
  if (isCorrect) {
    markRows(false);
    s4Feedback('s4q4-feedback', true, '<strong>صحيح!</strong><br>' + S4Q4_EXPLAIN);
    finish();
  } else if (s4q4Attempts >= 2) {
    markRows(true);
    s4Feedback('s4q4-feedback', false, '<strong>هذا غير دقيق.</strong><br>' + S4Q4_EXPLAIN +
      '<br>الإجابات الصحيحة محددة.');
    finish();
  } else {
    markRows(false);
    s4q4LastWrong = JSON.stringify(s4q4Picks);
    s4Feedback('s4q4-feedback', false, 'هذا غير دقيق. هل نحاول مجدداً؟');
    const chk = document.getElementById('s4q4-check');
    if (chk) chk.disabled = true;
  }
}

/* §6 — reduction flip cards (one-way reveal, same engine as S1) */
function s4Flip(cardEl) {
  const i = Number(cardEl.dataset.index);
  if (!cardEl.classList.contains('is-flipped')) {
    cardEl.classList.add('is-flipped');
    cardEl.setAttribute('aria-expanded', 'true');
    const front = cardEl.querySelector('.frc-card-front');
    const back  = cardEl.querySelector('.frc-card-back');
    if (front) front.setAttribute('aria-hidden', 'true');
    if (back)  back.removeAttribute('aria-hidden');
  }
  if (!s4State.flipped[i]) {
    s4State.flipped[i] = true;
    s4UpdateGate();
  if (window.s4ShowScrollHint) window.s4ShowScrollHint();
  }
}

/* entry/restore — called from resetScreenState(4) */
function s4Enter() {
  // companion character re-resolves on every entry (standing pose,
  // slide 14's example + slide 21's closing)
  ['s4-char-1', 's4-char-2'].forEach(id => {
    const img = document.getElementById(id);
    if (img) img.src = characterAsset('selection');
  });
  if (window.s4PlaceCardsHint) window.s4PlaceCardsHint();
  s4UpdateGate();
  if (window.s4ShowScrollHint) window.s4ShowScrollHint();
}

/* hints — same pair as S1 (scrollbar + first flip card) */
(function s4WireHints() {
  const screen = document.getElementById('s4');
  if (!screen) return;

  const cards = screen.querySelector('.rs-cards');
  const firstCard = screen.querySelector('.frc-card[data-index="0"]');
  if (cards && firstCard) {
    cards.style.position = 'relative';
    const hint = makeClickHint('s4-hint-cards');
    cards.appendChild(hint);
    const place = () => {
      if (!firstCard.offsetWidth) return;   // screen not visible yet
      hint.style.left = (firstCard.offsetLeft + firstCard.offsetWidth / 2 - 150) + 'px';
      hint.style.top  = (firstCard.offsetTop  + firstCard.offsetHeight / 2 - 150) + 'px';
    };
    place();
    window.addEventListener('resize', place);
    window.s4PlaceCardsHint = place;
    cards.addEventListener('click', () => hint.classList.add('hidden'), { once: true });
  }

  const scroller = document.getElementById('s4-scroll');
  if (scroller) {
    const hint = makeClickHint('s4-hint-scroll');
    screen.appendChild(hint);
    /* NOT `once`: answering a question opens a feedback block and pushes the
       rest of the screen below the fold, so the cue is shown again and
       dismissed again on the next scroll (producer 03.09) */
    scroller.addEventListener('scroll', () => hint.classList.add('hidden'));
    window.s4ShowScrollHint = function () {
      if (scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 24) {
        hint.classList.remove('hidden');
      }
    };
  }
})();

/* ═══════════════════════════════════════════════════════════
   Generic hint overlay controls (percent-02 scq-hint behavior)
   ═══════════════════════════════════════════════════════════ */
function openHint(sid) {
  /* Reported here and nowhere else: this OPENS the overlay rather than toggling it,
     so it cannot double-report on a close. */
  try { reportHint(sid); } catch (e) {}
  document.getElementById(sid + '-hint-overlay')?.classList.remove('hidden');
}
function closeHint(sid) {
  document.getElementById(sid + '-hint-overlay')?.classList.add('hidden');
}
function closeHintOnBackdrop(e, sid) {
  if (e.target && e.target.id === sid + '-hint-overlay') closeHint(sid);
}
function hideHintButton(sid) {
  const hb = document.getElementById(sid + '-hint');
  if (hb) hb.style.visibility = 'hidden';
}

/* ═══════════════════════════════════════════════════════════
   S6-S10 — Guided Instruction steps (slides 23-27). One-tap reveal
   (percent-02 s19Select): correct turns green, a wrong pick turns
   red, continue unlocks. Keys per the script's V badges.
   ═══════════════════════════════════════════════════════════ */
const GSTEPS = {
  s7: { correctId: 'b', answered: false },   // משמאל
  s8: { correctId: 'b', answered: false },   // 3 : 9
  s9: { correctId: 'a', answered: false },   // כן
};
function gstepSelect(sid, id) {
  const st = GSTEPS[sid];
  if (!st || st.answered) return;
  document.querySelectorAll('#' + sid + ' .s19-opt').forEach(o => {
    if (o.dataset.id === st.correctId) o.classList.add('correct');
    else if (o.dataset.id === id) o.classList.add('incorrect');
    o.setAttribute('aria-checked', o.dataset.id === id ? 'true' : 'false');
    o.disabled = true;
  });
  st.answered = true;
  const cont = document.getElementById(sid + '-continue');
  if (cont) cont.disabled = false;
}

/* ═══════════════════════════════════════════════════════════
   Practice progress strip (S14-S19 = שאלה 1..6). Marks reflect the
   learner's actual first-resolution correctness.
   ═══════════════════════════════════════════════════════════ */
const QPROG_INDEX = { s14: 0, s15: 1, s16: 2, s17: 3, s18: 4, s19: 5 };
const practiceResults = [null, null, null, null, null, null];
const QP_TICK = '<svg class="qp-tick" viewBox="0 0 10.4133 7.51728" fill="none"><path d="M3.36229 7.51715C3.06671 7.51727 2.78322 7.39978 2.57439 7.1906L0.192279 4.80937C-0.0640367 4.55298 -0.0640367 4.13736 0.192279 3.88096C0.448678 3.62464 0.864299 3.62464 1.1207 3.88096L3.36229 6.12255L9.29261 0.192237C9.54901 -0.064079 9.96463 -0.064079 10.221 0.192237C10.4773 0.448635 10.4773 0.864256 10.221 1.12065L4.1502 7.1906C3.94136 7.39978 3.65788 7.51727 3.36229 7.51715Z" fill="white"/></svg>';
const QP_X = '<svg class="qp-x" viewBox="0 0 10 10" fill="none"><path d="M9.76736 0.232637C9.61836 0.0836796 9.4163 0 9.20561 0C8.99492 0 8.79286 0.0836796 8.64386 0.232637L5 3.87649L1.35615 0.232637C1.20714 0.0836796 1.00508 0 0.794391 0C0.583702 0 0.381639 0.0836796 0.232637 0.232637C0.0836796 0.381639 0 0.583702 0 0.794391C0 1.00508 0.0836796 1.20714 0.232637 1.35615L3.87649 5L0.232637 8.64386C0.0836796 8.79286 0 8.99492 0 9.20561C0 9.4163 0.0836796 9.61836 0.232637 9.76736C0.381639 9.91632 0.583702 10 0.794391 10C1.00508 10 1.20714 9.91632 1.35615 9.76736L5 6.12351L8.64386 9.76736C8.79286 9.91632 8.99492 10 9.20561 10C9.4163 10 9.61836 9.91632 9.76736 9.76736C9.91632 9.61836 10 9.4163 10 9.20561C10 8.99492 9.91632 8.79286 9.76736 8.64386L6.12351 5L9.76736 1.35615C9.91632 1.20714 10 1.00508 10 0.794391C10 0.583702 9.91632 0.381639 9.76736 0.232637Z" fill="white"/></svg>';

function setPracticeResult(sid, ok) {
  const i = QPROG_INDEX[sid];
  if (i !== undefined && practiceResults[i] === null) {
    practiceResults[i] = ok;
    renderQprog(sid);
  }
}
function renderQprog(sid) {
  const host = document.getElementById(sid + '-qprog');
  if (!host) return;
  let count, cur, stateAt;
  if (QPROG_INDEX[sid] !== undefined) {
    count = practiceResults.length;
    cur = QPROG_INDEX[sid];
    stateAt = i => practiceResults[i];
  } else {
    const cfg = QPROG2[sid];
    if (!cfg) return;
    count = QSET_SIZE[cfg.set];
    cur = cfg.idx;
    stateAt = i => qprogStationState(cfg.set, i);
  }
  let html = '';
  for (let i = 0; i < count; i++) {
    const r = stateAt(i);
    const st = r === true ? 'is-correct' : r === false ? 'is-wrong' : i === cur ? 'is-current' : '';
    html += '<div class="qprog-station ' + st + '">' +
            '<span class="qprog-dot">' + QP_TICK + QP_X + '</span>' +
            '<span class="qprog-label">سؤال ' + (i + 1) + '</span></div>';
    if (i < count - 1) {
      html += '<span class="qprog-line' + (r !== null ? ' is-done' : '') + '"></span>';
    }
  }
  host.innerHTML = html;
}

/* ═══════════════════════════════════════════════════════════
   S12 + S15 — practice MultipleChoiceQuestion screens on the shared
   mcq engine (keys per the script's V badges).
   ═══════════════════════════════════════════════════════════ */
MCQ.s12 = {
  id: 's12', correctIds: new Set(['a', 'b', 'd']), maxAttempts: 2,
  selected: new Set(), attempts: 0, answered: false, done: false, lastWrong: null,
  popups: {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق، هل نحاول مجدداً؟', body: [] },
    correct: { bg: '#edf8ed', title: 'إجابة صحيحة!', body: [
      'النسبة بين عدد الماسات السوداء وعدد الماسات البيضاء هي <span dir="ltr">100: 25</span>، نظرًا لأن عدد الماسات السوداء مكتوب أولاً في الكتابة اللفظية.',
      'النسبة المختزلة هي <span dir="ltr">4:1</span>.',
      'معنى النسبة هو أن عدد الماسات السوداء يساوي 4 أضعاف عدد الماسات البيضاء.',
    ] },
    wrong2:  { bg: '#ffdbdc', title: 'هذا غير دقيق، تم عرض الإجابة الصحيحة.<br>هيا نفهم لماذا:', body: [
      'النسبة بين عدد الماسات السوداء وعدد الماسات البيضاء هي <span dir="ltr">100: 25</span>، نظرًا لأن عدد الماسات السوداء مكتوب أولًا في الكتابة اللفظية.',
      'النسبة المختزلة هي <span dir="ltr">4:1</span>.',
      'معنى النسبة هو أن عدد الماسات السوداء أكبر بـ 4 أضعاف من عدد الماسات البيضاء.',
    ] },
  },
};
MCQ.s15 = {
  id: 's15', correctIds: new Set(['a', 'b']), maxAttempts: 2,
  selected: new Set(), attempts: 0, answered: false, done: false, lastWrong: null,
  popups: {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق، هل نحاول مجدداً؟', body: [] },
    correct: { bg: '#edf8ed', title: 'ممتاز!', body: [
      'يمكن تسعير فقط الرزم التي تحافظ على النسبة الأصلية  <span dir="ltr">3: 4</span> بين نوعي كرات الشوكولاتة.',
      'في الرزمة الأولى، نوعا الكرات تضاعفا بمقدار الضعفين، ولذلك فهما يحافظان على النسبة <span dir="ltr">3: 4</span>.',
      'في الرزمة الثانية، نوعا الكرات تضاعفا بمقدار 1.5 ضعف ، ولذلك فهما  يحافظان على النسبة <span dir="ltr">3: 4</span>.',
    ] },
    wrong2:  { bg: '#ffdbdc', title: 'هذا غير دقيق، تم عرض الإجابة الصحيحة.<br>هيا نفهم لماذا:', body: [
      'يمكن تسعير الرزم فقط التي تحافظ على النسبة الأصلية <span dir="ltr">3: 4</span> بين نوعي كرات الشوكولاتة.',
      'في الرزمة الأولى، زاد نوعا الكرات بالضعف، ولذلك يحافظان على النسبة <span dir="ltr">3: 4</span>.',
      'في الرزمة الثانية، زاد نوعا الكرات بمقدار 1.5 ضعف، ولذلك يحافظان على النسبة <span dir="ltr">3: 4</span>.',
    ] },
  },
};
function s12Toggle(id) { mcqToggle(MCQ.s12, id); }
function s15Toggle(id) { mcqToggle(MCQ.s15, id); }
function s12Check() {
  const q = MCQ.s12;
  const was = q.answered;
  mcqCheck(q);
  if (!was && q.answered) { hideHintButton('s12'); }
}
function s15Check() {
  const q = MCQ.s15;
  const was = q.answered;
  mcqCheck(q);
  if (!was && q.answered) {
    hideHintButton('s15');
    setPracticeResult('s15', setsEqual(q.selected, q.correctIds));
    /* mcqFinish already flushed, but it ran BEFORE the line above — so that write
       carried the answer without the score it feeds. Flush again now that the
       practice strip has been recorded. */
    try { flushResumeSave(); } catch (e) {}
  }
}

/* ═══════════════════════════════════════════════════════════
   S14 — DropdownQuestion (slide 31, pizzas). Correct: ב, א, ג, ג.
   Statement 3's key is ג by the math AND the slide's own feedback
   (the mock's א contradicts both — flagged to the producer).
   ═══════════════════════════════════════════════════════════ */
const S14_CORRECT = ['b', 'a', 'c', 'c'];
const S14_EXPLAIN = [
  'في البيتزا أ يوجد 2 حصة فطر و6 حصص زيتون،<br>لذلك النسبة هي <span dir="ltr">2: 6</span>، ويمكن اختزالها إلى <span dir="ltr">1: 3</span>.',
  'في بيتزا ب يوجد 3 حصص فطر و5 حصص زيتون،<br>لذلك النسبة هي <span dir="ltr">3: 5</span>.',
  'في البيتزا ج يوجد 6 حصص فطر و-2 حصص زيتون،<br>لذلك النسبة هي <span dir="ltr">6: 2</span>، ويمكن اختزالها إلى <span dir="ltr">3:1</span>.',
];
let s14Attempts = 0, s14Done = false, s14LastWrong = null;

function s14Values() {
  return [0, 1, 2, 3].map(i => document.getElementById('s14-sel-' + i).value);
}
function s14OnChange() {
  if (s14Done) return;
  if (s14Attempts > 0) {
    document.querySelectorAll('#s14 .dq-select').forEach(el => el.classList.remove('error', 'correct'));
    document.getElementById('s14-popup')?.classList.add('hidden');
  }
  const vals = s14Values();
  const chk = document.getElementById('s14-check');
  if (chk) chk.disabled = vals.some(v => !v) || JSON.stringify(vals) === s14LastWrong;
}
function s14ShowPopup(type) {
  const cfg = {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق، هل نحاول مجدداً؟', body: [] },
    correct: { bg: '#edf8ed', title: 'أصبتم!', body: S14_EXPLAIN },
    wrong2:  { bg: '#ffdbdc', title: 'هذا غير دقيق، تم عرض الإجابة الصحيحة.<br>هيا نفهم لماذا:', body: S14_EXPLAIN },
  }[type];
  const popup = document.getElementById('s14-popup');
  if (!popup) return;
  popup.style.background = cfg.bg;
  resetPopupPosition(popup);
  document.getElementById('s14-popup-title').innerHTML = cfg.title;
  document.getElementById('s14-popup-body').innerHTML = cfg.body.map(x => '<p>' + x + '</p>').join('');
  popup.classList.remove('hidden');
  window._lastPopup = window._lastPopup || {};
  window._lastPopup[popup.id] = true;
}
function s14Check() {
  if (s14Done) { advanceScreen(); return; }
  const vals = s14Values();
  if (vals.some(v => !v)) return;
  s14Attempts++;
  const allOk = vals.every((v, i) => v === S14_CORRECT[i]);
  /* Before the branches: the final-wrong branch writes the correct letter into every
     dropdown, which would otherwise be reported as the learner's answer. */
  try {
    reportAnswer('s14', allOk, allOk || s14Attempts >= 2,
      xapiFieldsAnswer(S14_CORRECT.map(function (_, i) { return 's14-sel-' + i; })));
  } catch (e) { console.error('[xAPI] s14', e); }
  const finish = (ok) => {
    s14Done = true;
    document.querySelectorAll('#s14 .dq-select').forEach(el => { el.disabled = true; });
    const chk = document.getElementById('s14-check');
    if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
    hideHintButton('s14');
    setPracticeResult('s14', ok);
    try { flushResumeSave(); } catch (e) {}
  };
  if (allOk) {
    vals.forEach((v, i) => document.getElementById('s14-sel-' + i).classList.add('correct'));
    s14ShowPopup('correct');
    finish(true);
  } else if (s14Attempts >= 2) {
    // reveal: set every dropdown to its correct letter (slide's own
    // "התשובות הנכונות מוצגות על השקף")
    S14_CORRECT.forEach((v, i) => {
      const el = document.getElementById('s14-sel-' + i);
      el.value = v;
      el.classList.remove('error');
      el.classList.add('correct');
    });
    s14ShowPopup('wrong2');
    finish(false);
  } else {
    /* a first attempt marks BOTH sides: the rows that are already right turn
       green, not just the wrong ones red (producer 03.09) */
    vals.forEach((v, i) => {
      document.getElementById('s14-sel-' + i)
        .classList.add(v === S14_CORRECT[i] ? 'correct' : 'error');
    });
    s14LastWrong = JSON.stringify(vals);
    s14ShowPopup('retry');
    const chk = document.getElementById('s14-check');
    if (chk) chk.disabled = true;
  }
}
function s14Reset() {
  s14Attempts = 0; s14LastWrong = null;
  document.querySelectorAll('#s14 .dq-select').forEach(el => {
    el.value = ''; el.disabled = false; el.classList.remove('error', 'correct');
  });
  const chk = document.getElementById('s14-check');
  if (chk) { setNavLabel(chk, 'هل إجابتي صحيحة؟'); chk.disabled = true; }
}

/* ═══════════════════════════════════════════════════════════
   S16 — ValueInputQuestion (slide 33): four box prices.
   ═══════════════════════════════════════════════════════════ */
const S16_CORRECT = [40, 30, 10, 100];
const S16_EXPLAIN = [
  'في كل الرزم، حُفظت النسبة  <span dir="ltr">3: 4</span>..',
  'سعر الة بالنسبة <span dir="ltr">3: 4</span> هو 20 شيكل.',
  'لحساب أسعار الرزم، سنفهم بكم مرة كبُرت كل رزمة ونضرب السعر في هذا العدد.',
];
let s16Attempts = 0, s16Done = false, s16LastWrong = null;

function s16Values() {
  return [0, 1, 2, 3].map(i => document.getElementById('s16-in-' + i).value.trim());
}
function s16OnInput() {
  if (s16Done) return;
  if (s16Attempts > 0) {
    document.querySelectorAll('#s16 .viq-input-box').forEach(el => el.classList.remove('error', 'correct'));
    document.getElementById('s16-popup')?.classList.add('hidden');
  }
  const vals = s16Values();
  const chk = document.getElementById('s16-check');
  if (chk) chk.disabled = vals.some(v => v === '') || JSON.stringify(vals) === s16LastWrong;
}
function s16ShowPopup(type) {
  const cfg = {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق، هل نحاول مجدداً؟', body: [] },
    correct: { bg: '#edf8ed', title: 'ممتاز!', body: S16_EXPLAIN },
    wrong2:  { bg: '#ffdbdc', title: 'هذا غير دقيق، تم عرض الإجابة الصحيحة.<br>هيا نفهم لماذا:', body: S16_EXPLAIN.concat(['الإجابات الصحيحة معروضة.']) },
  }[type];
  const popup = document.getElementById('s16-popup');
  if (!popup) return;
  popup.style.background = cfg.bg;
  resetPopupPosition(popup);
  document.getElementById('s16-popup-title').innerHTML = cfg.title;
  document.getElementById('s16-popup-body').innerHTML = cfg.body.map(x => '<p>' + x + '</p>').join('');
  popup.classList.remove('hidden');
  window._lastPopup = window._lastPopup || {};
  window._lastPopup[popup.id] = true;
}
function s16Check() {
  if (s16Done) { advanceScreen(); return; }
  const vals = s16Values();
  if (vals.some(v => v === '')) return;
  s16Attempts++;
  const allOk = vals.every((v, i) => Number(v) === S16_CORRECT[i]);
  try {
    reportAnswer('s16', allOk, allOk || s16Attempts >= 2,
      xapiFieldsAnswer(S16_CORRECT.map(function (_, i) { return 's16-in-' + i; })));
  } catch (e) { console.error('[xAPI] s16', e); }
  const finish = (ok) => {
    s16Done = true;
    document.querySelectorAll('#s16 .viq-input-box').forEach(el => { el.disabled = true; });
    const chk = document.getElementById('s16-check');
    if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
    hideHintButton('s16');
    setPracticeResult('s16', ok);
    try { flushResumeSave(); } catch (e) {}
  };
  if (allOk) {
    document.querySelectorAll('#s16 .viq-input-box').forEach(el => el.classList.add('correct'));
    s16ShowPopup('correct');
    finish(true);
  } else if (s16Attempts >= 2) {
    S16_CORRECT.forEach((v, i) => {
      const el = document.getElementById('s16-in-' + i);
      el.value = v;
      el.classList.remove('error');
      el.classList.add('correct');
    });
    s16ShowPopup('wrong2');
    finish(false);
  } else {
    vals.forEach((v, i) => {
      if (Number(v) !== S16_CORRECT[i]) document.getElementById('s16-in-' + i).classList.add('error');
    });
    s16LastWrong = JSON.stringify(vals);
    s16ShowPopup('retry');
    const chk = document.getElementById('s16-check');
    if (chk) chk.disabled = true;
  }
}
function s16Reset() {
  s16Attempts = 0; s16LastWrong = null;
  document.querySelectorAll('#s16 .viq-input-box').forEach(el => {
    el.value = ''; el.disabled = false; el.classList.remove('error', 'correct');
  });
  const chk = document.getElementById('s16-check');
  if (chk) { setNavLabel(chk, 'هل إجابتي صحيحة؟'); chk.disabled = true; }
}

/* ═══════════════════════════════════════════════════════════
   S17/S18 — flower-bouquet applet (slides 34-35). +/- buttons
   grow/shrink the bouquet; check passes on the price-matched
   multiple of the base 5-pink/9-white bouquet.
   Flower slots: deterministic sunflower-spiral positions inside the
   wreath so any count 0-30 lays out organically without overlap.
   ═══════════════════════════════════════════════════════════ */
/* Bouquet sprites are INLINED as data URIs: they are injected by JS after
   the screen is shown, so a cold network made them appear late or not at
   all on the QA server (producer 17.08.26). Inline = no second request,
   no cache race, no path resolution — they exist the moment main.js does. */
const SPRITE = {
  'flower-pink.png': 'data:image/png;base64,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',
  'flower-white.png': 'data:image/png;base64,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',
  'candy-bar.svg': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MiA0OCIgcm9sZT0iaW1nIj4KPGRlZnM+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJjVG9wIiB4MT0iMCIgeTE9IjAiIHgyPSIwLjMiIHkyPSIxIj4KICAgIDxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzhmNWEyYyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzZiM2YxYiIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJjRmFjZSIgeDE9IjAiIHkxPSIwIiB4Mj0iMC4yNSIgeTI9IjEiPgogICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjN2I0YTIyIi8+PHN0b3Agb2Zmc2V0PSIwLjU1IiBzdG9wLWNvbG9yPSIjNjMzOTFhIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM0YTI5MTMiLz4KICA8L2xpbmVhckdyYWRpZW50PgogIDxsaW5lYXJHcmFkaWVudCBpZD0id3JhcCIgeDE9IjAiIHkxPSIwIiB4Mj0iMCIgeTI9IjEiPgogICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZjJmNGY3Ii8+PHN0b3Agb2Zmc2V0PSIwLjQ1IiBzdG9wLWNvbG9yPSIjY2RkNGRjIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM5YWE1YjEiLz4KICA8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxlbGxpcHNlIGN4PSIzNyIgY3k9IjQzLjUiIHJ4PSIyNyIgcnk9IjMuNCIgZmlsbD0iIzAwMCIgb3BhY2l0eT0iMC4xMyIvPgo8IS0tIGJhciBib2R5OiB0b3AgZmFjZSArIGZyb250IGZhY2UgLS0+CjxwYXRoIGQ9Ik0xMCwxNCBMNjAsMTAgTDY3LDE1IEwxNywxOSBaIiBmaWxsPSJ1cmwoI2NUb3ApIi8+CjxwYXRoIGQ9Ik0xNywxOSBMNjcsMTUgTDY3LDM1IEwxNyw0MSBaIiBmaWxsPSJ1cmwoI2NGYWNlKSIvPgo8cGF0aCBkPSJNMTAsMTQgTDE3LDE5IEwxNyw0MSBMMTAsMzUgWiIgZmlsbD0iIzQyMjQwZiIvPgo8IS0tIHNlZ21lbnQgZ3Jvb3ZlcyBvbiB0aGUgZnJvbnQgZmFjZSAtLT4KPGcgc3Ryb2tlPSIjM2ExZjBkIiBzdHJva2Utd2lkdGg9IjEuNSIgb3BhY2l0eT0iMC44NSI+CiAgPHBhdGggZD0iTTMzLjYsMTcuNyBMMzMuNiwzOS43Ii8+PHBhdGggZD0iTTUwLjMsMTYuNCBMNTAuMywzNy40Ii8+CiAgPHBhdGggZD0iTTE3LDMwLjYgTDY3LDI1LjQiLz4KPC9nPgo8ZyBzdHJva2U9IiNhNDcwM2MiIHN0cm9rZS13aWR0aD0iMC45IiBvcGFjaXR5PSIwLjU1Ij4KICA8cGF0aCBkPSJNMzUsMTcuNSBMMzUsMzkuNSIvPjxwYXRoIGQ9Ik01MS43LDE2LjIgTDUxLjcsMzcuMiIvPgogIDxwYXRoIGQ9Ik0xNywzMiBMNjcsMjYuOCIvPgo8L2c+CjwhLS0gZ2xvc3MgLS0+CjxwYXRoIGQ9Ik0xOSwyMC42IEwzMSwxOS42IEwzMSwyMiBMMTksMjMgWiIgZmlsbD0iI2M5OGQ0ZiIgb3BhY2l0eT0iMC4zNSIvPgo8IS0tIGZvaWwgd3JhcHBlciBwZWVsZWQgYXQgdGhlIGxlZnQgZW5kIC0tPgo8cGF0aCBkPSJNNCwxNyBMMTIsMTMuNCBMMTUuNSwxNyBMMTUuNSwzOCBMMTEsNDEuNSBMNCwzNyBaIiBmaWxsPSJ1cmwoI3dyYXApIi8+CjxwYXRoIGQ9Ik00LDE3IEwxMiwxMy40IEwxNS41LDE3IEw3LjYsMjAuNCBaIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjYiLz4KPHBhdGggZD0iTTcuNiwyMC40IEw3LjYsNDAuNCIgc3Ryb2tlPSIjOGU5OWE2IiBzdHJva2Utd2lkdGg9IjAuOSIgb3BhY2l0eT0iMC44IiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0xMS4yLDE5IEwxMS4yLDM5LjQiIHN0cm9rZT0iIzhlOTlhNiIgc3Ryb2tlLXdpZHRoPSIwLjciIG9wYWNpdHk9IjAuNiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4=',
  'candy-piece.svg': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MiA0OCIgcm9sZT0iaW1nIj4KPGRlZnM+CiAgPHJhZGlhbEdyYWRpZW50IGlkPSJiYWxsIiBjeD0iMC4zNiIgY3k9IjAuMyIgcj0iMC43OCI+CiAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZjlkYjIiLz48c3RvcCBvZmZzZXQ9IjAuNDIiIHN0b3AtY29sb3I9IiNlZjRmNzAiLz4KICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2I0MWY0MiIvPgogIDwvcmFkaWFsR3JhZGllbnQ+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJ0dyIgeDE9IjAiIHkxPSIwIiB4Mj0iMCIgeTI9IjEiPgogICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmY4YmE2Ii8+PHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiNlNTM5NWMiLz4KICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2E4MWMzZCIvPgogIDwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPGVsbGlwc2UgY3g9IjM2IiBjeT0iNDMuNSIgcng9IjIxIiByeT0iMy4yIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEzIi8+CjwhLS0gbGVmdCB0d2lzdCAtLT4KPHBhdGggZD0iTTIwLDI0IEMxMywxNiA4LDEyIDMsMTAgQzYsMTcgNiwzMSAzLDM4IEM4LDM2IDEzLDMyIDIwLDI0IFoiIGZpbGw9InVybCgjdHcpIi8+CjxnIHN0cm9rZT0iIzhlMTczMyIgc3Ryb2tlLXdpZHRoPSIwLjkiIG9wYWNpdHk9IjAuNTUiIGZpbGw9Im5vbmUiPgogIDxwYXRoIGQ9Ik04LDEzLjUgQzEwLDIwIDEwLDI4IDgsMzQuNSIvPjxwYXRoIGQ9Ik0xMywxNi41IEMxNSwyMSAxNSwyNyAxMywzMS41Ii8+CjwvZz4KPCEtLSByaWdodCB0d2lzdCAtLT4KPHBhdGggZD0iTTUyLDI0IEM1OSwxNiA2NCwxMiA2OSwxMCBDNjYsMTcgNjYsMzEgNjksMzggQzY0LDM2IDU5LDMyIDUyLDI0IFoiIGZpbGw9InVybCgjdHcpIi8+CjxnIHN0cm9rZT0iIzhlMTczMyIgc3Ryb2tlLXdpZHRoPSIwLjkiIG9wYWNpdHk9IjAuNTUiIGZpbGw9Im5vbmUiPgogIDxwYXRoIGQ9Ik02NCwxMy41IEM2MiwyMCA2MiwyOCA2NCwzNC41Ii8+PHBhdGggZD0iTTU5LDE2LjUgQzU3LDIxIDU3LDI3IDU5LDMxLjUiLz4KPC9nPgo8IS0tIGdhdGhlcmVkIHBpbmNoIHBvaW50cyAtLT4KPGVsbGlwc2UgY3g9IjIxLjUiIGN5PSIyNCIgcng9IjMiIHJ5PSI2IiBmaWxsPSIjYzcyYTRkIi8+CjxlbGxpcHNlIGN4PSI1MC41IiBjeT0iMjQiIHJ4PSIzIiByeT0iNiIgZmlsbD0iI2M3MmE0ZCIvPgo8IS0tIGJvZHkgLS0+CjxlbGxpcHNlIGN4PSIzNiIgY3k9IjI0IiByeD0iMTYiIHJ5PSIxNSIgZmlsbD0idXJsKCNiYWxsKSIvPgo8ZWxsaXBzZSBjeD0iMzYiIGN5PSIyNCIgcng9IjE2IiByeT0iMTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzllMTgzOSIgc3Ryb2tlLXdpZHRoPSIxLjIiIG9wYWNpdHk9IjAuNSIvPgo8IS0tIHdyYXBwZXIgdHdpc3QgY3JlYXNlcyBhY3Jvc3MgdGhlIGJvZHkgLS0+CjxnIHN0cm9rZT0iI2ZmZDdlMCIgc3Ryb2tlLXdpZHRoPSIxLjEiIG9wYWNpdHk9IjAuNCIgZmlsbD0ibm9uZSI+CiAgPHBhdGggZD0iTTIzLDE3IEMyOSwyMCA0MywyMCA0OSwxNyIvPjxwYXRoIGQ9Ik0yMywzMSBDMjksMjggNDMsMjggNDksMzEiLz4KPC9nPgo8IS0tIGhpZ2hsaWdodCAtLT4KPGVsbGlwc2UgY3g9IjMwIiBjeT0iMTcuNSIgcng9IjYuNCIgcnk9IjQuMiIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC41NSIgdHJhbnNmb3JtPSJyb3RhdGUoLTI4IDMwIDE3LjUpIi8+CjxjaXJjbGUgY3g9IjQyLjUiIGN5PSIzMC41IiByPSIyIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+',
};
function spriteSrc(name) { return SPRITE[name] || ('../unit-assets/img/' + name); }

const BQ = {
  s17: { pink: 5, white: 9, target: { pink: 10, white: 18 }, attempts: 0, done: false, lastWrong: null,
         explain: [
           'السعر 56 ش.ج أكبر بضعفين من السعر الأصلي للباقة.',
           'لذلك، سنضرب عدد الأزهار أيضاً في 2 ونحصل على 10 أزهار وردية و-18 زهرة بيضاء.',
         ],
         correctTitle: 'هذه إجابة دقيقة!', wrongTitle: 'هذا خطأ، الإجابة الصحيحة معروضة.<br>هيا نفهم لماذا:' },
  s18: { pink: 5, white: 9, target: { pink: 15, white: 27 }, attempts: 0, done: false, lastWrong: null,
         explain: [
           'السعر 84 ش.ج أكبر بـ 3 أضعاف من السعر الأصلي للباقة.',
           'لذلك، سنضرب أيضاً أعداد الازهار في 3 ونحصل على 15 زهرة وردية و27 زهرة بيضاء.',
         ],
         correctTitle: 'صحيح!', wrongTitle: 'هذا خطأ، الإجابة الصحيحة معروضة.<br>هيا نفهم لماذا:' },
};
const BQ_MAX = 40;

/* golden-angle spiral slot positions (percent of the stage box) */
function bqSlot(i, n) {
  const angle = i * 2.39996323;             // golden angle in radians
  /* n scales the spiral to the ACTUAL count: the bouquet keeps the fixed
     BQ_MAX field (its look is approved), the candy applet passes its own
     count so 3 items spread across the basket instead of bunching up. */
  const r = 8 + 34 * Math.sqrt((i + 0.5) / (n || BQ_MAX));
  return {
    x: 50 + r * Math.cos(angle),
    y: 50 + r * Math.sin(angle) * 0.92,
  };
}
function bqKinds(st) {
  // default (bouquet) kinds; applet variants override via st.kinds
  return st.kinds || {
    a: { key: 'pink', img: 'flower-pink.png' },
    b: { key: 'white', img: 'flower-white.png' },
  };
}
function bqRender(sid) {
  const st = BQ[sid];
  const host = document.getElementById(sid + '-flowers');
  if (!host) return;
  const kinds = bqKinds(st);
  const nA = st[kinds.a.key], nB = st[kinds.b.key];
  const total = [];
  if (st.kinds) {
    /* applet variants (candy box): interleave the two kinds so neither is
       buried in the middle of the spiral, then paint back-to-front so the
       lower items overlap the higher ones instead of the other way round. */
    let ia = 0, ib = 0;
    while (ia < nA || ib < nB) {
      const takeA = ib >= nB || (ia < nA && (ia + 0.5) / (nA || 1) <= (ib + 0.5) / (nB || 1));
      total.push(takeA ? kinds.a.img : kinds.b.img);
      takeA ? ia++ : ib++;
    }
  } else {
    for (let i = 0; i < nA; i++) total.push(kinds.a.img);
    for (let i = 0; i < nB; i++) total.push(kinds.b.img);
  }
  const span = st.kinds ? Math.max(total.length, 5) : BQ_MAX;
  let placed = total.map((img, i) => ({ img: img, pos: bqSlot(i, span) }));
  if (st.kinds) placed.sort((p, q) => p.pos.y - q.pos.y);
  host.innerHTML = placed.map(p =>
    '<img src="' + spriteSrc(p.img) + '" alt="" style="left:' +
    p.pos.x.toFixed(1) + '%; top:' + p.pos.y.toFixed(1) + '%;">').join('');
  [kinds.a.key, kinds.b.key].forEach(k => {
    const el = document.getElementById(sid + '-count-' + k);
    if (el) el.textContent = st[k];
  });
}
function bqAdd(sid, kind, delta) {
  const st = BQ[sid];
  if (st.done) return;
  const kinds = bqKinds(st);
  st[kind] = Math.max(0, Math.min(BQ_MAX, st[kind] + delta));
  if (st.attempts > 0) {
    [kinds.a.key, kinds.b.key].forEach(k =>
      document.getElementById(sid + '-count-' + k)?.classList.remove('error', 'correct'));
    document.getElementById(sid + '-popup')?.classList.add('hidden');
  }
  const chk = document.getElementById(sid + '-check');
  if (chk) chk.disabled = JSON.stringify([st[kinds.a.key], st[kinds.b.key]]) === st.lastWrong;
  bqRender(sid);
}
function bqShowPopup(sid, type) {
  const st = BQ[sid];
  const cfg = {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق، هل نحاول مجدداً؟', body: [] },
    correct: { bg: '#edf8ed', title: st.correctTitle, body: st.explain },
    wrong2:  { bg: '#ffdbdc', title: st.wrongTitle, body: st.explain },
  }[type];
  const popup = document.getElementById(sid + '-popup');
  if (!popup) return;
  popup.style.background = cfg.bg;
  resetPopupPosition(popup);
  document.getElementById(sid + '-popup-title').innerHTML = cfg.title;
  document.getElementById(sid + '-popup-body').innerHTML = cfg.body.map(x => '<p>' + x + '</p>').join('');
  popup.classList.remove('hidden');
  window._lastPopup = window._lastPopup || {};
  window._lastPopup[popup.id] = true;
}
function bqCheck(sid) {
  const st = BQ[sid];
  if (st.done) { advanceScreen(); return; }
  const kinds = bqKinds(st);
  const kA = kinds.a.key, kB = kinds.b.key;
  st.attempts++;
  const ok = st[kA] === st.target[kA] && st[kB] === st.target[kB];
  /* Before the branches: the final-wrong branch overwrites the counters with the
     target values, so the learner's own counts only exist until then. */
  try {
    var _bqAns = {};
    _bqAns[kA] = st[kA];
    _bqAns[kB] = st[kB];
    reportAnswer(sid, ok, ok || st.attempts >= 2, xapiFieldsAnswer([kA, kB], _bqAns));
  } catch (e) { console.error('[xAPI] ' + sid, e); }
  const pc = document.getElementById(sid + '-count-' + kA);
  const wc = document.getElementById(sid + '-count-' + kB);
  const finish = (wasOk) => {
    st.done = true;
    document.querySelectorAll('#' + sid + ' .bq-btn').forEach(b => { b.disabled = true; });
    const chk = document.getElementById(sid + '-check');
    if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
    hideHintButton(sid);
    // part-01 bouquet screens use the part-01 strip; later applets use set strips
    if (QPROG_INDEX[sid] !== undefined) setPracticeResult(sid, wasOk);
    else setPracticeResult2(sid, wasOk);
    try { flushResumeSave(); } catch (e) {}
  };
  if (ok) {
    pc?.classList.add('correct'); wc?.classList.add('correct');
    bqShowPopup(sid, 'correct');
    finish(true);
  } else if (st.attempts >= 2) {
    st[kA] = st.target[kA]; st[kB] = st.target[kB];
    bqRender(sid);
    pc?.classList.remove('error'); wc?.classList.remove('error');
    pc?.classList.add('correct'); wc?.classList.add('correct');
    bqShowPopup(sid, 'wrong2');
    finish(false);
  } else {
    if (st[kA] !== st.target[kA]) pc?.classList.add('error');
    if (st[kB] !== st.target[kB]) wc?.classList.add('error');
    st.lastWrong = JSON.stringify([st[kA], st[kB]]);
    bqShowPopup(sid, 'retry');
    const chk = document.getElementById(sid + '-check');
    if (chk) chk.disabled = true;
  }
}
function bqEnter(sid) {
  bqRender(sid);
  // paint again on the next frame: the producer saw empty stages on first
  // load in the client's viewer, so never rely on a single pass.
  requestAnimationFrame(() => bqRender(sid));
}

/* ── self-healing sweep ──────────────────────────────────────
   The applet stages are the only artwork this unit builds from JS, and
   on the client's QA viewer they came up empty on a first load (never
   reproducible locally). Instead of guessing at the cause, re-assert the
   DOM whenever it disagrees with the state it is supposed to show.
   bqRender is idempotent and cheap, so an extra pass costs nothing. */
function bqExpectedCount(sid) {
  const st = BQ[sid];
  if (!st) return 0;
  const k = bqKinds(st);
  return st[k.a.key] + st[k.b.key];
}
function bqSweep() {
  Object.keys(BQ).forEach(sid => {
    const host = document.getElementById(sid + '-flowers');
    if (host && host.childElementCount !== bqExpectedCount(sid)) bqRender(sid);
  });
  s19qPaint();                                  // static bouquet, self-guarded
}
window.addEventListener('load', () => {
  // bounded watchdog: sweep every 400ms for the first ~5s after load, which
  // covers a slow viewer without leaving a timer running for the session.
  bqSweep();
  let ticks = 0;
  const id = setInterval(() => { bqSweep(); if (++ticks >= 12) clearInterval(id); }, 400);
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) bqSweep(); });

/* ═══════════════════════════════════════════════════════════
   S19 — SingleChoiceQuestion (slide 36): 70₪ → ×2.5 → half flowers,
   so the correct answer is לא. percent-02 single-choice policy:
   first wrong marks the pick + retry; final wrong reveals both.
   The side illustration is the ORIGINAL bouquet (5/9), rendered by
   the same spiral placer.
   ═══════════════════════════════════════════════════════════ */
const S19Q = { correctId: 'b', maxAttempts: 2 };
let s19qSelected = null, s19qAttempts = 0, s19qDone = false, s19qLastWrong = null;

function s19qSelect(id) {
  if (s19qDone) return;
  s19qSelected = id;
  if (s19qAttempts > 0) {
    document.querySelectorAll('#s19 .scq-opt').forEach(o => o.classList.remove('wrong', 'correct'));
    document.getElementById('s19-popup')?.classList.add('hidden');
  }
  document.querySelectorAll('#s19 .scq-opt').forEach(o => {
    const sel = o.dataset.id === id;
    o.classList.toggle('selected', sel);
    o.setAttribute('aria-checked', sel ? 'true' : 'false');
  });
  const chk = document.getElementById('s19-check');
  if (chk) chk.disabled = s19qSelected === s19qLastWrong;
}
const S19Q_EXPLAIN = ['الباقة الأصلية تكلف 28 شيكل، وهي تضم 5 زهور وردية و-9 زهور بيضاء. للوصول إلى 70 شيكل، يجب تكبير الباقة بمقدار 2.5 ضعفًا، وحينئذ سنحصل على أنصاف زهور، بحيث لا يمكن تصميم باقة كهذه.'];
function s19qShowPopup(type) {
  const cfg = {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق، هل نحاول مجدداً؟', body: [] },
    correct: { bg: '#edf8ed', title: 'كل الاحترام!', body: S19Q_EXPLAIN },
    wrong2:  { bg: '#ffdbdc', title: 'هذا غير دقيق، تم عرض الإجابة الصحيحة.<br>هيا نفهم لماذا:', body: S19Q_EXPLAIN },
  }[type];
  const popup = document.getElementById('s19-popup');
  if (!popup) return;
  popup.style.background = cfg.bg;
  resetPopupPosition(popup);
  document.getElementById('s19-popup-title').innerHTML = cfg.title;
  document.getElementById('s19-popup-body').innerHTML = cfg.body.map(x => '<p>' + x + '</p>').join('');
  popup.classList.remove('hidden');
  window._lastPopup = window._lastPopup || {};
  window._lastPopup[popup.id] = true;
}
function s19qCheck() {
  if (s19qDone) { advanceScreen(); return; }
  if (!s19qSelected) return;
  s19qAttempts++;
  const isCorrect = s19qSelected === S19Q.correctId;
  try {
    reportAnswer('s19', isCorrect, isCorrect || s19qAttempts >= S19Q.maxAttempts,
      xapiAnswerText(document.querySelector('#s19 .scq-opt[data-id="' + s19qSelected + '"]')));
  } catch (e) { console.error('[xAPI] s19', e); }
  const mark = (id, cls) => {
    const o = document.querySelector('#s19 .scq-opt[data-id="' + id + '"]');
    if (o) { o.classList.remove('selected'); o.classList.add(cls); }
  };
  const finish = (ok) => {
    s19qDone = true;
    document.querySelectorAll('#s19 .scq-opt').forEach(o => { o.disabled = true; });
    const chk = document.getElementById('s19-check');
    if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
    hideHintButton('s19');
    setPracticeResult('s19', ok);
    try { flushResumeSave(); } catch (e) {}
  };
  if (isCorrect) {
    mark(S19Q.correctId, 'correct');
    s19qShowPopup('correct');
    finish(true);
  } else if (s19qAttempts >= S19Q.maxAttempts) {
    mark(S19Q.correctId, 'correct');
    mark(s19qSelected, 'wrong');
    s19qShowPopup('wrong2');
    finish(false);
  } else {
    mark(s19qSelected, 'wrong');
    s19qLastWrong = s19qSelected;
    s19qShowPopup('retry');
    const chk = document.getElementById('s19-check');
    if (chk) chk.disabled = true;
  }
}
function s19qEnter() {
  requestAnimationFrame(s19qPaint);
  s19qPaint();
}
function s19qPaint() {
  // static original bouquet (5 pink / 9 white)
  const host = document.getElementById('s19-flowers');
  if (host && !host.childElementCount) {
    let html = '';
    ['pink','pink','pink','pink','pink','white','white','white','white','white','white','white','white','white'].forEach((kind, i) => {
      const angle = i * 2.39996323;
      const r = 8 + 34 * Math.sqrt((i + 0.5) / BQ_MAX);
      const x = 50 + r * Math.cos(angle), y = 50 + r * Math.sin(angle) * 0.92;
      html += '<img src="' + spriteSrc('flower-' + kind + '.png') + '" alt="" style="left:' + x.toFixed(1) + '%; top:' + y.toFixed(1) + '%;">';
    });
    host.innerHTML = html;
  }
}

/* ═══════════════════════════════════════════════════════════
   Practice sets B/C/D progress strips (slides 39-43, 45-47, 54-56).
   Stations can span two screens (a שאלה with sub-parts): the station
   resolves once ALL its screens resolve, ok = AND of the sub-results.
   ═══════════════════════════════════════════════════════════ */
const QPROG2 = {
  s21: { set: 'B', idx: 0 }, s22: { set: 'B', idx: 1 }, s23: { set: 'B', idx: 2 },
  s24: { set: 'B', idx: 3 }, s25: { set: 'B', idx: 3 },
  s27: { set: 'C', idx: 0 }, s28: { set: 'C', idx: 0 }, s29: { set: 'C', idx: 1 },
  s34: { set: 'D', idx: 0 }, s35: { set: 'D', idx: 1 }, s36: { set: 'D', idx: 2 },
};
const QSET_SIZE = { B: 4, C: 2, D: 3 };
const qprogSubResults = {};   // sid → true/false once resolved

function setPracticeResult2(sid, ok) {
  if (qprogSubResults[sid] === undefined) {
    qprogSubResults[sid] = ok;
    renderQprog(sid);
  }
}
function qprogStationState(setKey, idx) {
  const sids = Object.keys(QPROG2).filter(k => QPROG2[k].set === setKey && QPROG2[k].idx === idx);
  const resolved = sids.every(k => qprogSubResults[k] !== undefined);
  if (!resolved) return null;
  return sids.every(k => qprogSubResults[k] === true);
}

/* ═══════════════════════════════════════════════════════════
   S21 (slide 39) — reduce five ratios. Two boxes per row; the pair
   must equal the fully-reduced form.
   ═══════════════════════════════════════════════════════════ */
const S21_ANS = [[1, 2], [3, 4], [5, 3], [2, 5], [5, 16]];
const S21_BODY = ['لاختزال النسبة، نقسم العددين على أكبر عدد ممكن.'];
let s21Attempts = 0, s21Done = false, s21LastWrong = null;

function s21Values() {
  return S21_ANS.map((_, i) => [
    document.getElementById('s21-in-' + i + 'a').value.trim(),
    document.getElementById('s21-in-' + i + 'b').value.trim(),
  ]);
}
function s21OnInput() {
  if (s21Done) return;
  if (s21Attempts > 0) {
    document.querySelectorAll('#s21 .viq-input-box').forEach(el => el.classList.remove('error', 'correct'));
    document.getElementById('s21-popup')?.classList.add('hidden');
  }
  const vals = s21Values();
  const chk = document.getElementById('s21-check');
  if (chk) chk.disabled = vals.some(v => v[0] === '' || v[1] === '') || JSON.stringify(vals) === s21LastWrong;
}
function genericVIQPopup(sid, type, correctTitle, wrongTitle, body, revealNote) {
  const cfg = {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق، هل نحاول مجدداً؟', body: [] },
    correct: { bg: '#edf8ed', title: correctTitle, body: body },
    wrong2:  { bg: '#ffdbdc', title: wrongTitle, body: revealNote ? body.concat([revealNote]) : body },
  }[type];
  const popup = document.getElementById(sid + '-popup');
  if (!popup) return;
  popup.style.background = cfg.bg;
  resetPopupPosition(popup);
  document.getElementById(sid + '-popup-title').innerHTML = cfg.title;
  document.getElementById(sid + '-popup-body').innerHTML = cfg.body.map(x => '<p>' + x + '</p>').join('');
  popup.classList.remove('hidden');
  window._lastPopup = window._lastPopup || {};
  window._lastPopup[popup.id] = true;
}
function s21Check() {
  if (s21Done) { advanceScreen(); return; }
  const vals = s21Values();
  if (vals.some(v => v[0] === '' || v[1] === '')) return;
  s21Attempts++;
  const rowOk = vals.map((v, i) => Number(v[0]) === S21_ANS[i][0] && Number(v[1]) === S21_ANS[i][1]);
  const allOk = rowOk.every(Boolean);
  try {
    reportAnswer('s21', allOk, allOk || s21Attempts >= 2,
      xapiFieldsAnswer(S21_ANS.reduce(function (ids, _, i) {
        return ids.concat(['s21-in-' + i + 'a', 's21-in-' + i + 'b']);
      }, [])));
  } catch (e) { console.error('[xAPI] s21', e); }
  const finish = (ok) => {
    s21Done = true;
    document.querySelectorAll('#s21 .viq-input-box').forEach(el => { el.disabled = true; });
    const chk = document.getElementById('s21-check');
    if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
    hideHintButton('s21');
    setPracticeResult2('s21', ok);
    try { flushResumeSave(); } catch (e) {}
  };
  if (allOk) {
    document.querySelectorAll('#s21 .viq-input-box').forEach(el => el.classList.add('correct'));
    genericVIQPopup('s21', 'correct', 'بالضبط!', '', S21_BODY);
    finish(true);
  } else if (s21Attempts >= 2) {
    S21_ANS.forEach((ans, i) => {
      const a = document.getElementById('s21-in-' + i + 'a');
      const b = document.getElementById('s21-in-' + i + 'b');
      a.value = ans[0]; b.value = ans[1];
      a.classList.remove('error'); b.classList.remove('error');
      a.classList.add('correct'); b.classList.add('correct');
    });
    genericVIQPopup('s21', 'wrong2', '', 'غير دقيق، هيا نفهم لماذا:', S21_BODY, 'الإجابات الصحيحة معروضة.');
    finish(false);
  } else {
    rowOk.forEach((ok, i) => {
      if (!ok) {
        document.getElementById('s21-in-' + i + 'a').classList.add('error');
        document.getElementById('s21-in-' + i + 'b').classList.add('error');
      }
    });
    s21LastWrong = JSON.stringify(vals);
    genericVIQPopup('s21', 'retry');
    const chk = document.getElementById('s21-check');
    if (chk) chk.disabled = true;
  }
}

/* ═══════════════════════════════════════════════════════════
   S22 (slide 40) — expand four ratios, one blank each (sides switch
   mid-exercise — the character's "עכשיו הפוך!" callout).
   ═══════════════════════════════════════════════════════════ */
const S22_ANS = [12, 3, 20, 80];
const S22_BODY = ['لتوسيع نسبة، نضرب العددين في نفس العدد. هكذا نحصل على نسبة متكافئة.'];
let s22Attempts = 0, s22Done = false, s22LastWrong = null;

function s22Values() {
  return S22_ANS.map((_, i) => document.getElementById('s22-in-' + i).value.trim());
}
function s22OnInput() {
  if (s22Done) return;
  if (s22Attempts > 0) {
    document.querySelectorAll('#s22 .viq-input-box').forEach(el => el.classList.remove('error', 'correct'));
    document.getElementById('s22-popup')?.classList.add('hidden');
  }
  const vals = s22Values();
  const chk = document.getElementById('s22-check');
  if (chk) chk.disabled = vals.some(v => v === '') || JSON.stringify(vals) === s22LastWrong;
}
function s22Check() {
  if (s22Done) { advanceScreen(); return; }
  const vals = s22Values();
  if (vals.some(v => v === '')) return;
  s22Attempts++;
  const rowOk = vals.map((v, i) => Number(v) === S22_ANS[i]);
  const allOk = rowOk.every(Boolean);
  try {
    reportAnswer('s22', allOk, allOk || s22Attempts >= 2,
      xapiFieldsAnswer(S22_ANS.map(function (_, i) { return 's22-in-' + i; })));
  } catch (e) { console.error('[xAPI] s22', e); }
  const finish = (ok) => {
    s22Done = true;
    document.querySelectorAll('#s22 .viq-input-box').forEach(el => { el.disabled = true; });
    const chk = document.getElementById('s22-check');
    if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
    hideHintButton('s22');
    setPracticeResult2('s22', ok);
    try { flushResumeSave(); } catch (e) {}
  };
  if (allOk) {
    document.querySelectorAll('#s22 .viq-input-box').forEach(el => el.classList.add('correct'));
    genericVIQPopup('s22', 'correct', 'رائع جداً!', '', S22_BODY);
    finish(true);
  } else if (s22Attempts >= 2) {
    S22_ANS.forEach((ans, i) => {
      const el = document.getElementById('s22-in-' + i);
      el.value = ans;
      el.classList.remove('error');
      el.classList.add('correct');
    });
    genericVIQPopup('s22', 'wrong2', '', 'غير دقيق، هيا نفهم لماذا:', S22_BODY, 'الإجابات الصحيحة معروضة.');
    finish(false);
  } else {
    rowOk.forEach((ok, i) => { if (!ok) document.getElementById('s22-in-' + i).classList.add('error'); });
    s22LastWrong = JSON.stringify(vals);
    genericVIQPopup('s22', 'retry');
    const chk = document.getElementById('s22-check');
    if (chk) chk.disabled = true;
  }
}

/* ═══════════════════════════════════════════════════════════
   Generic single-choice engine (percent-02 policy) for the part-02+
   SCQ screens: S23 socks, S27 pancakes, S35 triangle.
   ═══════════════════════════════════════════════════════════ */
const SCQ = {
  s23: { correctId: 'a', selected: null, attempts: 0, done: false, lastWrong: null, practice: true,
         correctTitle: 'هذا صحيح!', wrongTitle: 'هذا خطأ، لا بأس – تعالوا نتعلّم منه:',
         body: ['النسبة هي <span dir="ltr">4: 3</span>.',
                'الكمية التي تظهر أولاً في الكتابة اللفظية تُكتب على اليسار في الكتابة الرياضية.'] },
  s27: { correctId: 'b', selected: null, attempts: 0, done: false, lastWrong: null, practice: true,
         correctTitle: 'صحيح!', wrongTitle: 'هذا خطأ، تعالوا نتعلّم منه:',
         body: ['لبناء نسبة علينا استخدام وحدات قياس متطابقة، لذلك سنحوّل كوب الحليب إلى 16 ملعقة كبيرة.',
                'في الوصفة يوجد 4 ملاعق زيت و-16 ملعقة حليب، لذلك النسبة هي <span dir="ltr">4:16</span>. النسبة المختزلة هي <span dir="ltr">1: 4</span>.'] },
  s35: { correctId: 'd', selected: null, attempts: 0, done: false, lastWrong: null, practice: true,
         correctTitle: 'كلّ الاحترام، لقد أصبتم!', wrongTitle: 'هذا خطأ – هيا نفهم لماذا:',
         body: ['مجموع طولَي الساقين هو 12 سم وطول القاعدة هو 4 سم. لذلك، النسبة هي <span dir="ltr">12: 4</span>، وبعد الاختزال<br> <span dir="ltr">3:1</span>.'] },
};
function scqSelect(sid, id) {
  const q = SCQ[sid];
  if (!q || q.done) return;
  q.selected = id;
  if (q.attempts > 0) {
    document.querySelectorAll('#' + sid + ' .scq-opt').forEach(o => o.classList.remove('wrong', 'correct'));
    document.getElementById(sid + '-popup')?.classList.add('hidden');
  }
  document.querySelectorAll('#' + sid + ' .scq-opt').forEach(o => {
    const sel = o.dataset.id === id;
    o.classList.toggle('selected', sel);
    o.setAttribute('aria-checked', sel ? 'true' : 'false');
  });
  const chk = document.getElementById(sid + '-check');
  if (chk) chk.disabled = q.selected === q.lastWrong;
}
function scqShowPopup2(sid, type) {
  const q = SCQ[sid];
  const cfg = {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق، هل نحاول مجدداً؟', body: [] },
    correct: { bg: '#edf8ed', title: q.correctTitle, body: q.body },
    wrong2:  { bg: '#ffdbdc', title: q.wrongTitle, body: q.body },
  }[type];
  const popup = document.getElementById(sid + '-popup');
  if (!popup) return;
  popup.style.background = cfg.bg;
  resetPopupPosition(popup);
  document.getElementById(sid + '-popup-title').innerHTML = cfg.title;
  document.getElementById(sid + '-popup-body').innerHTML = cfg.body.map(x => '<p>' + x + '</p>').join('');
  popup.classList.remove('hidden');
  window._lastPopup = window._lastPopup || {};
  window._lastPopup[popup.id] = true;
}
function scqCheck(sid) {
  const q = SCQ[sid];
  if (q.done) { advanceScreen(); return; }
  if (!q.selected) return;
  q.attempts++;
  const isCorrect = q.selected === q.correctId;
  try {
    reportAnswer(sid, isCorrect, isCorrect || q.attempts >= 2,
      xapiAnswerText(document.querySelector('#' + sid + ' .scq-opt[data-id="' + q.selected + '"]')));
  } catch (e) { console.error('[xAPI] ' + sid, e); }
  const mark = (id, cls) => {
    const o = document.querySelector('#' + sid + ' .scq-opt[data-id="' + id + '"]');
    if (o) { o.classList.remove('selected'); o.classList.add(cls); }
  };
  const finish = (ok) => {
    q.done = true;
    document.querySelectorAll('#' + sid + ' .scq-opt').forEach(o => { o.disabled = true; });
    const chk = document.getElementById(sid + '-check');
    if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
    hideHintButton(sid);
    if (q.practice) setPracticeResult2(sid, ok);
    try { flushResumeSave(); } catch (e) {}
  };
  if (isCorrect) {
    mark(q.correctId, 'correct');
    scqShowPopup2(sid, 'correct');
    finish(true);
  } else if (q.attempts >= 2) {
    mark(q.correctId, 'correct');
    mark(q.selected, 'wrong');
    scqShowPopup2(sid, 'wrong2');
    finish(false);
  } else {
    mark(q.selected, 'wrong');
    q.lastWrong = q.selected;
    scqShowPopup2(sid, 'retry');
    const chk = document.getElementById(sid + '-check');
    if (chk) chk.disabled = true;
  }
}
function s23Select(id) { scqSelect('s23', id); }
function s23Check()    { scqCheck('s23'); }
function s27Select(id) { scqSelect('s27', id); }
function s27Check()    { scqCheck('s27'); }
function s35Select(id) { scqSelect('s35', id); }
function s35Check()    { scqCheck('s35'); }

/* ═══════════════════════════════════════════════════════════
   S24/S25 (slides 42-43) — candy-box applet on the shared two-counter
   engine (BQ): snack/candy kinds, flat icons on a tray.
   ═══════════════════════════════════════════════════════════ */
BQ.s24 = {
  kinds: { a: { key: 'snack', img: 'candy-bar.svg' }, b: { key: 'candy', img: 'candy-piece.svg' } },
  snack: 2, candy: 4, target: { snack: 1, candy: 2 }, attempts: 0, done: false, lastWrong: null,
  explain: ['النسبة في الرزمة الأصلية هي  <span dir="ltr">2: 4</span>،  وسعرها 12 شيكل.',
            'للحصول على رزمة سعرها 6 ش.ج، نقسم السعر على 2. لذلك نقسم أيضًا عدد ألواح الشوكولاته والحلوى على 2، فنحصل على لواح شوكولاتة واحد و-2 حلوى.'],
  correctTitle: 'ممتاز!', wrongTitle: 'هذا خطأ، لكنه أيضًا فرصة للتعلم:',
};
BQ.s25 = {
  kinds: { a: { key: 'snack', img: 'candy-bar.svg' }, b: { key: 'candy', img: 'candy-piece.svg' } },
  snack: 2, candy: 4, target: { snack: 4, candy: 8 }, attempts: 0, done: false, lastWrong: null,
  explain: ['النسبة بين عدد ألواح الشوكولاتة وعدد الحلوى في الرزمة الأصلية هي <span dir="ltr">2: 4</span>، وسعرها 12 شيكل.',
            'لنحصل على رزمة سعرها 24 شيكل، نضرب السعر في 2. لذلك نضرب عدد ألواح الشوكولاتة وعدد الحلوى في 2، ونحصل على 4 ألواح شوكولاتة و8 حلو.'],
  correctTitle: 'ممتاز', wrongTitle: 'غير دقيق، هيا نفهم لماذا:',
};

/* ═══════════════════════════════════════════════════════════
   S28 (slide 46) — the ×3 recipe. Salt accepts "3/4" or 0.75.
   ═══════════════════════════════════════════════════════════ */
const S28_ANS = ['6', '3', '12', '1', '6', '3/4'];
const S28_BODY = ['ضاعفت سحر كمية أكواب الدقيق 3 مرات. للحفاظ على النسبة في الوصفة، عليها مضاعفة جميع الكميات 3 مرات.'];
let s28Attempts = 0, s28Done = false, s28LastWrong = null;

function s28RowOk(i, raw) {
  const v = raw.trim().replace(/\s+/g, '');
  const ans = S28_ANS[i];
  if (ans === '3/4') return v === '3/4' || Number(v.replace(',', '.')) === 0.75;
  return Number(v) === Number(ans);
}
function s28Values() {
  return S28_ANS.map((_, i) => document.getElementById('s28-in-' + i).value.trim());
}
function s28OnInput() {
  if (s28Done) return;
  if (s28Attempts > 0) {
    document.querySelectorAll('#s28 .viq-input-box').forEach(el => el.classList.remove('error', 'correct'));
    document.getElementById('s28-popup')?.classList.add('hidden');
  }
  const vals = s28Values();
  const chk = document.getElementById('s28-check');
  if (chk) chk.disabled = vals.some(v => v === '') || JSON.stringify(vals) === s28LastWrong;
}
function s28Check() {
  if (s28Done) { advanceScreen(); return; }
  const vals = s28Values();
  if (vals.some(v => v === '')) return;
  s28Attempts++;
  const rowOk = vals.map((v, i) => s28RowOk(i, v));
  const allOk = rowOk.every(Boolean);
  try {
    reportAnswer('s28', allOk, allOk || s28Attempts >= 2,
      xapiFieldsAnswer(S28_ANS.map(function (_, i) { return 's28-in-' + i; })));
  } catch (e) { console.error('[xAPI] s28', e); }
  const finish = (ok) => {
    s28Done = true;
    document.querySelectorAll('#s28 .viq-input-box').forEach(el => { el.disabled = true; });
    const chk = document.getElementById('s28-check');
    if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
    hideHintButton('s28');
    setPracticeResult2('s28', ok);
    try { flushResumeSave(); } catch (e) {}
  };
  if (allOk) {
    document.querySelectorAll('#s28 .viq-input-box').forEach(el => el.classList.add('correct'));
    genericVIQPopup('s28', 'correct', 'صحيح تماماً!', '', S28_BODY);
    finish(true);
  } else if (s28Attempts >= 2) {
    S28_ANS.forEach((ans, i) => {
      const el = document.getElementById('s28-in-' + i);
      el.value = ans;
      el.classList.remove('error');
      el.classList.add('correct');
    });
    genericVIQPopup('s28', 'wrong2', '', 'هذا غير دقيق، هيا نفهم لماذا:', S28_BODY, 'الإجابات الصحيحة معروضة.');
    finish(false);
  } else {
    rowOk.forEach((ok, i) => { if (!ok) document.getElementById('s28-in-' + i).classList.add('error'); });
    s28LastWrong = JSON.stringify(vals);
    genericVIQPopup('s28', 'retry');
    const chk = document.getElementById('s28-check');
    if (chk) chk.disabled = true;
  }
}

/* ═══════════════════════════════════════════════════════════
   S29 / S34 / S36 — part-02+ MCQ screens on the shared mcq engine.
   Keys per the script's V badges / feedback.
   ═══════════════════════════════════════════════════════════ */
function mcq2Popups(correctTitle, wrongTitle, body) {
  return {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق، هل نحاول مجدداً؟', body: [] },
    correct: { bg: '#edf8ed', title: correctTitle, body: body },
    wrong2:  { bg: '#ffdbdc', title: wrongTitle, body: body },
  };
}
const S29_BODY = [
  'الجمل الصحيحة هي أ، د، هـ.',
  'أ: النسبة بين كعكات الجبن وكعكات موس الشوكولاتة هي 5:10، وبعد الاختزال 1: 2.',
  'د: النسبة بين كيك الجبن وآيس كريم الفانيليا هي <span dir="ltr">5:17</span>.',
  'النسبة بين مثلجات الفانيليا وكعك موس الشوكولاتة هي 17:10، ولذلك فإن كمية المثلجات أكبر بـ 1.7 مرة من كمية الكعك.',
];
MCQ.s29 = { id: 's29', correctIds: new Set(['a', 'd', 'e']), maxAttempts: 2,
  selected: new Set(), attempts: 0, answered: false, done: false, lastWrong: null,
  popups: mcq2Popups('هذا صحيح جداً!', 'غير دقيق، هيا نفهم لماذا:', S29_BODY) };
const S34_BODY = [
  'الجملتان الصحيحتان هما ب، ج.',
  "الجملة ب' - مساحة مربَّع أ' هي 16 سم², ومساحة مربَّع ب' هي 64 سم². لذلك النسبة بينهما هي <span dir=\"ltr\">16: 64</span> = <span dir=\"ltr\">1: 4</span>.",
  "جملة ج - محيط مربَّع أ هو 16 سم ومحيط مربَّع ب هو 32 سم. لذلك نسبة بين محيط مربَّع أ ومحيط مربَّع ب هي <span dir=\"ltr\">16: 32</span> وبعد الاختزال بـ16 هي <span dir=\"ltr\">1: 2</span>.",
];
MCQ.s34 = { id: 's34', correctIds: new Set(['b', 'c']), maxAttempts: 2,
  selected: new Set(), attempts: 0, answered: false, done: false, lastWrong: null,
  popups: mcq2Popups('رائع جداً', 'غير دقيق، هيا نفهم لماذا:', S34_BODY) };
const S36_BODY = [
  'الكمية الموصى بها من الشرب للذكور فوق سن 18 هي 2.8 لتر، وللإناث فوق سن 18 هي 2 لتر، أي – 1.4 مرة.',
  'في سن 1–3 سنوات، الكمية الموصى بها من السوائل للأولاد والبنات متساوية، لذلك النسبة بين الكميتين هي <span dir="ltr">1:1</span>.',
];
MCQ.s36 = { id: 's36', correctIds: new Set(['a', 'b']), maxAttempts: 2,
  selected: new Set(), attempts: 0, answered: false, done: false, lastWrong: null,
  popups: mcq2Popups('صحيح!', 'هذا خطأ – هيا نفهم لماذا:‌', S36_BODY) };

function s29Toggle(id) { mcqToggle(MCQ.s29, id); }
function s34Toggle(id) { mcqToggle(MCQ.s34, id); }
function s36Toggle(id) { mcqToggle(MCQ.s36, id); }
function mcq2Check(sid) {
  const q = MCQ[sid];
  const was = q.answered;
  mcqCheck(q);
  if (!was && q.answered) {
    hideHintButton(sid);
    setPracticeResult2(sid, setsEqual(q.selected, q.correctIds));
    /* See s15Check: mcqFinish's flush ran before the score existed. */
    try { flushResumeSave(); } catch (e) {}
  }
}
function s29Check() { mcq2Check('s29'); }
function s34Check() { mcq2Check('s34'); }
function s36Check() { mcq2Check('s36'); }

/* ═══════════════════════════════════════════════════════════
   S32 (slide 51) — class task: type the three ratios. The character
   + bubble appear once all three are filled, then continue unlocks.
   ═══════════════════════════════════════════════════════════ */
function s32Sync() {
  /* the three boxes live on screen 31 as of 03.09 — both screens gate on them,
     and the ids stay `s32-in-*` so nothing else has to move */
  const filled = [0, 1, 2].every(i => {
    const el = document.getElementById('s32-in-' + i);
    return el && el.value.trim() !== '';
  });
  const grp = document.getElementById('s32-char-group');
  if (grp) {
    grp.classList.toggle('hidden', !filled);
    if (filled) {
      const img = document.getElementById('s32-char');
      if (img && !img.getAttribute('src')) img.src = characterAsset('selection');
    }
  }
  const cont = document.getElementById('s32-continue');
  if (cont) cont.disabled = !filled;
  const c31 = document.getElementById('s31-continue');
  if (c31) c31.disabled = !filled;
}
function s32OnInput() { s32Sync(); }

/* ═══════════════════════════════════════════════════════════
   S39 (slide 59) — peak question part א: complete 1 : ▯ (answer 3).
   ═══════════════════════════════════════════════════════════ */
const S39_BODY = [
  'انخفضت درجة الحرارة بمقدار 24°C، خلال 8 ساعات. لذلك، النسبة هي <span dir="ltr">8: 24</span>.',
  'سنقسم العددين على 8 ونحصل على نسبة مختزلة <span dir="ltr">1: 3</span>.',
];
let s39Attempts = 0, s39Done = false, s39LastWrong = null;

function s39OnInput() {
  if (s39Done) return;
  if (s39Attempts > 0) {
    document.getElementById('s39-input').classList.remove('error', 'correct');
    document.getElementById('s39-popup')?.classList.add('hidden');
  }
  const v = document.getElementById('s39-input').value.trim();
  const chk = document.getElementById('s39-check');
  if (chk) chk.disabled = v === '' || v === s39LastWrong;
}
function s39Check() {
  if (s39Done) { advanceScreen(); return; }
  const input = document.getElementById('s39-input');
  const v = input.value.trim();
  if (v === '') return;
  s39Attempts++;
  const isCorrect = Number(v) === 3;
  try {
    reportAnswer('s39', isCorrect, isCorrect || s39Attempts >= 2,
      xapiFieldsAnswer(['s39-input']));
  } catch (e) { console.error('[xAPI] s39', e); }
  const finish = () => {
    s39Done = true;
    input.disabled = true;
    const chk = document.getElementById('s39-check');
    if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
    hideHintButton('s39');
    try { flushResumeSave(); } catch (e) {}
  };
  if (isCorrect) {
    input.classList.add('correct');
    genericVIQPopup('s39', 'correct', 'صحيح!', '', S39_BODY);
    finish();
  } else if (s39Attempts >= 2) {
    input.value = 3;
    input.classList.remove('error');
    input.classList.add('correct');
    genericVIQPopup('s39', 'wrong2', '', 'هذا خطأ – هيا نفهم لماذا:', S39_BODY, 'الإجابة الصحيحة هي 3.');
    finish();
  } else {
    input.classList.add('error');
    s39LastWrong = v;
    genericVIQPopup('s39', 'retry');
    const chk = document.getElementById('s39-check');
    if (chk) chk.disabled = true;
  }
}

/* S40/S43 — peak question SCQ parts ב/ד on the shared engine */
SCQ.s40 = { correctId: 'b', selected: null, attempts: 0, done: false, lastWrong: null, practice: false,
  correctTitle: 'صحيح!', wrongTitle: 'هذا خطأ – هيا نفهم لماذا:',
  body: ['نسبة <span dir="ltr">1: 3</span> يعني أنه في كل ساعة قياس واحدة، انخفضت درجة الحرارة بمقدار 3°C.'] };
SCQ.s43 = { correctId: 'b', selected: null, attempts: 0, done: false, lastWrong: null, practice: false,
  correctTitle: 'يا له من جواب رائع!', wrongTitle: 'هذا خطأ – هيا نفهم لماذا:',
  body: ['بعد 8 ساعات من بدء القياس تصل درجة الحرارة إلى 0°C. الرسم البياني لا يُظهر استمرار انخفاض درجة الحرارة، لكن يمكن ملاحظة اتجاه واضح نحو الانخفاض، ولذلك هناك احتمال معقول بأن درجة الحرارة استمرت في الانخفاض وأنه بعد 8 ساعات من بدء القياس قد تتشكّل طبقة من الجليد.'] };
function s40Select(id) { scqSelect('s40', id); }
function s40Check()    { scqCheck('s40'); }
function s43Select(id) { scqSelect('s43', id); }
function s43Check()    { scqCheck('s43'); }

/* S42 (slide 62) — pick the graphs (multi-select cards) on the mcq engine.
   Correct per the slide's own feedback: graphs א and ב (-3°C per hour). */
const S42_BODY = ['في الرسمين البيانيين أ وب، النسبة بين الزمن والانخفاض في درجة الحرارة هي <span dir="ltr">1: 3</span>، أي أن درجة الحرارة تنخفض بمقدار 3°C في كل ساعة.'];
MCQ.s42 = { id: 's42', correctIds: new Set(['a', 'b']), maxAttempts: 2,
  selected: new Set(), attempts: 0, answered: false, done: false, lastWrong: null,
  optSelector: '.graph-card',
  popups: {
    retry:   { bg: '#ffdbdc', title: 'هذا غير دقيق، هل نحاول مجدداً؟', body: [] },
    correct: { bg: '#edf8ed', title: 'صحيح!', body: S42_BODY },
    wrong2:  { bg: '#ffdbdc', title: 'هذا غير دقيق، تم عرض الإجابة الصحيحة.<br>هيا نفهم لماذا:', body: S42_BODY },
  } };
function s42Toggle(id) { mcqToggle(MCQ.s42, id); }
function s42Check() {
  const q = MCQ.s42;
  const was = q.answered;
  mcqCheck(q);
  if (!was && q.answered) hideHintButton('s42');
}

/* [report layer — unit-js/25-report.js + client markup] */



/* ─── Standard shared image-zoom modal (percent-02 pattern): any
   [data-zoom-src] opens with a clone of its sibling wrapper; any
   [data-zoom-close] closes. ─── */
document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-zoom-src]');
  if (opener) {
    const modal = document.getElementById('img-zoom-modal');
    const stage = document.getElementById('img-zoom-stage');
    const wrapper = opener.parentElement?.querySelector('.scq-img-inner, .zoom-img-inner');
    if (modal && stage && wrapper) {
      stage.innerHTML = '';
      const clone = wrapper.cloneNode(true);
      clone.querySelectorAll('.img-zoom-btn').forEach(b => b.remove());
      stage.appendChild(clone);
      modal.classList.remove('hidden');
    }
    return;
  }
  if (e.target.closest('[data-zoom-close]')) {
    document.getElementById('img-zoom-modal')?.classList.add('hidden');
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.getElementById('img-zoom-modal')?.classList.add('hidden');
});

/* The dev-mode postMessage bridge lives in ../unit-js/60-devbridge.js, which
   90-boot.js calls. A second copy used to sit here and both were active, so DEV_READY
   was posted twice with conflicting totals (TOTAL_SCREENS vs. this part's DOM count)
   and DEV_GOTO was handled twice. */


/* ═══════════ hook contract (see ../unit-js/README.md) ═══════════ */

/* ═══════════════ resume — capture ═══════════════ */

function capturePartPayload() {
  var st = {
    currentScreen: currentScreen,

    /* ── Stage A: scoring and branching ──
       Worth having even on its own. Without it a learner who resumes mid-component
       scores 0 from that point on, and a routing gate reading those numbers can send
       someone who had already passed into remediation. */
    qResults:  Object.assign({}, XAPI_Q_RESULTS),
    practice:  practiceResults.slice(),
    practice2: Object.assign({}, qprogSubResults),

    /* ── Stage B: the answers themselves ──
       The const registries, field by field. Sets become arrays: JSON cannot carry a
       Set, and a silently-dropped selection would restore as "nothing picked" on a
       screen that is also locked. */
    mcq: {}, scq: {}, bq: {}, gsteps: {},
    s1: { scrolledEnd: s1State.scrolledEnd, selected: s1State.selected,
          answered: s1State.answered, flipped: s1State.flipped.slice() },
    s4: { scrolledEnd: s4State.scrolledEnd, flipped: s4State.flipped.slice(),
          q1: s4State.q1, q2: s4State.q2, q3: s4State.q3, q4: s4State.q4 },
    s4q1Selected: Array.from(s4q1Selected),
    s4q4Picks: Object.assign({}, s4q4Picks),

    inputs: {},
    vars: {}
  };

  Object.keys(MCQ).forEach(function (k) {
    var q = MCQ[k];
    st.mcq[k] = { selected: Array.from(q.selected), attempts: q.attempts,
                  answered: q.answered, done: q.done, lastWrong: q.lastWrong };
  });
  Object.keys(SCQ).forEach(function (k) {
    var q = SCQ[k];
    st.scq[k] = { selected: q.selected, attempts: q.attempts,
                  done: q.done, lastWrong: q.lastWrong };
  });
  Object.keys(BQ).forEach(function (k) {
    var q = BQ[k], kinds = bqKinds(q);
    st.bq[k] = { attempts: q.attempts, done: q.done, lastWrong: q.lastWrong, counts: {} };
    st.bq[k].counts[kinds.a.key] = q[kinds.a.key];
    st.bq[k].counts[kinds.b.key] = q[kinds.b.key];
  });
  Object.keys(GSTEPS).forEach(function (k) { st.gsteps[k] = GSTEPS[k].answered; });

  RESUME_INPUT_IDS.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) st.inputs[id] = el.value;
  });
  RESUME_PLAIN_VARS.forEach(function (k) {
    try { st.vars[k] = eval(k); } catch (e) {}
  });
  return st;
}


/* ═══════════════ resume — apply ═══════════════ */

/* ⚠️ The parameter MUST stay named `st`. The loop at the bottom runs
   eval(k + ' = st.vars[k];'), which resolves `st` lexically — rename it and every
   assignment throws into the enclosing try/catch, the learner's answers vanish, and
   nothing appears in the console. */
function applyResumeVars(st) {
  if (!st) return;

  if (st.qResults) XAPI_Q_RESULTS = Object.assign({}, st.qResults);
  /* practiceResults and qprogSubResults are const — mutated in place, never
     reassigned. */
  if (st.practice) {
    st.practice.forEach(function (v, i) { practiceResults[i] = v; });
  }
  if (st.practice2) {
    Object.keys(st.practice2).forEach(function (k) { qprogSubResults[k] = st.practice2[k]; });
  }

  if (st.mcq) {
    Object.keys(st.mcq).forEach(function (k) {
      if (!MCQ[k]) return;
      var s = st.mcq[k];
      MCQ[k].selected  = new Set(s.selected || []);
      MCQ[k].attempts  = s.attempts || 0;
      MCQ[k].answered  = !!s.answered;
      MCQ[k].done      = !!s.done;
      MCQ[k].lastWrong = s.lastWrong || null;
    });
  }
  if (st.scq) {
    Object.keys(st.scq).forEach(function (k) {
      if (!SCQ[k]) return;
      var s = st.scq[k];
      SCQ[k].selected  = s.selected || null;
      SCQ[k].attempts  = s.attempts || 0;
      SCQ[k].done      = !!s.done;
      SCQ[k].lastWrong = s.lastWrong || null;
    });
  }
  if (st.bq) {
    Object.keys(st.bq).forEach(function (k) {
      if (!BQ[k]) return;
      var s = st.bq[k];
      BQ[k].attempts  = s.attempts || 0;
      BQ[k].done      = !!s.done;
      BQ[k].lastWrong = s.lastWrong || null;
      Object.keys(s.counts || {}).forEach(function (kind) { BQ[k][kind] = s.counts[kind]; });
    });
  }
  if (st.gsteps) {
    Object.keys(st.gsteps).forEach(function (k) {
      if (GSTEPS[k]) GSTEPS[k].answered = !!st.gsteps[k];
    });
  }

  if (st.s1) {
    s1State.scrolledEnd = !!st.s1.scrolledEnd;
    s1State.selected    = st.s1.selected || null;
    s1State.answered    = !!st.s1.answered;
    if (st.s1.flipped) st.s1.flipped.forEach(function (v, i) { s1State.flipped[i] = !!v; });
  }
  if (st.s4) {
    s4State.scrolledEnd = !!st.s4.scrolledEnd;
    ['q1', 'q2', 'q3', 'q4'].forEach(function (k) { s4State[k] = !!st.s4[k]; });
    if (st.s4.flipped) st.s4.flipped.forEach(function (v, i) { s4State.flipped[i] = !!v; });
  }
  if (st.s4q1Selected) s4q1Selected = new Set(st.s4q1Selected);
  if (st.s4q4Picks) s4q4Picks = Object.assign({}, st.s4q4Picks);

  if (st.vars) {
    Object.keys(st.vars).forEach(function (k) {
      if (RESUME_PLAIN_VARS.indexOf(k) === -1) return;   /* never assign an unlisted name */
      try { eval(k + ' = st.vars[k];'); } catch (e) {}
    });
  }
}

function applyResumeDom(st) {
  if (!st) return;
  if (st.inputs) {
    RESUME_INPUT_IDS.forEach(function (id) {
      if (typeof st.inputs[id] !== 'string') return;
      var el = document.getElementById(id);
      if (el) el.value = st.inputs[id];
    });
  }
  if (st.texts) {
    RESUME_TEXT_IDS.forEach(function (id) {
      if (typeof st.texts[id] !== 'string') return;
      var el = document.getElementById(id);
      if (el) el.textContent = st.texts[id];
    });
  }
}


/* ═══════════════ resume — the painters ═══════════════
   restoreScreenUI(n) repaints an answered screen. ../unit-js/30-nav.js calls it on
   EVERY navigation, not only at restore: without that, back-navigating onto a screen
   answered earlier in the same session showed pristine markup that ignored clicks,
   because each screen's own sNEnter() is an INITIALISER, not a restorer.

   Rules every painter below obeys:

   1. Correctness never comes from the attempt count. Two WRONG attempts also mark a
      screen done here, so done !== correct — and several screens overwrite the
      learner's own answer with the correct one when they reveal it, so the answer on
      screen is not a source either. screenWasCorrect() is the only trustworthy one.
   2. Every not-solved branch recomputes the check button from the SAME predicate the
      live code uses — by calling that code, not by restating it. A resumed learner
      must never land on a screen they can neither answer nor leave.
   3. DOM writes only. No state mutation, no reporting call, no announce().
   4. Idempotent, and a no-op on a screen nothing has touched: an untouched screen has
      attempts 0 and every painter returns before writing anything.
   5. Never reset. resetScreenState(n) owns that and has already run.
   6. Exception-safe: 30-nav.js wraps the call, but a painter that throws would still
      abort the rest of the repaint for that screen. */

/* The recorded outcome of a resolved screen, in precedence order: the part-01 practice
   strip, the set B/C/D strips, then XAPI_Q_RESULTS for the screens that have no strip
   at all (the שאלת השיא parts). XAPI_Q_RESULTS is safe to lean on with reporting
   switched off: xapiAnswered writes it on its first line, before its own XAPI_USING_G
   guard and outside its try. */
function screenWasCorrect(sid) {
  if (QPROG_INDEX[sid] !== undefined) return practiceResults[QPROG_INDEX[sid]] === true;
  if (qprogSubResults[sid] !== undefined) return qprogSubResults[sid] === true;
  var k = xapiKeyFor(sid);
  if (k) return XAPI_Q_RESULTS[k.item + '/' + k.qKey] === true;
  return false;
}

function paintDoneButton(sid) {
  var chk = document.getElementById(sid + '-check');
  if (chk) { setNavLabel(chk, 'متابعة'); chk.disabled = false; }
  hideHintButton(sid);
}

/* Multi-select — screens 2, 3, 12, 15, 29, 34, 36, 42. */
function paintMCQ(sid) {
  var q = MCQ[sid];
  if (!q || !document.getElementById(sid)) return;
  var sel = '#' + sid + ' ' + (q.optSelector || '.scq-opt');
  if (q.done) {
    document.querySelectorAll(sel).forEach(function (o) {
      o.classList.remove('selected');
      o.disabled = true;
      if (q.correctIds.has(o.dataset.id)) o.classList.add('correct');
      else if (q.selected.has(o.dataset.id)) o.classList.add('wrong');
    });
    paintDoneButton(sid);
    mcqShowPopup(q, screenWasCorrect(sid) ? 'correct' : 'wrong2');
    return;
  }
  if (!q.attempts) return;
  document.querySelectorAll(sel).forEach(function (o) {
    var on = q.selected.has(o.dataset.id);
    o.classList.toggle('selected', on);
    o.setAttribute('aria-checked', on ? 'true' : 'false');
    if (on && !q.correctIds.has(o.dataset.id)) o.classList.add('wrong');
  });
  mcqShowPopup(q, 'retry');
  mcqUpdateBar(q);            /* rule 2: the live retry-lock predicate */
}

/* Single choice — screens 23, 27, 35, 40, 43. */
function paintSCQ(sid) {
  var q = SCQ[sid];
  if (!q || !document.getElementById(sid)) return;
  var mark = function (id, cls) {
    var o = document.querySelector('#' + sid + ' .scq-opt[data-id="' + id + '"]');
    if (o) { o.classList.remove('selected'); o.classList.add(cls); }
  };
  if (q.done) {
    document.querySelectorAll('#' + sid + ' .scq-opt').forEach(function (o) { o.disabled = true; });
    mark(q.correctId, 'correct');
    var ok = screenWasCorrect(sid);
    if (!ok && q.selected && q.selected !== q.correctId) mark(q.selected, 'wrong');
    paintDoneButton(sid);
    scqShowPopup2(sid, ok ? 'correct' : 'wrong2');
    return;
  }
  if (!q.attempts) return;
  if (q.selected) {
    document.querySelectorAll('#' + sid + ' .scq-opt').forEach(function (o) {
      var on = o.dataset.id === q.selected;
      o.classList.toggle('selected', on);
      o.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    if (q.selected !== q.correctId) mark(q.selected, 'wrong');
  }
  scqShowPopup2(sid, 'retry');
  /* The live predicate from scqSelect: a pick identical to the one already rejected
     leaves the button disabled. */
  var chk = document.getElementById(sid + '-check');
  if (chk) chk.disabled = !q.selected || q.selected === q.lastWrong;
}

/* The two-counter applet — screens 17, 18, 24, 25. bqRender() rebuilds the stage from
   the restored counts, so the artwork needs no painting of its own. */
function paintBQ(sid) {
  var q = BQ[sid];
  if (!q || !document.getElementById(sid)) return;
  var kinds = bqKinds(q);
  var cA = document.getElementById(sid + '-count-' + kinds.a.key);
  var cB = document.getElementById(sid + '-count-' + kinds.b.key);
  bqRender(sid);
  if (q.done) {
    document.querySelectorAll('#' + sid + ' .bq-btn').forEach(function (b) { b.disabled = true; });
    [cA, cB].forEach(function (c) {
      if (!c) return;
      c.classList.remove('error');
      c.classList.add('correct');
    });
    paintDoneButton(sid);
    /* A final wrong answer replaces the learner's counts WITH the target, so the
       counters cannot tell the two branches apart — rule 1. */
    bqShowPopup(sid, screenWasCorrect(sid) ? 'correct' : 'wrong2');
    return;
  }
  if (!q.attempts) return;
  if (cA && q[kinds.a.key] !== q.target[kinds.a.key]) cA.classList.add('error');
  if (cB && q[kinds.b.key] !== q.target[kinds.b.key]) cB.classList.add('error');
  bqShowPopup(sid, 'retry');
  /* bqAdd re-enables the button on any change; after a rejected attempt it stays
     disabled until the learner changes something. */
  var chk = document.getElementById(sid + '-check');
  if (chk) chk.disabled = JSON.stringify([q[kinds.a.key], q[kinds.b.key]]) === q.lastWrong;
}

/* The value-input and dropdown screens, described once so a single painter serves all
   six. `ok(v, i)` is the same per-field predicate the live check uses; `sync` is the
   screen's own input handler, i.e. literally the live button predicate (rule 2) —
   which is why it is called BEFORE any mark is painted: each of those handlers clears
   the marks and hides the popup when attempts > 0. */
var VIQ = {
  s14: { ids: ['s14-sel-0', 's14-sel-1', 's14-sel-2', 's14-sel-3'], sel: '.dq-select',
         ok: function (v, i) { return v === S14_CORRECT[i]; },
         attempts: function () { return s14Attempts; }, done: function () { return s14Done; },
         sync: function () { s14OnChange(); },
         popup: function (t) { s14ShowPopup(t); } },
  s16: { ids: ['s16-in-0', 's16-in-1', 's16-in-2', 's16-in-3'], sel: '.viq-input-box',
         ok: function (v, i) { return Number(v) === S16_CORRECT[i]; },
         attempts: function () { return s16Attempts; }, done: function () { return s16Done; },
         sync: function () { s16OnInput(); },
         popup: function (t) { s16ShowPopup(t); } },
  s21: { ids: ['s21-in-0a', 's21-in-0b', 's21-in-1a', 's21-in-1b', 's21-in-2a', 's21-in-2b',
               's21-in-3a', 's21-in-3b', 's21-in-4a', 's21-in-4b'], sel: '.viq-input-box',
         ok: function (v, i) { return Number(v) === S21_ANS[Math.floor(i / 2)][i % 2]; },
         attempts: function () { return s21Attempts; }, done: function () { return s21Done; },
         sync: function () { s21OnInput(); },
         popup: function (t) {
           if (t === 'retry') { genericVIQPopup('s21', 'retry'); return; }
           if (t === 'correct') { genericVIQPopup('s21', 'correct', 'بالضبط!', '', S21_BODY); return; }
           genericVIQPopup('s21', 'wrong2', '', 'غير دقيق، هيا نفهم لماذا:', S21_BODY, 'الإجابات الصحيحة معروضة.');
         } },
  s22: { ids: ['s22-in-0', 's22-in-1', 's22-in-2', 's22-in-3'], sel: '.viq-input-box',
         ok: function (v, i) { return Number(v) === S22_ANS[i]; },
         attempts: function () { return s22Attempts; }, done: function () { return s22Done; },
         sync: function () { s22OnInput(); },
         popup: function (t) {
           if (t === 'retry') { genericVIQPopup('s22', 'retry'); return; }
           if (t === 'correct') { genericVIQPopup('s22', 'correct', 'رائع جداً!', '', S22_BODY); return; }
           genericVIQPopup('s22', 'wrong2', '', 'غير دقيق، هيا نفهم لماذا:', S22_BODY, 'الإجابات الصحيحة معروضة.');
         } },
  s28: { ids: ['s28-in-0', 's28-in-1', 's28-in-2', 's28-in-3', 's28-in-4', 's28-in-5'],
         sel: '.viq-input-box',
         ok: function (v, i) { return s28RowOk(i, v); },
         attempts: function () { return s28Attempts; }, done: function () { return s28Done; },
         sync: function () { s28OnInput(); },
         popup: function (t) {
           if (t === 'retry') { genericVIQPopup('s28', 'retry'); return; }
           if (t === 'correct') { genericVIQPopup('s28', 'correct', 'صحيح جداً!', '', S28_BODY); return; }
           genericVIQPopup('s28', 'wrong2', '', 'هذا غير دقيق، هيا نفهم لماذا:', S28_BODY, 'الإجابات الصحيحة معروضة.');
         } },
  s39: { ids: ['s39-input'], sel: '.viq-input-box',
         ok: function (v) { return Number(v) === 3; },
         attempts: function () { return s39Attempts; }, done: function () { return s39Done; },
         sync: function () { s39OnInput(); },
         popup: function (t) {
           if (t === 'retry') { genericVIQPopup('s39', 'retry'); return; }
           if (t === 'correct') { genericVIQPopup('s39', 'correct', 'صحيح!', '', S39_BODY); return; }
           genericVIQPopup('s39', 'wrong2', '', 'هذا خطأ – هيا نفهم لماذا:‌', S39_BODY, 'الإجابة الصحيحة هي 3.');
         } }
};

function paintVIQ(sid) {
  var cfg = VIQ[sid];
  if (!cfg || !document.getElementById(sid)) return;
  var els = cfg.ids.map(function (id) { return document.getElementById(id); });
  if (els.some(function (el) { return !el; })) return;   /* another component's screen */

  if (cfg.done()) {
    els.forEach(function (el) {
      el.disabled = true;
      el.classList.remove('error');
      el.classList.add('correct');
    });
    paintDoneButton(sid);
    cfg.popup(screenWasCorrect(sid) ? 'correct' : 'wrong2');
    return;
  }
  if (!cfg.attempts()) return;
  cfg.sync();                                            /* rule 2, before any mark */
  els.forEach(function (el, i) {
    if (!cfg.ok(el.value.trim(), i)) el.classList.add('error');
  });
  cfg.popup('retry');
}

/* Screen 1 — the hook question plus three one-way flip cards. One attempt only, so
   there is no interim state to paint. */
function paintS1() {
  if (!document.getElementById('s1')) return;
  s1State.flipped.forEach(function (on, i) {
    if (!on) return;
    var card = document.querySelector('#s1 .frc-card[data-index="' + i + '"]');
    if (card) s1Flip(card);                              /* idempotent, and it re-arms the gate */
  });
  if (!s1State.answered) return;
  document.querySelectorAll('#s1 .scq-opt').forEach(function (o) {
    o.disabled = true;
    o.classList.remove('selected');
    if (o.dataset.id === S1Q_CORRECT) o.classList.add('correct');
    else if (o.dataset.id === s1State.selected) o.classList.add('wrong');
  });
  var ok = s1State.selected === S1Q_CORRECT;
  var fb = document.getElementById('s1q-feedback');
  if (fb) {
    fb.textContent = (ok ? 'صحيح! ' : 'هذا على الأرجح ليس السبب.. ') + 'تابعوا التمرير لتفهموا لماذا.';
    fb.classList.remove('is-correct', 'is-wrong');
    fb.classList.add(ok ? 'is-correct' : 'is-wrong');
  }
  var chk = document.getElementById('s1q-check');
  if (chk) chk.disabled = true;
}

/* Screen 4 — the acquisition screen: a scroll gate, four flip cards and four embedded
   questions, each with its own inline feedback rather than a popup. */
function paintS4() {
  if (!document.getElementById('s4')) return;
  s4State.flipped.forEach(function (on, i) {
    if (!on) return;
    var card = document.querySelector('#s4 .frc-card[data-index="' + i + '"]');
    if (card) s4Flip(card);
  });

  if (s4State.q1) {
    document.querySelectorAll('#s4 .rs-block:nth-of-type(4) .scq-opt').forEach(function (o) {
      o.disabled = true;
      o.classList.remove('selected');
      if (S4Q1_CORRECT.has(o.dataset.id)) o.classList.add('correct');
      else if (s4q1Selected.has(o.dataset.id)) o.classList.add('wrong');
    });
    var ok1 = screenWasCorrect('s4q1');
    s4Feedback('s4q1-feedback', ok1,
      (ok1 ? '<strong>كل الاحترام!</strong><br>' : '<strong>هذا غير دقيق.</strong><br>') + S4Q1_EXPLAIN);
    var c1 = document.getElementById('s4q1-check');
    if (c1) c1.disabled = true;
  }

  /* q2 and q3 are value inputs whose resolved look is identical: values locked and
     marked correct (both reveal the answer on a second wrong attempt). */
  [{ q: 'q2', ids: ['s4q2-left', 's4q2-right'] },
   { q: 'q3', ids: ['s4q3-input'] }].forEach(function (part) {
    if (!s4State[part.q]) return;
    part.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.disabled = true; el.classList.remove('error'); el.classList.add('correct'); }
    });
    var chk = document.getElementById('s4' + part.q + '-check');
    if (chk) chk.disabled = true;
  });

  if (s4State.q4) {
    document.querySelectorAll('#s4 .saq-row').forEach(function (row) {
      var id = row.dataset.id;
      var rowOk = s4q4Picks[id] === S4Q4_CORRECT[id];
      row.classList.remove('row-correct', 'row-wrong', 'row-revealed');
      row.classList.add(rowOk ? 'row-correct' : 'row-revealed');
      row.querySelectorAll('.saq-pill').forEach(function (p) {
        p.disabled = true;
        var on = rowOk ? p.dataset.val === s4q4Picks[id] : p.dataset.val === S4Q4_CORRECT[id];
        p.classList.toggle('selected', on);
        p.setAttribute('aria-checked', on ? 'true' : 'false');
      });
    });
    var ok4 = screenWasCorrect('s4q4');
    s4Feedback('s4q4-feedback', ok4,
      (ok4 ? '<strong>صحيح!</strong><br>' : '<strong>هذا غير دقيق.</strong><br>') + S4Q4_EXPLAIN);
    var c4 = document.getElementById('s4q4-check');
    if (c4) c4.disabled = true;
  }

  /* The gate the learner actually needs: without it a fully-answered screen 4 comes
     back with its continue button dead. */
  s4UpdateGate();
  if (window.s4ShowScrollHint) window.s4ShowScrollHint();
}

/* Screens 7-9 — the guided worked example. Nothing here is graded (the correct mark
   is revealed whatever the learner picks), but the reveal has to come back or the
   continue button is dead. */
function paintGStep(sid) {
  var st = GSTEPS[sid];
  if (!st || !st.answered || !document.getElementById(sid)) return;
  document.querySelectorAll('#' + sid + ' .s19-opt').forEach(function (o) {
    o.disabled = true;
    if (o.dataset.id === st.correctId) o.classList.add('correct');
  });
  var cont = document.getElementById(sid + '-continue');
  if (cont) cont.disabled = false;
}

/* Screen 19 — a single-choice question on its own bespoke engine. */
function paintS19() {
  if (!document.getElementById('s19')) return;
  var mark = function (id, cls) {
    var o = document.querySelector('#s19 .scq-opt[data-id="' + id + '"]');
    if (o) { o.classList.remove('selected'); o.classList.add(cls); }
  };
  if (s19qDone) {
    document.querySelectorAll('#s19 .scq-opt').forEach(function (o) { o.disabled = true; });
    mark(S19Q.correctId, 'correct');
    var ok = screenWasCorrect('s19');
    if (!ok && s19qSelected && s19qSelected !== S19Q.correctId) mark(s19qSelected, 'wrong');
    paintDoneButton('s19');
    s19qShowPopup(ok ? 'correct' : 'wrong2');
    return;
  }
  if (!s19qAttempts) return;
  if (s19qSelected) {
    document.querySelectorAll('#s19 .scq-opt').forEach(function (o) {
      var on = o.dataset.id === s19qSelected;
      o.classList.toggle('selected', on);
      o.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    if (s19qSelected !== S19Q.correctId) mark(s19qSelected, 'wrong');
  }
  s19qShowPopup('retry');
  var chk = document.getElementById('s19-check');
  if (chk) chk.disabled = !s19qSelected || s19qSelected === s19qLastWrong;
}

/* The dispatcher. Screens absent from this table keep no answer state of their own:
   the interstitials and the guided-example narration.

   ⚠ The class task (screens 30-32) DOES need a branch, and the absence of one was a live
   defect. What stood here claimed s32Sync() in resetScreenState was enough. It is not:
   applyExecutionState runs goTo(n) -- and therefore resetScreenState, and therefore
   s32Sync() -- BEFORE applyResumeDom(st) puts the three typed answers back. The gate
   read three empty boxes, disabled the button, and nothing recomputed it afterwards, so
   a learner who typed their three ratios and reloaded got their text back and a dead
   continue button. Re-deriving it here, after applyResumeDom, is the fix; the same shape
   already exists in methodica-math-scale-01-03 (restoreScreenUI -> s35OnInput). */
function restoreScreenUI(n) {
  if (n === 1) { paintS1(); return; }
  if (n === 4) { paintS4(); return; }
  if (n === 7 || n === 8 || n === 9) { paintGStep('s' + n); return; }
  if (n === 19) { paintS19(); return; }
  if (n === 31 || n === 32) { s32Sync(); return; }
  var sid = 's' + n;
  if (MCQ[sid]) { paintMCQ(sid); return; }
  if (SCQ[sid]) { paintSCQ(sid); return; }
  if (BQ[sid])  { paintBQ(sid);  return; }
  if (VIQ[sid]) { paintVIQ(sid); return; }
}


/* ── part boundaries ──
   advanceScreen()'s gates run first (the original is untouched); this wrapper turns an
   out-of-range navigation into a component handover. ../unit-js/28-feedback-drag.js
   wraps window.goTo again at boot and delegates here.

   Both edges are derived from PART_FIRST/PART_LAST, so nothing here carries a screen
   number of its own: forward lands on PART_LAST + 1 (the destination's own first
   screen under this unit's unit-wide numbering), and the back edge returns to
   PART_FIRST - 1 (the screen the learner left in the previous component). */
/* The button that fired the last click of this component: the PART_LAST screen's check
   button (relabelled to continue once answered) or, on the two screens that have no
   question, its continue button. xapiEndComponent disables it after the report. */
function lastScreenButton() {
  return document.getElementById('s' + PART_LAST + '-check') ||
         document.getElementById('s' + PART_LAST + '-continue');
}

/* The learner left the component's last screen forward. Since 2026-09-16 the PLATFORM
   decides what comes next (README.md "The platform owns routing"): Kata launches each
   component on its own URL and registration, and routes on the 'completed' below —
   so the component reports and STOPS, and the button disables itself. The hop to
   destSlug lives on only for a local walkthrough (DEV_NAV, unit-js/10-identity.js). */
function leaveToPart(destSlug, destFirstScreen) {
  /* The component 'completed' goes out BEFORE anything can branch or fail, so a
     learner who did not clear this component is still reported. */
  var res = partResult();
  try { xapiEndComponent(res, lastScreenButton()); } catch (e) {}
  try { recordPartResult(res); } catch (e) {}
  if (DEV_NAV) {
    /* Moves the landing pointer to the destination and records the back edge. Without
       it the destination's loader would see a pointer still aimed here. */
    try { writeForwardState(destSlug, '#screen=' + currentScreen, destFirstScreen); } catch (e) {}
    /* explicit index.html — file:// has no default document */
    window.location.replace('../' + destSlug + '/index.html' + window.location.search);
  }
}

/* The learner pressed "סיימתי" on the unit's last screen. The component 'completed'
   goes here, ledger-guarded, so re-reaching the finale after a reload re-sends
   nothing; the button disables itself.

   ── There is no unit 'completed' (removed 2026-09-16) ──
   MOE v2.5 pp. 21-22 (unchanged in v2.7) define 'completed' at two levels only — פריט
   and רכיב, told apart by the object. A unit is neither, and the platform derives the
   unit outcome from the component statements itself. Until 2026-09-16 a unit-scoped
   'completed' with no result went out from here (and before 09.2026 one carrying a
   mean over a fixed five components — see the git history for why that was wrong).

   The grading lives where the spec puts it: in the six component 'completed' statements
   and the item ones beneath them. recordPartResult still runs — the state document
   keeps the per-component record either way. */
function finishUnit() {
  var res = partResult();
  try { recordPartResult(res); } catch (e) {}
  try { xapiEndComponent(res, lastScreenButton()); } catch (e) {}
  try { flushResumeSave(); } catch (e) {}
}

var _goToCore = goTo;
window.goTo = function (n) {
  if (n > PART_LAST) {
    if (PART_NEXT) leaveToPart(PART_NEXT, PART_LAST + 1);
    else finishUnit();
    return;
  }
  if (n < PART_FIRST) {
    /* Every screen except the unit's very first carries a "חזרה" button wired to
       goBack(), which is goTo(currentScreen - 1). On a component's first screen that
       used to fall into this range guard and do nothing at all — the button looked
       live and was dead. goBackToPreviousPart points the document at the destination
       BEFORE navigating, and stays put if that write fails. */
    if (PART_PREV) goBackToPreviousPart(PART_PREV, '#screen=' + (PART_FIRST - 1));
    return;
  }
  _goToCore(n);
};


/* initResumeLeaveHandlers comes from ../unit-js/40-resume.js — do not redeclare
   (script.js loads after the shared layer; a local copy would silently win). */

/* The landing screen is now decided by the resume document, not by this function:
   50-loader.js reads the document after partBoot() has run and, when this component
   has a saved payload, applyExecutionState() navigates again. This only has to put a
   first-time learner on the component's own first screen. */
function partBoot() {
  goTo(PART_FIRST);
}
