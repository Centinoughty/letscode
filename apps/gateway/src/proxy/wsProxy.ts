import { createProxyServer } from "http-proxy";
import { config } from "../config";

const wsProxy = createProxyServer({ ws: true });

export function registerWsProxy(server: any) {
    server.on("upgrade", (req, socket, head) => {
        if (req.url.startsWith("/ws")) {
            wsProxy.ws(req, socket, head, {
                target: config.SERVICES.realtime,
            });
        }
    });
}
