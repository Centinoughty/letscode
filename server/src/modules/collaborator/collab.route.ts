import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validate } from "../../middlewares/validate";
import * as CollabController from "./collab.controller";
import * as CollabSchema from "./collab.schema";

const router = Router();

router.post(
  "/:codeId/add",
  requireAuth,
  validate(CollabSchema.CodeParams, "params"),
  validate(CollabSchema.AddCollaboratorBody),
  CollabController.addCollaborator,
);

router.delete(
  "/:codeId/remove",
  requireAuth,
  validate(CollabSchema.CodeParams, "params"),
  validate(CollabSchema.CollabBody),
  CollabController.removeCollaborator,
);

export default router;
