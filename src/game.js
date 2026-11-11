
"use strict";
const $=id=>document.getElementById(id), BB=2, KEY="holdem-nine-v1";
// ===== 移植自 poker-trainer（brain/roster.js + app/config.js）：46 人名单与五档难度 =====
// 前 16 人与原版逐值对应（代号01-16 身份不变，老存档 reads/战绩不串人）；参数序：vpip, aggression, bluff, call, trap, size, tiltGain
const ROSTER46=[
["\u4ee3\u53f701","normal","TAG \u7d27\u51f6",[0.23,0.76,0.035,0.3,0.08,0.65,0.45]],
["\u4ee3\u53f702","normal","Maniac \u677e\u51f6",[0.8,0.94,0.32,0.65,0.02,1.25,1.2]],
["\u4ee3\u53f703","normal","Calling station",[0.87,0.07,0.008,0.98,0.02,0.4,0.45]],
["\u4ee3\u53f704","normal","Rock",[0.1,0.42,0.005,0.06,0.08,0.55,0.03]],
["\u4ee3\u53f705","normal","Loose-passive fish",[0.7,0.18,0.025,0.78,0.04,0.38,0.6]],
["\u4ee3\u53f706","normal","Bluffer",[0.46,0.82,0.31,0.4,0.05,0.85,0.8]],
["\u4ee3\u53f707","normal","Trapper",[0.3,0.55,0.045,0.48,0.72,0.85,0.35]],
["\u4ee3\u53f708","normal","Balanced",[0.32,0.59,0.075,0.43,0.12,0.65,0.3]],
["\u4ee3\u53f709","normal","Tricky TAG",[0.25,0.73,0.12,0.36,0.3,0.75,0.25]],
["\u4ee3\u53f710","normal","Odds robot",[0.28,0.48,0.008,0.32,0.04,0.6,0.05]],
["\u4ee3\u53f711","normal","Curious beginner",[0.81,0.15,0.018,0.65,0.02,0.35,0.65]],
["\u4ee3\u53f712","normal","Straightforward ABC",[0.26,0.57,0,0.25,0.02,0.65,0.2]],
["\u4ee3\u53f713","normal","Tilter",[0.46,0.66,0.13,0.53,0.06,0.85,2.8]],
["\u4ee3\u53f714","normal","Composed LAG",[0.43,0.77,0.13,0.39,0.12,0.8,0.02]],
["\u4ee3\u53f715","pro","\u51b7\u950b / Pro TAG",[0.24,0.72,0.1,0.34,0,0.72,0.02]],
["\u4ee3\u53f716","pro","\u730e\u624b / Pro LAG",[0.34,0.8,0.14,0.38,0,0.78,0.02]],
["\u4ee3\u53f717","normal","\u6162\u70ed\u578b",[0.21,0.39,0.016,0.35,0.14,0.48,0.3]],
["\u4ee3\u53f718","normal","\u8ddf\u98ce\u578b",[0.59,0.37,0.055,0.72,0.03,0.52,0.85]],
["\u4ee3\u53f719","normal","\u5927\u76f2\u9632\u5b88\u72c2",[0.66,0.46,0.065,0.88,0.04,0.57,0.95]],
["\u4ee3\u53f720","normal","\u6309\u94ae\u4f4d\u5f3a\u76d7",[0.49,0.86,0.21,0.31,0.03,0.68,0.7]],
["\u4ee3\u53f721","normal","\u8ddb\u5165\u7231\u597d\u8005",[0.74,0.12,0.012,0.82,0.09,0.32,0.55]],
["\u4ee3\u53f722","normal","\u8d85\u6c60\u7231\u597d\u8005",[0.4,0.84,0.19,0.45,0.02,1.55,1.35]],
["\u4ee3\u53f723","normal","\u5c0f\u7403\u6d3e",[0.37,0.52,0.065,0.5,0.16,0.28,0.25]],
["\u4ee3\u53f724","normal","\u6cb3\u724c\u6293\u8bc8\u578b",[0.33,0.43,0.025,0.86,0.11,0.58,0.4]],
["\u4ee3\u53f725","normal","\u7ffb\u724c\u6d6e\u52a8\u578b",[0.53,0.58,0.095,0.76,0.07,0.54,0.75]],
["\u4ee3\u53f726","normal","3-bet \u504f\u6267\u72c2",[0.38,0.93,0.24,0.29,0.01,1.05,1.6]],
["\u4ee3\u53f727","normal","\u5e7f\u64ad\u724c\u578b",[0.19,0.61,0,0.19,0,0.92,0.2]],
["\u4ee3\u53f728","normal","\u5468\u672b\u73a9\u5bb6",[0.63,0.31,0.045,0.69,0.05,0.46,1.1]],
["\u4ee3\u53f729","normal","\u9000\u4f11\u5927\u7237\u578b",[0.16,0.24,0.002,0.22,0.24,0.42,0.1]],
["\u4ee3\u53f730","normal","\u8868\u6f14\u578b",[0.57,0.88,0.29,0.58,0.18,1.18,2.2]],
["\u4ee3\u53f731","normal","\u95f7\u58f0\u53d1\u8d22\u578b",[0.22,0.64,0.022,0.28,0.48,0.7,0.15]],
["\u4ee3\u53f732","pro","\u8001\u6d3e TAG",[0.2,0.78,0.065,0.28,0.06,0.76,0.025]],
["\u4ee3\u53f733","pro","\u6570\u5b66\u6559\u6388\u578b",[0.27,0.75,0.055,0.33,0.03,0.63,0.005]],
["\u4ee3\u53f734","pro","\u9526\u6807\u8d5b\u51a0\u519b\u578b",[0.3,0.87,0.125,0.32,0.07,0.82,0.035]],
["\u4ee3\u53f735","pro","\u73b0\u91d1\u684c\u8001\u70ae",[0.29,0.81,0.095,0.4,0.13,0.86,0.03]],
["\u4ee3\u53f736","pro","\u7ebf\u4e0a\u8f6c\u578b\u578b",[0.35,0.91,0.155,0.35,0.02,0.7,0.045]],
["\u4ee3\u53f737","pro","\u51b7\u9177\u8bfb\u724c\u578b",[0.25,0.83,0.105,0.3,0.15,0.79,0.01]],
["\u4ee3\u53f738","pro","\u538b\u69a8\u578b LAG",[0.41,0.95,0.195,0.37,0.01,0.94,0.055]],
["\u4ee3\u53f739","pro","\u5e73\u8861\u5927\u5e08\u578b",[0.31,0.82,0.115,0.36,0.1,0.67,0.015]],
["\u4ee3\u53f740","pro","\u72d9\u51fb\u624b\u578b",[0.18,0.85,0.045,0.23,0.08,0.97,0.02]],
["\u4ee3\u53f741","pro","\u96f6\u60c5\u7eea\u578b",[0.26,0.79,0.075,0.31,0.04,0.69,0]],
["\u4ee3\u53f742","pro","\u53d8\u901f\u578b",[0.36,0.89,0.165,0.34,0.19,0.88,0.07]],
["\u4ee3\u53f743","pro","\u9677\u9631\u5927\u5e08\u578b",[0.23,0.77,0.085,0.38,0.82,0.83,0.025]],
["\u4ee3\u53f744","pro","\u4ef7\u503c\u673a\u5668\u578b",[0.28,0.9,0.035,0.27,0.02,1.02,0.01]],
["\u4ee3\u53f745","pro","\u9632\u5b88\u5927\u5e08\u578b",[0.32,0.76,0.08,0.49,0.09,0.61,0.02]],
["\u4ee3\u53f746","pro","\u5fc3\u7406\u6218\u578b",[0.39,0.93,0.215,0.39,0.23,0.91,0.08]]
].map(([id,kind,archetype,params])=>Object.freeze({id,name:id,kind,archetype,params:Object.freeze(params)}));
const DIFFICULTIES=[{"key": "novice", "name": "新手", "index": 40, "noise": 0.24, "tight": -0.06, "fishRatio": 0.6, "proDefault": 0, "proRange": [0, 0], "readsLevel": 0, "exploit": 0.4}, {"key": "starter", "name": "入门", "index": 51, "noise": 0.16, "tight": -0.02, "fishRatio": 0.45, "proDefault": 1, "proRange": [0, 1], "readsLevel": 1, "exploit": 0.6}, {"key": "intermediate", "name": "进阶", "index": 64, "noise": 0.1, "tight": 0.03, "fishRatio": 0.3, "proDefault": 2, "proRange": [1, 2], "readsLevel": 2, "exploit": 0.8}, {"key": "expert", "name": "高手", "index": 81, "noise": 0.06, "tight": 0.08, "fishRatio": 0.15, "proDefault": 3, "proRange": [2, 3], "readsLevel": 3, "exploit": 1}, {"key": "pro", "name": "职业", "index": 100, "noise": 0.03, "tight": 0.14, "fishRatio": 0, "proDefault": 4, "proRange": [3, 5], "readsLevel": 4, "exploit": 1.15}];
const ENGBASES=ROSTER46.map((e,i)=>Object.freeze({id:i,code:e.id,kind:e.kind,style:e.archetype,vpip:e.params[0],aggression:e.params[1],bluff:e.params[2],call:e.params[3],trap:e.params[4],size:e.params[5],tiltGain:e.params[6]}));
const SETTINGS_KEY="holdem-settings-v1";
let settings={preBB:[2.5,3,4,5],postPct:[33,50,66,100],difficultyKey:"intermediate",proCount:null};
try{let s=JSON.parse(localStorage.getItem(SETTINGS_KEY));if(s){if(Array.isArray(s.preBB)&&s.preBB.length)settings.preBB=s.preBB;if(Array.isArray(s.postPct)&&s.postPct.length)settings.postPct=s.postPct;if(DIFFICULTIES.some(d=>d.key===s.difficultyKey))settings.difficultyKey=s.difficultyKey;if(Number.isInteger(s.proCount)&&s.proCount>=0&&s.proCount<=8)settings.proCount=s.proCount}}catch(e){}

const BrainModule = (() => {
"use strict";

/**
 * 无 DOM、localStorage 或可变模块级对局状态。
 *
 * providerFor({
 *   seat,
 *   rosterId,             // ROSTER 中的字符串 id；也可传 base: rosterEntry
 *   humanSeat = 0,
 *   stats                 // 可选：恢复时的人类 {hands, vpip, pfr}
 * }) => (player, view) => action
 *
 * view：
 * {
 *   hole, board, street, pot, toCall, minRaiseTo,
 *   players: [{seat, stack, bet, total, folded, allin, inHand?}],
 *   button, bb,           // 也可放在 view.position 中
 *   highest?, minRaise?,  // 推荐提供原始值，尤其 minRaiseTo 被全下上限截断时
 *   mayRaise?,            // 可选 boolean；提供时以 engine 的合法性判断为准
 *   stats?                // 可选：当前已完成手数的 {hands, vpip, pfr}
 * }
 *
 * toCall 可以是封顶跟注额；原版 owed 优先使用 highest - player.bet，
 * highest 缺省时取 players 的最大 bet。
 * minRaiseTo 应为未按玩家筹码封顶的最小加注目标；若已封顶，须提供 minRaise。
 * 缺省 inHand 视为 true；未参与本手的座位应显式给出 inHand: false。
 *
 * observe 事件适配约定：
 *
 * {type: "handStart", players, stats?}
 *   players 至少提供 seat、stack、inHand；stack 是扣盲注前筹码。
 *   可同时提供 initial 表示明确的本手初始筹码。
 *
 * {type: "action", seat, street, action: {type, amount?}, owed}
 *   必须是 engine 已接受、完成合法化后的实际动作。
 *   owed 是执行前未按筹码封顶的最高下注差额。
 *   bet/raise 均代表原版 raise 分支；amount 是该街累计目标额。
 *
 * {type: "handEnd", showdown, players, winners}
 *   players 是退款、分池完成且尚未清理本手标记的快照：
 *     {seat, stack, folded, won?}
 *   winners 是获得任一有竞争底池的座位数组，不包含只收回未跟注款的人。
 *
 * 每个事件必须按执行顺序且只投递一次。事件名及字段是本模块显式定义的
 * 适配格式；题面没有给定 engine 事件 schema，不能假设任意事件流可直接兼容。
 *
 * 同一座位换机器人时重新调用 providerFor，并传入新的 rosterId。
 * 同一手的一次真实决策调用后，应投递对应 action，再请求下一次决策。
 */

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const PARAM_KEYS = [
  "vpip", "aggression", "bluff", "call", "trap", "size", "tiltGain"
];

const READ_DEFAULTS = Object.freeze({
  faced: 0,
  fold: 0,
  call: 0,
  bigN: 0,
  bigC: 0,
  rfF: 0,
  rfN: 0
});

// 未传 difficulty 时直接返回原概率，不改变旧行为或随机数消耗。
function exploitProbability(p, difficulty) {
  return difficulty ? Math.min(.95, p * difficulty.exploit) : p;
}

function rank(cards) {
  const counts = Array(15).fill(0);
  const suits = [[], [], [], []];

  for (const c of cards) {
    const r = c % 13 + 2;
    counts[r]++;
    suits[Math.floor(c / 13)].push(r);
  }

  const rs = [];
  for (let r = 14; r >= 2; r--) {
    if (counts[r]) rs.push(r);
  }

  function straight(a) {
    const mask = new Set(a);
    if (mask.has(14)) mask.add(1);

    for (let top = 14; top >= 5; top--) {
      let ok = true;
      for (let j = 0; j < 5; j++) {
        if (!mask.has(top - j)) {
          ok = false;
          break;
        }
      }
      if (ok) return top;
    }
    return 0;
  }

  function score(cat, ks) {
    let n = cat;
    for (let i = 0; i < 5; i++) n = n * 15 + (ks[i] || 0);
    return n;
  }

  const flush = suits.find(a => a.length >= 5);
  if (flush) {
    const st = straight(flush);
    if (st) return score(8, [st]);
  }

  const quads = rs.filter(r => counts[r] === 4);
  const trips = rs.filter(r => counts[r] >= 3);
  const pairs = rs.filter(r => counts[r] >= 2);

  if (quads.length) {
    return score(7, [
      quads[0],
      ...rs.filter(r => r !== quads[0]).slice(0, 1)
    ]);
  }

  if (trips.length) {
    const p = pairs.find(r => r !== trips[0]);
    if (p) return score(6, [trips[0], p]);
  }

  if (flush) return score(5, flush.sort((a, b) => b - a).slice(0, 5));

  const st = straight(rs);
  if (st) return score(4, [st]);

  if (trips.length) {
    return score(3, [
      trips[0],
      ...rs.filter(r => r !== trips[0]).slice(0, 2)
    ]);
  }

  if (pairs.length >= 2) {
    return score(2, [
      pairs[0],
      pairs[1],
      ...rs.filter(r => r !== pairs[0] && r !== pairs[1]).slice(0, 1)
    ]);
  }

  if (pairs.length) {
    return score(1, [
      pairs[0],
      ...rs.filter(r => r !== pairs[0]).slice(0, 3)
    ]);
  }

  return score(0, rs.slice(0, 5));
}

function preScore(hole) {
  const a = hole[0] % 13 + 2;
  const b = hole[1] % 13 + 2;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  const gap = hi - lo;

  if (a === b) return clamp(.44 + (hi - 2) * .045, 0, 1);

  let v = .12 + (hi - 2) * .032 + (lo - 2) * .018;

  if (Math.floor(hole[0] / 13) === Math.floor(hole[1] / 13)) v += .08;

  if (gap === 1) v += .06;
  else if (gap === 2) v += .025;
  else if (gap > 4) v -= .07;

  if (hi === 14 && lo <= 5) v += .035;
  return clamp(v, 0, 1);
}

function equity(hole, community, n, samples = 250, tight = 0) {
  if (n < 1) return 1;

  const known = new Set([...hole, ...community]);
  const pool = [];

  for (let c = 0; c < 52; c++) {
    if (!known.has(c)) pool.push(c);
  }

  let sum = 0;

  for (let t = 0; t < samples; t++) {
    const a = pool.slice();
    const need = 5 - community.length + 2 * n;

    if (tight > 0) {
      // tight 筛选可能使用 need 之后的替换牌，必须洗完整个未知牌堆。
      // 后续从完整洗匀的尾部无放回重采样，不从有序小牌尾部补牌。
      for (let k = a.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [a[k], a[j]] = [a[j], a[k]];
      }
    } else {
      for (let k = 0; k < need; k++) {
        const j = k + Math.floor(Math.random() * (a.length - k));
        [a[k], a[j]] = [a[j], a[k]];
      }
    }

    const b = community.concat(a.slice(0, 5 - community.length));
    let idx = 5 - community.length;
    const mine = rank([...hole, ...b]);
    let ties = 1;
    let lost = false;

    for (let o = 0; o < n; o++) {
      let c1 = a[idx];
      let c2 = a[idx + 1];

      if (tight > 0) {
        let tries = 0;

        while (
          tries < 3 &&
          Math.random() >
            Math.min(1, Math.pow(preScore([c1, c2]), .6 + tight * 2) * 1.2)
        ) {
          const s1 = need + tries * 2;
          const s2 = s1 + 1;
          if (s2 >= a.length) break;

          [a[idx], a[s1]] = [a[s1], a[idx]];
          [a[idx + 1], a[s2]] = [a[s2], a[idx + 1]];
          c1 = a[idx];
          c2 = a[idx + 1];
          tries++;
        }
      }

      const s = rank([c1, c2, ...b]);
      idx += 2;

      if (s > mine) {
        lost = true;
        break;
      }
      if (s === mine) ties++;
    }

    if (!lost) sum += 1 / ties;
  }

  return sum / samples;
}

function boardWet(b) {
  if (!b || b.length < 3) return 0;

  const suits = {};
  const ranks = b.map(c => c % 13 + 2);

  b.forEach(c => {
    const s = Math.floor(c / 13);
    suits[s] = (suits[s] || 0) + 1;
  });

  const maxSuit = Math.max(...Object.values(suits));
  const uniq = [...new Set(ranks)].sort((x, y) => x - y);
  const span = uniq.length >= 3
    ? (
      uniq[uniq.length - 1] - uniq[0] <= 4
        ? 1
        : uniq[uniq.length - 1] - uniq[0] <= 6 ? .5 : 0
    )
    : 0;

  let wet = 0;
  if (maxSuit >= 3) wet += .45;
  else if (maxSuit === 2) wet += .2;

  wet += span * .35;
  if (ranks.length - uniq.length > 0) wet += .15;

  return clamp(wet, 0, 1);
}

function inHand(p) {
  return p.inHand !== false;
}

function canAct(p) {
  return inHand(p) && !p.folded && !p.allin;
}

function contenders(players) {
  return players.filter(p => inHand(p) && !p.folded);
}

function normalizeBase(entry, index) {
  const base = {
    id: index,
    code: entry.id,
    name: entry.name,
    kind: entry.kind,
    style: entry.archetype || entry.name
  };

  PARAM_KEYS.forEach((key, i) => {
    base[key] = entry.params[i];
  });

  return Object.freeze(base);
}

function newState(base = null) {
  return {
    base,
    live: { bluff: 1, tilt: 0, confidence: 0 },
    bluffs: [],
    rfp: false,
    trapStreet: -1,
    _facedTurn: false,
    _sr: 0,
    _srStreet: -1,
    initial: undefined,
    pending: null
  };
}

/**
 * 原版 dyn 的展示状态判断；漂移的更新由 observe 完成。
 * player 可以是 {base, live}，不读 engine 玩家对象之外的全局状态。
 */
function dyn(player) {
  if (!player.base) return "";
  if (player.live.tilt > .55) return "上头中";
  if (player.live.bluff < .78) return "收紧了";
  if (player.live.confidence > .1 || player.live.bluff > 1.25) {
    return "手风正顺";
  }
  return player.base.style;
}

function mayRaise(p, ctx) {
  if (typeof ctx.raiseAllowed === "boolean") return ctx.raiseAllowed;

  return (
    canAct(p) &&
    p.bet + p.stack > ctx.highest &&
    !ctx.acted.has(p.seat) &&
    ctx.players.some(q => q.seat !== p.seat && canAct(q))
  );
}

function proDecision(p, ctx) {
  const { board, street, highest, minRaise, button, players } = ctx;
  const difficulty = ctx.difficulty;
  const b = p.base;
  const opps = contenders(players).filter(q => q.seat !== p.seat).length;
  const pot = ctx.pot;
  const owed = Math.max(0, highest - p.bet);
  const price = Math.min(owed, p.stack);

  const posIdx = ((p.seat - button) % 9 + 9) % 9;
  const early = posIdx === 3 || posIdx === 4;
  const late = posIdx === 0 || posIdx === 7 || posIdx === 8;

  const rHi = Math.max(p.hole[0] % 13 + 2, p.hole[1] % 13 + 2);
  const rLo = Math.min(p.hole[0] % 13 + 2, p.hole[1] % 13 + 2);

  const openTo = Math.max(highest + minRaise, Math.round(2 * (2 + b.size * 2)));
  const betTo = f => Math.min(
    p.bet + p.stack,
    highest + Math.max(minRaise, Math.round((pot + owed) * f))
  );

  if (street === 0) {
    const quality = difficulty
      ? clamp(
        preScore(p.hole) - difficulty.tight +
          (Math.random() * 2 - 1) * difficulty.noise * .5,
        0,
        1
      )
      : preScore(p.hole);
    const eq = clamp(.12 + quality * .7 - (opps - 1) * .025, .04, .9);
    const openQ = (early ? .60 : late ? .50 : .55) +
      (b.id === 14 ? .04 : b.id === 15 ? -.03 : 0);
    const facing = highest > 2;

    if (mayRaise(p, ctx)) {
      if (quality >= .68) {
        return {
          type: "raise",
          to: Math.min(
            p.bet + p.stack,
            facing
              ? Math.max(highest + minRaise, Math.round(highest * 2.5))
              : openTo
          ),
          eq
        };
      }

      if (!facing && quality >= openQ) {
        return { type: "raise", to: Math.min(p.bet + p.stack, openTo), eq };
      }

      if (
        facing &&
        rHi === 14 &&
        quality >= .55 &&
        Math.random() < exploitProbability(.3, difficulty)
      ) {
        return {
          type: "raise",
          to: Math.min(
            p.bet + p.stack,
            Math.max(highest + minRaise, Math.round(highest * 2.5))
          ),
          eq
        };
      }
    }

    if (!owed) return { type: "check", eq };
    if (quality >= (facing ? .58 : openQ - .05)) return { type: "call", eq };
    if (price <= 2 && quality >= .42) return { type: "call", eq };

    return { type: "fold", eq };
  }

  const tight = .26 + street * .10 +
    (owed > 0 ? .20 : 0) +
    (owed > pot * .5 ? .10 : 0);

  if (street === 2 && owed > 0) p._facedTurn = true;

  let eq = equity(
    p.hole,
    board,
    opps,
    300,
    difficulty
      ? clamp(tight + difficulty.tight, -.1, .95)
      : clamp(tight, 0, .8)
  );
  if (difficulty) {
    eq = clamp(eq + (Math.random() * 2 - 1) * difficulty.noise * .5, 0, 1);
  }
  const wet = boardWet(board);
  const odds = price / Math.max(1, pot + price);
  const topB = Math.max(...board.map(c => c % 13 + 2));
  const strongMade = (rHi === rLo && rHi > topB) ||
    (rHi === topB && rLo >= 13);

  let vt = .57 + opps * .02 - (strongMade ? .04 : 0);

  if (
    ctx.humanPresent &&
    ctx.bigCallRate !== null &&
    ctx.bigCallRate > .55
  ) {
    vt -= .06;
  }

  let bluffP = b.bluff * (wet > .55 ? .6 : 1) *
    (b.id === 14 ? .8 : b.id === 15 ? 1.15 : 1);

  if (
    ctx.humanPresent &&
    ctx.bigCallRate !== null &&
    ctx.bigCallRate > .55
  ) {
    bluffP *= .5;
  }

  if (ctx.humanPresent && ctx.rfRate !== null && ctx.rfRate > .45) {
    bluffP *= 1.4;
  }

  if (!owed) {
    if (eq > .85 && street < 3 && p.trapStreet < 0 && Math.random() < .25) {
      p.trapStreet = street;
      return { type: "check", eq };
    }

    if (eq > vt) {
      return {
        type: "raise",
        to: betTo(
          (street === 3 ? .75 : .55 + wet * .2) * (b.id === 14 ? 1.1 : 1)
        ),
        eq
      };
    }

    if (
      p.rfp &&
      street === 1 &&
      (opps <= 2 || eq >= .25) &&
      Math.random() < exploitProbability(.62 - wet * .3, difficulty)
    ) {
      return { type: "raise", to: betTo(.45), eq };
    }

    if (
      street === 3 &&
      eq < .3 &&
      opps === 1 &&
      !p._facedTurn &&
      Math.random() < exploitProbability(bluffP * .6, difficulty)
    ) {
      return { type: "raise", to: betTo(.75), eq };
    }

    if (
      street < 3 &&
      eq >= .2 &&
      eq < .45 &&
      Math.random() < exploitProbability(bluffP, difficulty)
    ) {
      return { type: "raise", to: betTo(.5), eq };
    }

    return { type: "check", eq };
  }

  if (eq > .85 && street < 3 && p.trapStreet < 0 && Math.random() < .2) {
    p.trapStreet = street;
    return { type: "call", eq };
  }

  if (eq > vt + .12 && mayRaise(p, ctx)) {
    return { type: "raise", to: betTo(.7), eq };
  }

  if (eq >= odds + .03) return { type: "call", eq };

  if (
    eq < .22 &&
    street < 3 &&
    mayRaise(p, ctx) &&
    Math.random() < exploitProbability(bluffP * .7, difficulty)
  ) {
    return { type: "raise", to: betTo(.65), eq };
  }

  return { type: "fold", eq };
}

function botDecision(p, ctx, reads) {
  const { board, street, highest, minRaise, button, players, stats, bb } = ctx;
  const difficulty = ctx.difficulty;
  const readsLevel = difficulty ? difficulty.readsLevel : 2;
  const facedMinimum = readsLevel >= 4 ? 14 : 20;
  const bigMinimum = readsLevel >= 4 ? 4 : 6;
  const rfMinimum = readsLevel >= 4 ? 6 : 8;
  const b = p.base;
  const L = readsLevel >= 2
    ? p.live
    : { bluff: 1, tilt: 0, confidence: 0 };
  const opps = contenders(players).length - 1;
  const owed = Math.max(0, highest - p.bet);
  const price = Math.min(owed, p.stack);
  const pot = ctx.pot;
  const odds = price / (pot + price || 1);

  const vp = clamp(b.vpip + L.tilt * .13 + L.confidence, .07, .96);
  const ag = clamp(b.aggression + L.tilt * .18, .03, .98);
  const human = players.find(q => q.seat === ctx.humanSeat);
  const humanPresent = Boolean(human && inHand(human) && !human.folded);

  const read = readsLevel >= 2 && reads.faced >= facedMinimum
    ? clamp(
      1 +
        (reads.fold / reads.faced - .45) * 1.3 -
        (reads.call / reads.faced - .35) * .8,
      .5,
      1.5
    )
    : 1;

  let bluff = b.bluff * L.bluff * (1 + L.tilt * .55) *
    (humanPresent ? read : 1);

  const rfSample = reads.rfF + reads.rfN;
  const rfRate = readsLevel >= 2 && rfSample >= rfMinimum
    ? reads.rfF / rfSample
    : null;
  const bigCallRate = readsLevel >= 1 && reads.bigN >= bigMinimum
    ? reads.bigC / reads.bigN
    : null;

  if (humanPresent && rfRate !== null && rfRate > .45) bluff *= 1.35;
  if (humanPresent && bigCallRate !== null && bigCallRate > .55) bluff *= .55;

  if (b.kind === "pro") {
    return proDecision(p, { ...ctx, humanPresent, rfRate, bigCallRate });
  }

  let eq;
  let quality;

  const posIdx = ((p.seat - button) % 9 + 9) % 9;
  const early = posIdx === 3 || posIdx === 4;
  const late = posIdx === 0 || posIdx === 7 || posIdx === 8;

  if (street === 0) {
    quality = difficulty
      ? clamp(
        preScore(p.hole) - difficulty.tight +
          (Math.random() * 2 - 1) * difficulty.noise * .5,
        0,
        1
      )
      : preScore(p.hole);
    eq = clamp(.12 + quality * .7 - (opps - 1) * .025, .04, .9);

    const cutoff = .80 - vp * .67 + (early ? .055 : late ? -.035 : 0);
    const costly = owed > 6 ? Math.min(.23, Math.log2(owed / 2) * .045) : 0;

    if (owed && quality < cutoff + costly && Math.random() > vp * .12) {
      return { type: "fold", eq };
    }

    const rHi = Math.max(p.hole[0] % 13 + 2, p.hole[1] % 13 + 2);
    const rLo = Math.min(p.hole[0] % 13 + 2, p.hole[1] % 13 + 2);
    const isPair = p.hole[0] % 13 === p.hole[1] % 13;

    const pS = isPair && rHi >= 13;
    const pA = (isPair && rHi === 12) || (rHi === 14 && rLo === 13);
    const pB = (isPair && rHi === 11) || (rHi === 14 && rLo === 12);

    const goRaise = pS ||
      (pA && (highest <= 12 || Math.random() < .55)) ||
      (pB && highest <= 12 && Math.random() < .9);

    if (goRaise && mayRaise(p, ctx)) {
      let target;

      if (highest <= 2) {
        target = Math.max(highest + minRaise, Math.round(2 * (2 + b.size * 2)));
      } else if (highest <= 12) {
        target = Math.max(highest + minRaise * 2, Math.round(highest * 2.4));
      } else {
        target = Math.max(highest + minRaise, Math.round(highest * 2.1));
      }

      return { type: "raise", to: Math.min(p.bet + p.stack, target), eq };
    }

    const bigBlind = players.find(q => q.seat === bb);
    const limpers = players.filter(q =>
      q.seat !== p.seat &&
      inHand(q) &&
      !q.folded &&
      q.bet >= 2
    ).length - (bigBlind && inHand(bigBlind) ? 1 : 0);

    if (
      highest <= 2 &&
      limpers >= 1 &&
      mayRaise(p, ctx) &&
      quality >= .52 - ag * .12 &&
      Math.random() <
        clamp(.25 + ag * .65, 0, .9) *
        (
          readsLevel >= 2 &&
          stats.hands >= 25 &&
          (stats.vpip - stats.pfr) / stats.hands > .25
            ? 1.3
            : 1
        )
    ) {
      return {
        type: "raise",
        to: Math.min(
          p.bet + p.stack,
          Math.max(
            highest + minRaise,
            Math.round(2 * (3 + b.size * 2) + limpers * 2)
          )
        ),
        eq
      };
    }
  } else {
    const tight = .18 + street * .09 +
      (owed > 0 ? .22 : 0) +
      (owed > pot * .5 ? .15 : 0) +
      (opps === 1 ? .08 : 0) +
      (owed > pot ? .08 : 0);

    eq = equity(
      p.hole,
      board,
      opps,
      250,
      difficulty
        ? clamp(tight + difficulty.tight, -.1, .95)
        : clamp(tight, 0, .85)
    );
    if (difficulty) {
      eq = clamp(eq + (Math.random() * 2 - 1) * difficulty.noise * .5, 0, 1);
    }
  }

  let madeCat = 0;

  if (street > 0 && board.length >= 3) {
    madeCat = Math.floor(rank([...p.hole, ...board]) / 15 ** 5);
  }

  const thin = (
    humanPresent &&
    readsLevel >= 2 &&
    reads.faced >= facedMinimum &&
    reads.call / reads.faced > .55
      ? .055
      : 0
  ) + (
    humanPresent &&
    bigCallRate !== null &&
    bigCallRate > .55
      ? .05
      : 0
  );

  let valueThreshold = street === 0
    ? .66
    : clamp(.56 + opps * .025 - thin, .52, .80);

  if (madeCat === 1 && street > 0) valueThreshold += .08;
  if (b.id === 3) valueThreshold += .12;
  if (b.id === 11) valueThreshold += .06;

  const monster = eq > .78;
  const trap = monster &&
    p.trapStreet < 0 &&
    street === 1 &&
    Math.random() < b.trap;

  if (trap) p.trapStreet = street;

  const selective = b.id === 13 ? (!owed && opps <= 2 ? 1 : .22) : 1;
  const wet = street > 0 ? boardWet(board) : 0;
  const cbetBoost = p.rfp && street === 1 ? 1.3 - wet * .75 : 1;

  let doBluff = eq < .34 &&
    Math.random() < exploitProbability(
      bluff * selective * cbetBoost / (1 + Math.max(0, opps - 1) * .28),
      difficulty
    );

  if (street === 3 && (opps > 2 || Math.random() < .45)) doBluff = false;
  if (madeCat >= 1) doBluff = false;

  let strongMade = false;

  if (street > 0 && board.length >= 3) {
    const topB = Math.max(...board.map(c => c % 13 + 2));
    const h1 = p.hole[0] % 13 + 2;
    const h2 = p.hole[1] % 13 + 2;

    strongMade = (h1 === h2 && h1 > topB) ||
      (Math.max(h1, h2) === topB && Math.min(h1, h2) >= 13);
  }

  let value = eq > (strongMade ? valueThreshold - .05 : valueThreshold) &&
    Math.random() < (
      street > 0 && !strongMade && madeCat < 2
        ? exploitProbability(ag, difficulty)
        : (strongMade ? Math.max(ag, .62) : ag)
    );

  if (!value && madeCat >= 2 && Math.random() < (madeCat >= 3 ? .85 : .70)) {
    value = true;
  }

  if (!value && strongMade && Math.random() < .6) value = true;
  if (b.id === 11) doBluff = false;

  if (
    !owed &&
    street >= 2 &&
    !strongMade &&
    madeCat < 2 &&
    eq >= .34 &&
    eq <= .58 &&
    Math.random() < .5
  ) {
    return { type: "check", eq };
  }

  if (
    mayRaise(p, ctx) &&
    !trap &&
    (value || doBluff) &&
    !((p._srStreet === street ? p._sr || 0 : 0) >= 1 && madeCat < 3)
  ) {
    let fraction = b.size * (.8 + Math.random() * .4) * (1 + L.tilt * .18);

    if (street > 0) fraction *= value ? 1 + wet * .25 : 1 - wet * .1;
    if (street === 3 && doBluff && !value) fraction = Math.max(fraction, .7);

    let target = highest + Math.max(minRaise, Math.round((pot + owed) * fraction));

    if (street === 0) {
      target = Math.max(highest + minRaise, Math.round(2 * (2 + b.size * 2)));
    }

    return { type: "raise", to: Math.min(p.bet + p.stack, target), eq };
  }

  if (!owed) return { type: "check", eq };

  if (street === 0) {
    const limit = .81 - vp * .66 +
      (owed > 8 ? .10 : 0) +
      (early ? .04 : late ? -.03 : 0);

    const skill = (ag + (1 - vp)) / 2;

    if (quality >= limit || (price <= 2 && Math.random() < vp)) {
      if (
        highest <= 2 &&
        mayRaise(p, ctx) &&
        skill > .45 &&
        quality >= .5 &&
        Math.random() < .45
      ) {
        return {
          type: "raise",
          to: Math.min(
            p.bet + p.stack,
            Math.max(highest + minRaise, Math.round(2 * (2 + b.size * 2)))
          ),
          eq
        };
      }

      return { type: "call", eq };
    }

    return { type: "fold", eq };
  }

  if (street > 0 && madeCat < 3 && !trap) {
    if (
      (p._srStreet === street ? p._sr || 0 : 0) >= 1 &&
      madeCat <= 1 &&
      eq < .68
    ) {
      return { type: "fold", eq };
    }

    const streetCapBB = (madeCat === 2 ? 30 : strongMade ? 26 : 16) *
      (b.call > .8 ? 1.4 : b.call < .2 ? .7 : 1);

    if (owed > streetCapBB * 2 && eq < .62) return { type: "fold", eq };

    if (street === 3 && madeCat <= 1 && owed > pot * .4 && eq < .58) {
      return { type: "fold", eq };
    }
  }

  let threshold = odds + .075 - b.call * .16 - L.tilt * .065;

  if (b.id === 3) threshold = Math.max(odds + .16, .46);
  if (b.id === 9) threshold = odds + .015;
  if (b.id === 11) threshold = Math.max(odds + .06, .28);
  if (b.id === 4 || b.id === 10) threshold += owed > pot * .45 ? .18 : -.035;
  if (owed > pot * .8) threshold += .055 * (1 - b.call);

  threshold = clamp(threshold, .035, .92);

  return { type: eq >= threshold || trap ? "call" : "fold", eq };
}

function createBrain({ roster = ROSTER, reads = {}, difficulty } = {}) {
  const normalizedDifficulty = difficulty === undefined
    ? null
    : Object.freeze({
      tight: Number.isFinite(difficulty?.tight) ? difficulty.tight : 0,
      readsLevel: Number.isFinite(difficulty?.readsLevel)
        ? Math.max(0, Math.floor(difficulty.readsLevel))
        : 2,
      exploit: Number.isFinite(difficulty?.exploit)
        ? Math.max(0, difficulty.exploit)
        : 1,
      noise: Number.isFinite(difficulty?.noise)
        ? Math.max(0, difficulty.noise)
        : 0
    });

  // 保留调用方 reads 对象身份，便于调用方持久化；只补齐缺失计数。
  for (const [key, value] of Object.entries(READ_DEFAULTS)) {
    if (reads[key] === undefined) reads[key] = value;
  }

  const bases = new Map(
    roster.map((entry, index) => [entry.id, normalizeBase(entry, index)])
  );

  const states = new Map();
  let humanSeat = 0;
  let humanSeatConfigured = false;
  let stats = { hands: 0, vpip: 0, pfr: 0 };
  let handRaised = false;
  let handVpip = false;
  let handPfr = false;
  let humanFolded = false;

  let roundStreet = -1;
  let roundHighest = 0;
  let roundMinRaise = 2;
  const acted = new Set();

  function stateFor(seat) {
    if (!states.has(seat)) states.set(seat, newState());
    return states.get(seat);
  }

  function syncStats(value) {
    if (!value) return;
    stats = {
      hands: value.hands,
      vpip: value.vpip,
      pfr: value.pfr
    };
  }

  function enterStreet(street) {
    if (roundStreet === street) return;
    roundStreet = street;
    roundHighest = street === 0 ? 2 : 0;
    roundMinRaise = 2;
    acted.clear();
  }

  function providerFor(seatCtx) {
    const {
      seat,
      rosterId = seatCtx.base?.id,
      humanSeat: requestedHumanSeat = 0
    } = seatCtx;

    if (humanSeatConfigured && humanSeat !== requestedHumanSeat) {
      throw new Error("同一个 brain 的所有 provider 必须使用相同 humanSeat");
    }

    humanSeat = requestedHumanSeat;
    humanSeatConfigured = true;

    if (seatCtx.stats) syncStats(seatCtx.stats);

    const base = bases.get(rosterId);
    if (!base) throw new Error(`未知 rosterId：${String(rosterId)}`);

    const old = states.get(seat);

    if (!old || old.base?.code !== base.code) {
      const state = newState(base);
      // 已收到 handStart 后才绑定新机器人时，保留该座位的初始筹码。
      if (old) state.initial = old.initial;
      states.set(seat, state);
    }

    // 捕获当前绑定，防止座位换人后继续误用旧 provider。
    const boundState = states.get(seat);

    return function decisionProvider(player, view) {
      if (player.seat !== seat) throw new Error("provider 与玩家 seat 不匹配");
      if (states.get(seat) !== boundState) {
        throw new Error("该座位已换人，请使用最新 provider");
      }

      if (view.stats) syncStats(view.stats);
      enterStreet(view.street);

      const snapshot = view.players.find(q => q.seat === seat);
      if (!snapshot) throw new Error("view.players 缺少当前玩家");

      const highest = view.highest ??
        Math.max(0, ...view.players.map(q => q.bet));

      const minRaise = view.minRaise ?? (view.minRaiseTo - highest);

      if (!(minRaise > 0)) {
        throw new Error("需要未封顶的 minRaiseTo 或正数 minRaise");
      }

      const button = view.button ?? view.position?.button;
      const bb = view.bb ?? view.position?.bb;

      if (!Number.isInteger(button) || !Number.isInteger(bb)) {
        throw new Error("view 需要 button 和 bb 座位号");
      }

      roundHighest = highest;
      roundMinRaise = minRaise;

      // 只复制快照，并将策略私有状态合入局部对象；不修改 player/view。
      const p = {
        ...snapshot,
        hole: view.hole,
        base: boundState.base,
        live: boundState.live,
        rfp: boundState.rfp,
        trapStreet: boundState.trapStreet,
        _facedTurn: boundState._facedTurn,
        _sr: boundState._sr,
        _srStreet: boundState._srStreet
      };

      const ctx = {
        board: view.board,
        street: view.street,
        pot: view.pot,
        highest,
        minRaise,
        button,
        bb,
        players: view.players,
        humanSeat,
        stats,
        acted,
        raiseAllowed: view.mayRaise,
        difficulty: normalizedDifficulty
      };

      const result = botDecision(p, ctx, reads);

      boundState.trapStreet = p.trapStreet;
      boundState._facedTurn = p._facedTurn;
      boundState.pending = {
        street: view.street,
        eq: result.eq
      };

      // 原版没有下注时也返回 raise；保留此类型，amount 原样映射 to。
      // engine 已约定同时接受 bet 和 raise。
      if (result.type === "raise") {
        return { type: "raise", amount: result.to };
      }

      return { type: result.type };
    };
  }

  function observe(evt) {
    if (evt.type === "handStart") {
      if (evt.stats) syncStats(evt.stats);

      handRaised = false;
      handVpip = false;
      handPfr = false;
      humanFolded = false;

      roundStreet = -1;
      enterStreet(0);

      for (const p of evt.players) {
        const s = stateFor(p.seat);
        s.initial = p.initial ?? p.stack;
        s.bluffs = [];
        s.rfp = false;
        s.trapStreet = -1;
        s._facedTurn = false;
        s.pending = null;

        // 与原版相同，_sr 不必逐手清零：由 _srStreet 区分街次。
        // 每手仍会从翻牌前开始；真实首个加注会重新建立该街计数。
        s.live.bluff = 1 + (s.live.bluff - 1) * .94;
        s.live.tilt *= .79;
        s.live.confidence *= .80;
      }

      return;
    }

    if (evt.type === "action") {
      const { seat, street, owed } = evt;
      const action = evt.action;
      const type = action.type;
      const isRaise = type === "raise" || type === "bet";

      enterStreet(street);

      const s = stateFor(seat);

      if (seat === humanSeat && owed > 0) {
        reads.faced++;
        if (type === "fold") reads.fold++;
        if (type === "call") reads.call++;

        if (street > 0 && owed >= 24) {
          reads.bigN++;
          if (type === "call") reads.bigC++;
        }
      }

      if (seat === humanSeat) {
        if (type === "fold") humanFolded = true;

        if (street === 0 && (isRaise || type === "call")) {
          handVpip = true;
        }

        if (street === 0 && isRaise) handPfr = true;
        if (isRaise) handRaised = true;
      }

      if (s.base?.kind === "pro" && street === 2 && owed > 0) {
        s._facedTurn = true;
      }

      if (isRaise) {
        const increase = action.amount - roundHighest;

        if (increase >= roundMinRaise) {
          roundMinRaise = increase;
          acted.clear();
        }

        roundHighest = action.amount;

        for (const [otherSeat, other] of states) {
          if (otherSeat === seat) continue;

          for (const bluff of other.bluffs) {
            if (!bluff.penalized) {
              other.live.bluff = clamp(other.live.bluff * .85, .4, 1.8);
              bluff.penalized = true;
            }
          }
        }

        if (street === 0) s.rfp = true;

        s._sr = s._srStreet === street ? (s._sr || 0) + 1 : 1;
        s._srStreet = street;

        if (
          s.base &&
          s.pending?.street === street &&
          s.pending.eq < .34
        ) {
          s.bluffs.push({ street, penalized: false });
        }
      }

      acted.add(seat);
      s.pending = null;
      return;
    }

    if (evt.type === "handEnd") {
      const winners = new Set(evt.winners);
      const human = evt.players.find(p => p.seat === humanSeat);

      if (handRaised) {
        if (human?.folded ?? humanFolded) reads.rfF++;
        else reads.rfN++;
      }

      for (const p of evt.players) {
        const s = states.get(p.seat);
        if (!s?.base) continue;

        const net = p.stack - s.initial;

        if (net <= -50) {
          s.live.tilt = clamp(
            s.live.tilt + Math.min(1.7, -net / 100) * s.base.tiltGain,
            0,
            3
          );
        }

        if (net >= 50) {
          s.live.confidence = clamp(
            s.live.confidence + (s.base.vpip > .4 ? .045 : -.025),
            -.1,
            .16
          );
        }

        for (const bluff of s.bluffs) {
          if (!evt.showdown && winners.has(p.seat)) {
            s.live.bluff = clamp(s.live.bluff + .08, .4, 1.8);
          } else if (!winners.has(p.seat) && !bluff.penalized) {
            s.live.bluff = clamp(s.live.bluff * .79, .4, 1.8);
          }
        }

        s.pending = null;
      }

      stats.hands++;
      if (handVpip) stats.vpip++;
      if (handPfr) stats.pfr++;
    }
  }

  function dynFor(seat) {
    const s = states.get(seat);
    return s && s.base ? dyn({ base: s.base, live: s.live }) : "";
  }

  return { providerFor, observe, dynFor };
}
return { createBrain };
})();
// ===== 决策胶水：练习版引擎状态 <-> brain provider/observe（只做字段映射与事件投递，无决策逻辑） =====
let brain=null,brainReadsRef=null,brainDiffKey=null,providers={};
function currentDifficulty(){return DIFFICULTIES.find(d=>d.key===settings.difficultyKey)||DIFFICULTIES[2]}
function ensureBrain(){
if(brain&&brainReadsRef===reads&&brainDiffKey===settings.difficultyKey)return;
brain=BrainModule.createBrain({roster:ROSTER46,reads,difficulty:currentDifficulty()});
brainReadsRef=reads;brainDiffKey=settings.difficultyKey;providers={};
}
function refreshProviders(){
for(let i=1;i<9;i++)providers[i]=brain.providerFor({seat:i,base:ROSTER46[players[i].base.id],humanSeat:0,stats:{hands:stats.hands,vpip:stats.vpip,pfr:stats.pfr}});
}
function decide(p){
let view={hole:p.hole,board,street,pot:potTotal(),toCall:Math.max(0,highest-p.bet),highest,minRaise,minRaiseTo:highest+minRaise,mayRaise:mayRaise(p),players:players.map(q=>({seat:q.seat,stack:q.stack,bet:q.bet,total:q.total,folded:q.folded,allin:q.allin,inHand:q.inHand})),button,bb,stats:{hands:stats.hands,vpip:stats.vpip,pfr:stats.pfr}};
let d=providers[p.seat](p,view);
return {type:d.type,to:d.amount||0,eq:1};
}
function isFishBase(b){return b.kind!=="pro"&&(b.vpip>=.5||b.call>=.8)}
function drawLineup(slots,seatedBases){
let diff=currentDifficulty(),proTarget=settings.proCount!=null?settings.proCount:diff.proDefault,fishTarget=Math.min(8-proTarget,Math.round(8*diff.fishRatio));
let used=new Set(seatedBases.map(b=>b.id)),pool=ENGBASES.filter(b=>!used.has(b.id));
let pros=shuffle(pool.filter(b=>b.kind==="pro")),fish=shuffle(pool.filter(isFishBase)),reg=shuffle(pool.filter(b=>b.kind!=="pro"&&!isFishBase(b)));
let proSeats=seatedBases.filter(b=>b.kind==="pro").length,fishSeats=seatedBases.filter(isFishBase).length,out=[];
while(out.length<slots){
let nxt=null;
if(proSeats<proTarget&&pros.length){nxt=pros.pop();proSeats++}
else if(fishSeats<fishTarget&&fish.length){nxt=fish.pop();fishSeats++}
else if(reg.length)nxt=reg.pop();
else if(pros.length){nxt=pros.pop();proSeats++}
else if(fish.length){nxt=fish.pop();fishSeats++}
if(!nxt)break;
out.push(nxt);
}
return out;
}
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
const EMOJIS=["🦅","🐕","🐷","🗿","🐟","🎭","🕷️","⚖️","🦊","🤖","🐣","👨","🌋","❄️","🎯","♠️","🐺","🦁","🐯","🦈","🐙","🦉","🐴","🦄","🐲","🦂","🐌","🦋","🐢","🦎","🐳","🦩","🦜","🐿️","🦔","🌵","🍀","🔥","💎","🎲","🃏","👑","⚡","🌊","🏔️","🌙"];
function fmtBB(n){let v=n/2;return (Number.isInteger(v)?v:v.toFixed(1))+"BB"}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function makePlayer(seat,base=null,stack=100){return {seat,base,name:base?base.code:"你",stack,hole:[],bet:0,total:0,folded:false,inHand:false,allin:false,winner:false,last:"",won:0,pace:.85+Math.random()*.4}}
players=[makePlayer(0,null,humanStack),...drawLineup(8,[]).map((b,i)=>makePlayer(i+1,b))];
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
function dyn(p){if(!p.base||!brain)return "";return brain.dynFor(p.seat)}
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
let seatedBases=players.slice(1).filter(p=>p.stack>0).map(p=>p.base);
let bustedSeats=[];for(let i=1;i<9;i++)if(players[i].stack<=0)bustedSeats.push(i);
if(bustedSeats.length){let drawn=drawLineup(bustedSeats.length,seatedBases);bustedSeats.forEach((seat,k)=>{players[seat]=makePlayer(seat,drawn[k]);log(drawn[k].code+" 入座，买入 50BB")})}
for(let p of players){
p.hole=[];p.bet=0;p.total=0;p.folded=false;p.inHand=p.stack>0;p.allin=false;p.winner=false;p.last="";p.won=0;p.initial=p.stack;
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
ensureBrain();refreshProviders();
brain.observe({type:"handStart",players:players.map(p=>({seat:p.seat,stack:p.initial,inHand:p.inHand})),stats:{hands:stats.hands,vpip:stats.vpip,pfr:stats.pfr}});
advance(bb)
}
function botDelay(p){if(instant||skipRest)return 0;if(players[0].folded||players[0].allin)return 45+Math.random()*50;let owed=Math.max(0,highest-p.bet);return clamp(Math.round(540*(p.pace||1)*(.7+Math.random()*.65)*(owed>0?1.15:1)),230,1150)}
function schedule(){clearTimeout(timer);if(!running||actor<0||actor===0)return;let p=players[actor];timer=setTimeout(()=>{if(!running||actor<1)return;let d=decide(p);act(p,d.type,d.to,d.eq)},botDelay(p))}
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
if(type==="fold"){p.folded=true;if(p.seat===0)skipRest=true;p.last="弃牌";log(p.name+" 弃牌")}
else if(type==="check"){p.last="让牌";log(p.name+" 让牌")}
else if(type==="call"){let n=pay(p,owed);p.last="跟注 "+fmtBB(n);log(p.name+" 跟注 "+fmtBB(n)+(p.allin?"，全下":""))}
else{
let max=p.bet+p.stack,legalMin=minTo(p);to=clamp(Math.floor(Number(to)||legalMin),legalMin,max);
pay(p,to-p.bet);highest=p.bet;let increase=highest-oldHigh;wasRaise=true;
if(increase>=minRaise){minRaise=increase;acted.clear();pending=new Set(players.filter(canAct).map(q=>q.seat))}
else for(let q of players)if(canAct(q)&&q.bet<highest)pending.add(q.seat);
p.last=(oldHigh?"加注到 ":"下注 ")+fmtBB(highest);log(p.name+" "+p.last+(p.allin?"，全下":""));
}
if(p.seat===0){humanActions.push(streetNames[street]+":"+(type==="raise"?"加注到"+fmtBB(highest):type==="call"?"跟注"+fmtBB(Math.min(owed,p.bet)):type==="fold"?"弃牌":"让牌"));if(street===0&&(type==="raise"||type==="call"))handVpip=true;if(street===0&&wasRaise)handPfr=true;if(type==="raise")handRaised=true}
if(p.seat===0&&snap0)renderGto(snap0,type);
if(handRecord)handRecord.actions.push({seat:p.seat,street,type,bet:p.bet,total:p.total,folded:p.folded,allin:p.allin});
if(brain)brain.observe({type:"action",seat:p.seat,street,action:{type,amount:p.bet},owed});
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
if(brain)brain.observe({type:"handEnd",showdown,players:players.map(p=>({seat:p.seat,stack:p.stack,folded:p.folded,won:p.won})),winners:[...winners].map(p=>p.seat)});
let net=players[0].stack-startStack;
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
// settings 本体在文件前部（难度/名单定义之后）提前加载，这里只做难度与职业人数的界面接线。
function syncDifficultyInputs(){let d=$("setDifficulty"),pc=$("setPros");if(d)d.value=settings.difficultyKey;if(pc)pc.value=settings.proCount==null?"default":String(settings.proCount);let hint=$("diffHint");if(hint){let df=currentDifficulty();hint.textContent="当前难度："+df.name+"（强度指数 "+df.index+"）· 默认职业 "+df.proDefault+" 人 · 切换下一手起生效"}}
if($("setDifficulty"))$("setDifficulty").onchange=e=>{settings.difficultyKey=e.target.value;saveSettings();syncDifficultyInputs();log("难度切换为「"+currentDifficulty().name+"」，下一手起生效")};
if($("setPros"))$("setPros").onchange=e=>{settings.proCount=e.target.value==="default"?null:Math.min(8,Math.max(0,Number(e.target.value)||0));saveSettings();log("本桌职业人数已调整，下一手起生效")};
function saveSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}catch(e){}}
function renderQuick(){
let qp=$("quickPre");qp.replaceChildren();
settings.preBB.forEach(bb=>{let b=document.createElement("button");b.className="qbtn";b.textContent="到 "+bb+"BB";b.onclick=()=>quickRaise(Math.round(bb*2));qp.append(b)});
let qf=$("quickPost");qf.replaceChildren();
settings.postPct.forEach(pc=>{let b=document.createElement("button");b.className="qbtn";b.textContent=pc+"% 池";b.onclick=()=>quickRaise(highest+Math.round((potTotal()+Math.max(0,highest-players[0].bet))*pc/100));qf.append(b)});
}
function fillSettingsInputs(){[1,2,3,4].forEach(i=>{let a=$("setPre"+i),b=$("setPost"+i);if(a)a.value=settings.preBB[i-1]??"";if(b)b.value=settings.postPct[i-1]??""});syncDifficultyInputs()}
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
let p=players[actor],d=guard>500?{type:highest>p.bet?"fold":"check",eq:1}:decide(p);
act(p,d.type,d.to,d.eq);clearTimeout(timer)
}
if(running)schedule()
};
$("rebuy").onclick=()=>{if(running||players[0].stack>0)return;players[0].stack=100;players[0].allin=false;stats.buyins++;stats.bought+=100;persist();draw();startHand()};
$("showEquity").onchange=updateEquity;
$("reset").onclick=()=>{
if(!confirm("重置全部筹码、战绩与买入记录？"))return;
clearTimeout(timer);running=false;stats={hands:0,vpip:0,pfr:0,wins:0,buyins:1,bought:100};history=[];reads={faced:0,fold:0,call:0,bigN:0,bigC:0,rfF:0,rfN:0};replays=[];
players=[makePlayer(0),...drawLineup(8,[]).map((b,i)=>makePlayer(i+1,b))];brain=null;providers={};
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
handNo=stats.hands;brain=null;providers={};persist();renderHistory();draw();
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
