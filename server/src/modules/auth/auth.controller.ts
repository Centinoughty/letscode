import { Response } from "express";
import { prisma } from "../../lib/prisma";
import { TypedRequest } from "../../types/request";
import { UserLoginBody, UserRegisterBody } from "./auth.schema";
import { hashPassword, verifyPassword } from "../../utils/password";
import {
  accessCookieOptions,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
} from "../../utils/token";

export async function registerUser(
  req: TypedRequest<{}, UserRegisterBody, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { name, email, password } = req.body;

    // check if user exists or not
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // create a new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // create cookie
    const tokenPayload = { id: newUser.id, email: newUser.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(201).json({
      message: "User created succefully",
      user: { name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.log("USER_REGISTER_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function loginUser(
  req: TypedRequest<{}, UserLoginBody, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { email, password } = req.body;

    // check if user exists or not
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if account is active
    if (!user.is_active) {
      return res
        .status(403)
        .json({ message: "Account is temporarily disabled" });
    }

    // check if user added password or not
    if (!user.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // compare password
    const isPasswordMatch = await verifyPassword(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // create cookie
    const tokenPayload = { id: user.id, email: user.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      message: "User logged in succefully",
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.log("USER_LOGIN_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
