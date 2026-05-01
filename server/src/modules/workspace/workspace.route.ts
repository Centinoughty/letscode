import { Router } from "express";
import * as WorkspaceController from "./workspace.controller";
import { validate } from "../../middlewares/validate";
import { CreateWorkspaceBody, GetWorkspaceParams } from "./workspace.schema";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(CreateWorkspaceBody),
  WorkspaceController.createWorkspace,
);

router.get("/", requireAuth, WorkspaceController.getWorkspaces);

router.get(
  "/:workspaceId",
  requireAuth,
  validate(GetWorkspaceParams, "params"),
  WorkspaceController.getWorkspace,
);

export default router;
