stay on the root folder JUJUBOR-API-GATEWAY

cdk bootstrap --app "npx ts-node jujubor-infra/bin/jujubor-gateway-infra.ts"
cdk synth --app "npx ts-node jujubor-infra/bin/jujubor-gateway-infra.ts"
cdk deploy --app "npx ts-node jujubor-infra/bin/jujubor-gateway-infra.ts"