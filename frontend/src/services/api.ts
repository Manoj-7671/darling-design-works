/**
 * BuildAI API Client (Tier 1 -> Tier 2 communication)
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface ProjectData {
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
}

export interface CalculationResponse {
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
  materialAllowances: Array<{
    material: string;
    quantity: number | string;
    unit: string;
  }>;
  setbackRecommendations: {
    frontFt: number;
    rearFt: number;
    side1Ft: number;
    side2Ft: number;
    notes: string;
  };
}

export const api = {
  // Check backend server health
  async checkHealth(): Promise<{ status: string; service: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error("Backend server unavailable");
    return res.json();
  },

  // Fetch all projects from database
  async getProjects(): Promise<ProjectData[]> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error("Failed to load projects");
    const json = await res.json();
    return json.data;
  },

  // Fetch project by ID
  async getProjectById(id: string): Promise<{ project: ProjectData; estimate: CalculationResponse }> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error("Project not found");
    const json = await res.json();
    return json.data;
  },

  // Save new project
  async saveProject(project: ProjectData): Promise<{ project: ProjectData; estimate: CalculationResponse }> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project)
    });
    if (!res.ok) throw new Error("Failed to create project");
    const json = await res.json();
    return json.data;
  },

  // Request certified civil engineering calculations
  async calculateEngineering(params: {
    length: number;
    width: number;
    floors: number;
    ratePerSqFt?: number;
  }): Promise<CalculationResponse> {
    const res = await fetch(`${API_BASE}/engineering/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error("Failed to calculate quantities");
    const json = await res.json();
    return json.data;
  }
};
