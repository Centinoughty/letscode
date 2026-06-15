import { OAuth2Client } from "google-auth-library";
import { Response } from "express";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { TypedRequest } from "../../types/request";
import {
  GoogleLoginBody,
  UserLoginBody,
  UserRegisterBody,
} from "./auth.schema";
import { hashPassword, verifyPassword } from "../../utils/password";
import {
  accessCookieOptions,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/token";

const client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/auth/callback", // update this for the correct url
);

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
    const tokenPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar ?? undefined,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(201).json({
      message: "User created succefully",
      user: {
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
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
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? undefined,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      message: "User logged in succefully",
      user: { name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    console.log("USER_LOGIN_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function googleLogin(
  req: TypedRequest<{}, GoogleLoginBody, {}>,
  res: Response,
) {
  try {
    // get data from request
    const { code } = req.body;

    // send code to get tokens
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;

    if (!idToken) {
      return res.status(400).json({ message: "Google ID token not found" });
    }

    // verify the id token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    // get payload from ticket
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res
        .status(400)
        .json({ message: "Google account email not found" });
    }

    const { email, name, picture } = payload;

    // check if user exists and is active
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser && !existingUser.is_active) {
      return res
        .status(403)
        .json({ message: "Account is temporarily disabled" });
    }

    // create or update user
    const googleUser = await prisma.user.upsert({
      where: {
        email,
      },
      update: {
        name: existingUser?.name ?? name ?? undefined,
        avatar: picture ?? undefined,
        is_google: true,
        is_verified: true,
      },
      create: {
        email,
        name: name ?? "User",
        avatar: picture ?? null,
        is_google: true,
        is_verified: true,
      },
    });

    // create cookie
    const tokenPayload = {
      id: googleUser.id,
      name: googleUser.name,
      email: googleUser.email,
      avatar: googleUser.avatar ?? undefined,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      message: "Google user logged in successfully",
      user: {
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.avatar,
      },
    });
  } catch (error) {
    console.log("GOOGLE_LOGIN_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function refreshAccessToken(req: TypedRequest, res: Response) {
  try {
    // get the refresh cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.clearCookie("accessToken", accessCookieOptions);
      res.clearCookie("refreshToken", refreshCookieOptions);

      return res.status(401).json({ message: "Unauthorized" });
    }

    // get the payload from token and sign new access token
    const { id, name, email, avatar } = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({ id, name, email, avatar });

    res.cookie("accessToken", accessToken, accessCookieOptions);

    return res.status(200).json({
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    console.log("TOKEN_REFRESH_ERROR", error);
    res.clearCookie("accessToken", accessCookieOptions);
    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(401).json({ message: "Unauthorized" });
  }
}

export async function logout(_: TypedRequest, res: Response) {
  try {
    // clear cookies
    res.clearCookie("accessToken", accessCookieOptions);
    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log("USER_LOGOUT_ERROR", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
