import type { JsonArray, JsonObject } from './json.types.js';
import type { Streamable } from './streamable.type.js';

export type Resultable = JsonObject | JsonArray | File | Streamable | string;