let nextIdInternal = 1;

export function nextIdNumeric(): number {
  return nextIdInternal++;
}

export function nextId(prefix?: string): string {
  return `${prefix || ''}${nextIdInternal++}`;
}
