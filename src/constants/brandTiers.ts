/**
 * Deterministic Brand Tiers for the Street Shelf '90 Rarity Engine.
 * Used to calculate collectible rarity score locally without arbitrary AI guessing.
 */
export const BRAND_TIERS: Record<string, number> = {
  // Tier 4: Exotic / Supercar (+40 pts)
  FERRARI: 40,
  LAMBORGHINI: 40,
  PORSCHE: 38,
  MCLAREN: 40,
  BUGATTI: 45,
  ASTON_MARTIN: 38,
  KOENIGSEGG: 45,
  PAGANI: 45,
  ROLLS_ROYCE: 40,
  BENTLEY: 35,

  // Tier 3: Performance / Enthusiast / Premium (+25 pts)
  BMW: 25,
  MERCEDES_BENZ: 25,
  AUDI: 24,
  ALFA_ROMEO: 26,
  JAGUAR: 24,
  MASERATI: 28,
  LEXUS: 22,
  CORVETTE: 28,
  DODGE: 20,
  SUBARU: 18,
  LOTUS: 32,

  // Tier 2: Heritage / Popular Sport (+15 pts)
  VOLKSWAGEN: 15,
  FORD: 14,
  CHEVROLET: 14,
  TOYOTA: 15,
  HONDA: 15,
  MAZDA: 16,
  NISSAN: 16,
  MINI: 16,
  VOLVO: 15,

  // Tier 1: Mainstream / Daily Street (+10 pts)
  HYUNDAI: 10,
  KIA: 10,
  SUZUKI: 10,
  PEUGEOT: 10,
  RENAULT: 10,
  FIAT: 10,
  SKODA: 10,
  TESLA: 15,
};

export function getBrandScore(make: string): number {
  const normalized = make.trim().toUpperCase().replace(/[\s-]/g, '_');
  return BRAND_TIERS[normalized] ?? 12;
}
