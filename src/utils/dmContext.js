const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'dmContext.json');

function loadContext() {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveContext(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function setDmContext(userId, guildId) {
    const data = loadContext();
    data[userId] = guildId;
    saveContext(data);
}

function getDmContext(userId) {
    const data = loadContext();
    return data[userId];
}

module.exports = { setDmContext, getDmContext };
