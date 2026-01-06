import { createProxyMiddleware } from "http-proxy-middleware";
import { Request } from "express";

export const workspaceProxy = createProxyMiddleware({
  target: process.env.WORKSPACE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/workspace": "",
  },
  on: {
    proxyReq: (proxyReq, req: Request) => {
      const user = (req as any).user;
      if (user?.userId) {
        proxyReq.setHeader("x-user-id", user.userId);
      }
    },
  },
});
