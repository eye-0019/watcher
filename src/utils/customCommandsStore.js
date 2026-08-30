const { pool } = require('./db');

async function addCommand(keyword, response) {
    await pool.query(
        `INSERT INTO custom_commands (keyword, response) VALUES ($1, $2)
         ON CONFLICT (keyword) DO UPDATE SET response = $2`,
        [keyword.toLowerCase(), response]
    );
}

async function removeCommand(keyword) {
    const { rowCount } = await pool.query('DELETE FROM custom_commands WHERE keyword = $1', [keyword.toLowerCase()]);
    return rowCount > 0;
}

async function getResponse(keyword) {
    const { rows } = await pool.query('SELECT response FROM custom_commands WHERE keyword = $1', [keyword.toLowerCase()]);
    return rows.length ? rows[0].response : null;
}

async function listCommands() {
    const { rows } = await pool.query('SELECT keyword, response FROM custom_commands');
    const result = {};
    rows.forEach(r => { result[r.keyword] = r.response; });
    return result;
}

module.exports = { addCommand, removeCommand, getResponse, listCommands };
