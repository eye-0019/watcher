const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'xp.json');
const COOLDOWN_MS = 60 * 1000; // 1 minute between XP gains, prevents spam-leveling
const XP_MIN = 15;
const XP_MAX = 25;

function loadXp() {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveXp(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function xpForLevel(level) {
    // XP required to reach the next level, scales up over time
    return 5 * (level ** 2) + 50 * level + 100;
}

function getUser(userId) {
    const data = loadXp();
    return data[userId] || { xp: 0, level: 0, lastMessageAt: 0 };
}

// Adds XP for a message, respecting cooldown. Returns { leveledUp, newLevel } or null if on cooldown.
function addMessageXp(userId) {
    const data = loadXp();
    const user = data[userId] || { xp: 0, level: 0, lastMessageAt: 0 };

    const now = Date.now();
    if (now - user.lastMessageAt < COOLDOWN_MS) return null;

    user.lastMessageAt = now;
    user.xp += Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;

    let leveledUp = false;
    while (user.xp >= xpForLevel(user.level)) {
        user.xp -= xpForLevel(user.level);
        user.level += 1;
        leveledUp = true;
    }

    data[userId] = user;
    saveXp(data);

    return { leveledUp, newLevel: user.level };
}

function getLeaderboard(limit = 10) {
    const data = loadXp();
    return Object.entries(data)
        .map(([userId, u]) => ({ userId, ...u }))
        .sort((a, b) => (b.level - a.level) || (b.xp - a.xp))
        .slice(0, limit);
}

module.exports = { getUser, addMessageXp, getLeaderboard, xpForLevel };
