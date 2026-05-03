import { Router } from "express";
import { validate } from "../../middlewares/validate";
import * as CodeSchema from "./code.shema";
import { createCode, getCode, getCodes } from "./code.controller";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.post("/", requireAuth, validate(CodeSchema.CreateCodeBody), createCode);

router.get("/", requireAuth, getCodes);

router.get(
  "/:codeId",
  requireAuth,
  validate(CodeSchema.GetCodeParams),
  getCode,
);

export default router;
