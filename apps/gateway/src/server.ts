import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { registerHttpProxy } from "./proxy/httpProxy";

export function buildServer() {
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

    app.register(rateLimit, {
        max: 100,
        timeWindow: "1 minute",
    });

    registerHttpProxy(app);

    app.get("/health", async () => ({ status: "ok" }));

    return app;
}
