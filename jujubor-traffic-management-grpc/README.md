## How to start

`Docker compose up`

## Grpcurl to start 

### We need to go inside the rate-limit-service and run

```  grpcurl -plaintext \
   -import-path . \
   -proto rls.proto \
   -d '{
     "domain": "global",
     "descriptors": [
      {
        "entries": [
           { "key": "api_key", "value": "test123" }
        ]
       }
     ]
   }' \
   localhost:8081 envoy.service.ratelimit.v3.RateLimitService/ShouldRateLimit
```

The response should be 
```
{
  "overallCode": "OK"
}
 ```

And there will be the console log printed with the count in the rate-limit-service