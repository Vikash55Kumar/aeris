export function formatISTTimestamp(date: Date = new Date()): { dateStr: string; timeStr: string } {
  const dateStr = date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr =
    date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' IST';
  return { dateStr, timeStr };
}
