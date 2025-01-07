export function calculateRuntimeDisplay(runtime: number): string {
  if (!runtime) {
    return 'TBD';
  }
  const hours = Math.floor(runtime / 60);
  if (hours < 1) {
    return `${runtime} minutes`;
  } else if (hours > 1 && hours < 2) {
    const minutes = runtime - 60;
    return `${hours} hour, ${minutes} minutes`;
  } else {
    const minutes = runtime - 60 * hours;
    return `${hours} hours, ${minutes} minutes`;
  }
}

export function stripArticle(title: string): string {
  return title.replace(/^(a |an |the )/i, '').trim();
}
