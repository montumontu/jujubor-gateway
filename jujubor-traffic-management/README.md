// traffic-management-mvp (TypeScript)
// -------------------------------------
// A minimal, extensible traffic‑management service that Envoy can call (via the
// ext_authz or rate‑limit HTTP call‑out) to enforce **per‑client total‑call quotas**
// for your MVP.  Designed so you can plug in additional keys (route, IP, plan,
// method, etc.) or swap the storage back‑end (in‑memory ➜ Redis) without
// rewriting business logic.
//
// Project layout (one file per section below if you copy/paste into real files):
// ├─ package.json
// └─ src/
//    ├─ server.ts            ← HTTP entry‑point Envoy will call
//    ├─ limiters.ts          ← core limiter + strategy pattern
//    ├─ stores.ts            ← in‑memory + Redis store (pluggable)
//    └─ extractors.ts        ← ways to build a unique key (clientId, route …)

// ---------------------------------------------------------------------------------
// 🛠️ Extending the MVP Later
// ---------------------------------------------------------------------------------
// • Swap MemoryStore → RedisStore by exporting RedisStore above and setting REDIS_URL.
// • Add more LimitRule entries (e.g. per‑minute token bucket).
// • Implement sliding‑window or token‑bucket limiter strategies.
// • Add JWT claim extractor:
//     export const byJwtSub = (req) => `sub:${req.header('x-jwt-sub')}`;
// • Use Envoy descriptors in place of ext_authz for native gRPC rate‑limit once needed.

// That’s it — a lean, Node.js TypeScript service you can run *now* behind Envoy to
// enforce per‑client total‑call quotas, yet flexible enough to evolve without
// throwing away this work. 🚀
