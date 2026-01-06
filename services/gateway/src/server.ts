import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { jwtAuthorization } from "./middlewares/jwt.middleware";
import { authProxy } from "./proxy/auth.proxy";
import { workspaceProxy } from "./proxy/workspace.proxy";

dotenv.config();

export function startServer() {
  const app = express();

  app.use(cors());

  // authorization middleware
  app.use(jwtAuthorization);

  app.get("/health", (_, res) => res.send("OK"));

  app.use("/auth", authProxy);
  app.use("/workspace", workspaceProxy);

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
