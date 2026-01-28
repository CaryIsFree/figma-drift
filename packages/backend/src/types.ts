// Core types shared across backend

export interface FigmaFrame {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface SpecItem<T> {
  value: T;
  nodes: { id: string; name: string }[];
}

export interface DesignSpecs {
  colors: SpecItem<string>[];
  fonts: SpecItem<FontSpec>[];
  spacing: SpecItem<number>[];
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
    diffPercent: number;
    diffPixels: number;
    totalPixels: number;
    diffImageBase64: string | null;
    figmaImageBase64?: string;
    liveImageBase64?: string;
  };
  specs: {
    colorDrift: SpecItem<string>[];
    fontDrift: SpecItem<FontSpec>[];
    spacingDrift: SpecItem<number>[];
  };
  passed: boolean;
}

export interface CompareRequest {
  figmaUrl: string;
  liveUrl: string;
  selector?: string;
  delay?: number;
  headers?: Record<string, string>;
  cookies?: string[];
  threshold?: number;
}

export interface CompareResponse {
  success: boolean;
  report?: DriftReport;
  error?: string;
}

export interface CaptureResult {
  screenshot: Buffer;
  specs: LiveSpecs;
}
