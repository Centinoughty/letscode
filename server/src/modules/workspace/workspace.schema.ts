import { z } from "zod";

export const CreateWorkspaceBody = z.object({
  name: z.string(),
});

export const WorkspaceParams = z.object({
  workspaceId: z.uuidv4(),
});

export const EditWorkspaceBody = z.object({
  name: z.string(),
});

export type CreateWorkspaceBody = z.infer<typeof CreateWorkspaceBody>;
export type WorkspaceParams = z.infer<typeof WorkspaceParams>;
export type EditWorkspaceBody = z.infer<typeof EditWorkspaceBody>;
