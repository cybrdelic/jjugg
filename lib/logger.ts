type LogLevel = "debug" | "info" | "warn" | "error";

interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

class AppLogger implements Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private enabledLevels: Set<LogLevel>;

  constructor(enabledLevels: LogLevel[] = ["error", "warn"]) {
    this.enabledLevels = new Set(enabledLevels);

    // In development, enable all levels by default
    if (this.isDevelopment) {
      this.enabledLevels = new Set(["debug", "info", "warn", "error"]);
    }
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!this.enabledLevels.has(level)) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case "debug":
        console.debug(prefix, message, ...args);
        break;
      case "info":
        console.info(prefix, message, ...args);
        break;
      case "warn":
        console.warn(prefix, message, ...args);
        break;
      case "error":
        console.error(prefix, message, ...args);
        break;
    }
  }

  debug(message: string, ...args: any[]) {
    this.log("debug", message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log("error", message, ...args);
  }
}

// Export singleton logger instance
export const logger = new AppLogger();

// Export factory for component-specific loggers
export const createLogger = (
  component: string,
  levels?: LogLevel[]
): Logger => {
  const componentLogger = new AppLogger(levels);
  return {
    debug: (message: string, ...args: any[]) =>
      componentLogger.debug(`[${component}] ${message}`, ...args),
    info: (message: string, ...args: any[]) =>
      componentLogger.info(`[${component}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) =>
      componentLogger.warn(`[${component}] ${message}`, ...args),
    error: (message: string, ...args: any[]) =>
      componentLogger.error(`[${component}] ${message}`, ...args),
  };
};
