import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[spectra-api] Error:", err);

  if (err instanceof ZodError) {
    res.status(400).json({
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: err.errors,
      },
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      data: null,
      error: {
        code: "INTERNAL_ERROR",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "An unexpected error occurred",
      },
    });
    return;
  }

  res.status(500).json({
    data: null,
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
  });
}
