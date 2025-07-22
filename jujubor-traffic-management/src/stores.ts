// ---------------------------------------------------------------------------------
// 🗄️ stores.ts  — persistence abstraction (in‑memory default → Redis later)
// ---------------------------------------------------------------------------------
export interface CounterStore {
    incr(key: string, windowSeconds: number): Promise<number>; // returns new value
  }
  
  // 1️⃣ In‑memory store (good enough for single‑instance MVP)
  export class MemoryStore implements CounterStore {
    private map = new Map<string, { count: number; expiresAt: number }>();
    async incr(key: string, windowSeconds: number): Promise<number> {
      const now = Date.now();
      const ttlMs = windowSeconds * 1_000;
      const entry = this.map.get(key);
      if (!entry || entry.expiresAt < now) { 
        this.map.set(key, { count: 1, expiresAt: now + ttlMs });
        return 1;
      }
      console.log(entry.count, "entrycount");
      entry.count += 1;
      return entry.count;
    }
  }
  
  // 2️⃣ Redis store stub (use later for multi‑instance / shared‑state)
  //    Uncomment and supply REDIS_URL in env to switch without code changes.
  /*
  import Redis from "ioredis";
  export class RedisStore implements CounterStore {
    private redis = new Redis(process.env.REDIS_URL);
    async incr(key: string, windowSeconds: number): Promise<number> {
      const value = await this.redis.incr(key);
      if (value === 1) {
        await this.redis.expire(key, windowSeconds);
      }
      return value;
    }
  }
  */
  