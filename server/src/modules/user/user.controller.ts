import { Response } from "express";
import { TypedRequest } from "../../types/request";
import { prisma } from "../../lib/prisma";
import * as ProfileSchema from "./user.schema";

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
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        is_active: user.is_active,
        is_admin: user.is_admin,
        is_google: user.is_google,
        is_verified: user.is_verified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("GET_USER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function editProfile(
  req: TypedRequest<{}, ProfileSchema.EditProfileBody, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { id: userId } = req.user!;
    const { name } = req.body;

    // update user
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
      },
    });

    return res.status(200).json({ message: "User updated succesfully", user });
  } catch (error) {
    console.log("EDIT_PROFILE_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
