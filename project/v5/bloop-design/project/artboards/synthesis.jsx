/* global React */
const { useState, useEffect, useRef } = React;

/* ============================================================
   ARTBOARD 1 — DA SYNTHESIS (palette, type, principes)
   ============================================================ */
function ArtboardSynthesis() {
  return (
    <div className="ab-synthesis">
      <div className="syn-header">
        <div className="syn-logo">
          <div className="syn-logo-shape">
            <span style={{color: 'var(--brand-coral)'}}>B</span>
            <span style={{color: 'var(--brand-sun)'}}>O</span>
            <span style={{color: 'var(--brand-mint)'}}>B</span>
            <span style={{color: 'var(--brand-sky)'}}>B</span>
            <span style={{color: 'var(--brand-grape)'}}>Y</span>
          </div>
          <div className="syn-tag">CARD ROGUELIKE — direction artistique</div>
        </div>
        <p className="syn-pitch">
          Un roguelike de cartes <b>joyeux, coloré et chaleureux</b> — entre Clash Royale, Brawl Stars et un livre pop-up.
          Chaque carte est un <b>autocollant brillant</b>, chaque coffre une <b>fête</b>, chaque combat un <b>cirque amical</b>.
          <b> Tous âges, tous sourires.</b>
        </p>
      </div>

      <div className="syn-grid">
        {/* PALETTE */}
        <section className="syn-card">
          <h3 className="syn-h3">Palette de marque</h3>
          <div className="swatch-row">
            {[
              ['Corail',   'var(--brand-coral)',  'Signature, énergie'],
              ['Soleil',   'var(--brand-sun)',    'Or, légendaire'],
              ['Menthe',   'var(--brand-mint)',   'Calme, soin'],
              ['Ciel',     'var(--brand-sky)',    'Air, magie'],
              ['Raisin',   'var(--brand-grape)',  'Mystère, rare'],
            ].map(([n,c,u]) => (
              <div className="swatch" key={n}>
                <div className="swatch-chip" style={{background: c}}/>
                <div className="swatch-name">{n}</div>
                <div className="swatch-use">{u}</div>
              </div>
            ))}
          </div>
          <h4 className="syn-h4">Stages — chaque acte change d'humeur</h4>
          <div className="stage-row">
            <div className="stage-band stage-band--1">
              <div className="stage-band-name">Acte I</div>
              <div className="stage-band-sub">Prairie Givrée</div>
            </div>
            <div className="stage-band stage-band--2">
              <div className="stage-band-name">Acte II</div>
              <div className="stage-band-sub">Jardin Magique</div>
            </div>
            <div className="stage-band stage-band--3">
              <div className="stage-band-name">Acte III</div>
              <div className="stage-band-sub">Royaume Doré</div>
            </div>
          </div>
        </section>

        {/* TYPO */}
        <section className="syn-card">
          <h3 className="syn-h3">Typographie</h3>
          <div className="type-spec">
            <div className="type-spec-label">Display — Lilita One</div>
            <div className="type-display">BOSS DEFEATED!</div>
            <div className="type-spec-meta">Titres, boss intro, raretés. Gros, rond, joyeux.</div>
          </div>
          <div className="type-spec">
            <div className="type-spec-label">Body — Nunito</div>
            <div className="type-body">
              Une carte commune, une carte légendaire — toutes deux donnent envie de jouer encore une manche.
            </div>
            <div className="type-spec-meta">Texte courant, descriptions, tooltips. Lisible 12px+.</div>
          </div>
          <div className="type-scale">
            <div><span className="ts-num">48</span><span className="ts-name">H1 Boss</span></div>
            <div><span className="ts-num">32</span><span className="ts-name">H2 Stage</span></div>
            <div><span className="ts-num">22</span><span className="ts-name">H3 Hub</span></div>
            <div><span className="ts-num">16</span><span className="ts-name">Body</span></div>
            <div><span className="ts-num">12</span><span className="ts-name">Caption</span></div>
          </div>
        </section>

        {/* PRINCIPES */}
        <section className="syn-card syn-card--wide">
          <h3 className="syn-h3">Principes</h3>
          <div className="principles">
            <div className="prin">
              <div className="prin-num">01</div>
              <div className="prin-t">Tout ressemble à un autocollant</div>
              <div className="prin-d">Cerne foncé épais, lift d'ombre solide, pas de flou. C'est tactile, on a envie d'y toucher.</div>
            </div>
            <div className="prin">
              <div className="prin-num">02</div>
              <div className="prin-t">La couleur raconte l'histoire</div>
              <div className="prin-d">Un coup d'œil suffit : la rareté, le stage, la santé — tout se lit en couleur avant le texte.</div>
            </div>
            <div className="prin">
              <div className="prin-num">03</div>
              <div className="prin-t">Ça respire, ça sourit</div>
              <div className="prin-d">Tout flotte, tout pulse, rien n'est figé. Idle = vivant. Les héros bougent en attendant le combat.</div>
            </div>
            <div className="prin">
              <div className="prin-num">04</div>
              <div className="prin-t">Pas un nuage de menace</div>
              <div className="prin-d">Les boss sont des "grands méchants" théâtraux : drôles, expressifs — jamais effrayants pour un enfant.</div>
            </div>
          </div>

          <h4 className="syn-h4" style={{marginTop: 20}}>Anti-références</h4>
          <div className="anti-row">
            {['❌ Dark fantasy sombre', '❌ Néon agressif', '❌ Pixel-art rétro', '❌ Anime chibi', '❌ Icônes Material plates'].map(t => (
              <span className="anti" key={t}>{t}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

window.ArtboardSynthesis = ArtboardSynthesis;
