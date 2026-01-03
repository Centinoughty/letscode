import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authProxy } from "./proxy/auth.proxy";

dotenv.config();

export function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_, res) => res.send("OK"));

  app.use("/auth", authProxy);

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
