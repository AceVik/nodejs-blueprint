import type { HttpRequest } from 'uWebSockets.js';

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

  public *[Symbol.iterator](): IterableIterator<[string, string]> {
    this.initHeaders();
    for (const [key, values] of this._headers) {
      for (const value of values) {
        yield [key, value];
      }
    }
  }
}