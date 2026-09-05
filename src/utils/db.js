const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS warnings (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      reason TEXT,
      moderator TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS xp (
      user_id TEXT PRIMARY KEY,
      xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 0,
      last_message_at BIGINT NOT NULL DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS custom_commands (
      keyword TEXT PRIMARY KEY,
      response TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reaction_roles (
      message_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      role_id TEXT NOT NULL,
      PRIMARY KEY (message_id, emoji)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dm_tickets (
      user_id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL UNIQUE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rating_counts (
      category TEXT NOT NULL,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      count INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (category, message_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rating_holders (
      category TEXT PRIMARY KEY,
      user_id TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leaderboard_messages (
      kind TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      message_id TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_messages (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_user_notes (
      user_id TEXT PRIMARY KEY,
      notes TEXT,
      profile JSONB DEFAULT '{}'::jsonb,
      personality JSONB DEFAULT '{}'::jsonb,
      projects JSONB DEFAULT '{}'::jsonb,
      importance INTEGER DEFAULT 0,
      exchange_count INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    ALTER TABLE ai_user_notes
    ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS personality JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS importance INTEGER DEFAULT 0;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS security_risk (
      user_id TEXT PRIMARY KEY,
      risk INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // Advanced logging system
  await pool.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,

      guild_id TEXT NOT NULL,

      event_type TEXT NOT NULL,
      action TEXT NOT NULL,

      target_id TEXT,
      executor_id TEXT,

      channel_id TEXT,

      description TEXT,

      metadata JSONB DEFAULT '{}'::jsonb,

      severity TEXT DEFAULT 'normal',

      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

module.exports = { pool, initDb };
