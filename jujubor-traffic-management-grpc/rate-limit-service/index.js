import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

// 1) Load proto
const packageDef = protoLoader.loadSync("rls.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObj = grpc.loadPackageDefinition(packageDef);
const proto = grpcObj.envoy.service.ratelimit.v3;

// In‑memory counters for demo (reset when container restarts)
const MAX_REQUESTS = 5; // per key per minute
const buckets = new Map();

function shouldRateLimit(call, callback) {
  const now = Date.now();
  const [desc] = call.request.descriptors || [];
  const apiKey = desc?.entries?.[0]?.value || "anonymous";

  let bucket = buckets.get(apiKey);
  if (!bucket || now - bucket.windowStart > 60_000) {
    bucket = { count: 0, windowStart: now };
    buckets.set(apiKey, bucket);
  }


  bucket.count += 1;

  const isOver = bucket.count > MAX_REQUESTS;
  const code = isOver ? 2 : 1; // 1 = OK, 2 = OVER_LIMIT

  console.log(`[RLS] api_key=${apiKey} count=${bucket.count} => ${isOver ? "OVER_LIMIT" : "OK"}`);

  callback(null, { overall_code: code });
}

const server = new grpc.Server();
server.addService(proto.RateLimitService.service, { ShouldRateLimit: shouldRateLimit });
server.bindAsync("0.0.0.0:8081", grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log("gRPC RLS listening on 8081");
});
