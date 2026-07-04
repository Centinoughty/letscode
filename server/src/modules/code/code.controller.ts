import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { Response } from "express";
import path from "path";
import { CollabRole } from "@prisma/client";
import { TypedRequest } from "../../types/request";
import * as CodeSchema from "./code.schema";
import { prisma } from "../../lib/prisma";
import { languageExtensions } from "../../config/langauge";
import { env } from "../../config/env";

const uploadsDir = "/shared/code";

function resolveCodeFilePath(code: {
  filePath: string;
  language: CodeSchema.CreateCodeBody["language"];
}) {
  const fileExtension = languageExtensions[code.language];
  const fileBaseName = code.filePath.startsWith("/")
    ? code.filePath.slice(1)
    : code.filePath;

  return path.join(uploadsDir, `${fileBaseName}.${fileExtension}`);
}

export async function createCode(
  req: TypedRequest<{}, CodeSchema.CreateCodeBody, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { name, language } = req.body;
    const { id: userId } = req.user!;

    // create code with node in transaction
    const newCode = await prisma.code.create({
      data: {
        name,
        language,
        ownerId: userId,
      },
    });

    return res.status(201).json({
      message: "Code created successfully",
      code: newCode,
    });
  } catch (error) {
    console.log("CREATE_CODE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getCodes(req: TypedRequest, res: Response) {
  try {
    // get data from request
    const { id: userId } = req.user!;

    // get all codes the user owns or collaborates on
    const codes = await prisma.code.findMany({
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
        collaborators: {
          include: {
            user: true,
          },
        },
      },
    });

    return res.status(200).json({ message: "Fetched all codes", codes });
  } catch (error) {
    console.log("GET_CODES_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getCode(
  req: TypedRequest<CodeSchema.CodeParams, {}, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { codeId } = req.params;
    const { id: userId } = req.user!;

    // get code
    const code = await prisma.code.findUnique({
      where: {
        id: codeId,
      },
      include: {
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
    if (!code || (code.ownerId !== userId && code.collaborators.length === 0)) {
      return res.status(404).json({ message: "Code not found" });
    }

    return res.status(200).json({
      message: "Fetched code successfully",
      code,
    });
  } catch (error) {
    console.log("GET_CODE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function editCode(
  req: TypedRequest<CodeSchema.CodeParams, CodeSchema.EditCodeBody, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { codeId } = req.params;
    const { name } = req.body;
    const { id: userId } = req.user!;

    // verify owner or ADMIN collaborator access
    const existing = await prisma.code.findUnique({
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

    if (
      !existing ||
      (existing.ownerId !== userId && existing.collaborators.length === 0)
    ) {
      return res.status(404).json({ message: "Code not found" });
    }

    // update code name
    const updatedCode = await prisma.code.update({
      where: { id: codeId },
      data: { name },
    });

    return res
      .status(200)
      .json({ message: "Code updated successfully", code: updatedCode });
  } catch (error) {
    console.log("EDIT_CODE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteCode(
  req: TypedRequest<CodeSchema.CodeParams, {}, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { codeId } = req.params;
    const { id: userId } = req.user!;

    // verify owner or ADMIN collaborator access
    const existing = await prisma.code.findUnique({
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

    if (
      !existing ||
      (existing.ownerId !== userId && existing.collaborators.length === 0)
    ) {
      return res.status(404).json({ message: "Code not found" });
    }

    // delete code
    const code = await prisma.code.delete({
      where: {
        id: codeId,
      },
      select: {
        id: true,
      },
    });

    // unlink file from uploads
    await unlink(
      resolveCodeFilePath({
        filePath: existing.id,
        language: existing.language,
      }),
    );

    return res.status(200).json({ message: "Code deleted successfully", code });
  } catch (error) {
    console.log("DELETE_CODE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function executeCode(
  req: TypedRequest<CodeSchema.CodeParams, CodeSchema.RunBody, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { codeId } = req.params;
    const { stdin } = req.body;
    const { id: userId } = req.user!;

    // find code
    const code = await prisma.code.findUnique({
      where: { id: codeId },
      select: {
        id: true,
        language: true,
        ownerId: true,
        collaborators: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    if (!code || (code.ownerId !== userId && code.collaborators.length === 0)) {
      return res.status(404).json({ message: "Code not found" });
    }

    // get result from runner
    const runnerRes = await fetch(`${env.RUNNER_API_URL}/containers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: code.language.toLowerCase(),
        codeId: code.id,
        stdin: stdin,
      }),
    });

    if (!runnerRes.ok) {
      return res.status(500).json({ message: "Runner execution failed" });
    }

    const result = await runnerRes.json();

    return res.status(200).json({
      message: "Code executed successfully",
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
    });
  } catch (error) {
    console.log("EXECUTE_CODE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
