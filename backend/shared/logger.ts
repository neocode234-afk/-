import { randomUUID } from "node:crypto";

type LogFields = Record<string, string | number | boolean | null>;

// Keep log fields to identifiers and fixed labels. Never pass request bodies,
// passwords, tokens, cookies, email addresses, phone numbers, or receipt data.
export function logEvent(event: string, fields: LogFields = {}) {
  console.info(JSON.stringify({ timestamp: new Date().toISOString(), level: "info", event, ...fields }));
}

export function logError(event: string, error: unknown, fields: LogFields = {}) {
  const requestId = randomUUID();
  const candidate = error && typeof error === "object" ? error as { name?: unknown; code?: unknown } : null;
  const errorType = typeof candidate?.name === "string" && /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(candidate.name)
    ? candidate.name : "UnknownError";
  const errorCode = typeof candidate?.code === "string" && /^[A-Z][A-Z0-9_]{0,63}$/.test(candidate.code)
    ? candidate.code : undefined;
  // Error messages and stacks can contain SQL values or user input.
  console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: "error", event, requestId, ...fields, errorType, ...(errorCode ? { errorCode } : {}) }));
  return requestId;
}
