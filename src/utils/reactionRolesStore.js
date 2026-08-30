const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'reactionRoles.json');

function loadData() {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Maps a messageId -> { emoji: roleId }
function addReactionRole(messageId, emoji, roleId) {
    const data = loadData();
    if (!data[messageId]) data[messageId] = {};
    data[messageId][emoji] = roleId;
    saveData(data);
}

function getRoleId(messageId, emoji) {
    const data = loadData();
    return data[messageId]?.[emoji] || null;
}

module.exports = { addReactionRole, getRoleId };
