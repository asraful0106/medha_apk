import { envVars } from "../config/envVars";

type ConsoleMethod = "log" | "info" | "warn" | "error" | "debug";

type Meta = Readonly<{
  comingFrom: string;
  line: number;
}>;

type LoggerFn = (meta: Meta, ...args: unknown[]) => void;

export const consoleDev: Record<ConsoleMethod, LoggerFn> = (() => {
  const isDev: boolean = envVars.ENVIRONMENT === "dev";

  const noop: LoggerFn = (_meta, ..._args) => {};

  if (!isDev) {
    return {
      log: noop,
      info: noop,
      warn: noop,
      error: noop,
      debug: noop,
    };
  }

  const validateMeta = (meta: Meta): void => {
    if (
      !meta ||
      typeof meta.comingFrom !== "string" ||
      meta.comingFrom.trim() === "" ||
      typeof meta.line !== "number"
    ) {
      throw new Error(
        "consoleDev requires meta: { comingFrom: string; line: number }",
      );
    }
  };

  const formatPrefix = (type: ConsoleMethod, meta: Meta): string => {
    return `[${type.toUpperCase()}] ${meta.comingFrom}:${meta.line}`;
  };

  const createLogger = (type: ConsoleMethod): LoggerFn => {
    return (meta, ...args) => {
      validateMeta(meta);
      console[type](formatPrefix(type, meta), ...args);
    };
  };

  return {
    log: createLogger("log"),
    info: createLogger("info"),
    warn: createLogger("warn"),
    error: createLogger("error"),
    debug: createLogger("debug"),
  };
})();
