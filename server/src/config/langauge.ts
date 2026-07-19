import * as CodeSchema from "../modules/code/code.schema";

export const languageExtensions: Record<
  CodeSchema.CreateCodeBody["language"],
  string
> = {
  CPP: "cpp",
  JAVASCRIPT: "js",
  PYTHON: "py",
  TYPESCRIPT: "ts",
  JAVA: "java",
};
