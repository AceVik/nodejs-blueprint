/**
 * HTTP Method: GET.
 * Requests a representation of the specified resource.
 * Requests using GET should only retrieve data and should not have side effects.
 */
export const GET = 'GET';

/**
 * HTTP Method: POST.
 * Used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
 */
export const POST = 'POST';

/**
 * HTTP Method: PUT.
 * Replaces all current representations of the target resource with the request payload.
 * It is idempotent, meaning multiple identical requests should have the same effect as a single one.
 */
export const PUT = 'PUT';

/**
 * HTTP Method: PATCH.
 * Used to apply partial modifications to a resource.
 */
export const PATCH = 'PATCH';

/**
 * HTTP Method: DELETE.
 * Deletes the specified resource.
 */
export const DELETE = 'DELETE';

/**
 * HTTP Method: OPTIONS.
 * Describes the communication options for the target resource.
 * Frequently used for CORS (Cross-Origin Resource Sharing) preflight checks.
 */
export const OPTIONS = 'OPTIONS';

/**
 * HTTP Method: HEAD.
 * Asks for a response identical to that of a GET request, but without the response body.
 * Useful for retrieving meta-information written in response headers.
 */
export const HEAD = 'HEAD';

/**
 * HTTP Method: CONNECT.
 * Establishes a tunnel to the server identified by the target resource.
 * Often used for SSL/TLS tunnels (HTTPS) through an HTTP proxy.
 */
export const CONNECT = 'CONNECT';

/**
 * HTTP Method: TRACE.
 * Performs a message loop-back test along the path to the target resource.
 * Useful for debugging purposes.
 */
export const TRACE = 'TRACE';