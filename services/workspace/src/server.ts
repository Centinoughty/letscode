import express from "express";
import dotenv from "dotenv";
import workspaceRoute from "./routes/workspace.route";

dotenv.config();

export function startServer() {
  const app = express();

  app.use(express.json());

  app.use("/health", (_, res) => res.send("OK"));

  app.use("/", workspaceRoute);

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
