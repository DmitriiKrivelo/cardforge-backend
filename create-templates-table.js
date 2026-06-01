const pool = require('./db');

async function createTemplatesTable() {
  console.log('Создание таблицы templates...');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        preview_url VARCHAR(255),
        data JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Таблица templates создана');

    const checkResult = await pool.query('SELECT COUNT(*) FROM templates');
    const count = parseInt(checkResult.rows[0].count);

    if (count === 0) {
      console.log('Добавление стандартных шаблонов...');

      await pool.query(`
        INSERT INTO templates (name, description, preview_url, data, is_active) VALUES
        ('Минималистичный', 
         'Простой и элегантный дизайн. Подходит для любых профессий.', 
         null,
         '{"primaryColor": "#3b82f6", "secondaryColor": "#f3f4f6", "font": "system-ui", "layout": "minimal"}',
         true),
        
        ('Корпоративный', 
         'Строгий деловой стиль. Идеально для бизнеса и официальных встреч.', 
         null,
         '{"primaryColor": "#1e293b", "secondaryColor": "#e2e8f0", "font": "system-ui", "layout": "corporate"}',
         true),
        
        ('Социальные сети', 
         'Акцент на социальные сети и современный стиль.', 
         null,
         '{"primaryColor": "#8b5cf6", "secondaryColor": "#ede9fe", "font": "system-ui", "layout": "social"}',
         true)
      `);
      console.log('Добавлено 3 стандартных шаблона');
    } else {
      console.log(`В таблице уже есть ${count} шаблонов. Стандартные не добавлены.`);
    }

    console.log('\nГотово!');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

createTemplatesTable();