import { z } from "zod";
import { Language } from "@prisma/client";

export const CreateCodeBody = z.object({
  name: z.string(),
  language: z
    .enum(Object.values(Language) as [string, ...string[]])
    .transform((val) => val as Language),
});

export const CodeParams = z.object({
  codeId: z.uuidv4(),
});

export const EditCodeBody = z.object({
  name: z.string(),
});

export type CreateCodeBody = z.infer<typeof CreateCodeBody>;
export type CodeParams = z.infer<typeof CodeParams>;
export type EditCodeBody = z.infer<typeof EditCodeBody>;
