import { Language } from "@prisma/client";
import { z } from "zod";

export const CreateCodeBody = z.object({
  name: z.string(),
  language: z
    .enum(Object.values(Language) as [string, ...string[]])
    .transform((val) => val as Language),
});

export const GetCodeParams = z.object({
  codeId: z.uuidv4(),
});

export type CreateCodeBody = z.infer<typeof CreateCodeBody>;
export type GetCodeParams = z.infer<typeof GetCodeParams>;
