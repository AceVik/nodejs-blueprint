import { ResultMessage } from './result-message.class.js';

/**
 * A lightweight result container that transports an optional data payload
 * together with a list of informational, warning, and error messages.
 *
 * Design goals:
 * - O(1) error-state checks via an internal flag updated on mutation
 * - Minimal allocations; pragmatic, mutable API for low overhead
 * - Functional helpers (`map`, `flatMap`, `tap`) to compose pipelines
 * - Simple JSON representation for transport/logging
 *
 * Example
 * ```ts
 * const userRes = await Result.fromPromise(fetchUser(id));
 * if (!userRes.isOk()) {
 *   logger.warn(userRes.errors());
 *   return userRes.toJSON();
 * }
 * const safeUser = userRes
 *   .map(u => sanitize(u))
 *   .addInfo('User sanitized');
 * ```
 */
export class Result<TData> {
  protected hasErrors = false;

  protected constructor(
    protected data?: TData,
    protected messages: ResultMessage<unknown>[] = [],
  ) {
    // O(1) update is handled by mutation methods; constructor derives from initial messages
    this.hasErrors = this.messages.find((m) => m.isError()) !== undefined;
  }

  // -------------------- Accessors --------------------
  /**
   * Returns a readonly view of all attached messages.
   */
  public getMessages(): readonly ResultMessage<unknown>[] {
    return this.messages;
  }

  /**
   * Returns the wrapped data (if any) without unwrapping guarantees.
   * Prefer `expect` or `unwrapOr` when you need a definite value.
   */
  public getData(): TData | undefined {
    return this.data;
  }

  // -------------------- State queries --------------------
  /**
   * True when no error messages have been added/combined.
   * O(1) check backed by an internal flag.
   */
  public isOk(): this is Result<TData> {
    return !this.hasErrors;
  }

  /**
   * Convenience inverse of `isOk()`.
   */
  public failed(): boolean {
    return this.hasErrors;
  }

  /** Returns true if at least one warning is present. */
  public hasWarnings(): boolean {
    return this.messages.some((m) => m.isWarning());
  }

  /** Returns true if at least one info message is present. */
  public hasInfos(): boolean {
    return this.messages.some((m) => m.isInfo());
  }

  /** Returns only error messages. */
  public errors(): ResultMessage<'error'>[] {
    return this.messages.filter((m) => m.isError()) as ResultMessage<'error'>[];
  }

  /** Returns only warning messages. */
  public warnings(): ResultMessage<'warning'>[] {
    return this.messages.filter((m) => m.isWarning()) as ResultMessage<'warning'>[];
  }

  /** Returns only info messages. */
  public infos(): ResultMessage<'info'>[] {
    return this.messages.filter((m) => m.isInfo()) as ResultMessage<'info'>[];
  }

  // -------------------- Mutation helpers --------------------
  /**
   * Appends messages of another result into this one and updates the error flag in O(1).
   * Does not modify `data`.
   */
  public includeMessages(result: Result<any>) {
    this.messages.push(...result.messages);
    // O(1) way to keep errors flag up-to-date
    this.hasErrors = this.hasErrors || result.hasErrors;
  }

  /** Adds an info message. */
  public addInfo(message: string): this {
    this.messages.push(ResultMessage.info(message));
    return this;
  }

  /** Adds a warning message with optional structured payload. */
  public addWarning<T = unknown>(message: string, warning?: T): this {
    this.messages.push(ResultMessage.warning(message, warning));
    return this;
  }

  /** Adds an error message with optional structured payload and flips the error flag. */
  public addError<T = unknown>(message: string, error?: T): this {
    this.messages.push(ResultMessage.error(message, error));
    this.hasErrors = true;
    return this;
  }

  // -------------------- Unwrap helpers --------------------
  /** Returns the data as-is (possibly `undefined`). */
  public unwrap(): TData | undefined {
    return this.data;
  }

  /**
   * Returns the data or throws an Error if the data is `undefined`.
   * Note: This is about presence of data, not success state.
   */
  public expect(message = 'Expected result data, but none was present'): TData {
    if (this.data === undefined) {
      throw new Error(message);
    }
    return this.data;
  }

  /** Returns the data or a provided default value when data is `undefined`. */
  public unwrapOr<TDefault = TData>(defaultValue: TDefault): TData | TDefault {
    return this.data ?? defaultValue;
  }

  // -------------------- Functional helpers --------------------
  /**
   * Maps the wrapped data to a new type while preserving messages and error state.
   * If the result has errors or no data, messages are forwarded and data stays `undefined`.
   */
  public map<TOut>(fn: (data: TData) => TOut): Result<TOut> {
    if (!this.isOk() || this.data === undefined) {
      const r = new Result<TOut>(undefined, [...this.messages]);
      // hasErrors mirrors this.hasErrors
      (r as any).hasErrors = this.hasErrors;
      return r;
    }
    return new Result<TOut>(fn(this.data), [...this.messages]);
  }

  /**
   * Chains another result-producing function. Messages are aggregated.
   * If the current result has errors or no data, it short-circuits and forwards messages.
   */
  public flatMap<TOut>(fn: (data: TData) => Result<TOut>): Result<TOut> {
    if (!this.isOk() || this.data === undefined) {
      const r = new Result<TOut>(undefined, [...this.messages]);
      (r as any).hasErrors = this.hasErrors;
      return r;
    }
    const next = fn(this.data);
    const combined = new Result<TOut>(next.unwrap(), [...this.messages]);
    combined.includeMessages(next);
    return combined;
  }

  /** Runs a side-effect on this result and returns it unmodified. */
  public tap(fn: (self: Result<TData>) => void): this {
    fn(this);
    return this;
  }

  // -------------------- Serialization --------------------
  /**
   * Stable JSON representation suitable for transport or logging.
   * Shape: `{ ok: boolean, data?: TData, messages: Array<{ type, message, error? }>} }`
   */
  public toJSON() {
    return {
      ok: this.isOk(),
      data: this.data,
      messages: this.messages.map((m) => m.toJSON()),
    } as const;
  }

  // -------------------- Factories --------------------
  /** Creates a successful result with data. */
  public static ok<TData>(data: TData): Result<TData> {
    return new Result<TData>(data);
  }

  /** Creates a successful result with data and pre-attached messages. */
  public static okWith<TData>(messages: ResultMessage<unknown>[], data: TData): Result<TData> {
    const r = new Result<TData>(data, [...messages]);
    (r as any).hasErrors = messages.some((m) => (m as any).isError?.());
    return r;
  }

  /** Creates a failed result with a single error message (optional structured payload). */
  public static fail<TData>(message: string, error?: unknown): Result<TData> {
    return new Result<TData>(undefined, [ResultMessage.error(message, error)]);
  }

  /**
   * Wraps a nullable/optional value; produces `ok` if present, `fail` otherwise.
   */
  public static fromNullable<TData>(value: TData | null | undefined, messageIfEmpty = 'Value is null or undefined'): Result<TData> {
    return value == null ? Result.fail<TData>(messageIfEmpty) : Result.ok<TData>(value);
  }

  /**
   * Converts a Promise to a `Result`, with optional mappers for value and error.
   */
  public static async fromPromise<TData, TErr = unknown>(
    promise: Promise<TData>,
    mapValue?: (value: TData) => TData,
    mapError?: (err: unknown) => TErr,
  ): Promise<Result<TData>> {
    try {
      const v = await promise;
      return Result.ok(mapValue ? mapValue(v) : v);
    } catch (e) {
      const mapped = mapError ? mapError(e) : (e as TErr);
      return Result.fail<TData>('Operation failed', mapped);
    }
  }

  /**
   * Combines multiple results into a single aggregated result.
   *
   * Overloads
   * - Array mode: `combine(Result<T>[]) -> Result<T[]>`
   *   - Collects all messages, sets `ok` if none has errors,
   *     returns an array of present data values (missing `undefined` values are skipped).
   * - Object mode: `combine({ a: Result<A>, b: Result<B> }) -> Result<{ a: A | undefined, b: B | undefined }>`
   *   - Collects all messages, sets `ok` if none has errors,
   *     returns an object mapping keys to their respective data (may be `undefined`).
   *
   * Notes
   * - Error flag is maintained in O(1) per item by OR-ing child flags.
   * - Use when composing several independent computations and you want a single
   *   result envelope with aggregated diagnostics.
   *
   * Examples
   * ```ts
   * const a = Result.ok(1);
   * const b = Result.fail<number>('Oops');
   * const c = Result.ok(3);
   *
   * const arr = Result.combine([a, b, c]);
   * // arr.isOk() === false, arr.getData() === [1, 3]
   *
   * const obj = Result.combine({ a, b, c });
   * // obj.isOk() === false, obj.getData() === { a: 1, b: undefined, c: 3 }
   * ```
   */
  public static combine<T extends Record<string, Result<any>>>(results: T): Result<{ [K in keyof T]: T[K] extends Result<infer D> ? D : never }>
  public static combine<T>(results: Result<T>[]): Result<T[]>
  public static combine(arg: any): any {
    if (Array.isArray(arg)) {
      const messages: ResultMessage<unknown>[] = [];
      let hasErrors = false;
      const data: any[] = [];
      for (const r of arg as Result<any>[]) {
        messages.push(...r.getMessages());
        hasErrors = hasErrors || r.failed();
        if (r.getData() !== undefined) data.push(r.getData());
      }
      const res = new Result<any[]>(data, messages);
      (res as any).hasErrors = hasErrors;
      return res;
    }

    // object case
    const entries = Object.entries(arg as Record<string, Result<any>>);
    const messages: ResultMessage<unknown>[] = [];
    let hasErrors = false;
    const out: Record<string, unknown> = {};
    for (const [k, r] of entries) {
      messages.push(...r.getMessages());
      hasErrors = hasErrors || r.failed();
      out[k] = r.getData();
    }
    const res = new Result(out, messages);
    (res as any).hasErrors = hasErrors;
    return res as Result<any>;
  }
}