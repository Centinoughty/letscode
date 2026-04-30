import { z } from "zod";

export const UserRegisterBody = z.object({
  name: z.string(),
  email: z.email().toLowerCase(),
  password: z.string(),
});

export const UserLoginBody = z.object({
  email: z.email().toLowerCase(),
  password: z.string(),
});

export const GoogleLoginBody = z.object({
  code: z.string(),
});

export type UserRegisterBody = z.infer<typeof UserRegisterBody>;
export type UserLoginBody = z.infer<typeof UserLoginBody>;
export type GoogleLoginBody = z.infer<typeof GoogleLoginBody>;
