const routeParamTypes = ['path', 'query', 'header'] as const;
export type RouteParamType = typeof routeParamTypes[number];