import { Router } from "express";
import {
  addCollaborator,
  createWorkspace,
  deleteWorkspace,
  listCollaborators,
  listWorkspaces,
  removeCollaborator,
  updateCollaborator,
} from "../controllers/workspace.controller";

const router = Router();

router.post("/create", createWorkspace);
router.get("/", listWorkspaces);
router.delete("/:id", deleteWorkspace);

router.get("/:workspaceId/members", listCollaborators);
router.post("/:workspaceId/members", addCollaborator);
router.patch("/:workspaceId/members", updateCollaborator);
router.delete("/:workspaceId/members", removeCollaborator);

export default router;
