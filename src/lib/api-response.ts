/**
 * Shared API response helpers.
 * Every route should use these for a consistent success/error envelope.
 *
 * Success:  { success: true, data: T }
 * Error:    { success: false, error: { code, message, fieldErrors? } }
 */

export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ success: true, data }, init);
}

export function created<T>(data: T): Response {
  return ok(data, { status: 201 });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export function fail(
  code: string,
  message: string,
  status = 400,
  fieldErrors?: Record<string, string[]> | unknown,
): Response {
  return Response.json(
    { success: false, error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) } },
    { status },
  );
}
