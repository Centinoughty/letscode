import { FastifyRequest, FastifyReply } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import { AccessTokenPayload } from "../types/jwt";

export async function authMiddleware(req: FastifyRequest, res: FastifyReply) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer "))
        return res.code(401).send({ error: "Missing or invalid token" });

    const token = auth.replace("Bearer ", "");
    let decoded: string | JwtPayload;

    try {
        decoded = jwt.verify(token, config.JWT_PUBLIC_KEY);
    } catch (error) {
        return res.code(401).send({ error: "Invalid token" });
    }

    if (typeof decoded === "string") {
        return res.code(401).send({ error: "Invalid token payload" });
    }

    const { userId, email } = decoded as JwtPayload & AccessTokenPayload;

    if (!userId || !email) {
        return res.code(401).send({ error: "Invalid token payload" });
    }

    req.user = { userId, email };
}
