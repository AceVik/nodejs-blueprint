import z from 'zod';
import '../../setup/openapi.js';
import type { Maybe } from '../types/maybe.type.js';

/**
 * Result message types.
 */
/**
 * All supported `ResultMessage` types (severity levels).
 */
export const resultMessageTypes = ['info', 'warning', 'error'] as const;

/**
 * Result message type.
 */
/**
 * Union type of supported `ResultMessage` severities.
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
/**
 * Structured, machine-readable diagnostic message used by `Result`/`HttpResult`.
 *
 * Each instance carries a `type` (severity), a human-readable `message`, and an
 * optional structured `error` payload for programmatic handling or logging.
 * Use the static factories `info`, `warning`, and `error` to construct values.
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
  public toJSON(): ResultMessageJson {
    // Ensure the returned object conforms to the documented OpenAPI schema.
    return {
      type: this.type as ResultMessageType,
      message: this.message,
      error: this.error as Maybe<Record<string, unknown>>,
    } as ResultMessageJson;
  }
}

/**
 * Zod schema for `ResultMessage` with OpenAPI metadata for documentation.
 */
export const ResultMessageSchema = z.object({
  type: z.enum(resultMessageTypes).openapi({
    description: 'Severity/type of the message',
    example: 'warning',
  }),
  message: z.string().openapi({
    description: 'Human-readable message text',
    example: 'Validation failed for field `email`',
  }),
  error: z
    .union([
      z.string().openapi({ description: 'Error text or code', example: 'EMAIL_INVALID' }),
      z
        .record(z.string(), z.unknown())
        .openapi({ description: 'Structured error payload with arbitrary fields' }),
    ])
    .optional()
    .openapi({
      description: 'Optional diagnostic payload (string code or structured object)',
    }),
})
  .openapi(
    'ResultMessage',
    {
      description: 'Diagnostic message attached to a Result/HttpResult',
      examples: [
        { type: 'info', message: 'User created' },
        { type: 'warning', message: 'Deprecated API used' },
        { type: 'error', message: 'Invalid payload', error: { field: 'email', reason: 'invalid' } },
      ],
    },
  );

/**
 * Inferred JSON type for `ResultMessage.toJSON()` and transports.
 */
export type ResultMessageJson = z.infer<typeof ResultMessageSchema>;