export const log = (...messages: string[]) => {
  console.log(...messages);
};

export const debug = (...messages: string[]) => {
  const location = new Error().stack?.split("\n")[2]?.trim() ?? "unknown";
  console.debug(...messages.map((m) => `[${location}] ${m}`));
};

export const logError = (...messages: string[]) => {
  const location = new Error().stack?.split("\n")[2]?.trim() ?? "unknown";
  console.error(...messages.map((m) => `[${location}] ${m}`));
};
