import { buildApp } from "./server";

const app = buildApp();

app.listen({
    port: Number(process.env.PORT || 5000),
    host: "0.0.0.0",
});
