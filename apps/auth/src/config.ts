export const config = {
    PORT: Number(process.env.PORT || 3000),
    JWT_SECRET: process.env.JWT_SECRET!,
    ACCESS_TOKEN_TTL: "15m",
    REFRESH_TOKEN_TTL_DAYS: 7,
};
