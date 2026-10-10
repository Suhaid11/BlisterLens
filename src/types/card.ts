export type RarityLevel = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface BlisterCardData {
  id: string;
  make: string;
  model: string;
  variant: string | null;
  colour_name: string;
  colour_hex: string;
  rarity: RarityLevel;
  series_number: string; // e.g. "07 / 12"
  series_name: string;   // "STREET SHELF '90"
  image_uri?: string | any;
  cropped_image_uri?: string | any;
  timestamp: number;
}
