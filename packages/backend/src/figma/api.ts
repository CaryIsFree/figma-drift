const FIGMA_API_BASE = 'https://api.figma.com/v1';

export interface FigmaFileResponse {
  document: FigmaNode;
  name: string;
  lastModified: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: FigmaFill[];
  style?: FigmaTextStyle;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

export interface FigmaFill {
  type: string;
  color?: { r: number; g: number; b: number; a: number };
}

export interface FigmaTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
}

interface FigmaNodeResponse {
  nodes: Record<string, { document: FigmaNode } | undefined>;
}

interface FigmaImageResponse {
  images: Record<string, string | undefined>;
}

export async function fetchFigmaFile(
  fileKey: string,
  token: string
): Promise<FigmaFileResponse> {
  const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
    headers: {
      'X-Figma-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchFigmaNode(
  fileKey: string,
  nodeId: string,
  token: string
): Promise<FigmaNode> {
  const response = await fetch(
    `${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
    {
      headers: {
        'X-Figma-Token': token,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  const data: FigmaNodeResponse = await response.json();
  const nodeData = data.nodes[nodeId];

  if (!nodeData || !nodeData.document) {
    throw new Error(`Node ${nodeId} not found in file ${fileKey}`);
  }

  return nodeData.document;
}

export async function fetchFigmaImage(
  fileKey: string,
  nodeId: string,
  token: string,
  scale: number = 2
): Promise<string> {
  const response = await fetch(
    `${FIGMA_API_BASE}/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&scale=${scale}&format=png`,
    {
      headers: {
        'X-Figma-Token': token,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  const data: FigmaImageResponse = await response.json();
  const imageUrl = data.images[nodeId];

  if (!imageUrl) {
    throw new Error(`No image URL for node ${nodeId}`);
  }

  return imageUrl;
}

export function parseFigmaUrl(url: string): { fileKey: string; nodeId: string | null } {
  const fileMatch = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
  const nodeMatch = url.match(/node-id=([^&]+)/);

  if (!fileMatch) {
    throw new Error('Invalid Figma URL: could not extract file key');
  }

  const fileKey = fileMatch[2];
  if (!fileKey) {
    throw new Error('Invalid Figma URL: could not extract file key');
  }

  const nodeIdRaw = nodeMatch?.[1];
  return {
    fileKey,
    nodeId: nodeIdRaw ? decodeURIComponent(nodeIdRaw) : null,
  };
}
