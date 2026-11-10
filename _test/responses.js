/* ═══════════════════ answered result.response = Kata's correctXapiResponsesPattern ═══════════════════
   NOT DEPLOYED. Dev tooling only.

   MOE runbook (10.11.26): a right answer must send exactly the string Kata keeps in the question's
   correctXapiResponsesPattern ('[,]' between choices / pairs, '[.]' between a step and its value).
   metadata/ carries Kata's patterns since 2026-11-11 (plus the proposed corrections, see the
   proposal commit). For every metadata question with a pattern, the real handlers are driven on a
   fresh boot with the local library stub:
     - the right answer: one answered per question, success true, response === a pattern entry;
       a screen Kata splits into one question per input sends each of them;
     - single choice: EVERY option — its metadata answer, verbatim; success exactly on the pattern;
     - multi-select clicked in reverse order: the same string;
     - no response carries ' | ', an input id ('s39-input='), an id=value dump or an invisible mark.
   Mutation check: with the 20-xapi.js, 70-screens.js and part scripts from before 2026-11-11,
   most of these fail.

   Run (same jsdom as verify-report.js):
     NODE_PATH=/tmp/lomda-test/node_modules node _test/responses.js [BASE] */

'use strict';

const fs   = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const BASE = process.argv[2] || path.join(__dirname, '..');
const UNIT = fs.readdirSync(path.join(BASE, 'metadata')).find(f => /_unit\.json$/.test(f)).replace(/_unit\.json$/, '');
const PART_DIR = c => UNIT + '-' + c;

const failures = [];
let passes = 0;
function ok(tag, what, cond, detail) {
  if (cond) { passes++; return; }
  failures.push('[' + tag + '] ' + what + (detail ? '  —  ' + detail : ''));
}

/* metadata questions with a pattern, keyed '<part>:<item>/<qKey>' */
const Q = {};
for (const c of ['01', '02', '03', '04', '05', '06']) {
  const m = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata', PART_DIR(c) + '.json'), 'utf8').replace(/^\uFEFF/, ''));
  for (const it of m.subContent || []) for (const q of it.questions || []) {
    if (!q.correctXapiResponsesPattern || !q.correctXapiResponsesPattern.length) continue;
    const parts = q.questionId.replace(/\/+$/, '').split('/');
    Q[c + ':' + parts[parts.length - 2].slice(-3) + '/' + parts[parts.length - 1]] = q;
  }
}

/* How each screen is answered right through its real handlers. */
const L = i => String.fromCharCode(97 + i);
const typed = (ids, vals, submit) => ids.map((id, i) => `document.getElementById('${id}').value = ${JSON.stringify(String(vals[i]))};`).join(' ') + ' ' + submit;
const mcq = (obj, toggle, submit) => ({
  right: `[...${obj}].sort().forEach(function (id) { ${toggle}(id); }); ${submit}`,
  reverse: `[...${obj}].sort().reverse().forEach(function (id) { ${toggle}(id); }); ${submit}`,
});
const scq = (select, submit) => ({ choice: { select: i => `${select}('${L(i)}');`, submit } });
const bq = sid => `BQ.${sid}[bqKinds(BQ.${sid}).a.key] = BQ.${sid}.target[bqKinds(BQ.${sid}).a.key]; BQ.${sid}[bqKinds(BQ.${sid}).b.key] = BQ.${sid}.target[bqKinds(BQ.${sid}).b.key]; bqCheck('${sid}');`;
const S = {   // screen -> [part, walk]
  s1:   ['01', scq('s1qSelect', 's1qCheck();')],
  s2:   ['01', mcq('MCQ.s2.correctIds', 's2Toggle', 's2Check();')],
  s3:   ['01', mcq('MCQ.s3.correctIds', 's3Toggle', 's3Check();')],
  s4q1: ['01', mcq('S4Q1_CORRECT', 's4q1Toggle', 's4q1Check();')],
  s4q2: ['01', { right: typed(['s4q2-left', 's4q2-right'], [1, 4], 's4q2Check();') }],
  s4q3: ['01', { right: typed(['s4q3-input'], [12], 's4q3Check();') }],
  s4q4: ['01', { right: `Object.keys(S4Q4_CORRECT).forEach(function (k) { [...document.querySelectorAll('.saq-pill')].find(function (b) { return (b.getAttribute('onclick') || '').indexOf("s4q4Pick('" + k + "','" + S4Q4_CORRECT[k] + "'") === 0; }).click(); }); s4q4Check();` }],
  s12:  ['01', mcq('MCQ.s12.correctIds', 's12Toggle', 's12Check();')],
  s14:  ['02', { right: `S14_CORRECT.forEach(function (v, i) { document.getElementById('s14-sel-' + i).value = v; }); s14Check();` }],
  s15:  ['02', mcq('MCQ.s15.correctIds', 's15Toggle', 's15Check();')],
  s16:  ['02', { right: `S16_CORRECT.forEach(function (v, i) { document.getElementById('s16-in-' + i).value = String(v); }); s16Check();` }],
  s17:  ['02', { right: bq('s17') }],
  s18:  ['02', { right: bq('s18') }],
  s19:  ['02', scq('s19qSelect', 's19qCheck();')],
  s21:  ['03', { right: `S21_ANS.forEach(function (r, i) { document.getElementById('s21-in-' + i + 'a').value = String(r[0]); document.getElementById('s21-in-' + i + 'b').value = String(r[1]); }); s21Check();` }],
  s22:  ['03', { right: `S22_ANS.forEach(function (v, i) { document.getElementById('s22-in-' + i).value = String(v); }); s22Check();` }],
  s23:  ['03', scq('s23Select', 's23Check();')],
  s24:  ['03', { right: bq('s24') }],
  s25:  ['03', { right: bq('s25') }],
  s27:  ['03', scq('s27Select', 's27Check();')],
  s28:  ['03', { right: `S28_ANS.forEach(function (v, i) { document.getElementById('s28-in-' + i).value = v; }); s28Check();`,
                 also: [`S28_ANS.forEach(function (v, i) { document.getElementById('s28-in-' + i).value = v === '3/4' ? '0.75' : v; }); s28Check();`] }],
  s29:  ['03', mcq('MCQ.s29.correctIds', 's29Toggle', 's29Check();')],
  s34:  ['05', mcq('MCQ.s34.correctIds', 's34Toggle', 's34Check();')],
  s35:  ['05', scq('s35Select', 's35Check();')],
  s36:  ['05', mcq('MCQ.s36.correctIds', 's36Toggle', 's36Check();')],
  s39:  ['06', { right: typed(['s39-input'], [3], 's39Check();') }],
  s40:  ['06', scq('s40Select', 's40Check();')],
  s42:  ['06', mcq('MCQ.s42.correctIds', 's42Toggle', 's42Check();')],
  s43:  ['06', scq('s43Select', 's43Check();')],
};

function boot(c) {
  const dir = path.join(BASE, PART_DIR(c));
  const dom = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
    url: 'http://localhost:8777/' + PART_DIR(c) + '/index.html?slxapi=1&registration=r1',
    runScripts: 'dangerously', pretendToBeVisual: true,
  });
  const w = dom.window;
  const exec = (code) => { const s = w.document.createElement('script'); s.textContent = code; w.document.head.appendChild(s); s.remove(); };
  const val = (expr) => { exec('window.__v = (function(){ try { return (' + expr + '); } catch (e) { return "__throw:" + e.message; } })();'); return w.__v; };
  const errors = [];
  w.console.error = (...a) => errors.push(a.join(' '));
  w.console.warn = w.console.log = () => {};
  w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  w.HTMLMediaElement.prototype.load  = function () {};
  w.HTMLMediaElement.prototype.play  = function () { return Promise.resolve(); };
  w.HTMLMediaElement.prototype.pause = function () {};
  w.scrollTo = () => {};
  for (const src of [...w.document.querySelectorAll('script[src]')].map(s => s.getAttribute('src'))) {
    if (/^[a-z]+:\/\//i.test(src) || src.startsWith('//')) continue;
    const p = path.resolve(dir, src.split('?')[0]);
    if (fs.existsSync(p)) { try { exec(fs.readFileSync(p, 'utf8')); } catch (e) { errors.push(src + ': ' + e.message); } }
  }
  exec(fs.readFileSync(path.join(__dirname, 'xapi-720-k.js'), 'utf8'));
  exec('window.XAPI_USING_G = true; window.__reset();');
  exec('window.METADATA = ' + fs.readFileSync(path.join(BASE, 'metadata', PART_DIR(c) + '.json'), 'utf8').replace(/^\uFEFF/, '') + ';');
  exec('try { _resumeReady = true; _unitState = emptyUnitState(); } catch (e) {} sendStatement720("initialized", "onlinelesson");');
  const stmts = () => JSON.parse(val('JSON.stringify(window.__stmts())'));
  return { dom, exec, val, stmts, errors };
}

const shortKey = qid => qid.replace(/\/+$/, '').split('/').slice(-2).join('/').replace(/^.*-(\d{3})\//, '$1/');
const sentOf = s => { const r = s.result || {}; return r.response != null ? String(r.response) : ''; };
const BAD = /\s\|\s|\b(?:s\d+[a-z0-9]*-[\w-]+|pink|white|snack|candy)=|[\u200B\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069\uFEFF]/;
const runs = {};
/* answer once on a fresh boot; every answered statement of that run, by short key */
function run(part, screen, code, tag) {
  const k = part + '|' + code;
  if (runs[k]) return runs[k];
  const b = boot(part);
  const n = parseInt(screen.replace(/\D/g, ''), 10);
  b.exec('try { goTo(' + n + '); } catch (e) {} window.__reset();');
  b.exec(code);
  const out = {};
  b.stmts().filter(s => /^answered/.test(s.verb) && s.opts && s.opts.questionId).forEach(s => {
    (out[shortKey(s.opts.questionId)] = out[shortKey(s.opts.questionId)] || []).push(s);
  });
  ok(tag, 'no console error', b.errors.length === 0, b.errors.slice(0, 2).join(' | '));
  b.dom.window.close();
  return (runs[k] = out);
}

/* which screen answers which metadata question: from the part script's own XAPI_QMAP */
function screenOf(part, key) {
  const b = boot(part);
  const sid = b.val(`Object.keys(XAPI_QMAP).find(function (s) { var k = xapiKeyFor(s); return k && k.qKeys.some(function (q) { return k.item + '/' + q === ${JSON.stringify(key)}; }); }) || null`);
  b.dom.window.close();
  return sid;
}

for (const key of Object.keys(Q)) {
  const [part, qk] = key.split(':');
  const q = Q[key], pat = q.correctXapiResponsesPattern;
  const sid = screenOf(part, qk);
  ok(key, 'a screen reports this question', !!sid && !!S[sid], String(sid));
  if (!sid || !S[sid]) continue;
  const w = S[sid][1];
  const checkRight = (code, tag) => {
    const hits = (run(part, sid, code, tag)[qk]) || [];
    ok(tag, 'exactly one answered', hits.length === 1, String(hits.length));
    for (const s of hits) {
      ok(tag, 'success true', s.result && s.result.success === true, JSON.stringify(s.result && s.result.success));
      ok(tag, "response is Kata's pattern", pat.indexOf(sentOf(s)) !== -1, JSON.stringify(sentOf(s)) + ' vs ' + JSON.stringify(pat[0]));
      ok(tag, 'no home-made separator / id / invisible mark', !BAD.test(sentOf(s)), JSON.stringify(sentOf(s)));
    }
  };
  if (w.right) checkRight(w.right, key + ' right');
  if (w.reverse) checkRight(w.reverse, key + ' right, reverse click order');
  (w.also || []).forEach((code, i) => checkRight(code, key + ' right, other spelling ' + (i + 1)));
  if (w.choice) {
    const pool = q.answers;
    let rights = 0; const seen = {};
    for (let i = 0; i < pool.length; i++) {
      const tag = key + ' option ' + i;
      const hits = (run(part, sid, w.choice.select(i) + ' ' + w.choice.submit, tag)[qk]) || [];
      ok(tag, 'exactly one answered', hits.length === 1, String(hits.length));
      for (const s of hits) {
        const sent = sentOf(s);
        ok(tag, 'response is its metadata answer, verbatim', sent === pool[i], JSON.stringify(sent) + ' vs ' + JSON.stringify(pool[i]));
        ok(tag, "success exactly when the response is Kata's pattern", (pat.indexOf(sent) !== -1) === (s.result && s.result.success === true),
          JSON.stringify(sent) + ' success ' + (s.result && s.result.success));
        ok(tag, 'each option its own response', !seen[sent], JSON.stringify(sent));
        seen[sent] = true;
        if (s.result && s.result.success === true) rights++;
      }
    }
    ok(key, 'exactly one option is right', rights === 1, String(rights));
  }
}

/* the retired string builders must not come back */
const layer = fs.readFileSync(path.join(BASE, 'unit-js', '20-xapi.js'), 'utf8');
ok('layer', 'no xapiZoneAnswer / xapiFieldsAnswer / xapiMultiAnswer', !/function\s+xapi(?:Zone|Fields|Multi)Answer\b/.test(layer));
ok('70-screens', 'no retired builder called', !/xapi(?:Zone|Fields|Multi)Answer\(/.test(fs.readFileSync(path.join(BASE, 'unit-js', '70-screens.js'), 'utf8')));

console.log('');
console.log('passed: ' + passes);
if (failures.length) {
  console.log('FAILED: ' + failures.length);
  console.log('');
  for (const f of failures) console.log('  ' + f);
  process.exit(1);
}
console.log('all clear');
