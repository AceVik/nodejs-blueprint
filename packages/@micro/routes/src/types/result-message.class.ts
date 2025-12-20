export const resultMessageTypes = ['info', 'warning', 'error'] as const;
export type ResultMessageType = typeof resultMessageTypes[number];

/**
 * Structured diagnostic message used by `Result` to transport
 * information, warnings and errors in a machine-readable way.
 *
 * Each message has a discriminated `type`, a human-readable `message`
 * and an optional structured payload (`error`), which may contain
 * error codes, validation issues, or any metadata useful for logging/UX.
 */
export class ResultMessage<TType = ResultMessageType, TError = unknown> {
  protected constructor(
    /** The severity/type of the message. */
    public readonly type: TType,
    /** Human-readable text explaining the message. */
    public readonly message: string,
    /** Optional structured payload (error details, codes, etc.). */
    public readonly error?: TError,
  ) {}

  /** Creates an informational message. */
  public static info(message: string): ResultMessage<'info', never>{
    return new ResultMessage('info', message);
  }

  /** Creates a warning message with optional structured payload. */
  public static warning<TWarning = unknown>(message: string, warning?: TWarning): ResultMessage<'warning', TWarning>{
    return new ResultMessage('warning', message, warning);
  }

  /** Creates an error message with optional structured payload. */
  public static error<TError = unknown>(message: string,  error?: TError): ResultMessage<'error', TError> {
    return new ResultMessage('error', message, error);
  }

  /** Type guard for informational messages. */
  public isInfo(): this is ResultMessage<'info'> {
    return this.type === 'info';
  }

  /** Type guard for warning messages. */
  public isWarning(): this is ResultMessage<'warning'> {
    return this.type === 'warning';
  }

  /** Type guard for error messages. */
  public isError(): this is ResultMessage<'error'> {
    return this.type === 'error';
  }

  /** JSON representation suitable for transport and logging. */
  public toJSON() {
    return {
      type: this.type,
      message: this.message,
      error: this.error,
    } as const;
  }
}