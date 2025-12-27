import { config } from "./config";
import { registerWsProxy } from "./proxy/wsProxy";
import { buildServer } from "./server";

const app = buildServer();

app.listen({ port: config.PORT, host: "0.0.0.0" }).then(() => {
    registerWsProxy(app.server);
});
