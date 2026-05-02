import { Response } from "express";
import { FileType } from "@prisma/client";
import { TypedRequest } from "../../types/request";
import { prisma } from "../../lib/prisma";
import { CreateWorkspaceBody, GetWorkspaceParams } from "./workspace.schema";

export async function createWorkspace(
  req: TypedRequest<{}, CreateWorkspaceBody, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { name } = req.body;
    const { id } = req.user!;

    // create a workspace
    const newWorkspace = await prisma.$transaction(async (tx) => {
      const root = await tx.node.create({
        data: {
          name,
          type: FileType.DIRECTORY,
          path: `/`,
          contentKey: crypto.randomUUID(),
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          ownerId: id,
          rootId: root.id,
        },
        include: {
          root: true,
        },
      });

      return workspace;
    });

    return res.status(201).json({
      message: "Workspace created successfully",
      workspace: newWorkspace,
    });
  } catch (error) {
    console.log("CREATE_WORKSPACE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getWorkspaces(req: TypedRequest, res: Response) {
  try {
    // get data from request
    const { id } = req.user!;

    // fetch workspaces owned by user
    const workspaces = await prisma.workspace.findMany({
      where: {
        ownerId: id,
      },
      include: {
        root: true,
      },
    });

    res.status(200).json({ message: "Fetched all workspaces", workspaces });
  } catch (error) {
    console.log("GET_WORKSPACES_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getWorkspace(
  req: TypedRequest<GetWorkspaceParams, {}, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { workspaceId } = req.params;
    const { id } = req.user!;

    // fetch workspace owned by user
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
        ownerId: id,
      },
    });

    return res
      .status(200)
      .json({ message: "Fetched workspace data", workspace });
  } catch (error) {
    console.log("GET_WORKSPACE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
