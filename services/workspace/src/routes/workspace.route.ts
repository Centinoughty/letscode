import { Router } from "express";
import {
  addCollaborator,
  createWorkspace,
  deleteWorkspace,
  listWorkspaces,
  removeCollaborator,
} from "../controllers/workspace.controller";

const router = Router();

router.post("/create", createWorkspace);
router.get("/", listWorkspaces);
router.delete("/:id", deleteWorkspace);

router.post("/:workspaceId/members", addCollaborator);
router.delete("/:workspaceId/members", removeCollaborator);

export default router;
