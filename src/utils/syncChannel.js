/**
 * SYNC CHANNEL — keeps the /host window and the /play window in step.
 *
 * First choice: BroadcastChannel. Instant, no internet, no server.
 * Fallback: write the message to localStorage; other windows in the same
 * browser get a `storage` event. Slightly less tidy, works everywhere.
 *
 * Both routes stay on one laptop. Venue Wi-Fi is never involved.
 */

import { settings } from '../data/settings.js';

const FALLBACK_KEY = settings.syncChannelName + '-message';

export function createSyncChannel(onMessage) {
  let channel = null;
  let closed = false;

  const handleData = (data) => {
    if (closed || !data) return;
    onMessage(data);
  };

  // ── Preferred route ──────────────────────────────────────────────
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(settings.syncChannelName);
      channel.onmessage = (event) => handleData(event.data);
    } catch (error) {
      // Some locked-down browsers throw here. Fall through to localStorage.
      channel = null;
    }
  }

  // ── Fallback route (also runs as a safety net alongside the channel) ──
  const onStorage = (event) => {
    if (event.key !== FALLBACK_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue);
      handleData(parsed.payload);
    } catch (error) {
      // Ignore anything unparseable rather than crashing the show.
    }
  };
  window.addEventListener('storage', onStorage);

  return {
    /** True when the fast route is in use — shown on the host panel. */
    usingBroadcastChannel: Boolean(channel),

    post(message) {
      if (closed) return;
      if (channel) {
        try {
          channel.postMessage(message);
          return;
        } catch (error) {
          // Fall through to localStorage below.
        }
      }
      try {
        // The random part guarantees the value changes, so the event always fires.
        localStorage.setItem(
          FALLBACK_KEY,
          JSON.stringify({ at: Date.now(), tag: Math.random(), payload: message })
        );
      } catch (error) {
        // Private-browsing mode can block writes. The game still runs in
        // one window; only cross-window sync is lost.
      }
    },

    close() {
      closed = true;
      window.removeEventListener('storage', onStorage);
      if (channel) {
        try {
          channel.close();
        } catch (error) {
          // Nothing useful to do.
        }
      }
    },
  };
}
