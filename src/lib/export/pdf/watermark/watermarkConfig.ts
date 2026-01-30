export type WatermarkConfig = {
  textLines: string[];
  fontSize: number;
  opacity: number;
  rotationDegrees: number;
  color: { r: number; g: number; b: number };
  lineGap: number;
};

export const defaultWatermarkConfig: WatermarkConfig = {
  textLines: [
    'PREVIEW — NOT FOR OFFICIAL USE',
    'Upgrade to download the final document'
  ],
  fontSize: 32,
  opacity: 0.12,
  rotationDegrees: -30,
  color: { r: 0.2, g: 0.2, b: 0.2 },
  lineGap: 12
};
