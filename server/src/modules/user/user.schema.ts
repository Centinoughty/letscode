import z from "zod";

export const EditProfileBody = z.object({
  name: z.string().optional(),
});

export type EditProfileBody = z.infer<typeof EditProfileBody>;
