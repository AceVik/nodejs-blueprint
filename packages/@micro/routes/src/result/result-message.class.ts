/**
 * Result message types.
 */
export const resultMessageTypes = ['info', 'warning', 'error'] as const;

/**
 * Result message type.
 */
export type ResultMessageType = typeof resultMessageTypes[number];

/**
 * Structured diagnostic message transported by `Result` and `HttpResult`.
 *
 * Purpose
 * - Carry human-readable text (`message`) together with a machine-readable
 *   classification (`type`) and optional structured payload (`error`).
 * - Enables consistent logging, client display, and programmatic handling.
 *
 * Design
 * - Discriminated union via `type` with values: `info | warning | error`.
 * - Immutable fields to keep messages safe for reuse and logging.
 */
export class ResultMessage<TType = ResultMessageType, TError = unknown> {
  /**
   * Creates a new ResultMessage.
   *
   * @param type - The severity/type of the message.
   * @param message - Human-readable text describing the message.
   * @param error - Optional structured payload with machine-usable details.
   */
  protected constructor(
    public readonly type: TType,
    public readonly message: string,
    public readonly error?: TError,
  ) {}

  /**
   * Creates an informational message.
   */
  public static info(message: string): ResultMessage<'info', never> {
    return new ResultMessage('info', message);
  }

  /**
   * Creates a warning message with optional structured payload.
   */
  public static warning<TWarning = unknown>(message: string, warning?: TWarning): ResultMessage<'warning', TWarning> {
    return new ResultMessage('warning', message, warning);
  }

  /**
   * Creates an error message with optional structured payload.
   */
  public static error<TError = unknown>(message: string, error?: TError): ResultMessage<'error', TError> {
    return new ResultMessage('error', message, error);
  }

  /** True if this is an informational message. */
  public isInfo(): this is ResultMessage<'info'> {
    return this.type === 'info';
  }

  /** True if this is a warning message. */
  public isWarning(): this is ResultMessage<'warning'> {
    return this.type === 'warning';
  }

  /** True if this is an error message. */
  public isError(): this is ResultMessage<'error'> {
    return this.type === 'error';
  }

  /**
   * Stable JSON representation suitable for transport and logging.
   */
  public toJSON() {
    return {
      type: this.type,
      message: this.message,
      error: this.error,
    } as const;
  }
}
