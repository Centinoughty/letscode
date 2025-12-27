export const config = {
    PORT: Number(process.env.PORT || 5000),
    JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY!,
    SERVICES: {
        auth: "http://auth:3000",
        workspace: "http://workspace:3000",
        fs: "http://fs-metadata:3000",
        content: "http://file-content:3000",
        terminal: "http://terminal:3000",
        realtime: "http://realtime:3000",
    },
};
