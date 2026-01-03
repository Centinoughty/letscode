import express from "express";
import dotenv from "dotenv";

dotenv.config();

export function startServer() {
  const app = express();

  app.use(express.json());

  app.use("/health", (_, res) => res.send("OK"));

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
