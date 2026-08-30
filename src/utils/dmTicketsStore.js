const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'dmTickets.json');

function loadData() {
    if (!fs.existsSync(filePath)) return { byUser: {}, byChannel: {} };
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function setTicket(userId, channelId) {
    const data = loadData();
    data.byUser[userId] = channelId;
    data.byChannel[channelId] = userId;
    saveData(data);
}

function getChannelForUser(userId) {
    const data = loadData();
    return data.byUser[userId] || null;
}

function getUserForChannel(channelId) {
    const data = loadData();
    return data.byChannel[channelId] || null;
}

module.exports = { setTicket, getChannelForUser, getUserForChannel };
