// Core types shared across backend

export interface FigmaFrame {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface DesignSpecs {
  colors: string[];                    // Hex values: ["#ffffff", "#000000"]
  fonts: FontSpec[];
  spacing: number[];                   // Unique values: [8, 16, 24]
  dimensions: { width: number; height: number };
}

export interface FontSpec {
  family: string;
  size: number;
  weight: number;
}

export interface LiveSpecs {
  colors: string[];
  fonts: FontSpec[];
  spacing: number[];
  dimensions: { width: number; height: number };
}

export interface DriftReport {
  figmaUrl: string;
  liveUrl: string;
  timestamp: string;
  visual: {
    diffPercent: number;              // 0-100
    diffImageBase64: string | null;   // PNG as base64
  };
  specs: {
    colorDrift: string[];             // Colors in Figma but not in live
    fontDrift: FontSpec[];            // Fonts that differ
    spacingDrift: number[];           // Spacing values that differ
  };
  passed: boolean;                    // true if diffPercent < threshold
}

export interface CompareRequest {
  figmaUrl: string;                   // https://www.figma.com/file/XXX?node-id=YYY
  liveUrl: string;                    // https://staging.example.com/page
  threshold?: number;                 // Default: 0.1 (10% drift allowed)
}

export interface CompareResponse {
  success: boolean;
  report?: DriftReport;
  error?: string;
}
