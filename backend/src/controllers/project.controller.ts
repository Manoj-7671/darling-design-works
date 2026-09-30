import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ProjectService } from "../services/project.service";

const projectSchema = z.object({
  name: z.string().min(1).max(100),
  length: z.number().min(10).max(500),
  width: z.number().min(10).max(500),
  floors: z.number().min(1).max(20),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  parking: z.string(),
  style: z.string(),
  buildingType: z.string(),
  height: z.number().min(8).max(30),
  location: z.string(),
  budget: z.number().min(1),
  prompt: z.string().optional()
});

export class ProjectController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await ProjectService.getAllProjects();
      res.json({
        success: true,
        data: projects,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await ProjectService.getProjectById(req.params.id);
      if (!project) {
        res.status(404).json({ success: false, error: "Project not found", timestamp: new Date().toISOString() });
        return;
      }
      const estimate = ProjectService.getProjectCalculation(project);
      res.json({
        success: true,
        data: {
          project,
          estimate
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = projectSchema.parse(req.body);
      const created = await ProjectService.createProject(parsed);
      const estimate = ProjectService.getProjectCalculation(created);
      res.status(201).json({
        success: true,
        data: {
          project: created,
          estimate
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = projectSchema.partial().parse(req.body);
      const updated = await ProjectService.updateProject(req.params.id, parsed);
      if (!updated) {
        res.status(404).json({ success: false, error: "Project not found", timestamp: new Date().toISOString() });
        return;
      }
      const estimate = ProjectService.getProjectCalculation(updated);
      res.json({
        success: true,
        data: {
          project: updated,
          estimate
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ok = await ProjectService.deleteProject(req.params.id);
      if (!ok) {
        res.status(404).json({ success: false, error: "Project not found", timestamp: new Date().toISOString() });
        return;
      }
      res.json({ success: true, message: "Project deleted", timestamp: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  }

  public static async getEstimate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await ProjectService.getProjectById(req.params.id);
      if (!project) {
        res.status(404).json({ success: false, error: "Project not found", timestamp: new Date().toISOString() });
        return;
      }
      const estimate = ProjectService.getProjectCalculation(project);
      res.json({
        success: true,
        data: estimate,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}
