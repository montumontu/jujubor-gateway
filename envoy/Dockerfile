# the below form should be imported from ecr where i can store the envoy proxy and keep it
From envoyproxy/envoy:v1.21-latest


COPY listeners.yaml /etc/envoy/listeners.yaml
COPY clusters.yaml /etc/envoy/clusters.yaml
COPY dynamic-envoy.yaml /etc/envoy/dynamic-envoy.yaml

# COPY ./envoy.yaml ./envoy.yaml

EXPOSE 10001

CMD ["envoy", "-c",  "/etc/envoy/dynamic-envoy.yaml", "--log-level", "debug"]
