# Passation Architect → Designer — V3 Game feel

## Ce que tu dois absolument retenir

1. **0 nouveau contenu**. Pas de nouvelles cartes, pas de nouveaux ennemis, pas de nouveau hub. Tu redessines des choses qui existent déjà : la lootbox, les coffres, les cartes, la sensation d'attaque, l'arrivée des boss. Ton travail = donner de la profondeur visuelle à ce qui est déjà jouable.
2. **Dark fantasy continue, jamais fluo**. La V2 a posé le ton (`#0b0a0c` fond, accents pierre/violet/or, palettes des 3 stages). On ne sature pas. On ne passe jamais en néon. La rareté légendaire est un OR profond, pas un OR vif.
3. **Performance non négociable**. Le jeu tourne pendant tout un combat (5 ennemis max), parfois en ×1.5. Tes animations doivent être en `transform` et `opacity`. Pas de `filter` sur grand élément animé en continu. Pas de particules > 16 simultanées en combat. Les particules lourdes sont réservées aux *moments* (révélation, boss intro).
4. **`prefers-reduced-motion` est une contrainte de design, pas un afterthought**. Pour CHAQUE animation que tu spécifies, tu dois fournir une alternative statique (bordure, fade ≤ 200 ms, opacity step). Charge le skill `anthropic-skills:reduced-motion-accessibility-guardian` AVANT de commencer.
5. **Charge aussi `anthropic-skills:motion-performance-guardian`**. Tu spécifies des animations qui couvrent la durée totale d'un combat (~5–60 s). Le moindre paint coûteux × 60 fps = chute de framerate.

## Décisions déjà prises (pointeurs decisions.md V3)

- **Extension in-place** : on suit la même politique que V2, pas d'extraction de modules React tant que `App.tsx` reste navigable. Tu peux référencer des composants comme s'ils étaient des "blocs" dans le fichier unique.
- **Phases LootboxScreen** : `idle → shake → roulette → reveal → opened`. Le reducer `OPEN_LOOTBOX` est dispatché *à la fin de la phase shake*, donc le résultat est connu au début de la roulette (pas de triche).
- **CharacterCardDetailed** : nouveau composant, **pas** une refonte de `CombatHero`. Le combat reste compact. La carte détaillée est utilisée en collection / reveal lootbox / reveal coffre / preview creator.
- **Vitesse combat** : token CSS `--combat-speed: 1` injecté sur `.combat-screen`. Tes durations doivent être écrites comme `animation-duration: calc(<base>ms / var(--combat-speed))`. Cela permet au dev de scaler tout le combat d'un seul coup.
- **AnimQueue** : la couche d'animations est pilotée par une queue d'events typés (`CombatAnimEvent`). Tes specs doivent décrire le comportement *à partir d'un event* (par ex. "à `target-hit`, jouer ces 180 ms de shake"), pas le couplage à un champ d'état.

## Tâches qui te sont assignées

- V3-T4 — Specs animations + tokens scaling vitesse
- V3-T5 — Trajectoires d'attaque (5 types) + projectiles
- V3-T10 — Floating numbers (format/taille/couleur/regroupement)
- V3-T12 — CharacterCardDetailed
- V3-T14 — Tokens CSS raretés + 5 effets distincts (commun → mythique placeholder)
- V3-T16 — 5 tiers de coffres animés
- V3-T18 — LootRoulette (strip horizontal)
- V3-T20 — RarityReveal (5 effets de révélation)
- V3-T23 — BossIntroOverlay

## Ce qui doit être designé exhaustivement

### A. Roulette horizontale (V3-T18)
- Strip de 18 cartes/items, chacune ~140×180 px.
- Marqueur central runique (curseur fixe).
- Easing : `cubic-bezier(0.13, 0.85, 0.25, 1)` ou équivalent, ralentissement net en fin de course.
- Durée totale : **2500 ms** (impératif perf + impératif test).
- Index final fixe : `14` sur 18 (le résultat est connu, on positionne l'arrêt).
- Tension : positions 16 et 17 doivent contenir des leurres de rareté ≥ rareté finale (effet "j'ai presque eu mieux"), mais non frustrant — les leurres sont génériques visuellement, le marqueur central reste sur la 14.
- Visuel des items : portraits runiques compacts, badge rareté en haut.
- Reduced-motion : pas de strip, fade-in direct du résultat 200 ms.

### B. 5 effets de révélation (V3-T20)
- **Commun** : flash gris/blanc ~220 ms, scale 1.05, pas de particules.
- **Rare** : flash bleu froid ~280 ms, particules bleues x6, halo léger.
- **Épique** : aura violette ~380 ms, particules violettes x10, scale pulse 1.08.
- **Légendaire** : explosion dorée ~600 ms, particules dorées x16, halo doré persistant 2 s, **micro-shake écran ±2 px sur 180 ms** (seul cas de shake écran de tout le jeu).
- **Mythique (placeholder)** : faisceau blanc/or, ralenti dramatique ~900 ms — **réservé**, aucune carte n'est mythique en V3, mais le hook visuel doit exister pour le futur.
- Reduced-motion : pour tous, bordure de couleur appropriée + opacity step 200 ms. Pas de particules.

### C. 5 trajectoires d'attaque (V3-T5)
Chaque trajectoire part du centre de la carte source et atteint le centre de la carte cible :
- **Physical** : trait/slash horizontal qui se déplace en 200 ms, suivi d'un éclat blanc à l'impact.
- **Magic** : projectile runique (small SVG/CSS shape) avec trail qui s'estompe, 320 ms.
- **Heal** : flux ascendant vers un allié (vertical-ish), particules vertes-claires, 320 ms.
- **Shield** : pas un projectile, c'est un cercle/rune qui se forme autour de l'allié pendant 280 ms.
- **Poison** : particules persistantes courtes (~600 ms) qui restent sur la cible.
- Pour chacun : forme, couleur, taille, easing, particules, version reduced-motion (statique : un trait fixe + flash impact unique).

### D. Réactions impacts (V3-T9 — spec côté T4/T5 mais à détailler)
- Ennemi touché : flash blanc 90 ms (scale 1 → 1.04 → 1) + shake ±3 px 180 ms.
- Allié touché : flash rouge sombre 120 ms + shake ±2 px 180 ms.
- Bouclier consommé : flash bleuté 100 ms.
- < 30% HP : aura instable continue (pulse rouge lent 2 s, opacity 0.4 ↔ 0.7) — **désactivée** si reduced-motion.

### E. Floating numbers (V3-T10)
- Variants : `PH` (blanc/gris), `MAG` (violet), `SOIN` (vert), `BCL` (bleu), `CRIT` (or, ×1.4 taille), `POISON` (purple-acid), `BRULURE` (orange-red).
- Position : centre cible ±4 % écran.
- Animation : `translateY(-22px)` sur 720 ms, opacity 1 → 0.
- Regroupement : si plusieurs flashes < 120 ms d'écart sur la même cible → 1 seul label `-24 / -8` (max 3 valeurs).
- Anti-superposition : décalage horizontal en zigzag stable (variant déterministe par hash de `flash.id`).
- Reduced-motion : opacity step 0 → 1 sur 200 ms, pas de translation.

### F. CharacterCardDetailed (V3-T12)
- Layout (voir specs §4.6 ASCII).
- Hiérarchie : Nom (h2) > Portrait > Stats > Compétence (encadrée) > Trait > Fragments > Rang.
- Badges : Rareté (haut gauche), Rôle (haut droite).
- Bordure + halo selon rareté.
- Légendaire : bordure animée subtile (rotation lente d'un dégradé doré, 6 s loop, **désactivée** reduced-motion).
- Tient en grille collection 4 colonnes × 1280×720 (donc largeur cible ~280 px).
- Portrait runique conservé (réutiliser le système V1/V2 existant).

### G. 5 tiers de coffres animés (V3-T16)
- **damaged** : bois fissuré, pas d'animation idle (juste un léger frémissement 4 s loop), faible glow gris.
- **bronze** : bois + ferrures bronze, glow chaud léger, particules ambrées x2 lentes.
- **silver** : argent terni, reflets cycliques 3 s, glow argenté.
- **royal** : or, glow doré chaud, particules dorées x4, légère pulsation.
- **runic** : runes bleues/or animées (cycle 4 s, opacity 0.5 ↔ 1), halo bleu glacé + or, animation idle premium.
- Reduced-motion : tous statiques, juste les couleurs/textures.

### H. Boss intro pleine page (V3-T23)
Séquence 1600 ms exacte (à détailler frame par frame) :
- 0–200 ms : fond s'assombrit (overlay 88 % noir).
- 200–400 ms : nom du boss apparaît (h1 doré pour Gardien, violet pour Sorcière, or-rouge pour Roi Brisé), fade-in.
- 400–1000 ms : carte boss monte (scale 0.7 → 1, translateY 100 px → 0), durée 600 ms.
- 600–1200 ms : aura colorée pulse derrière la carte (couleur de stage).
- 1000–1300 ms : texte "BOSS DE STAGE" apparaît sous le nom.
- 1300–1600 ms : maintien de la scène.
- 1600 ms : auto-dismiss.
- Reduced-motion : 200 ms total, fade-in du nom + carte statique, pas de scale ni d'aura.

## Pièges à éviter

- **Ne pas multiplier les boucles d'animation continues**. Chaque boucle (`infinite`) = un GPU layer permanent. Cap : 4 max simultanés en combat (carte boss aura, < 30 % HP aura, sigil-breathe, run-progress pulse). Tout le reste est event-triggered (`forwards`).
- **Ne pas utiliser `filter: blur` ou `filter: drop-shadow` sur grands éléments**. C'est ce qui tue le framerate. Préfère `box-shadow` ou un pseudo-element flou pré-calculé.
- **Ne pas oublier les boss V2** (Gardien des Cendres, Sorcière du Vide, Roi Brisé) — chacun doit recevoir sa palette d'aura et son nom stylé dans l'intro. Pas de boss générique.
- **Ne pas casser la palette V2 des stages** : ton accent doit dialoguer avec `--stage-1-accent` (`#6FB3D2`), `--stage-2-accent` (`#8E5BD5`), `--stage-3-accent` (`#C9A24A`). L'aura boss doit être *cohérente* avec le stage, pas en conflit.
- **Ne pas livrer de spec sans token reduced-motion**. Refuser une animation que tu n'as pas su rendre statique en reduced-motion.

## Contraintes de test (à intégrer dans tes specs de timing)

- Roulette : durée totale 2500 ms (impératif). Le dev expose `__game_test_skip_roulette()` qui force l'arrêt en 1 frame (~16 ms) — ta spec doit fonctionner avec et sans skip.
- Boss intro : durée totale 1600 ms (impératif). Hook `__game_test_skip_boss_intro()` symétrique.
- Lootbox shake : 320 ms.
- Lootbox reveal : variable selon rareté (220/280/380/600/900 ms).
- **Total ouverture lootbox sans skip ni reduced** : 320 + 2500 + 600 + (manuel) ≤ ~3.5 s. Si reduced-motion : ≤ 400 ms.

## Skills à charger AVANT de commencer

```
anthropic-skills:reduced-motion-accessibility-guardian
anthropic-skills:motion-performance-guardian
```

Lis-les. Référence-les dans tes specs.

## Livrables attendus

Dans `project/v3/design/` :
- `animations.md` (V3-T4)
- `projectiles.md` (V3-T5)
- `floating-numbers.md` (V3-T10)
- `character-card-detailed.md` (V3-T12)
- `css-tokens.md` (V3-T14, étendu V2)
- `rarities.md` (V3-T14)
- `chests.md` (V3-T16)
- `lootbox-roulette.md` (V3-T18)
- `rarity-reveal.md` (V3-T20)
- `boss-intro.md` (V3-T23)
- `handoffs/designer-to-dev.md` consolidé

Pas besoin de `draft.html` (cf. décision V2). Pas de Figma. Markdown + ASCII + tokens CSS.

## Pour clore

Si tu trouves une ambiguïté qui te bloque vraiment (par ex. "on fait quoi pour les particules en reduced-motion ?"), append dans `project/v3/questions.md` avec `[BLOCKING]`. Sinon, tranche et logge dans `project/v3/decisions.md`. Tu as la main sur les choix de timing détaillés tant qu'ils respectent les durées-plafond ci-dessus.
