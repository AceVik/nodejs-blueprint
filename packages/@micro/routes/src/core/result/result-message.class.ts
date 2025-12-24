import z from 'zod';
import { type ResultMessageType, resultMessageTypes } from './result-message-type.enum.js';
import { type ErrorPayload, ErrorPayloadSchema } from './result-error.type.js';

/**
 * Structured, machine-readable diagnostic message used by `Result`/`HttpResult`.
 *
 * Implements the "Problem Details" pattern (RFC 7807 inspiration).
 * - **type**: Severity (info, warning, error).
 * - **message**: Human-readable detail.
 * - **title**: (Optional) Human-readable summary/category.
 * - **payload**: Structured data. For errors/warnings, this contains `{ code, details }`.
 */
export class ResultMessage<TType extends ResultMessageType = ResultMessageType, TPayload = unknown> {
  /**
   * Creates a new ResultMessage.
   * Internal constructor. Use static factories.
   */
  protected constructor(
    public readonly type: TType,
    public readonly message: string,
    public readonly title?: string,
    public readonly payload?: ErrorPayload<TPayload>,
  ) {}

  /**
   * Creates an informational message.
   */
  public static info(message: string, title?: string): ResultMessage<'info', never> {
    return new ResultMessage('info', message, title);
  }

  /**
   * Creates a warning message.
   * Now supports an ErrorPayload to be consistent with the schema.
   */
  public static warning<T = unknown>(
    message: string,
    title?: string,
    payload?: ErrorPayload<T>,
  ): ResultMessage<'warning', T> {
    return new ResultMessage('warning', message, title, payload);
  }

  /**
   * Creates an error message.
   * **ENFORCES** an ErrorCode type via ErrorPayload.
   *
   * @param message - Detailed error description.
   * @param payload - Structured data containing code and details.
   * @param title - Optional summary (e.g. "Validation Failed").
   */
  public static error<T = unknown>(
    message: string,
    payload: ErrorPayload<T>,
    title?: string,
  ): ResultMessage<'error', T> {
    return new ResultMessage('error', message, title, payload);
  }

  public isInfo(): this is ResultMessage<'info'> {
    return this.type === 'info';
  }

  public isWarning(): this is ResultMessage<'warning'> {
    return this.type === 'warning';
  }

  public isError(): this is ResultMessage<'error'> {
    return this.type === 'error';
  }

  /**
   * Stable JSON representation suitable for transport and logging.
   * Maps internal 'payload' to 'error' field to match the Schema.
   */
  public toJSON(): ResultMessageJson {
    return {
      type: this.type as ResultMessageType,
      message: this.message,
      title: this.title,
      // The schema expects 'error' to contain the ErrorPayload structure
      error: this.payload,
    } as ResultMessageJson;
  }
}

/**
 * Zod schema for `ResultMessage`.
 * Matches the structure produced by toJSON().
 */
export const ResultMessageSchema = z
  .object({
    type: z.enum(resultMessageTypes).openapi({
      description: 'Severity/type of the message',
      example: 'error',
    }),
    title: z.string().optional().openapi({
      description: 'Short summary of the issue (RFC 7807 style)',
      example: 'Validation Error',
    }),
    message: z.string().openapi({
      description: 'Human-readable message detail',
      example: 'The email address is invalid.',
    }),
    // We map the internal 'payload' to this 'error' field
    error: ErrorPayloadSchema.optional(),
  })
  .openapi('ResultMessage', {
    description: 'Diagnostic message attached to a Result/HttpResult',
  });

export type ResultMessageJson = z.infer<typeof ResultMessageSchema>;