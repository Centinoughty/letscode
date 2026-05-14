export const collabRoleOptions = [
  { label: "Viewer", value: "VIEW" },
  { label: "Editor", value: "EDIT" },
  { label: "Admin", value: "ADMIN" },
];

export type CollabRole = (typeof collabRoleOptions)[number]["value"];
