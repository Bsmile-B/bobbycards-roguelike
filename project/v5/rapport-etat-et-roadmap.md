# Rapport État du Jeu & Roadmap Complète — Bobbycard

**Date** : 2026-04-30
**Auteur** : Claude (analyse croisée + recommandations)
**Statut codebase** : V4 livrée (DA Joyful Direction implémentée, mais hors-cible utilisateur)
**Build** : ✅ TypeScript clean, Vite OK, ~300 KB JS / ~166 KB CSS

---

## 0. Position globale

> **TL;DR** : Le diagnostic externe est globalement **juste à 80 %**, mais sous-estime la dette d'architecture et surestime l'urgence du tutoriel/audio avant la stabilisation visuelle. Le jeu est à un point charnière : il ne faut **plus empiler de features** mais **verrouiller le tronc** (DA + sauvegarde + structure de code) avant tout.

**Score réel du projet (mon estimation après audit code)** :
- Systèmes mécaniques : **75 %** ✅
- Architecture / maintenabilité : **35 %** ⚠️ (monolithe 6300+7200 lignes)
- Polish / finition : **40 %**
- Expérience joueur (onboarding, ressenti) : **30 %**
- Direction artistique cohérente : **20 %** 🚨 (V4 implémentée ≠ V4 voulue)

**Verdict** : on a un **bon prototype jouable**, pas encore un **jeu fini**. La distance restante est **plus longue qu'elle n'en a l'air** à cause de la dette d'architecture.

---

## 1. Ce sur quoi je suis 100 % d'accord avec le diagnostic externe

### 1.1 La DA est le problème numéro 1
Tant que le visuel n'est pas aligné avec le HTML standalone fourni, **toute autre amélioration est précaire**. Polir des boutons qui vont être refondus = gaspillage. Ajouter du son sur des animations qui changent = à refaire.

### 1.2 La boucle roguelite existe vraiment
Menu → équipe → stage → combat → reward → boss → relique → hub → stage suivant → game over. C'est une vraie structure. Pas un toy project.

### 1.3 Le tutoriel manque cruellement
13+ systèmes (stages, hub, reliques, lootboxes, pity, forge, recyclage, consommables, swaps, shop, boss, compétences, raretés). Sans onboarding, n'importe quel joueur extérieur **abandonne en 5 minutes**.

### 1.4 L'équilibrage n'a jamais été testé sérieusement
Aucune passe métrique. Les valeurs sont posées "au feeling". Risque élevé que le jeu soit cassé d'une manière ou d'une autre (trop facile, économie déséquilibrée, légendaires OP, etc.).

### 1.5 Mythique mal intégré, à parquer
Visuel actif mais 0 % drop. C'est de la dette. **Décision** : retirer la classe `.rarity-mythic` du build courant ou la marquer `data-feature="v6"` et ne pas la rendre en prod.

### 1.6 Audio = polish, pas urgence
Pas critique pour valider la boucle. À faire **après** la DA + sauvegarde + tutoriel.

---

## 2. Ce sur quoi je nuance ou je ne suis pas d'accord

### 2.1 ❌ "Architecture monolithe pas urgent"
Le diagnostic externe dit : *"je ne le mettrais pas en priorité 1 tant que la DA cible n'est pas stabilisée"*.

**Mon désaccord** : refondre la DA **dans un fichier de 7237 lignes CSS et un App.tsx de 6332 lignes**, c'est **augmenter le risque de régression à chaque modification**. Si on touche les tokens `:root` pour aligner sur la DA cible, on impacte 200+ classes interdépendantes sans pouvoir tester par module.

**Ma recommandation** : **découper a minima AVANT** la refonte DA :
- Extraire les tokens dans `src/styles/tokens.css`
- Extraire les composants critiques (`HeroMascot`, `CharacterCardDetailed`) dans des fichiers dédiés
- Garder le reducer dans App.tsx pour l'instant

Coût : 1 demi-journée. Bénéfice : refonte DA 3× plus sûre.

### 2.2 ❌ "Sauvegarde de run probablement incomplète"
Le diagnostic externe **suppose** que la sauvegarde mid-run est cassée. **Ce n'est pas vérifié**.

**Mon constat après lecture du code** : `SaveData` ne contient effectivement **PAS** :
- `RunState` en cours (stage actuel, combat, PV, reliques)
- État du combat actuel (animations en cours, intent ennemi)
- État du hub (onglet actif, sélections en attente)

**Donc le diagnostic externe a raison sur le fait, mais pas sur la formulation** : ce n'est pas "probablement", c'est **certain**. Si l'utilisateur ferme l'onglet en plein run, il **perd la run**.

**Décision à prendre** : 
- Option A : sauver la run en cours (gros chantier, sérialiser tout l'état)
- Option B : assumer qu'une run = une session, ajouter un avertissement avant fermeture
- Option C : auto-save uniquement aux checkpoints (entre fights)

**Ma recommandation** : **Option C**. Compromis raisonnable. Sauvegarde après chaque fin de combat, pas pendant. Code = ~50 lignes, tests = facile.

### 2.3 ⚠️ "Progression contradictoire (3 stages vs 9 fights vs 10)"
Le diagnostic externe a raison qu'il y a confusion. **Mais le code est clair une fois lu** :
- 3 stages × 3 fights normaux + 1 boss = **3 stages × 4 = 12 fights total**
- Le "fight 10" cité, c'est juste une formule mal exprimée

**Recommandation game design** : poser explicitement dans `specs.md` la règle. Et pour la progression future, **ne pas étendre à 10 vagues/stage** comme suggéré, mais plutôt :
- Garder 3-4 fights/stage
- Augmenter la **richesse** de chaque fight (modifiers, événements, choix)
- Plutôt que la **longueur**

Une run de 30 min vaut mieux qu'une run de 90 min répétitive.

### 2.4 ⚠️ "70 % côté systèmes" (estimation externe)
Trop optimiste. **Mon estimation : 60 %**. Pourquoi :
- Beaucoup de systèmes existent **techniquement** mais sont **sous-utilisés** ou **mal intégrés** :
  - Pity counter : implémenté mais l'utilisateur ne le voit jamais
  - Reliques : 3 par run mais effets souvent invisibles dans le combat (pas de feedback visuel quand un effet relique se déclenche)
  - Forge : aucune contrainte, donc pas de gameplay strategy
  - Recyclage : pas de motivation forte (l'or est déjà abondant ?)

Un système qui existe mais ne se voit pas = **système à 50 %**.

### 2.5 ⚠️ "Modes de difficulté pas urgents"
D'accord pour ne pas multiplier les modes maintenant. **Mais** un jeu sans difficulté = un jeu sans **rejouabilité**. La 2ème run sera identique à la 1ère.

**Solution alternative à coût bas** : ajouter un **système de "fardeaux" / ascensions** (style Slay the Spire) plus tard. Pas un mode séparé, juste un modifier optionnel par run.

---

## 3. Ce que les deux analyses ont raté

### 3.1 🚨 Pas de feedback visuel des effets de relique en combat
Quand une relique active son effet (ex : "première compétence gratuite ce combat"), **rien ne le signale** au joueur. Pas de glow sur le perso, pas de notification. Le joueur a 3 reliques mais oublie qu'elles existent.

**Impact** : le système relique existe mais ne **joue pas son rôle de moteur de stratégie**.

**Fix nécessaire** : pulse sur la carte du perso concerné + texte flottant "Relique X active".

### 3.2 🚨 Pas de "win condition" claire au méta-niveau
Game over → restart. C'est tout. Pas de :
- Statistiques cumulatives qui débloquent du contenu
- Achievements / défis
- "Tu as battu le boss final !" → écran de fin avec recap
- Replay incentive (autre que voir d'autres persos)

**Impact** : le joueur qui finit une run **n'a aucune raison de recommencer** à part la curiosité.

### 3.3 🚨 Pas de variété d'événements en stage
Chaque combat se ressemble. Pas de :
- Événements aléatoires (marchand random, autel, mystery box)
- Choix narratifs (chemin court avec ennemi fort vs chemin long avec loot)
- Mini-jeux de transition

**Impact** : la 3ème run est très ressemblante à la 1ère.

### 3.4 🚨 Custom characters trop puissants ?
Forge = points distribués librement → un perso forgé peut **tout maxer en 1 stat critique** (ex : 50 magie + skill `magic-burst`). Aucune contrainte de cohérence rôle/stat. Si c'est le cas, le jeu **devient cassé** dès qu'un joueur découvre la forge.

À vérifier en testant en jeu.

### 3.5 🚨 Aucune métrique en jeu (pas de devtools)
Pas de console / overlay debug pour voir :
- DPS effectif d'un perso
- Probabilité de drop d'une lootbox
- Taux d'utilisation d'une compétence

**Impact** : équilibrer = travailler à l'aveugle.

**Fix bon marché** : un overlay `?debug=1` qui montre les chiffres. ~100 lignes.

### 3.6 ⚠️ Polices Google Fonts — risque RGPD/perf
CDN Google Fonts = IP utilisateur envoyée à Google sans consentement = non-conforme RGPD si déployé public. **OK** en local, **non** en prod publique.

Self-host woff2 dans `/public/fonts/` = solution propre. Coût : 30 min.

### 3.7 ⚠️ Pas de versionning de save robuste
Le système de save lit V1/V2/V3 silencieusement, mais aucune **gestion d'erreur** si le format est corrompu. Un save partiellement écrit (crash navigateur) = jeu cassé sans bouton "réinitialiser".

**Fix** : try/catch + bouton "save corrompue, réinitialiser ?" dans le menu.

---

## 4. Compartimentage : ce qui manque, par domaine

### 🎨 A. Direction artistique (PRIORITÉ ABSOLUE)
| # | Item | Effort | Bloquant ? |
|---|---|---|---|
| A1 | Analyser le HTML standalone (extraire tokens, palette, composants) | 4h | OUI |
| A2 | Aligner les tokens `:root` sur la DA cible | 2h | OUI |
| A3 | Refondre cartes personnages selon DA cible | 4h | OUI |
| A4 | Refondre boutons / pills / cards UI | 3h | OUI |
| A5 | Vérifier les 3 skyboxes stages | 1h | NON |
| A6 | Mascottes : conserver CSS ou refaire ? (à décider) | 0-8h | À DÉCIDER |
| A7 | Refondre coffres (5 tiers) | 3h | NON |
| A8 | Refondre roulette lootbox | 2h | NON |
| A9 | Cohérence menu/hub/combat avec nouvelle DA | 3h | OUI |

**Total estimé** : 22h (sans mascottes refaites) à 30h (avec).

---

### 💾 B. Sauvegarde & persistance
| # | Item | Effort | Priorité |
|---|---|---|---|
| B1 | Sauvegarde mid-run (auto-save entre combats) | 4h | HAUTE |
| B2 | Bouton "Continuer" sur menu si run en cours | 1h | HAUTE |
| B3 | Migration save V3 → V4 robuste avec gestion d'erreur | 2h | MOYENNE |
| B4 | Bouton "Réinitialiser save" dans options | 1h | MOYENNE |
| B5 | Export / import save (fichier JSON) | 2h | BASSE |
| B6 | Try/catch global sur load → reset propre si corruption | 1h | HAUTE |

**Total estimé** : 11h.

---

### 📚 C. Onboarding & tutoriel
| # | Item | Effort | Priorité |
|---|---|---|---|
| C1 | Écran "Comment jouer" statique (3 pages illustrées) | 4h | HAUTE |
| C2 | Bulles d'aide contextuelles (?) sur chaque écran | 6h | MOYENNE |
| C3 | Première run guidée avec highlights des actions | 8h | MOYENNE |
| C4 | Tooltips sur compétences / reliques / consommables | 4h | HAUTE |
| C5 | Glossaire (rareté, pity, swap, etc.) | 2h | BASSE |

**Total estimé** : 24h.

---

### ⚖️ D. Équilibrage & game design
| # | Item | Effort | Priorité |
|---|---|---|---|
| D1 | Overlay debug avec métriques live (?debug=1) | 4h | HAUTE |
| D2 | Tableau de monitoring run (durée, or gagné/dépensé, fights) | 2h | HAUTE |
| D3 | 5 runs full pour identifier les casses (test manuel) | 3h | HAUTE |
| D4 | Ajustement courbes de difficulté par stage | 4h | HAUTE |
| D5 | Audit des coûts/récompenses du shop | 2h | HAUTE |
| D6 | Audit forge (limites de stats/synergie) | 3h | HAUTE |
| D7 | Audit reliques (lesquelles dominent / sont oubliées ?) | 3h | MOYENNE |

**Total estimé** : 21h.

---

### 🏗️ E. Architecture & code quality
| # | Item | Effort | Priorité |
|---|---|---|---|
| E1 | Extraction tokens CSS dans fichier dédié | 1h | HAUTE |
| E2 | Découpage `HeroMascot` dans fichier dédié | 1h | HAUTE |
| E3 | Découpage screens majeurs (combat, hub) en fichiers | 6h | MOYENNE |
| E4 | Extraction du reducer dans `gameReducer.ts` | 2h | MOYENNE |
| E5 | Extraction des données master (STARTERS, STAGES) | 1h | MOYENNE |
| E6 | Tests unitaires reducer (assert sur actions critiques) | 8h | MOYENNE |
| E7 | Tests Playwright golden path complet | 4h | MOYENNE |

**Total estimé** : 23h.

---

### 🎵 F. Polish & feedback
| # | Item | Effort | Priorité |
|---|---|---|---|
| F1 | Audio : 8 SFX critiques (clic, attaque, soin, impact, victoire, etc.) | 4h | MOYENNE |
| F2 | Audio : 3 musiques d'ambiance (menu, combat, boss) | 2h | BASSE |
| F3 | Feedback visuel reliques actives en combat | 3h | HAUTE |
| F4 | Animations boss intro plus dramatiques | 4h | MOYENNE |
| F5 | Game over : écran récap avec stats détaillées | 3h | HAUTE |
| F6 | Win screen : célébration boss final | 2h | HAUTE |
| F7 | Transitions entre écrans (fade, slide) | 3h | BASSE |

**Total estimé** : 21h.

---

### ⚙️ G. Options & accessibilité
| # | Item | Effort | Priorité |
|---|---|---|---|
| G1 | Écran options complet (vitesse, son, contraste, taille texte) | 4h | MOYENNE |
| G2 | Toggle reduced-motion manuel (en plus de prefers) | 1h | BASSE |
| G3 | Audit WCAG AA contraste couleurs nouvelle DA | 2h | HAUTE |
| G4 | Navigation clavier complète (Tab, Enter, Esc) | 4h | MOYENNE |
| G5 | Localisation FR/EN (préparation, pas trad complète) | 3h | BASSE |

**Total estimé** : 14h.

---

### 🎮 H. Variété & rejouabilité (V6 / futur)
| # | Item | Effort | Priorité |
|---|---|---|---|
| H1 | Événements aléatoires en stage (marchand, autel, mystery) | 12h | MOYENNE |
| H2 | Choix de chemins (court risqué / long sécurisé) | 8h | MOYENNE |
| H3 | Système d'ascensions / fardeaux (modifiers run) | 10h | BASSE |
| H4 | Achievements + déblocages | 8h | BASSE |
| H5 | Mode Endless / Survival | 12h | TRÈS BASSE |

**Total estimé** : 50h. **À ne PAS faire avant V5 stable**.

---

## 5. Roadmap proposée (5 phases)

### **Phase V5 — Refondation visuelle + tronc solide** (~50h, 2 semaines)
> *"Verrouiller le tronc avant d'ajouter des branches"*

**Objectif** : un jeu **stable, clair, fini** dans son expérience de base. Pas de nouvelles features.

1. **Découpage minimal architecture** (E1, E2) → 2h — *DOIT être fait avant tout le reste*
2. **Analyse HTML standalone + alignement DA** (A1, A2, A3, A4) → 13h
3. **Sauvegarde mid-run robuste** (B1, B2, B6) → 6h
4. **Audit WCAG nouvelle DA** (G3) → 2h
5. **Tests Playwright golden path** (E7) → 4h
6. **Build clean + smoke test 5 runs** → 4h

**Critère de succès** : un joueur extérieur peut lancer le jeu, faire une run complète, fermer, revenir, finir, sans bug visuel ni perte de progression.

---

### **Phase V6 — Onboarding + équilibrage** (~45h, 2 semaines)
> *"Le rendre jouable pour quelqu'un d'autre que toi"*

1. **Écran "Comment jouer"** (C1) → 4h
2. **Tooltips compétences/reliques/consommables** (C4) → 4h
3. **Overlay debug + monitoring** (D1, D2) → 6h
4. **5 runs de test + ajustements** (D3, D4, D5, D6, D7) → 15h
5. **Feedback visuel reliques actives** (F3) → 3h
6. **Game over / Win screen avec recap** (F5, F6) → 5h
7. **Bouton réinitialiser save** (B4) → 1h
8. **Toggle reduced-motion manuel** (G2) → 1h
9. **Bulles d'aide contextuelles** (C2) → 6h

**Critère de succès** : un nouveau joueur termine sa première run sans aide humaine, en moins de 25 min, et a envie d'en refaire une.

---

### **Phase V7 — Polish audiovisuel** (~25h, 1 semaine)
> *"Le rendre satisfaisant"*

1. **8 SFX critiques** (F1) → 4h
2. **Animations boss intro améliorées** (F4) → 4h
3. **Transitions écrans** (F7) → 3h
4. **3 musiques ambiance** (F2) → 2h
5. **Écran options complet** (G1) → 4h
6. **Self-host fonts** (RGPD) → 1h
7. **Première run guidée** (C3) → 7h

**Critère de succès** : le jeu est **agréable** à jouer (pas juste fonctionnel).

---

### **Phase V8 — Refactor architecture profond** (~25h, 1 semaine)
> *"Préparer la maintenance long terme"*

1. **Découpage screens en fichiers** (E3) → 6h
2. **Extraction reducer** (E4) → 2h
3. **Extraction données master** (E5) → 1h
4. **Tests unitaires reducer** (E6) → 8h
5. **Documentation architecture (README + ARCH.md)** → 4h
6. **Audit perf 60fps en combat ×1.5** → 4h

**Critère de succès** : un dev tiers peut comprendre l'architecture en 1h et faire un fix non-trivial en 1 jour.

---

### **Phase V9+ — Variété & rejouabilité** (~50h+)
> *"Le rendre rejouable"*

1. Événements aléatoires (H1)
2. Chemins (H2)
3. Ascensions / fardeaux (H3)
4. Achievements (H4)

**À planifier seulement si V5–V8 sont solides**.

---

## 6. Anti-patterns à éviter absolument

### ❌ "Empiler des features sur une fondation incertaine"
Tant que la DA n'est pas alignée, ne pas ajouter d'audio, de tutoriel, de modes. Risque : tout refaire.

### ❌ "Refondre le code par envie de propreté"
Découper en 30 fichiers maintenant = ralentir la livraison. Le découpage **minimal** suggéré (E1, E2) suffit. Le gros refactor = phase V8, **après stabilisation**.

### ❌ "Ajouter du contenu (persos, ennemis, items) avant équilibrage"
Plus de contenu = plus de combinaisons à équilibrer. Avec 16 persos déjà là, on est large pour 5+ runs variées. Pas besoin d'en ajouter avant V9.

### ❌ "Multi-difficultés / Endless / Cloud save trop tôt"
Tant que la run normale n'est pas plaisante, ces modes ne sauvent rien.

### ❌ "Self-host fonts dès maintenant"
Tant qu'on est local, le CDN est OK. À faire **une seule fois**, juste avant la première démo publique.

### ❌ "Tutoriel interactif complet avant tooltips"
Tooltips simples sur les éléments = couvre 70 % du besoin pour 20 % de l'effort. Le tuto interactif (C3) est en V7, pas V5.

---

## 7. Décisions à arbitrer avec l'utilisateur

| # | Question | Options | Ma reco |
|---|---|---|---|
| Q1 | Garder les mascottes CSS actuelles ou refaire d'après HTML standalone ? | A) Garder, B) Refaire | À voir après analyse HTML |
| Q2 | Sauvegarder mid-run ou par checkpoints ? | A) Mid-run, B) Checkpoints, C) Pas du tout | **B) Checkpoints** |
| Q3 | Mythique : retirer ou activer ? | A) Retirer, B) Activer en V6 | **A) Retirer** pour V5 |
| Q4 | Stages courts (3-4 fights) ou longs (10 vagues) ? | A) Courts, B) Longs | **A) Courts** + variété |
| Q5 | Audio en V7 ou plus tôt ? | A) V5, B) V6, C) V7 | **C) V7** |
| Q6 | Polices : Google Fonts CDN ou self-host ? | A) CDN, B) Self-host | A) CDN local, B) avant prod |
| Q7 | Refactor profond V8 obligatoire ou optionnel ? | A) Obligatoire, B) Optionnel | **A) Obligatoire** avant V9 |

---

## 8. Métriques de succès globales

À la fin de **V5** :
- ✅ Build clean
- ✅ DA alignée HTML standalone (validation utilisateur)
- ✅ Run sauvegardée à chaque fin de combat
- ✅ Bouton "Continuer" fonctionnel
- ✅ 0 régression visuelle

À la fin de **V6** :
- ✅ Joueur tiers termine une run sans aide
- ✅ Durée run = 20-30 min (cible)
- ✅ Stage 3 boss : 50-70 % de win rate (équilibre)
- ✅ Économie : joueur dépense 80-100 % de son or par run

À la fin de **V7** :
- ✅ 8 SFX intégrés
- ✅ Écran options accessible
- ✅ Première run guidée fonctionnelle

À la fin de **V8** :
- ✅ App.tsx ≤ 2000 lignes (vs 6332 actuellement)
- ✅ Tests reducer ≥ 80 % de couverture
- ✅ 60 fps en combat ×1.5 confirmé

---

## 9. Ce que je ferais si j'étais à ta place, dans l'ordre

1. **Maintenant (1h)** : décider Q1–Q7 ci-dessus
2. **Aujourd'hui (4h)** : faire E1+E2 (découpage minimal) → fondation propre
3. **Demain (4h)** : analyser le HTML standalone (A1) → comprendre la cible
4. **Cette semaine (15h)** : aligner la DA (A2, A3, A4)
5. **Semaine prochaine** : sauvegarde mid-run + tests Playwright (B + E7)
6. **Stop et bilan** : refaire 5 runs, valider que la base tient
7. **Puis V6** : onboarding + équilibrage

---

## 10. Conclusion

Le diagnostic externe est **bon, mais incomplet**. Les angles morts qu'il rate :
- La **dette d'architecture** rend la refonte DA risquée
- Le **manque de feedback visuel des reliques** casse la stratégie
- L'**absence de win condition méta** tue la rejouabilité
- Le **manque d'overlay debug** rend l'équilibrage aveugle

**La séquence gagnante** : architecture minimale → DA → save → tutoriel → équilibrage → polish → refactor profond → variété.

**L'erreur à ne pas faire** : sauter à l'audio ou au tutoriel avant la DA et la save. Tout serait à refaire.

**On tient quelque chose de bon, mais on est encore à mi-chemin**. Le tronc commun est posé. Il manque la peau, l'expérience, et la solidité long terme.

> *"Mesurer deux fois, couper une fois."* La phase V5 est cette mesure.
