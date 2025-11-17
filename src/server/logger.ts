class Logger {
  info(message: unknown, ...args: unknown[]) {
    console.log(`[INFO]`, message, ...args);
  }

  error(message: unknown, ...args: unknown[]) {
    console.error(`[ERROR]`, message, ...args);
  }

  warn(message: unknown, ...args: unknown[]) {
    console.warn(`[WARN]`, message, ...args);
  }
}

export const logger = new Logger();
