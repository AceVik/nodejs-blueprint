const routeParamTypes = ['path', 'query', 'header', 'cookie'] as const;
export type RouteParamType = typeof routeParamTypes[number];