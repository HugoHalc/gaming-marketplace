import type { BoardOrder } from "./order-board";

/** IDs only; seed every visible bucket before considering notifications. */
export class OrderAlertTracker {
  private known = new Set<string>();
  private initialized = false;
  merge(ids: string[]) { for (const id of ids) this.known.add(id); }
  observe(orders: BoardOrder[]) {
    const snapshot = [...new Map(orders.map((order) => [order.id, order])).values()];
    const fresh = this.initialized ? snapshot.filter((order) => order.bucket === "available" && !this.known.has(order.id)) : [];
    for (const order of snapshot) this.known.add(order.id);
    this.initialized = true;
    return fresh;
  }
  ids() { return [...this.known]; }
}
export function readSeenIds(serialized: string | null): string[] {
  try {
    const parsed = JSON.parse(serialized ?? "null");
    return parsed?.version === 1 && Array.isArray(parsed.ids) ? parsed.ids.filter((id: unknown) => typeof id === "string") : [];
  } catch { return []; }
}
export function canRefreshBoard(visible: boolean, pending: boolean, claiming: boolean) {
  return visible && !pending && !claiming;
}
/** Original short sine chime; audio is created/resumed only by a user gesture. */
export function createOrderChime(context: AudioContext) {
  let playingUntil = 0;
  return {
    async unlock() { await context.resume(); },
    play() {
      if (context.state !== "running" || context.currentTime < playingUntil) return false;
      const start = context.currentTime;
      playingUntil = start + 0.3;
      for (const [offset, frequency] of [[0, 880], [0.1, 1046]]) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine"; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start + offset);
        gain.gain.linearRampToValueAtTime(0.05, start + offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + offset + 0.16);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(start + offset); oscillator.stop(start + offset + 0.18);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      }
      return true;
    },
    close() { return context.close(); },
  };
}
