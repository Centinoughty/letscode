export function hasRead(p: number) {
  return (p & 4) === 4;
}

export function hasWrite(p: number) {
  return (p & 2) === 2;
}

export function hasExecute(p: number) {
  return (p & 1) === 1;
}
