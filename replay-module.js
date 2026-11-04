const ReplayView = (() => {

const EMOJIS = ["🦅","🐕","🐷","🗿","🐟","🎭","🕷️","⚖️","🦊","🤖","🐣","👨","🌋","❄️"];
const POS = [[50,68],[13,68],[10,48],[14,26],[35,12],[65,12],[86,26],[90,48],[87,68]];
const SN = ["翻牌前","翻牌","转牌","河牌"];
const RANKS = "23456789TJQKA", SUITS = ["♠","♥","♦","♣"];
function $(id){ return document.getElementById("rp" + id);}
function fmtBB(n){ const v = n/2; return (Number.isInteger(v)? v: v.toFixed(1)) + "BB";}
function signedBB(n){ return (n >= 0? "+": "") + fmtBB(n);}
function cardText(c){ return RANKS[c % 13] + SUITS[Math.floor(c / 13)];}
function cardHTML(c, back){
if (back) return '<span class="card back">◆</span>';
const red = Math.floor(c / 13) === 1 || Math.floor(c / 13) === 2;
return '<span class="card' + (red? " red": "") + '">' + cardText(c) + '</span>';
}
let DATA = null, handIdx = 0, step = 0, playTimer = null;
function rec(){ return DATA.replays[handIdx];}
function maxStep(r){ return r.actions.length + 1;}
function streetOfBoard(len){ return len >= 5? 3: len === 4? 2: len === 3? 1: 0;}
function stateAt(r, target){
const ps = r.players.map(p => ({ total: 0, bet: 0, folded: false, stack: p.start}));
ps[r.sb].total = 1; ps[r.sb].bet = 1; ps[r.bb].total = 2; ps[r.bb].bet = 2;
let street = 0, last = null;
for (let s = 1; s <= target; s++){
if (s === r.actions.length + 1){
ps.forEach((q, i) => { q.stack = r.players[i].start + r.nets[i]; q.bet = 0;});
street = streetOfBoard(r.board.length);
last = { final: true};
break;
}
const a = r.actions[s - 1];
if (a.street > street){ ps.forEach(q => { q.bet = 0;}); street = a.street;}
const q = ps[a.seat];
q.total = a.total; q.bet = a.bet; if (a.folded) q.folded = true;
q.stack = r.players[a.seat].start - a.total;
last = a;
}
return { ps, street, last};
}
function describeAction(r, a, prevTotals){
const name = r.players[a.seat].name;
const paid = a.total - (prevTotals[a.seat] || 0);
let verb = "";
if (a.type === "fold") verb = "弃牌";
else if (a.type === "check") verb = "让牌";
else if (a.type === "call") verb = "跟注 " + fmtBB(paid);
else if (a.type === "raise") verb = (paid > 0 && a.bet > 0? "加注到 ": "下注 ") + fmtBB(a.bet);
return SN[a.street] + " · " + name + " " + verb + (a.allin? "（全下）": "");
}
function render(){
const r = rec();
const st = stateAt(r, step);
const fin = step === maxStep(r);
$("seats").innerHTML = r.players.map((p, i) => {
const q = st.ps[i];
const reveal = fin &&!q.folded;
const cards = p.hole.length? p.hole.map(c => cardHTML(c,!(i === 0 || reveal))).join(""): "";
const actorCls = st.last &&!st.last.final && st.last.seat === i? " actor": "";
const winCls = fin && r.winners.includes(i)? " winner": "";
return '<div class="seat' + actorCls + winCls + (q.folded? " folded": "") + '" style="left:' + POS[i][0] + '%;top:' + POS[i][1] + '%">' +
'<div class="avatar">' + (p.id >= 0? EMOJIS[p.id]: "😎") + (r.button === i? '<span class="dealer">D</span>': "") + '</div>' +
(p.id >= 0? '<div class="code">' + p.name + '</div>': "") +
'<div class="cards">' + cards + '</div>' +
'<div class="pill">' + fmtBB(q.stack) + '</div></div>';
}).join("");
const betPos = POS.map(([x, y]) => [x + (50 - x) *.34, y + (44 - y) *.34]);
$("bets").innerHTML = r.players.map((p, i) => st.ps[i].bet > 0? '<div class="bet-chip" style="left:' + betPos[i][0] + '%;top:' + betPos[i][1] + '%">' + fmtBB(st.ps[i].bet) + '</div>': "").join("");
const shown = st.street === 0? 0: [0, 3, 4, 5][st.street];
$("board").innerHTML = r.board.slice(0, shown).map(c => cardHTML(c)).join("");
$("pot").textContent = "底池 " + fmtBB(st.ps.reduce((n, q) => n + q.total, 0));
$("street").textContent = "第 " + r.no + " 手 · " + SN[st.street] + (fin? " · 已结算": "");
$("status").textContent = "你的手牌 " + r.players[0].hole.map(cardText).join(" ") + " · 本手净额 " + signedBB(r.nets[0]);
let cap = "";
if (step === 0) cap = "发牌完毕，盲注已下：小盲 0.5BB / 大盲 1BB。点「下一步」或「播放」开始回放。";
else if (fin) cap = "结算：" + r.result;
else {
const prevTotals = {};
stateAt(r, step - 1).ps.forEach((q, i) => { prevTotals[i] = q.total;});
cap = describeAction(r, st.last, prevTotals);
}
$("caption").textContent = cap;
$("progress").textContent = "第 " + step + " / " + maxStep(r) + " 步";
$("prevStep").disabled = step <= 0; $("nextStep").disabled = step >= maxStep(r);
const notes = r.notes || {};
let nh = "";
if (notes.hand) nh += notes.hand;
const snote = notes.steps && step >= 1 && step <= r.actions.length? notes.steps[String(step - 1)]: null;
if (snote) nh += (nh? "\n": "") + "" + snote;
$("note").textContent = nh || "（这一手暂无注释）";
$("handSel").value = String(handIdx);
}
function stopPlay(){ if (playTimer){ clearInterval(playTimer); playTimer = null; $("playBtn").textContent = "▶ 播放";}}
function setStep(s){ const r = rec(); step = Math.max(0, Math.min(maxStep(r), s)); render();}
function setHand(i){ stopPlay(); handIdx = Math.max(0, Math.min(DATA.replays.length - 1, i)); step = 0; render();}
function buildHands(){
$("handSel").innerHTML = DATA.replays.map((r, i) => '<option value="' + i + '">第 ' + r.no + ' 手 · ' + r.players[0].hole.map(cardText).join(" ") + ' · ' + signedBB(r.nets[0]) + '</option>').join("");
const s = DATA.stats;
if (s) $("sessionInfo").textContent = "共 " + DATA.replays.length + " 手可回放 · VPIP " + (s.hands? (100 * s.vpip / s.hands).toFixed(1): "0") + "% · 买入 " + s.buyins + " 次";
}
function loadData(d){
if (!d ||!Array.isArray(d.replays) ||!d.replays.length){ $("loadMsg").textContent = "没读到有效的回放数据。"; return;}
DATA = d; $("loader").style.display = "none"; $("app").style.display = "";
buildHands(); setHand(0);
}
$("prevStep").onclick = () => { stopPlay(); setStep(step - 1);};
$("nextStep").onclick = () => { stopPlay(); setStep(step + 1);};
$("prevHand").onclick = () => setHand(handIdx - 1);
$("nextHand").onclick = () => setHand(handIdx + 1);
$("handSel").onchange = e => setHand(Number(e.target.value));
$("playBtn").onclick = () => {
if (playTimer){ stopPlay(); return;}
if (step >= maxStep(rec())) step = 0;
$("playBtn").textContent = "⏸ 暂停";
playTimer = setInterval(() => { if (step >= maxStep(rec())){ stopPlay(); return;} step++; render();}, 1000);
};
$("fileInput").onchange = e => {
const f = e.target.files && e.target.files[0]; if (!f) return;
const rd = new FileReader();
rd.onload = () => { try { loadData(JSON.parse(rd.result));} catch { $("loadMsg").textContent = "这个文件不是有效的复盘数据。";}};
rd.readAsText(f);
};
$("loadPaste").onclick = () => { try { loadData(JSON.parse($("pasteBox").value));} catch { $("loadMsg").textContent = "粘贴的内容不是有效的 JSON 数据。";}};
document.onkeydown = e => {
if (!DATA) return;
if (e.key === "ArrowRight"){ stopPlay(); setStep(step + 1);}
if (e.key === "ArrowLeft"){ stopPlay(); setStep(step - 1);}
};

function loadGameData(){
const d = window.__getReplayData ? window.__getReplayData() : null;
if (d && Array.isArray(d.replays) && d.replays.length) loadData(d);
else { $("loader").style.display = ""; $("app").style.display = "none"; $("loadMsg").textContent = "本桌还没有可回放的牌局，先打几手再来；也可以在下面载入导出文件。"; }
}
$("useGame").onclick = () => loadGameData();
return { loadGameData, stop: stopPlay };
})();
