// ---- headless stubs (test only, not part of the game) ----
var __els = {};
function __mkEl(id){ return { id:id||'dyn', children:[], innerHTML:'', textContent:'', value:'', disabled:false, hidden:false, checked:false, min:0, max:0, style:{}, scrollTop:0, scrollHeight:0,
  append:function(c){ this.children.push(c); }, replaceChildren:function(){ this.children=[]; },
  remove:function(){}, focus:function(){}, select:function(){},
  get firstChild(){ return this.children[0] || { remove:function(){} }; } }; }
var document = { getElementById:function(id){ return __els[id] || (__els[id] = __mkEl(id)); }, createElement:function(){ return __mkEl(); }, execCommand:function(){ return true; } };
var localStorage = { _d:{}, getItem:function(k){ return k in this._d ? this._d[k] : null; }, setItem:function(k,v){ this._d[k]=String(v); } };
var navigator = {};
var confirm = function(){ return true; };
var __timers = [];
var setTimeout = function(fn){ __timers.push(fn); return __timers.length; };
var clearTimeout = function(id){ if(id>=1 && id<=__timers.length) __timers[id-1]=null; };
function __pump(){ let n=0; while(__timers.length && n++<100000){ let fn=__timers.shift(); if(fn) fn(); } }
