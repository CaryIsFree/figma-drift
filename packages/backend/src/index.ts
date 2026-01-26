export type { 
  FigmaFrame, 
  DesignSpecs, 
  LiveSpecs, 
  FontSpec, 
  DriftReport, 
  CompareRequest, 
  CompareResponse 
} from './types.js';

export { 
  parseFigmaUrl, 
  fetchFigmaNode, 
  fetchFigmaImage, 
  extractDesignSpecs 
} from './figma/index.js';
export type { 
  FigmaNode, 
  FigmaFill, 
  FigmaTextStyle 
} from './figma/index.js';

export { 
  capturePageData, 
  closeBrowser 
} from './capture/index.js';
export type { CaptureResult } from './capture/index.js';

export { 
  compare 
} from './compare/index.js';
