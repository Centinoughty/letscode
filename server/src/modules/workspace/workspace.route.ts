import { Router } from "express";
import * as WorkspaceController from "./workspace.controller";
import { validate } from "../../middlewares/validate";
import * as WorkspaceSchema from "./workspace.schema";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(WorkspaceSchema.CreateWorkspaceBody),
  WorkspaceController.createWorkspace,
);

router.get("/", requireAuth, WorkspaceController.getWorkspaces);

router.get(
  "/:workspaceId",
  requireAuth,
  validate(WorkspaceSchema.WorkspaceParams, "params"),
  WorkspaceController.getWorkspace,
);

router.delete(
  "/:workspaceId",
  requireAuth,
  validate(WorkspaceSchema.WorkspaceParams, "params"),
  WorkspaceController.deleteWorkspace,
);

export default router;
