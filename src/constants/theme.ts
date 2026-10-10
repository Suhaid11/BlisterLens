import { Platform } from 'react-native';

export const Colors = {
  // Physical 1990s Toy-Aisle Collectible Packaging Palette
  packaging: {
    cardboard: '#FAF7EE',        // Warm, pristine clay-coated packaging cardstock
    cardboardBacking: '#FAF7EE', // Alias for cardstock
    cardboardBorder: '#D8D1BE',  // Crisp die-cut rim
    deepInk: '#141518',          // Dense, rich packaging ink (high contrast)
    softWhite: '#FFFFFF',        // Pure white printed card label
    euroSlotBg: '#18191E',       // Shadow behind punch hole slot
    plasticHighlight: 'rgba(255, 255, 255, 0.70)', // Molded blister reflection glare
    plasticShadow: 'rgba(0, 0, 0, 0.18)',          // Molded cavity depth shadow
    flangeSeal: 'rgba(0, 0, 0, 0.08)',            // Heat-sealed blister rim
    inkBlack: '#141518',        // Deep ink text
    packagingRed: '#D9222A',    // Classic 90s toy package crimson
    vintageRed: '#D9222A',      // Alias for packaging red
    packagingBlue: '#1D4ED8',   // Saturated die-cast card blue
    racingYellow: '#F59E0B',    // Collector series gold / yellow
    collectorPurple: '#7C3AED', // Limited run / Grail edition purple
    graphite: '#333742',        // Matte graphite / silver accent
    barcodeBg: '#FFFFFF',
    // Diorama stage inside blister
    stageBg: '#F3EFE6',         // Warm off-white studio diorama
    stageGrid: 'rgba(0, 0, 0, 0.05)', // Subtle backdrop perspective grid
    stageFloor: '#E2DBD0',      // Stage asphalt floor line
  },
  light: {
    text: '#141518',
    background: '#FAF7EE',
    backgroundElement: '#EFE9DA',
    backgroundSelected: '#E2DBD0',
    textSecondary: '#666155',
  },
  dark: {
    // Gallery shell: modern, clean, rich charcoal - NOT pitch-black void!
    text: '#F8F9FA',
    background: '#16171B',       // Rich warm charcoal gallery
    backgroundElement: '#1F2127',// Elevated component surfaces
    backgroundSelected: '#2B2E37',// Interactive / active states
    textSecondary: '#9CA3AF',    // Subtle secondary labels
    border: '#2C2F38',           // Clean structural dividers
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Calculates standard relative luminance (ITU-R BT.709) of a hex color.
 */
export function getRelativeLuminance(hex: string): number {
  if (!hex || typeof hex !== 'string') return 0;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return 0;

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

/**
 * Calculates whether text placed on top of a hex color should be dark or light.
 * Essential so cards remain readable whether the car is Arctic White or Midnight Black.
 */
export function getReadableTextColor(hex: string): '#121418' | '#FFFFFF' {
  return getRelativeLuminance(hex) > 0.45 ? '#121418' : '#FFFFFF';
}

/**
 * Returns integrated packaging accent colors derived from detected car paint.
 * Ensures authentic packaging print relationships with mathematical contrast.
 */
export function getPackagingAccentsForCar(colourHex?: string, colourName: string = '') {
  const name = (colourName || '').toLowerCase();
  const hex = (colourHex || '#D9222A').toUpperCase();
  const carLuminance = getRelativeLuminance(hex);

  // 1. Light vehicles (White, Pearl, Silver, Light Grey, Ivory, Cream, Champagne, Pale Yellow/Pastel)
  if (
    name.includes('white') ||
    name.includes('pearl') ||
    name.includes('silver') ||
    name.includes('grey') ||
    name.includes('gray') ||
    name.includes('ivory') ||
    name.includes('cream') ||
    name.includes('champagne') ||
    carLuminance > 0.65
  ) {
    // Sophisticated vintage die-cast graphite/slate livery with high-contrast metallic white & gold branding
    return {
      bannerBg: '#23262F',
      bannerText: '#FFFFFF',
      brandTitleColor: '#FFFFFF',
      brandAccentColor: '#FCD34D',
      seriesSubtitleColor: 'rgba(255, 255, 255, 0.88)',
      registrationCodeColor: 'rgba(255, 255, 255, 0.70)',
      pinstripe: '#F59E0B',
      accentBorder: '#CBD5E1',
      tagBg: '#1E293B',
      isLightPalette: false,
    };
  }

  // 2. Black / Midnight / Deep Dark vehicles
  if (
    name.includes('black') ||
    name.includes('dark') ||
    name.includes('matte black') ||
    hex === '#000000' ||
    carLuminance < 0.08
  ) {
    return {
      bannerBg: '#181A20',
      bannerText: '#F7F4EA',
      brandTitleColor: '#FFFFFF',
      brandAccentColor: '#FCD34D',
      seriesSubtitleColor: 'rgba(255, 255, 255, 0.88)',
      registrationCodeColor: 'rgba(255, 255, 255, 0.70)',
      pinstripe: '#E2E8F0',
      accentBorder: '#9CA3AF',
      tagBg: '#111827',
      isLightPalette: false,
    };
  }

  // 3. Saturated color families
  let bannerBg = colourHex || '#D9222A';
  if (name.includes('red') || name.includes('crimson') || name.includes('ruby')) bannerBg = '#D9222A';
  else if (name.includes('blue') || name.includes('navy') || name.includes('sapphire')) bannerBg = '#1D4ED8';
  else if (name.includes('yellow') || name.includes('gold') || name.includes('amber')) bannerBg = '#D97706';
  else if (name.includes('green') || name.includes('emerald') || name.includes('racing green')) bannerBg = '#15803D';
  else if (name.includes('purple') || name.includes('violet')) bannerBg = '#7C3AED';
  else if (name.includes('orange')) bannerBg = '#EA580C';

  const bannerLuminance = getRelativeLuminance(bannerBg);
  const isLight = bannerLuminance > 0.45;

  return {
    bannerBg,
    bannerText: isLight ? '#121418' : '#FFFFFF',
    brandTitleColor: isLight ? '#121418' : '#FFFFFF',
    brandAccentColor: isLight ? '#B45309' : '#FCD34D',
    seriesSubtitleColor: isLight ? '#374151' : 'rgba(255, 255, 255, 0.88)',
    registrationCodeColor: isLight ? '#4B5563' : 'rgba(255, 255, 255, 0.70)',
    pinstripe: isLight ? '#B45309' : '#FFFFFF',
    accentBorder: isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.4)',
    tagBg: isLight ? '#17181C' : '#FFFFFF',
    isLightPalette: isLight,
  };
}

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 600;
