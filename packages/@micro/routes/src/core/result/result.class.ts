import type { Maybe } from '../types/maybe.type.js';
import type { ErrorCode, ErrorPayload } from './result-error.type.js';
import { ResultMessage } from './result-message.class.js';
import { CommonErrorCodes } from './presets.js';

/**
 * Represents a successful Result where data is guaranteed to be present (of type T).
 * Used for type narrowing via isOk().
 */
export type SuccessResult<T> = Result<T> & {
  unwrap(): T;
  getData(): T;
};

/**
 * A lightweight result container that transports an optional data payload
 * together with a list of informational, warning, and error messages.
 *
 * @template TData - The type of the data payload.
 */
export class Result<TData = unknown> {
  protected hasErrors = false;

  protected constructor(
    protected data?: TData,
    protected messages: ResultMessage[] = [],
  ) {
    this.hasErrors = this.messages.some((m) => m.isError());
  }

  // --- Getters & Status Checks ---

  /**
   * Returns a readonly list of all messages attached to this result.
   */
  public getMessages(): readonly ResultMessage[] {
    return this.messages;
  }

  /**
   * Returns the data payload, which may be undefined if the result failed.
   */
  public getData(): TData | undefined {
    return this.data;
  }

  /**
   * Checks if the result is successful (contains no error messages).
   * Narrowing: If true, TypeScript treats this as a SuccessResult where unwrap() returns TData.
   */
  public isOk(): this is SuccessResult<TData> {
    return !this.hasErrors;
  }

  /**
   * Checks if the result has failed (contains at least one error message).
   */
  public failed(): boolean {
    return this.hasErrors;
  }

  /**
   * Returns all error messages.
   */
  public errors(): ResultMessage<'error', any>[] {
    return this.messages.filter((m) => m.isError()) as ResultMessage<'error', any>[];
  }

  /**
   * Returns all warning messages.
   */
  public warnings(): ResultMessage<'warning', any>[] {
    return this.messages.filter((m) => m.isWarning()) as ResultMessage<'warning', any>[];
  }

  /**
   * Returns all informational messages.
   */
  public infos(): ResultMessage<'info', any>[] {
    return this.messages.filter((m) => m.isInfo()) as ResultMessage<'info', any>[];
  }

  // --- Modification Methods ---

  /**
   * Appends messages from another result into this instance.
   * Updates the error status if the included result contained errors.
   * * @param result - The other result to merge.
   */
  public includeMessages(result: Result<any>): void {
    this.messages.push(...result.messages);
    this.hasErrors = this.hasErrors || result.hasErrors;
  }

  /**
   * Adds an informational message.
   * @param message - The message text.
   * @param title - Optional title or summary.
   */
  public addInfo(message: string, title?: string): this {
    this.messages.push(ResultMessage.info(message, title));
    return this;
  }

  /**
   * Adds a warning message.
   * @param message - The warning text.
   * @param title - Optional title.
   * @param payload - Optional structured payload (must contain a code if provided).
   */
  public addWarning<T = unknown>(
    message: string,
    title?: string,
    payload?: ErrorPayload<T>,
  ): this {
    this.messages.push(ResultMessage.warning(message, title, payload));
    return this;
  }

  /**
   * Adds an error message using a structured ErrorPayload.
   * @param message - The error text.
   * @param payload - The structured error payload containing code and details.
   * @param title - Optional title.
   */
  public addError<T = unknown>(
    message: string,
    payload: ErrorPayload<T>,
    title?: string,
  ): this;

  /**
   * Adds an error message using individual arguments (DX friendly).
   * @param message - The error text.
   * @param code - The error code (string or ErrorCode).
   * @param title - Optional title.
   * @param details - Optional details object.
   */
  public addError<T = unknown>(
    message: string,
    code: ErrorCode | string,
    title?: string,
    details?: T,
  ): this;

  /**
   * Implementation of addError.
   */
  public addError<T = unknown>(
    message: string,
    codeOrPayload: ErrorCode | string | ErrorPayload<T> = CommonErrorCodes.INTERNAL_ERROR,
    title?: string,
    details?: T,
  ): this {
    if (typeof codeOrPayload === 'object' && codeOrPayload !== null) {
      // Signature 1: Payload object passed
      const payload = codeOrPayload as ErrorPayload<T>;
      this.messages.push(ResultMessage.error(message, payload, title));
    } else {
      // Signature 2: Code string passed
      const code = codeOrPayload as ErrorCode;
      this.messages.push(
        ResultMessage.error(message, { code, details }, title),
      );
    }
    this.hasErrors = true;
    return this;
  }

  // --- Unwrapping & Transformation ---

  /**
   * Returns the data if present, otherwise undefined.
   */
  public unwrap(): TData | undefined {
    return this.data;
  }

  /**
   * Returns the data if present, otherwise throws an Error.
   * * @param message - The error message to throw if data is missing.
   * @throws Error if data is undefined.
   */
  public expect(message = 'Expected result data, but none was present'): TData {
    if (this.data === undefined) {
      throw new Error(message);
    }
    return this.data;
  }

  /**
   * Returns the data if present, otherwise returns the provided default value.
   * * @param defaultValue - The fallback value.
   */
  public unwrapOr<TDefault = TData>(defaultValue: TDefault): TData | TDefault {
    return this.data ?? defaultValue;
  }

  /**
   * Maps the data of a successful result to a new value.
   * If the result is a failure or empty, the errors are propagated to the new result.
   * * @param fn - The mapping function.
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
   * Maps the data of a successful result to a new Result.
   * Messages from the inner result are merged into the returned result.
   * * @param fn - The mapping function returning a Result.
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
   * Executes a side-effect function with the current result.
   * Useful for logging or debugging without changing the result.
   * * @param fn - The tap function.
   */
  public tap(fn: (self: Result<TData>) => void): this {
    fn(this);
    return this;
  }

  /**
   * Morphs the result type to a new type by brute-force replacing the data.
   * Useful for serialization or low-level transformations.
   * * @param newData - The new data payload.
   */
  public morph<TNew>(newData: TNew): Result<TNew> {
    (this as unknown as { data: unknown }).data = newData;
    return this as unknown as Result<TNew>;
  }

  /**
   * Converts the result to a JSON-serializable structure.
   */
  public toJSON() {
    return {
      ok: this.isOk(),
      data: this.data as Maybe<TData>,
      messages: this.messages.map((m) => m.toJSON()),
    } as const;
  }

  // ---------------------------------------------------------------------------
  // FACTORY METHODS
  // ---------------------------------------------------------------------------

  /**
   * Creates a successful result containing data.
   * * @param data - The success payload.
   */
  public static ok<TData>(data: TData): SuccessResult<TData> {
    return new Result<TData>(data) as SuccessResult<TData>;
  }

  /**
   * Creates a successful result with existing messages and data.
   * @param messages - A list of messages to include.
   * @param data - The success payload.
   */
  public static okWith<TData>(messages: ResultMessage[], data: TData): SuccessResult<TData> {
    const r = new Result<TData>(data, [...messages]);
    r.hasErrors = messages.some((m) => m.isError());
    return r as SuccessResult<TData>;
  }

  /**
   * Creates a failed result with an error message and code.
   * @param message - The error description.
   * @param code - The error code (defaults to INTERNAL_ERROR).
   * @param title - Optional error title.
   * @param details - Optional structured details.
   */
  public static fail<TData>(
    message: string,
    code: ErrorCode | string = CommonErrorCodes.INTERNAL_ERROR,
    title?: string,
    details?: unknown,
  ): Result<TData> {
    const r = new Result<TData>();
    r.addError(message, code, title, details);
    return r;
  }

  /**
   * Creates a failed result representing a "Not Found" error.
   */
  public static notFound<TData>(
    message = 'Resource not found',
    title = 'Not Found',
  ): Result<TData> {
    return Result.fail(message, CommonErrorCodes.NOT_FOUND, title);
  }

  /**
   * Creates a failed result representing a "Conflict" error (e.g. duplicate resource).
   */
  public static conflict<TData>(
    message = 'Resource already exists',
    title = 'Conflict',
  ): Result<TData> {
    return Result.fail(message, CommonErrorCodes.ALREADY_EXISTS, title);
  }

  /**
   * Creates a failed result representing a validation error.
   */
  public static invalid<TData>(
    message: string,
    details?: unknown,
    title = 'Validation Failed',
  ): Result<TData> {
    return Result.fail(message, CommonErrorCodes.VALIDATION_FAILED, title, details);
  }

  /**
   * Creates a failed result representing a permission denied error.
   */
  public static forbidden<TData>(
    message = 'Access denied',
    title = 'Forbidden',
  ): Result<TData> {
    return Result.fail(message, CommonErrorCodes.PERMISSION_DENIED, title);
  }

  /**
   * Creates a result from a nullable value.
   * Returns Ok if value is present, otherwise Fail (Not Found).
   * @param value - The value to check.
   * @param messageIfEmpty - Error message if value is null/undefined.
   */
  public static fromNullable<TData>(
    value: TData | null | undefined,
    messageIfEmpty = 'Value is null or undefined',
  ): Result<TData> {
    return value == null ? Result.notFound<TData>(messageIfEmpty) : Result.ok<TData>(value);
  }

  /**
   * Creates a result from a Promise.
   * Catches exceptions and converts them to a failed result.
   * @param promise - The promise to await.
   * @param mapValue - Optional function to transform the value.
   * @param mapError - Optional function to transform the error.
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
      return Result.fail<TData>('Operation failed', CommonErrorCodes.INTERNAL_ERROR, 'Exception', mapped);
    }
  }

  /**
   * Combines multiple results into a single result.
   * If any input result failed, the combined result fails.
   * * @param results - Array or Object of Results.
   */
  public static combine<T extends Record<string, Result<any>>>(
    results: T
  ): Result<{ [K in keyof T]: T[K] extends Result<infer D> ? D : never }>;
  public static combine<T>(results: Result<T>[]): Result<T[]>;
  public static combine(arg: any): any {
    if (Array.isArray(arg)) {
      const messages: ResultMessage[] = [];
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
    const messages: ResultMessage[] = [];
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

/**
 * Checks if the given value is a Result instance.
 */
export const isResult = <T = unknown>(value: unknown): value is Result<T> => {
  return value instanceof Result;
};