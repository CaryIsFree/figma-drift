export class ValidationError extends Error {
  public readonly context: Record<string, unknown>;

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.context = context;
  }
}

export class FigmaApiError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'FigmaApiError';
    this.statusCode = statusCode;
  }
}

export class CaptureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CaptureError';
  }
}
