const pool = require('./db');

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS business_cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        template_id INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        slug VARCHAR(255) UNIQUE NOT NULL,
        data JSONB NOT NULL,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица business_cards создана');
  } catch (err) {
    console.error('Ошибка:', err.message);
  } finally {
    pool.end();
  }
};

createTable();