import { Router } from "express";
import {
  createWorkspace,
  deleteWorkspace,
  listWorkspaces,
} from "../controllers/workspace.controller";

const router = Router();

router.post("/create", createWorkspace);
router.get("/", listWorkspaces);
router.delete("/:id", deleteWorkspace);

export default router;
