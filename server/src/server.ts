import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";

import authRoutes from "./modules/auth/auth.route";
import codeRoutes from "./modules/code/code.route";
import userRoutes from "./modules/user/user.route";
import workspaceRoutes from "./modules/workspace/workspace.route";

export function startServer() {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use("/health", (_, res) => {
    res.send("OK");
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/code", codeRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/workspace", workspaceRoutes);

  app.listen(env.PORT, () => {
    console.log(`Listening on port ${env.PORT}`);
  });
}
