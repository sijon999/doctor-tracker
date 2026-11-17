import type { NextFunction, Request, RequestHandler, Response } from "express";

export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => unknown): RequestHandler {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
}
