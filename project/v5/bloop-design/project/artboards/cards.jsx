/* global React */

/* ============================================================
   ARTBOARD 2 — Carte personnage : 5 raretés côte à côte
   ============================================================ */

const HERO = {
  name: 'BOBBY',
  role: 'Bouclier joyeux',
  hp: 42,
  atk: 8,
  def: 6,
  spd: 4,
  skill: 'Câlin Protecteur',
  skillDesc: 'Donne +12 PB à un allié et lui rend 6 PV.',
  trait: 'Ami fidèle',
  traitDesc: 'Quand un allié est K.O., gagne +20% ATQ pour 2 vagues.',
  rank: 'III',
};

const RARITIES = [
  { key: 'common',    label: 'Commune',    fr: 'Commune',
    color: 'var(--rarity-common)',    deep: 'var(--rarity-common-deep)',
    cream: 'var(--rarity-common-cream)', particles: 0, idle: 'static', sparkColor: '#bcc4d0' },
  { key: 'rare',      label: 'Rare',       fr: 'Rare',
    color: 'var(--rarity-rare)',      deep: 'var(--rarity-rare-deep)',
    cream: 'var(--rarity-rare-cream)', particles: 3, idle: 'shimmer', sparkColor: '#7ad8f5' },
  { key: 'epic',      label: 'Épique',     fr: 'Épique',
    color: 'var(--rarity-epic)',      deep: 'var(--rarity-epic-deep)',
    cream: 'var(--rarity-epic-cream)', particles: 5, idle: 'pulse', sparkColor: '#d49bff' },
  { key: 'legendary', label: 'Légendaire', fr: 'Légendaire',
    color: 'var(--rarity-legendary)', deep: 'var(--rarity-legendary-deep)',
    cream: 'var(--rarity-legendary-cream)', particles: 8, idle: 'breathe', sparkColor: '#ffd97a' },
  { key: 'mythic',    label: 'Mythique',   fr: 'Mythique',
    color: 'var(--rarity-mythic)',    deep: 'var(--rarity-mythic-deep)',
    cream: 'var(--rarity-mythic-cream)', particles: 12, idle: 'wobble', sparkColor: '#ffa3cf' },
];

function HeroPortrait({ rarity }) {
  // Portrait CSS pur : "blob mascotte" — tête ronde, yeux, sourire, chapeau
  // Couleur du chapeau dépend de la rareté
  return (
    <div className="hp-wrap">
      <div className="hp-spotlight" style={{background: `radial-gradient(circle, ${rarity.color}55, transparent 70%)`}}/>
      <div className="hp-body">
        <div className="hp-head">
          {/* Chapeau */}
          <div className="hp-hat" style={{background: rarity.color, borderColor: 'var(--ink)'}}>
            <div className="hp-hat-band"/>
            <div className="hp-hat-pom" style={{background: rarity.cream}}/>
          </div>
          {/* Yeux */}
          <div className="hp-eyes">
            <div className="hp-eye"><div className="hp-pupil"/></div>
            <div className="hp-eye"><div className="hp-pupil"/></div>
          </div>
          {/* Joues */}
          <div className="hp-cheek hp-cheek--l"/>
          <div className="hp-cheek hp-cheek--r"/>
          {/* Sourire */}
          <div className="hp-mouth"/>
        </div>
        {/* Cape / corps */}
        <div className="hp-cape" style={{background: rarity.color}}>
          <div className="hp-cape-shine"/>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ count, color }) {
  if (count === 0) return null;
  const sparks = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (i * 0.7);
    const r = 60 + (i % 3) * 18;
    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;
    const delay = (i * 0.35) % 3;
    const size = 4 + (i % 4);
    sparks.push(
      <span
        key={i}
        className="sparkle"
        style={{
          '--dx': `${dx}px`,
          '--dy': `${dy}px`,
          width: size, height: size,
          background: color,
          animationDelay: `${delay}s`,
        }}
      />
    );
  }
  return <div className="sparkles">{sparks}</div>;
}

function CharacterCard({ rarity, hero, locked = false, hover = false }) {
  return (
    <div className={`pcard pcard--${rarity.key} ${hover ? 'is-hover' : ''} ${locked ? 'is-locked' : ''}`}
         style={{
           '--rcolor': rarity.color,
           '--rdeep': rarity.deep,
           '--rcream': rarity.cream,
         }}>
      {/* Halo extérieur */}
      <div className="pcard-halo"/>
      {/* Particules ambiantes */}
      <Sparkles count={rarity.particles} color={rarity.sparkColor}/>

      <div className="pcard-frame">
        {/* Bandeau supérieur */}
        <div className="pcard-top">
          <div className="pcard-rank">RANG {hero.rank}</div>
          <div className={`pcard-rarity-badge`}>
            <span className="rrb-dot"/> {rarity.fr}
          </div>
        </div>

        {/* Portrait */}
        <div className={`pcard-portrait pcard-portrait--${rarity.idle}`}>
          {locked ? (
            <div className="pcard-locked">
              <div className="pcard-q">?</div>
              <div className="pcard-locked-tag">À DÉBLOQUER</div>
            </div>
          ) : <HeroPortrait rarity={rarity}/>}
        </div>

        {/* Nom + rôle */}
        <div className="pcard-name">{locked ? '???' : hero.name}</div>
        <div className="pcard-role">{locked ? 'Trouve-le dans un coffre' : hero.role}</div>

        {/* Stats grid 2×3 */}
        <div className="pcard-stats">
          <Stat icon="❤" label="PV"  v={hero.hp} color="var(--hp-good)"/>
          <Stat icon="⚔" label="ATQ" v={hero.atk} color="var(--rage)"/>
          <Stat icon="🛡" label="DEF" v={hero.def} color="var(--shield)"/>
          <Stat icon="⚡" label="VIT" v={hero.spd} color="var(--brand-sun)"/>
          <Stat icon="✦" label="MAG" v="—" color="var(--mana)"/>
          <Stat icon="✚" label="SOIN" v="—" color="var(--hp-good)"/>
        </div>

        {/* Skill */}
        <div className="pcard-skill">
          <div className="pcard-skill-head">
            <span className="pcard-skill-icon">★</span>
            <span className="pcard-skill-name">{hero.skill}</span>
          </div>
          <div className="pcard-skill-desc">{hero.skillDesc}</div>
        </div>

        {/* Trait */}
        <div className="pcard-trait">
          <span className="pcard-trait-tag">TRAIT</span>
          <span className="pcard-trait-name">{hero.trait}</span>
        </div>

        {/* Pied */}
        <div className="pcard-foot">
          <div className="pcard-foot-l">
            <span className="pcard-frag">◆ 12</span>
            <span className="pcard-frag-lbl">FRAGMENTS</span>
          </div>
          <div className="pcard-rank-stars">
            {Array.from({length: 5}).map((_, i) => (
              <span key={i} className={`rs ${i < 3 ? 'rs--on' : ''}`}>★</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, v, color }) {
  return (
    <div className="stat">
      <div className="stat-icon" style={{background: color}}>{icon}</div>
      <div className="stat-meta">
        <div className="stat-v">{v}</div>
        <div className="stat-l">{label}</div>
      </div>
    </div>
  );
}

function ArtboardCards() {
  return (
    <div className="ab-cards">
      <div className="abc-header">
        <div>
          <div className="abc-eyebrow">LIVRABLE — CARTE PERSONNAGE</div>
          <h2 className="abc-title">5 raretés, un même héros</h2>
          <p className="abc-sub">Couleur dominante + halo + particules + animation idle. Tout est en CSS pur, cernes épais, ombres "autocollant". Identique en collection, atelier et reveal.</p>
        </div>
        <div className="abc-legend">
          <div><span className="lg-dot" style={{background: 'var(--rarity-common)'}}/>0 part. — statique</div>
          <div><span className="lg-dot" style={{background: 'var(--rarity-rare)'}}/>3 part. — shimmer</div>
          <div><span className="lg-dot" style={{background: 'var(--rarity-epic)'}}/>5 part. — pulse</div>
          <div><span className="lg-dot" style={{background: 'var(--rarity-legendary)'}}/>8 part. — breathe</div>
          <div><span className="lg-dot" style={{background: 'var(--rarity-mythic)'}}/>12 part. — wobble</div>
        </div>
      </div>

      <div className="abc-grid">
        {RARITIES.map(r => (
          <div key={r.key} className="abc-cell">
            <CharacterCard rarity={r} hero={HERO} hover={r.key === 'epic'}/>
            <div className="abc-cell-cap">
              <span className="abc-cell-name">{r.fr}</span>
              {r.key === 'epic' && <span className="abc-cell-state">hover</span>}
              {r.key === 'mythic' && <span className="abc-cell-state mythic">réservé</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="abc-states">
        <div className="abc-state">
          <CharacterCard rarity={RARITIES[2]} hero={HERO} locked/>
          <div className="abc-state-cap">État verrouillé — silhouette + tagline</div>
        </div>
        <div className="abc-state-notes">
          <h4 className="abc-h4">Notes d'animation</h4>
          <ul>
            <li><b>Commune</b> : statique. Halo léger, pas de particules. C'est l'ancre du système.</li>
            <li><b>Rare</b> : shimmer linéaire toutes les 4s sur la bordure. 3 particules cyan tournent doucement.</li>
            <li><b>Épique</b> : halo pulse 3s. 5 particules violettes orbitent. Hover = lift -3px.</li>
            <li><b>Légendaire</b> : la carte respire (breathe 6s). 8 sparks dorées. Bordure shimmer + halo or.</li>
            <li><b>Mythique</b> : wobble doux. 12 particules nacrées. Réservé au boss final / achievements.</li>
            <li><b>Reduced motion</b> : tout devient statique, halo gardé en opacité fixe, particules supprimées.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

window.ArtboardCards = ArtboardCards;
