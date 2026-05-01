import { Response } from "express";
import { TypedRequest } from "../../types/request";
import { prisma } from "../../lib/prisma";

export async function getUser(req: TypedRequest, res: Response) {
  try {
    // get data from request
    const { id } = req.user!;

    // get user data
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user || !user.is_active) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Feteched user data",
      user: { name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    console.log("GET_USER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
