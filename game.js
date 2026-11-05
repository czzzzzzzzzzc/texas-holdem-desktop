
"use strict";
const $=id=>document.getElementById(id), BB=2, KEY="holdem-nine-v1";
const roster=[
["阿紧","TAG 紧凶",.23,.76,.035,.30,.08,.65,.45],
["疯狗","Maniac 松凶",.80,.94,.32,.65,.02,1.25,1.2],
["跟注站","Calling station",.87,.07,.008,.98,.02,.40,.45],
["石头","Rock",.10,.42,.005,.06,.08,.55,.03],
["渔夫","Loose-passive fish",.70,.18,.025,.78,.04,.38,.6],
["诈唬哥","Bluffer",.46,.82,.31,.40,.05,.85,.8],
["陷阱哥","Trapper",.30,.55,.045,.48,.72,.85,.35],
["均衡哥","Balanced",.32,.59,.075,.43,.12,.65,.3],
["老狐狸","Tricky TAG",.25,.73,.12,.36,.30,.75,.25],
["数学家","Odds robot",.28,.48,.008,.32,.04,.60,.05],
["好奇宝宝","Curious beginner",.81,.15,.018,.65,.02,.35,.65],
["ABC大叔","Straightforward ABC",.26,.57,0,.25,.02,.65,.2],
["情绪哥","Tilter",.46,.66,.13,.53,.06,.85,2.8],
["冷面女王","Composed LAG",.43,.77,.13,.39,.12,.80,.02],
["冷锋","Pro TAG",.24,.72,.10,.34,0,.72,.02],
["猎手","Pro LAG",.34,.80,.14,.38,0,.78,.02]
].map((r,id)=>Object.freeze({id,name:r[0],style:r[1],vpip:r[2],aggression:r[3],bluff:r[4],call:r[5],trap:r[6],size:r[7],tiltGain:r[8]}));
const PROS=new Set([14,15]);
let saved;try{saved=JSON.parse(localStorage.getItem(KEY)||"null")}catch{}
let stats=saved?.stats||{hands:0,vpip:0,pfr:0,wins:0,buyins:1,bought:100};
let history=Array.isArray(saved?.history)?saved.history.slice(-200):[];
let humanStack=Number.isInteger(saved?.stack)&&saved.stack>=0?saved.stack:100;
let reads=Object.assign({faced:0,fold:0,call:0,bigN:0,bigC:0,rfF:0,rfN:0},saved?.reads||{});
let replays=Array.isArray(saved?.replays)?saved.replays:[];
let handRecord=null;
let players=[],board=[],deck=[],button=-1,sb=-1,bb=-1,street=0,highest=0,minRaise=2,actor=-1;
let pending=new Set(),acted=new Set(),running=false,reveal=false,instant=false,skipRest=false,timer=null,iteration=0,handNo=stats.hands;
let startStack=0,humanActions=[],handVpip=false,handPfr=false,handFaced=false,handCalled=false,handRaised=false,seated="",equityCache="",equityValue=null;
const streetNames=["翻牌前","翻牌","转牌","河牌"];
const categories=["高牌","一对","两对","三条","顺子","同花","葫芦","四条","同花顺"];
const EMOJIS=["🦅","🐕","🐷","🗿","🐟","🎭","🕷️","⚖️","🦊","🤖","🐣","👨","🌋","❄️","🎯","♠️"];
function fmtBB(n){let v=n/2;return (Number.isInteger(v)?v:v.toFixed(1))+"BB"}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function makePlayer(seat,base=null,stack=100){return {seat,base,name:base?"代号"+String(base.id+1).padStart(2,"0"):"你",stack,hole:[],bet:0,total:0,folded:false,inHand:false,allin:false,winner:false,last:"",live:{bluff:1,tilt:0,confidence:0},bluffs:[],won:0}}
players=[makePlayer(0,null,humanStack),...shuffle([...roster]).slice(0,8).map((b,i)=>makePlayer(i+1,b))];
function persist(){try{localStorage.setItem(KEY,JSON.stringify({stats,history,reads,stack:players[0].stack,replays}))}catch{}}
function cardText(c){return "23456789TJQKA"[c%13]+["♠","♥","♦","♣"][Math.floor(c/13)]}
function cardsText(a){return a.length?a.map(cardText).join(" "):"—"}
function cardHTML(c,back=false){return back?'<span class="card back">◆</span>':`<span class="card ${[1,2].includes(Math.floor(c/13))?"red":""}">${cardText(c)}</span>`}
function log(s){let d=document.createElement("div");d.textContent=s;$("log").append(d);if($("log").children.length>400)$("log").firstChild.remove();$("log").scrollTop=$("log").scrollHeight}
function rank(cards){
const counts=Array(15).fill(0),suits=[[],[],[],[]];
for(const c of cards){let r=c%13+2;counts[r]++;suits[Math.floor(c/13)].push(r)}
let rs=[];for(let r=14;r>=2;r--)if(counts[r])rs.push(r);
function straight(a){let mask=new Set(a);if(mask.has(14))mask.add(1);for(let top=14;top>=5;top--){let ok=true;for(let j=0;j<5;j++)if(!mask.has(top-j)){ok=false;break}if(ok)return top}return 0}
function score(cat,ks){let n=cat;for(let i=0;i<5;i++)n=n*15+(ks[i]||0);return n}
let flush=suits.find(a=>a.length>=5);
if(flush){let st=straight(flush);if(st)return score(8,[st])}
let quads=rs.filter(r=>counts[r]===4),trips=rs.filter(r=>counts[r]>=3),pairs=rs.filter(r=>counts[r]>=2);
if(quads.length)return score(7,[quads[0],...rs.filter(r=>r!==quads[0]).slice(0,1)]);
if(trips.length){let p=pairs.find(r=>r!==trips[0]);if(p)return score(6,[trips[0],p])}
if(flush)return score(5,flush.sort((a,b)=>b-a).slice(0,5));
let st=straight(rs);if(st)return score(4,[st]);
if(trips.length)return score(3,[trips[0],...rs.filter(r=>r!==trips[0]).slice(0,2)]);
if(pairs.length>=2)return score(2,[pairs[0],pairs[1],...rs.filter(r=>r!==pairs[0]&&r!==pairs[1]).slice(0,1)]);
if(pairs.length)return score(1,[pairs[0],...rs.filter(r=>r!==pairs[0]).slice(0,3)]);
return score(0,rs.slice(0,5))
}
function handName(p){return categories[Math.floor(rank([...p.hole,...board])/15**5)]}
function equity(hole,community,n,samples=250,tight=0){
if(n<1)return 1;
const known=new Set([...hole,...community]),pool=[];
for(let c=0;c<52;c++)if(!known.has(c))pool.push(c);
let sum=0;
for(let t=0;t<samples;t++){
let a=pool.slice(),need=5-community.length+2*n;
if(tight>0){for(let k=a.length-1;k>0;k--){let j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]]}}
else for(let k=0;k<need;k++){let j=k+Math.floor(Math.random()*(a.length-k));[a[k],a[j]]=[a[j],a[k]]}
let b=community.concat(a.slice(0,5-community.length)),idx=5-community.length,mine=rank([...hole,...b]),ties=1,lost=false;
for(let o=0;o<n;o++){
let c1=a[idx],c2=a[idx+1];
if(tight>0){
let tries=0;
while(tries<3&&Math.random()>Math.min(1,Math.pow(preScore([c1,c2]),.6+tight*2)*1.2)){
let s1=need+tries*2,s2=s1+1;if(s2>=a.length)break;
[a[idx],a[s1]]=[a[s1],a[idx]];[a[idx+1],a[s2]]=[a[s2],a[idx+1]];c1=a[idx];c2=a[idx+1];tries++;
}
}
let s=rank([c1,c2,...b]);idx+=2;
if(s>mine){lost=true;break}if(s===mine)ties++;
}
if(!lost)sum+=1/ties;
}
return sum/samples
}
function preScore(hole){let a=hole[0]%13+2,b=hole[1]%13+2,hi=Math.max(a,b),lo=Math.min(a,b),gap=hi-lo;
if(a===b)return clamp(.44+(hi-2)*.045,0,1);
let v=.12+(hi-2)*.032+(lo-2)*.018;
if(Math.floor(hole[0]/13)===Math.floor(hole[1]/13))v+=.08;
if(gap===1)v+=.06;else if(gap===2)v+=.025;else if(gap>4)v-=.07;
if(hi===14&&lo<=5)v+=.035;return clamp(v,0,1)}
function nextSeat(from,predicate){for(let n=1;n<=9;n++){let i=(from+n+9)%9;if(predicate(players[i]))return i}return -1}
function contenders(){return players.filter(p=>p.inHand&&!p.folded)}
function canAct(p){return p.inHand&&!p.folded&&!p.allin}
function potTotal(){return players.reduce((n,p)=>n+p.total,0)}
function layers(){
let levels=[...new Set(players.map(p=>p.total).filter(n=>n>0))].sort((a,b)=>a-b),prev=0,out=[];
for(let l of levels){let contributors=players.filter(p=>p.total>=l);out.push({amount:(l-prev)*contributors.length,contributors,eligible:contributors.filter(p=>!p.folded&&p.inHand)});prev=l}return out
}
function dyn(p){if(!p.base)return "";if(p.live.tilt>.55)return "上头中";if(p.live.bluff<.78)return "收紧了";if(p.live.confidence>.1||p.live.bluff>1.25)return "手风正顺";return p.base.style}
function draw(){
const positions=[[50,68],[13,68],[10,48],[14,26],[35,12],[65,12],[86,26],[90,48],[87,68]];
$("seats").innerHTML=players.map((p,i)=>`<div class="seat ${actor===i&&running?"actor":""} ${p.folded?"folded":""} ${p.winner?"winner":""}" style="left:${positions[i][0]}%;top:${positions[i][1]}%">
<div class="avatar">${p.base?EMOJIS[p.base.id]:"😎"}${button===i?'<span class="dealer">D</span>':""}</div>${p.base?`<div class="code">${p.name}</div>`:""}
<div class="cards">${p.hole.map(c=>cardHTML(c,i!==0&&!reveal)).join("")}</div>
<div class="pill">${fmtBB(p.stack)}</div>
<div class="bet">${p.folded?"已弃牌":p.allin?"全下":p.last||""}</div>
<div class="state-mini">${p.base&&dyn(p)!==p.base.style?dyn(p):""}</div></div>`).join("");
const betPos=positions.map(([x,y])=>[x+(50-x)*.34,y+(44-y)*.34]);
$("bets").innerHTML=players.map((p,i)=>p.bet>0?`<div class="bet-chip" style="left:${betPos[i][0]}%;top:${betPos[i][1]}%">${fmtBB(p.bet)}</div>`:"").join("");
$("board").innerHTML=board.map(c=>cardHTML(c)).join("");
$("pot").textContent="底池 "+fmtBB(potTotal());
let pots=layers().filter(x=>x.contributors.length>1);
$("sidepots").textContent=pots.length>1?pots.map((p,i)=>(i?"边池 "+i:"主池")+"："+fmtBB(p.amount)).join(" · "):"";
$("street").textContent=handNo?"第 "+handNo+" 手 · "+streetNames[street]:"等待开局";
$("status").textContent=running?(actor>=0?players[actor].name+" 行动中":"正在发牌…"):"";
$("stats").innerHTML=[`手数 ${stats.hands}`,`VPIP ${pct(stats.vpip,stats.hands)}`,`PFR ${pct(stats.pfr,stats.hands)}`,`胜率 ${pct(stats.wins,stats.hands)}`,`买入 ${stats.buyins} 次`, `净胜 ${signedBB(players[0].stack+(running?players[0].total:0)-stats.bought)}`].map(t=>"<span>"+t+"</span>").join("");
$("lineup").innerHTML="<b>在场代号</b>：" + players.slice(1).map(p=>`${p.name} ${EMOJIS[p.base.id]} · ${fmtBB(p.stack)}`).join(" · ");
$("reads").textContent=`对你的共同观察：面对下注 ${reads.faced} 次，弃牌 ${pct(reads.fold,reads.faced)}，跟注 ${pct(reads.call,reads.faced)}。`+(reads.bigN>=6?`面对大注（≥12BB）${reads.bigN} 次，跟注 ${pct(reads.bigC,reads.bigN)}。`:"");
$("next").hidden=running;$("next").textContent=players[0].stack<=0?"重新买入并开始":(stats.hands>0?"下一手":"开始第一手");
$("rebuy").hidden=running||players[0].stack>0;
$("skip").hidden=!running||!(players[0].folded||players[0].allin);
updateControls();updateEquity()
}
function pct(a,b){return b?(100*a/b).toFixed(1)+"%":"0.0%"}
function signed(n){return (n>=0?"+":"")+n}
function signedBB(n){return (n>=0?"+":"")+fmtBB(n)}
function minTo(p){let max=p.bet+p.stack;return Math.min(max,highest+minRaise)}
function mayRaise(p){return canAct(p)&&p.bet+p.stack>highest&&!acted.has(p.seat)&&players.some(q=>q!==p&&canAct(q))}
function updateControls(){
let p=players[0],turn=running&&actor===0,call=Math.min(p.stack,Math.max(0,highest-p.bet)),raiseOK=turn&&mayRaise(p);
$("fold").disabled=!turn;$("check").disabled=!turn||call>0;$("call").disabled=!turn||call===0;$("call").textContent="跟注 "+fmtBB(call)+(call===p.stack&&call>0?"（全下）":"");
for(let id of ["raise","raiseSlider","raiseNumber","allin"])$(id).disabled=!raiseOK;for(let b of document.querySelectorAll(".qbtn"))b.disabled=!raiseOK;
$("quickPre").style.display=running&&street===0?"":"none";$("quickPost").style.display=running&&street>0?"":"none";
if(raiseOK){let lo=minTo(p),hi=p.bet+p.stack;$("raiseSlider").min=$("raiseNumber").min=lo/2;$("raiseSlider").max=$("raiseNumber").max=hi/2;
let v=clamp(Number($("raiseNumber").value)||lo/2,lo/2,hi/2);$("raiseSlider").value=$("raiseNumber").value=v}
}
function updateEquity(){
let p=players[0];if(!$("showEquity").checked||!running||p.folded){$("equity").textContent="";return}
let n=contenders().length-1,key=p.hole.join(",")+"|"+board.join(",")+"|"+n;
if(key!==equityCache){equityCache=key;equityValue=equity(p.hole,board,n)}
$("equity").textContent="你的估计胜率："+(100*equityValue).toFixed(1)+"%（含平分，250 次模拟）"
}
function pay(p,n){n=Math.max(0,Math.min(p.stack,Math.floor(n)));p.stack-=n;p.bet+=n;p.total+=n;p.allin=p.stack===0;return n}
function startHand(){
if(running)return;
if(players[0].stack<=0){players[0].stack=100;players[0].allin=false;stats.buyins++;stats.bought+=100;persist();log("筹码已用完，自动重新买入 50BB")}
clearTimeout(timer);
let used=new Set(players.slice(1).filter(p=>p.stack>0).map(p=>p.base.id));
for(let i=1;i<9;i++)if(players[i].stack<=0){let b=shuffle(roster.filter(b=>!used.has(b.id)))[0];players[i]=makePlayer(i,b);used.add(b.id);log(b.name+" 入座，买入 50BB")}
for(let p of players){
p.hole=[];p.bet=0;p.total=0;p.folded=false;p.inHand=p.stack>0;p.allin=false;p.winner=false;p.last="";p.won=0;p.bluffs=[];p.initial=p.stack;p.rfp=false;p.trapStreet=-1;p._facedTurn=false;
p.live.bluff=1+(p.live.bluff-1)*.94;p.live.tilt*=.79;p.live.confidence*=.80;
}
running=true;reveal=false;instant=false;skipRest=false;iteration=0;board=[];deck=shuffle(Array.from({length:52},(_,i)=>i));street=0;highest=2;minRaise=2;actor=-1;
handNo=stats.hands+1;startStack=players[0].stack;humanActions=[];handVpip=false;handPfr=false;handFaced=false;handCalled=false;handRaised=false;
seated=players.slice(1).map(p=>p.name).join("、");$("result").textContent="";
button=nextSeat(button,p=>p.inHand);sb=nextSeat(button,p=>p.inHand);bb=nextSeat(sb,p=>p.inHand);
for(let round=0;round<2;round++)for(let j=1;j<=9;j++){let p=players[(button+j)%9];if(p.inHand)p.hole.push(deck.pop())}
pay(players[sb],1);pay(players[bb],2);
pending=new Set(players.filter(canAct).map(p=>p.seat));acted=new Set();
log("—— 第 "+handNo+" 手：庄家 "+players[button].name+"；"+players[sb].name+" 小盲 "+fmtBB(1)+"，"+players[bb].name+" 大盲 "+fmtBB(2)+" ——");
handRecord={no:handNo,button,sb,bb,players:players.map(p=>({seat:p.seat,id:p.base?p.base.id:-1,name:p.name,hole:[...p.hole],start:p.stack+p.total})),actions:[],board:[],result:"",winners:[],nets:[]};
advance(bb)
}
function schedule(){clearTimeout(timer);if(!running||actor<0||actor===0)return;timer=setTimeout(()=>{if(!running||actor<1)return;let p=players[actor];let d=botDecision(p);act(p,d.type,d.to,d.eq)},(instant||skipRest)?0:(players[0].folded||players[0].allin?60:550))}
function advance(from){
if(!running)return;
if(contenders().length===1){finish(false);return}
for(let i of [...pending])if(!canAct(players[i]))pending.delete(i);
let active=players.filter(canAct);
if(active.length<=1){let lone=active[0];if(lone&&lone.bet<highest)pending.add(lone.seat);else pending.clear()}
if(!pending.size){endRound();return}
actor=nextSeat(from,p=>pending.has(p.seat)&&canAct(p));
if(actor<0){endRound();return}
draw();schedule()
}
function endRound(){
actor=-1;
if(street===3){finish(true);return}
street++;for(let p of players){p.bet=0;p.last=""}
highest=0;minRaise=2;acted=new Set();
deck.pop();let n=street===1?3:1;for(let i=0;i<n;i++)board.push(deck.pop());
log(streetNames[street]+"："+cardsText(board));
pending=new Set(players.filter(canAct).map(p=>p.seat));
if(players.filter(canAct).length<=1)pending.clear();
draw();
if(!pending.size){endRound();return}
advance(button)
}
function act(p,type,to=0,eq=1){
if(!running||actor!==p.seat||!canAct(p))return;
iteration++;
if(iteration>500){type=highest>p.bet?"fold":"check";log("安全推进：自动"+(type==="fold"?"弃牌":"让牌"))}
let owed=Math.max(0,highest-p.bet),oldHigh=highest,wasRaise=false;
let snap0=null;
if(p.seat===0)snap0={street,board:board.slice(),hole:p.hole.slice(),pot:potTotal(),owed,highest,opps:contenders().filter(q=>q.seat!==0).length};
if(type==="raise"&&!mayRaise(p))type=owed?"call":"check";
if(type==="check"&&owed)type="call";
if(type==="call"&&!owed)type="check";
if(p.seat===0&&owed>0){reads.faced++;handFaced=true;if(type==="fold")reads.fold++;if(type==="call"){reads.call++;handCalled=true}if(street>0&&owed>=24){reads.bigN++;if(type==="call")reads.bigC++}}
if(type==="fold"){p.folded=true;if(p.seat===0)skipRest=true;p.last="弃牌";log(p.name+" 弃牌")}
else if(type==="check"){p.last="让牌";log(p.name+" 让牌")}
else if(type==="call"){let n=pay(p,owed);p.last="跟注 "+fmtBB(n);log(p.name+" 跟注 "+fmtBB(n)+(p.allin?"，全下":""))}
else{
let max=p.bet+p.stack,legalMin=minTo(p);to=clamp(Math.floor(Number(to)||legalMin),legalMin,max);
pay(p,to-p.bet);highest=p.bet;let increase=highest-oldHigh;wasRaise=true;
if(increase>=minRaise){minRaise=increase;acted.clear();pending=new Set(players.filter(canAct).map(q=>q.seat))}
else for(let q of players)if(canAct(q)&&q.bet<highest)pending.add(q.seat);
p.last=(oldHigh?"加注到 ":"下注 ")+fmtBB(highest);log(p.name+" "+p.last+(p.allin?"，全下":""));
for(let q of players)if(q!==p)for(let b of q.bluffs)if(!b.penalized){q.live.bluff=clamp(q.live.bluff*.85,.4,1.8);b.penalized=true}
if(street===0)p.rfp=true;
if(type==="raise"){p._sr=(p._srStreet===street?(p._sr||0)+1:1);p._srStreet=street}
if(p.base&&eq<.34)p.bluffs.push({street,penalized:false});
}
if(p.seat===0){humanActions.push(streetNames[street]+":"+(type==="raise"?"加注到"+fmtBB(highest):type==="call"?"跟注"+fmtBB(Math.min(owed,p.bet)):type==="fold"?"弃牌":"让牌"));if(street===0&&(type==="raise"||type==="call"))handVpip=true;if(street===0&&wasRaise)handPfr=true;if(type==="raise")handRaised=true}
if(p.seat===0&&snap0)renderGto(snap0,type);
if(handRecord)handRecord.actions.push({seat:p.seat,street,type,bet:p.bet,total:p.total,folded:p.folded,allin:p.allin});
acted.add(p.seat);pending.delete(p.seat);actor=-1;advance(p.seat)
}
let gtoLog=[];
function gtoAdvice(s){
let rec,why,eq=null,odds=0;
if(s.street===0){
let q=preScore(s.hole);
if(s.highest<=2){
rec=q>=.55?"raise":(s.owed===0?"check":(q>=.40?"call":"fold"));
}else{
rec=q>=.68?"raise":(q>=.57?"call":(q>=.48&&s.owed<=6?"call":"fold"));
}
why=`起手强度 ${(q*100)|0}`;
return {rec,why,eq,odds};
}
let tight=clamp(.26+s.street*.10+(s.owed>0?.20:0)+(s.owed>s.pot*.5?.10:0),0,.8);
eq=equity(s.hole,s.board,Math.max(1,s.opps),300,tight);
odds=s.owed>0?s.owed/(s.pot+s.owed):0;
if(s.owed>0){
rec=eq>=.66?"raise":(eq>=odds-.05?"call":"fold");
why=`胜率 ${(eq*100).toFixed(0)}% ，跟注所需 ${(odds*100).toFixed(0)}%`;
}else{
rec=eq>=.60?"raise":"check";
why=`胜率 ${(eq*100).toFixed(0)}%`+(eq>=.45&&eq<.60?"，中等牌控池":"");
}
return {rec,why,eq,odds};
}
function renderGto(s,myType){
let gp=document.getElementById("gtoPanel");if(!gp)return;
let a=gtoAdvice(s);
let names={fold:"弃牌",check:"让牌",call:"跟注",raise:"加注"};
let verdict,mark;
if(myType===a.rec){verdict="与参考线一致";mark="✓"}
else if(a.rec==="fold"&&myType==="call"&&a.eq>=a.odds-.05){verdict="边界跟注，可接受";mark="≈"}
else if(a.rec==="call"&&myType==="raise"&&a.eq>=.55){verdict="偏凶一档，可接受";mark="≈"}
else if(a.rec==="raise"&&(myType==="call"||myType==="check")&&a.eq>=.55){verdict="偏弱一档，可接受";mark="≈"}
else{verdict="与参考线偏差";mark="✗"}
let bluffNote=(myType==="raise"&&a.eq!==null&&a.eq<.34&&s.street>0)?"（此为诈唬下注）":"";
gtoLog.unshift(`#${handNo} ${streetNames[s.street]}：你【${names[myType]}】· GTO 参考【${names[a.rec]}】— ${a.why} ${mark} ${verdict}${bluffNote}`);
gtoLog=gtoLog.slice(0,3);
gp.innerHTML=gtoLog.join("<br>");
}
function boardWet(b){
if(!b||b.length<3)return 0;
let suits={},ranks=b.map(c=>c%13+2);
b.forEach(c=>{let s=Math.floor(c/13);suits[s]=(suits[s]||0)+1});
let maxSuit=Math.max(...Object.values(suits));
let uniq=[...new Set(ranks)].sort((x,y)=>x-y);
let span=uniq.length>=3?(uniq[uniq.length-1]-uniq[0]<=4?1:(uniq[uniq.length-1]-uniq[0]<=6?.5:0)):0;
let wet=0;
if(maxSuit>=3)wet+=.45;else if(maxSuit===2)wet+=.2;
wet+=span*.35;
if(ranks.length-uniq.length>0)wet+=.15;
return clamp(wet,0,1);
}
function proDecision(p,ctx){
let b=p.base,opps=contenders().filter(q=>q.seat!==p.seat).length;
let pot=potTotal(),owed=Math.max(0,highest-p.bet),price=Math.min(owed,p.stack);
let posIdx=((p.seat-button)%9+9)%9,early=posIdx===3||posIdx===4,late=posIdx===0||posIdx===7||posIdx===8;
let rHi=Math.max(p.hole[0]%13+2,p.hole[1]%13+2),rLo=Math.min(p.hole[0]%13+2,p.hole[1]%13+2);
let openTo=Math.max(highest+minRaise,Math.round(2*(2+b.size*2)));
let betTo=f=>Math.min(p.bet+p.stack,highest+Math.max(minRaise,Math.round((pot+owed)*f)));
if(street===0){
let quality=preScore(p.hole),eq=clamp(.12+quality*.7-(opps-1)*.025,.04,.9);
let openQ=(early?.60:late?.50:.55)+(b.id===14?.04:b.id===15?-.03:0),facing=highest>2;
if(mayRaise(p)){
if(quality>=.68)return {type:"raise",to:Math.min(p.bet+p.stack,facing?Math.max(highest+minRaise,Math.round(highest*2.5)):openTo),eq};
if(!facing&&quality>=openQ)return {type:"raise",to:Math.min(p.bet+p.stack,openTo),eq};
if(facing&&rHi===14&&quality>=.55&&Math.random()<.3)return {type:"raise",to:Math.min(p.bet+p.stack,Math.max(highest+minRaise,Math.round(highest*2.5))),eq};
}
if(!owed)return {type:"check",eq};
if(quality>=(facing?.58:openQ-.05))return {type:"call",eq};
if(price<=2&&quality>=.42)return {type:"call",eq};
return {type:"fold",eq};
}
let tight=.26+street*.10+(owed>0?.20:0)+(owed>pot*.5?.10:0);
if(street===2&&owed>0)p._facedTurn=true;
let eq=equity(p.hole,board,opps,300,clamp(tight,0,.8));
let wet=boardWet(board),odds=price/Math.max(1,pot+price);
let topB=Math.max(...board.map(c=>c%13+2));
let strongMade=(rHi===rLo&&rHi>topB)||(rHi===topB&&rLo>=13);
let vt=.57+opps*.02-(strongMade?.04:0);
if(ctx.humanPresent&&ctx.bigCallRate!==null&&ctx.bigCallRate>.55)vt-=.06;
let bluffP=b.bluff*(wet>.55?.6:1)*(b.id===14?.8:b.id===15?1.15:1);
if(ctx.humanPresent&&ctx.bigCallRate!==null&&ctx.bigCallRate>.55)bluffP*=.5;
if(ctx.humanPresent&&ctx.rfRate!==null&&ctx.rfRate>.45)bluffP*=1.4;
if(!owed){
if(eq>.85&&street<3&&p.trapStreet<0&&Math.random()<.25){p.trapStreet=street;return {type:"check",eq};}
if(eq>vt)return {type:"raise",to:betTo((street===3?.75:.55+wet*.2)*(b.id===14?1.1:1)),eq};
if(p.rfp&&street===1&&(opps<=2||eq>=.25)&&Math.random()<.62-wet*.3)return {type:"raise",to:betTo(.45),eq};
if(street===3&&eq<.3&&opps===1&&!p._facedTurn&&Math.random()<bluffP*.6)return {type:"raise",to:betTo(.75),eq};
if(street<3&&eq>=.2&&eq<.45&&Math.random()<bluffP)return {type:"raise",to:betTo(.5),eq};
return {type:"check",eq};
}
if(eq>.85&&street<3&&p.trapStreet<0&&Math.random()<.2){p.trapStreet=street;return {type:"call",eq};}
if(eq>vt+.12&&mayRaise(p))return {type:"raise",to:betTo(.7),eq};
if(eq>=odds+.03)return {type:"call",eq};
if(eq<.22&&street<3&&mayRaise(p)&&Math.random()<bluffP*.7)return {type:"raise",to:betTo(.65),eq};
return {type:"fold",eq};
}
function botDecision(p){
let b=p.base,L=p.live,opps=contenders().length-1,owed=Math.max(0,highest-p.bet),price=Math.min(owed,p.stack),pot=potTotal(),odds=price/(pot+price||1);
let vp=clamp(b.vpip+L.tilt*.13+L.confidence,.07,.96),ag=clamp(b.aggression+L.tilt*.18,.03,.98);
let humanPresent=players[0].inHand&&!players[0].folded;
let read=reads.faced>=20?clamp(1+(reads.fold/reads.faced-.45)*1.3-(reads.call/reads.faced-.35)*.8,.5,1.5):1;
let bluff=b.bluff*L.bluff*(1+L.tilt*.55)*(humanPresent?read:1);
let rfSample=reads.rfF+reads.rfN,rfRate=rfSample>=8?reads.rfF/rfSample:null;
let bigCallRate=reads.bigN>=6?reads.bigC/reads.bigN:null;
if(humanPresent&&rfRate!==null&&rfRate>.45)bluff*=1.35;
if(humanPresent&&bigCallRate!==null&&bigCallRate>.55)bluff*=.55;
if(PROS.has(b.id))return proDecision(p,{humanPresent,rfRate,bigCallRate});
let eq,quality;
let posIdx=((p.seat-button)%9+9)%9,early=posIdx===3||posIdx===4,late=posIdx===0||posIdx===7||posIdx===8;
if(street===0){
quality=preScore(p.hole);eq=clamp(.12+quality*.7-(opps-1)*.025,.04,.9);
let cutoff=.80-vp*.67+(early?.055:late?-.035:0);
let costly=owed>6?Math.min(.23,Math.log2(owed/2)*.045):0;
if(owed&&quality<cutoff+costly&&Math.random()>vp*.12)return {type:"fold",eq};
let rHi=Math.max(p.hole[0]%13+2,p.hole[1]%13+2),rLo=Math.min(p.hole[0]%13+2,p.hole[1]%13+2),isPair=p.hole[0]%13===p.hole[1]%13;
let pS=isPair&&rHi>=13,pA=(isPair&&rHi===12)||(rHi===14&&rLo===13),pB=(isPair&&rHi===11)||(rHi===14&&rLo===12);
let goRaise=pS||(pA&&(highest<=12||Math.random()<.55))||(pB&&highest<=12&&Math.random()<.9);
if(goRaise&&mayRaise(p)){
let target;
if(highest<=2)target=Math.max(highest+minRaise,Math.round(2*(2+b.size*2)));
else if(highest<=12)target=Math.max(highest+minRaise*2,Math.round(highest*2.4));
else target=Math.max(highest+minRaise,Math.round(highest*2.1));
return {type:"raise",to:Math.min(p.bet+p.stack,target),eq};
}
let limpers=players.filter(q=>q!==p&&q.inHand&&!q.folded&&q.bet>=2).length-(players[bb]&&players[bb].inHand?1:0);
if(highest<=2&&limpers>=1&&mayRaise(p)&&quality>=.52-ag*.12&&Math.random()<clamp(.25+ag*.65,0,.9)*(stats.hands>=25&&(stats.vpip-stats.pfr)/stats.hands>.25?1.3:1)){
return {type:"raise",to:Math.min(p.bet+p.stack,Math.max(highest+minRaise,Math.round(2*(3+b.size*2)+limpers*2))),eq};
}
}else{
let tight=.18+street*.09+(owed>0?.22:0)+(owed>pot*.5?.15:0)+(opps===1?.08:0)+(owed>pot?.08:0);
eq=equity(p.hole,board,opps,250,clamp(tight,0,.85));
}
let madeCat=0;
if(street>0&&board.length>=3)madeCat=Math.floor(rank([...p.hole,...board])/15**5);
let thin=(humanPresent&&reads.faced>=20&&reads.call/reads.faced>.55?.055:0)+(humanPresent&&bigCallRate!==null&&bigCallRate>.55?.05:0);
let valueThreshold=street===0?.66:clamp(.56+opps*.025-thin,.52,.80);
if(madeCat===1&&street>0)valueThreshold+=.08;
if(b.id===3)valueThreshold+=.12;
if(b.id===11)valueThreshold+=.06;
let monster=eq>.78,trap=monster&&p.trapStreet<0&&street===1&&Math.random()<b.trap;
if(trap)p.trapStreet=street;
let selective=b.id===13?(!owed&&opps<=2?1:.22):1;
let wet=street>0?boardWet(board):0;
let cbetBoost=p.rfp&&street===1?(1.3-wet*.75):1;
let doBluff=eq<.34&&Math.random()<bluff*selective*cbetBoost/(1+Math.max(0,opps-1)*.28);
if(street===3&&(opps>2||Math.random()<.45))doBluff=false;
if(madeCat>=1)doBluff=false;
let strongMade=false;
if(street>0&&board.length>=3){
let topB=Math.max(...board.map(c=>c%13+2)),h1=p.hole[0]%13+2,h2=p.hole[1]%13+2;
strongMade=(h1===h2&&h1>topB)||(Math.max(h1,h2)===topB&&Math.min(h1,h2)>=13);
}
let value=eq>(strongMade?valueThreshold-.05:valueThreshold)&&Math.random()<(strongMade?Math.max(ag,.62):ag);
if(!value&&madeCat>=2&&Math.random()<(madeCat>=3?.85:.70))value=true;
if(!value&&strongMade&&Math.random()<.6)value=true;
if(b.id===11)doBluff=false;
if(!owed&&street>=2&&!strongMade&&madeCat<2&&eq>=.34&&eq<=.58&&Math.random()<.5)return {type:"check",eq};
if(mayRaise(p)&&!trap&&(value||doBluff)&&!((p._srStreet===street?(p._sr||0):0)>=1&&madeCat<3)){
let fraction=b.size*(.8+Math.random()*.4)*(1+L.tilt*.18);
if(street>0)fraction*=value?(1+wet*.25):(1-wet*.1);
if(street===3&&doBluff&&!value)fraction=Math.max(fraction,.7);
let target=highest+Math.max(minRaise,Math.round((pot+owed)*fraction));
if(street===0)target=Math.max(highest+minRaise,Math.round(2*(2+b.size*2)));
return {type:"raise",to:Math.min(p.bet+p.stack,target),eq}
}
if(!owed)return {type:"check",eq};
if(street===0){
let limit=.81-vp*.66+(owed>8?.10:0)+(early?.04:late?-.03:0);
let skill=(ag+(1-vp))/2;
if(quality>=limit||price<=2&&Math.random()<vp){
if(highest<=2&&mayRaise(p)&&skill>.45&&quality>=.5&&Math.random()<.45)return {type:"raise",to:Math.min(p.bet+p.stack,Math.max(highest+minRaise,Math.round(2*(2+b.size*2)))),eq};
return {type:"call",eq};
}
return {type:"fold",eq};
}
if(street>0&&madeCat<3&&!trap){
if((p._srStreet===street?(p._sr||0):0)>=1&&madeCat<=1&&eq<.68)return {type:"fold",eq};
let streetCapBB=(madeCat===2?30:(strongMade?26:16))*(b.call>.8?1.4:b.call<.2?.7:1);
if(owed>streetCapBB*2&&eq<.62)return {type:"fold",eq};
if(street===3&&madeCat<=1&&owed>pot*.4&&eq<.58)return {type:"fold",eq};
}
let threshold=odds+.075-b.call*.16-L.tilt*.065;
if(b.id===3)threshold=Math.max(odds+.16,.46);
if(b.id===9)threshold=odds+.015;
if(b.id===11)threshold=Math.max(odds+.06,.28);
if(b.id===4||b.id===10){threshold+=owed>pot*.45?.18:-.035}
if(owed>pot*.8)threshold+=.055*(1-b.call);
threshold=clamp(threshold,.035,.92);
return {type:eq>=threshold||trap?"call":"fold",eq}
}
function seatOrder(a,b){return ((a.seat-button+8)%9)-((b.seat-button+8)%9)}
function finish(showdown){
clearTimeout(timer);actor=-1;reveal=showdown;
let ps=layers(),winners=new Set(),descriptions=[],refunds=[];
for(let part of ps){
if(part.contributors.length===1){let p=part.contributors[0];p.stack+=part.amount;refunds.push(p.name+" 收回未跟注 "+fmtBB(part.amount));continue}
let elig=part.eligible;
if(!elig.length){for(let p of part.contributors)p.stack+=part.amount/part.contributors.length;continue}
let win;
if(!showdown)win=[contenders()[0]];
else{let best=Math.max(...elig.map(p=>rank([...p.hole,...board])));win=elig.filter(p=>rank([...p.hole,...board])===best)}
win.sort(seatOrder);let each=Math.floor(part.amount/win.length),rem=part.amount%win.length;
win.forEach((p,i)=>{let amount=each+(i<rem?1:0);p.stack+=amount;p.won+=amount;p.winner=true;winners.add(p)});
let label=descriptions.length?"边池 "+descriptions.length:"主池";
descriptions.push(label+" "+fmtBB(part.amount)+"："+win.map(p=>p.name).join("、")+(showdown?"（"+handName(win[0])+"）":"（其他玩家弃牌）"))
}
for(let s of refunds)log(s);
for(let s of descriptions)log(s);
for(let p of players.slice(1)){
let net=p.stack-p.initial;
if(net<=-50)p.live.tilt=clamp(p.live.tilt+Math.min(1.7,-net/100)*p.base.tiltGain,0,3);
if(net>=50)p.live.confidence=clamp(p.live.confidence+(p.base.vpip>.4?.045:-.025),-.1,.16);
for(let bl of p.bluffs){
if(!showdown&&winners.has(p))p.live.bluff=clamp(p.live.bluff+.08,.4,1.8);
else if(!winners.has(p)&&!bl.penalized)p.live.bluff=clamp(p.live.bluff*.79,.4,1.8)
}
}
let net=players[0].stack-startStack;
if(handRaised){if(players[0].folded)reads.rfF++;else reads.rfN++}
stats.hands++;if(handVpip)stats.vpip++;if(handPfr)stats.pfr++;if(players[0].won>0)stats.wins++;
let pos=positionName(0);
let result=descriptions.join("；");
history.push({no:handNo,pos,hole:cardsText(players[0].hole),board:cardsText(board),actions:humanActions.join(" / ")||"无主动操作",result,net,bots:seated});
history=history.slice(-200);running=false;
$("result").textContent=result+"。你本手："+signedBB(net)+"。";
log("你本手 "+signedBB(net)+"；剩余 "+fmtBB(players[0].stack));
for(let p of players){p.total=0;p.bet=0;if(p.stack===0&&p.base)log(p.name+" 破产离桌，下一手补充新玩家")}
if(handRecord){handRecord.board=[...board];handRecord.result=descriptions.concat(refunds).join("；");handRecord.winners=[...winners].map(p=>p.seat);handRecord.nets=players.map(p=>p.stack-p.initial);replays.push(handRecord);if(replays.length>60)replays.splice(0,replays.length-60);handRecord=null}
$("next").textContent="下一手";persist();renderHistory();draw();timer=setTimeout(()=>{if(!running)startHand()},skipRest?60:2600)
}
function positionName(seat){
let order=[];for(let j=0;j<9;j++){let s=(button+j)%9;if(players[s].inHand)order.push(s)}
let idx=order.indexOf(seat);return ["BTN","SB","BB","UTG","UTG+1","中位","中位+1","HJ","CO"][idx]||"未入局"
}
function renderHistory(){
$("history").replaceChildren();
for(let h of [...history].reverse()){
let e=document.createElement("article");e.textContent=`#${h.no} ${h.pos}｜${h.hole}｜公共牌 ${h.board}｜${h.actions}｜${h.result}｜你 ${signedBB(h.net)}`;$("history").append(e)
}
}
function quickRaise(v){setRaise(v);act(players[0],"raise",Math.round(Number($("raiseNumber").value)*2))}
function setRaise(v){let p=players[0];let n=clamp(Math.round(Number(v)||minTo(p)),minTo(p),p.bet+p.stack);$("raiseSlider").value=$("raiseNumber").value=n/2}
$("fold").onclick=()=>act(players[0],"fold");
$("check").onclick=()=>act(players[0],"check");
$("call").onclick=()=>act(players[0],"call");
$("raise").onclick=()=>act(players[0],"raise",Math.round(Number($("raiseNumber").value)*2));
$("raiseSlider").oninput=e=>{$("raiseNumber").value=e.target.value};
$("raiseNumber").onchange=e=>setRaise(Number(e.target.value)*2);
const SETTINGS_KEY="holdem-settings-v1";
let settings={preBB:[2.5,3,4,5],postPct:[33,50,66,100]};
try{let s=JSON.parse(localStorage.getItem(SETTINGS_KEY));if(s&&Array.isArray(s.preBB)&&s.preBB.length&&Array.isArray(s.postPct)&&s.postPct.length)settings=s}catch(e){}
function saveSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}catch(e){}}
function renderQuick(){
let qp=$("quickPre");qp.replaceChildren();
settings.preBB.forEach(bb=>{let b=document.createElement("button");b.className="qbtn";b.textContent="到 "+bb+"BB";b.onclick=()=>quickRaise(Math.round(bb*2));qp.append(b)});
let qf=$("quickPost");qf.replaceChildren();
settings.postPct.forEach(pc=>{let b=document.createElement("button");b.className="qbtn";b.textContent=pc+"% 池";b.onclick=()=>quickRaise(highest+Math.round((potTotal()+Math.max(0,highest-players[0].bet))*pc/100));qf.append(b)});
}
function fillSettingsInputs(){[1,2,3,4].forEach(i=>{let a=$("setPre"+i),b=$("setPost"+i);if(a)a.value=settings.preBB[i-1]??"";if(b)b.value=settings.postPct[i-1]??""})}
renderQuick();fillSettingsInputs();
$("saveSettings").onclick=()=>{
let pre=[1,2,3,4].map(i=>Number($("setPre"+i).value)).filter(v=>v>0&&v<=200);
let post=[1,2,3,4].map(i=>Number($("setPost"+i).value)).filter(v=>v>0&&v<=500);
if(pre.length)settings.preBB=pre;if(post.length)settings.postPct=post;
saveSettings();renderQuick();fillSettingsInputs();draw();log("快捷下注设置已保存");
};
$("allin").onclick=()=>quickRaise(players[0].bet+players[0].stack);
$("next").onclick=startHand;
$("skip").onclick=()=>{
if(!running||!(players[0].folded||players[0].allin))return;
instant=true;clearTimeout(timer);
let guard=0;
while(running&&actor>0&&guard++<600){
let p=players[actor],d=guard>500?{type:highest>p.bet?"fold":"check",eq:1}:botDecision(p);
act(p,d.type,d.to,d.eq);clearTimeout(timer)
}
if(running)schedule()
};
$("rebuy").onclick=()=>{if(running||players[0].stack>0)return;players[0].stack=100;players[0].allin=false;stats.buyins++;stats.bought+=100;persist();draw();startHand()};
$("showEquity").onchange=updateEquity;
$("reset").onclick=()=>{
if(!confirm("重置全部筹码、战绩与买入记录？"))return;
clearTimeout(timer);running=false;stats={hands:0,vpip:0,pfr:0,wins:0,buyins:1,bought:100};history=[];reads={faced:0,fold:0,call:0,bigN:0,bigC:0,rfF:0,rfN:0};replays=[];
players=[makePlayer(0),...shuffle([...roster]).slice(0,8).map((b,i)=>makePlayer(i+1,b))];
button=-1;actor=-1;board=[];street=0;handNo=0;reveal=false;equityCache="";$("log").replaceChildren();$("result").textContent="";$("next").textContent="开始第一手";$("exportText").hidden=true;$("copy").hidden=true;persist();renderHistory();draw()
};
function buildExportText(){
let data={app:"holdem-nine-review",version:2,exportedAt:new Date().toISOString(),stats:{hands:stats.hands,vpip:stats.vpip,pfr:stats.pfr,wins:stats.wins,buyins:stats.buyins,bought:stats.bought,stack:players[0].stack},history,reads,replays};
return JSON.stringify(data);
}
$("share").onclick=async()=>{
let text=buildExportText();
try{
let file=new File([text],"holdem-review.json",{type:"application/json"});
if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file]});log("已通过系统分享发送复盘数据")}
else log("当前环境不支持直接分享：请点「导出复盘数据」下载文件，再在聊天里用 + 添加附件发给我");
}catch(e){if(e&&e.name!=="AbortError")log("分享没有成功，请用导出+附件的方式")}
};
$("export").onclick=()=>{
let text=buildExportText();
$("exportText").value=text;$("exportText").hidden=false;$("copy").hidden=false;
try{let blob=new Blob([text],{type:"application/json"});let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="holdem-review.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}catch{}
};
$("copy").onclick=async()=>{
try{await navigator.clipboard.writeText($("exportText").value);$("copyStatus").textContent=" 已复制"}catch{$("exportText").focus();$("exportText").select();$("copyStatus").textContent=document.execCommand("copy")?" 已复制":" 请长按或手动复制"}
};
function restoreData(d){
if(running){log("对局进行中，不能恢复进度");return}
if(!d||!d.stats){log("这不是有效的进度文件");return}
stats={hands:d.stats.hands|0,vpip:d.stats.vpip|0,pfr:d.stats.pfr|0,wins:d.stats.wins|0,buyins:d.stats.buyins||1,bought:d.stats.bought||100};
if(Array.isArray(d.history))history=d.history.slice(-200);
if(d.reads)reads=Object.assign({faced:0,fold:0,call:0,bigN:0,bigC:0,rfF:0,rfN:0},d.reads);
if(Array.isArray(d.replays))replays=d.replays.slice(-60);
players[0].stack=Number.isInteger(d.stats.stack)&&d.stats.stack>=0?d.stats.stack:100;
handNo=stats.hands;persist();renderHistory();draw();
log("进度已恢复：共 "+stats.hands+" 手，当前 "+fmtBB(players[0].stack)+"，可回放 "+replays.length+" 手");
}
$("importFile").onchange=e=>{let f=e.target.files&&e.target.files[0];if(!f)return;let rd=new FileReader();rd.onload=()=>{try{restoreData(JSON.parse(rd.result))}catch{log("进度文件解析失败")}};rd.readAsText(f);e.target.value=""};
$("importText").onclick=()=>{try{restoreData(JSON.parse($("exportText").value))}catch{log("文本框里不是有效的进度数据")}};
window.__getReplayData=()=>({app:"holdem-nine-review",version:2,stats:{hands:stats.hands,vpip:stats.vpip,pfr:stats.pfr,wins:stats.wins,buyins:stats.buyins,bought:stats.bought,stack:players[0].stack},replays});
let replayOpen=false;
$("openReplay").onclick=()=>{replayOpen=true;$("replayView").style.display="";ReplayView.loadGameData();$("replayView").scrollIntoView({behavior:"smooth"})};
$("closeReplay").onclick=()=>{replayOpen=false;ReplayView.stop();$("replayView").style.display="none"};
document.addEventListener("keydown",e=>{
let t=e.target&&e.target.tagName;if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT")return;
if(replayOpen)return;
let k=(e.key||"").toLowerCase();
if(k==="f"&&actor===0&&!$("fold").disabled)$("fold").click();
else if((k==="c"||k===" ")&&actor===0){e.preventDefault();if(!$("check").disabled&&!$("check").hidden)$("check").click();else if(!$("call").disabled)$("call").click()}
else if(k==="a"&&actor===0&&!$("allin").disabled)quickRaise(players[0].bet+players[0].stack);
else if(k>="1"&&k<="4"&&actor===0){let row=street===0?$("quickPre"):$("quickPost");let b=row.children[Number(k)-1];if(b&&!b.disabled)b.click()}
else if(k==="arrowup"&&actor===0){e.preventDefault();setRaise(Math.round(Number($("raiseNumber").value)*2)+1)}
else if(k==="arrowdown"&&actor===0){e.preventDefault();setRaise(Math.round(Number($("raiseNumber").value)*2)-1)}
else if(k==="enter"&&actor===0&&!$("raise").disabled)act(players[0],"raise",Math.round(Number($("raiseNumber").value)*2));
else if(k==="n"&&!running)$("next").click();
});
renderHistory();draw();log("欢迎入座。盲注 0.5/1BB，每次买入 50BB。点击开始发牌。");
