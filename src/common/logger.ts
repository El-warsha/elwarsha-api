export type LogFields = Record<string, unknown>;

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  child(fields: LogFields): Logger;
}

export class ConsoleLogger implements Logger {
  constructor(
    private readonly level: "debug" | "info" | "warn" | "error",
    private readonly base: LogFields = {},
  ) {}

  debug(message: string, fields?: LogFields): void {
    this.write("debug", message, fields);
  }

  info(message: string, fields?: LogFields): void {
    this.write("info", message, fields);
  }

  warn(message: string, fields?: LogFields): void {
    this.write("warn", message, fields);
  }

  error(message: string, fields?: LogFields): void {
    this.write("error", message, fields);
  }

  child(fields: LogFields): Logger {
    return new ConsoleLogger(this.level, { ...this.base, ...fields });
  }

  private write(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    fields?: LogFields,
  ): void {
    const rank = { debug: 10, info: 20, warn: 30, error: 40 };
    if (rank[level] < rank[this.level]) {
      return;
    }

    const payload = {
      level,
      message,
      time: new Date().toISOString(),
      ...this.base,
      ...fields,
    };
    const line = JSON.stringify(payload);
    if (level === "error") {
      console.error(line);
      return;
    }
    if (level === "warn") {
      console.warn(line);
      return;
    }
    console.log(line);
  }
}
