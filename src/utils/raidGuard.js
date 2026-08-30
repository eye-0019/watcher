// Detects rapid bursts of joins and flags a temporary "raid" window during which
// brand-new accounts get auto-kicked.

const JOIN_LIMIT = 8;
const WINDOW_MS = 15 * 1000; // 15 seconds
const RAID_ACTIVE_MS = 2 * 60 * 1000; // stay in raid mode for 2 min after triggering
const MIN_ACCOUNT_AGE_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

const joinHistory = new Map(); // guildId -> array of timestamps
const raidUntil = new Map(); // guildId -> timestamp raid mode ends

// Call on every join. Returns true the moment a raid is newly detected (for alerting).
function recordJoin(guildId) {
    const now = Date.now();
    const timestamps = (joinHistory.get(guildId) || []).filter(t => now - t < WINDOW_MS);
    timestamps.push(now);
    joinHistory.set(guildId, timestamps);

    if (timestamps.length >= JOIN_LIMIT) {
        const alreadyActive = isRaidActive(guildId);
        raidUntil.set(guildId, now + RAID_ACTIVE_MS);
        joinHistory.set(guildId, []); // reset so it doesn't re-trigger every subsequent join
        return !alreadyActive;
    }
    return false;
}

function isRaidActive(guildId) {
    const until = raidUntil.get(guildId);
    return !!until && Date.now() < until;
}

function isAccountTooNew(user) {
    return Date.now() - user.createdTimestamp < MIN_ACCOUNT_AGE_MS;
}

module.exports = { recordJoin, isRaidActive, isAccountTooNew };
