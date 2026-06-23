import express from "express";
import { env } from "./config/env";

export function startServer() {
  const app = express();

  app.listen(env.PORT, () => {
    console.log(`Runner started on ${env.PORT}`);
  });
}
