# Brief V3 — Game feel, animations, suspense, rareté

## Contexte

Le prototype a maintenant :
- V1 : combat semi-auto, équipe de 3, compétences, boss tous les 10 combats, coffre fin de run, fragments/or, atelier de forge, Ronan Gourmand, localStorage, hooks de test.
- V2 (livrée juste avant) : 3 stages (Cryptes/Vide/Roi Brisé), hub à 5 onglets, boutique par stage, lootboxes 4 types avec or, recyclage, gestion d'équipe au hub, inventaire 3 consommables, reliques de boss, coffre final tier-aware, RunProgress 3×10.

`src/App.tsx` ~4365 lignes, `src/styles.css` ~2260 lignes. Build clean.

## Mission

**Sensation pure. Pas de nouveau contenu.**

```
Pas plus de contenu.
Plus d'impact.
Plus de suspense.
Plus de lisibilité.
Plus de désir sur les cartes.
```

Le joueur doit ressentir :
- "J'espère tomber sur une carte rare."
- "Cette carte est incroyable."
- "Je vois clairement qui attaque qui."
- "Le boss prend un vrai impact."
- "J'ai envie d'ouvrir encore un coffre."

## Règles dures

- **Pas de vraie monnaie**, pas d'achat réel. Tout local.
- Probabilités **toujours visibles**.
- Récompense **toujours utile**.
- **Pity system** local optionnel (anti-frustration), pas prédateur.
- Ne pas casser : `render_game_to_text`, `advanceTime`, hooks `__game_test_*`, parcours Playwright existants, save localStorage V1.
- Ne pas réécrire le reducer principal. Ne pas casser la V2 (stages/hub/boutique/lootbox/recyclage/consommables/reliques).
- TypeScript strict, pas de `any`.
- prefers-reduced-motion **obligatoire** pour chaque animation.

## 1. Roulette d'ouverture de loot box

Refondre l'ouverture en roulette à phases :
1. Coffre fermé + bouton "Ouvrir"
2. Tremblement léger
3. Lumière selon rareté potentielle
4. **Roulette horizontale** de cartes/récompenses (10–20 items qui défilent)
5. Ralentissement progressif (ease-out cubique sur ~2.5s)
6. Arrêt exactement sur la récompense finale
7. Explosion visuelle selon rareté
8. Révélation détaillée
9. Bouton "Ajouter à la collection" / "Continuer"

**Critique** : la récompense est tirée AVANT l'animation. L'animation ne fait que révéler. Pas de triche probabiliste.

Effets de rareté à la révélation :
- Commun : lueur grise/blanche
- Rare : flash bleu froid
- Épique : aura violette + particules
- Légendaire : explosion dorée + vibration écran légère
- Mythique (réservé) : faisceau blanc/or + ralenti dramatique

Tension visuelle :
- Défilement rapide au début
- Ralentissement progressif
- Si une légendaire passe juste avant/après → effet "presque"
- Pas de tricherie frustrante

## 2. Pity system (anti-frustration)

Local, discret :
- Après X loot boxes ouvertes sans rare+ → +5% à +10% chance de rare/épique sur la suivante.
- Après obtention d'une haute rareté → reset compteur.
- Persisté en localStorage.
- Affiché discrètement (pas obligatoire en UI principale).

## 3. Cartes personnages détaillées

Chaque carte affiche clairement :
```
Nom
Portrait runique
Rareté (badge)
Rôle (badge)
PV
Attaque physique
Magie
Soin/support (si applicable)
Vitesse
Compétence spéciale (encadrée)
Description courte
Trait unique
Fragments possédés (si doublon)
Niveau/rang (si appliqué)
```

Hiérarchie visuelle :
- Nom en haut
- Portrait au centre
- Stats en bas
- Compétence encadrée
- Rareté très visible (bordure + fond)
- Rôle en badge

Exemple :
```
Ronan Gourmand
Épique — Soigneur obscur
PV 58 | PH 6 | MG 8 | VIT 4
Compétence : Festin noir — Soigne l'allié le plus blessé...
Trait : Les soins excessifs deviennent du bouclier.
```

## 4. Raretés visuellement fortes

```
Commun : bordure pierre/gris clair, sobre.
Rare : bleu froid, halo léger, particules bleues.
Épique : violet profond, aura magique, bordure animée subtile.
Légendaire : or lumineux, reflet métallique, particules dorées, glow fort.
Mythique (réservé) : blanc nacré/or, effet cosmique, animation lente premium.
```

Style **dark fantasy premium**. Pas fluo. Pas saturé.

Légendaire = événement :
- Animation révélation plus longue
- Halo spécial
- Micro shake
- Flash contrôlé
- Badge unique
- Pulses simulant un son

## 5. Vitesse de combat + contrôle

Le combat actuel est trop rapide pour lire les actions.

Ralentir légèrement le rythme par défaut. Ajouter un **contrôle de vitesse** :
- x1 (défaut)
- x1.25
- x1.5
- (x2 optionnel pour speedrun)

Le joueur doit voir :
- Préparation
- Attaque
- Trajectoire
- Impact
- Dégâts
- Réaction
- Retour idle

## 6. Animations d'attaque alliées

Chaque attaque alliée :
1. Héros pulse
2. Trajectoire part vers l'ennemi
3. Type de trajectoire selon attaque
4. Ennemi reçoit l'impact
5. Floating number
6. Ennemi shake/flash
7. Héros revient idle

Trajectoires :
- Physique : trait rapide / slash / impact direct
- Magique : projectile runique / arc lumineux / particules
- Soin : flux lumineux vers l'allié
- Bouclier : cercle/rune autour de l'allié
- Poison/brûlure : particules persistantes courtes

Compétences spéciales : animation plus marquée que les attaques de base.

## 7. Animations d'attaque ennemies

Chaque attaque ennemie :
1. Ennemi pulse/se contracte
2. Intention devient active visuellement
3. Trajectoire vers la cible
4. Cible alliée reçoit l'impact
5. Dégâts près de l'allié
6. Allié shake/flash
7. Ennemi revient idle

Cas spéciaux :
- Attaque de zone : onde/arc vers toute l'équipe, flash léger sur chaque allié
- Malédiction : aura sombre, particules violettes, icône de statut
- Soin ennemi : flux vers l'ennemi soigné, animation douce

## 8. Réactions aux impacts

Ennemis :
- Flash rapide
- Shake court
- Baisse de PV animée
- Fissure/aura instable si PV bas
- K.O clair

Alliés :
- Shake court
- Flash sombre/rouge discret
- État blessé visible si PV bas
- État protégé si bouclier
- État K.O très lisible

Règles :
- Ne pas exagérer
- Ne pas rendre illisible
- Animations courtes et propres

## 9. Boss intro + présence

Quand un boss apparaît :
1. Progression s'arrête
2. Fond plus sombre
3. Nom du boss en grand
4. Carte boss entre avec animation lente
5. Aura spécifique au boss
6. Message "Boss de stage"
7. Courte pause puis combat

Pendant le boss :
- Carte plus grande
- Barre de vie imposante
- Intention plus visible
- Attaque spéciale annoncée
- Flash spécial à 50% PV
- Phase finale sous 30% PV

Exemple Gardien des Cendres :
- À 50% : Braise éternelle
- Sous 30% : attaques appliquent brûlure

Les 3 boss V2 (Gardien des Cendres / Sorcière du Vide / Roi Brisé) doivent recevoir cette présence.

## 10. Floating numbers améliorés

Format :
```
-24 PH
-31 MAG
+18 SOIN
+12 BOUCLIER
CRIT -48
BRÛLURE -6
POISON -5
```

Règles :
- Près de la cible
- Monter doucement, disparaître
- Éviter les superpositions
- Regrouper si rafale rapide
- Lisible sur fond sombre
- Plus grand pour crit / compétence spéciale

## 11. Coffres plus vivants

5 tiers déjà existants V2 (damaged/bronze/silver/royal/runic). Donner à chacun :
- Apparence distincte
- Animation propre
- Intensité lumineuse différente
- Matérialiser la rareté de la récompense

```
Coffre abîmé : animation courte, faible glow.
Coffre or (royal) : lueur chaude, secousse, particules dorées.
Coffre runique : runes animées, ouverture lente, explosion lumineuse.
```

Le coffre = moment fort, pas un bouton.

## 12. Architecture recommandée

```
src/
  components/
    LootRoulette.tsx
    ChestOpening.tsx
    RarityReveal.tsx
    AttackProjectile.tsx
    FloatingNumberLayer.tsx
    CombatAnimationLayer.tsx
    CharacterCardDetailed.tsx
    BossIntro.tsx
  game/
    lootBoxEngine.ts
    animationEvents.ts
    combatTiming.ts
    rarityVisuals.ts
  data/
    lootBoxes.ts
    rarityConfig.ts
```

(Architecture indicative. Si l'extraction de modules depuis App.tsx est trop coûteuse pour cette passe, accepter de garder une partie inline et logger la décision.)

## 13. Système d'événements d'animation

```ts
attack_started
projectile_launched
target_hit
damage_number
heal_number
shield_number
ko
boss_phase
loot_reveal
```

Le moteur calcule, l'UI consomme les events pour synchroniser :
- attaque
- trajectoire
- impact
- chiffre
- réaction

Ne pas surcomplexifier.

## 14. Priorité d'implémentation

```
1. Vitesse de combat + contrôle x1/x1.25/x1.5
2. Trajectoires d'attaque alliées
3. Trajectoires d'attaque ennemies
4. Réactions visuelles aux impacts
5. Floating numbers améliorés
6. Cartes personnages détaillées
7. Configuration visuelle des raretés
8. Refonte ouverture coffre
9. Roulette de loot box
10. Révélation rareté forte
11. Boss intro + présence
12. Tests boss/coffre/combat/collection
```

**Ne pas commencer par ajouter du contenu.** Priorité : animation, lisibilité, sensation, rareté.

## 15. Tests obligatoires

```bash
npm run build
```

Puis :
- menu → sélection → lancement run
- attaque alliée visible (trajectoire + impact)
- attaque ennemie visible (trajectoire + impact)
- floating numbers propres
- compétence spéciale animée
- boss intro visible
- boss attaque visible
- game over → coffre final
- roulette loot box
- révélation récompense
- ajout collection/localStorage
- 0 erreur console
- contrôle vitesse fonctionne
- prefers-reduced-motion : alternative pour chaque animation

Préserver `render_game_to_text`, `advanceTime`, hooks de test, save localStorage V1.

## 16. Résultat attendu

Avant : "Je clique, les chiffres changent, je gagne une récompense."

Après :
```
Je vois mon héros attaquer.
Je vois le projectile partir.
Je vois l'ennemi encaisser.
Je sens l'impact.
J'ouvre un coffre avec suspense.
Je vois une carte rare apparaître.
J'ai envie de relancer une run.
```
