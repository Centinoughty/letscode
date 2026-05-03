import { Response } from "express";
import { NodeType } from "@prisma/client";
import { TypedRequest } from "../../types/request";
import { prisma } from "../../lib/prisma";
import * as WorkspaceSchema from "./workspace.schema";

export async function createWorkspace(
  req: TypedRequest<{}, WorkspaceSchema.CreateWorkspaceBody, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { name } = req.body;
    const { id: userId } = req.user!;

    // create a workspace
    const newWorkspace = await prisma.$transaction(async (tx) => {
      // Create workspace first
      const workspace = await tx.workspace.create({
        data: {
          name: name,
          ownerId: userId,
        },
      });

      // Create root node linked to workspace
      const rootNode = await tx.node.create({
        data: {
          name: "workspace",
          type: NodeType.DIRECTORY,
          parentId: null,
          workspaceId: workspace.id,
        },
      });

      return { workspace, rootNode };
    });

    return res.status(201).json({
      message: "Workspace created successfully",
      workspace: {
        ...newWorkspace.workspace,
        nodes: [newWorkspace.rootNode],
      },
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
        nodes: true,
      },
    });

    res.status(200).json({ message: "Fetched all workspaces", workspaces });
  } catch (error) {
    console.log("GET_WORKSPACES_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getWorkspace(
  req: TypedRequest<WorkspaceSchema.GetWorkspaceParams, {}, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { workspaceId } = req.params;
    const { id: userId } = req.user!;

    // fetch workspace owned by user
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        nodes: true,
      },
    });

    // verify ownership
    if (!workspace || workspace.ownerId !== userId) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    return res
      .status(200)
      .json({ message: "Fetched workspace data", workspace });
  } catch (error) {
    console.log("GET_WORKSPACE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
