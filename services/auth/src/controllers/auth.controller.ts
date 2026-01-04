import { Request, Response } from "express";
import { hashPassword, verifyPassword } from "../utils/password";
import { prisma } from "../lib/prisma";

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    // -- -- -- validation -- -- --
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email and password are required" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be atleast 3 charecters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Provided email address is not valid" });
    }

    if (password.length < 8 || password.length > 32) {
      return res
        .status(400)
        .json({ message: "Password length must be between 8 and 32" });
    }

    // -- -- -- password hashing -- -- --
    const hash = await hashPassword(password);

    // -- -- -- create user -- -- --
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "User registered succesfully",
      data: newUser,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "The account is already in use",
      });
    }

    return res.status(500).json({ message: "Inernal Server Error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { identifier, password } = req.body;

    // -- -- -- validation -- -- --
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    // -- -- -- verify password -- -- --
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    // -- -- -- login success -- -- --
    return res.status(200).json({
      message: "login success",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
