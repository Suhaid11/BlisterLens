export interface CarBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Top3Match {
  make: string;
  model: string;
  confidence: number;
}

export interface CarDetectionResult {
  make: string;
  model: string;
  variant: string | null;
  colour_name: string;
  colour_hex: string;
  confidence: number;
  top3: Top3Match[];
  car_bbox: CarBBox;
}
