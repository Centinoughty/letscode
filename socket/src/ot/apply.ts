import { Operation } from "../types/operation";

export function applyOp(code: string, operation: Operation): string {
  if (operation.type === "insert") {
    return (
      code.slice(0, operation.position) +
      operation.text +
      code.slice(operation.position)
    );
  } else {
    return (
      code.slice(0, operation.position) +
      code.slice(operation.position + operation.length)
    );
  }
}
