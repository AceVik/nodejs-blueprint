import type { MiddlewareHandlerArgs } from '../middleware.types.js';
import { Awaitable } from '../../types/index.js';

/**
 * @deprecated
 */
export type ErrorMiddlewareHandler = (error: unknown, args: MiddlewareHandlerArgs) => Awaitable<void>;