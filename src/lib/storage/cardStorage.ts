import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlisterCardData } from '@/types/card';

const STORAGE_KEY = '@blisterlens_recent_cards_v2';
const MAX_SAVED_CARDS = 30;

let saveQueue = Promise.resolve<any>(undefined);

/**
 * Saves a generated BlisterCard to local AsyncStorage.
 * Appends the new card (prepended as latest), preserving all existing saved collectibles.
 * Uses a serial promise chain to eliminate concurrent write collision risks.
 */
export async function saveCardToStorage(card: BlisterCardData): Promise<BlisterCardData[]> {
  return new Promise((resolve, reject) => {
    saveQueue = saveQueue.then(async () => {
      try {
        const existing = await getSavedCardsFromStorage();
        // Keep all existing cards except exact matching ID (if updating existing)
        const filtered = existing.filter((c) => c && c.id && c.id !== card.id);
        const updated = [card, ...filtered].slice(0, MAX_SAVED_CARDS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        resolve(updated);
      } catch (err) {
        console.error('Failed to save card to local storage:', err);
        reject(new Error('Could not save card to local storage.'));
      }
    });
  });
}

/**
 * Retrieves all saved BlisterCards from local AsyncStorage.
 */
export async function getSavedCardsFromStorage(): Promise<BlisterCardData[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((c) => Boolean(c && c.id)) : [];
  } catch (err) {
    console.error('Failed to load cards from local storage:', err);
    return [];
  }
}

/**
 * Deletes a single card by its ID from local storage.
 */
export async function deleteCardFromStorage(id: string): Promise<BlisterCardData[]> {
  return new Promise((resolve) => {
    saveQueue = saveQueue.then(async () => {
      try {
        const existing = await getSavedCardsFromStorage();
        const updated = existing.filter((c) => c && c.id && c.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        resolve(updated);
      } catch (err) {
        console.error('Failed to delete card from local storage:', err);
        resolve([]);
      }
    });
  });
}

/**
 * Clears all saved cards from local storage.
 */
export async function clearAllSavedCards(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
}
