import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "error",
    public details?: unknown,
  ) {
    super(message);
  }
}

export const unauthorized = (msg = "Sign in required") => new ApiError(401, msg, "unauthorized");
export const forbidden = (msg = "You do not have permission to do this") => new ApiError(403, msg, "forbidden");
export const notFound = (msg = "Not found") => new ApiError(404, msg, "not_found");
export const conflict = (msg: string) => new ApiError(409, msg, "conflict");

/** Consistent error body: { error: { code, message, details? } }. Internal details are never leaked. */
export function toResponse(err: unknown) {
  if (err instanceof ApiError)
    return NextResponse.json({ error: { code: err.code, message: err.message, details: err.details } }, { status: err.status });
  if (err instanceof ZodError)
    return NextResponse.json(
      { error: { code: "validation_error", message: "Invalid request", details: err.flatten().fieldErrors } },
      { status: 422 },
    );
  console.error("Unhandled API error", err);
  return NextResponse.json({ error: { code: "internal_error", message: "Something went wrong" } }, { status: 500 });
}

/** Wrap a route handler so thrown ApiError/ZodError become proper JSON responses. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      return toResponse(e);
    }
  };
}
