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
            "num_retries": 2,
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
                          "routes": routeList,
                          
                        }
                      ]
                    },
                    "http_filters": [
                      {
                        "name": "envoy.filters.http.jwt_authn",
                        "typed_config": {
                          "@type": "type.googleapis.com/envoy.extensions.filters.http.jwt_authn.v3.JwtAuthentication",
                          "providers": {
                            "cognito": {
                              "issuer": "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_9LftqI30o",
                              // "audiences": ["4m171v72ria4kdoaeo2d9bh1j4"],
                              // "remote_jwks": {
                              //   "http_uri": {
                              //     "uri": "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_9LftqI30o/.well-known/jwks.json",
                              //     "cluster": "jwks_cluster",
                              //     "timeout": "50s"
                              //   },
                              //   "cache_duration": "60s"
                              // }
                              "local_jwks": {
                                "filename": "/etc/envoy/jwks.json"
                              }
                            }
                          },
                          "rules": [
                            {
                              "match": { "prefix": "/" },
                              "requires": {
                                "provider_name": "cognito"
                              }
                            }
                          ]
                        }
                      },
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
    const cognitoCluster = {
      "name": "jwks_cluster",
      "@type": "type.googleapis.com/envoy.config.cluster.v3.Cluster",
      "connect_timeout": "5s",
      "type": "STRICT_DNS",
      "lb_policy": "ROUND_ROBIN",
      "load_assignment": {
        "cluster_name": "jwks_cluster",
        "endpoints": [
          {
            "lb_endpoints": [
              {
                "endpoint": {
                  "address": {
                    "socket_address": {
                      "address": "cognito-idp.ap-south-1.amazonaws.com",
                      "port_value": 443
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      "transport_socket": {
        "name": "envoy.transport_sockets.tls",
        "typed_config": {
          "@type": "type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.UpstreamTlsContext"
        }
      }
    };
    
    cdsResources.push(cognitoCluster);
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
