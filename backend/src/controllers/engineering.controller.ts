import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { EngineeringService } from "../services/engineering.service";

const calculateSchema = z.object({
  length: z.number().min(10).max(500),
  width: z.number().min(10).max(500),
  floors: z.number().min(1).max(20),
  ratePerSqFt: z.number().min(500).max(20000).optional()
});

export class EngineeringController {
  public static calculate(req: Request, res: Response, next: NextFunction): void {
    try {
      const parsed = calculateSchema.parse(req.body);
      const result = EngineeringService.calculate(parsed);
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static getRates(req: Request, res: Response): void {
    res.json({
      success: true,
      data: {
        baseRatePerSqFtINR: 2200,
        currency: "INR",
        unit: "sq.ft",
        assumptions: {
          groundCoverage: "78%",
          structureType: "RCC Frame with Masonry Infill",
          materialShare: "62%",
          labourShare: "38%"
        }
      },
      timestamp: new Date().toISOString()
    });
  }
}
