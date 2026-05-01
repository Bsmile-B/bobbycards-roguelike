// Bobby Industries V4 — core interactions (vanilla JS)
// Constellation background that reacts to mouse + scroll.

(function(){
  "use strict";

  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ───────────────────────── CONSTELLATION BG ─────────────────────────
  // Network of nodes; mouse attracts; scroll parallaxes; bursts on click.
  function initConstellation(canvas){
    const ctx = canvas.getContext("2d");
    let w, h, nodes = [], mx = -9999, my = -9999, scrollY = 0, bursts = [];
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize(){
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * DPR; canvas.height = h * DPR;
      ctx.setTransform(DPR,0,0,DPR,0,0);
      const count = Math.max(50, Math.min(120, Math.floor((w*h)/18000)));
      nodes = new Array(count).fill(0).map(()=>({
        x: Math.random()*w, y: Math.random()*h,
        vx:(Math.random()-0.5)*0.18, vy:(Math.random()-0.5)*0.18,
        r: 0.6 + Math.random()*1.8,
        z: 0.2 + Math.random()*0.8,
      }));
    }
    resize();
    addEventListener("resize", resize);

    addEventListener("mousemove", e=>{ mx = e.clientX; my = e.clientY; });
    addEventListener("mouseleave", ()=>{ mx=-9999; my=-9999; });
    addEventListener("scroll", ()=>{ scrollY = window.scrollY; }, {passive:true});
    addEventListener("click", e=>{
      bursts.push({x:e.clientX, y:e.clientY, t:0, life:60});
      if (bursts.length>4) bursts.shift();
    });

    function tick(){
      ctx.clearRect(0,0,w,h);
      // global gradient veil
      const g = ctx.createRadialGradient(w*0.2, h*0.3, 0, w*0.2, h*0.3, Math.max(w,h));
      g.addColorStop(0,"rgba(47,128,255,0.10)");
      g.addColorStop(1,"rgba(4,8,20,0)");
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

      const parallax = (scrollY * 0.05) % h;

      // update + draw nodes
      for (let i=0;i<nodes.length;i++){
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        // attract to mouse
        const dx = mx - n.x, dy = (my+parallax*n.z) - n.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < 40000){
          const f = (1 - d2/40000) * 0.04 * n.z;
          n.vx += dx*f*0.01; n.vy += dy*f*0.01;
        }
        // damp
        n.vx *= 0.985; n.vy *= 0.985;
        // wrap
        if (n.x<-20) n.x=w+20; if (n.x>w+20) n.x=-20;
        if (n.y<-20) n.y=h+20; if (n.y>h+20) n.y=-20;

        ctx.beginPath();
        ctx.fillStyle = "rgba(109,182,255,"+(0.18 + n.z*0.35)+")";
        ctx.arc(n.x, n.y - parallax*n.z*0.3, n.r, 0, Math.PI*2);
        ctx.fill();
      }

      // draw connections
      for (let i=0;i<nodes.length;i++){
        for (let j=i+1;j<nodes.length;j++){
          const a=nodes[i], b=nodes[j];
          const dx=a.x-b.x, dy=a.y-b.y, d2=dx*dx+dy*dy;
          if (d2<14000){
            const op = (1 - d2/14000) * 0.22;
            ctx.strokeStyle = "rgba(47,128,255,"+op+")";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y - parallax*a.z*0.3);
            ctx.lineTo(b.x,b.y - parallax*b.z*0.3);
            ctx.stroke();
          }
        }
      }

      // bursts (click ripples)
      for (let i=bursts.length-1;i>=0;i--){
        const br = bursts[i]; br.t++;
        const p = br.t/br.life;
        if (p>=1){ bursts.splice(i,1); continue; }
        ctx.beginPath();
        ctx.strokeStyle = "rgba(47,128,255,"+(1-p)*0.6+")";
        ctx.lineWidth = 1.5*(1-p);
        ctx.arc(br.x, br.y, 8 + p*120, 0, Math.PI*2);
        ctx.stroke();
      }

      requestAnimationFrame(tick);
    }
    if (!prefersReduced) tick();
  }
  window.BI_initConstellation = initConstellation;

  // ───────────────────────── FADE OBSERVER ─────────────────────────
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, {rootMargin:"-10% 0px", threshold:0.1});
  window.BI_observeReveal = (nodes)=>{ nodes.forEach(n=>io.observe(n)); };

  // ───────────────────────── KINETIC TEXT SPLIT ─────────────────────────
  window.BI_splitChars = function(el){
    const text = el.textContent;
    el.innerHTML = "";
    for (const ch of text){
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch === " " ? "\u00a0" : ch;
      el.appendChild(s);
    }
  };

  // ───────────────────────── CURSOR HALO ─────────────────────────
  function initCursor(){
    if (matchMedia("(hover:none)").matches || prefersReduced) return;
    const halo = document.createElement("div");
    halo.className = "bi-cursor-halo";
    document.body.appendChild(halo);
    let tx=0,ty=0,x=0,y=0;
    addEventListener("mousemove",e=>{tx=e.clientX;ty=e.clientY;});
    (function loop(){ x+=(tx-x)*0.18; y+=(ty-y)*0.18;
      halo.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop); })();
    document.addEventListener("mouseover",e=>{
      if (e.target.closest("[data-hover]")) halo.classList.add("lg");
      else halo.classList.remove("lg");
    });
  }
  window.BI_initCursor = initCursor;
})();
