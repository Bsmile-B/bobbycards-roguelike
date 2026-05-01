# Mascots — Catalogue 17 variants

## Composant React

`<HeroMascot variant size mood className style />` (existe déjà côté architect spec, le frontend-dev l'implémente en V4-T4).

Sizes mappées sur token CSS `--m` :
- `xs` : 36px (mini-portrait roulette, sparkles légendaires)
- `sm` : 50px (CombatHero compact)
- `md` : 80px (combat normal, ennemi)
- `lg` : 140px (CharacterCardDetailed portrait, hub team grid)
- `xl` : 200px (BossIntroOverlay, RarityReveal)

Moods (overrides via `[data-mascot-mood]`) :
- `idle` : float-y 3s (par défaut, hérité du `.hero-mascot`)
- `attacking` : `chero-attack` 0.45s (translate+rotate). Variante `enemy` pour côté ennemi.
- `hurt` : `hurt-shake` 0.32s + brightness 0.85
- `ko` : statique, grayscale + opacity 0.6, yeux X, bouche inversée
- `happy` : sourire amplifié, joues 100%
- `angry` : yeux mi-clos + bouche inversée

## Catalogue 17 variants

Le composant doit accepter **17 variants** (les 16 demandés + `bobby` fallback). Les bosses (3) sont à part. Chacun pose ses CSS variables locales via `data-mascot-variant`.

### Héros (7 variants)

| Variant | Skin | Hat | Hat shape | Cape | Signature |
|--|--|--|--|--|--|
| `bobby` | `#ffe1c2` peau cream | `--brand-coral` | rond pointu doux | `--brand-grape` | Mascotte par défaut, héros forgé custom |
| `rogue` | `#f4d4a8` | `#2a2147` capuche noire | profonde | `#1a1530` | Pupille décalée (regard malicieux), joues atténuées |
| `mage` | `#f7e4d0` | `--rarity-epic` violet | pointu très haut | `--rarity-epic-deep` | Pompon sun sur chapeau pointu sorcier |
| `guardian` / `knight` | `#c8d4e0` métal | `#8a96a8` heaume | semi-rond | `--brand-sky` | Pas de joues, bouche stricte droite |
| `gourmand` (Ronan) | `#ffd6b8` | `white` toque | toque ronde | `--brand-coral` | Joues rouges 85% (gourmand), pompon blanc |
| `archer` | `#f0d4a8` | `--brand-mint` | capuche profonde | mint deep | Capuche verte, pompon sun |
| `priest` | `#ffe9d0` | `--brand-sun` | capuche dorée | white | Halo `✦` accessory subtil |

### Ennemis Stage 1 — Cryptes Froides (2 variants)

| Variant | Skin | Hat | Cape | Signature |
|--|--|--|--|--|
| `slime` | `#6fc7a8` corps cyan-vert | aucun | aucune | Bouche béante large, pas d'accessoire |
| `bat` | `#8b6db8` violet | aucun | `#5a3f8a` ailes wobble | Cape redéployée en ailes (`bat-flap` 0.6s), yeux jaunes brillants |

### Ennemis Stage 2 — Sanctuaire du Vide (3 variants)

| Variant | Skin | Hat | Cape | Signature |
|--|--|--|--|--|
| `ghost` | `#f4f0ff` blanc fantomatique | aucun | aucune | Yeux noirs creux à pupilles blanches, bouche ovale béante |
| `witch` | `#d4c2e8` lilas | `--rarity-mythic` pointu xxl | `--rarity-epic-deep` | Joues poison vert acide, accessory `✦` |
| `plant` / `vine` | `--poison` vert acide | feuilles vertes (border-radius 50%) | aucune | Pas de joues, yeux verts profonds |

### Ennemis Stage 3 — Salle du Roi Brisé (3 variants)

| Variant | Skin | Hat | Cape | Signature |
|--|--|--|--|--|
| `guard` / `royal-guard` | `#d4c8a8` heaume doré | `--brand-sun` heaume | `--rarity-legendary-deep` | Pas de joues, bouche stricte |
| `golem` | `#b8a888` pierre | aucun | aucune | Yeux brillants `--brand-sun`, bouche fissure |
| `soldier` | `#e8c896` | `--rarity-legendary` | `--brand-coral` | Joues 30%, équipe royale |

### Boss (3 variants — accessory crucial)

| Variant | Skin | Hat | Cape | Accessory | Signature |
|--|--|--|--|--|--|
| `boss-cinder` (Gardien des Cendres) | `oklch(60% 0.20 30)` ember | `--rarity-legendary-deep` brûlé | `oklch(40% 0.20 25)` | `👑` | Joues coral 85%, yeux `--brand-sun`, ember chaleur |
| `boss-void` (Sorcière du Vide) | `--rarity-mythic-cream` | `--rarity-mythic` pointu xxl 0.95 | `--rarity-mythic-deep` | `✦` | Pupille rose mythic, joues poison |
| `boss-king` (Roi Brisé) | `#f4d4a8` | `--rarity-legendary` capuche basse | `--brand-grape` royale | `👑` | Pupille rose mythic (lueur folie), couronne fissurée |

## Mapping persos jeu → variants

Voir `specs.md §5.d / §5.e` pour table exhaustive. Le composant React fait le lookup `(name) → variant` via une table, fallback `bobby`.

## Garde-fous accessibilité

- Le composant React doit recevoir un `aria-label` calculé selon variant + mood (ex: "Bobby, en attaque").
- Sur reduced-motion, **toutes** les animations (float-y, bat-flap, hurt-shake, chero-attack) sont désactivées par le bloc global de `tokens.css`.
- Yeux X du KO restent visibles (statiques).

## Risques perf identifiés

- **Float-y sur 7 cartes en combat** : translate-only, GPU-composé, OK (cf. décision V4 perf-guard).
- **Bat-flap** : `transform: scaleY` sur cape, GPU-composé, OK.
- `filter: blur(1px)` sur joues : 1px constant, pas animé, **non comptabilisé** dans le cap.
- `filter: grayscale + brightness` sur KO : statique, pas de coût animé.

## Précisions DOM/CSS pour le dev

1. **L'`accessory::before` lit `var(--mascot-accessory-content)`** — le React passe juste `data-mascot-variant`, le CSS choisit l'emoji. Pas besoin de logique React.
2. La structure DOM est **identique** pour tous variants. Aucun `display: none` au niveau React. Tout passe par `--mascot-{hat|cape|accessory}-display: none`.
3. **`--m` est l'unité fondamentale**. Tout est multiple de `--m`. Pour ajouter une taille (ex: `2xl 280px`), il suffit d'ajouter une classe `.hero-mascot--2xl { --m: 280px; }`.
4. **Le composant est totalement présentation** : pas de state interne, pas de hook combat. Le `mood` est calculé par le parent (CombatHero, EnemyCard) selon `hp`, `is-attacking`, etc.
