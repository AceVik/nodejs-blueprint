export type JsonPrimitive =
  | string                      // -> "string"
  | number                      // -> 123 (Note: Infinity/NaN become null)
  | boolean                     // -> true/false
  | null                        // -> null
  | Date                        // -> "2025-12-21T..." (via native toJSON)
  | URL                         // -> "https://..." (native toJSON in modern Node)
  | bigint                      // -> REQUIRES Global Patch (see below)
  | { toJSON(): unknown };      // -> Any custom object with toJSON method

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject { [k: string]: JsonValue }
export interface JsonArray extends Array<JsonValue> {}
