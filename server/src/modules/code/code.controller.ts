import { Response } from "express";
import { TypedRequest } from "../../types/request";
import * as CodeSchema from "./code.schema";
import { prisma } from "../../lib/prisma";

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
        filePath: `/${Date.now()}-${crypto.randomUUID()}`,
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

    // get all codes
    const codes = await prisma.code.findMany({
      where: {
        ownerId: userId,
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
    });

    // verify ownership
    if (!code || code.ownerId !== userId) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    return res.status(200).json({ message: "Fetched code successfully", code });
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

    // verify ownership
    const existing = await prisma.code.findUnique({ where: { id: codeId } });

    if (!existing || existing.ownerId !== userId) {
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

    // delete code
    const code = await prisma.code.delete({
      where: {
        id: codeId,
        ownerId: userId,
      },
      select: {
        id: true,
      },
    });

    // verify ownership
    if (!code) {
      return res.status(404).json({ message: "Code not found" });
    }

    return res.status(200).json({ message: "Code deleted successfully", code });
  } catch (error) {
    console.log("DELETE_CODE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
