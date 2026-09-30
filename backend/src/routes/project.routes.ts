import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";

export const projectRouter = Router();

projectRouter.get("/", ProjectController.list);
projectRouter.post("/", ProjectController.create);
projectRouter.get("/:id", ProjectController.getById);
projectRouter.put("/:id", ProjectController.update);
projectRouter.delete("/:id", ProjectController.delete);
projectRouter.get("/:id/estimate", ProjectController.getEstimate);
