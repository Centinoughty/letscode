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

// -- -- -- GET ALL WORKSPACE -- -- --
// function to get all workspaces
export async function listWorkspaces(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        workspaceMembers: {
          some: {
            userId,
          },
        },
      },
    });

    return res.status(200).json({
      data: workspaces,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// -- -- -- DELETE A WORKSPACE -- -- --
// funtion to delete a workspace
export async function deleteWorkspace(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const workspaceId = req.params.id;
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete the workspace" });
    }

    await prisma.$transaction([
      prisma.workspaceMember.deleteMany({
        where: { workspaceId },
      }),
      prisma.workspace.delete({
        where: { id: workspaceId },
      }),
    ]);

    return res.status(200).json({ message: "Workspace deleted succesfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
