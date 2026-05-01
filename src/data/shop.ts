// === Bobbycard — Shop & lootbox data (extrait de App.tsx, Phase 1 V5.1) ===

import type { Rarity } from "./characters";
import type { Stage } from "./stages";
import type { ConsumableKind } from "./consumables";

export type LootBoxTier = "small" | "rare" | "epic" | "runic";

export type LootBoxResult =
  | { kind: "fragments"; amount: number }
  | { kind: "gold"; amount: number }
  | { kind: "character"; characterId: string; rarity: Rarity }
  | { kind: "fragments-converted"; amount: number; from: string };

export type ShopItemEffect =
  | { kind: "heal-team-percent"; percent: number }
  | { kind: "shield-next-fight"; amount: number }
  | { kind: "stat-boost-stage"; stat: "physical" | "magic"; percent: number }
  | { kind: "cooldown-next-fight"; percent: number }
  | { kind: "lootbox"; tier: LootBoxTier }
  | { kind: "consumable"; consumable: ConsumableKind }
  | { kind: "blessing-life" }
  | { kind: "boss-damage-bonus"; percent: number }
  | { kind: "first-ko-revive"; percent: number };

export type ShopItem = {
  id: string;
  name: string;
  detail: string;
  rarity: Rarity;
  price: number;
  stage: Stage;
  effect: ShopItemEffect;
};

export type LootBoxWeights = {
  fragments: number;
  gold: number;
  common: number;
  rare: number;
  epic: number;
  legendary: number;
};

export const SHOP_POOLS: Record<Stage, Omit<ShopItem, "id">[]> = {
  1: [
    {
      name: "Potion de sang froid",
      detail: "Soigne 20% des PV de l'equipe.",
      rarity: "common",
      price: 25,
      stage: 1,
      effect: { kind: "heal-team-percent", percent: 20 },
    },
    {
      name: "Rune de pierre",
      detail: "+10 bouclier au prochain combat.",
      rarity: "rare",
      price: 40,
      stage: 1,
      effect: { kind: "shield-next-fight", amount: 10 },
    },
    {
      name: "Lame ebrechee",
      detail: "+8% attaque physique pour le reste du stage.",
      rarity: "rare",
      price: 30,
      stage: 1,
      effect: { kind: "stat-boost-stage", stat: "physical", percent: 8 },
    },
    {
      name: "Petite loot box",
      detail: "Coffre de petite valeur, ouverture immediate.",
      rarity: "common",
      price: 50,
      stage: 1,
      effect: { kind: "lootbox", tier: "small" },
    },
    {
      name: "Potion de soin",
      detail: "Consommable : soigne 30% PV de l'equipe.",
      rarity: "common",
      price: 25,
      stage: 1,
      effect: { kind: "consumable", consumable: "potion-heal" },
    },
    {
      name: "Bouclier d'urgence",
      detail: "Consommable : +15 bouclier a toute l'equipe.",
      rarity: "rare",
      price: 35,
      stage: 1,
      effect: { kind: "consumable", consumable: "shield-emergency" },
    },
  ],
  2: [
    {
      name: "Encens du vide",
      detail: "Reduit les cooldowns de 12% au prochain combat.",
      rarity: "rare",
      price: 35,
      stage: 2,
      effect: { kind: "cooldown-next-fight", percent: 12 },
    },
    {
      name: "Sceau arcanique",
      detail: "+12% magie pour le reste du stage.",
      rarity: "epic",
      price: 45,
      stage: 2,
      effect: { kind: "stat-boost-stage", stat: "magic", percent: 12 },
    },
    {
      name: "Fiole anti-poison",
      detail: "Consommable : annule le prochain malefice.",
      rarity: "rare",
      price: 30,
      stage: 2,
      effect: { kind: "consumable", consumable: "vial-antipoison" },
    },
    {
      name: "Loot box rare",
      detail: "Coffre rare, ouverture immediate.",
      rarity: "rare",
      price: 120,
      stage: 2,
      effect: { kind: "lootbox", tier: "rare" },
    },
    {
      name: "Potion de soin",
      detail: "Consommable : soigne 30% PV de l'equipe.",
      rarity: "common",
      price: 25,
      stage: 2,
      effect: { kind: "consumable", consumable: "potion-heal" },
    },
    {
      name: "Bombe runique",
      detail: "Consommable : 25 degats directs.",
      rarity: "rare",
      price: 40,
      stage: 2,
      effect: { kind: "consumable", consumable: "bomb-runic" },
    },
  ],
  3: [
    {
      name: "Benediction royale",
      detail: "Restaure 1 vie globale (max 3).",
      rarity: "legendary",
      price: 180,
      stage: 3,
      effect: { kind: "blessing-life" },
    },
    {
      name: "Couronne fissuree",
      detail: "+15% degats contre le prochain boss.",
      rarity: "epic",
      price: 90,
      stage: 3,
      effect: { kind: "boss-damage-bonus", percent: 15 },
    },
    {
      name: "Armure du dernier rempart",
      detail: "Le 1er heros K.O revient avec 30% PV.",
      rarity: "legendary",
      price: 110,
      stage: 3,
      effect: { kind: "first-ko-revive", percent: 30 },
    },
    {
      name: "Loot box epique",
      detail: "Coffre epique, ouverture immediate.",
      rarity: "epic",
      price: 250,
      stage: 3,
      effect: { kind: "lootbox", tier: "epic" },
    },
    {
      name: "Potion de soin",
      detail: "Consommable : soigne 30% PV de l'equipe.",
      rarity: "common",
      price: 25,
      stage: 3,
      effect: { kind: "consumable", consumable: "potion-heal" },
    },
    {
      name: "Bombe runique",
      detail: "Consommable : 25 degats directs.",
      rarity: "rare",
      price: 40,
      stage: 3,
      effect: { kind: "consumable", consumable: "bomb-runic" },
    },
  ],
};

export const LOOTBOX_PRICES: Record<LootBoxTier, number> = {
  small: 50,
  rare: 120,
  epic: 250,
  runic: 0,
};

export const LOOTBOX_TABLES: Record<LootBoxTier, LootBoxWeights> = {
  small: { fragments: 50, gold: 30, common: 18, rare: 2, epic: 0, legendary: 0 },
  rare: { fragments: 45, gold: 20, common: 0, rare: 30, epic: 5, legendary: 0 },
  epic: { fragments: 40, gold: 20, common: 0, rare: 20, epic: 35, legendary: 5 },
  runic: { fragments: 25, gold: 15, common: 0, rare: 20, epic: 35, legendary: 5 },
};
