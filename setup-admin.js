const pool = require('./db');

async function setupAdmin() {
  try {
    console.log('Добавление поля role...');
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        END IF;
      END $$;
    `);
    console.log('Поле role добавлено');

    console.log('Создание таблицы saved_contacts...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_contacts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        card_id INTEGER NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, card_id)
      )
    `);
    console.log('Таблица saved_contacts создана');

    const adminEmail = 'krivelodmitry@gmail.com';
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role',
      ['admin', adminEmail]
    );

    if (result.rows.length > 0) {
      console.log(`Пользователь ${adminEmail} назначен администратором`);
      console.log(`   ID: ${result.rows[0].id}, Роль: ${result.rows[0].role}`);
    } else {
      console.log(`Пользователь с email ${adminEmail} не найден. Сначала пройдите регистрацию на сайте.`);
    }

    console.log('\nГотово! Перезапусти сервер: npm run dev');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

setupAdmin();