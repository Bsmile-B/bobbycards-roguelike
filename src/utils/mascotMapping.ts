// === Bobbycard — Mascot mapping helpers (extrait de App.tsx, Phase 1 V5.1) ===
// Types et helpers de mapping persona/ennemi → variant + mood.

import type { CharacterTemplate } from "../data/characters";
import type { Stage } from "../data/stages";

export type MascotVariant =
  | "bobby"
  | "rogue"
  | "mage"
  | "guardian"
  | "knight"
  | "gourmand"
  | "archer"
  | "priest"
  | "slime"
  | "bat"
  | "ghost"
  | "witch"
  | "vine"
  | "plant"
  | "guard"
  | "royal-guard"
  | "golem"
  | "soldier"
  | "boss-cinder"
  | "boss-void"
  | "boss-king"
  | "boss-broken-king";

export type MascotSize = "xs" | "sm" | "md" | "lg" | "xl";
export type MascotMood = "idle" | "attacking" | "hurt" | "ko" | "happy" | "angry";
export type MascotSide = "ally" | "enemy";

export const MASCOT_VARIANT_LABEL: Record<MascotVariant, string> = {
  bobby: "Bobby",
  rogue: "Rodeur",
  mage: "Mage",
  guardian: "Gardien",
  knight: "Chevalier",
  gourmand: "Gourmand",
  archer: "Archer",
  priest: "Pretre",
  slime: "Slime",
  bat: "Chauve-souris",
  ghost: "Spectre",
  witch: "Sorciere",
  vine: "Voilet",
  plant: "Plante",
  guard: "Garde",
  "royal-guard": "Garde royal",
  golem: "Golem",
  soldier: "Heraut",
  "boss-cinder": "Gardien des Cendres",
  "boss-void": "Sorciere du Vide",
  "boss-king": "Roi Brise",
  "boss-broken-king": "Roi Brise",
};

export const MASCOT_MOOD_LABEL: Record<MascotMood, string> = {
  idle: "calme",
  attacking: "attaque",
  hurt: "blesse",
  ko: "K.O.",
  happy: "heureux",
  angry: "en colere",
};

// === V4 — mapping perso starter / custom → variant
export function mapPersonaToVariant(character: CharacterTemplate): MascotVariant {
  switch (character.id) {
    case "cael":
    case "nyx":
      return "rogue";
    case "elyra":
    case "maelis":
    case "seraphine":
      return "mage";
    case "orrin":
    case "thane":
    case "kadris":
      return "guardian";
    case "ronan":
      return "gourmand";
    default:
      // Custom characters (forgés) : bobby fallback (cf. décision V4 §5.d).
      return "bobby";
  }
}

// === V4 — mapping ennemi (par nom) → variant
export function mapEnemyNameToVariant(name: string, boss: boolean, stage: Stage): MascotVariant {
  if (boss) {
    if (stage === 1) return "boss-cinder";
    if (stage === 2) return "boss-void";
    return "boss-king";
  }
  // Stage 1
  if (name === "Goule creuse") return "slime";
  if (name === "Brigand maudit") return "rogue";
  if (name === "Spectre mineur") return "bat";
  // Stage 2
  if (name === "Acolyte noir") return "witch";
  if (name === "Ombre rampante") return "ghost";
  if (name === "Voilet du Vide") return "vine";
  // Stage 3
  if (name === "Garde brise") return "royal-guard";
  if (name === "Relique royale") return "golem";
  if (name === "Heraut sanglant") return "soldier";
  // Fallback par stage
  if (stage === 1) return "slime";
  if (stage === 2) return "ghost";
  return "soldier";
}

// Args structurels pour éviter une dépendance circulaire avec App.tsx
// (les types Enemy / CombatCharacter sont définis dans App.tsx).
export function computeHeroMood(
  member: { hp: number; maxHp: number },
  isAttacking: boolean,
  isHit: boolean,
): MascotMood {
  if (member.hp <= 0) return "ko";
  if (isAttacking) return "attacking";
  if (isHit) return "hurt";
  if (member.hp / Math.max(1, member.maxHp) < 0.3) return "hurt";
  return "idle";
}

export function computeEnemyMood(
  enemy: { hp: number },
  isAttacking: boolean,
  isHit: boolean,
): MascotMood {
  if (enemy.hp <= 0) return "ko";
  if (isAttacking) return "attacking";
  if (isHit) return "hurt";
  return "idle";
}
