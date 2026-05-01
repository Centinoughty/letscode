import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { getUser } from "./user.controller";

const router = Router();

router.get("/me", requireAuth, getUser);

export default router;
