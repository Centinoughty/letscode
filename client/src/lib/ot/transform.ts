import { DeleteOp, InsertOp, Operation } from "./operation";

export function transform(incoming: Operation, against: Operation): Operation {
  const op = structuredClone(incoming);

  if (op.type === "insert" && against.type === "insert") {
    return transformInsertInsert(op, against);
  }

  if (op.type === "insert" && against.type === "delete") {
    return transformInsertDelete(op, against);
  }

  if (op.type === "delete" && against.type === "insert") {
    return transformDeleteInsert(op, against);
  }
  if (op.type === "delete" && against.type === "delete") {
    return transformDeleteDelete(op, against);
  }

  return op;
}

function transformInsertInsert(
  incoming: InsertOp,
  against: InsertOp,
): InsertOp {
  if (
    incoming.position > against.position ||
    (incoming.position === against.position && incoming.userId > against.userId)
  ) {
    incoming.position += against.text.length;
  }

  return incoming;
}

function transformInsertDelete(
  incoming: InsertOp,
  against: DeleteOp,
): InsertOp {
  if (incoming.position > against.position) {
    incoming.position -= Math.min(
      against.length,
      incoming.position - against.position,
    );
  }

  return incoming;
}

function transformDeleteInsert(
  incoming: DeleteOp,
  against: InsertOp,
): DeleteOp {
  if (incoming.position >= against.position) {
    incoming.position += against.text.length;
  }

  return incoming;
}

function transformDeleteDelete(
  incoming: DeleteOp,
  against: DeleteOp,
): DeleteOp {
  if (incoming.position >= against.position + against.length) {
    incoming.position -= against.length;
  }

  return incoming;
}
