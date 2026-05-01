// Bobby Industries V4 — vinyl gamified discovery
// Each vinyl has a sleeve that opens to reveal the record. Click plays a preview tone.
// A side playlist keeps track of discovered tracks.

(function(){
  const VINYLS = [
    { id:"signal", title:"SIGNAL", year:"2026", tone:"Clarté", color:"#2f80ff",
      freqs:[220, 330, 440, 523], tempo:0.32,
      desc:"Un mix de clarté. Basse posée, hi-hats serrés. C'est ce que j'écoute quand je code lent." },
    { id:"boucle", title:"BOUCLE", year:"2025", tone:"Méthode", color:"#6db6ff",
      freqs:[196, 294, 392, 494], tempo:0.26,
      desc:"Construit en boucle, comme ma façon de travailler. Pose, écoute, casse, refais." },
    { id:"contrainte", title:"CONTRAINTE", year:"2024", tone:"Tension", color:"#4a95ff",
      freqs:[175, 262, 349, 440], tempo:0.22,
      desc:"Fait dans un moment dense. Tension qui monte sans se relâcher. Honnête." },
    { id:"sortie", title:"SORTIE", year:"2023", tone:"Brut", color:"#ffd486",
      freqs:[165, 247, 330, 415], tempo:0.36,
      desc:"Premier truc sorti en public. Pas propre, pas parfait. Mais sorti." },
    { id:"maintenant", title:"MAINTENANT", year:"2026·WIP", tone:"Ouvert", color:"#2f80ff",
      freqs:[246, 370, 494, 622], tempo:0.28,
      desc:"En cours. Ce que je travaille cette semaine. Change tout le temps." },
  ];

  let audioCtx = null;
  function getAC(){
    if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if (audioCtx.state==="suspended") audioCtx.resume();
    return audioCtx;
  }

  function playTone(v){
    const ac = getAC();
    const now = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.12, now+0.05);
    master.gain.linearRampToValueAtTime(0, now+6);
    master.connect(ac.destination);

    // pad
    v.freqs.forEach((f,i)=>{
      const osc = ac.createOscillator();
      osc.type = i===0?"sine":"triangle";
      osc.frequency.value = f;
      const g = ac.createGain(); g.gain.value = 0.15/(i+1);
      osc.connect(g); g.connect(master);
      osc.start(now); osc.stop(now+6);
    });
    // rhythm
    for (let b=0;b<12;b++){
      const t = now + b*v.tempo;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.frequency.value = v.freqs[0]*0.5;
      osc.type = "sine";
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t+0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.15);
      osc.connect(g); g.connect(master);
      osc.start(t); osc.stop(t+0.2);
    }
    return 6;
  }

  let activeTimeout = null;

  function render(root){
    const discovered = new Set(JSON.parse(localStorage.getItem("bi-discovered")||"[]"));
    let selected = VINYLS[0].id;
    let playing = null;

    root.innerHTML = `
      <div class="vinyl-lab">
        <div class="vinyl-lab-head">
          <div class="eyebrow">// drg_music · sound lab</div>
          <h2 class="h-xl">Ouvre une pochette.<br/>Découvre ce qu'il y a dedans.</h2>
          <p class="body">Cinq disques, cinq moments. Clique sur une pochette pour l'ouvrir, écouter, découvrir. <b class="text-glow">${discovered.size}/${VINYLS.length}</b> disques trouvés.</p>
        </div>
        <div class="vinyl-lab-body">
          <div class="vinyl-carousel" id="vlCarousel">
            ${VINYLS.map((v,i)=>`
              <div class="vl-item ${v.id===selected?'is-active':''}" data-id="${v.id}" data-hover>
                <div class="vl-sleeve" style="--vl-color:${v.color}">
                  <div class="vl-sleeve-front">
                    <div class="vl-sleeve-mark">BI · drg_music</div>
                    <div class="vl-sleeve-title">${v.title}</div>
                    <div class="vl-sleeve-year">${v.year}</div>
                    ${discovered.has(v.id)?'<div class="vl-sleeve-badge">✓ découvert</div>':'<div class="vl-sleeve-badge dim">pochette scellée</div>'}
                  </div>
                  <div class="vl-disc">
                    <div class="vl-disc-label" style="background:${v.color}"><span>${v.title}</span><small>drg_music</small></div>
                  </div>
                </div>
                <div class="vl-caption">${i+1}/${VINYLS.length} · ${v.tone}</div>
              </div>
            `).join("")}
          </div>
          <aside class="vinyl-playlist">
            <div class="vl-pl-head">
              <div class="eyebrow">Playlist · ce que tu as débloqué</div>
              <div class="vl-pl-count"><b id="vlCount">${discovered.size}</b>/${VINYLS.length}</div>
            </div>
            <div class="vl-pl-list" id="vlList"></div>
            <div class="vl-pl-now" id="vlNow">
              <div class="vl-pl-now-spin"></div>
              <div class="vl-pl-now-text">
                <small>en silence</small>
                <b>sélectionne un disque</b>
              </div>
            </div>
          </aside>
        </div>
      </div>
    `;

    const carousel = root.querySelector("#vlCarousel");
    const items = Array.from(carousel.querySelectorAll(".vl-item"));
    const listEl = root.querySelector("#vlList");
    const countEl = root.querySelector("#vlCount");
    const nowEl = root.querySelector("#vlNow");

    function updateList(){
      const d = Array.from(discovered);
      listEl.innerHTML = d.length ? d.map(id=>{
        const v = VINYLS.find(x=>x.id===id);
        return `<button class="vl-pl-row" data-replay="${v.id}"><span class="vl-pl-dot" style="background:${v.color}"></span><span>${v.title}</span><small>${v.tone}</small><em>↺</em></button>`;
      }).join("") : `<div class="vl-pl-empty">vide. ouvre une pochette pour remplir.</div>`;
      countEl.textContent = discovered.size;
      listEl.querySelectorAll("[data-replay]").forEach(b=>{
        b.addEventListener("click", ()=> selectAndPlay(b.dataset.replay));
      });
    }

    function selectAndPlay(id){
      const v = VINYLS.find(x=>x.id===id);
      if (!v) return;
      selected = id;
      items.forEach(it=>{
        it.classList.toggle("is-active", it.dataset.id===id);
        if (it.dataset.id!==id) it.classList.remove("is-open");
      });
      const item = items.find(it=>it.dataset.id===id);
      setTimeout(()=>{ item.classList.add("is-open"); }, 150);
      discovered.add(id);
      localStorage.setItem("bi-discovered", JSON.stringify(Array.from(discovered)));
      try { playTone(v); } catch(e){}
      nowEl.classList.add("is-spinning");
      nowEl.querySelector(".vl-pl-now-spin").style.background = `radial-gradient(circle at 50% 50%, #0a1224 0 22%, ${v.color} 22% 24%, #0a0f1c 24% 100%)`;
      nowEl.querySelector(".vl-pl-now-text").innerHTML = `<small>en lecture · ${v.tone}</small><b>${v.title}</b><i>${v.desc}</i>`;
      clearTimeout(activeTimeout);
      activeTimeout = setTimeout(()=>{ nowEl.classList.remove("is-spinning"); }, 6200);
      updateList();
    }

    items.forEach(it=>{
      it.addEventListener("click", ()=> selectAndPlay(it.dataset.id));
    });

    // arrow keys
    carousel.tabIndex = 0;
    carousel.addEventListener("keydown",(e)=>{
      const idx = VINYLS.findIndex(v=>v.id===selected);
      if (e.key==="ArrowRight") selectAndPlay(VINYLS[(idx+1)%VINYLS.length].id);
      if (e.key==="ArrowLeft") selectAndPlay(VINYLS[(idx-1+VINYLS.length)%VINYLS.length].id);
    });

    updateList();
  }

  window.BI_initVinyls = render;
})();
