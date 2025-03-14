export function mergeLineBreak(text: string): string {
  return text.replace(/\n+/g, "\n");
}

export function mergeSpace(text: string): string {
  return text.replace(/\s+/g, " ");
}
