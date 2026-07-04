import { Router } from "express";
import { createContainer } from "../services/container.service";

const router = Router();

router.post("/containers", createContainer);

export default router;
