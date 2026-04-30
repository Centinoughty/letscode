import bcrypt from "bcryptjs";
import { env } from "../config/env";

export async function hashPassword(plainPass: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.SALT_ROUNDS);
  return bcrypt.hash(plainPass, salt);
}

export async function verifyPassword(
  plainPass: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPass, hashedPassword);
}
