import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { CarBBox } from '@/types/car';

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  base64: string;
}

const MAX_IMAGE_DIMENSION = 1024;

/**
 * Resizes an image so its largest dimension is at most 1024px,
 * keeping the aspect ratio intact and encoding as Base64 JPEG.
 */
export async function normalizeAndResizeImage(
  uri: string,
  origWidth: number,
  origHeight: number
): Promise<ProcessedImage> {
  const needsResize = origWidth > MAX_IMAGE_DIMENSION || origHeight > MAX_IMAGE_DIMENSION;

  const actions: ImageManipulator.Action[] = [];
  if (needsResize) {
    if (origWidth >= origHeight) {
      actions.push({ resize: { width: MAX_IMAGE_DIMENSION } });
    } else {
      actions.push({ resize: { height: MAX_IMAGE_DIMENSION } });
    }
  }

  const result = await ImageManipulator.manipulateAsync(
    uri,
    actions,
    {
      compress: 0.82,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!result.base64) {
    throw new Error('Failed to generate base64 encoding from image.');
  }

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    base64: result.base64,
  };
}

export interface CropRect {
  originX: number;
  originY: number;
  width: number;
  height: number;
  normalized: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

/**
 * Calculates an aspect-ratio-aware crop rectangle around the vehicle bounding box:
 * 1. Sanitizes and validates normalized coordinates [0, 1].
 * 2. Adds safe relative margins (15% horizontal, 17% vertical) to preserve wheels, roof, bumpers, mirrors.
 * 3. Expands symmetrically from vehicle center to approach the blister aspect ratio (~1.85:1).
 * 4. Never shrinks below the padded vehicle boundaries.
 * 5. Clamps strictly within image dimensions.
 */
export function calculateVehicleCropRect(
  imageWidth: number,
  imageHeight: number,
  bbox: CarBBox,
  targetAspectRatio = 1.85
): CropRect | null {
  // Normalize coordinates in case bbox values are 0..1000
  let bx = bbox.x > 1 && bbox.x <= 1000 ? bbox.x / 1000 : bbox.x;
  let by = bbox.y > 1 && bbox.y <= 1000 ? bbox.y / 1000 : bbox.y;
  let bw = bbox.width > 1 && bbox.width <= 1000 ? bbox.width / 1000 : bbox.width;
  let bh = bbox.height > 1 && bbox.height <= 1000 ? bbox.height / 1000 : bbox.height;

  // Sanity check: reject suspicious bboxes (point, whole frame, NaN, impossible aspect ratio)
  if (
    isNaN(bx) || isNaN(by) || isNaN(bw) || isNaN(bh) ||
    bw <= 0.05 || bh <= 0.04 ||
    (bw >= 0.98 && bh >= 0.98)
  ) {
    return null;
  }

  // Ensure coordinates stay within [0, 1]
  bx = Math.max(0, Math.min(1, bx));
  by = Math.max(0, Math.min(1, by));
  bw = Math.max(0.01, Math.min(1 - bx, bw));
  bh = Math.max(0.01, Math.min(1 - by, bh));

  const pixelAspect = (bw * imageWidth) / (bh * imageHeight);
  if (pixelAspect < 0.2 || pixelAspect > 5.5) {
    return null;
  }

  // 1. Safe relative margins around detected vehicle:
  // 15% horizontal, 17% vertical of vehicle dimensions
  const padX = bw * 0.15;
  const padY = bh * 0.17;

  let x1 = Math.max(0, bx - padX);
  let y1 = Math.max(0, by - padY);
  let x2 = Math.min(1, bx + bw + padX);
  let y2 = Math.min(1, by + bh + padY);

  // 2. Aspect-ratio expansion towards target (~1.85:1 blister window)
  const currentPixelW = (x2 - x1) * imageWidth;
  const currentPixelH = (y2 - y1) * imageHeight;
  const currentRatio = currentPixelW / Math.max(1, currentPixelH);

  if (currentRatio < targetAspectRatio) {
    // Crop is taller/narrower than blister window -> expand width symmetrically around center
    const desiredPixelW = currentPixelH * targetAspectRatio;
    const desiredNormW = desiredPixelW / imageWidth;
    const centerX = (x1 + x2) / 2;

    let newX1 = centerX - desiredNormW / 2;
    let newX2 = centerX + desiredNormW / 2;

    if (newX1 < 0) {
      newX2 = Math.min(1, newX2 + (0 - newX1));
      newX1 = 0;
    }
    if (newX2 > 1) {
      newX1 = Math.max(0, newX1 - (newX2 - 1));
      newX2 = 1;
    }

    // Never shrink below the padded vehicle boundaries
    x1 = Math.min(x1, Math.max(0, newX1));
    x2 = Math.max(x2, Math.min(1, newX2));
  } else if (currentRatio > targetAspectRatio) {
    // Crop is wider than blister window -> expand height symmetrically around center
    const desiredPixelH = currentPixelW / targetAspectRatio;
    const desiredNormH = desiredPixelH / imageHeight;
    const centerY = (y1 + y2) / 2;

    let newY1 = centerY - desiredNormH / 2;
    let newY2 = centerY + desiredNormH / 2;

    if (newY1 < 0) {
      newY2 = Math.min(1, newY2 + (0 - newY1));
      newY1 = 0;
    }
    if (newY2 > 1) {
      newY1 = Math.max(0, newY1 - (newY2 - 1));
      newY2 = 1;
    }

    // Never shrink below the padded vehicle boundaries
    y1 = Math.min(y1, Math.max(0, newY1));
    y2 = Math.max(y2, Math.min(1, newY2));
  }

  // 3. Final pixel boundary conversion & clamping
  const originX = Math.max(0, Math.floor(x1 * imageWidth));
  const originY = Math.max(0, Math.floor(y1 * imageHeight));
  const width = Math.min(imageWidth - originX, Math.ceil((x2 - x1) * imageWidth));
  const height = Math.min(imageHeight - originY, Math.ceil((y2 - y1) * imageHeight));

  if (width <= 20 || height <= 20) {
    return null;
  }

  return {
    originX,
    originY,
    width,
    height,
    normalized: { x1, y1, x2, y2 },
  };
}

/**
 * Crops the detected vehicle region from the image using the single authoritative crop rule:
 * Image -> AI BBox -> Local Aspect-Ratio Crop -> Final Image (Rendered with contain, zero secondary crop).
 */
export async function cropVehicleFromImage(
  imageUri: string,
  imageWidth: number,
  imageHeight: number,
  bbox: CarBBox
): Promise<string> {
  try {
    const cropRect = calculateVehicleCropRect(imageWidth, imageHeight, bbox);
    if (!cropRect) {
      // Graceful fallback to original image if bbox was invalid or suspicious
      return imageUri;
    }

    const cropResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: cropRect.originX,
            originY: cropRect.originY,
            width: cropRect.width,
            height: cropRect.height,
          },
        },
      ],
      {
        compress: 0.92,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return cropResult.uri;
  } catch (err) {
    // Graceful fallback to original image if cropping encounters an error
    return imageUri;
  }
}

/**
 * Deterministically generates an authentic 90s series number (e.g. "07 / 12")
 * from the vehicle make and model.
 */
export function generateSeriesNumber(make: string, model: string): string {
  let hash = 0;
  const str = `${make.trim()}-${model.trim()}`.toUpperCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const seriesIdx = (Math.abs(hash) % 12) + 1;
  return `${String(seriesIdx).padStart(2, '0')} / 12`;
}

export async function capturePhotoFromCamera(): Promise<ProcessedImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Camera access permission was denied. Please allow camera access in device settings.');
  }

  const pickerResult = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.9,
  });

  if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
    return null;
  }

  const asset = pickerResult.assets[0];
  return normalizeAndResizeImage(asset.uri, asset.width, asset.height);
}

export async function pickPhotoFromGallery(): Promise<ProcessedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission was denied. Please allow photo access in device settings.');
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.9,
  });

  if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
    return null;
  }

  const asset = pickerResult.assets[0];
  return normalizeAndResizeImage(asset.uri, asset.width, asset.height);
}
