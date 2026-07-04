import { Request, Response } from "express";
import * as containerManager from "../lib/container";

export async function createContainer(req: Request, res: Response) {
  try {
    const { language, codeId, stdin } = req.body;
    console.log(stdin);

    const result = await containerManager.create(language, codeId);

    return res.status(200).json({ message: "Execution completed", ...result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
