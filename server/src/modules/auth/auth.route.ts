import { Router } from "express";
import * as AuthController from "./auth.controller";
import { validate } from "../../middlewares/validate";
import * as AuthSchema from "./auth.schema";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.post(
  "/register",
  validate(AuthSchema.UserRegisterBody),
  AuthController.registerUser,
);

router.post(
  "/login",
  validate(AuthSchema.UserLoginBody),
  AuthController.loginUser,
);

router.post(
  "/google",
  validate(AuthSchema.GoogleLoginBody),
  AuthController.googleLogin,
);

router.post("/logout", requireAuth, AuthController.logout);

export default router;
