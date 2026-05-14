import { z } from "zod";
import { CollabRole } from "@prisma/client";

export const CodeParams = z.object({
  codeId: z.uuidv4(),
});

export const AddCollaboratorBody = z.object({
  collabEmails: z.array(z.email()).min(1),
  collabRole: z
    .enum(Object.values(CollabRole) as [string, ...string[]])
    .transform((val) => val as CollabRole)
    .default(CollabRole.VIEW),
});

export type CodeParams = z.infer<typeof CodeParams>;
export type AddCollaboratorBody = z.infer<typeof AddCollaboratorBody>;
