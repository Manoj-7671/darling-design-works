import { ProjectDTO } from "../types";
import { EngineeringService } from "./engineering.service";

// Initial seed project
const initialProjects: ProjectDTO[] = [
  {
    id: "proj-001",
    name: "Modern 3BHK Residence",
    length: 30,
    width: 40,
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    parking: "1 car",
    style: "Modern",
    buildingType: "Residential",
    height: 10,
    location: "Hyderabad, India",
    budget: 55,
    prompt: "Design a 2-floor 3BHK house on a 30 × 40 ft plot with parking and a modern elevation.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class ProjectService {
  private static store: ProjectDTO[] = [...initialProjects];

  public static async getAllProjects(): Promise<ProjectDTO[]> {
    return this.store;
  }

  public static async getProjectById(id: string): Promise<ProjectDTO | null> {
    return this.store.find(p => p.id === id) || null;
  }

  public static async createProject(data: Omit<ProjectDTO, "id" | "createdAt" | "updatedAt">): Promise<ProjectDTO> {
    const newProject: ProjectDTO = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.store.unshift(newProject);
    return newProject;
  }

  public static async updateProject(id: string, data: Partial<ProjectDTO>): Promise<ProjectDTO | null> {
    const index = this.store.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.store[index] = {
      ...this.store[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return this.store[index];
  }

  public static async deleteProject(id: string): Promise<boolean> {
    const initialLen = this.store.length;
    this.store = this.store.filter(p => p.id !== id);
    return this.store.length < initialLen;
  }

  public static getProjectCalculation(project: ProjectDTO) {
    return EngineeringService.calculate({
      length: project.length,
      width: project.width,
      floors: project.floors
    });
  }
}
