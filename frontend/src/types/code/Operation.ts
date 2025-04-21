interface Operation {
  type: "insert" | "delete";
  position: number;
  content?: string;
  length?: number;
}
