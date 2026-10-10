import { RarityLevel } from '@/types/card';
import { getBrandScore } from './brandTiers';

/**
 * Deterministic Rarity Calculation Engine:
 * Rarity Score = Brand Tier Score (10-45) + Enthusiast Model Bonus (0-30) + Rare Colour Bonus (0-15)
 *
 * Tiers:
 * - Common:     0 - 34 pts
 * - Rare:      35 - 54 pts
 * - Epic:      55 - 74 pts
 * - Legendary: 75+ pts
 */

const ENTHUSIAST_KEYWORDS = [
  'M3', 'M4', 'M5', 'AMG', 'RS', 'GT', 'GTR', 'TYPE R', 'ST', 'WRX',
  'SUPRA', 'MIATA', 'NSX', 'CORVETTE', 'VIPER', 'SHELBY', 'HELLCAT',
  '911', 'TURBO', 'EVO', 'SKYLINE', 'CHARGER', 'MUSTANG', 'CHALLENGER'
];

const RARE_COLOURS = [
  'PURPLE', 'GOLD', 'ORANGE', 'BRONZE', 'BRITISH RACING GREEN',
  'MATTE', 'MIDNIGHT PURPLE', 'CHAMELEON', 'YELLOW', 'LIME'
];

export function calculateRarity(make: string, model: string, colourName: string): RarityLevel {
  const brandScore = getBrandScore(make);

  const modelUpper = model.toUpperCase();
  const isEnthusiast = ENTHUSIAST_KEYWORDS.some((kw) => modelUpper.includes(kw));
  const modelScore = isEnthusiast ? 25 : 8;

  const colourUpper = colourName.toUpperCase();
  const isRareColour = RARE_COLOURS.some((rc) => colourUpper.includes(rc));
  const colourScore = isRareColour ? 15 : 5;

  const total = brandScore + modelScore + colourScore;

  if (total >= 75) return 'Legendary';
  if (total >= 55) return 'Epic';
  if (total >= 35) return 'Rare';
  return 'Common';
}

export const RARITY_CONFIG: Record<
  RarityLevel,
  { label: string; badgeBg: string; badgeText: string; accentColor: string; stamp: string }
> = {
  Common: {
    label: 'STREET COMMON',
    badgeBg: '#4A5568',
    badgeText: '#FFFFFF',
    accentColor: '#718096',
    stamp: 'C-01',
  },
  Rare: {
    label: 'TRACK RARE',
    badgeBg: '#1D4ED8',
    badgeText: '#FFFFFF',
    accentColor: '#3B82F6',
    stamp: 'R-07',
  },
  Epic: {
    label: 'SPECIAL SPEC',
    badgeBg: '#7C3AED',
    badgeText: '#FFFFFF',
    accentColor: '#A855F7',
    stamp: 'E-90',
  },
  Legendary: {
    label: 'GRAIL / 1 OF 1',
    badgeBg: '#B45309',
    badgeText: '#FFFBEB',
    accentColor: '#F59E0B',
    stamp: 'L-99',
  },
};
