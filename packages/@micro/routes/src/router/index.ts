type PathPart = {
  value: string;
  params?: Record<string, unknown>;
  middlewares?: Set<unknown>;
  next?: Map<string, PathPart>;
  prev?: PathPart;
};

const rootPart: PathPart = {
  value: '/',
};

export * from './import-routes';