import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validate } from "../../middlewares/validate";
import * as CollabController from "./collab.controller";
import * as CollabSchema from "./collab.schema";

const router = Router();

router.post(
  "/add",
  requireAuth,
  validate(CollabSchema.CodeParams),
  validate(CollabSchema.AddCollaboratorBody),
  CollabController.addCollaborator,
);

export default router;
