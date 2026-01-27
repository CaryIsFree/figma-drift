type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export function createLogger(namespace: string): Logger {
  const format = (level: LogLevel): string => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${namespace}]`;
  };

  return {
    debug: (...args: unknown[]) => console.debug(format('debug'), ...args),
    info: (...args: unknown[]) => console.info(format('info'), ...args),
    warn: (...args: unknown[]) => console.warn(format('warn'), ...args),
    error: (...args: unknown[]) => console.error(format('error'), ...args),
  };
}
