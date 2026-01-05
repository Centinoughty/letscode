import { createProxyMiddleware } from "http-proxy-middleware";
import { Request } from "express";

export const authProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/auth": "",
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
