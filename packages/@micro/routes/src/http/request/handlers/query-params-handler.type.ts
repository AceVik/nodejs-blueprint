/**
 * Represents a read-only view of URLSearchParams.
 * This type definition explicitly omits mutating methods to prevent accidental state changes.
 *
 * @see {@link URLSearchParams}
 */
export type QueryParamsHandler = Omit<Readonly<URLSearchParams>, 'append' | 'delete' | 'set' | 'sort'>;