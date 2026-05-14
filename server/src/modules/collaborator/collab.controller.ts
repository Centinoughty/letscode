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
