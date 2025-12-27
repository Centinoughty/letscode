import { PrismaClient } from "@prisma/client";
import { signAccessToken, signRefreshToken } from "../utils/jwt";

const prisma = new PrismaClient();

export async function issueTokens(userId: string, email: string) {
    const accessToken = signAccessToken({ userId, email });
    const refreshToken = signRefreshToken({ userId });

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId,
            expiresAt: new Date(Date.now() + 7 * 86400000),
        },
    });

    return { accessToken, refreshToken };
}
