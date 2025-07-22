import type { Request } from "express";

export interface KeyExtractor {
  (req: Request): string; // returns a unique key string (e.g. "client:xyz|day:20250710")
}

export const byClientId: KeyExtractor = (req) => {
  const id = req.header("x-client-id") ?? "anonymous";
  return `client:${id}`;
};

// example extender: add a daily bucket so quotas reset every day
export const byClientIdDaily: KeyExtractor = (req) => {
  const id = req.header("x-client-id") ?? "anonymous";
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `client:${id}|day:${day}`;
};