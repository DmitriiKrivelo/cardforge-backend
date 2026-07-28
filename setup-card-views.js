const pool = require('./db');

async function setupCardViews() {
  console.log('🔄 Настройка таблицы card_views...');

  try {
    // 1. Создаём таблицу, если её нет
    await pool.query(`
      CREATE TABLE IF NOT EXISTS card_views (
        id SERIAL PRIMARY KEY,
        card_id INTEGER NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Таблица card_views создана (или уже существует)');

    // 2. Проверяем, есть ли уже данные
    const countResult = await pool.query('SELECT COUNT(*) FROM card_views');
    const existingCount = parseInt(countResult.rows[0].count);

    if (existingCount > 0) {
      console.log(`ℹ️ В таблице уже есть ${existingCount} записей. Пропускаем добавление тестовых данных.`);
      process.exit(0);
    }

    // 3. Получаем список всех визиток
    const cardsResult = await pool.query('SELECT id FROM business_cards');
    const cardIds = cardsResult.rows.map(row => row.id);

    if (cardIds.length === 0) {
      console.log('⚠️ Нет ни одной визитки. Сначала создайте визитки через сайт.');
      process.exit(0);
    }

    console.log(`📊 Найдено визиток: ${cardIds.length}`);

    // 4. Генерируем тестовые просмотры за последние 30 дней
    const testData = [];
    const now = new Date();

    for (const cardId of cardIds) {
      // Количество просмотров для каждой визитки (от 3 до 20)
      const viewsCount = Math.floor(Math.random() * 18) + 3;

      for (let i = 0; i < viewsCount; i++) {
        // Случайная дата в пределах последних 30 дней
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        
        const viewDate = new Date(now);
        viewDate.setDate(viewDate.getDate() - daysAgo);
        viewDate.setHours(viewDate.getHours() - hoursAgo);
        viewDate.setMinutes(viewDate.getMinutes() - minutesAgo);

        testData.push({
          card_id: cardId,
          viewed_at: viewDate.toISOString(),
          user_id: null // можно оставить NULL или добавить случайного пользователя
        });
      }
    }

    console.log(`🔄 Добавление ${testData.length} тестовых просмотров...`);

    // 5. Вставляем данные пачками по 100 записей для скорости
    const batchSize = 100;
    for (let i = 0; i < testData.length; i += batchSize) {
      const batch = testData.slice(i, i + batchSize);
      const values = batch.map((_, index) => 
        `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
      ).join(', ');

      const flatParams = batch.flatMap(item => [
        item.card_id,
        item.viewed_at,
        item.user_id
      ]);

      await pool.query(
        `INSERT INTO card_views (card_id, viewed_at, user_id) VALUES ${values}`,
        flatParams
      );
    }

    console.log('✅ Тестовые данные успешно добавлены!');

    // 6. Показываем статистику
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT card_id) as cards_with_views
      FROM card_views
    `);
    console.log(`📊 Статистика: ${statsResult.rows[0].total_views} просмотров, ${statsResult.rows[0].cards_with_views} визиток имеют просмотры`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

setupCardViews();