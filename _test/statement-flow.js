/* ═══════════════════ behavioural statement-flow oracle ═══════════════════
   NOT DEPLOYED. Dev tooling only.

   verify-report.js asserts STRUCTURE — that the wiring is present and the contracts
   hold. This asserts BEHAVIOUR: which statements actually leave the lomda when a
   learner does something, in what order, carrying what result — and, the part that
   matters most, which ones do NOT leave when the same screen is reached again by a
   reload or by the back button.

   Ported from methodica-math-scale-01/_test/statement-flow.js.

   jsdom will not fetch the CDN, so bootXAPI's two loadScript calls are inert. Rather
   than fake the loader, each scenario runs the real page scripts, then executes
   _test/xapi-720-k.js (the very stub the browser gets through ?xapiLib=), then
   replays the loader's post-metadata sequence explicitly. The screen code, the shared
   helpers and the ledger under test are all real.

   Run:
     NODE_PATH=/tmp/lomda-test/node_modules node _test/statement-flow.js
*/

'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const BASE = process.argv[2] || path.join(__dirname, '..');
const UNIT = 'methodica-ar-math-ratio-01';
const PART_DIR = c => UNIT + '-' + c;

const failures = [];
let passes = 0;

function ok(tag, what, cond, detail) {
  if (cond) { passes++; return; }
  failures.push('[' + tag + '] ' + what + (detail ? '  —  ' + detail : ''));
}

function eq(tag, what, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  ok(tag, what, a === e, 'got ' + a + ', expected ' + e);
}

/* Boot a component the way the browser does with ?xapiLib=, stopping just before the
   loader's post-metadata block so each scenario can drive it. */
function boot(c, opts) {
  opts = opts || {};
  const dir = path.join(BASE, PART_DIR(c));
  const dom = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
    url: 'http://localhost:8777/' + PART_DIR(c) + '/index.html' +
      (opts.search || '?slxapi=1&registration=r1') + (opts.hash || ''),
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  const w = dom.window;

  const exec = (code) => {
    const s = w.document.createElement('script');
    s.textContent = code;
    w.document.head.appendChild(s);
    s.remove();
  };
  const val = (expr) => {
    exec('window.__v = (function(){ try { return (' + expr +
      '); } catch (e) { return "__throw:" + e.message; } })();');
    return w.__v;
  };

  w.console.error = w.console.warn = w.console.log = () => {};
  w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  w.HTMLMediaElement.prototype.load = function () {};
  w.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  w.HTMLMediaElement.prototype.pause = function () {};

  for (const src of [...w.document.querySelectorAll('script[src]')]
    .map(s => s.getAttribute('src'))) {
    if (/^[a-z]+:\/\//i.test(src) || src.startsWith('//')) continue;
    const p = path.resolve(dir, src.split('?')[0]);
    if (fs.existsSync(p)) { try { exec(fs.readFileSync(p, 'utf8')); } catch (e) {} }
  }

  /* The library, exactly as ?xapiLib= would deliver it on localhost. */
  exec(fs.readFileSync(path.join(BASE, '_test', 'xapi-720-k.js'), 'utf8'));
  exec('window.XAPI_USING_G = true;');
  if (!opts.keepState) exec('window.__reset();');
  /* The component metadata, so xapiQ() resolves against the real catalogue. */
  exec('window.METADATA = ' + fs.readFileSync(
    path.join(BASE, 'metadata', PART_DIR(c) + '.json'), 'utf8').replace(/^﻿/, '') + ';');

  const stmts = () => JSON.parse(val('JSON.stringify(window.__stmts())'));
  const verbs = () => stmts().map(s => s.verb);
  const state = () => JSON.parse(val('JSON.stringify(window.__state())'));

  /* Replay what the loader does after the metadata poll resolves. */
  const finishBoot = (payload, screenOverride) => {
    exec('_resumeReady = true; if (!_unitState) _unitState = readUnitState(); ' +
      'drainPendingUnitState();');
    if (payload !== undefined) {
      exec('applyExecutionState(' + JSON.stringify(payload) + ', ' +
        (screenOverride === undefined ? 'undefined' : screenOverride) + ');');
    }
    exec("try { sendStatement720('initialized', 'onlinelesson'); } catch (e) {}");
    if (payload === undefined) exec('xapiOnScreen(currentScreen);');
  };

  return { dom, w, exec, val, stmts, verbs, state, finishBoot };
}

/* Answer screen 2 (component 01) correctly, through the real handlers. */
const ANSWER_S2 = 'goTo(2); s2Toggle("a"); s2Toggle("b"); s2Toggle("c"); s2Toggle("d"); s2Check();';

/* ── "the learner answered every item as they went" ──
   xapi-720-k.js — and the stub, which now models it — defers an item's 'completed' until an
   'answered' for that item has passed through in this page load. The walks below march through
   screens with _goToCore() to check that items open and close in the right PAIRS; they
   deliberately do not drive the questions, which belong to other tests. Without this the walks
   would close nothing and the pairing they exist to check would be invisible.

   This is a precondition, not a convenience: forward navigation is gated on answering, so every
   item a learner crosses really has been answered. The one walk that must NOT use it is the
   resume test, where the whole point is that the library's memory did not survive the reload. */
const MARK_ANSWERED =
  'Object.keys(SCREEN_TO_SUBCONTENT).forEach(function(k){' +
  '  var it = SCREEN_TO_SUBCONTENT[k][0];' +
  '  if (it) window.xapiItemAnswered[xapiItemId(it)] = true;' +
  '});';


/* ══════════════ 1. A fresh load ══════════════ */

function freshLoad() {
  const b = boot('01');
  b.finishBoot();

  /* The component 'initialized' then the landing screen's item 'initialized'. */
  eq('fresh', 'a fresh load emits the component then the item initialized',
    b.verbs(), ['initialized', 'initialized']);
  const s = b.stmts();
  ok('fresh', 'the first is component-scoped',
    s[0].objectType === 'onlinelesson', JSON.stringify(s[0]));
  ok('fresh', 'the second is the landing screen\'s item',
    s[1].objectType === 'question' && /-01-001\/$/.test(s[1].opts.objectId || ''),
    JSON.stringify(s[1].opts));
  ok('fresh', 'the item is flagged as an evaluation item',
    s[1].opts.isEvaluationItem === 1 || s[1].opts.isEvaluationItem === true,
    JSON.stringify(s[1].opts));
  b.dom.window.close();
}


/* ══════════════ 2. Answering ══════════════ */

function answering() {
  const b = boot('01');
  b.finishBoot();
  b.exec('window.__reset();');
  b.exec(MARK_ANSWERED);   /* item 001 is crossed, not answered, by this walk */

  /* Screen 2 is in item 002; screen 1 is in 001. Crossing the boundary closes 001. */
  b.exec(ANSWER_S2);
  const v = b.verbs();
  ok('answer', 'crossing into a new item closes the old one and opens the new',
    v[0] === 'completed' && v[1] === 'initialized', v.join(','));
  ok('answer', 'answering emits answered.last (it was correct first time)',
    v.indexOf('answered.last') !== -1, v.join(','));
  ok('answer', 'and no plain answered, because there was no earlier attempt',
    v.indexOf('answered') === -1, v.join(','));

  const a = b.stmts().find(x => x.verb === 'answered.last');
  ok('answer', 'answered carries success and a scaled score',
    a && a.result && a.result.success === true && a.result.score.scaled === 1,
    JSON.stringify(a && a.result));
  ok('answer', 'answered carries the learner\'s own answer text',
    a && a.result.extensions && Array.isArray(a.result.extensions.student_answer) &&
    a.result.extensions.student_answer[0].length > 0,
    JSON.stringify(a && a.result.extensions));
  /* MOE v2.4 made contextActivities.parent mandatory on answered — the library builds
     it from parentId, so the statement must carry one. */
  ok('answer', 'answered names its parent item (v2.4 requires it)',
    a && typeof a.opts.parentId === 'string' && /-01-002\/$/.test(a.opts.parentId),
    JSON.stringify(a && a.opts));
  ok('answer', 'and a question id under that item',
    a && typeof a.opts.questionId === 'string' &&
    a.opts.questionId.indexOf(a.opts.parentId) === 0,
    JSON.stringify(a && a.opts));

  /* A wrong first attempt then a correct second: plain answered, then answered.last. */
  const b2 = boot('01');
  b2.finishBoot();
  b2.exec('window.__reset();');
  b2.exec('goTo(3); s3Toggle("b"); s3Check();');          /* s3 keys are a, c, d */
  ok('answer', 'a non-final wrong attempt emits plain answered',
    b2.verbs().indexOf('answered') !== -1, b2.verbs().join(','));
  ok('answer', 'and not answered.last',
    b2.verbs().indexOf('answered.last') === -1, b2.verbs().join(','));
  const wrong = b2.stmts().find(x => x.verb === 'answered');
  ok('answer', 'the wrong attempt reports success false, score 0',
    wrong.result.success === false && wrong.result.score.scaled === 0,
    JSON.stringify(wrong.result));
  b2.exec('s3Toggle("b"); s3Toggle("a"); s3Toggle("c"); s3Toggle("d"); s3Check();');
  ok('answer', 'the resolving attempt then emits answered.last',
    b2.verbs().indexOf('answered.last') !== -1, b2.verbs().join(','));
  b.dom.window.close();
  b2.dom.window.close();
}


/* ══════════════ 3. Hints ══════════════ */

function hints() {
  /* Component 02, not 01: s14 and s15 are the first two hinted questions of the unit
     and they live in the script's רכיב 2. Component 01 has exactly one hinted screen
     (s12), which cannot exercise the "a different question reports its own" case. */
  const b = boot('02');
  b.finishBoot();
  b.exec('window.__reset();');

  b.exec('goTo(14); openHint("s14");');
  eq('hint', 'opening a hint reports requested.1 once',
    b.verbs().filter(v => v === 'requested.1').length, 1);

  /* The overlays close three ways and all three leave the hint button live, so a
     second open must not report again. Deduped per question, and the key lives in the
     state document, so it survives a reload too. */
  b.exec('closeHint("s14"); openHint("s14"); openHint("s14");');
  eq('hint', 'reopening the same hint does not report again',
    b.verbs().filter(v => v === 'requested.1').length, 1);

  const h = b.stmts().find(x => x.verb === 'requested.1');
  ok('hint', 'the hint is question-scoped, not component-scoped',
    h.objectType === 'question' && !!h.opts.questionId, JSON.stringify(h.opts));

  /* A different question reports its own. */
  b.exec('goTo(15); openHint("s15");');
  eq('hint', 'a different question reports its own hint',
    b.verbs().filter(v => v === 'requested.1').length, 2);

  /* And the ledger survives a reload: same registration, same document. */
  const dumped = b.state();
  b.dom.window.close();
  const b2 = boot('02', { keepState: true });
  b2.finishBoot();
  b2.exec('window.__reset(); window.__setState(' + JSON.stringify(dumped) + ');');
  b2.exec('_unitState = readUnitState(); goTo(14); openHint("s14");');
  eq('hint', 'after a reload the same hint is still not re-reported',
    b2.verbs().filter(v => v === 'requested.1').length, 0);
  b2.dom.window.close();
}


/* ══════════════ 4. No duplicate completed ══════════════ */

function noDuplicateCompleted() {
  const b = boot('01');
  b.finishBoot();
  b.exec(MARK_ANSWERED);

  /* Walk every screen of component 01 forward. Each item boundary closes one item. */
  for (let n = 0; n <= 12; n++) b.exec('_goToCore(' + n + ');');
  const firstPass = b.stmts().filter(s => s.verb === 'completed');
  const items = firstPass.map(s => s.opts.objectId);
  eq('dupes', 'the forward walk closes each item exactly once',
    items.length, new Set(items).size);
  ok('dupes', 'and it closed the items the walk crossed (3 of 4)',
    items.length === 3, 'closed ' + items.length + ': ' + items.join(','));

  /* Now walk BACKWARDS over the same screens. Every item is re-entered, so
     'initialized' fires again — v2.4 requires that — but no 'completed' may: since O-1
     (QA/2026-09-27) an item closes only when the learner leaves it FORWARD, so the last
     item, which the forward walk entered but never left, stays open on the way back. */
  for (let n = 12; n >= 0; n--) b.exec('_goToCore(' + n + ');');
  const afterBack = b.stmts().filter(s => s.verb === 'completed').map(s => s.opts.objectId);
  eq('dupes', 'O-1: the backward walk closes nothing, not even the item it stepped back out of',
    afterBack.length, items.length);

  /* Forward again, then the component's end: the three closed items are not re-closed,
     and the last one closes exactly once — at xapiFinishItems, where it belongs. */
  for (let n = 0; n <= 12; n++) b.exec('_goToCore(' + n + ');');
  b.exec('xapiFinishItems();');
  const all = b.stmts().filter(s => s.verb === 'completed').map(s => s.opts.objectId);
  /* The invariant is that no item is EVER closed twice, which is what the stub's
     __dupes() reports (as a list of duplicate keys). */
  eq('dupes', 'no item is ever closed twice, forward + backward + forward walk',
    b.val('JSON.stringify(window.__dupes())'), '[]');
  eq('dupes', 'each item was closed exactly once across all three walks',
    all.length, new Set(all).size);
  /* All four by the end — which is the property that matters to the LRS. */
  ok('dupes', 'every one of the four items has been closed, exactly once',
    new Set(all).size === 4, 'closed ' + new Set(all).size);

  /* initialized, by contrast, MUST fire again on every re-entry — v2.4 §1 inverted
     the 2.3 rule that forbade it. */
  const backOnly = b.stmts().filter(s => s.verb === 'initialized');
  ok('dupes', 'initialized fires again on re-entry, as v2.4 requires',
    backOnly.length > items.length, String(backOnly.length));

  /* And a reload with the same document: still nothing re-closed. */
  const dumped = b.state();
  b.dom.window.close();

  const b2 = boot('01', { keepState: true });
  b2.exec('window.__reset(); window.__setState(' + JSON.stringify(dumped) + ');');
  b2.finishBoot();
  for (let n = 0; n <= 12; n++) b2.exec('_goToCore(' + n + ');');
  eq('dupes', 'after a reload the finished items are not closed again',
    b2.stmts().filter(s => s.verb === 'completed').length, 0);
  b2.dom.window.close();

  /* Component 03 carries SIX items over ten screens — the finest item granularity in
     the unit, and the one the four-component build collapsed into two. A wrong page
     number in SCREEN_TO_SUBCONTENT there would either merge two items into one
     'completed' or split one item into two, and neither shows up as an error. */
  const b3 = boot('03');
  b3.finishBoot();
  b3.exec('window.__reset();');
  b3.exec(MARK_ANSWERED);
  for (let n = 20; n <= 29; n++) b3.exec('_goToCore(' + n + ');');
  const c3fwd = b3.stmts().filter(s => s.verb === 'completed').map(s => s.opts.objectId);
  ok('dupes', 'component 03 closes five of its six items on the way in',
    c3fwd.length === 5 && new Set(c3fwd).size === 5,
    'closed ' + c3fwd.length + ': ' + c3fwd.join(','));
  b3.exec('xapiFinishItems();');
  const c3all = b3.stmts().filter(s => s.verb === 'completed').map(s => s.opts.objectId);
  ok('dupes', 'and the sixth on the way out, each exactly once',
    new Set(c3all).size === 6 && c3all.length === 6,
    'closed ' + c3all.length + ' / ' + new Set(c3all).size);
  ok('dupes', 'the six are 001..006 of component 03, in order',
    c3all.map(id => id.replace(/\/$/, '').split('-').pop()).join(',') ===
      '001,002,003,004,005,006', c3all.join(','));
  b3.dom.window.close();
}


/* ══════════════ 5. The component completed — and nothing unit-level ══════════════
   Since 2026-09-16 the platform owns routing (README.md): leaveToPart reports the
   component and STOPS — the landing pointer does not move and no hop happens — unless
   the page runs under DEV_NAV (?dev=1 without ?registration), where the old handover
   still works for a local walkthrough. finishUnit reports the component only; the
   unit-scoped 'completed' (and component 01's unit 'initialized') no longer exist. */

function componentCompletedOnly() {
  /* Component 01, PRODUCTION (the boot URL carries ?registration). */
  const b = boot('01');
  b.finishBoot();
  b.exec('window.__reset();');
  b.exec('leaveToPart(PART_NEXT, PART_LAST + 1);');

  const comp = b.stmts().filter(s => s.verb === 'completed' &&
    s.objectType === 'onlinelesson');
  eq('exit', 'leaving component 01 reports its completed exactly once', comp.length, 1);
  ok('exit', 'the component completed carries an explicit result',
    comp[0].result && typeof comp[0].result.success === 'boolean' &&
    comp[0].result.score && typeof comp[0].result.score.scaled === 'number',
    JSON.stringify(comp[0].result));
  ok('exit', 'a learner who answered nothing is reported as not passing',
    comp[0].result.success === false && comp[0].result.score.scaled === 0,
    JSON.stringify(comp[0].result));
  ok('exit', 'nothing sent is unit-scoped',
    !b.stmts().some(s => s.opts && s.opts.scope === 'unit'));

  /* The platform routes: the pointer stays, no edge, the button is disabled. Nothing has
     written the document yet, so __state() may well still be null — that too is "not moved". */
  const st = b.state();
  ok('exit', 'production: the document (if written) is this part\'s, with no landing pointer (v6)',
    !st || (st.component === PART_DIR('01') && !('part' in st) && !('parts' in st) && !('prev' in st)), JSON.stringify(st));
  ok('exit', 'production: no back edge was recorded',
    b.val("sessionStorage.getItem('lomda_nav_edges::methodica-ar-math-ratio-01')") === null, String(b.val("sessionStorage.getItem('lomda_nav_edges::methodica-ar-math-ratio-01')")));
  ok('exit', 'production: the last screen\'s button is disabled after the report',
    b.val("document.getElementById('s12-check').disabled") === true &&
    b.val("document.getElementById('s12-check').getAttribute('aria-disabled')") === 'true');

  /* Leaving twice must not report twice. */
  b.exec('window.__reset(); leaveToPart(PART_NEXT, PART_LAST + 1);');
  eq('exit', 'leaving again does not re-report the component',
    b.stmts().filter(s => s.verb === 'completed').length, 0);
  b.dom.window.close();

  /* Component 01 under DEV_NAV: the old handover, for the local walkthrough. */
  const d = boot('01', { search: '?slxapi=1&dev=1' });
  d.finishBoot();
  d.exec('window.__reset();');
  ok('exit', 'dev: DEV_NAV is true with ?dev=1 and no ?registration', d.val('DEV_NAV') === true);
  d.exec('leaveToPart(PART_NEXT, PART_LAST + 1);');
  eq('exit', 'dev: the component completed still goes out once',
    d.stmts().filter(s => s.verb === 'completed' && s.objectType === 'onlinelesson').length, 1);
  ok('exit', 'dev: the back edge into 02 records this part (sessionStorage edge map)',
    (function () { try { return JSON.parse(d.val("sessionStorage.getItem('lomda_nav_edges::methodica-ar-math-ratio-01')"))[PART_DIR('02')].from === PART_DIR('01'); } catch (e) { return false; } })(),
    String(d.val("sessionStorage.getItem('lomda_nav_edges::methodica-ar-math-ratio-01')")));
  ok('exit', 'dev: this part\'s document was saved before the hop — its own payload, no pointer fields (v6)',
    d.state() && d.state().component === PART_DIR('01') && d.state().payload && !('part' in d.state()) && !('parts' in d.state()) && !('prev' in d.state()),
    JSON.stringify(d.state()));
  d.dom.window.close();

  /* Component 06 (שאלת שיא) is terminal: "סיימתי" reports the component — only. */
  const b4 = boot('06');
  b4.finishBoot();
  b4.exec('window.__reset();');
  b4.exec(MARK_ANSWERED);   /* component 06's single item is graded, so it is deferred unanswered */
  ok('exit', 'xapiCompleteUnit no longer exists', b4.val('typeof xapiCompleteUnit') === 'undefined');
  b4.exec('finishUnit();');
  const all = b4.stmts().filter(s => s.verb === 'completed');
  /* Two: xapiCompleteComponent closes the still-open ITEM first — an item left open
     would never be reported at all, and a 'completed' for the component that arrived
     before its own item closed would order them wrongly in the LRS. Until 2026-09-16 a
     third, unit-scoped 'completed' followed; MOE v2.5/v2.7 define 'completed' at the
     פריט and רכיב levels only, so it is gone. */
  eq('exit', 'the finale closes the open item, then the component — and nothing more',
    all.length, 2);
  eq('exit', 'and in that order',
    all.map(s => s.objectType), ['question', 'onlinelesson']);
  ok('exit', 'none of it is unit-scoped',
    !all.some(s => s.opts && s.opts.scope === 'unit'), JSON.stringify(all.map(s => s.opts)));
  ok('exit', 'the component completed carries an explicit result',
    all[1] && all[1].result && typeof all[1].result.success === 'boolean',
    JSON.stringify(all[1] && all[1].result));
  ok('exit', '"סיימתי" is disabled after the report',
    b4.val("document.getElementById('s45-continue').disabled") === true);

  b4.exec('window.__reset(); finishUnit();');
  eq('exit', 're-reaching the finale reports nothing again',
    b4.stmts().filter(s => s.verb === 'completed').length, 0);
  b4.dom.window.close();
}


/* ══════════════ 5b. D-8: a finished component stays finished after a resume ══════════════
   QA/2026-09-20 D-8. xapiEndComponent disables the finish button when the component
   'completed' goes out — and nothing re-applied that on a reload, or when the learner
   stepped back and forward onto the last screen: the painters relabel it שנמשיך? and
   ENABLE it. The click was harmless (the done ledger swallows the duplicate) but the
   screen said the work was not recorded.

   For every component: finish it through the real exit (goTo(PART_LAST + 1) — the
   wrapper that calls leaveToPart / finishUnit), then (1) reload from the saved document
   and (2) step back one screen and forward again. The finish button must be disabled,
   with aria-disabled, both times, and a click on it must send nothing. The control: a
   component NOT yet completed keeps its button live on the same screen. */

function endedButtonAfterResume() {
  const disabled = (x) => x.val('(function(){ var b = lastScreenButton(); return !!b && b.disabled === true && b.getAttribute("aria-disabled") === "true"; })()');
  for (const c of ['01', '02', '03', '04', '05', '06']) {
    const b = boot(c);
    b.finishBoot();
    b.exec(MARK_ANSWERED);
    /* A multi-select last screen (01 s12, 03 s29, 05 s36) is answered correctly and left
       through its own שנמשיך? — the QA walk exactly. The others leave through the exit. */
    b.exec('_goToCore(PART_LAST);');
    const mcqLast = b.val('!!MCQ["s" + PART_LAST]');
    if (mcqLast) {
      b.exec('(function(){ var q = MCQ["s" + PART_LAST]; q.correctIds.forEach(function(id){ mcqToggle(q, id); });' +
        ' var k = lastScreenButton(); k.click(); k.click(); })();');
    } else {
      b.exec('goTo(PART_LAST + 1);');
    }
    ok('ended', c + ': finishing reports the component and disables its finish button',
      b.val('alreadySent("done", currentPartSlug())') === true && disabled(b) === true,
      'done=' + b.val('alreadySent("done", currentPartSlug())') + ' disabled=' + disabled(b));
    const payload = JSON.parse(b.val('JSON.stringify(capturePartPayload())'));
    const dumped = b.state();
    b.dom.window.close();

    const r = boot(c, { keepState: true });
    r.exec('window.__reset(); window.__setState(' + JSON.stringify(dumped) + ');');
    r.finishBoot(payload);
    ok('ended', c + ': after a reload onto the last screen, the finish button is still disabled',
      r.val('currentScreen') === r.val('PART_LAST') && disabled(r) === true,
      'screen=' + r.val('currentScreen') + ' ' + r.val('(function(){ var b = lastScreenButton(); return b ? b.id + " disabled=" + b.disabled + " aria=" + b.getAttribute("aria-disabled") : "none"; })()'));

    r.exec('goTo(PART_LAST - 1); goTo(PART_LAST);');
    ok('ended', c + ': after back and forward onto it, still disabled', disabled(r) === true,
      r.val('(function(){ var b = lastScreenButton(); return b.id + " disabled=" + b.disabled; })()'));

    r.exec('window.__reset(); lastScreenButton().click();');
    eq('ended', c + ': and a click on it sends nothing', r.stmts().length, 0);
    r.dom.window.close();
  }

  /* The control: screen 12 answered, component 01 NOT left — the ledger has no done, so
     the painter's live שנמשיך? must survive a reload untouched. */
  const n = boot('01');
  n.finishBoot();
  n.exec('goTo(12); s12Toggle("a"); s12Toggle("b"); s12Toggle("d"); s12Check();');
  ok('ended', 'control: 01 s12 answered, component not yet completed',
    n.val('MCQ.s12.done') === true && n.val('alreadySent("done", currentPartSlug())') === false);
  const np = JSON.parse(n.val('JSON.stringify(capturePartPayload())'));
  const nd = n.state();
  n.dom.window.close();
  const n2 = boot('01', { keepState: true });
  n2.exec('window.__reset(); window.__setState(' + JSON.stringify(nd) + ');');
  n2.finishBoot(np);
  ok('ended', 'control: after a reload its שנמשיך? is still live',
    n2.val('document.getElementById("s12-check").disabled') === false &&
    n2.val('document.getElementById("s12-check").getAttribute("aria-disabled")') !== 'true',
    'disabled=' + n2.val('document.getElementById("s12-check").disabled'));
  n2.dom.window.close();
}


/* ══════════════ 6. Resuming onto an answered screen ══════════════ */

function resumeEmitsNothingExtra() {
  /* Answer screen 2, dump the document, and reload straight back onto it. Exactly one
     item 'initialized' may leave, and nothing else — no answered, no completed. */
  const b = boot('01');
  b.finishBoot();
  b.exec(ANSWER_S2);
  const payload = JSON.parse(b.val('JSON.stringify(capturePartPayload())'));
  const dumped = b.state();
  b.dom.window.close();

  const b2 = boot('01', { keepState: true });
  b2.exec('window.__reset(); window.__setState(' + JSON.stringify(dumped) + ');');
  b2.finishBoot(payload);

  const v = b2.verbs();
  eq('resume', 'a resumed session re-sends no answered', v.filter(x => /^answered/.test(x)).length, 0);
  eq('resume', 'and no completed', v.filter(x => x === 'completed').length, 0);
  eq('resume', 'exactly one item initialized leaves, plus the component one',
    v.filter(x => x === 'initialized').length, 2);
  ok('resume', 'the learner landed on the screen they left',
    b2.val('currentScreen') === 2, String(b2.val('currentScreen')));
  ok('resume', 'and the screen is repainted as answered',
    b2.val('MCQ.s2.done') === true &&
    b2.val('Array.from(document.querySelectorAll("#s2 .scq-opt")).every(function(o){return o.disabled;})') === true);

  /* ── An item answered BEFORE the reload must still close after it ──
     xapi-720-k.js defers an item's 'completed' until an 'answered' for that item has passed
     through in THIS page load, and a resume deliberately re-sends none. So without
     xapiSeedAnsweredFromResume() (../unit-js/20-xapi.js, called at the end of
     applyExecutionState) this close is silently DROPPED — while sendStatementOnce, having
     called the sender, still marks the ledger sent. The statement is then lost for good: the
     lomda never asks again and the library has no retry queue of any kind.

     Found live against Kata on 07.09.26 and invisible to this suite until the stub learned the
     guard, so keep both halves — deleting the stub's guard makes this assertion vacuous rather
     than failing.

     Screen 2 is in item 002, screen 5 in item 003, so this crossing closes 002 — the item the
     learner answered in the previous session. Nothing has been closed up to this point (the
     'and no completed' assertion above), so every 'completed' here belongs to this crossing. */
  b2.exec('_goToCore(5);');
  const afterReload = b2.stmts().filter(s => s.verb === 'completed').map(s => s.opts.objectId);
  ok('resume', 'an item answered before the reload still closes after it',
    afterReload.length === 1 && /-01-002\/$/.test(afterReload[0]),
    'closed ' + afterReload.length + ': ' + afterReload.join(','));

  /* The #screen= hash chooses the landing screen without cancelling the restore —
     which is what a cross-part "back" relies on. */
  b2.dom.window.close();
  const b3 = boot('01', { keepState: true, hash: '#screen=3' });
  b3.exec('window.__reset(); window.__setState(' + JSON.stringify(dumped) + ');');
  b3.finishBoot(payload, 3);
  ok('resume', 'a #screen= hash overrides the landing screen',
    b3.val('currentScreen') === 3, String(b3.val('currentScreen')));
  ok('resume', 'but the state is still restored (the score survives the override)',
    b3.val('MCQ.s2.done') === true);
  b3.dom.window.close();
}


/* ══════════════ 7. The regression gate, behaviourally ══════════════ */

function offPlatformSendsNothing() {
  /* No ?slxapi: the library never loads, so nothing can reach the network. Asserted
     behaviourally here rather than by symbol presence. */
  const dir = path.join(BASE, PART_DIR('01'));
  const dom = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
    url: 'http://localhost:8777/' + PART_DIR('01') + '/index.html',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  const w = dom.window;
  const exec = (code) => {
    const s = w.document.createElement('script');
    s.textContent = code;
    w.document.head.appendChild(s);
    s.remove();
  };
  const val = (expr) => {
    exec('window.__v = (function(){ try { return (' + expr +
      '); } catch (e) { return "__throw:" + e.message; } })();');
    return w.__v;
  };
  w.console.error = w.console.warn = w.console.log = () => {};
  const sent = [];
  w.fetch = (...a) => { sent.push(a); return Promise.resolve({ ok: true }); };
  w.HTMLMediaElement.prototype.load = function () {};
  w.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  w.HTMLMediaElement.prototype.pause = function () {};
  for (const src of [...w.document.querySelectorAll('script[src]')]
    .map(s => s.getAttribute('src'))) {
    if (/^[a-z]+:\/\//i.test(src) || src.startsWith('//')) continue;
    const p = path.resolve(dir, src.split('?')[0]);
    if (fs.existsSync(p)) { try { exec(fs.readFileSync(p, 'utf8')); } catch (e) {} }
  }

  ok('gate', 'off platform the library never loaded',
    val('typeof sendStatement720') === 'undefined');
  /* A whole answered screen, driven for real, must be silent and must still score. */
  exec(ANSWER_S2);
  ok('gate', 'answering off platform does not throw',
    val('MCQ.s2.done') === true);
  ok('gate', 'and still records the score locally',
    val('screenWasCorrect("s2")') === true);
  ok('gate', 'and the component result is still computed',
    typeof val('partResult().score.scaled') === 'number');
  ok('gate', 'nothing reached the network', sent.length === 0, String(sent.length));
  exec('leaveToPart("' + PART_DIR('02') + '", 13);');
  ok('gate', 'even leaving the component sends nothing', sent.length === 0, String(sent.length));
  dom.window.close();
}


/* ══════════════ 8. B-1: leaving an unanswered item keeps its completed ══════════════
   Live Kata run 2026-09-27 (QA/2026-09-27/REPORT.md), component 02: after a reload onto s17
   (item 003, not yet answered in THIS page load) the learner pressed Back to s16 and went on.
   Leaving 003 called sendCompletedOnce; xapi-720-k.js dropped the 'completed' (its "deferring"
   is a return: no queue, no retry) while the doneItems ledger still recorded it as sent — so the
   real, scored 'completed', after the learner answered 003 and finished, never went out.
   The stub models the drop, so the live path replays here exactly. Port of the mass-weight-01
   fix 5ad764d: the close asks the library's question first and, when the library would drop
   the statement, sends nothing and leaves the ledger untouched. */

const ITEM_COMPLETED = (b, item) => b.stmts().filter(s => s.verb === 'completed' &&
  s.objectType === 'question' && s.opts && /-(\d{3})\/$/.test(s.opts.objectId) &&
  s.opts.objectId.replace(/\/$/, '').split('-').pop() === item);

function b1UnansweredItemKeepsCompleted() {
  /* ── the live replay, component 02 ── */
  const b = boot('02');
  b.finishBoot();
  b.exec('goTo(14);' +
    ' ["b","a","c","c"].forEach(function (v, i) { var e = document.getElementById("s14-sel-" + i); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); });' +
    ' s14Check(); goTo(15); s15Toggle("a"); s15Toggle("b"); s15Check(); goTo(16);' +
    ' [40, 30, 10, 100].forEach(function (v, i) { var e = document.getElementById("s16-in-" + i); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); });' +
    ' s16Check(); goTo(17);');
  ok('B-1', '02: s14-s16 answered through the real handlers',
    b.val('!!(s14Done && s16Done && MCQ.s15.done)') === true);
  const payload = JSON.parse(b.val('JSON.stringify(capturePartPayload())'));
  const dumped = b.state();
  b.dom.window.close();

  /* A fresh page load onto s17: the library's per-load answered memory is empty for 003. */
  const r = boot('02', { keepState: true });
  r.exec('window.__reset(); window.__setState(' + JSON.stringify(dumped) + ');');
  r.finishBoot(payload);
  eq('B-1', '02: the reload lands on s17 (item 003)', r.val('currentScreen'), 17);
  r.exec('goTo(16); goTo(17);');
  eq('B-1', '02: Back through unanswered 003 sends no completed for it', ITEM_COMPLETED(r, '003').length, 0);
  ok('B-1', '02: and leaves the ledger clean for 003',
    r.val('alreadySent("doneItems", itemLedgerKey("003"))') === false);

  /* Now answer 003 (s17, s18) and s19, and finish through the real exit. */
  r.exec('["s17","s18"].forEach(function (sid) { goTo(Number(sid.slice(1))); var st = BQ[sid];' +
    ' Object.keys(st.target).forEach(function (k) { var d = st.target[k] - st[k]; for (var i = 0; i < Math.abs(d); i++) bqAdd(sid, k, d > 0 ? 1 : -1); });' +
    ' bqCheck(sid); }); goTo(19); s19qSelect(S19Q.correctId); s19qCheck(); goTo(PART_LAST + 1);');
  const c3 = ITEM_COMPLETED(r, '003');
  eq('B-1', '02: after answering, 003 is completed exactly once', c3.length, 1);
  ok('B-1', '02: carrying its result', !!(c3[0] && c3[0].result && typeof c3[0].result.success === 'boolean'),
    JSON.stringify(c3[0] && c3[0].result));
  const order = r.stmts().filter(s => s.verb === 'completed').map(s => s.objectType);
  ok('B-1', '02: the item completed goes out before the component completed',
    order.indexOf('question') !== -1 && order.lastIndexOf('question') < order.indexOf('onlinelesson'), order.join(','));
  r.dom.window.close();

  /* ── every component with evaluated items: the guard itself ── */
  for (const c of ['01', '02', '03', '04', '05', '06']) {
    const g = boot(c);
    g.finishBoot();
    const E = g.val('Object.keys(XAPI_EVAL_ITEMS)[0] || ""');
    if (!E) { g.dom.window.close(); continue; }
    const sE = g.val('(function(){ for (var n = PART_FIRST; n <= PART_LAST; n++) { var m = SCREEN_TO_SUBCONTENT[n]; if (m && m[0] === ' + JSON.stringify(E) + ') return n; } return -1; })()');
    const sO = g.val('(function(){ for (var n = PART_FIRST; n <= PART_LAST; n++) { var m = SCREEN_TO_SUBCONTENT[n]; if (!m || m[0] !== ' + JSON.stringify(E) + ') return n; } return -1; })()');
    const tag = c + ' item ' + E;
    /* Start with nothing open and the library's memory empty. */
    g.exec('window.xapiItemAnswered = {}; xapiCurrentItem = null; window.__reset();');

    g.exec('_goToCore(' + sE + '); xapiFinishItems();');
    ok('B-1', tag + ': xapiFinishItems on it unanswered sends nothing, leaves the ledger clean, clears the open item',
      ITEM_COMPLETED(g, E).length === 0 && g.val('alreadySent("doneItems", itemLedgerKey(' + JSON.stringify(E) + '))') === false &&
      g.val('xapiCurrentItem === null') === true);
    /* A single-item component (06: every screen is item 001) has no other item to leave to —
       its only close is xapiFinishItems, checked above. */
    if (sO < 0) { g.dom.window.close(); continue; }

    g.exec('_goToCore(' + sE + '); _goToCore(' + sO + ');');
    ok('B-1', tag + ': leaving it unanswered sends no completed and leaves the ledger clean',
      ITEM_COMPLETED(g, E).length === 0 && g.val('alreadySent("doneItems", itemLedgerKey(' + JSON.stringify(E) + '))') === false);

    g.exec('_goToCore(' + sE + '); window.xapiItemAnswered[xapiItemId(' + JSON.stringify(E) + ')] = true; _goToCore(' + sO + ');');
    ok('B-1', tag + ': once answered, leaving sends its completed once and marks the ledger',
      ITEM_COMPLETED(g, E).length === 1 && g.val('alreadySent("doneItems", itemLedgerKey(' + JSON.stringify(E) + '))') === true,
      String(ITEM_COMPLETED(g, E).length));
    g.dom.window.close();

    /* Fallback: with the library's map unreachable, the recorded answers decide. The close is
       observed at sendCompletedOnce, because the stub's own gate reads the same map. */
    const f = boot(c);
    f.finishBoot();
    const fb = JSON.parse(f.val('(function(){ var E = ' + JSON.stringify(E) + ', n = 0, orig = window.sendCompletedOnce;' +
      ' window.sendCompletedOnce = function (ledger, key) { if (ledger === "doneItems" && key === itemLedgerKey(E)) n++; };' +
      ' delete window.xapiItemAnswered; Object.keys(XAPI_Q_RESULTS).forEach(function (k) { delete XAPI_Q_RESULTS[k]; }); xapiCurrentItem = null;' +
      ' _goToCore(' + sE + '); _goToCore(' + sO + '); var out = { unanswered: n };' +
      ' XAPI_Q_RESULTS[E + "/q1"] = false; _goToCore(' + sE + '); _goToCore(' + sO + '); out.answered = n - out.unanswered;' +
      ' window.sendCompletedOnce = orig; return JSON.stringify(out); })()'));
    ok('B-1', tag + ': without the library map, XAPI_Q_RESULTS decides (drop unanswered, send answered, even wrong)',
      fb.unanswered === 0 && fb.answered === 1, JSON.stringify(fb));
    f.dom.window.close();
  }
}


/* ══════════════ 9. O-1 and O-2 (QA/2026-09-27/REPORT.md) ══════════════
   O-1: live, Back from s5 to s4 in component 01 reported item 003 (the ungraded worked
   example, s5–s11) completed after one of its seven screens. An item now closes only when
   the learner leaves it FORWARD, or at the component's end.
   O-2: live, the three class-task boxes on 04 s31 were typed and the page reloaded a second
   later; with no screen change nothing had been saved and the boxes came back empty. Typing
   into a resumable field now schedules the same debounced save a screen change does. */

function o1BackDoesNotCloseAndO2TypingSaves() {
  /* ── O-1: the live replay on 01 ── */
  const b = boot('01');
  b.finishBoot();
  b.exec(MARK_ANSWERED);
  for (let n = 0; n <= 5; n++) b.exec('_goToCore(' + n + ');');
  eq('O-1', '01: on s5 the open item is 003', b.val('xapiCurrentItem'), '003');
  const before = ITEM_COMPLETED(b, '003').length;
  b.exec('goTo(4);');
  eq('O-1', '01: Back from s5 to s4 sends no completed for 003', ITEM_COMPLETED(b, '003').length - before, 0);
  ok('O-1', '01: and leaves 003 unrecorded in the ledger',
    b.val('alreadySent("doneItems", itemLedgerKey("003"))') === false);
  ok('O-1', '01: Back into 002 re-opens it (initialized, as v2.4 requires)',
    b.stmts().filter(s => s.verb === 'initialized' && s.opts && /-002\/$/.test(s.opts.objectId)).length >= 2);
  eq('O-1', '01: and does not close 002 again', ITEM_COMPLETED(b, '002').length, 1);
  for (let n = 4; n <= 12; n++) b.exec('_goToCore(' + n + ');');
  eq('O-1', '01: walking forward past 003 closes it exactly once', ITEM_COMPLETED(b, '003').length, 1);
  eq('O-1', '01: nothing is ever closed twice', b.val('JSON.stringify(window.__dupes())'), '[]');
  b.dom.window.close();

  /* A forward move that SKIPS an item (not possible for a learner, but goTo allows it) still
     closes the item being left: only a lower-numbered destination counts as Back. */
  const f = boot('01');
  f.finishBoot();
  f.exec(MARK_ANSWERED + ' _goToCore(2); _goToCore(12);');
  eq('O-1', '01: a forward jump still closes the item left', ITEM_COMPLETED(f, '002').length, 1);
  f.dom.window.close();

  /* ── O-2: typing on 04 s31 saves, without a screen change ── */
  const t = boot('04');
  t.finishBoot();
  t.exec('goTo(31);');
  t.exec('window.__saves = []; var _orig = window.saveState720Debounced;' +
    ' window.saveState720Debounced = function (id, doc) { window.__saves.push(JSON.parse(JSON.stringify(doc))); return _orig.apply(this, arguments); };');
  t.exec('["2","3","5"].forEach(function (v, i) { var e = document.getElementById("s32-in-" + i); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); });');
  const saves = JSON.parse(t.val('JSON.stringify(window.__saves)'));
  ok('O-2', '04: typing into the s31 boxes schedules a save without a screen change', saves.length >= 1, String(saves.length));
  const last = saves[saves.length - 1];
  const inputs = last && last.payload && last.payload.inputs;
  ok('O-2', '04: the last scheduled save carries all three typed values',
    !!inputs && inputs['s32-in-0'] === '2' && inputs['s32-in-1'] === '3' && inputs['s32-in-2'] === '5', JSON.stringify(inputs));
  t.exec('window.__saves = []; var e = document.createElement("input"); e.id = "not-a-resume-field"; document.body.appendChild(e);' +
    ' e.value = "x"; e.dispatchEvent(new Event("input", { bubbles: true }));');
  eq('O-2', '04: typing into a field that is not resumable schedules nothing', t.val('window.__saves.length'), 0);
  t.dom.window.close();

  /* The reload, from exactly that saved document: the values come back and continue is live. */
  const r = boot('04', { keepState: true });
  r.exec('window.__reset(); window.__setState(' + JSON.stringify(last) + ');');
  r.finishBoot(last.payload);
  eq('O-2', '04: the reload lands on s31', r.val('currentScreen'), 31);
  eq('O-2', '04: the three values are restored',
    r.val('[0,1,2].map(function (i) { return document.getElementById("s32-in-" + i).value; }).join(",")'), '2,3,5');
  eq('O-2', '04: and continue is enabled', r.val('document.getElementById("s31-continue").disabled'), false);
  r.dom.window.close();
}


/* ══════════════ run ══════════════ */

const suites = [
  ['fresh load', freshLoad],
  ['answering', answering],
  ['hints', hints],
  ['no duplicate completed', noDuplicateCompleted],
  ['component completed, nothing unit-level', componentCompletedOnly],
  ['D-8: a finished component stays finished after a resume', endedButtonAfterResume],
  ['resume emits nothing extra', resumeEmitsNothingExtra],
  ['off-platform gate', offPlatformSendsNothing],
  ['B-1: leaving an unanswered item keeps its completed', b1UnansweredItemKeepsCompleted],
  ['O-1: Back closes nothing; O-2: typing saves', o1BackDoesNotCloseAndO2TypingSaves],
];

for (const [name, fn] of suites) {
  const before = failures.length;
  try { fn(); }
  catch (e) { failures.push('[' + name + '] SUITE THREW: ' + e.message + '\n' + e.stack); }
  const added = failures.length - before;
  console.log((added ? '✗ ' : '✓ ') + name + (added ? '  (' + added + ' failure(s))' : ''));
}

console.log('\n' + passes + ' passed, ' + failures.length + ' failed');
if (failures.length) {
  console.log('\nFailures:');
  failures.forEach(f => console.log('  ' + f));
  process.exit(1);
}
