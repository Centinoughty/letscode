import { CollabRole } from "./CollabRole";
import { User } from "./User";

export interface Collaborator {
  role: CollabRole;
  userId: string;
  user: User;
}
