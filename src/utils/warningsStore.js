const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'warnings.json');

function loadWarnings() {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveWarnings(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function addWarning(userId, warning) {
    const data = loadWarnings();
    if (!data[userId]) data[userId] = [];
    data[userId].push(warning);
    saveWarnings(data);
    return data[userId].length;
}

function getWarnings(userId) {
    const data = loadWarnings();
    return data[userId] || [];
}

function removeLastWarning(userId) {
    const data = loadWarnings();
    if (!data[userId] || data[userId].length === 0) return false;
    data[userId].pop();
    saveWarnings(data);
    return true;
}

module.exports = { addWarning, getWarnings, removeLastWarning };
