# Brief V4 — Application de la DA "Joyful Direction" au jeu

## Contexte

L'utilisateur a fourni une **direction artistique** sous forme de fichier HTML standalone : `Bobbycard DA - standalone.html`. Extraction complète : `project/v4/da-extracted.md`.

> Citation utilisateur (verbatim) : *« voici le design ne copie pas sur pour sur le fichier design que je t'ai donné mais tu peux te basé dessus pour le jeu »*

→ **Inspiration**, pas portage littéral. Liberté d'adaptation.

## Constat

La DA est une **rupture totale** vs ce qui est dans le code :
- Genre : **cartoon candy chunky** (Clash Royale × Cult of the Lamb × Cookie Run) au lieu de dark fantasy runique
- Fond : `#1a1530` violet-bleu nuit étoilée (jamais noir pur) au lieu de `#0b0a0c`
- Texte : sombre `#261a3d` sur **cream** `#fff5e1` au lieu d'ivoire sur sombre
- Polices : **Lilita One** (display chunky) + **Nunito** (body) + **JetBrains Mono**
- Signature : **cerne 3px ink + sticker shadow** `0 6px 0 rgba(38,26,61,0.45)` sur tous les éléments
- Mascottes : **vraies têtes rondes expressives** (face, chapeau, yeux, joues roses, sourire, cape) en CSS pur, pas silhouettes abstraites
- Raretés ravivées : Mythique **activée** en rose nacré `#ff5fa2`
- Stages renommés : **Prairie Givrée** / **Jardin Magique** / **Royaume Doré** au lieu de Cryptes / Vide / Roi Brisé
- Animations : `float-y` (flottement permanent), `chero-attack` (translate + rotate au combat), `breathe` / `wobble` raretés, `chest-burst`, `fnum-rise` plus expressifs

## Mission V4

**Refondre la peau visuelle du jeu pour adopter la direction "Joyful Direction"**, sans casser :
- la structure (V1 mécaniques + V2 progression/économie + V3 game feel/animQueue/roulette/pity).
- le gameplay (reducer, combat, hub, boutique, lootboxes, recyclage, consommables, reliques).
- les hooks de test (`render_game_to_text`, `advanceTime`, `__game_test_*`).
- la sauvegarde (`runebound-cards-save-v1`, migration silencieuse).

Le **squelette** reste. **L'enveloppe visuelle** change.

## Périmètre — Phasage recommandé (cf. da-extracted.md §15)

### Phase A — Fondation tokens (priorité 1)
1. Importer Google Fonts via `index.html` (Lilita One 400 ; Nunito 400/600/700/800 ; JetBrains Mono 400) avec `preconnect` Google Fonts.
2. Remplacer les `:root` tokens existants dans `src/styles.css` :
   - Fond, ink, neutres warmer
   - Variables `--brand-coral/mint/sun/sky/grape`
   - 3 stages OKLCH + variantes deep/cream
   - 5 raretés candy + variantes deep/cream (mythique activée)
   - Stats fonctionnelles (hp-good/warn/low, shield, mana, rage, poison)
   - 5 tiers coffres (wood/bronze/silver/royal/runic cyan)
   - `--r-sm/md/lg/xl/pill`, `--stroke`, `--shadow-stick-sm/lg/glow/soft`
   - `--font-display/body/mono`
3. Adapter `body` et `app-shell` au nouveau fond `#1a1530` + `font-family: var(--font-body)`.
4. **Vérifier** que la migration des tokens ne casse pas les classes V2/V3 existantes : si une classe utilisait `var(--bg-deep)` ou `var(--ink)`, elle reçoit automatiquement la nouvelle valeur. Si une classe utilisait un hex en dur, elle ne change pas — repasse-la en token.

### Phase B — Cartes personnages & raretés
5. Refondre `.character-card-detailed` selon pattern double-inset :
   ```
   border: 3px solid var(--ink);
   box-shadow:
     inset 0 0 0 4px var(--rcolor),
     inset 0 0 0 6px white,
     0 6px 0 rgba(38,26,61,0.45);
   ```
6. Halo radial extérieur avec `position: absolute; inset: -12px; background: radial-gradient(circle, var(--rcolor), transparent 65%)`.
7. Idle animations par rareté : commun static, rare shimmer-x, épique pulse-halo, légendaire breathe, mythique wobble.
8. Sparkles (positionnement absolu animation `spark`) pour légendaire/mythique.
9. Rendre la **mascotte CSS** (tête + chapeau + yeux + joues + bouche + cape) au sein du portrait ; en faire un composant React paramétrable (`<HeroMascot variant="...">`).

### Phase C — Combat (skin sans toucher la mécanique)
10. Refondre `.hero-card` (combat compact) avec mini-mascotte.
11. Refondre `.enemy-card` avec mascottes type slime / bat / boss couronne (cf. css-tokens.md §11). Le boss reste 1.4× scale.
12. Refondre `.boss-hp-bar` : fond `rgba(38,26,61,0.85)` + nom mythic glow + barre dégradé `mythic → coral`.
13. Refondre `.run-progress` : `paper` bg + dots colorés par stage + dot courant coral pulsant + dots boss carrés gold quand done.
14. Stage pill (grape pill avec icône stage).
15. Ressources (or, fragments) en pill blanc avec icône cercle coloré.
16. Skill cards chunky avec icône carré + label + cooldown sun.
17. Speed selector pill avec coral active.
18. Attaque héros : nouvelle keyframe `chero-attack` (translate(20px,-10px) rotate(4deg) sur 0.45s). Idem `enemy-attack` symétrique.
19. Floating numbers : Lilita One stroke ink + `fnum-rise` 1.6s avec scale.
20. Skybox par stage : `bg-sky-day` (S1), `bg-sky-dusk` magique violet (S2), `bg-sky-dusk` doré (S3). Visible derrière le combat-screen.

### Phase D — Coffres & roulette
21. Refondre `FinalChest` (5 tiers) : aura radial colorée + body float-y + lid avec band/keyhole/studs + box avec lock + animations idle (pulse-halo runic, etc.).
22. Animation d'ouverture : lid `rotateX(-100deg)` 700ms + `chest-burst` radial scaleY 0.4→2.4.
23. Refondre `LootRoulette` : frame paper-line + marker central coral pointu (4px + triangles haut/bas) + fade gauche/droite + items 110px (mini-portrait 56×56 + name Lilita One). Easing 2700ms `cubic-bezier(.12,.85,.25,1)`.
24. `.rou-status` : default ink-soft, `--spin` grape, `--done` legendary-deep + glow.

### Phase E — Hub & onglets
25. Refondre `HubScreen` : background skybox approprié (sky-dusk royal entre stage 1→2, sky-day vers 2→3).
26. Onglets pill + cards cream sticker.
27. Boutique : items en cards cream avec rarity-cream bg, prix en pill, boutons coral/grape/sun.
28. Lootbox tab : 4 cards de lootboxes avec aura radial colorée.
29. Recyclage : modale chunky + bouton primary coral.
30. Équipe : grille mascottes + indicateur swap gratuit/payant.
31. Stats : tableau Nunito 700 + valeurs Lilita One.

### Phase F — Renommage narratif (à faire ou non — décision orchestrateur)
32. Renommer les stages dans le code : Cryptes Froides → **Prairie Givrée**, Sanctuaire du Vide → **Jardin Magique**, Salle du Roi Brisé → **Royaume Doré**.
33. Renommer ou adapter les boss : Gardien des Cendres → ? (un boss de prairie givrée), Sorcière du Vide → ? (jardin magique), Roi Brisé → un Roi de Royaume Doré (peut rester Roi Brisé pour conserver l'arc tragique).
34. Phrases d'ambiance boss : à inventer dans le ton candy joyeux (mais boss reste menaçant).

⚠ Discussion de la phase F : l'utilisateur n'a **pas explicitement demandé** de renommer. Recommandation : **proposer le renommage en option** dans les specs, le faire seulement si confirmé OU si cohérence visuelle l'exige. Par défaut : **garder les noms V2** mais adapter le ton visuel.

## Contraintes dures

- TypeScript strict, 0 `any`.
- Build TypeScript clean obligatoire.
- Garder `render_game_to_text`, `advanceTime`, hooks `__game_test_*`, save localStorage v1, parcours Playwright.
- `prefers-reduced-motion` couvert (la DA elle-même le couvre via `*::before, *::after { animation: none; transition: none; }`).
- 1280×720 reste la résolution cible.
- Pas de bitmap, tout en CSS / SVG inline.
- Cap 4 boucles infinite simultanées en combat (cf. décision V3 perf-guard).
- Pas de `filter: blur` sur grand élément animé en continu (DA fait quelques exceptions ponctuelles : halos cartes, OK car bornés).

## Risques & garde-fous

- **Volume du chantier** : refondre tokens + composants V1+V2+V3 = potentiellement +1500 lignes CSS modifiées. Découper proprement par phase et committer entre chaque phase serait raisonnable (mais utilisateur n'a pas demandé de commits).
- **Régression visuelle** : il faut vérifier que tous les écrans existants (Menu, Atelier, Collection, Sélection équipe, RecycleConfirmModal, ReplaceConsumableModal, BossIntroOverlay, RarityReveal, etc.) restent cohérents avec la nouvelle DA.
- **Polices Google Fonts** : ajouter une vérification fallback dans `font-family` (déjà fait dans la DA : `'Lilita One', 'Fredoka', 'Baloo 2', system-ui, sans-serif`). FOUT (font-display: swap) déjà géré.
- **Mascotte CSS** : composant complexe à templater. Doit accepter des variants par perso (couleur tête, couleur chapeau, accessoire). Pour l'Atelier : doit pouvoir varier avec les choix utilisateur.
- **Build size** : import de Google Fonts ajoutera ~100 KB de woff2 (déjà téléchargés au runtime). Acceptable.

## Tests obligatoires

```bash
npm run build
```

Puis vérifier visuellement (ou laisser à l'utilisateur) :
- Menu lisible avec nouvelle DA
- Sélection équipe — cartes en cream sticker
- Stage intro avec accent stage
- Combat — héros + ennemis en mascottes, projectiles colorés
- Boss intro — overlay en candy
- Hub 5 onglets en cream sticker
- Boutique avec cards cream + boutons coral
- Lootbox — roulette avec marker coral
- Recyclage modale
- Coffre final — 5 tiers visibles distinctement
- Atelier — preview perso en CharacterCardDetailed candy
- Reduced-motion : tout statique
- localStorage save préservée

## Ce qui n'est PAS demandé

- Pas de refonte gameplay
- Pas de nouveaux ennemis ou items ou persos
- Pas de nouvelles mécaniques de combat
- Pas de modifs reducer ni des actions V2/V3
- Pas de migration save destructive

## Priorité d'implémentation (ordonnée)

1. **Phase A** : tokens + Google Fonts → Build pass → screen check Menu
2. **Phase B** : cartes personnages détaillées (le morceau le plus visible)
3. **Phase C** : combat skinné (le plus complexe)
4. **Phase D** : coffres + roulette (le plus satisfaisant)
5. **Phase E** : hub + onglets
6. **Phase F** : renommage narratif (optionnel, si décidé par orchestrateur/utilisateur)

## Critère de succès

Quand l'utilisateur lance `npm run dev`, il doit voir :
- Un jeu **clairement cartoon candy joyeux** au premier coup d'œil.
- Des cartes qui ressemblent à des **stickers** (cerne épais + ombre offset).
- Des héros et ennemis qui sont de **vrais personnages**, pas des silhouettes abstraites.
- Une UI **chaleureuse mais lisible**, avec hiérarchie visuelle claire (Lilita One pour titres + Nunito pour corps).
- Une cohérence **avec l'inspiration fournie** sans en être une copie servile.
- **Toutes les mécaniques V1/V2/V3 fonctionnent encore**.
