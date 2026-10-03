export function elapsedOrderTime(createdAt: string, now: number) {
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return null;
  const minutes = Math.max(0, Math.floor((now - created) / 60000));
  return minutes < 1 ? "Just now" : minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`;
}
