// === Bobbycard — Character data (extrait de App.tsx, Phase 1 V5.1) ===
// Types et données du roster de base + helpers de coût/starter.
// Cf. project/v5/decisions.md pour la procédure d'extraction.

export type Rarity = "common" | "rare" | "epic" | "legendary";
export type SpecialType = "attack" | "heal" | "shield";

export type Special = {
  name: string;
  type: SpecialType;
  power: number;
  cooldown: number;
};

export type CharacterTemplate = {
  id: string;
  name: string;
  rarity: Rarity;
  maxHp: number;
  physical: number;
  magic: number;
  special: Special;
  custom?: boolean;
  // V5.1 P5 — rôle de forge (si custom). Sert au clamp par caps de rôle.
  // Optionnel : les saves anciennes peuvent ne pas l'avoir, on heuristique
  // alors via les stats relatives.
  role?: "blade" | "mage" | "warden";
};

export const STARTER_IDS = ["cael", "elyra", "orrin", "ronan"];

export const CREATION_COST: Record<Rarity, number> = {
  common: 0,
  rare: 15,
  epic: 35,
  legendary: 70,
};

export const ROSTER: CharacterTemplate[] = [
  {
    id: "cael",
    name: "Cael Brisefer",
    rarity: "common",
    maxHp: 44,
    physical: 8,
    magic: 1,
    special: { name: "Entaille", type: "attack", power: 18, cooldown: 5200 },
  },
  {
    id: "elyra",
    name: "Elyra Cendre",
    rarity: "common",
    maxHp: 34,
    physical: 2,
    magic: 9,
    special: { name: "Soin pale", type: "heal", power: 18, cooldown: 6500 },
  },
  {
    id: "orrin",
    name: "Orrin Veillefer",
    rarity: "rare",
    maxHp: 54,
    physical: 5,
    magic: 4,
    special: { name: "Egide", type: "shield", power: 10, cooldown: 7200 },
  },
  {
    id: "ronan",
    name: "Ronan Gourmand",
    rarity: "epic",
    maxHp: 58,
    physical: 6,
    magic: 8,
    special: { name: "Festin noir", type: "heal", power: 25, cooldown: 7600 },
  },
  {
    id: "nyx",
    name: "Nyx Noctelame",
    rarity: "rare",
    maxHp: 38,
    physical: 10,
    magic: 3,
    special: { name: "Percee", type: "attack", power: 24, cooldown: 5900 },
  },
  {
    id: "maelis",
    name: "Maelis Sombrelys",
    rarity: "epic",
    maxHp: 42,
    physical: 3,
    magic: 12,
    special: { name: "Puits vital", type: "heal", power: 26, cooldown: 7600 },
  },
  {
    id: "thane",
    name: "Thane Corvacier",
    rarity: "epic",
    maxHp: 66,
    physical: 8,
    magic: 2,
    special: { name: "Rempart", type: "shield", power: 16, cooldown: 8400 },
  },
  {
    id: "seraphine",
    name: "Seraphine Voile",
    rarity: "legendary",
    maxHp: 50,
    physical: 4,
    magic: 15,
    special: { name: "Nova", type: "attack", power: 34, cooldown: 8200 },
  },
  {
    id: "kadris",
    name: "Kadris le Muet",
    rarity: "rare",
    maxHp: 48,
    physical: 7,
    magic: 6,
    special: { name: "Sceau", type: "shield", power: 12, cooldown: 7000 },
  },
];

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Commune",
  rare: "Rare",
  epic: "Epique",
  legendary: "Legendaire",
};
