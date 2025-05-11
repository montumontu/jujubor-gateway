import { ApiController } from "./api.controller";
import middy from '@middy/core';
import inputOutputLogger from '@middy/input-output-logger';
import httpCors from '@middy/http-cors';

const apiControllerObj = new ApiController();

const baseHandler = async (event: any) => {
  console.log(event);
  const httpMethod = event?.requestContext?.http?.method || 'GET';
  const rawPath = event?.requestContext?.http?.path;
  const pathSegments = rawPath.split('/').filter(Boolean);
  const { body } = event;
  // Getting the cluster name from the path, its kept for use, when we use api gateway
  const clusterId = pathSegments.length ? pathSegments[0]: undefined;
  const prefix = pathSegments.length ? pathSegments[0]: undefined;
  console.log(clusterId, prefix, "cluster id and prefix");
  const orgId = "1";
  const methodHandlers: Record<string, () => unknown> = {
    GET: () => apiControllerObj.getApi(orgId, clusterId),
    POST: () => apiControllerObj.createCluster(body),
    PATCH: () => apiControllerObj.updateCluster(orgId, prefix, body),
    // PUT: () => apiControllerObj.updateApi(name, version, body),
    // DELETE: () => apiControllerObj.deleteApi(name, version),
    OPTIONS: () => ({ statusCode: 204 }),
  };

  try {
    const handler = methodHandlers[ httpMethod ];
    if (handler) {
      return await handler();
    } else {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    console.error(error);

    return { statusCode: 500, body: JSON.stringify(error) };
  }
};

const corsConfig = {
  methods: 'GET, POST, PUT, PATCH, OPTIONS, DELETE',
  headers: 'Content-Type, Authorization',
  allowCredentials: true,
  origin: '*',
};

export const handler = middy().use(inputOutputLogger()).handler(baseHandler).use(httpCors(corsConfig));
