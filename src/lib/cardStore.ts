import { BlisterCardData } from '@/types/card';

type Listener = (card: BlisterCardData | null) => void;

let activeCard: BlisterCardData | null = null;
const listeners = new Set<Listener>();

export function setActiveCard(card: BlisterCardData | null): void {
  activeCard = card;
  listeners.forEach((listener) => {
    try {
      listener(activeCard);
    } catch (e) {
      console.error('Error in cardStore listener:', e);
    }
  });
}

export function getActiveCard(): BlisterCardData | null {
  return activeCard;
}

export function subscribeActiveCard(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
