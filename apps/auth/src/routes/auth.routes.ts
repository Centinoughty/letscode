import { FastifyInstance } from "fastify";
import { register, login } from "../services/auth.service";

export async function authRoutes(app: FastifyInstance) {
    app.post("/register", async (req: any) => {
        const { email, username, password } = req.body;
        return register(email, username, password);
    });

    app.post("/login", async (req: any) => {
        const { email, password } = req.body;
        return login(email, password);
    });
}
