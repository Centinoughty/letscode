import { Router } from "express";
import { googleLogin, loginUser, registerUser } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import {
  GoogleLoginBody,
  UserLoginBody,
  UserRegisterBody,
} from "./auth.schema";

const router = Router();

router.post("/register", validate(UserRegisterBody), registerUser);
router.post("/login", validate(UserLoginBody), loginUser);
router.post("/google", validate(GoogleLoginBody), googleLogin);

export default router;
