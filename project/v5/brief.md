# Brief V5 — Implémentation pixel-perfect du bundle Bobbycard DA

## Contexte

L'utilisateur a fourni un **bundle de design Claude Design** complet via l'API Anthropic. Il pointe explicitement vers `Bobbycard DA.html` et dit :

> *« recupere le design du standalone car il respect la da que je souhaite sans changé la nature du jeux donc revois le standalone recupere les assets ect sans denaturé les gameplay du jeu »*

> *« Implement: Bobbycard DA.html »*

Le README du bundle dit explicitement :
> *« Read Bobbycard DA.html in full. Then follow its imports. Recreate them pixel-perfectly in whatever technology makes sense. Match the visual output. »*

**Mission V5 = implémentation fidèle à la maquette, sans dénaturer le gameplay V1+V2+V3.**

V4 (livrée précédemment) a fait du re-skinning, mais avec des écarts visuels et des classes CSS V4 dead code. V5 corrige ça en s'alignant **exactement** sur les fichiers source du bundle :

```
project/v5/bloop-design/
├── README.md
├── chats/{chat1,chat2,chat3}.md      # 3 transcripts (intent user)
└── project/
    ├── Bobbycard DA.html              # entry point
    ├── tokens.css                     # tokens partagés (déjà en V4)
    ├── artboards/
    │   ├── _shared.css                # btn/pill/keyframes (float-y/shimmer-x/pulse-halo/spark/breathe/wobble/spin-slow)
    │   ├── synthesis.css/jsx          # page de présentation DA
    │   ├── cards.css/jsx              # pcard 5 raretés + mascotte hp-* + sparkles
    │   ├── chests.css/jsx             # 5 tiers + roulette
    │   └── combat.css/jsx             # 1280×720 nuit violet/rose mature
    └── ...
```

## Intent user (validé via les chats)

3 décisions clés (extraites de chats-summary.md) :
1. **Palette joyeuse, all-ages** : Corail / Soleil / Menthe / Ciel / Raisin — style **Clash Royale**, **PAS** dark fantasy.
2. **Typo + Animation** : Lilita One (display) + Nunito (body) + animations idle par rareté.
3. **Combat 1280×720 mature** : palette **nuit violet/rose** (pas crème), héros animés (Bobby/Lila/Ronan), ennemis vivants (slime rebondit, chauve-souris vole, Roi Brisé pulse), sorts cliquables, HUD interactif, projectiles 4 types (magic / phys / heal / aoe).

Anti-références :
- Dark fantasy / runique
- Trop enfantin
- Statique / fade

## Constat V4 (à corriger en V5)

V4 a re-skinné mais avec **écarts visuels** :
- **Combat** : V4 a mis skybox `bg-sky-day` (clair) sur stage 1. Bundle = palette nuit violet/rose mature partout combat. **Erreur fondamentale**.
- **Mascottes** : V4 a fait un composant `HeroMascot` unique avec 22 variants. Bundle = pattern différent par contexte (`chero-mascot` combat vs `hp-*` carte détaillée vs `e-slime/e-bat/e-boss` ennemis vs `mini-*` roulette).
- **CombatScreen** : V4 n'a pas câblé les 4 layers `combat-bg--{sky,clouds,mist,specks}` ni les sorts `spell--{magic,phys,heal,aoe}`.
- **Boss bar** : V4 émet probablement `boss-hp-bar` au lieu de `combat-boss-bar` + `cbb-fill`.
- **RunProgress** : 30 dots V4 mais classes différentes du bundle (`pp pp--s{1,2,3} pp--cur pp--boss`).
- **Roulette** : V4 a `rou-marker` mais structure différente du bundle (`rou-strip` + `rou-item` 110px).
- **Coffre** : V4 a `chest-aura/body/lid/runes/burst` câblés mais valeurs `--ccolor/--cdeep/--cglow` non posées par tier.

V2/V3 préservés (reducer, hooks de test, save) — **on ne touche pas au gameplay**.

## Périmètre V5 — par phase

### Phase A — Reset CSS du bundle dans styles.css

Coller **intégralement** dans `src/styles.css` (en remplaçant tout bloc V4 conflictuel) :

1. **`tokens.css`** (110 lignes) — `:root` déjà appliqué en V4, **vérifier identique au bundle**.
2. **`_shared.css`** (105 lignes) — utilities (.btn / .pill / @keyframes float-y / shimmer-x / pulse-halo / spark / breathe / wobble / spin-slow) + `@media (prefers-reduced-motion)`.
3. **`cards.css`** (213 lignes) — `.pcard*` complet + mascotte `hp-*` + sparkles.
4. **`chests.css`** (254 lignes) — `.chest*` 5 tiers + `.rou*` complète.
5. **`combat.css`** (611 lignes) — combat complet 1280×720, **palette nuit violet/rose**, 4 bg layers, 3 héros chero, 3 types ennemis, 4 spells, fnum, footer skills + consumables + speed.

**Important** : ces blocs CSS sont déjà ~partiellement en V4. Stratégie : **remplacer** les blocs V4 correspondants par les blocs V5 fidèles, sans toucher aux classes V2/V3 stables (HUD primary, atelier, hub onglets, modales recyclage/replace consumable).

Audit : grep dans `src/styles.css` les classes communes V4 vs V5 pour identifier les overrides à faire.

### Phase B — Suppression du HeroMascot V4

V4 a créé un composant React `<HeroMascot>` avec 22 variants. **Le bundle n'a pas ce composant**. Il a 4 mascottes inlined CSS+JSX différentes selon le contexte :

| Contexte | Pattern bundle | Composant à émettre |
|----------|---------------|---------------------|
| Carte détaillée (Collection, Atelier preview, Lootbox reveal, Final chest reveal) | `pcard-portrait > hp-*` | `<HeroPortrait rarity={r}>` (cf. cards.jsx L39-70) |
| Combat hero card | `chero-portrait > chero-mascot` | inline JSX avec `chero-hat / chero-head / chero-eye / chero-mouth / chero-cape` |
| Combat enemy | `enemy-portrait > e-{slime,bat,boss}` | inline JSX par type |
| Roulette item | `mini-portrait > mini-*` | inline JSX |

**Action** : supprimer/déprécier `<HeroMascot>`, remplacer chaque appel par le pattern correct selon le contexte.

### Phase C — Adaptation des composants React

Pour chaque composant existant, **changer le markup** pour produire les classes attendues par le CSS du bundle :

#### `CharacterCardDetailed` (Collection, Atelier preview, Lootbox reveal, Final chest reveal)
Émettre exactement la structure de `cards.jsx` :
```jsx
<div className={`pcard pcard--${rarity}`} style={{'--rcolor':..., '--rdeep':..., '--rcream':...}}>
  <div className="pcard-halo" />
  <Sparkles count={particles} color={sparkColor} />
  <div className="pcard-frame">
    <div className="pcard-top">
      <div className="pcard-rank">RANG {rank}</div>
      <div className="pcard-rarity-badge"><span className="rrb-dot"/> {fr}</div>
    </div>
    <div className={`pcard-portrait pcard-portrait--${idle}`}>
      {locked ? <div className="pcard-locked">...</div> : <HeroPortrait rarity={r}/>}
    </div>
    <div className="pcard-name">{name}</div>
    <div className="pcard-role">{role}</div>
    <div className="pcard-stats">
      <Stat icon="❤" label="PV" v={hp} color="var(--hp-good)"/>
      ...
    </div>
    <div className="pcard-skill">...</div>
    <div className="pcard-trait">...</div>
    <div className="pcard-foot">...</div>
  </div>
</div>
```

#### `CombatHero` (combat compact)
Émettre `chero` selon `combat.jsx` L8-42 :
```jsx
<div className={`chero ${attacking?'is-attacking':''} ${casting?'is-casting':''} ${ko?'is-ko':''}`} style={{'--hidx':idx}}>
  <div className="chero-glow" style={{background:`radial-gradient(circle, ${color}66, transparent 70%)`}}/>
  <div className="chero-frame">
    <div className="chero-portrait" style={{background:`linear-gradient(180deg, ${color}33, #1a1530)`}}>
      <div className="chero-rays"/>
      <div className="chero-mascot">
        <div className="chero-hat" style={{background:color}}/>
        <div className="chero-head"/>
        <div className="chero-eye chero-eye--l"/>
        <div className="chero-eye chero-eye--r"/>
        <div className="chero-mouth"/>
        <div className="chero-cape" style={{background:color}}/>
      </div>
      {casting && <div className="chero-cast-ring" style={{borderColor:color}}/>}
    </div>
    <div className="chero-bottom">
      <div className="chero-name">{name}</div>
      <div className="chero-role">{role}</div>
      <div className="chero-bar">
        <div className="chero-bar-fill" style={{width:`${pct}%`, background:hpColor}}/>
        <div className="chero-bar-text">{hp}/{hpMax}</div>
      </div>
      <div className="chero-cooldown"><div className="chero-cooldown-fill" style={{width:`${cdPct}%`, background:color}}/></div>
    </div>
  </div>
</div>
```

#### `EnemyCard`
Émettre `enemy` selon `combat.jsx` L44-102, avec branchement par type :
- type `slime` → `<div class="e-slime">` + drops + eyes + mouth
- type `bat` → `<div class="e-bat">` + wings + eyes + fangs
- type `boss` → `<div class="e-boss">` + crown + eyes + mouth + spikes + aura

Chaque enemy doit recevoir `mascot` mappé depuis le nom (existant V4 : `mapEnemyNameToVariant`). Mais en V5 les variants sont réduits à `slime | bat | boss` au lieu de 17 — élégant.

Les ennemis non-slime/bat/boss du jeu (witch, ghost, vine, golem, royal-guard) → re-mapper vers slime/bat/boss selon esprit (la DA accepte cette simplification).

#### `BossHpBar`
Émettre exactement :
```jsx
<div className="combat-boss-bar">
  <div className="cbb-name">
    <span className="cbb-star">★</span>
    {bossName}
    <span className="cbb-phase">— Phase {phase}</span>
  </div>
  <div className="cbb-bar">
    <div className="cbb-fill" style={{width:`${pct}%`}}/>
    <div className="cbb-divider" style={{left:'50%'}}/>
    <div className="cbb-text">{hp} / {hpMax}</div>
  </div>
</div>
```

#### `RunProgress`
Émettre 30 dots :
```jsx
<div className="combat-progress">
  {Array.from({length:30}).map((_,i)=>{
    const stage = Math.floor(i/10);
    const done = i < currentWave-1;
    const cur = i === currentWave-1;
    const isBoss = (i+1) % 10 === 0;
    return <div key={i} className={`pp ${done?'pp--done':''} ${cur?'pp--cur':''} ${isBoss?'pp--boss':''} pp--s${stage+1}`}/>;
  })}
</div>
```

#### `combat-top` ressources (or, fragments)
Émettre `cres` :
```jsx
<div className="combat-resources">
  <span className="cres"><span className="cres-icon" style={{background:'var(--brand-sun)'}}>$</span><b>{gold}</b></span>
  <span className="cres"><span className="cres-icon" style={{background:'var(--brand-grape)'}}>◆</span><b>{fragments}</b></span>
</div>
```

#### `combat-stage-pill`
Émettre :
```jsx
<div className="combat-stage-pill">
  <span className="csp-icon">▲</span>
  ACTE {romanize(stage)} · VAGUE {wave}
</div>
```

(Conserver les noms de stages V2 — Cryptes Froides etc. — décision V4 préservée.)

#### `CombatScreen` background
Ajouter les 4 layers :
```jsx
<div className="combat-bg combat-bg--sky"/>
<div className="combat-bg combat-bg--clouds"/>
<div className="combat-bg combat-bg--mist"/>
<div className="combat-bg combat-bg--specks"/>
```

#### Sorts (spells) — nouveau système V5
Ajouter une couche `combat-center` avec 4 spells qui s'activent via `is-active` selon `state.run.animQueue` :
- `spell--magic` (orb violet + trail) — pour skills magiques
- `spell--phys` (arrow or) — pour skills physiques
- `spell--heal` (3 crosses verts) — pour skills heal
- `spell--aoe` (shock wave rose mythic) — pour skills aoe / ennemi boss aoe

Mapper les types de skills existants V1+V2+V3 vers ces 4 catégories visuelles.

#### `FinalChest`
Émettre la composition complète (déjà partielle en V4 correctifs) :
```jsx
<div className={`chest chest--${tier} ${opening?'is-opening':''}`} style={{'--ccolor':wood, '--cdeep':deep, '--cglow':glow}}>
  <div className="chest-aura"/>
  <div className="chest-shadow"/>
  <div className="chest-body">
    <div className="chest-lid">
      <div className="chest-lid-band-top"/>
      <div className="chest-lid-keyhole"/>
      <div className="chest-lid-stud chest-lid-stud--l"/>
      <div className="chest-lid-stud chest-lid-stud--r"/>
    </div>
    <div className="chest-box">
      <div className="chest-box-band"/>
      <div className="chest-box-lock"/>
    </div>
  </div>
  {tier === 'runic' && <>
    <span className="chest-rune chest-rune--1">✦</span>
    <span className="chest-rune chest-rune--2">★</span>
    <span className="chest-rune chest-rune--3">◆</span>
  </>}
  {opening && <div className="chest-burst"/>}
</div>
```

Mappings tier → couleurs (cf. tokens.css) :
| Tier | --ccolor | --cdeep | --cglow |
|------|----------|---------|---------|
| damaged | `#8a7060` | `#4a3a30` | `#aaa` |
| bronze | `var(--chest-bronze) #d97a3c` | `#7a3e1e` | `var(--brand-coral)` |
| silver | `var(--chest-silver) #b8c4d4` | `#5a6878` | `var(--brand-sky)` |
| royal | `var(--chest-royal) #ffc845` | `var(--rarity-legendary-deep)` | `var(--rarity-legendary)` |
| runic | `#3a2f5e` | `#1a1530` | `var(--chest-runic) #5fdfff` |

#### `LootRoulette`
Émettre :
```jsx
<div className="rou">
  <div className="rou-frame">
    <div className="rou-fade rou-fade--l"/>
    <div className="rou-marker"/>
    <div className={`rou-strip ${idle?'rou-strip--idle':''}`} style={{transform:`translateX(${offset}px)`}}>
      {items.map((it,i) => (
        <div key={i} className={`rou-item rou-item--${it.rarity} ${i===finalIndex && phase==='reveal'?'is-winner':''}`}>
          <div className="mini-portrait" style={{background:`radial-gradient(circle, ${rarityColor(it.rarity)}33, white)`}}>
            <div className="mini-head">
              <div className="mini-hat" style={{background:rarityColor(it.rarity)}}/>
              <div className="mini-eye mini-eye--l"/>
              <div className="mini-eye mini-eye--r"/>
              <div className="mini-mouth"/>
            </div>
          </div>
          <div className="rou-item-name">{it.name}</div>
        </div>
      ))}
    </div>
    <div className="rou-fade rou-fade--r"/>
  </div>
  <div className={`rou-status rou-status--${phase}`}>{statusLabel(phase)}</div>
</div>
```

#### Boutons (CTA)
Remplacer `.primary-action` / `.btn-primary` par `.btn .btn--primary` etc. du bundle (`_shared.css` L31-54). Conserver IDs Playwright.

### Phase D — Mappings spécifiques

#### Mapping persos V1+V2+V3 → mascotte carte détaillée
Le `HeroPortrait` du bundle (cards.jsx L39-70) prend une `rarity` et fabrique une mascotte générique : tête + chapeau colorée par rareté + yeux + joues + sourire + cape. **Pas de variant par perso**.

→ Action : tous les persos utilisent le même portrait, **la couleur du chapeau et de la cape vient de la rareté**, pas de l'identité du perso. C'est la décision DA validée. (Si l'utilisateur veut différencier les persos plus tard : V6.)

Exception : pour Bobby (héros principal), Ronan (gourmand), Lila (soigneuse), on peut envisager des variantes mineures (ex: chapeau toque pour Ronan). À discuter en revue.

#### Mapping ennemis V1+V2+V3 → type DA
| Stage / Wave | Ennemi V1+V2+V3 | Type DA |
|---|---|---|
| Stage 1 | slime, witch | `slime` |
| Stage 1 | bat, ghost | `bat` |
| Stage 2 | sorcière, vine, plante | `slime` (vert toxique) ou `bat` |
| Stage 2 | fantôme | `bat` |
| Stage 3 | royal-guard, golem, soldier | `slime` (vert garde) ou `bat` |
| Boss vague 10 | Gardien des Cendres | `boss` (palette ember rose/orange) |
| Boss vague 20 | Sorcière du Vide | `boss` (palette violet) |
| Boss vague 30 | Roi Brisé | `boss` (palette rose nacré mythic) |

→ Helper `mapEnemyToDAType(name, stage)` qui retourne `slime|bat|boss` + `palette` adaptée.

#### Mapping skills → spell type
| Skill type V2/V3 | spell type |
|---|---|
| skill physique (Ronan, Roi Brisé spike) | `phys` |
| skill magique (Bobby Câlin, Sorcière) | `magic` |
| skill heal (Lila, Gardien) | `heal` |
| skill aoe (Sorcière vide, Roi Brisé final) | `aoe` |

→ Helper qui détermine le spell type depuis le skill.

### Phase E — Conservation V2/V3 stricte

**Aucun changement** sur :
- Reducer `state` / actions / save / migrations
- `render_game_to_text`, `advanceTime`, hooks `__game_test_*`
- Localstorage clé `runebound-cards-save-v1`
- Mécaniques combat (cooldowns, dégâts, buffs)
- Hub flow (5 onglets, achats, recyclage)
- Lootbox flow (4 types, pity, probabilités)
- Reliques de boss
- Stages 3 + boss
- Coffre tier-aware logique (juste skin)

### Phase F — Tests

```bash
npm run build
```

Doit passer sans erreur ni warning.

Le user devra valider visuellement chez lui :
- Menu, Sélection équipe — cartes détaillées candy
- Stage intro
- Combat — palette nuit violet/rose, 4 bg layers animés, héros chero, ennemis slime/bat/boss, sorts visibles, boss bar mythic
- Boss intro 1600ms
- Hub 5 onglets — boutique, lootbox, recyclage, équipe, stats
- Lootbox roulette — marker coral pointu, 18 items, mini-portraits
- Reveal rareté — selon les 5 idle anims (static, shimmer, pulse, breathe, wobble)
- Coffre final — composition complète + 5 tiers visuellement distincts

## Risques

- **Volume du chantier CSS** : le bundle ajoute ~1500 lignes nouvelles à `styles.css`. V4 a déjà 6187 lignes. Cible : viser ~7000 lignes max après nettoyage des classes V4 dead code.
- **Ennemis simplifiés à 3 types** : peut frustrer la diversité visuelle V1+V2+V3 (qui avait 17 variants). Trade-off : fidélité DA vs variété. Décision : suivre la DA, accepter la simplification (le user a explicitement dit "respecte la DA").
- **Spells au lieu de projectiles V3** : V3 avait `.projectile` simple. V5 a 4 spells animés. Ne pas perdre les anims V3 simples qui fonctionnent.
- **Combat-screen bg gradient** : changer du clair (V4) au sombre nuit violet (V5). Contraste : héros cream vs ennemis sombres reste visible grâce au contraste.

## Critère de succès

Quand `npm run dev` est lancé, le user doit voir :
- Menu cohérent avec DA (joyeux, all-ages)
- **Combat = palette nuit violet/rose mature**, héros animés, ennemis slime/bat/boss vivants, sorts visibles
- Cartes détaillées identiques aux 5 raretés du bundle (mascotte hp-* + halo + sparkles + stats grid 2×3 + skill encadré + trait + frag/rank stars)
- Coffres avec composition complète (lid rotateX + studs + aura + runes runic + chest-burst à l'ouverture)
- Roulette identique au bundle (marker coral pointu + fade + 18 items)
- 0 régression V2/V3 (gameplay intact, mécaniques préservées)
- Build TypeScript clean
- prefers-reduced-motion couvert

## Pas demandé

- Pas de nouveau gameplay
- Pas de nouvelles mécaniques
- Pas de nouveaux ennemis/persos/items
- Pas de changement save
- Pas de renommage stages
- Pas de phrases boss différentes (garder V4)
