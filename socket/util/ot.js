const transformInsertInsert = (op1, op2) => {
  if (
    op2.offset < op1.offset ||
    (op2.offset === op1.offset && op2.clientId < op1.clientId)
  ) {
    op1.offset += op2.text.length;
  }

  return op1;
};

const transformInsertDelete = (op1, op2) => {
  if (op2.offset < op1.offset) {
    const end = op2.offset + op2.change.rangeLength;
    op1.offset = Math.max(op2.offset, op1.offset - op2.change.rangeLength);
  } else if (
    op1.offset >= op2.offset &&
    op1.offset < op2.offset + op2.change.rangeLength
  ) {
    op1.offset = op2.offset;
  }

  return op1;
};

const transformDeleteInsert = (op1, op2) => {
  if (op2.offset <= op1.offset) {
    op1.offset += op2.text.length;
  } else if (
    op2.offset > op1.offset &&
    op2.offset < op1.offset + op1.change.rangeLength
  ) {
    op1.change.rangeLength += op2.text.length;
  }

  return op1;
};

const transformDeleteDelete = (op1, op2) => {
  const start1 = op1.offset;
  const end1 = start1 + op1.change.rangeLength;
  const start2 = op2.offset;
  const end2 = start2 + op2.change.rangeLength;

  if (end1 <= start2) {
    return op1;
  } else if (start1 >= end2) {
    op1.offset -= op2.change.rangeLength;
  } else {
    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    const overlapLength = overlapEnd - overlapStart;
    op1.change.rangeLength -= overlapLength;

    if (start2 < start1) {
      op1.offset -= overlapStart - start2;
    }
  }

  return op1;
};

const transform = (op1, op2) => {
  if (op1.clientId === op2.clientId) return op1;

  const isInsert1 = op1.change.rangeLength === 0;
  const isInsert2 = op2.change.rangeLength === 0;

  if (isInsert1 && isInsert2) return transformInsertInsert(op1, op2);
  if (isInsert1 && !isInsert2) return transformInsertDelete(op1, op2);
  if (!isInsert1 && isInsert2) return transformDeleteInsert(op1, op2);
  if (!isInsert1 && !isInsert2) return transformDeleteDelete(op1, op2);

  return op1;
};

const transformOp = (incoming, history) => {
  let offset = incoming.rangeOffset;
  let length = incoming.rangeLength || 0;

  for (const op of history) {
    const opOffset = op.change.rangeOffset;
    const opTextLength = op.change.text.length;
    const opDelLength = op.change.rangeLength || 0;

    if (opOffset < offset) {
      if (opDelLength === 0 && opTextLength > 0) {
        offset += opTextLength;
      }
    }

    if (opOffset < offset && opDelLength > 0 && opTextLength === 0) {
      offset -= Math.min(opDelLength, offset - opOffset);
    }

    if (
      opOffset >= offset &&
      opOffset < offset + length &&
      opDelLength > 0 &&
      opTextLength === 0
    ) {
      length -= Math.min(length, opDelLength);
    }

    if (
      opOffset >= offset &&
      opOffset <= offset + length &&
      opTextLength > 0 &&
      opDelLength === 0
    ) {
      length += opTextLength;
    }
  }

  return {
    ...incoming,
    rangeOffset: offset,
    rangeLength: length,
  };
};

module.exports = { transform };
