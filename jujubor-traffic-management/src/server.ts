// ---------------------------------------------------------------------------------
// 🚀 server.ts  — minimal Express app Envoy calls via ext_authz (HTTP mode)
// ---------------------------------------------------------------------------------
import express from "express";
import { MemoryStore /*, RedisStore*/ } from "./stores.js";
import { QuotaLimiter } from "./limiters.js";
import { byClientIdDaily } from "./extractors.js";

// choose store based on env
const store = process.env.REDIS_URL ? /*new RedisStore()*/ undefined : new MemoryStore();
if (!store) throw new Error("RedisStore not implemented in this stub");

const limiter = new QuotaLimiter(store, [
  {
    name: "daily-client-quota",
    extractor: byClientIdDaily,
    windowSeconds: 86_400, // 1 day
    maxRequests: Number(process.env.DAILY_QUOTA ?? 10),
  },
]);

const app = express();
app.use(express.json());

// Envoy ext_authz expects 200 (allowed) or 4xx/5xx (denied)
app.all("/ratelimit", async (req, res) => {
  const violation = await limiter.check(req);
  if (violation) {
    return res.status(violation.status).json({ error: violation.message });
  }
  return res.status(200).json({ ok: true });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Rate‑limit service listening on ${port}`));
