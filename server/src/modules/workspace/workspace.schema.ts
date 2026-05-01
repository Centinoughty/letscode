import { z } from "zod";

export const CreateWorkspaceBody = z.object({
  name: z.string(),
});

export const GetWorkspaceParams = z.object({
  workspaceId: z.uuidv4(),
});

export type CreateWorkspaceBody = z.infer<typeof CreateWorkspaceBody>;
export type GetWorkspaceParams = z.infer<typeof GetWorkspaceParams>;
