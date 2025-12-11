import type { HttpRequest } from 'uWebSockets.js';

const basicString = 'basic ';
const bearerString = 'bearer ';

type AuthCredentials = {
  username: string | null;
  password: string | null;
};

export class HeadersHandler {
  private _headerInitiated = false;
  private _headers = new Map<string, string[]>();

  constructor(private readonly req: HttpRequest) {}

  private initHeaders() {
    if (this._headerInitiated) return;

    this.req.forEach((key, value) => {
      if (this._headers.has(key)) {
        const prevValue = this._headers.get(key)!;
        prevValue.push(value);
      } else {
        this._headers.set(key, [value]);
      }
    });

    this._headerInitiated = true;
  }

  public get(key: string): string | null {
    return this.req.getHeader(key) ?? null;
  }

  public getAll(key: string): string[] {
    this.initHeaders();
    return this._headers.get(key) ?? [];
  }

  public has(key: string): boolean {
    return this.req.getHeader(key) !== undefined;
  }

  getAuthorization(): string | null {
    return this.get('authorization');
  }

  getAuthToken(): string | null {
    const authLine = this.getAuthorization();

    if (!authLine?.toLowerCase().startsWith(bearerString)) {
      return null;
    }

    return authLine.substring(bearerString.length).trim();
  }

  getAuthCredentials(): AuthCredentials | null {
    const authLine = this.getAuthorization();

    if (!authLine?.toLowerCase().startsWith(basicString)) {
      return null;
    }

    const [ username = null, password = null ] = btoa(authLine?.substring(basicString.length).trim()).split(':');
    return { username, password };
  }

  public *[Symbol.iterator](): IterableIterator<[string, string]> {
    this.initHeaders();
    for (const [key, values] of this._headers) {
      for (const value of values) {
        yield [key, value];
      }
    }
  }
}