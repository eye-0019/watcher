// In-memory spam tracker: message timestamps per user, per guild.
// Resets automatically since old timestamps age out of the window.

const MSG_LIMIT = 8;
const WINDOW_MS = 6 * 1000; // 6 seconds
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minute timeout when triggered
const COOLDOWN_MS = 30 * 1000; // once triggered, don't fire again on this person for 30 sec

const history = new Map(); // key: `${guildId}:${userId}` -> array of timestamps
const lastTriggered = new Map(); // key: `${guildId}:${userId}` -> timestamp of last trigger

// Returns true if this message should trigger the anti-spam action.
function trackMessage(guildId, userId) {
    const key = `${guildId}:${userId}`;
    const now = Date.now();

    // Already triggered recently — still spam, but don't re-fire the timeout/callout
    const lastTrigger = lastTriggered.get(key);
    if (lastTrigger && now - lastTrigger < COOLDOWN_MS) return false;

    const timestamps = (history.get(key) || []).filter(t => now - t < WINDOW_MS);
    timestamps.push(now);
    history.set(key, timestamps);

    if (timestamps.length >= MSG_LIMIT) {
        history.delete(key);
        lastTriggered.set(key, now);
        return true;
    }
    return false;
}

module.exports = { trackMessage, TIMEOUT_MS };
