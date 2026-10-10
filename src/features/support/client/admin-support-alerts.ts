export type AdminSupportAlert = { id: string; conversationId: string; messageId: string; body: string; visitorLabel: string; createdAt: string };

export class SupportAlertTracker {
  private seen = new Set<string>();
  private initialized = false;
  seed(ids: string[]) { for (const id of ids) this.seen.add(id); }
  observe(alerts: AdminSupportAlert[]) {
    const fresh = this.initialized ? alerts.filter((alert) => !this.seen.has(alert.id)) : [];
    for (const alert of alerts) this.seen.add(alert.id);
    this.initialized = true;
    return fresh;
  }
  ids(limit = 500) { return [...this.seen].slice(-limit); }
  reset() { this.seen.clear(); this.initialized = false; }
}

export function readSeenSupportAlertIds(serialized: string | null) {
  try {
    const value = JSON.parse(serialized ?? "null");
    return value?.version === 1 && Array.isArray(value.ids) ? value.ids.filter((id: unknown): id is string => typeof id === "string").slice(-500) : [];
  } catch { return []; }
}

export function supportConversationHref(conversationId: string) {
  return `/admin/support?conversation=${encodeURIComponent(conversationId)}`;
}

export function createSupportChime(context: AudioContext) {
  let playingUntil = 0;
  return {
    async unlock() { await context.resume(); },
    play() {
      if (context.state !== "running" || context.currentTime < playingUntil) return false;
      const start = context.currentTime;
      playingUntil = start + 0.28;
      for (const [offset, frequency] of [[0, 784], [0.09, 988]] as const) {
        const oscillator = context.createOscillator(); const gain = context.createGain();
        oscillator.type = "sine"; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start + offset); gain.gain.linearRampToValueAtTime(0.04, start + offset + 0.015); gain.gain.exponentialRampToValueAtTime(0.001, start + offset + 0.15);
        oscillator.connect(gain); gain.connect(context.destination); oscillator.start(start + offset); oscillator.stop(start + offset + 0.17);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      }
      return true;
    },
    close() { return context.close(); },
  };
}
