/* global React */
const { useState, useEffect, useRef } = React;

/* ============================================================
   ARTBOARD 3 — Coffre runique + Loot box roulette
   ============================================================ */

function Chest({ tier, opening = false }) {
  const tiers = {
    damaged: { color: '#a8957c', deep: '#6b5847', glow: '#c9b89c', name: 'ABÎMÉ' },
    bronze:  { color: '#d97a3c', deep: '#8a4218', glow: '#ffa66b', name: 'BRONZE' },
    silver:  { color: '#b8c4d4', deep: '#677687', glow: '#e0eaf5', name: 'ARGENT' },
    royal:   { color: '#ffc845', deep: '#b87f00', glow: '#ffe082', name: 'ROYAL' },
    runic:   { color: '#5fdfff', deep: '#1f7fa8', glow: '#a3eaff', name: 'RUNIQUE' },
  };
  const t = tiers[tier];
  return (
    <div className={`chest chest--${tier} ${opening ? 'is-opening' : ''}`}
         style={{'--ccolor': t.color, '--cdeep': t.deep, '--cglow': t.glow}}>
      <div className="chest-shadow"/>
      <div className="chest-aura"/>
      <div className="chest-body">
        {/* Lid */}
        <div className="chest-lid">
          <div className="chest-lid-band-top"/>
          <div className="chest-lid-keyhole"/>
          <div className="chest-lid-stud chest-lid-stud--l"/>
          <div className="chest-lid-stud chest-lid-stud--r"/>
        </div>
        {/* Box */}
        <div className="chest-box">
          <div className="chest-box-band"/>
          <div className="chest-box-lock"/>
          {tier === 'runic' && (
            <>
              <div className="chest-rune chest-rune--1">✦</div>
              <div className="chest-rune chest-rune--2">✧</div>
              <div className="chest-rune chest-rune--3">✦</div>
            </>
          )}
        </div>
        {/* Light burst when opening */}
        {opening && <div className="chest-burst"/>}
      </div>
      <div className="chest-name">{t.name}</div>
    </div>
  );
}

const LOOT_ITEMS = [
  { name: 'Bobby',    rarity: 'common'    },
  { name: 'Lila',     rarity: 'rare'      },
  { name: 'Pip',      rarity: 'common'    },
  { name: 'Roko',     rarity: 'epic'      },
  { name: 'Mira',     rarity: 'rare'      },
  { name: 'Tovo',     rarity: 'common'    },
  { name: 'Yuki',     rarity: 'rare'      },
  { name: 'Caspio',   rarity: 'epic'      },
  { name: 'Bambu',    rarity: 'common'    },
  { name: 'Solène',   rarity: 'rare'      },
  { name: 'Drago',    rarity: 'epic'      },
  { name: 'Lumi',     rarity: 'common'    },
  { name: 'Veska',    rarity: 'rare'      },
  { name: 'Ronan',    rarity: 'legendary' }, // ★ winner — center
  { name: 'Nira',     rarity: 'epic'      },
  { name: 'Kuro',     rarity: 'rare'      },
  { name: 'Pommi',    rarity: 'common'    },
  { name: 'Glaive',   rarity: 'rare'      },
];

function MiniRoulettePortrait({ rarity }) {
  const palette = {
    common:    { c: '#9aa3b2', cream: '#ecedf0', hat: '#9aa3b2' },
    rare:      { c: '#4ec5e8', cream: '#e0f4fb', hat: '#4ec5e8' },
    epic:      { c: '#b563ff', cream: '#f1e3ff', hat: '#b563ff' },
    legendary: { c: '#ffb938', cream: '#fff2d1', hat: '#ffb938' },
  };
  const p = palette[rarity];
  return (
    <div className="mini-portrait" style={{background: `linear-gradient(180deg, ${p.cream}, white)`}}>
      <div className="mini-head">
        <div className="mini-hat" style={{background: p.hat}}/>
        <div className="mini-eye mini-eye--l"/>
        <div className="mini-eye mini-eye--r"/>
        <div className="mini-mouth"/>
      </div>
    </div>
  );
}

function Roulette() {
  // Strip with winner card at index 13 (Ronan, legendary)
  const winnerIdx = 13;
  const itemW = 110; // width per item
  const visibleItems = 5;
  const stripW = LOOT_ITEMS.length * itemW;
  // We want winner centered: offset = winnerIdx * itemW - (visibleItems-1)/2 * itemW + half item
  const centerOffset = winnerIdx * itemW - (visibleItems / 2 - 0.5) * itemW;

  const [phase, setPhase] = useState('idle'); // idle -> spinning -> done

  useEffect(() => {
    const cycle = () => {
      setPhase('idle');
      setTimeout(() => setPhase('spinning'), 600);
      setTimeout(() => setPhase('done'), 600 + 2700);
    };
    cycle();
    const t = setInterval(cycle, 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rou">
      <div className="rou-frame">
        <div className="rou-marker"/>
        <div className="rou-fade rou-fade--l"/>
        <div className="rou-fade rou-fade--r"/>
        <div
          className={`rou-strip rou-strip--${phase}`}
          style={{
            width: stripW,
            transform: phase === 'idle'
              ? `translateX(0)`
              : `translateX(-${centerOffset}px)`,
          }}
        >
          {LOOT_ITEMS.map((item, i) => (
            <div key={i} className={`rou-item rou-item--${item.rarity} ${i === winnerIdx && phase === 'done' ? 'is-winner' : ''}`}>
              <MiniRoulettePortrait rarity={item.rarity}/>
              <div className="rou-item-name">{item.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rou-status">
        {phase === 'idle'     && <span>⟶ Prêt à ouvrir</span>}
        {phase === 'spinning' && <span className="rou-status--spin">↻ La roue tourne...</span>}
        {phase === 'done'     && <span className="rou-status--done">★ LÉGENDAIRE ! Ronan rejoint la collection</span>}
      </div>
    </div>
  );
}

function ArtboardChests() {
  const [openingRunic, setOpeningRunic] = useState(false);
  useEffect(() => {
    const cycle = () => {
      setOpeningRunic(false);
      setTimeout(() => setOpeningRunic(true), 1500);
    };
    cycle();
    const t = setInterval(cycle, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ab-chests">
      <div className="abc2-header">
        <div>
          <div className="abc2-eyebrow">LIVRABLE — COFFRES & LOOT BOX</div>
          <h2 className="abc2-title">Le coffre = un moment fort</h2>
          <p className="abc2-sub">5 tiers de coffre final + roulette de loot box. Cérémoniel mais joyeux : runes qui s'allument une par une, couvercle qui se soulève en flottant, lumière qui monte. Pas de gambling, probabilités toujours visibles.</p>
        </div>
      </div>

      {/* 5 Tiers */}
      <h3 className="abc2-h3">Les 5 tiers de coffre final</h3>
      <div className="chest-row">
        {['damaged','bronze','silver','royal','runic'].map(t => (
          <div key={t} className="chest-cell">
            <Chest tier={t} opening={t === 'runic' && openingRunic}/>
          </div>
        ))}
      </div>

      {/* Roulette */}
      <h3 className="abc2-h3" style={{marginTop: 28}}>Roulette légendaire (séquence boucle)</h3>
      <Roulette/>

      <div className="abc2-notes">
        <div className="abc2-note">
          <div className="abc2-note-h">Ouverture du coffre runique</div>
          <ol>
            <li>Le coffre flotte et brille (idle — rune du couvercle pulse 3s).</li>
            <li>Au clic : 3 runes s'allument une par une (200ms chaque).</li>
            <li>Le couvercle se soulève lentement (700ms, easing custom), un souffle de lumière monte.</li>
            <li>Burst central — la carte sort en glissant vers le centre de l'écran.</li>
            <li>Rareté révélée : sparks, halo, son cristallin (futur audio).</li>
          </ol>
        </div>
        <div className="abc2-note">
          <div className="abc2-note-h">Roulette — règles</div>
          <ul>
            <li>18 items, item gagnant déterministe, position fixe (idx 13).</li>
            <li>Easing <code>cubic-bezier(.12,.85,.25,1)</code> sur 2500ms — départ rapide, fin glissée.</li>
            <li>Marqueur central immobile, fades latéraux gauche/droite (focus visuel).</li>
            <li>Leurres : 1-2 items "presque" (rareté élevée mais pas la cible) près du centre, psychologie du "presque".</li>
            <li>Pity affiché en clair : "5 sans rare → +5%". Aucune incitation à acheter.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

window.ArtboardChests = ArtboardChests;
