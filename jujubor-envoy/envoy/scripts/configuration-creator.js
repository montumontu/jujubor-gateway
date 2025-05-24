const fs = require('fs');
const path = '/etc/envoy';
const apiUrl = 'https://wtqqnztspbtgk7cvp6r6oghbbm0obiss.lambda-url.ap-south-1.on.aws'; // replace with actual API URL
const accessLog = require('./access-log-template.json');

async function generateEnvoyConfigs() {
  try {
    const response = await fetch(apiUrl);
    const x = await response.json();
    const clusters = x.Items || [];

    console.log("clusters", x);

    const cdsResources = [];
    const routeList = [];

    for (const cluster of clusters) {
      if (cluster.deleted) continue;

      // CDS entry
      const cds = {
        "@type": "type.googleapis.com/envoy.config.cluster.v3.Cluster",
        "name": cluster.clusterName,
        "connect_timeout": "5s",
        "type": "STRICT_DNS",
        "lb_policy": "ROUND_ROBIN",
        "dns_lookup_family": "V4_ONLY",
        "load_assignment": {
          "cluster_name": cluster.clusterName,
          "endpoints": [
            {
              "lb_endpoints": [
                {
                  "endpoint": {
                    "address": {
                      "socket_address": {
                        "address": cluster.address,
                        "port_value": cluster.port
                      }
                    }
                  }
                }
              ]
            }
          ]
        },
        "transport_socket": cluster.useTLS ? {
          "name": "envoy.transport_sockets.tls",
          "typed_config": {
            "@type": "type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.UpstreamTlsContext",
            "sni": cluster.address
          }
        } : {
          "name": "envoy.transport_sockets.raw_buffer",
          "typed_config": {}
        }
      };
      cdsResources.push(cds);

      // Route for this cluster
      routeList.push({
        "match": { "prefix": `/${cluster.prefix}/` },
        "route": {
          "cluster": cluster.clusterName,
          "prefix_rewrite": "/",
          "host_rewrite_literal": "postman-echo.com",
          "timeout": "10s",
          "retry_policy": {
            "num_retries": 3,
            "retry_on": "connect-failure,refused-stream"
          }
        }
      });
      routeList.push({
        "match": { "prefix": `/${cluster.prefix}` },
        "route": {
          "cluster": cluster.clusterName,
          "prefix_rewrite": "/",
          "host_rewrite_literal": "postman-echo.com",
          "timeout": "10s",
          "retry_policy": {
            "num_retries": 3,
            "retry_on": "connect-failure,refused-stream"
          }
        }
      });   
    }

    // Add health route first
    routeList.unshift({
      "match": { "prefix": "/health" },
      "direct_response": {
        "status": 200,
        "body": { "inline_string": "OK" }
      }
    });
    // LDS: one listener
    const ldsJson = {
      resources: [
        {
          "@type": "type.googleapis.com/envoy.config.listener.v3.Listener",
          "name": "listener_0",
          "address": {
            "socket_address": {
              "address": "0.0.0.0",
              "port_value": 10001
            }
          },
          "filter_chains": [
            {
              "filters": [
                {
                  "name": "envoy.filters.network.http_connection_manager",
                  "typed_config": {
                    "@type": "type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager",
                    "stat_prefix": "ingress_http",
                    "codec_type": "AUTO",
                    access_log: accessLog.access_log,
                    "route_config": {
                      "name": "local_route",
                      "virtual_hosts": [
                        {
                          "name": "local_service",
                          "domains": ["*"],
                          "routes": routeList
                        }
                      ]
                    },
                    "http_filters": [
                      {
                        "name": "envoy.filters.http.router",
                        "typed_config": {
                          "@type": "type.googleapis.com/envoy.extensions.filters.http.router.v3.Router"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    // Final CDS
    const cdsJson = { resources: cdsResources };

    // Ensure directory exists
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });

    fs.writeFileSync(`clusters.json`, JSON.stringify(cdsJson, null, 2));
    fs.writeFileSync(`listeners.json`, JSON.stringify(ldsJson, null, 2));

    console.log('✅ Generated CDS and LDS files at /etc/envoy');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

generateEnvoyConfigs();
