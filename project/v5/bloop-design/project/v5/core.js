// V5 — scroll storytelling engine
(function(){
  "use strict";
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // progress rail
  const rail = document.querySelector(".rail-fill");
  const tag = document.querySelector(".chapter-tag");
  const tagN = tag?.querySelector(".n");
  const tagLabel = tag?.querySelector(".label");

  function onScroll(){
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = Math.max(0, Math.min(1, window.scrollY / h));
    if (rail) rail.style.transform = `scaleX(${p})`;

    // chapter label from active section
    const sections = document.querySelectorAll("[data-chapter]");
    let active = sections[0];
    const y = window.scrollY + window.innerHeight*0.4;
    sections.forEach(s=>{ if (s.offsetTop<=y) active = s; });
    if (active && tagN && tagLabel){
      tagN.textContent = active.dataset.chapterNum || "—";
      tagLabel.innerHTML = `<span>chapitre</span><b>${active.dataset.chapterName||""}</b>`;
    }
  }
  onScroll();
  addEventListener("scroll", onScroll, {passive:true});

  // generic reveal
  const io = new IntersectionObserver(ents=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }});
  }, {rootMargin:"-10% 0px", threshold:0.1});
  document.querySelectorAll(".r-up,.r-fade").forEach(el=>io.observe(el));

  // strike reveal sequence (origine)
  const strikes = document.querySelectorAll(".origine-strike");
  const strikeIO = new IntersectionObserver(ents=>{
    ents.forEach(e=>{ if (e.isIntersecting){
      const list = Array.from(strikes);
      list.forEach((s,i)=> setTimeout(()=> s.classList.add("on"), i*350));
      strikeIO.disconnect();
    }});
  },{threshold:.5});
  if (strikes[0]) strikeIO.observe(strikes[0]);

  // methode loop progressive lit
  const steps = document.querySelectorAll(".methode-step");
  const stepIO = new IntersectionObserver(ents=>{
    ents.forEach(e=>{ if (e.isIntersecting){
      steps.forEach((s,i)=> setTimeout(()=> s.classList.add("lit"), i*400));
      stepIO.disconnect();
    }});
  },{threshold:.4});
  if (steps[0]) stepIO.observe(steps[0].parentElement);

  // frustration cross-out lines
  const fxs = document.querySelectorAll(".fr-huge .x");
  const fxIO = new IntersectionObserver(ents=>{
    ents.forEach(e=>{ if (e.isIntersecting){
      fxs.forEach((x,i)=> setTimeout(()=> x.classList.add("on"), 300 + i*280));
      fxIO.disconnect();
    }});
  },{threshold:.5});
  if (fxs[0]) fxIO.observe(fxs[0].parentElement);

  // transition pivot
  const pivot = document.querySelector(".tr-pivot");
  if (pivot){
    const pIO = new IntersectionObserver(ents=>{
      ents.forEach(e=>{ if (e.isIntersecting){ pivot.classList.add("on"); pIO.disconnect(); }});
    },{threshold:.4});
    pIO.observe(pivot);
  }

  // terminal typing
  const term = document.querySelector(".tech-terminal");
  if (term){
    const lines = [
      {t:"$ whoami", d:40, cls:"prompt"},
      {t:"> bobby — 22 ans — paris", d:20, cls:"out"},
      {t:"", d:10},
      {t:"$ cat parcours.md", d:40, cls:"prompt"},
      {t:"# contexte", d:25, cls:"c"},
      {t:"- pas de cadre donné", d:25, cls:"out"},
      {t:"- des contraintes, tôt", d:25, cls:"out"},
      {t:"- j'ai appris seul", d:25, cls:"out"},
      {t:"", d:10},
      {t:"$ ./methode.sh --loop", d:40, cls:"prompt"},
      {t:"[ok] observer", d:40, cls:"ok"},
      {t:"[ok] comprendre", d:40, cls:"ok"},
      {t:"[ok] tester", d:40, cls:"ok"},
      {t:"[ok] corriger", d:40, cls:"ok"},
      {t:"[loop] → retour étape 1", d:60, cls:"c"},
      {t:"", d:10},
      {t:"$ ls ~/atelier/", d:40, cls:"prompt"},
      {t:"apps/  sites/  musique/  idees/  objets/", d:30, cls:"out"},
      {t:"", d:10},
      {t:"$ status", d:40, cls:"prompt"},
      {t:"en cours de construction ⏳", d:30, cls:"out caret"},
    ];
    const termIO = new IntersectionObserver(async ents=>{
      for (const e of ents){
        if (!e.isIntersecting) continue;
        termIO.disconnect();
        for (const ln of lines){
          const el = document.createElement("div");
          el.className = ln.cls || "";
          term.appendChild(el);
          if (!ln.t){ await sleep(ln.d*6); continue; }
          for (const ch of ln.t){
            el.textContent += ch;
            await sleep(ln.d/3 + Math.random()*8);
          }
          await sleep(120);
        }
      }
    },{threshold:.3});
    termIO.observe(term);
  }

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

  // mode orbit positioning
  positionOrbits();
  addEventListener("resize", positionOrbits);
  function positionOrbits(){
    document.querySelectorAll(".mode-ring").forEach(ring=>{
      const orbs = ring.querySelectorAll(".mode-orb");
      const R = Math.min(ring.offsetWidth, ring.offsetHeight) * 0.42;
      orbs.forEach((o,i)=>{
        const a = (i/orbs.length) * Math.PI*2;
        const x = Math.cos(a) * R;
        const y = Math.sin(a) * R;
        o.style.transform = `translate(${x}px,${y}px)`;
      });
    });
  }

  // clock topbar
  const clk = document.querySelector("[data-clock]");
  function tickClock(){
    if (!clk) return;
    const d = new Date();
    const h = String(d.getHours()).padStart(2,"0");
    const m = String(d.getMinutes()).padStart(2,"0");
    clk.innerHTML = `<b>${h}:${m}</b> paris`;
  }
  tickClock(); setInterval(tickClock, 30000);

  // parallax big words in cover
  const bigWord = document.querySelector(".cover-big-word");
  if (bigWord && !prefersReduced){
    addEventListener("scroll", ()=>{
      const y = window.scrollY;
      bigWord.style.transform = `translateY(${y*-0.2}px)`;
    }, {passive:true});
  }
})();
