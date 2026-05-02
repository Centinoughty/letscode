export function formatDate(date: string): string {
  const diff = Date.now() - new Date(date).getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";

  return `${days} days ago`;
}
