import { Response } from "express";
import { CollabRole, NodeType } from "@prisma/client";
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
    const { id: userId } = req.user!;

    // fetch workspaces owned by user or shared with user
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          {
            ownerId: userId,
          },
          {
            collaborators: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        nodes: true,
        collaborators: true,
      },
    });

    res.status(200).json({ message: "Fetched all workspaces", workspaces });
  } catch (error) {
    console.log("GET_WORKSPACES_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getWorkspace(
  req: TypedRequest<WorkspaceSchema.WorkspaceParams, {}, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { workspaceId } = req.params;
    const { id: userId } = req.user!;

    // fetch workspace and collaborator membership for current user
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        nodes: true,
        collaborators: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // verify owner or any collaborator access
    if (
      !workspace ||
      (workspace.ownerId !== userId && workspace.collaborators.length === 0)
    ) {
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

export async function editWorkspace(
  req: TypedRequest<
    WorkspaceSchema.WorkspaceParams,
    WorkspaceSchema.EditWorkspaceBody,
    {}
  >,
  res: Response,
) {
  try {
    // get data from request
    const { workspaceId } = req.params;
    const { name } = req.body;
    const { id: userId } = req.user!;

    // verify owner or ADMIN collaborator access
    const existing = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        collaborators: {
          where: {
            userId,
            role: CollabRole.ADMIN,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (
      !existing ||
      (existing.ownerId !== userId && existing.collaborators.length === 0)
    ) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // update workspace name
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name },
    });

    return res.status(200).json({
      message: "Workspace updated successfully",
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.log("EDIT_WORKSPACE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteWorkspace(
  req: TypedRequest<WorkspaceSchema.WorkspaceParams, {}, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { workspaceId } = req.params;
    const { id: userId } = req.user!;

    // verify owner or ADMIN collaborator access
    const existing = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        collaborators: {
          where: {
            userId,
            role: CollabRole.ADMIN,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (
      !existing ||
      (existing.ownerId !== userId && existing.collaborators.length === 0)
    ) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // delete workspace
    const workspace = await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Workspace deleted successfully", workspace });
  } catch (error) {
    console.log("DELETE_WORKSPACE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
