import { ZodError } from "zod";

import { fail } from "@/lib/api-response";

/**
 * Typed application error used in route handlers and services.
 * Throw this from services/queries, catch it in handleRouteError.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
    public readonly fieldErrors?: Record<string, string[]> | unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Central route error handler.
 * Place in every catch block: `return handleRouteError(error)`.
 */
export function handleRouteError(error: unknown): Response {
  if (error instanceof AppError) {
    return fail(error.code, error.message, error.status, error.fieldErrors);
  }

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return fail("VALIDATION_ERROR", "Validation failed.", 400, fieldErrors);
  }

  console.error("[route-error]", error);
  return fail("INTERNAL_SERVER_ERROR", "Something went wrong.", 500);
}
