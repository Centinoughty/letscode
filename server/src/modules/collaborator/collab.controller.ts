import { Response } from "express";
import { CollabRole } from "@prisma/client";
import { TypedRequest } from "../../types/request";
import { prisma } from "../../lib/prisma";
import * as CollabSchema from "./collab.schema";

export async function addCollaborator(
  req: TypedRequest<
    CollabSchema.CodeParams,
    CollabSchema.AddCollaboratorBody,
    {}
  >,
  res: Response,
) {
  try {
    // get data from request
    const { id: userId } = req.user!;
    const { codeId } = req.params;
    const { collabEmails, collabRole = CollabRole.VIEW } = req.body;

    // verify owner or ADMIN collaborator access
    const code = await prisma.code.findUnique({
      where: { id: codeId },
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

    // check if code exists
    if (!code || (code.ownerId !== userId && code.collaborators.length === 0)) {
      return res.status(404).json({ message: "Code not found" });
    }

    // remove duplicate email values from input
    const requestedEmails = [
      ...new Set(collabEmails.map((email) => email.toLowerCase())),
    ];

    // check existence of users
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: requestedEmails,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    // check for user who were already a collaborator
    const existingCollaborators = await prisma.codeCollaborator.findMany({
      where: {
        codeId,
        userId: {
          in: users.map((user) => user.id),
        },
      },
      select: {
        userId: true,
      },
    });

    const existingCollaboratorIds = new Set(
      existingCollaborators.map((collaborator) => collaborator.userId),
    );

    // collaborators who needs to be added
    const collaboratorsToAdd = users
      .filter((user) => user.id !== code.ownerId)
      .filter((user) => !existingCollaboratorIds.has(user.id))
      .map((user) => ({
        codeId,
        userId: user.id,
        role: collabRole,
      }));

    if (collaboratorsToAdd.length > 0) {
      await prisma.codeCollaborator.createMany({
        data: collaboratorsToAdd,
        skipDuplicates: true,
      });
    }

    // users who were skipped from adding
    const skippedEmails = requestedEmails.filter((email) => {
      const matchedUser = users.find((user) => user.email === email);

      if (!matchedUser) {
        return true;
      }

      if (matchedUser.id === code.ownerId) {
        return true;
      }

      return existingCollaboratorIds.has(matchedUser.id);
    });

    return res.status(201).json({
      message: "Collaborators added successfully",
      collaboratorsAdded: collaboratorsToAdd.length,
      skippedEmails,
    });
  } catch (error) {
    console.log("ADD_COLLABORATOR_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function removeCollaborator(
  req: TypedRequest<CollabSchema.CodeParams, CollabSchema.CollabBody, {}>,
  res: Response,
) {
  try {
    const { id: userId } = req.user!;
    const { codeId } = req.params;
    const { collabEmail } = req.body;

    // verify owner or ADMIN collaborator access
    const code = await prisma.code.findUnique({
      where: { id: codeId },
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

    // check if code exists
    if (!code || (code.ownerId !== userId && code.collaborators.length === 0)) {
      return res.status(404).json({ message: "Code not found" });
    }

    // find user by email
    const collaboratorUser = await prisma.user.findUnique({
      where: {
        email: collabEmail.toLowerCase(),
      },
      select: {
        id: true,
      },
    });

    if (!collaboratorUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // owner cannot be removed
    if (collaboratorUser.id === code.ownerId) {
      return res.status(400).json({
        message: "Owner cannot be removed as collaborator",
      });
    }

    // find collaborator entry
    const collaborator = await prisma.codeCollaborator.findFirst({
      where: {
        codeId,
        userId: collaboratorUser.id,
      },
    });

    if (!collaborator) {
      return res.status(404).json({
        message: "Collaborator not found",
      });
    }

    await prisma.codeCollaborator.delete({
      where: {
        id: collaborator.id,
      },
    });

    return res.status(200).json({
      message: "Collaborator removed successfully",
      email: collabEmail.toLowerCase(),
    });
  } catch (error) {
    console.log("REMOVE_COLLABORATOR_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
