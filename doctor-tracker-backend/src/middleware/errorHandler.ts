import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  error: AppError,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid request", details: error.flatten() },
    });
  }

  const statusCode = error.statusCode ?? 500;
  const message = statusCode >= 500 ? "Internal server error" : error.message;

  return response.status(statusCode).json({
    success: false,
    error: { code: error.code ?? "INTERNAL_ERROR", message },
  });
}
