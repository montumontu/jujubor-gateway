// ---------------------------------------------------------------------------------
// ⏳ limiters.ts  — generic quota limiter with pluggable store & extractor
// ---------------------------------------------------------------------------------
import type { Request } from "express";
import { CounterStore } from "./stores.js";
import { byClientIdDaily } from "./extractors.js";

export interface LimitRule {
  name: string;              // id for logs/metrics
  extractor: (req: Request) => string;
  windowSeconds: number;     // e.g. 86_400 for daily
  maxRequests: number;       // quota
  errorStatus?: number;      // HTTP status when exceeded (default 429)
}

// function keyExtractor(req: Request) {
//   console.log(req.headers);
//   const client_id = req.headers.client_id;
//   console.log(client_id, "client_id");
//   return client_id;
// }

export class QuotaLimiter {
  constructor(private store: CounterStore, private rules: LimitRule[]) {}

  /** returns null if allowed, or an error response object if blocked */
  async check(req: Request): Promise<{ status: number; message: string } | null> {
    for (const rule of this.rules) {
      const key = rule.extractor(req);
      const count = await this.store.incr(key, rule.windowSeconds);
      if (count > rule.maxRequests) {
        return {
          status: rule.errorStatus ?? 429,
          message: `Rate limit exceeded for rule ${rule.name} (${count}/${rule.maxRequests})`,
        };
      }
    }
    return null; // all good
  }
}