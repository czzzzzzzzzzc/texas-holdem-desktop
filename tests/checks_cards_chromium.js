// ---- card model regression (real Chromium, real index.html) ----
// run: node tests/checks_cards_chromium.js
// Guards the v14 remodel (GG-style single corner index + one big centre
// suit, SVG suits, letter-badge courts): number/ace cards carry exactly
// ONE corner index, court cards (J/Q/K) carry NONE (badge only, v14.1),
// the centre suit sits at 66% height and must never overlap the corner
// stack, the "10" index
// fits 62% of card width, the three size tiers measure as specced
// (hero/board enlarged x1.15-1.20 over the pre-remodel sizes, bot backs
// unchanged, revealed bot cards take the board tier), replay sizes are
// untouched, and no legacy pip/field markup survives anywhere.
let puppeteer;
try { puppeteer = require('puppeteer-core'); }
catch (e) { puppeteer = require('/tmp/chrometest/node_modules/puppeteer-core'); }
const fs = require('fs');
const http = require('http');
const path = require('path');

function chromePath(){
  const home = require('os').homedir();
  const cache = path.join(home, '.cache', 'puppeteer', 'chrome');
  if (fs.existsSync(cache)){
    for (const v of fs.readdirSync(cache)){
      const p = path.join(cache, v, 'chrome-linux64', 'chrome');
      if (fs.existsSync(p)) return p;
    }
  }
  for (const p of ['/opt/meta-chromium/chrome', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium']){
    if (fs.existsSync(p)) return p;
  }
  throw new Error('no chrome executable found');
}
function assert(cond, msg){ if (!cond){ console.error('CARD FAIL:', msg); process.exit(1); } }
const near = (got, exp, tol, msg) => assert(Math.abs(got - exp) <= tol, msg + ': got ' + got + ', expected ' + exp + ' ±' + tol);

const HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

(async () => {
  const server = http.createServer((req, res) => {
    // v15: card faces load image assets — serve the repo folder like Pages does
    if (req.url.startsWith('/assets/')){
      const fp = path.join(__dirname, '..', decodeURIComponent(req.url.split('?')[0]));
      if (fs.existsSync(fp)){ res.writeHead(200, { 'Content-Type': 'image/webp' }); res.end(fs.readFileSync(fp)); return; }
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(HTML);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await puppeteer.launch({ executablePath: chromePath(), args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];

  async function newPageAt(w, h){
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
    page.on('pageerror', e => errs.push(w + 'x' + h + ': ' + String(e)));
    await page.goto('http://127.0.0.1:' + port + '/index.html', { waitUntil: 'networkidle0' });
    return page;
  }
  const sizeOf = (page, sel, idx = 0) => page.evaluate((sel, idx) => {
    const el = document.querySelectorAll(sel)[idx];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 };
  }, sel, idx);

  // ================= 440x956: gallery + table + showdown + replay =================
  const page = await newPageAt(440, 956);

  // ---- gallery: 13 ranks of hearts + one back, at a fixed 64x90 tier ----
  await page.evaluate(() => {
    const g = document.createElement('div');
    g.id = 'gallery';
    g.style.cssText = 'position:fixed;inset:0;z-index:999;background:#12352b;padding:10px;display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start;overflow:auto';
    let html = '';
    for (let r = 0; r < 13; r++) html += cardHTML(13 + r);       // 2♥ .. A♥
    html += cardHTML(0, true);                                    // a back
    g.innerHTML = html;
    g.querySelectorAll('.card').forEach(c => { c.style.width = '64px'; c.style.height = '90px'; c.style.fontSize = '29px'; });
    document.body.append(g);
  });
  await new Promise(r => setTimeout(r, 120));
  const gallery = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('#gallery .card').forEach((card, i) => {
      const cr = card.getBoundingClientRect();
      const item = { i, back: card.classList.contains('back'), cnr: card.querySelectorAll('.cnr').length,
        legacy: card.querySelectorAll('.pip,.fld,.cnr.dn,.ace-old').length, centre: null, tenW: null, court: false, ace: false };
      const big = card.querySelector('.big');
      const court = card.querySelector('.court');
      item.court = !!court; item.ace = !!card.querySelector('.big.ace');
      const target = big || court;
      if (target){
        let r;
        if (big){ r = big.getBoundingClientRect(); }
        else {
          // v15 court: the portrait art is the centre element (pill index aside)
          r = court.querySelector('.art').getBoundingClientRect();
        }
        item.centre = { x: (r.left + r.width / 2 - cr.left) / cr.width * 100, y: (r.top + r.height / 2 - cr.top) / cr.height * 100 };
        item.courtCentreY = court ? 50 : 66;
        item.courtCentreX = court ? 60.3 : 50;
        item.centreTop = (r.top - cr.top) / cr.height * 100;
        const cnrEl = card.querySelector('.cnr');
        item.cnrBottom = cnrEl ? (cnrEl.getBoundingClientRect().bottom - cr.top) / cr.height * 100 : 0;
      }
      if (i === 8){ // 10♥
        const b = card.querySelector('.cnr b').getBoundingClientRect();
        item.tenW = b.width / cr.width * 100;
        item.tenText = card.querySelector('.cnr b').textContent;
      }
      out.push(item);
    });
    return out;
  });
  assert(gallery.length === 14, 'gallery should hold 14 cards, got ' + gallery.length);
  for (const it of gallery){
    if (it.back){ assert(it.cnr === 0, 'back card must have no corner index'); continue; }
    assert(it.cnr === 1, 'gallery card #' + it.i + ': exactly 1 corner index required, got ' + it.cnr);
    if (!it.court) assert(it.centreTop >= it.cnrBottom - 1, 'gallery card #' + it.i + ': centre suit overlaps corner stack (top ' + it.centreTop.toFixed(1) + '% < corner bottom ' + it.cnrBottom.toFixed(1) + '%)');
    assert(it.legacy === 0, 'gallery card #' + it.i + ': legacy pip/fld markup present');
    assert(it.centre, 'gallery card #' + it.i + ': centre element missing');
    assert(Math.abs(it.centre.x - it.courtCentreX) < 4, 'gallery card #' + it.i + ': centre x off by ' + (it.centre.x - it.courtCentreX).toFixed(1) + '%');
    assert(Math.abs(it.centre.y - it.courtCentreY) < 3, 'gallery card #' + it.i + ': centre y off by ' + (it.centre.y - it.courtCentreY).toFixed(1) + '%');
    if (it.i >= 9 && it.i <= 11) assert(it.court, 'gallery card #' + it.i + ' (J/Q/K) must use the court badge');
    if (it.i === 12) assert(it.ace, 'gallery card #12 (A) must use the ace centre');
    if (it.i === 8){
      assert(it.tenText === '10', 'card #8 should be the 10, got ' + it.tenText);
      assert(it.tenW <= 62, '"10" corner index too wide: ' + it.tenW.toFixed(1) + '% of card width (spec ≤62%)');
    }
  }
  console.log('gallery: 13 ranks OK (1 index each, centres <3%, "10" index ' + gallery[8].tenW.toFixed(1) + '% wide)');
  await page.screenshot({ path: '/tmp/cards-gallery.png' });
  await page.evaluate(() => document.getElementById('gallery').remove());

  // ---- real table scene: hero J♥ + 10♠, board K♦ A♣ 5♥, bot backs Q♠ 3♣ ----
  await page.evaluate(() => {
    players[0].hole = [22, 8];            // J♥, 10♠
    players[1].hole = [10, 40];           // Q♠, 3♣ (backs for now)
    board = [37, 51, 16];                 // K♦, A♣, 5♥
    draw();
  });
  await new Promise(r => setTimeout(r, 120));
  let s = await sizeOf(page, '#seats .seat:first-child .card');
  near(s.w, 41, 2, '440 hero width'); near(s.h, 57, 2, '440 hero height');
  s = await sizeOf(page, '#board .card');
  near(s.w, 40, 2, '440 board width'); near(s.h, 56, 2, '440 board height');
  s = await page.evaluate(() => {
    const seat = document.querySelectorAll('#seats .seat')[1];
    const c = seat.querySelector('.card');
    const r = c.getBoundingClientRect();
    return { w: r.width, h: r.height, back: c.classList.contains('back'), rev: seat.querySelector('.cards').classList.contains('rev') };
  });
  near(s.w, 22, 1.5, '440 bot back width (must be unchanged)'); near(s.h, 30, 1.5, '440 bot back height (must be unchanged)');
  assert(s.back && !s.rev, 'bot cards should be plain backs before reveal');
  console.log('table 440x956: hero 41x57, board 40x56, bot back 22x30 OK');
  await page.screenshot({ path: '/tmp/cards-table-440.png' });

  // ---- showdown: bot cards flip to the board tier via .rev ----
  // seat 3 is marked folded: its cards must stay backs (mucked) at reveal.
  await page.evaluate(() => { players[3].folded = true; players[3].hole = [4, 17]; reveal = true; draw(); });
  await new Promise(r => setTimeout(r, 120));
  s = await page.evaluate(() => {
    const seat = document.querySelectorAll('#seats .seat')[1];
    const c = seat.querySelector('.card');
    const r = c.getBoundingClientRect();
    const heroSeat = document.querySelectorAll('#seats .seat')[0];
    const foldedSeat = document.querySelectorAll('#seats .seat')[3];
    const fc = foldedSeat.querySelector('.card');
    // overlap check on every revealed face card at this phone tier
    let overlap = null;
    document.querySelectorAll('#seats .cards.rev .card').forEach(card => {
      const cnrEl = card.querySelector('.cnr'); if (!cnrEl) return;
      const big = card.querySelector('.big'); if (!big) return;
      const cr = card.getBoundingClientRect();
      if (big.getBoundingClientRect().top < cnrEl.getBoundingClientRect().bottom - 0.5) overlap = card.textContent;
    });
    return { w: r.width, h: r.height, back: c.classList.contains('back'),
      rev: seat.querySelector('.cards').classList.contains('rev'),
      heroRev: heroSeat.querySelector('.cards').classList.contains('rev'),
      cnr: c.querySelectorAll('.cnr').length, court: !!c.querySelector('.court'),
      foldedBack: fc.classList.contains('back'),
      foldedRev: foldedSeat.querySelector('.cards').classList.contains('rev'),
      overlap };
  });
  near(s.w, 40, 2, '440 revealed bot width = board tier'); near(s.h, 56, 2, '440 revealed bot height = board tier');
  assert(!s.back && s.rev && !s.heroRev && s.cnr === 1, 'revealed bot card state wrong: ' + JSON.stringify(s));
  assert(s.foldedBack && !s.foldedRev, 'folded bot must stay mucked at showdown: ' + JSON.stringify(s));
  assert(!s.overlap, 'revealed card centre suit overlaps corner stack: ' + s.overlap);
  await page.evaluate(() => { players[3].folded = false; });
  console.log('showdown: revealed bot cards at board tier (40x56) via .rev OK');
  await page.screenshot({ path: '/tmp/cards-showdown-440.png' });
  await page.evaluate(() => { reveal = false; draw(); });

  // ---- replay: new design, sizes exactly as before ----
  await page.evaluate(() => {
    const rec = { no: 99, button: 0, sb: 1, bb: 2,
      players: Array.from({ length: 9 }, (_, i) => ({ seat: i, id: i === 0 ? -1 : i, name: i === 0 ? '你' : '代号0' + i, hole: i === 0 ? [22, 8] : [37, 51], start: 100 })),
      actions: [], board: [37, 51, 16, 44, 3], result: '测试结算', winners: [0], nets: [10, -1, -1, -1, -1, -1, -1, -1, -2] };
    replays.push(rec);
    document.getElementById('openReplay').click();
  });
  await new Promise(r => setTimeout(r, 150));
  await page.evaluate(() => { document.getElementById('rpnextStep').click(); });
  await new Promise(r => setTimeout(r, 120));
  const rp = await page.evaluate(() => {
    const g = sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }; };
    const seats = document.querySelectorAll('#rpseats .seat');
    const botCard = seats[1].querySelector('.card');
    const br = botCard.getBoundingClientRect();
    const heroCard = document.querySelector('#rpseats .seat:first-child .card');
    const heroCard2 = document.querySelectorAll('#rpseats .seat:first-child .card')[1];
    return { hero: g('#rpseats .seat:first-child .card'), board: g('#rpboard .card'),
      bot: { w: Math.round(br.width * 10) / 10, h: Math.round(br.height * 10) / 10 },
      heroCnr: heroCard.querySelectorAll('.cnr').length, heroCentre: !!heroCard.querySelector('.big,.court'),
      heroCourt: !!heroCard.querySelector('.court'), hero2Cnr: heroCard2.querySelectorAll('.cnr').length,
      legacy: document.querySelectorAll('#replayView .pip,#replayView .fld').length };
  });
  near(rp.hero.w, 34, 1.5, 'replay hero width (unchanged)'); near(rp.hero.h, 46, 1.5, 'replay hero height (unchanged)');
  near(rp.bot.w, 22, 1.5, 'replay bot width (unchanged)'); near(rp.bot.h, 30, 1.5, 'replay bot height (unchanged)');
  near(rp.board.w, 34, 1.5, 'replay board width (unchanged)'); near(rp.board.h, 48, 1.5, 'replay board height (unchanged)');
  // hero hole is J♥ + 10♠: both cards carry exactly one corner index
  // (the court's sits on a pill over its portrait, v15).
  assert(rp.heroCnr === 1 && rp.heroCourt && rp.hero2Cnr === 1 && rp.heroCentre && rp.legacy === 0, 'replay design check failed: ' + JSON.stringify(rp));
  console.log('replay: new design at unchanged sizes (34x46 / 22x30 / 34x48) OK');
  await page.screenshot({ path: '/tmp/cards-replay-440.png' });
  const ov0 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(ov0 <= 0, '440 horizontal overflow: ' + ov0 + 'px');
  await page.close();

  // ================= 390x844 & 360x740: compact tier =================
  for (const [w, h] of [[390, 844], [360, 740]]){
    const p2 = await newPageAt(w, h);
    await p2.evaluate(() => { players[0].hole = [22, 8]; players[1].hole = [10, 40]; board = [37, 51, 16]; draw(); });
    await new Promise(r => setTimeout(r, 120));
    let z = await sizeOf(p2, '#seats .seat:first-child .card');
    near(z.w, 37, 2, w + ' hero width'); near(z.h, 52, 2, w + ' hero height');
    z = await sizeOf(p2, '#board .card');
    near(z.w, 40, 2, w + ' board width'); near(z.h, 56, 2, w + ' board height');
    z = await p2.evaluate(() => {
      const c = document.querySelectorAll('#seats .seat')[1].querySelector('.card');
      const r = c.getBoundingClientRect();
      return { w: r.width, h: r.height, overflow: document.documentElement.scrollWidth - window.innerWidth };
    });
    near(z.w, 20, 1.5, w + ' bot back width (unchanged)'); near(z.h, 27, 1.5, w + ' bot back height (unchanged)');
    assert(z.overflow <= 0, w + ' horizontal overflow: ' + z.overflow + 'px');
    console.log(w + 'x' + h + ': hero 37x52, board 40x56, bot back 20x27, no overflow OK');
    await p2.screenshot({ path: '/tmp/cards-table-' + w + '.png' });
    await p2.close();
  }

  assert(errs.length === 0, 'pageerrors: ' + errs.join(' | '));
  console.log('CARD MODEL CHECKS ALL OK');
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
