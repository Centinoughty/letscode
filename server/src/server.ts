import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

export const buildApp = () => {
    const app = Fastify({
        logger: {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "HH:MM:ss",
                    ignore: "pid,hostname",
                },
            },
        },
    });

    app.register(cors, {
        origin: true,
        credentials: true,
    });

    app.register(jwt, {
        secret: process.env.JWT_SECRET!,
    });

    app.get("/health", async () => {
        return { status: "ok" };
    });

    return app;
};
