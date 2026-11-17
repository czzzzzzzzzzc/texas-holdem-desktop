// ---- side hidden navigation checks (layout v12) ----
// run: NODE_PATH=/tmp/jsdomtest/node_modules node tests/checks_sidenav.js
// Loads the real index.html in jsdom and pins the navigation behaviour that
// used to be asserted against the bottom tab bar, re-expressed for the side
// rails: grip expands its rail -> item tap switches page -> rail auto-closes;
// all four pages reachable; replay takeover hides the rails and exiting
// returns to the source page. Nothing here replaces the stub suites.
let JSDOM;
try { JSDOM = require('jsdom').JSDOM; }
catch (e) { JSDOM = require('/tmp/jsdomtest/node_modules/jsdom').JSDOM; }
const fs = require('fs');
const http = require('http');
const path = require('path');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML);
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(cond, msg){ if (!cond) { console.error('SIDENAV FAIL:', msg); process.exit(1); } }

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const dom = await JSDOM.fromURL('http://127.0.0.1:' + port + '/index.html', {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(window) {
      const st = window.setTimeout.bind(window);
      window.setTimeout = (fn, delay, ...a) => st(fn, Math.min(delay || 0, 15), ...a);
    }
  });
  await new Promise(r => {
    if (dom.window.document.readyState === 'complete') r();
    else dom.window.addEventListener('load', r);
  });
  await sleep(150);
  const d = dom.window.document;
  const $ = id => d.getElementById(id);
  const vis = name => !$('tab-' + name).hidden;
  const onlyVis = name => ['table', 'feed', 'review', 'settings'].every(n => vis(n) === (n === name));

  // 1) structure: no bottom tab bar; two rails with grips; four page buttons
  assert(!$('tabbar'), '#tabbar must be gone');
  const navL = $('sidenavL'), navR = $('sidenavR');
  assert(navL && navR, 'both side rails exist');
  assert(navL.querySelector('.grip') && navR.querySelector('.grip'), 'each rail has a grip');
  const tabs = [...d.querySelectorAll('.sidenav button[data-tab]')].map(b => b.getAttribute('data-tab'));
  assert(tabs.join() === 'table,feed,table,review,settings', 'rail items: ' + tabs.join());
  assert([...navL.querySelectorAll('button[data-tab]')].map(b => b.getAttribute('data-tab')).join() === 'table,feed', 'left rail = table,feed');
  assert([...navR.querySelectorAll('button[data-tab]')].map(b => b.getAttribute('data-tab')).join() === 'table,review,settings', 'right rail = table,review,settings');
  console.log('structure: OK (no #tabbar; L=牌桌/动态, R=复盘/设置, grips present)');

  // 2) initial state: table page, rails closed, gold marker on the left grip
  assert(onlyVis('table'), 'initial page is table');
  assert(!navL.classList.contains('open') && !navR.classList.contains('open'), 'rails start closed');
  assert(navL.classList.contains('has-cur') && !navR.classList.contains('has-cur'), 'current-page marker starts on left rail');
  console.log('initial state: OK');

  // 3) grip toggles its rail; opening one side closes the other
  navL.querySelector('.grip').click();
  assert(navL.classList.contains('open') && !navR.classList.contains('open'), 'left grip opens left rail only');
  navR.querySelector('.grip').click();
  assert(navR.classList.contains('open') && !navL.classList.contains('open'), 'right grip opens right rail, closes left');
  navR.querySelector('.grip').click();
  assert(!navR.classList.contains('open'), 'grip toggles its rail shut');
  console.log('grip toggle: OK');

  // 4) item tap switches page and auto-closes the rail; marker follows the page
  navL.querySelector('.grip').click();
  navL.querySelector('button[data-tab="feed"]').click();
  assert(onlyVis('feed'), 'feed page after tap');
  assert(!navL.classList.contains('open'), 'rail auto-closed after pick');
  const feedBtn = navL.querySelector('button[data-tab="feed"]');
  assert(feedBtn.classList.contains('on') && feedBtn.getAttribute('aria-selected') === 'true', 'feed button marked current');
  assert(navL.classList.contains('has-cur') && !navR.classList.contains('has-cur'), 'marker stays left for feed');
  navR.querySelector('.grip').click();
  navR.querySelector('button[data-tab="settings"]').click();
  assert(onlyVis('settings'), 'settings page after tap');
  assert(navR.classList.contains('has-cur') && !navL.classList.contains('has-cur'), 'marker moved to right rail');
  console.log('pick + auto-close + marker: OK (all pages reachable, marker follows)');

  // 4b) from a right-rail page, the RIGHT rail itself offers the way home
  navR.querySelector('.grip').click();
  navR.querySelector('button[data-tab="table"]').click();
  assert(onlyVis('table'), 'right rail 牌桌 returns to the table page');
  assert(navL.classList.contains('has-cur') && !navR.classList.contains('has-cur'), 'marker back on left rail at table');
  console.log('right-rail home: OK');
  navR.querySelector('.grip').click();
  navR.querySelector('button[data-tab="settings"]').click();
  assert(onlyVis('settings'), 'back on settings for the outside-tap step');

  // 5) tapping outside any rail closes an open rail without switching pages
  navL.querySelector('.grip').click();
  assert(navL.classList.contains('open'), 'rail open before outside tap');
  d.querySelector('main').click();
  assert(!navL.classList.contains('open'), 'outside tap closed the rail');
  assert(onlyVis('settings'), 'outside tap did not switch pages');
  console.log('outside tap close: OK');

  // 6) replay takeover: rails hidden while replay is open, exit returns to source page
  navR.querySelector('.grip').click();
  navR.querySelector('button[data-tab="review"]').click();
  assert(onlyVis('review'), 'on review page before replay');
  $('openReplay').click();
  assert(d.body.classList.contains('replay-open'), 'replay-open set');
  const cs = dom.window.getComputedStyle(navL).display;
  const cssHasRule = HTML.includes('body.replay-open .sidenav{display:none!important}');
  assert(cs === 'none' || cssHasRule, 'rails hidden during replay (computed=' + cs + ', rule=' + cssHasRule + ')');
  $('closeReplay').click();
  assert(!d.body.classList.contains('replay-open'), 'replay-open cleared');
  assert(onlyVis('review'), 'exit replay returns to review page');
  assert(!navL.classList.contains('open') && !navR.classList.contains('open'), 'rails closed after replay exit');
  console.log('replay takeover: OK (rails hidden inside, source page restored)');

  console.log('SIDENAV CHECKS ALL OK');
  dom.window.close(); server.close(); process.exit(0);
})().catch(e => { console.error('SIDENAV ERROR:', e); process.exit(1); });
