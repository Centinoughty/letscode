import { Response } from "express";
import { AuthenticatedRequest } from "../types/request";
import { prisma } from "../lib/prisma";

// -- -- -- CREATE WORKSPACE -- -- --
// function to create a workspace
export async function createWorkspace(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Workspace name is needed" });
    }

    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: userId,
        workspaceMembers: {
          create: {
            userId,
            permission: "63",
          },
        },
      },
    });

    return res
      .status(201)
      .json({ message: "Workspace created succesfully", data: newWorkspace });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
