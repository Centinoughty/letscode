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
      return res.status(401).json({ message: "User not authorized" });
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
      return res.status(401).json({ message: "User not authorized" });
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
      return res.status(401).json({ message: "User not authorized" });
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

// -- -- -- LIST ALL COLLABORATORS -- -- --
// function to list all the collaborators
export async function listCollaborators(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const { workspaceId } = req.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!member) {
      return res
        .status(403)
        .json({ message: "Cannot view the members of this workspace" });
    }

    const allMembers = await prisma.workspace.findMany({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        workspaceMembers: {
          select: {
            id: true,
            userId: true,
            permission: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      data: allMembers,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// -- -- -- ADD COLLABORATOR -- -- --
// function to add a collaborator to workspace
export async function addCollaborator(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const { workspaceId } = req.params;
    const { memberId, permission } = req.body;

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
        .json({ message: "Not authorized to add a collaborator" });
    }

    // check if the member already exists
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId,
        },
      },
    });

    if (member) {
      return res.status(409).json({ message: "Collaborator already exists" });
    }

    // create a new member
    const newMember = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: memberId,
        permission: permission || "10",
      },
      select: {
        id: true,
        userId: true,
        permission: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ message: "Added collaborator", newMember });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// -- -- -- UPDATE COLLABORATOR -- -- --
// function to update a collaborator permission level
export async function updateCollaborator(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const { workspaceId } = req.params;
    const { memberId, permission } = req.body;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.ownerId !== userId) {
      return res.status(403).json({
        message: "Not authorized to update the collaborator permission level",
      });
    }

    // check if member exists or not
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId,
        },
      },
    });

    if (!member) {
      return res.status(404).json({ message: "Collaborator not found" });
    }

    // update the member permission
    await prisma.workspaceMember.updateMany({
      where: {
        workspaceId,
        userId: memberId,
      },
      data: {
        permission,
      },
    });

    return res.status(200).json({ message: "Collaborator updated" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// -- -- -- REMOVE COLLABORATOR -- -- --
// function to remove a collaborator
export async function removeCollaborator(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    // check if user is authenticated
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    // validate the request
    const { workspaceId } = req.params;
    const { memberId } = req.body;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // check if the user is authorized to perform the action
    // check if the user is the owner of the workspace
    if (workspace.ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to remove the collaborator" });
    }

    // cannot remove owner from collaborator
    if (workspace.ownerId === memberId) {
      return res
        .status(400)
        .json({ message: "Cannot remove owner from collaborator" });
    }

    // remove only if a member exists
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId,
        },
      },
    });

    if (!member) {
      return res.status(404).json({ message: "Collaborator not found" });
    }

    // remove the memer from workspace
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId,
        },
      },
    });

    return res.status(200).json({ message: "Collaborator removed" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
