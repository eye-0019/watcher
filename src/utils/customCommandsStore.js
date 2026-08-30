const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'customCommands.json');

function loadCommands() {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveCommands(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function addCommand(keyword, response) {
    const data = loadCommands();
    data[keyword.toLowerCase()] = response;
    saveCommands(data);
}

function removeCommand(keyword) {
    const data = loadCommands();
    if (!(keyword.toLowerCase() in data)) return false;
    delete data[keyword.toLowerCase()];
    saveCommands(data);
    return true;
}

function getResponse(keyword) {
    const data = loadCommands();
    return data[keyword.toLowerCase()] || null;
}

function listCommands() {
    return loadCommands();
}

module.exports = { addCommand, removeCommand, getResponse, listCommands };
