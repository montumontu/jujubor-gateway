stay on the root folder JUJUBOR-API-GATEWAY

cdk bootstrap --app "npx ts-node jujubor-infra/bin/jujubor-gateway-infra.ts"
cdk synth --app "npx ts-node jujubor-infra/bin/jujubor-gateway-infra.ts"
cdk deploy --app "npx ts-node jujubor-infra/bin/jujubor-gateway-infra.ts"

sam local invoke -t cdk.out/JujuborGatewayInfraStack.template.json ClusterLambda -e jujubor-backend/src/apis-cluster/events/apis-cluster-post.json

sam local invoke -t cdk.out/JujuborGatewayInfraStack.template.json ClusterLambda -e jujubor-backend/src/apis-cluster/events/apis-cluster-get.json

sam local invoke -t cdk.out/JujuborGatewayInfraStack.template.json ClusterLambda -e jujubor-backend/src/apis-cluster/events/apis-cluster-patch.json