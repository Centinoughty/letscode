import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";

import authRoutes from "./modules/auth/auth.route";

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

  app.listen(env.PORT, () => {
    console.log(`Listening on port ${env.PORT}`);
  });
}
