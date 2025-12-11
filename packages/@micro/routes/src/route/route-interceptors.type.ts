import type { Interceptor } from '../http/interceptors/index.js';
import type { OmitInterceptor } from '../http/interceptors/omit.js';
import { type ZodVoid } from 'zod';

/**
 * Represents a single item in the route's interceptor definition list.
 * Can be an active Interceptor or an instruction to Omit a global one.
 */
export type RouteInterceptorDefinition = Interceptor<ZodVoid> | OmitInterceptor;

/**
 * A readonly array of interceptor definitions for a route.
 */
export type RouteInterceptorDefinitions = ReadonlyArray<RouteInterceptorDefinition>;