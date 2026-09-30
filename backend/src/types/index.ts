export interface ProjectDTO {
  id?: string;
  name: string;
  length: number;
  width: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  parking: string;
  style: string;
  buildingType: string;
  height: number;
  location: string;
  budget: number;
  prompt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialAllowance {
  material: string;
  quantity: number | string;
  unit: string;
  sharePercent?: number;
}

export interface CalculationResult {
  plotAreaSqFt: number;
  groundCoverageSqFt: number;
  builtUpAreaSqFt: number;
  estimatedCostINR: number;
  costPerSqFt: number;
  costDistribution: {
    materialCostINR: number;
    labourCostINR: number;
    materialSharePercent: number;
    labourSharePercent: number;
  };
  materialAllowances: MaterialAllowance[];
  setbackRecommendations: {
    frontFt: number;
    rearFt: number;
    side1Ft: number;
    side2Ft: number;
    notes: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
