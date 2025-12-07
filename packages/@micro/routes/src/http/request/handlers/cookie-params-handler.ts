import type { HttpRequest } from 'uWebSockets.js';

/**
 * Handles parsing and retrieval of HTTP cookies from the request header.
 * Uses a lazy-loading strategy with a high-performance, regex-free parser optimized for V8.
 */
export class CookieParamsHandler {
  private _parsed: Record<string, string> | null = null;

  /**
   * Creates a new CookieParamsHandler.
   *
   * @param req - The raw uWebSockets.js HttpRequest object.
   */
  constructor(private readonly req: HttpRequest) {}

  /**
   * Lazily parses the 'Cookie' header string into an object.
   * This method is idempotent and runs only once upon the first access to cookie data.
   */
  private init(): void {
    if (this._parsed) return;

    this._parsed = {};
    const header = this.req.getHeader('cookie');

    if (!header) return;

    const len = header.length;
    let start = 0;
    let i = 0;

    while (i < len) {
      while (i < len && header.charCodeAt(i) !== 0x3b) {
        i++;
      }

      const pair = header.substring(start, i);
      const eqIdx = pair.indexOf('=');

      if (eqIdx > 0) {
        const key = pair.substring(0, eqIdx).trim();
        let val = pair.substring(eqIdx + 1).trim();

        if (val.indexOf('%') !== -1) {
          try {
            val = decodeURIComponent(val);
          } catch {
            // Keep raw value if decoding fails
          }
        }

        if (this._parsed[key] === undefined) {
          this._parsed[key] = val;
        }
      }

      start = i + 1;
      i = start;
    }
  }

  /**
   * Retrieves a specific cookie value by its name.
   *
   * @param key - The name of the cookie.
   * @returns The cookie value if present, otherwise null.
   */
  public get(key: string): string | null {
    this.init();
    return this._parsed![key] ?? null;
  }

  /**
   * Checks if a specific cookie exists in the request.
   *
   * @param key - The name of the cookie.
   * @returns True if the cookie exists, otherwise false.
   */
  public has(key: string): boolean {
    this.init();
    return this._parsed![key] !== undefined;
  }

  /**
   * Retrieves all parsed cookies as a key-value object.
   *
   * @returns A record containing all cookies.
   */
  public getAll(): Record<string, string> {
    this.init();
    return this._parsed!;
  }
}