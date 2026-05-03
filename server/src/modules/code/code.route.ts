import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validate } from "../../middlewares/validate";
import * as CodeSchema from "./code.schema";
import * as CodeController from "./code.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(CodeSchema.CreateCodeBody),
  CodeController.createCode,
);

router.get("/", requireAuth, CodeController.getCodes);

router.get(
  "/:codeId",
  requireAuth,
  validate(CodeSchema.CodeParams, "params"),
  CodeController.getCode,
);

router.patch(
  "/:codeId",
  requireAuth,
  validate(CodeSchema.CodeParams, "params"),
  validate(CodeSchema.EditCodeBody),
  CodeController.editCode,
);

router.delete(
  "/:codeId",
  requireAuth,
  validate(CodeSchema.CodeParams, "params"),
  CodeController.deleteCode,
);

export default router;
