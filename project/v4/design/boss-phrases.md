# Phrases boss V4 — ton candy menaçant

## Choix de ton

Le ton candy joyeux contraste volontairement avec les noms gothiques (Cult of the Lamb-esque). Les phrases sont **mignonnes en surface, menaçantes en sous-texte**. Une phrase par boss.

## Gardien des Cendres (Stage 1)

> « Les braises te connaissent, petite étincelle. Elles ont déjà tout brûlé… et elles ont encore faim. »

Alternatives :
- « Approche, gourmand. La cendre est tendre, ce soir. »
- « Quel joli bruit tu fais, en craquant. »

## Sorcière du Vide (Stage 2)

> « Oh, tu es venu ? Reste un peu. Je collectionne les sourires comme le tien. »

Alternatives :
- « Ne t'inquiète pas — bientôt, tu ne te rappelleras plus pourquoi tu pleurais. »
- « Mon jardin a besoin d'un nouveau pétale. Tiens. »

## Roi Brisé (Stage 3)

> « Ah ! Un sujet. Agenouille-toi — je collectionne les couronnes plus petites que la mienne. »

Alternatives :
- « Tu as l'air fatigué. Mon trône est en or. Viens. »
- « Tous les contes finissent ainsi : par moi. »

## Recommandation

Choisir **les 3 phrases principales** (premières citations). Elles ont un meilleur équilibre menace/légèreté.

## Implémentation

Côté React, `BOSS_PHRASES` (déjà existant en V3) reçoit ces 3 nouvelles entrées en remplacement (ou est étendu, à voir dev). Le composant `BossIntroOverlay` lit la phrase et l'affiche dans `.boss-intro-overlay__phrase`.

**Pas de modification reducer ou save** : c'est juste de la donnée littérale dans un objet TS.
