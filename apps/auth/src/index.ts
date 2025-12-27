import { buildServer } from "./server";
import { config } from "./config";

const app = buildServer();

app.listen({ port: config.PORT, host: "0.0.0.0" }).then(() =>
    console.log("Auth service running")
);
