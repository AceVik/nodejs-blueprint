import type { HttpRequest } from 'uWebSockets.js';

/**
 * Represents the authentication credentials read from the Authorization header.
 * @property {string | null} username - The username, if present.
 * @property {string | null} password - The password, if present.
 */
export type AuthCredentials = {
  username: string | null;
  password: string | null;
};

/**
 * Handles HTTP headers extraction and parsing for uWebSockets.js requests.
 * Optimized for performance with lazy loading and direct bitwise operations for auth headers.
 */
export class HeadersHandler {
  private _headerInitiated = false;
  private _headers = new Map<string, string[]>();

  /**
   * Creates an instance of HeadersHandler.
   * @param {HttpRequest} req - The raw uWebSockets.js HTTP request object.
   */
  constructor(private readonly req: HttpRequest) {}

  /**
   * Lazily initializes and parses all headers from the request into a Map.
   * Prevents re-parsing if already initiated.
   */
  private initHeaders() {
    if (this._headerInitiated) return;

    this.req.forEach((key, value) => {
      const existing = this._headers.get(key);
      if (existing) {
        existing.push(value);
      } else {
        this._headers.set(key, [value]);
      }
    });

    this._headerInitiated = true;
  }

  /**
   * Retrieves a specific header value.
   * Delegates to the underlying C++ request object for performance.
   * @param {string} key - The header name (lowercase).
   * @returns {string | null} The header value or null if not present.
   */
  public get(key: string): string | null {
    return this.req.getHeader(key) ?? null;
  }

  /**
   * Retrieves all values for a specific header key.
   * Useful for headers that can appear multiple times (e.g., Set-Cookie).
   * Triggers full header initialization.
   * @param {string} key - The header name.
   * @returns {string[]} An array of header values.
   */
  public getAll(key: string): string[] {
    this.initHeaders();
    return this._headers.get(key) ?? [];
  }

  /**
   * Checks for the existence of a header.
   * Uses cached map if headers are already initialized to avoid C++ boundary crossing.
   * @param {string} key - The header name.
   * @returns {boolean} True if the header exists.
   */
  public has(key: string): boolean {
    if (this._headerInitiated) {
      return this._headers.has(key);
    }
    return this.req.getHeader(key) !== undefined;
  }

  /**
   * Retrieves the raw Authorization header.
   * @returns {string | null} The Authorization header value.
   */
  getAuthorization(): string | null {
    return this.get('authorization');
  }

  /**
   * Extracts the Bearer token from the Authorization header.
   * Uses highly optimized bitwise checks for case-insensitive 'Bearer' prefix detection.
   * @returns {string | null} The token string or null if invalid.
   */
  getAuthToken(): string | null {
    const h = this.get('authorization');
    if (!h || h.length < 7 || h.charCodeAt(6) !== 32) return null;

    if ((h.charCodeAt(0) | 32) !== 98) return null;
    if ((h.charCodeAt(1) | 32) !== 101) return null;
    if ((h.charCodeAt(2) | 32) !== 97) return null;
    if ((h.charCodeAt(3) | 32) !== 114) return null;
    if ((h.charCodeAt(4) | 32) !== 101) return null;
    if ((h.charCodeAt(5) | 32) !== 114) return null;

    return h.substring(7);
  }

  /**
   * Parses Basic Authentication credentials.
   * Optimized bitwise prefix check and efficient Base64 decoding.
   * @returns {AuthCredentials | null} The parsed credentials or null if invalid.
   */
  getAuthCredentials(): AuthCredentials | null {
    const h = this.get('authorization');
    if (!h || h.length < 6 || h.charCodeAt(5) !== 32) return null;

    if ((h.charCodeAt(0) | 32) !== 98) return null;
    if ((h.charCodeAt(1) | 32) !== 97) return null;
    if ((h.charCodeAt(2) | 32) !== 115) return null;
    if ((h.charCodeAt(3) | 32) !== 105) return null;
    if ((h.charCodeAt(4) | 32) !== 99) return null;

    const decoded = Buffer.from(h.substring(6), 'base64').toString('utf8');
    const colon = decoded.indexOf(':');

    if (colon === -1) {
      return { username: decoded, password: null };
    }

    return {
      username: decoded.substring(0, colon),
      password: decoded.substring(colon + 1),
    };
  }

  /**
   * Iterator for all headers.
   * Triggers full header initialization.
   * @returns {IterableIterator<[string, string]>} Iterator yielding key-value pairs.
   */
  public *[Symbol.iterator](): IterableIterator<[string, string]> {
    this.initHeaders();
    for (const [key, values] of this._headers) {
      for (const value of values) {
        yield [key, value];
      }
    }
  }
}