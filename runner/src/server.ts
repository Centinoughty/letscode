import express from "express";
import { env } from "./config/env";
import containerRoutes from "./api/container";

export function startServer() {
  const app = express();

  app.use(express.json());

  app.use("/api/v1", containerRoutes);

  app.listen(env.PORT, () => {
    console.log(`Runner started on ${env.PORT}`);
  });
}
