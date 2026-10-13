(() => {
"use strict";
const levels=[0,100,500,1000,2000,5000,10000,20000,50000,100000,250000,500000,1000000,2000000];
const $=id=>document.getElementById(id);
const screens=["home","game","end"];
let index=0,score=0,answered=false,used={public:false,phone:false,half:false},eliminated=[],seconds=30,interval=null,correctCount=0;
const fmt=n=>new Intl.NumberFormat("fr-FR").format(n);
function show(id){screens.forEach(x=>$(x).classList.toggle("hidden",x!==id));}
function play(id){const a=$(id);if(!a)return;a.pause();a.currentTime=0;a.play().catch(err=>{console.warn("Audio non lu",id,err);});}
function stop(id){const a=$(id);if(a){a.pause();a.currentTime=0;}}
function ladder(){
 const parent=$("levels");parent.replaceChildren();
 for(let n=13;n>=1;n--){
  const d=document.createElement("div");d.className="level"+(n<=score?" achieved":"")+(n===score?" current":"");
  d.textContent=fmt(levels[n]);parent.appendChild(d);
 }
}
function refreshJokers(){for(const [name,id] of Object.entries({public:"joker-public",phone:"joker-phone",half:"joker-half"})){$(id).classList.toggle("used",used[name]);$(id).disabled=used[name]||answered;}}
function render(){
 if(index>=QUESTIONS.length){finish();return;}
 answered=false;eliminated=[];seconds=30;
 const q=QUESTIONS[index];
 $("qcount").textContent=`QUESTION ${index+1} / ${QUESTIONS.length}`;
 $("stake").innerHTML=`Pour sauver <strong>${fmt(levels[score+1])} neurones</strong>`;
 $("question").textContent=q.q;
 $("illustration").src=`assets/illustration-${String(index+1).padStart(2,"0")}.png`;
 const parent=$("choices");parent.replaceChildren();
 q.options.forEach((text,i)=>{const letter="ABCD"[i];const b=document.createElement("button");b.type="button";b.className="choice";b.dataset.letter=letter;
 const label=document.createElement("b");label.textContent=letter+" :";
 const content=document.createElement("span");content.textContent=text;b.append(label,content);
 b.addEventListener("click",()=>choose(letter));parent.appendChild(b);});
 $("feedback").className="feedback hidden";$("feedback").textContent="";
 $("next").classList.add("hidden");$("joker-message").classList.add("hidden");
 refreshJokers();ladder();show("game");startTimer();
}
function startTimer(){clearInterval(interval);$("timer").textContent="30";$("timer").classList.remove("urgent");
 interval=setInterval(()=>{if(answered)return;seconds--; $("timer").textContent=String(Math.max(0,seconds));
 $("timer").classList.toggle("urgent",seconds<=10);
 if(seconds<=0){clearInterval(interval);choose(null);}},1000);}
function choose(letter){
 if(answered||eliminated.includes(letter))return;
 answered=true;clearInterval(interval);
 const q=QUESTIONS[index],good=letter===q.correct;
 stop("intro-audio");if(good){score++;correctCount++;play("correct-audio");}else{play("wrong-audio");}
 document.querySelectorAll(".choice").forEach(b=>{
  b.disabled=true;
  if(b.dataset.letter===q.correct)b.classList.add("correct");
  if(letter!==null&&b.dataset.letter===letter&&!good)b.classList.add("wrong");
 });
 const f=$("feedback");f.className="feedback "+(good?"ok":"no");
 f.textContent=good?"BRAVO ! Bonne réponse : "+q.correct:(letter===null?"Temps écoulé ! ":"Dommage ! ")+"La bonne réponse est "+q.correct;
 $("next").textContent=index===QUESTIONS.length-1?"VOIR MON RÉSULTAT ➜":"QUESTION SUIVANTE ➜";
 $("next").classList.remove("hidden");refreshJokers();ladder();
}
function joker(kind){
 if(answered||used[kind])return;
 used[kind]=true;
 const msg=$("joker-message");
 if(kind==="public")msg.textContent="Demande un avis autour de toi";
 if(kind==="phone")msg.textContent="Tu as le droit d'appeler un ami";
 if(kind==="half"){
  const correct=QUESTIONS[index].correct;
  eliminated="ABCD".split("").filter(x=>x!==correct).slice(0,2);
  document.querySelectorAll(".choice").forEach(b=>{
   if(eliminated.includes(b.dataset.letter)){b.classList.add("eliminated");b.disabled=true;}
  });
  msg.textContent="50/50 : deux mauvaises propositions ont disparu.";
 }
 msg.classList.remove("hidden");refreshJokers();
}
function finish(){
 clearInterval(interval);stop("intro-audio");
 $("final-score").textContent=fmt(levels[score])+" neurones";
 $("final-correct").textContent=`${correctCount} bonne${correctCount>1?"s":""} réponse${correctCount>1?"s":""} sur 13`;
 show("end");play("intro-audio");
}
function start(){
 clearInterval(interval);stop("intro-audio");stop("correct-audio");stop("wrong-audio");
 index=0;score=0;correctCount=0;answered=false;used={public:false,phone:false,half:false};render();play("intro-audio");
}
$("start").addEventListener("click",start);
$("sound-test").addEventListener("click",()=>play("correct-audio"));
$("restart").addEventListener("click",start);
$("next").addEventListener("click",()=>{index++;render();});
$("joker-public").addEventListener("click",()=>joker("public"));
$("joker-phone").addEventListener("click",()=>joker("phone"));
$("joker-half").addEventListener("click",()=>joker("half"));
window.addEventListener("pagehide",()=>clearInterval(interval));
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();