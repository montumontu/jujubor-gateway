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
  // Getting the cluster name from the path
  const name = pathSegments.length ? pathSegments[0]: undefined;
  
  const methodHandlers: Record<string, () => unknown> = {
    //GET: () => apiControllerObj.getApi(name),
    POST: () => apiControllerObj.createCluster(body),
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
  methods: 'GET, POST, PUT, OPTIONS, DELETE',
  headers: 'Content-Type, Authorization',
  allowCredentials: true,
  origin: '*',
};

export const handler = middy().use(inputOutputLogger()).handler(baseHandler).use(httpCors(corsConfig));
