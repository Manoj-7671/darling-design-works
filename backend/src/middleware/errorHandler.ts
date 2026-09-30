import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error("[Backend Error]:", err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.errors.map(e => ({ path: e.path.join("."), message: e.message })),
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString()
  });
}
