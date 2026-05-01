/* global React */
const { useState, useEffect, useRef } = React;

/* ============================================================
   ARTBOARD 4 — Combat 1280×720 (V2 — animé, plus mature)
   ============================================================ */

function CombatHeroCard({ name, hp, hpMax, color, role, idx, attacking, casting, ko, onClick, selected }) {
  const pct = Math.max(0, hp / hpMax * 100);
  return (
    <div className={`chero ${attacking ? 'is-attacking' : ''} ${casting ? 'is-casting' : ''} ${ko ? 'is-ko' : ''} ${selected ? 'is-selected' : ''}`}
         style={{'--hidx': idx}}
         onClick={onClick}>
      <div className="chero-glow" style={{background: `radial-gradient(circle, ${color}66, transparent 70%)`}}/>
      <div className="chero-frame">
        <div className="chero-portrait" style={{background: `linear-gradient(180deg, ${color}33, #1a1530)`}}>
          <div className="chero-rays"/>
          <div className="chero-mascot">
            <div className="chero-hat" style={{background: color}}/>
            <div className="chero-head"/>
            <div className="chero-eye chero-eye--l"/>
            <div className="chero-eye chero-eye--r"/>
            <div className="chero-mouth"/>
            <div className="chero-cape" style={{background: color}}/>
          </div>
          {casting && <div className="chero-cast-ring" style={{borderColor: color, boxShadow: `0 0 20px ${color}`}}/>}
        </div>
        <div className="chero-bottom">
          <div className="chero-name">{name}</div>
          <div className="chero-role">{role}</div>
          <div className="chero-bar">
            <div className="chero-bar-fill" style={{width: `${pct}%`, background: pct > 50 ? 'var(--hp-good)' : pct > 25 ? 'var(--hp-warn)' : 'var(--hp-low)'}}/>
            <div className="chero-bar-text">{hp}/{hpMax}</div>
          </div>
          <div className="chero-cooldown">
            <div className="chero-cooldown-fill" style={{background: color}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnemyCard({ name, hp, hpMax, type, intent, attacking, hit, boss }) {
  const pct = Math.max(0, hp / hpMax * 100);
  const palette = {
    slime: { c: '#7dbe65', cream: '#3a4a2a', glow: '#aedb8e' },
    bat:   { c: '#b563ff', cream: '#2a1f3a', glow: '#d4a3ff' },
    boss:  { c: '#ff5fa2', cream: '#3a1a2a', glow: '#ffa3cf' },
  };
  const p = palette[type];
  return (
    <div className={`enemy ${boss ? 'enemy--boss' : ''} ${attacking ? 'is-attacking' : ''} ${hit ? 'is-hit' : ''}`}
         style={{'--ec': p.c, '--eg': p.glow}}>
      <div className="enemy-glow"/>
      <div className="enemy-frame">
        <div className="enemy-portrait" style={{background: `linear-gradient(180deg, ${p.cream}, #0a0818)`}}>
          {type === 'slime' && (
            <div className="e-slime" style={{background: p.c}}>
              <div className="e-slime-shine"/>
              <div className="e-eye e-eye--l"/>
              <div className="e-eye e-eye--r"/>
              <div className="e-mouth"/>
              <div className="e-drop e-drop--1"/>
              <div className="e-drop e-drop--2"/>
            </div>
          )}
          {type === 'bat' && (
            <div className="e-bat" style={{background: p.c}}>
              <div className="e-bat-wing e-bat-wing--l"/>
              <div className="e-bat-wing e-bat-wing--r"/>
              <div className="e-eye e-eye--l"/>
              <div className="e-eye e-eye--r"/>
              <div className="e-fangs"/>
            </div>
          )}
          {type === 'boss' && (
            <div className="e-boss" style={{background: p.c}}>
              <div className="e-boss-crown"/>
              <div className="e-boss-glow"/>
              <div className="e-eye e-eye--l"/>
              <div className="e-eye e-eye--r"/>
              <div className="e-boss-mouth"/>
              <div className="e-boss-spike e-boss-spike--l"/>
              <div className="e-boss-spike e-boss-spike--r"/>
              <div className="e-boss-aura"/>
            </div>
          )}
        </div>
        <div className="enemy-name">{name}</div>
        <div className="enemy-bar">
          <div className="enemy-bar-fill" style={{width: `${pct}%`}}/>
          <div className="enemy-bar-text">{hp}/{hpMax}</div>
        </div>
      </div>
      <div className={`intent intent--${intent.kind}`}>
        <span className="intent-icon">{intent.icon}</span>
        <span className="intent-v">{intent.value}</span>
      </div>
    </div>
  );
}

function ArtboardCombat() {
  const [tick, setTick] = useState(0);
  const [pulseSk, setPulseSk] = useState(null);
  const cycleRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setTick(t => t + 1), 1400);
    return () => clearInterval(t);
  }, []);

  // Cycle: 0 = bobby cast, 1 = ronan shoot, 2 = lila heal, 3 = enemy attack
  const phase = tick % 4;
  const attacker = phase;

  return (
    <div className="ab-combat">
      <div className="abc3-eyebrow-row">
        <div>
          <div className="abc3-eyebrow">LIVRABLE — COMBAT 1280×720 · V2 ANIMÉ</div>
          <h2 className="abc3-title">Le combat — vivant, premium, lisible</h2>
        </div>
        <p className="abc3-sub">Chaque sort est animé et cliquable. Les héros castent. Les ennemis respirent. Le HUD réagit. Plus mature : moins de pastel, plus de profondeur, mais toujours chaleureux.</p>
      </div>

      <div className="combat-screen">

        {/* Animated background layers */}
        <div className="combat-bg combat-bg--sky"/>
        <div className="combat-bg combat-bg--clouds"/>
        <div className="combat-bg combat-bg--mist"/>
        <div className="combat-bg combat-bg--specks"/>

        {/* Top: Run progress + HUD */}
        <div className="combat-top">
          <div className="combat-stage-pill">
            <span className="csp-icon">▲</span>
            ACTE III · VAGUE 8
          </div>
          <div className="combat-progress">
            {Array.from({length: 30}).map((_, i) => {
              const stage = Math.floor(i / 10);
              const done = i < 27;
              const cur = i === 27;
              const isBoss = (i + 1) % 10 === 0;
              return (
                <div
                  key={i}
                  className={`pp ${done ? 'pp--done' : ''} ${cur ? 'pp--cur' : ''} ${isBoss ? 'pp--boss' : ''} pp--s${stage+1}`}
                />
              );
            })}
          </div>
          <div className="combat-resources">
            <span className="cres"><span className="cres-icon" style={{background: 'var(--brand-sun)'}}>$</span><b>284</b></span>
            <span className="cres"><span className="cres-icon" style={{background: 'var(--brand-grape)'}}>◆</span><b>17</b></span>
          </div>
        </div>

        {/* Boss HP bar */}
        <div className="combat-boss-bar">
          <div className="cbb-name"><span className="cbb-star">★</span> ROI BRISÉ <span className="cbb-phase">— Phase II</span></div>
          <div className="cbb-bar">
            <div className="cbb-fill" style={{width: '42%'}}/>
            <div className="cbb-divider" style={{left: '50%'}}/>
            <div className="cbb-text">126 / 300</div>
          </div>
        </div>

        {/* Battlefield */}
        <div className="combat-field">
          <div className="combat-floor"/>
          <div className="combat-floor-grid"/>

          {/* Heroes */}
          <div className="combat-side combat-side--heroes">
            <CombatHeroCard idx={0} name="BOBBY"  role="Bouclier"  hp={28} hpMax={42} color="#b563ff" attacking={phase === 0} casting={phase === 0}/>
            <CombatHeroCard idx={1} name="LILA"   role="Soigneuse" hp={36} hpMax={36} color="#4ec5e8" attacking={phase === 2} casting={phase === 2} selected/>
            <CombatHeroCard idx={2} name="RONAN"  role="Tireur"    hp={12} hpMax={28} color="#ffb938" attacking={phase === 1} casting={phase === 1}/>
          </div>

          {/* Center: spell layer */}
          <div className="combat-center">
            {/* Magic projectile (Bobby) */}
            <div key={`m-${tick}-${phase===0}`} className={`spell spell--magic ${phase === 0 ? 'is-active' : ''}`}>
              <div className="spell-orb"/>
              <div className="spell-trail"/>
            </div>
            {/* Phys projectile (Ronan) */}
            <div key={`p-${tick}-${phase===1}`} className={`spell spell--phys ${phase === 1 ? 'is-active' : ''}`}>
              <div className="spell-arrow"/>
            </div>
            {/* Heal (Lila) */}
            <div key={`h-${tick}-${phase===2}`} className={`spell spell--heal ${phase === 2 ? 'is-active' : ''}`}>
              <div className="spell-cross"/>
              <div className="spell-cross spell-cross--2"/>
              <div className="spell-cross spell-cross--3"/>
            </div>
            {/* Enemy AOE */}
            <div key={`a-${tick}-${phase===3}`} className={`spell spell--aoe ${phase === 3 ? 'is-active' : ''}`}>
              <div className="spell-shock"/>
            </div>

            {/* Floating numbers — re-keyed each phase to retrigger */}
            {phase === 0 && <>
              <div key={`fn1-${tick}`} className="fnum fnum--dmg" style={{left: '60%', top: '32%'}}>-24</div>
              <div key={`fn2-${tick}`} className="fnum fnum--dmg-small" style={{left: '64%', top: '46%'}}>-8</div>
            </>}
            {phase === 1 && <div key={`fn3-${tick}`} className="fnum fnum--crit" style={{left: '62%', top: '38%'}}>-58 ✦</div>}
            {phase === 2 && <div key={`fn4-${tick}`} className="fnum fnum--heal" style={{left: '24%', top: '52%'}}>+12</div>}
            {phase === 3 && <div key={`fn5-${tick}`} className="fnum fnum--dmg" style={{left: '28%', top: '38%'}}>-9</div>}
          </div>

          {/* Enemies */}
          <div className="combat-side combat-side--enemies">
            <EnemyCard name="Slime gluant"  hp={18} hpMax={32}  type="slime" intent={{kind:'attack',icon:'⚔',value:6}} attacking={phase === 3} hit={phase === 0}/>
            <EnemyCard name="Chauve-souris" hp={9}  hpMax={18}  type="bat"   intent={{kind:'debuff',icon:'☁',value:'-DEF'}} hit={phase === 1}/>
            <EnemyCard name="Roi Brisé"     hp={126} hpMax={300} type="boss"  intent={{kind:'aoe',icon:'✦',value:'AOE 12'}} boss/>
          </div>
        </div>

        {/* Footer: skills + consumables */}
        <div className="combat-footer">
          <div className="combat-skills">
            {[
              {name: 'CÂLIN PROTECTEUR', cd: 'PRÊT',  ready: true,  color: '#b563ff', icon: '✦', kind: 'magic'},
              {name: 'SOIN DE GROUPE',   cd: '3.2s',  ready: false, color: '#4ec5e8', icon: '✚', kind: 'heal',  pct: 64},
              {name: "PLUIE D'OR",       cd: 'PRÊT',  ready: true,  color: '#ffb938', icon: '⚡', kind: 'phys'},
            ].map((s, i) => (
              <button key={i}
                      className={`sk ${s.ready ? 'sk--ready' : 'sk--cooling'} ${pulseSk === i ? 'is-pulse' : ''}`}
                      onClick={() => { setPulseSk(i); setTimeout(() => setPulseSk(null), 400); }}>
                <div className="sk-icon" style={{background: s.color, boxShadow: s.ready ? `0 0 16px ${s.color}` : 'none'}}>
                  <span>{s.icon}</span>
                  {s.ready && <div className="sk-icon-pulse" style={{borderColor: s.color}}/>}
                </div>
                <div className="sk-meta">
                  <div className="sk-name">{s.name}</div>
                  <div className="sk-cd">{s.cd}</div>
                </div>
                {!s.ready && <div className="sk-cdbar"><div className="sk-cdbar-fill" style={{width: `${s.pct}%`, background: s.color}}/></div>}
                <div className="sk-key">{i + 1}</div>
              </button>
            ))}
          </div>
          <div className="combat-consumables">
            <div className="cons">
              <div className="cons-icon" style={{background: 'var(--hp-good)'}}>❤</div>
              <div className="cons-name">Potion</div>
              <div className="cons-qty">×2</div>
            </div>
            <div className="cons">
              <div className="cons-icon" style={{background: 'var(--rage)'}}>⚡</div>
              <div className="cons-name">Bombe</div>
              <div className="cons-qty">×1</div>
            </div>
            <div className="cons cons--empty">
              <div className="cons-name">Slot vide</div>
            </div>
          </div>
          <div className="combat-speed">
            <button className="speed-btn">×1</button>
            <button className="speed-btn speed-btn--active">×1.25</button>
            <button className="speed-btn">×1.5</button>
          </div>
        </div>
      </div>

      <div className="abc3-notes">
        <div className="abc3-note">
          <b>Sorts animés (5 types)</b>
          <span>Magie : orbe + traînée violette 520ms. Physique : flèche or 380ms + crit 1.4×. Soin : 3 croix vertes flottantes 600ms. Bouclier : pulse circulaire 400ms. AOE : onde de choc 700ms.</span>
        </div>
        <div className="abc3-note">
          <b>HUD cliquable & vivant</b>
          <span>Sorts prêts <code>pulsent en halo</code>. Au clic : flash + pulse + projectile. Cooldown = barre qui se remplit + opacité réduite. Touche numérique affichée. Hover = lift.</span>
        </div>
        <div className="abc3-note">
          <b>Personnages & ennemis</b>
          <span>Idle : flotte + respire (delay décalé par index). Cast : ring d'invocation. Slime : gouttes qui tombent. Chauve-souris : ailes qui battent. Boss : aura instable, breathe 2.4s, couronne dorée.</span>
        </div>
      </div>
    </div>
  );
}

window.ArtboardCombat = ArtboardCombat;
