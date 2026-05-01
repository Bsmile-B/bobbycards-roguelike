# Brief — V2 Progression / Hub / Boutique / Loot Box

## Contexte

Jeu roguelite de cartes/personnages déjà existant en React + TypeScript + Vite (single-file `src/App.tsx`, ~1900 lignes, reducer central, state persisté en localStorage).

La passe précédente a livré une **V2 interface/combat** : HUD avancé, intentions ennemies, traits, salles/modificateurs, floating numbers, deux bonus décisionnels post-victoire. Cf. `progress.md`.

## Problème à résoudre

Le jeu manque d'une vraie **boucle de progression entre les combats**. L'or sert trop peu. Les récompenses ne créent pas de décisions. Il manque hub, boutique, loot boxes achetables, recyclage.

**Ne pas refaire le HUD/combat. Ne pas réécrire l'app. Étendre proprement.**

## Objectifs

Implémenter la couche progression / récompense / économie qui transforme la boucle :

```
combat → bonus → combat → bonus
```

en :

```
combat → boss → hub → choix économique → préparation → nouveau stage
```

## 1. Structure en 3 stages

3 stages de 10 vagues chacun :

| Stage | Vagues | Boss | Ambiance |
|-------|--------|------|----------|
| Les Cryptes froides | 1–9 | Gardien des Cendres (vague 10) | pierre, runes bleues, froid |
| Le Sanctuaire du Vide | 11–19 | Sorcière du Vide (vague 20) | magie, poison, violet sombre |
| La Salle du Roi Brisé | 21–29 | Roi Brisé (vague 30) | ruines royales, or terni, rouge sombre |

Chaque stage doit avoir : nom affiché, ambiance visuelle, ennemis liés, boss dédié, boutique propre, fin claire avec transition vers hub.

## 2. Progression visuelle de run

Carte/barre de progression visible :

```
Stage 1 : [1] [2] [3] [4] [5] [6] [7] [8] [9] [BOSS]
Hub
Stage 2 : [11] [12] [13] [14] [15] [16] [17] [18] [19] [BOSS]
Hub
Stage 3 : [21] [22] [23] [24] [25] [26] [27] [28] [29] [FINAL]
```

Le joueur doit voir : vague actuelle, stage actuel, boss à venir, stages terminés, hub atteint, progression globale.

## 3. Hub entre les stages

Après le boss du stage 1 et du stage 2, écran hub avec onglets :
- **Boutique** — objets stage-spécifiques
- **Loot Box** — achat de coffres avec or
- **Recyclage** — convertir personnages forgés en fragments/or
- **Équipe** — gestion d'équipe limitée
- **Stats** — stats de la run
- Bouton **Continuer vers le prochain stage**

Disposition recommandée :
```
HUB ENTRE LES STAGES
Stage terminé : X
Prochain stage : Y
Or : X | Fragments : X | Vies : X/3

Onglets : [Boutique] [Loot Box] [Recyclage] [Équipe] [Stats]
Zone centrale selon onglet actif.
Bouton : Continuer vers le prochain stage.
```

## 4. Utilité de l'or

L'or sert à :
- Potions / objets de stage
- Loot boxes
- Relancer la boutique
- Soigner l'équipe
- Bénédictions
- Changement supplémentaire d'équipe en hub

Prix de base :
- Potion de soin mineure : 25 or
- Bouclier de départ : 40 or
- Relance boutique : 15 or
- Loot box commune : 50 or
- Loot box rare : 120 or
- Loot box épique : 250 or
- Bénédiction de stage : 180 or
- Changement d'équipe supplémentaire : 75 or

L'or doit créer un dilemme. Le joueur ne peut pas tout acheter.

## 5. Boutique par stage

4–6 objets par boutique. Chaque objet : nom, rareté, prix, effet, type, stage associé.

**Stage 1 — Boutique des Cryptes**
- Potion de sang froid : soigne 20% de l'équipe.
- Rune de pierre : +10 bouclier au prochain combat.
- Lame ébréchée : +8% attaque physique pour le reste du stage.
- Petite loot box : récompense aléatoire commune/rare.

**Stage 2 — Boutique du Vide**
- Encens du vide : réduit les cooldowns au prochain combat.
- Sceau arcanique : +12% magie pour le reste du stage.
- Fiole anti-poison : retire poison/brûlure.
- Loot box rare : chance rare/épique.

**Stage 3 — Boutique Royale**
- Bénédiction royale : restaure 1 vie globale si le joueur en a moins de 3.
- Couronne fissurée : +15% dégâts contre le prochain boss.
- Armure du dernier rempart : le premier héros K.O revient avec 30% PV.
- Loot box épique : chance épique/légendaire.

## 6. Loot boxes achetables

4 types :

**Petite loot box — 50 or**
- 50% fragments / 30% or / 18% perso commun / 2% perso rare

**Loot box rare — 120 or**
- 45% fragments / 30% perso rare / 20% or / 5% perso épique

**Loot box épique — 250 or**
- 40% fragments / 35% perso épique / 20% perso rare / 5% perso légendaire

**Loot box runique** (récompense spéciale post-boss/fin avancée)
- Forte chance épique/légendaire, gros fragments, or bonus

Afficher les probabilités dans l'interface. Animation courte d'ouverture (coffre fermé → clic → flash → révélation). Aucune vraie monnaie. Tout local.

## 7. Recyclage des personnages forgés

- Seuls les forgés/personnalisés peuvent être recyclés.
- Pas les starter, pas ceux dans l'équipe.
- Confirmation obligatoire ("définitif").
- Remboursement fragments + or, mise à jour localStorage.

Remboursements :
- Commun forgé : 5 fragments + 10 or
- Rare forgé : 40% du coût de forge + 25 or
- Épique forgé : 50% du coût de forge + 60 or
- Légendaire forgé : 60% du coût de forge + 120 or

## 8. Gestion d'équipe au hub

- 1 changement de héros gratuit par hub
- Changement supplémentaire : 75 or
- Héros ajouté arrive avec 70% PV

Afficher : équipe actuelle, héros disponibles, synergies actives, coût si changement supplémentaire.

## 9. Inventaire de consommables

Max 3 objets par run :
- Potion de soin
- Bombe runique
- Bouclier d'urgence
- Fiole anti-poison

Achetables en boutique, gagnés en récompense, utilisables en combat. Si plein : remplacer un objet ou abandonner le nouveau.

## 10. Refonte des récompenses

**Après vague normale :** or, fragments, petit soin, objet consommable, mini bonus temporaire, petite chance de mini loot box.

**Après vague 5 de chaque stage :** récompense améliorée — relique mineure, objet rare, soin équipe, réduction boutique.

**Après boss :** gros or, loot box spéciale, accès hub, choix d'une relique de boss parmi 3.

Le coffre final reste mais ne doit plus être la seule récompense intéressante.

## 11. Coffre final selon performance

- Coffre abîmé : mort avant boss 1
- Coffre bronze : boss 1 vaincu
- Coffre argent : boss 2 vaincu
- Coffre royal : boss final vaincu
- Coffre runique : run exceptionnelle

## 12. Tests obligatoires

`npm run build` puis tester :
menu → sélection équipe → run → vague 1 → récompense → vague 10 boss → victoire boss → transition hub → boutique → achat or → ouverture loot box → recyclage perso forgé → changement équipe → stage 2 → boss stage 2 → hub stage 2 → stage 3 → boss final → game over → coffre final → sauvegarde localStorage → 0 erreur console.

## Contraintes

- Préserver `render_game_to_text`, `advanceTime`, les hooks de tests existants.
- Préserver le reducer principal autant que possible.
- Étendre, ne pas réécrire.
- Pas de backend, tout en local, localStorage uniquement.
- Pas de vraie monnaie, pas de paiement réel.

## Priorité d'implémentation

1. Stages
2. Hub
3. Boutique
4. Loot boxes avec or
5. Recyclage
6. Progression visuelle
7. Inventaire consommables
8. Récompenses boss/finales
