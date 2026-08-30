// In-memory spam tracker: message timestamps per user, per guild.
// Resets automatically since old timestamps age out of the window.

const MSG_LIMIT = 7;
const WINDOW_MS = 7 * 1000; // 7 seconds
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minute timeout when triggered

const history = new Map(); // key: `${guildId}:${userId}` -> array of timestamps

// Returns true if this message pushed the user over the spam limit.
function trackMessage(guildId, userId) {
    const key = `${guildId}:${userId}`;
    const now = Date.now();
    const timestamps = (history.get(key) || []).filter(t => now - t < WINDOW_MS);
    timestamps.push(now);
    history.set(key, timestamps);

    if (timestamps.length >= MSG_LIMIT) {
        history.delete(key); // reset after triggering so it doesn't re-trigger every message
        return true;
    }
    return false;
}

module.exports = { trackMessage, TIMEOUT_MS };
