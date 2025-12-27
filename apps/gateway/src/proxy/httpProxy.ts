import { FastifyInstance } from "fastify";
import proxy from "@fastify/http-proxy";
import { config } from "../config";
import { authMiddleware } from "../middlewares/auth";

export async function registerHttpProxy(app: FastifyInstance) {
    app.register(proxy, {
        upstream: config.SERVICES.auth,
        prefix: "/auth",
        rewritePrefix: "/",
    });

    app.register(proxy, {
        upstream: config.SERVICES.workspace,
        prefix: "/workspace",
        rewritePrefix: "/",
        preHandler: authMiddleware,
    });
}
