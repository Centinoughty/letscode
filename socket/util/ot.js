const transformOp = (incoming, history) => {
  let newOffset = incoming.rangeOffset;
  for (const op of history) {
    if (op.rangeOffset <= newOffset) {
      if (op.rangeLength === 0 && op.text.length > 0) {
        newOffset += op.text.length;
      }

      if (op.rangeLength > 0 && op.text.length === 0) {
        newOffset -= Math.min(op.rangeLength, newOffset - op.rangeOffset);
      }
    }
  }

  return {
    ...incoming,
    rangeOffset: newOffset,
  };
};

module.exports = { transformOp };
