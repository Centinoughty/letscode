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
  validate(CodeSchema.CodeParams),
  CodeController.getCode,
);

router.delete(
  "/:codeId",
  requireAuth,
  validate(CodeSchema.CodeParams),
  CodeController.deleteCode,
);

export default router;
