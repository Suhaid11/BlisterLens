import { Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export interface ShareResult {
  success: boolean;
  uri?: string;
  error?: string;
}

/**
 * Captures the BlisterCard View into an image and opens the native share sheet.
 */
export async function shareCardSnapshot(viewRef: React.RefObject<any>): Promise<ShareResult> {
  if (!viewRef || !viewRef.current) {
    return { success: false, error: 'Card view reference is not mounted.' };
  }

  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 0.95,
      result: 'tmpfile',
    });

    if (Platform.OS === 'web') {
      // Web fallback: download the captured image file directly
      if (typeof document !== 'undefined') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `StreetShelf90-Collectible-${Date.now()}.png`;
        link.click();
        return { success: true, uri };
      }
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Sharing is not supported on this device/platform.',
        uri,
      };
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share your Street Shelf ’90 Collectible Card',
      UTI: 'public.png',
    });

    return { success: true, uri };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message || 'Failed to capture and share card.',
    };
  }
}
