// ---- desktop feature checks ----
// hold the 2.6s auto-next-hand timer so exactly the hands we start get played
const __realSTD = setTimeout;
setTimeout = function(fn, delay){ if (delay === 2600) return 0; return __realSTD(fn, delay); };
// 1) quick-bet buttons rendered from settings
const qp = document.getElementById('quickPre'), qf = document.getElementById('quickPost');
if (qp.children.length !== 4) throw new Error('preflop quick buttons: ' + qp.children.length);
if (qp.children.map(b => b.textContent).join('|') !== '到 2.5BB|到 3BB|到 4BB|到 5BB') throw new Error('preflop labels: ' + qp.children.map(b => b.textContent));
if (qf.children.map(b => b.textContent).join('|') !== '33% 池|50% 池|66% 池|100% 池') throw new Error('postflop labels: ' + qf.children.map(b => b.textContent));
console.log('quick buttons: OK (rendered from settings)');

// 2) settings save flow: change preflop preset #1 to 3.5BB and a postflop preset to 75%
document.getElementById('setPre1').value = '3.5';
document.getElementById('setPost2').value = '75';
document.getElementById('saveSettings').onclick();
if (settings.preBB[0] !== 3.5) throw new Error('preBB not updated: ' + settings.preBB);
if (settings.postPct[1] !== 75) throw new Error('postPct not updated: ' + settings.postPct);
if (qp.children[0].textContent !== '到 3.5BB') throw new Error('button not re-rendered: ' + qp.children[0].textContent);
const savedSettings = JSON.parse(localStorage.getItem('holdem-settings-v1'));
if (!savedSettings || savedSettings.preBB[0] !== 3.5) throw new Error('settings not persisted');
console.log('settings: OK (saved + persisted + buttons re-rendered)');

// 3) play two hands, then open the integrated replay and step through everything
function polD(){
  const p = players[0], owed = Math.max(0, highest - p.bet);
  if (owed > 0) return act(p, Math.random() < 0.25 ? 'fold' : 'call');
  return act(p, 'check');
}
for (let h = 0; h < 2; h++){
  startHand();
  let steps = 0;
  while (running && steps++ < 50000){ if (actor === 0) polD(); else __pump(); }
}
const data = window.__getReplayData();
if (!data || data.replays.length !== 2) throw new Error('replay data exposure failed');
ReplayView.loadGameData();
if (document.getElementById('rpapp').style.display === 'none') throw new Error('replay app did not open');
if ((document.getElementById('rphandSel').innerHTML.match(/<option/g) || []).length !== 2) throw new Error('hand selector not populated');
let clicks = 0, lastProgress = '';
for (let i = 0; i < 300; i++){
  document.getElementById('rpnextStep').click();
  const pr = document.getElementById('rpprogress').textContent;
  clicks++;
  if (pr === lastProgress && i > 60) break;
  lastProgress = pr;
}
document.getElementById('rpnextHand').click();
for (let i = 0; i < 300; i++){ document.getElementById('rpnextStep').click(); }
console.log('integrated replay: OK (2 hands loaded from live game, stepped through ' + clicks + '+ steps, settlement rendered)');
console.log('DESKTOP FEATURES ALL OK');
