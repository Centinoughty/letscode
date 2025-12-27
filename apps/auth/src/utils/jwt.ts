import jwt from "jsonwebtoken";
import { config } from "../config";

export function signAccessToken(payload: object) {
    return jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.REFRESH_TOKEN_TTL_DAYS,
    });
}

export function signRefreshToken(payload: object) {
    return jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: `${config.REFRESH_TOKEN_TTL_DAYS}d`,
    });
}
