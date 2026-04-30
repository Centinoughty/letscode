import { Router } from "express";
import { loginUser, registerUser } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { UserLoginBody, UserRegisterBody } from "./auth.schema";

const router = Router();

router.post("/register", validate(UserRegisterBody), registerUser);
router.post("/login", validate(UserLoginBody), loginUser);

export default router;
