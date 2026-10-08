/* Kids Chess Lessons - lesson player, voice narration, owl guide and evaluation quiz */
(function(){
"use strict";
const CH = window.CHAPTER;
const START = CH.startFen, MAIN = CH.mainLine, VARS = CH.variations, INTRO = CH.intro, ENDTXT = CH.ending, QUIZ = CH.quiz;
document.title = CH.title;
document.getElementById("chTitle").textContent = CH.title;
document.getElementById("chSub").textContent = CH.subtitle;
const PN={p:"Pawn",n:"Knight",b:"Bishop",r:"Rook",q:"Queen",k:"King"};
const strip = s => s.replace(/[!?+#]+/g,"");

function buildLine(startFen, moves){
  const g=new Chess(startFen); const fens=[startFen]; const info=[];
  for(const [san,comments] of moves){
    const num=g.fen().split(" ")[5];
    const m=g.move(san.replace(/[!?]+$/,""));
    if(!m) throw new Error("Illegal move "+san);
    info.push({m, label:(m.color==="w"?num+". ":num+"... ")+san, comments:comments||[]});
    fens.push(g.fen());
  }
  return {fens, info};
}
const main = buildLine(START, MAIN);
VARS.forEach(v=>{ v.line = buildLine(main.fens[v.at], v.moves); });

/* ---------- board ---------- */
const boardEl=document.getElementById("board"), sqEl=document.getElementById("squares"), pcEl=document.getElementById("pieces"), trailEl=document.getElementById("trail");
let orient="w", sqDivs={};
function coords(sq){ const f=sq.charCodeAt(0)-97, r=+sq[1]; return orient==="w"?{c:f,r:8-r}:{c:7-f,r:r-1}; }
function buildSquares(){
  sqEl.innerHTML=""; sqDivs={};
  for(let row=0;row<8;row++) for(let col=0;col<8;col++){
    const f=orient==="w"?col:7-col, r=orient==="w"?8-row:row+1;
    const sq=String.fromCharCode(97+f)+r; const d=document.createElement("div");
    d.className="sq"+((f+r)%2===0?" d":""); d.dataset.sq=sq;
    if(row===7){const s=document.createElement("span");s.className="cf";s.textContent=sq[0];d.appendChild(s);}
    if(col===0){const s=document.createElement("span");s.className="cr";s.textContent=r;d.appendChild(s);}
    sqEl.appendChild(d); sqDivs[sq]=d;
  }
}
function setOrient(o){ if(o!==orient||!Object.keys(sqDivs).length){orient=o;buildSquares();} }
const setSq=()=>boardEl.style.setProperty("--sqs",(boardEl.clientWidth/8)+"px");
if(window.ResizeObserver) new ResizeObserver(setSq).observe(boardEl); else window.addEventListener("resize",setSq);
setSq();

function render(fen, last, extra){
  const g=new Chess(fen); extra=extra||{};
  for(const sq in sqDivs){ sqDivs[sq].classList.remove("last","chk","sel","tgt","cap"); }
  if(last){ sqDivs[last.from].classList.add("last"); sqDivs[last.to].classList.add("last"); }
  if(g.in_check()){ const t=g.turn(); for(const sq in sqDivs){ const p=g.get(sq); if(p&&p.type==="k"&&p.color===t) sqDivs[sq].classList.add("chk"); } }
  if(extra.sel) sqDivs[extra.sel].classList.add("sel");
  (extra.targets||[]).forEach(t=>{ sqDivs[t.to].classList.add("tgt"); if(t.captured) sqDivs[t.to].classList.add("cap"); });
  pcEl.innerHTML="";
  for(const sq in sqDivs){
    const p=g.get(sq); if(!p) continue;
    const e=document.createElement("div"); const c=coords(sq);
    e.className="pc"; e.dataset.sq=sq; e.dataset.p=p.color+p.type;
    e.style.left=(c.c*12.5)+"%"; e.style.top=(c.r*12.5)+"%"; pcEl.appendChild(e);
  }
  const wl=`<span>⬜ ${CH.white} (White)</span>`;
  const bl=`<span>⬛ ${CH.black} (Black)</span>`;
  document.getElementById("topPlayer").innerHTML=orient==="w"?bl:wl;
  document.getElementById("botPlayer").innerHTML=orient==="w"?wl:bl;
}

/* move animation with a path trail that fades after the piece arrives */
const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
let animTok=0, fadeTimer=null;
function clearTrail(){ clearTimeout(fadeTimer); trailEl.classList.remove("fade"); trailEl.innerHTML=""; }
function pathPoints(m){
  const a=coords(m.from), b=coords(m.to);
  const p0=[a.c+.5,a.r+.5], p2=[b.c+.5,b.r+.5];
  if(m.piece==="n"){ const corner=Math.abs(b.c-a.c)>Math.abs(b.r-a.r)?[p2[0],p0[1]]:[p0[0],p2[1]]; return [p0,corner,p2]; }
  return [p0,p2];
}
function animate(m, fenAfter, cb, dur){
  const my=++animTok; clearTrail(); if(typeof buddyTo==="function") buddyTo(m.to);
  const el=pcEl.querySelector(`.pc[data-sq="${m.from}"]`);
  const cap=pcEl.querySelector(`.pc[data-sq="${m.to}"]`);
  if(!el){ render(fenAfter,m); cb&&cb(); return; }
  dur = reduce ? 1 : (dur||900);
  const pts=pathPoints(m); const segs=[]; let total=0;
  for(let i=1;i<pts.length;i++){ const L=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); segs.push(L); total+=L; }
  const col = m.color==="w" ? "#FF8A00" : "#7B4DFF";
  trailEl.innerHTML =
    `<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r=".2" fill="none" stroke="${col}" stroke-width=".07" opacity=".9"/>`+
    `<polyline id="tl" points="${pts.map(p=>p.join(",")).join(" ")}" fill="none" stroke="${col}" stroke-width=".16" stroke-linecap="round" stroke-linejoin="round" opacity=".85" stroke-dasharray="${total}" stroke-dashoffset="${total}"/>`;
  const line=trailEl.querySelector("#tl");
  el.classList.add("moving");
  const t0=performance.now();
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  function at(d){ let acc=0; for(let i=0;i<segs.length;i++){ if(d<=acc+segs[i]||i===segs.length-1){ const f=segs[i]?Math.min(1,(d-acc)/segs[i]):1; return [pts[i][0]+(pts[i+1][0]-pts[i][0])*f, pts[i][1]+(pts[i+1][1]-pts[i][1])*f]; } acc+=segs[i]; } return pts[pts.length-1]; }
  function frame(now){
    if(my!==animTok) return;
    const t=Math.min(1,(now-t0)/dur), d=ease(t)*total, p=at(d);
    el.style.left=((p[0]-.5)*12.5)+"%"; el.style.top=((p[1]-.5)*12.5)+"%";
    line.setAttribute("stroke-dashoffset", String(total-d));
    if(cap && t>.8) cap.classList.add("gone");
    if(t<1) requestAnimationFrame(frame);
    else {
      render(fenAfter,m);
      fadeTimer=setTimeout(()=>{ if(my===animTok){ trailEl.classList.add("fade"); fadeTimer=setTimeout(()=>{ if(my===animTok) clearTrail(); },650); } },350);
      cb&&cb();
    }
  }
  requestAnimationFrame(frame);
}


/* ---------- buddy owl ---------- */
const buddy=document.getElementById("buddy");
let buddyPos={x:44,y:-9}, wanderT=null, buddyBusy=false;
function buddyGo(x,y,cls){
  x=Math.max(-3,Math.min(92,x)); y=Math.max(-9,Math.min(90,y));
  buddy.classList.toggle("flip", x<buddyPos.x);
  buddy.classList.remove("hop","cheer","shake"); void buddy.offsetWidth;
  if(Math.hypot(x-buddyPos.x,y-buddyPos.y)>1) buddy.classList.add("hop");
  buddy.style.left=x+"%"; buddy.style.top=y+"%"; buddyPos={x,y};
  if(cls) setTimeout(()=>{ buddy.classList.remove("hop"); void buddy.offsetWidth; buddy.classList.add(cls); },760);
}
function buddyTo(sq, cls){
  const c=coords(sq);
  let x=(c.c+0.9)*12.5, y=(c.r-0.55)*12.5;
  if(c.c>=6) x=(c.c-0.9)*12.5;
  if(c.r<1) y=(c.r+0.75)*12.5;
  buddyBusy=true; clearTimeout(wanderT); buddyGo(x,y,cls);
  wanderT=setTimeout(()=>{ buddyBusy=false; wander(); }, 6000);
}
function wander(){
  clearTimeout(wanderT);
  if(!buddyBusy){
    const edge=Math.floor(Math.random()*4), r=Math.random()*85;
    const spots=[[r,-9],[90,r],[r,88],[-3,r]];
    buddyGo(spots[edge][0], spots[edge][1]);
  }
  wanderT=setTimeout(wander, 2600+Math.random()*1800);
}
function buddyReact(cls){ buddy.classList.remove("hop","cheer","shake"); void buddy.offsetWidth; buddy.classList.add(cls); }
wander();

/* ---------- voice ---------- */
const synth = ("speechSynthesis" in window) ? window.speechSynthesis : null;
const voiceOn=document.getElementById("voiceOn"), voiceSel=document.getElementById("voiceSel"), paceSel=document.getElementById("paceSel"), note=document.getElementById("voiceNote");
let voices=[], voice=null; const keep=[];
const pace=()=>+paceSel.value;
function setNote(t,warn){ note.textContent=t; note.classList.toggle("warn",!!warn); }
function loadVoices(){
  if(!synth) return;
  const all=synth.getVoices();
  voices=all.filter(v=>/^en/i.test(v.lang));
  const rank=v=>(/en[-_](US|GB)/i.test(v.lang)?2:0)+(/google|natural|samantha|daniel/i.test(v.name)?1:0);
  voices.sort((a,b)=>rank(b)-rank(a));
  voiceSel.innerHTML="";
  if(!voices.length){ voiceSel.innerHTML='<option value="">Default</option>'; }
  voices.forEach((v,i)=>{ const o=document.createElement("option"); o.value=i; o.textContent=v.name.replace(/Microsoft |Google /,""); voiceSel.appendChild(o); });
  voice=voices[0]||null;
}
if(synth){
  loadVoices(); if(synth.addEventListener) synth.addEventListener("voiceschanged",loadVoices); else synth.onvoiceschanged=loadVoices;
  setNote("Tip: if you hear nothing, check your phone isn't on silent, then tap “Test voice”.");
} else {
  voiceOn.checked=false; voiceOn.disabled=true; voiceSel.disabled=true; document.getElementById("bTest").disabled=true;
  setNote("Voice isn't supported in this viewer (common in in-app browsers). Open this link in Chrome or Safari to hear the voice. The lesson still plays by itself with text.", true);
}
voiceSel.onchange=()=>{ voice=voices[+voiceSel.value]||null; };
function spoken(t){
  return t.replace(/\.\.\./g," ")
   .replace(/\b([KQRBN])([a-h1-8])?(x)?([a-h][1-8])([+#])?/g,(m,p,d,x,sq,c)=>({K:"King",Q:"Queen",R:"Rook",B:"Bishop",N:"Knight"})[p]+(x?" takes ":" ")+sq+(c?" check":""))
   .replace(/\b([a-h])x([a-h][1-8])/g,"$1 takes $2").replace(/\+/g," check ").replace(/[!?]/g,".");
}
let speechTok=0;
function stopSpeech(){ speechTok++; if(synth && (synth.speaking||synth.pending)) synth.cancel(); }
function speak(texts){
  if(!synth||!voiceOn.checked) return;
  const tok=++speechTok;
  const chunks=[]; texts.forEach(t=>(t.match(/[^.!?]+[.!?]*/g)||[t]).forEach(s=>{ if(s.trim()) chunks.push(spoken(s.trim())); }));
  const go=()=>{
    if(tok!==speechTok) return;
    try{ synth.resume(); }catch(e){}
    chunks.forEach(c=>{
      const u=new SpeechSynthesisUtterance(c);
      if(voice){ u.voice=voice; u.lang=voice.lang; } else u.lang="en-US";
      u.rate=Math.min(1.3,0.95*pace()); u.pitch=1.05;
      u.onerror=e=>{ if(e.error&&e.error!=="interrupted"&&e.error!=="canceled") setNote("The voice couldn't play here ("+e.error+"). Try opening this link in Chrome or Safari.",true); };
      keep.push(u); if(keep.length>60) keep.shift();
      synth.speak(u);
    });
  };
  if(synth.speaking||synth.pending){ synth.cancel(); setTimeout(go,150); } else go();
}
document.getElementById("bTest").onclick=()=>{ stopSpeech(); speak(["Hello! The voice is working."]); };
voiceOn.onchange=()=>{ if(!voiceOn.checked) stopSpeech(); };

/* ---------- lesson player (timed autoplay) ---------- */
const panel=document.getElementById("panel"), slider=document.getElementById("slider");
let mode="lesson", line=main, idx=0, playing=false, run=0, varCtx=null, started=false;
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]);
function announce(info){
  const m=info.m, side=m.color==="w"?"White":"Black", foe=m.color==="w"?"Black":"White";
  let s = m.captured ? `${side} ${PN[m.piece]} on ${m.from} captures the ${foe} ${PN[m.captured]} on ${m.to}.` : `${side} ${PN[m.piece]} moves from ${m.from} to ${m.to}.`;
  if(/\+/.test(m.san)) s+=" Check!";
  return s;
}
function readTime(texts){ const words=texts.join(" ").split(/\s+/).length; return Math.max(2000, words*360)/pace(); }
function wait(ms, my, cb){ setTimeout(()=>{ if(my===run) cb(); }, ms); }
function waitSpeech(my, cb){
  const t0=Date.now();
  (function poll(){ if(my!==run) return; if(synth && voiceOn.checked && (synth.speaking||synth.pending) && Date.now()-t0<12000) setTimeout(poll,250); else cb(); })();
}
function caption(i){
  let h="";
  if(varCtx) h+=`<div class="banner">🔀 Another line: ${esc(varCtx.v.title)}</div>`;
  if(i<0){
    h+=`<span class="movepill">Starting position</span><div class="cm coach"><b>🧑‍🏫 Coach</b><p>${esc(INTRO)}</p></div>`;
  } else {
    const inf=line.info[i];
    h+=`<span class="movepill">${esc(inf.label)}</span><p class="ann">${esc(announce(inf))}</p>`;
    inf.comments.forEach(([t,x])=>{ h+=`<div class="cm ${t==="Book"?"book":"coach"}"><b>${t==="Book"?"📖 Book":"🧑‍🏫 Coach"}</b><p>${esc(x)}</p></div>`; });
    if(!varCtx) VARS.forEach((v,k)=>{ if(v.at===i) h+=`<button class="varbtn" data-var="${k}">🔀 ${esc(v.title)}</button>`; });
    if(!varCtx && i===line.info.length-1) h+=`<div class="cm coach"><b>🏆 Result</b><p>${esc(ENDTXT)}</p></div>`;
  }
  if(varCtx && i===line.info.length-1) h+=`<button class="btn primary" id="bReturn">↩ Back to the main game</button>`;
  panel.innerHTML=h;
  panel.querySelectorAll("[data-var]").forEach(b=>b.onclick=()=>enterVar(VARS[+b.dataset.var]));
  const r=document.getElementById("bReturn"); if(r) r.onclick=exitVar;
}
function narrationFor(i){
  if(i<0) return [INTRO];
  const inf=line.info[i]; const t=[announce(inf)];
  inf.comments.forEach(c=>t.push(c[1]));
  if(!varCtx && i===line.info.length-1) t.push(ENDTXT);
  return t;
}
function updateUI(){
  slider.max=line.info.length; slider.value=idx; slider.disabled=!!varCtx;
  document.getElementById("moveCount").textContent=`Move ${idx} / ${line.info.length}`;
  document.getElementById("playIcon").innerHTML = playing ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>' : '<path d="M7 4v16l13-8z"/>';
  document.getElementById("bPlay").setAttribute("aria-label", playing?"Pause":"Play");
}
function showAt(i){ animTok++; clearTrail(); render(line.fens[i], i>0?line.info[i-1].m:null); updateUI(); caption(i-1); }
function doMove(cont){
  if(idx>=line.info.length){ playing=false; updateUI(); return; }
  const my=++run, i=idx;
  animate(line.info[i].m, line.fens[i+1], ()=>{
    if(my!==run) return;
    idx=i+1; updateUI(); caption(i);
    const texts=narrationFor(i); speak(texts);
    wait(readTime(texts), my, ()=> waitSpeech(my, ()=>{
      if(idx>=line.info.length){ playing=false; updateUI(); return; }
      if(cont&&playing) wait(500, my, ()=>{ if(playing) doMove(true); });
    }));
  });
}
function play(){
  if(idx>=line.info.length){ if(varCtx) return; idx=0; showAt(0); }
  playing=true; updateUI();
  if(idx===0 && !varCtx){
    const my=++run; caption(-1); speak([INTRO]);
    wait(readTime([INTRO]), my, ()=>waitSpeech(my, ()=>{ if(playing) doMove(true); }));
  } else doMove(true);
}
function pause(){ playing=false; run++; stopSpeech(); updateUI(); }
function enterVar(v){ pause(); varCtx={v, line, idx}; line=v.line; idx=0; showAt(0); playing=true; updateUI(); doMove(true); }
function exitVar(){ pause(); line=varCtx.line; idx=varCtx.idx; varCtx=null; showAt(idx); }
function begin(){ document.getElementById("startOverlay").classList.add("hidden"); started=true; }

document.getElementById("bStart").onclick=()=>{ begin(); idx=0; showAt(0); play(); };
document.getElementById("bPlay").onclick=()=>{ begin(); playing?pause():play(); };
document.getElementById("bBack").onclick=()=>{ begin(); pause(); if(idx>0){ idx--; showAt(idx); } };
document.getElementById("bFwd").onclick=()=>{ begin(); pause(); if(idx<line.info.length) doMove(false); };
document.getElementById("bRepeat").onclick=()=>{ begin(); const wasPlaying=playing; pause(); if(idx===0){ play(); return; } idx--; showAt(idx); playing=wasPlaying; updateUI(); doMove(wasPlaying); };
document.getElementById("bRestart").onclick=()=>{ begin(); pause(); if(varCtx){ idx=0; showAt(0); playing=true; updateUI(); doMove(true); } else { idx=0; showAt(0); play(); } };
slider.oninput=()=>{ begin(); pause(); idx=+slider.value; showAt(idx); };

/* ---------- evaluation ---------- */
let qi=0, score=0, qgame=null, qsel=null, qtries=0, qdone=false;
const lessonCtl=document.getElementById("lessonCtl"), evalBar=document.getElementById("evalBar");
document.getElementById("bEval").onclick=startQuiz;
function startQuiz(){
  begin(); pause(); if(varCtx){ line=varCtx.line; idx=varCtx.idx; varCtx=null; }
  mode="quiz"; qi=0; score=0; lessonCtl.classList.add("hidden"); evalBar.classList.add("hidden"); showQ();
}
function backToLesson(){ stopSpeech(); mode="lesson"; setOrient("w"); lessonCtl.classList.remove("hidden"); evalBar.classList.remove("hidden"); showAt(idx); }
function sideOf(q){ return main.fens[q.at].split(" ")[1]; }
function showQ(){
  const q=QUIZ[qi]; qtries=0; qdone=false; qsel=null; animTok++; clearTrail();
  qgame=new Chess(main.fens[q.at]);
  const side=sideOf(q);
  setOrient(q.type==="move"?side:"w");
  render(qgame.fen(), null);
  let h=`<div class="qhead"><span>Question ${qi+1} of ${QUIZ.length}</span><span id="qscore">⭐ ${score}</span></div>`;
  if(q.type==="move") h+=`<span class="qside ${side}">You play ${side==="w"?"White":"Black"}</span>`;
  h+=`<p class="qtext">${esc(q.q)}</p>`;
  if(q.type==="mcq") q.options.forEach((o,k)=>{ h+=`<button class="opt" data-k="${k}">${esc(o)}</button>`; });
  else h+=`<p class="note" style="text-align:left">Tap a piece, then tap the square it should move to.</p><div class="row"><button class="btn ghost" id="bHint">💡 Hint</button><button class="btn ghost hidden" id="bShow">Show answer</button></div>`;
  h+=`<div id="fb"></div><div class="row"><button class="btn primary hidden" id="bNext">${qi===QUIZ.length-1?"See my score":"Next question"}</button></div><button class="btn ghost" id="bQuit">↩ Back to the lesson</button>`;
  panel.innerHTML=h;
  panel.querySelectorAll(".opt").forEach(b=>b.onclick=()=>answerMcq(+b.dataset.k));
  const hb=document.getElementById("bHint"); if(hb) hb.onclick=()=>feedback(q.hint,"hint");
  const sb=document.getElementById("bShow"); if(sb) sb.onclick=reveal;
  document.getElementById("bNext").onclick=()=>{ qi++; qi<QUIZ.length?showQ():finish(); };
  document.getElementById("bQuit").onclick=backToLesson;
  speak([q.q]);
}
function feedback(text, kind){
  document.getElementById("fb").innerHTML=`<div class="fb ${kind}">${kind==="hint"?"💡 ":kind==="ok"?"✅ ":"❌ "}${esc(text)}</div>`;
  speak([text]);
}
function solved(text){
  qdone=true; feedback(text,"ok"); setTimeout(()=>buddyReact("cheer"),900);
  document.getElementById("qscore").textContent="⭐ "+score;
  document.getElementById("bNext").classList.remove("hidden");
  ["bShow","bHint"].forEach(id=>{ const b=document.getElementById(id); if(b) b.classList.add("hidden"); });
}
function answerMcq(k){
  if(qdone) return; const q=QUIZ[qi]; const btns=panel.querySelectorAll(".opt");
  if(k===q.correct){ score++; btns[k].classList.add("right"); solved(q.ok); }
  else { buddyReact("shake"); btns[k].classList.add("wrong"); btns[q.correct].classList.add("right"); qdone=true; feedback(q.no,"no"); document.getElementById("bNext").classList.remove("hidden"); }
}
function reveal(){
  const q=QUIZ[qi]; const fen=qgame.fen(); const m=qgame.move(q.ans); qsel=null;
  render(fen,null); animate(m, qgame.fen(), null); solved("The answer: "+q.ok);
}
sqEl.addEventListener("click", e=>{
  if(mode!=="quiz") return; const q=QUIZ[qi]; if(q.type!=="move"||qdone) return;
  const d=e.target.closest(".sq"); if(!d) return; const sq=d.dataset.sq;
  if(qsel){ const mv=qgame.moves({square:qsel, verbose:true}).find(x=>x.to===sq); if(mv){ tryMove(mv); return; } }
  const p=qgame.get(sq);
  if(p && p.color===qgame.turn()){ qsel=sq; render(qgame.fen(), null, {sel:sq, targets:qgame.moves({square:sq, verbose:true})}); }
  else { qsel=null; render(qgame.fen(), null); }
});
function tryMove(mv){
  const q=QUIZ[qi]; const fen=qgame.fen(); qsel=null;
  const m=qgame.move({from:mv.from, to:mv.to, promotion:"q"});
  render(fen,null);
  if(strip(m.san)===strip(q.ans)){ if(qtries===0) score++; animate(m, qgame.fen(), null); solved(q.ok); }
  else {
    qtries++; const after=qgame.fen(); qgame.undo();
    feedback((q.wrong&&q.wrong[strip(m.san)])||"That's not the best move. Try again!","no"); setTimeout(()=>buddyReact("shake"),900);
    animate(m, after, ()=>{ setTimeout(()=>{ if(!qdone){ animTok++; clearTrail(); render(qgame.fen(), null); } }, 1000); });
    if(qtries>=2) document.getElementById("bShow").classList.remove("hidden");
  }
}
function finish(){
  setOrient("w"); animTok++; clearTrail(); render(main.fens[main.info.length], main.info[main.info.length-1].m);
  const n=QUIZ.length, ratio=score/n;
  const msg = ratio===1?"Amazing! You're a real chess champion!": ratio>=.6?"Well done! A little more practice and you'll get them all!":"Good try! Watch the lesson again and have another go.";
  panel.innerHTML=`<p class="qtext" style="text-align:center;font-weight:800">Evaluation complete!</p><div class="stars">${"⭐".repeat(score)}${"☆".repeat(n-score)}</div><p style="text-align:center">${score} of ${n} correct on the first try</p><p style="text-align:center">${esc(msg)}</p><div class="row"><button class="btn primary" id="bAgain">Try again</button><button class="btn ghost" id="bLesson">Back to the lesson</button></div>`;
  document.getElementById("bAgain").onclick=()=>{ qi=0; score=0; showQ(); };
  document.getElementById("bLesson").onclick=backToLesson;
  speak([`You got ${score} out of ${n} correct on the first try. `+msg]);
}

/* init */
setOrient("w"); showAt(0);
})();
