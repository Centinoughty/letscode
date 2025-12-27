import Fastify from "fastify";
// import { authRoutes } from "./routes/auth.routes";
import { healthRoutes } from "./routes/health.routes";

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

    // app.register(authRoutes, { prefix: "/auth" });
    app.register(healthRoutes);
    return app;
}
