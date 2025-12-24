import type { Maybe } from '../types/maybe.type.js';
import { ResultMessage } from './result-message.class.js';

/**
 * A lightweight result container that transports an optional data payload
 * together with a list of informational, warning, and error messages.
 *
 * This class serves as the foundation for service-layer responses, strictly separating
 * domain logic from transport layers like HTTP.
 *
 * @template TData - The type of the data payload.
 */
export class Result<TData = unknown> {
  protected hasErrors = false;

  protected constructor(
    protected data?: TData,
    protected messages: ResultMessage<unknown>[] = [],
  ) {
    this.hasErrors = this.messages.some((m) => m.isError());
  }

  /**
   * Returns a readonly view of all attached messages.
   */
  public getMessages(): readonly ResultMessage<unknown>[] {
    return this.messages;
  }

  /**
   * Returns the wrapped data without unwrap guarantees.
   */
  public getData(): TData | undefined {
    return this.data;
  }

  /**
   * Checks if the result is successful (contains no error messages).
   */
  public isOk(): this is Result<TData> {
    return !this.hasErrors;
  }

  /**
   * Checks if the result has failed (contains at least one error message).
   */
  public failed(): boolean {
    return this.hasErrors;
  }

  /**
   * Checks if the result contains any warning messages.
   */
  public hasWarnings(): boolean {
    return this.messages.some((m) => m.isWarning());
  }

  /**
   * Checks if the result contains any info messages.
   */
  public hasInfos(): boolean {
    return this.messages.some((m) => m.isInfo());
  }

  /**
   * Returns only error messages.
   */
  public errors(): ResultMessage<'error'>[] {
    return this.messages.filter((m) => m.isError()) as ResultMessage<'error'>[];
  }

  /**
   * Returns only warning messages.
   */
  public warnings(): ResultMessage<'warning'>[] {
    return this.messages.filter((m) => m.isWarning()) as ResultMessage<'warning'>[];
  }

  /**
   * Returns only info messages.
   */
  public infos(): ResultMessage<'info'>[] {
    return this.messages.filter((m) => m.isInfo()) as ResultMessage<'info'>[];
  }

  /**
   * Appends messages from another result into this instance.
   * Updates the internal error state automatically.
   *
   * @param result - The result to merge messages from.
   */
  public includeMessages(result: Result<any>): void {
    this.messages.push(...result.messages);
    this.hasErrors = this.hasErrors || result.hasErrors;
  }

  /**
   * Adds an informational message.
   *
   * @param message - The text message.
   */
  public addInfo(message: string): this {
    this.messages.push(ResultMessage.info(message));
    return this;
  }

  /**
   * Adds a warning message with an optional structured payload.
   *
   * @param message - The text message.
   * @param warning - Optional payload for structured logging or details.
   */
  public addWarning<T = unknown>(message: string, warning?: T): this {
    this.messages.push(ResultMessage.warning(message, warning));
    return this;
  }

  /**
   * Adds an error message with an optional structured payload.
   * Immediately marks this result as failed.
   *
   * @param message - The text message.
   * @param error - Optional payload for structured logging or details.
   */
  public addError<T = unknown>(message: string, error?: T): this {
    this.messages.push(ResultMessage.error(message, error));
    this.hasErrors = true;
    return this;
  }

  /**
   * Returns the data if present, otherwise returns undefined.
   */
  public unwrap(): TData | undefined {
    return this.data;
  }

  /**
   * Returns the data if present, otherwise throws an error.
   *
   * @param message - Custom error message if data is missing.
   * @throws {Error}
   */
  public expect(message = 'Expected result data, but none was present'): TData {
    if (this.data === undefined) {
      throw new Error(message);
    }
    return this.data;
  }

  /**
   * Returns the data if present, otherwise returns the provided default value.
   *
   * @param defaultValue - The fallback value.
   */
  public unwrapOr<TDefault = TData>(defaultValue: TDefault): TData | TDefault {
    return this.data ?? defaultValue;
  }

  /**
   * Maps the data to a new value using the provided function.
   * Preserves existing messages and error state.
   *
   * @param fn - The transformation function.
   */
  public map<TOut>(fn: (data: TData) => TOut): Result<TOut> {
    if (!this.isOk() || this.data === undefined) {
      const r = new Result<TOut>(undefined, [...this.messages]);
      r.hasErrors = this.hasErrors;
      return r;
    }
    return new Result<TOut>(fn(this.data), [...this.messages]);
  }

  /**
   * Maps the data to a new Result using the provided function.
   * Merges messages from the produced result into the new result.
   *
   * @param fn - The function producing a new Result.
   */
  public flatMap<TOut>(fn: (data: TData) => Result<TOut>): Result<TOut> {
    if (!this.isOk() || this.data === undefined) {
      const r = new Result<TOut>(undefined, [...this.messages]);
      r.hasErrors = this.hasErrors;
      return r;
    }
    const next = fn(this.data);
    const combined = new Result<TOut>(next.unwrap(), [...this.messages]);
    combined.includeMessages(next);
    return combined;
  }

  /**
   * Executes a side-effect function on this result and returns the result unchanged.
   * Useful for logging or debugging in a chain.
   *
   * @param fn - The side-effect function.
   */
  public tap(fn: (self: Result<TData>) => void): this {
    fn(this);
    return this;
  }

  /**
   * Unsafely replaces the data payload in-place.
   * PERFORMANCE: Zero allocation. Changes the runtime type of the instance.
   * WARNING: Old references to this object will assume the old type TData!
   */
  public morph<TNew>(newData: TNew): Result<TNew> {
    (this as unknown as { data: unknown }).data = newData;
    return this as unknown as Result<TNew>;
  }

  /**
   * Serializes the result to a JSON-compatible object.
   */
  public toJSON() {
    return {
      ok: this.isOk(),
      data: this.data as Maybe<TData>,
      messages: this.messages.map((m) => m.toJSON()),
    } as const;
  }

  /**
   * Creates a successful result with data.
   */
  public static ok<TData>(data: TData): Result<TData> {
    return new Result<TData>(data);
  }

  /**
   * Creates a successful result with data and pre-existing messages.
   */
  public static okWith<TData>(messages: ResultMessage<unknown>[], data: TData): Result<TData> {
    const r = new Result<TData>(data, [...messages]);
    r.hasErrors = messages.some((m) => m.isError?.());
    return r;
  }

  /**
   * Creates a failed result with a single error message.
   */
  public static fail<TData>(message: string, error?: unknown): Result<TData> {
    return new Result<TData>(undefined, [ResultMessage.error(message, error)]);
  }

  /**
   * Creates a result from a nullable value.
   * Returns Ok if the value is present, Fail if null/undefined.
   */
  public static fromNullable<TData>(
    value: TData | null | undefined,
    messageIfEmpty = 'Value is null or undefined',
  ): Result<TData> {
    return value == null ? Result.fail<TData>(messageIfEmpty) : Result.ok<TData>(value);
  }

  /**
   * Wraps a Promise into a Result.
   * Catches any exceptions and converts them into a failed Result.
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
   * Supports both array inputs (`Result<T>[]`) and record inputs (`{ key: Result<T> }`).
   * The returned result will contain all messages from all inputs.
   * It will be marked as failed if any of the input results are failed.
   */
  public static combine<T extends Record<string, Result<any>>>(
    results: T
  ): Result<{ [K in keyof T]: T[K] extends Result<infer D> ? D : never }>;
  public static combine<T>(results: Result<T>[]): Result<T[]>;
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
      res.hasErrors = hasErrors;
      return res;
    }

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
    res.hasErrors = hasErrors;
    return res as Result<any>;
  }
}