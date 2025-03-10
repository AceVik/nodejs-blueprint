export const requestMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE'] as const;
export type RequestMethod = (typeof requestMethods)[number];