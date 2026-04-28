import express from "express";
import { env } from "./config/env";

export function startServer() {
  const app = express();

  app.use("/health", (_, res) => {
    res.send("OK");
  });

  app.listen(env.PORT, () => {
    console.log(`Listening on port ${env.PORT}`);
  });
}
