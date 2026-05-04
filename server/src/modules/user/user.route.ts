import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validate } from "../../middlewares/validate";
import * as ProfileController from "./user.controller";
import * as ProfileSchema from "./user.schema";

const router = Router();

router.get("/me", requireAuth, ProfileController.getUser);

router.patch(
  "/me",
  requireAuth,
  validate(ProfileSchema.EditProfileBody),
  ProfileController.editProfile,
);

export default router;
