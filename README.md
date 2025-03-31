docker compose build --no-cache

docker compose up

docker compose down

docker compose up envoy --build --log-level debug

hit the URL - localhost:10001/get

docker exec -it <pid> /bin/sh

apt update && apt install -y vim

curl http://localhost:10001/health

docker cp envoy/listeners.yaml 87c150494e99:/etc/envoy/listeners.yaml


