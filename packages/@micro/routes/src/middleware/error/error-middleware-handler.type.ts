import type { MiddlewareHandlerArgs } from '../middleware.types.js';

export type ErrorMiddlewareHandler = (error: unknown, args: MiddlewareHandlerArgs) => void | Promise<void>;