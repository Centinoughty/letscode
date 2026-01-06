import { Router } from "express";
import { createWorkspace } from "../controllers/workspace.controller";

const router = Router();

router.post("/create", createWorkspace);

export default router;
