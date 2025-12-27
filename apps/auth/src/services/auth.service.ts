import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../utils/hash";
import { issueTokens } from "./token.service";

const prisma = new PrismaClient();

export async function register(
    email: string,
    username: string,
    password: string
) {
    const hash = await hashPassword(password);

    const user = await prisma.user.create({
        data: { email, username, password: hash },
    });

    return issueTokens(user.id, user.email);
}

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const ok = await verifyPassword(password, user.password);
    if (!ok) throw new Error("Invalid credentials");

    return issueTokens(user.id, user.email);
}
