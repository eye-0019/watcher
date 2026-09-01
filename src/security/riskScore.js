const { pool } = require('../utils/db');

async function getRisk(userId) {
  const result = await pool.query(
    `SELECT risk FROM security_risk WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return 0;
  }

  return result.rows[0].risk;
}

async function addRisk(userId, amount) {
  const currentRisk = await getRisk(userId);

  const newRisk = Math.max(
    0,
    Math.min(100, currentRisk + amount)
  );

  await pool.query(
    `
    INSERT INTO security_risk (user_id, risk, updated_at)
    VALUES ($1, $2, now())
    ON CONFLICT (user_id)
    DO UPDATE SET
      risk = EXCLUDED.risk,
      updated_at = now()
    `,
    [userId, newRisk]
  );

  return newRisk;
}

async function removeRisk(userId, amount) {
  return addRisk(userId, -Math.abs(amount));
}

async function setRisk(userId, amount) {
  const newRisk = Math.max(
    0,
    Math.min(100, amount)
  );

  await pool.query(
    `
    INSERT INTO security_risk (user_id, risk, updated_at)
    VALUES ($1, $2, now())
    ON CONFLICT (user_id)
    DO UPDATE SET
      risk = EXCLUDED.risk,
      updated_at = now()
    `,
    [userId, newRisk]
  );

  return newRisk;
}

async function resetRisk(userId) {
  await pool.query(
    `DELETE FROM security_risk WHERE user_id = $1`,
    [userId]
  );

  return 0;
}

function getRiskLevel(risk) {
  if (risk >= 80) return 'critical';
  if (risk >= 60) return 'high';
  if (risk >= 40) return 'dangerous';
  if (risk >= 20) return 'suspicious';
  return 'normal';
}

module.exports = {
  getRisk,
  addRisk,
  removeRisk,
  setRisk,
  resetRisk,
  getRiskLevel
};
