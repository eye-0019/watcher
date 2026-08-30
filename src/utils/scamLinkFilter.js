// Simple pattern-based scam/phishing link detector.
// Not exhaustive — catches the common Discord Nitro / Steam / IP-grabber scam patterns.

const SCAM_PATTERNS = [
    /discord-?nitro/i,
    /dlscord/i,
    /discorcl/i,
    /discocrd/i,
    /discrod/i,
    /steamcommunlty/i,
    /steamcommunity\.com\.[a-z]/i, // fake TLD after the real-looking domain
    /steampowereda/i,
    /telegram-?airdrop/i,
    /free-?nitro/i,
    /nitro-?generator/i,
    /grabify\.link/i,
    /iplogger\.(org|com|ru)/i,
    /2no\.co/i,
    /yip\.su/i,
    /gyazo\.im/i, // fake gyazo IP-grabber clone (real one is gyazo.com)
];

function isScamLink(content) {
    if (!content) return false;
    return SCAM_PATTERNS.some(pattern => pattern.test(content));
}

module.exports = { isScamLink };
