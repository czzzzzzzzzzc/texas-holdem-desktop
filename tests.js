
// ================= TESTS (appended for headless verification only) =================
function assert(cond, msg){ if(!cond){ console.error("FAIL:", msg); process.exit(1); } }
// ---- independent 5-card reference evaluator ----
function ref5(cs){
  const r = cs.map(c=>c%13+2).sort((a,b)=>b-a), s = cs.map(c=>Math.floor(c/13));
  const flush = s.every(x=>x===s[0]);
  const uniq = [...new Set(r)];
  let straightTop = 0;
  if(uniq.length===5){ if(uniq[0]-uniq[4]===4) straightTop=uniq[0]; else if(uniq.join()==='14,5,4,3,2') straightTop=5; }
  const cnt = {}; r.forEach(x=>cnt[x]=(cnt[x]||0)+1);
  const groups = Object.entries(cnt).map(([rank,c])=>({rank:+rank,c})).sort((a,b)=> b.c-a.c || b.rank-a.rank);
  let cat, tb;
  if(flush && straightTop){ cat=8; tb=[straightTop]; }
  else if(groups[0].c===4){ cat=7; tb=[groups[0].rank, groups[1].rank]; }
  else if(groups[0].c===3 && groups[1] && groups[1].c===2){ cat=6; tb=[groups[0].rank, groups[1].rank]; }
  else if(flush){ cat=5; tb=r; }
  else if(straightTop){ cat=4; tb=[straightTop]; }
  else if(groups[0].c===3){ cat=3; tb=[groups[0].rank, ...groups.slice(1).map(g=>g.rank).sort((a,b)=>b-a)]; }
  else if(groups[0].c===2 && groups[1] && groups[1].c===2){ const ps=groups.filter(g=>g.c===2).map(g=>g.rank).sort((a,b)=>b-a); cat=2; tb=[...ps, groups.find(g=>g.c===1).rank]; }
  else if(groups[0].c===2){ cat=1; tb=[groups[0].rank, ...groups.slice(1).map(g=>g.rank).sort((a,b)=>b-a)]; }
  else { cat=0; tb=r; }
  return [cat, ...tb, 0,0,0,0].slice(0,6);
}
function cmpArr(x, y){ for(let i=0;i<Math.max(x.length,y.length);i++){ const d=(x[i]||0)-(y[i]||0); if(d) return Math.sign(d); } return 0; }
function refCmp7(a, b){
  const best = cs => { let m=null; for(let i=0;i<7;i++)for(let j=i+1;j<7;j++){ const five=cs.filter((_,k)=>k!==i&&k!==j); const v=ref5(five); if(!m||cmpArr(v,m)>0) m=v; } return m; };
  return cmpArr(best(a), best(b));
}
function C(txt){ const ranks="23456789TJQKA", suits={"s":0,"h":1,"d":2,"c":3}; return ranks.indexOf(txt[0]) + suits[txt[1]]*13; }
// fixed cases
assert(rank([C('As'),C('2d'),C('3c'),C('4h'),C('5s'),C('Kd'),C('Qc')]) < rank([C('2s'),C('3d'),C('4c'),C('5h'),C('6s'),C('Kd'),C('Qc')]), 'wheel < 6-high straight');
assert(rank([C('As'),C('Ks'),C('Qs'),C('Js'),C('Ts'),C('2d'),C('3c')]) > rank([C('9s'),C('9h'),C('9d'),C('9c'),C('As'),C('Kd'),C('Qc')]), 'straight flush > quads');
assert(rank([C('Ks'),C('Kh'),C('Kd'),C('Qs'),C('Qh'),C('Qd'),C('2c')]) > rank([C('Qs'),C('Qh'),C('Qd'),C('Ks'),C('Kh'),C('2d'),C('3c')]), 'two trips: higher trips is the full house');
assert(rank([C('As'),C('Ah'),C('Kd'),C('Qc'),C('9s'),C('5d'),C('3c')]) > rank([C('As'),C('Ah'),C('Kd'),C('Qc'),C('8s'),C('5d'),C('3c')]), 'pair kicker decides');
assert(rank([C('As'),C('Ks'),C('Qs'),C('Js'),C('9s'),C('2d'),C('3c')]) > rank([C('As'),C('Ks'),C('Qs'),C('Js'),C('8s'),C('2d'),C('3c')]), 'flush tiebreak');
// random cross-check vs reference
for(let t=0;t<600;t++){
  const d = shuffle(Array.from({length:52},(_,i)=>i));
  const h1 = d.slice(0,7), h2 = d.slice(7,14);
  const mine = Math.sign(rank(h1)-rank(h2)), ref = refCmp7(h1,h2);
  assert(mine===ref, 'rank mismatch: '+h1+' vs '+h2+' mine '+mine+' ref '+ref);
}
console.log('evaluator: OK (fixed cases + 600 random cross-checks)');
// ---- side-pot layers ----
players.forEach((p,i)=>{ p.inHand=true; p.folded=false; p.total=[20,50,50,0,0,0,0,0,0][i]; });
let L = layers();
assert(L.length===2 && L[0].amount===60 && L[0].eligible.length===3 && L[1].amount===60 && L[1].eligible.length===2, 'layers basic 20/50/50');
players[0].folded = true;
L = layers();
assert(L[0].amount===60 && L[0].eligible.length===2 && L[1].amount===60, 'layers with folded contributor');
players.forEach((p,i)=>{ p.total=[20,20,80,0,0,0,0,0,0][i]; p.folded=false; });
L = layers();
assert(L.length===2 && L[0].amount===60 && L[1].amount===60 && L[1].contributors.length===1, 'layers unmatched top');
console.log('side pots: OK');
// test-only: suppress the 2.6s auto-start timer so the driver controls hand boundaries
const __realSetTimeout = setTimeout;
setTimeout = function(fn, delay){ if(delay === 2600) return 0; return __realSetTimeout(fn, delay); };
// ---- full simulation: 300 hands, chip conservation + termination ----
players.forEach(p=>{ p.total=0; p.bet=0; p.folded=false; p.inHand=false; p.allin=false; });
let extMoney = players.reduce((n,p)=>n+p.stack,0);
let replacements = 0, rebuys = 0, handsDone = 0, showdowns = 0;
function humanPolicy(){
  const p = players[0], owed = Math.max(0, highest - p.bet), r = Math.random();
  if(owed > 0){
    if(r < 0.10 && owed > 10) return act(p, 'fold');
    if(r < 0.25 && mayRaise(p)) return act(p, 'raise', minTo(p));
    return act(p, 'call');
  }
  if(r < 0.15 && mayRaise(p)) return act(p, 'raise', minTo(p));
  return act(p, 'check');
}
for(let h=0; h<300; h++){
  if(players[0].stack <= 0){ players[0].stack = 100; stats.buyins++; stats.bought += 100; extMoney += 100; rebuys++; }
  const sumBefore = players.reduce((n,p)=>n+p.stack+p.total,0);
  startHand();
  if(!running) break;
  const sumAfter = players.reduce((n,p)=>n+p.stack+p.total,0);
  extMoney += (sumAfter - sumBefore);
  replacements += Math.round((sumAfter - sumBefore) / 100);
  let steps = 0;
  while(running && steps++ < 50000){
    if(actor === 0) humanPolicy();
    else __pump();
    if(steps % 997 === 0){ assert(players.every(p=>p.stack>=0 && Number.isFinite(p.stack)), 'negative/NaN stack'); }
  }
  assert(!running, 'hand ' + h + ' did not finish');
  assert(players.every(p=>p.stack>=0 && Number.isFinite(p.stack)), 'bad stack at hand end');
  const totalNow = players.reduce((n,p)=>n+p.stack,0);
  assert(totalNow === extMoney, 'chip conservation: have ' + totalNow + ' expect ' + extMoney + ' at hand ' + h);
  if(reveal) showdowns++;
  handsDone++;
}
console.log('simulation: OK —', handsDone, 'hands,', showdowns, 'showdowns, bot replacements:', replacements, ', human rebuys:', rebuys);
console.log('final stacks:', players.map(p=>p.name+':'+p.stack).join(' '));
console.log('human stats:', JSON.stringify(stats));
