import { Router } from "express";
import { EngineeringController } from "../controllers/engineering.controller";

export const engineeringRouter = Router();

engineeringRouter.post("/calculate", EngineeringController.calculate);
engineeringRouter.get("/rates", EngineeringController.getRates);
