import { Router } from "express";
import { deleteUser, login, register } from "../controllers/auth.controller";
import { getUserData } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getUserData);
router.delete("/delete", deleteUser);

export default router;
