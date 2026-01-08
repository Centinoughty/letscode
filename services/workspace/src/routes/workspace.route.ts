import { Router } from "express";
import {
  addCollaborator,
  createWorkspace,
  deleteWorkspace,
  listWorkspaces,
} from "../controllers/workspace.controller";

const router = Router();

router.post("/create", createWorkspace);
router.get("/", listWorkspaces);
router.delete("/:id", deleteWorkspace);

router.post("/:workspaceId/members", addCollaborator);

export default router;
