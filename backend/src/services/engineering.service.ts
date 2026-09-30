import { CalculationResult } from "../types";

export class EngineeringService {
  /**
   * Calculates preliminary quantities, built-up areas, and costs based on plot parameters.
   */
  public static calculate(params: {
    length: number;
    width: number;
    floors: number;
    ratePerSqFt?: number;
  }): CalculationResult {
    const { length, width, floors, ratePerSqFt = 2200 } = params;

    const plotAreaSqFt = length * width;
    // Standard residential coverage ratio: ~78% of plot
    const groundCoverageRatio = 0.78;
    const groundCoverageSqFt = Math.round(plotAreaSqFt * groundCoverageRatio);
    const builtUpAreaSqFt = Math.round(groundCoverageSqFt * floors);

    // Total estimated cost
    const estimatedCostINR = builtUpAreaSqFt * ratePerSqFt;
    const materialSharePercent = 62;
    const labourSharePercent = 38;

    const materialCostINR = Math.round((estimatedCostINR * materialSharePercent) / 100);
    const labourCostINR = Math.round((estimatedCostINR * labourSharePercent) / 100);

    // Empirical civil engineering material allowances per sq.ft of built-up area
    const cementBags = Math.ceil(builtUpAreaSqFt * 0.4);
    const steelKg = Math.round(builtUpAreaSqFt * 4.0);
    const sandCuFt = Math.round(builtUpAreaSqFt * 0.8);
    const aggregateCuFt = Math.round(builtUpAreaSqFt * 0.6);
    const bricksUnits = Math.round(builtUpAreaSqFt * 8.0);
    const tilesSqFt = Math.round(builtUpAreaSqFt * 0.85);
    const paintSqFt = Math.round(builtUpAreaSqFt * 3.5);

    // Indicative setback recommendations
    const frontFt = Math.max(5, Math.round(length * 0.12));
    const rearFt = Math.max(3, Math.round(length * 0.08));
    const side1Ft = Math.max(3, Math.round(width * 0.08));
    const side2Ft = Math.max(3, Math.round(width * 0.08));

    return {
      plotAreaSqFt,
      groundCoverageSqFt,
      builtUpAreaSqFt,
      estimatedCostINR,
      costPerSqFt: ratePerSqFt,
      costDistribution: {
        materialCostINR,
        labourCostINR,
        materialSharePercent,
        labourSharePercent
      },
      materialAllowances: [
        { material: "Cement", quantity: cementBags, unit: "bags" },
        { material: "Structural Steel", quantity: steelKg, unit: "kg" },
        { material: "River Sand / M-Sand", quantity: sandCuFt, unit: "cu.ft" },
        { material: "Coarse Aggregate", quantity: aggregateCuFt, unit: "cu.ft" },
        { material: "Red Bricks / AAC Blocks", quantity: bricksUnits, unit: "units" },
        { material: "Vitrified / Ceramic Tiles", quantity: tilesSqFt, unit: "sq.ft" },
        { material: "Emulsion Paint Coverage", quantity: paintSqFt, unit: "sq.ft" }
      ],
      setbackRecommendations: {
        frontFt,
        rearFt,
        side1Ft,
        side2Ft,
        notes: "Indicative setbacks. Check local town planning bylaws and municipal development authority rules before construction."
      }
    };
  }
}
