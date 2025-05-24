# === Stage 1: Node.js for config generation ===
FROM node:18-alpine AS config-generator

WORKDIR /app

# Install node-fetch
# RUN npm install node-fetch@2
RUN echo "hi this is okdd"

# Copy and run config generation script
COPY ./scripts/configuration-creator.js .
COPY ./envoy-config .
COPY ./dynamic-envoy.json .
RUN node configuration-creator.js


# === Stage 2: Envoy Proxy ===
FROM envoyproxy/envoy:v1.34-latest

# Copy generated config from the first stage
COPY --from=config-generator /app/dynamic-envoy.json /etc/envoy/dynamic-envoy.json
COPY --from=config-generator /app/clusters.json /etc/envoy/clusters.json
COPY --from=config-generator /app/listeners.json /etc/envoy/listeners.json


# Set default command , use debug or info for the log level
CMD ["envoy", "-c", "/etc/envoy/dynamic-envoy.json", "--log-level", "info"] 
