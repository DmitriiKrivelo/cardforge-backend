const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seedData() {
  try {
    console.log('Наполнение базы данных...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    await pool.query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES 
        ('admin@cardforge.com', $1, 'Администратор', 'admin'),
        ('user1@example.com', $1, 'Иван Петров', 'user'),
        ('user2@example.com', $1, 'Елена Смирнова', 'user')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);
    console.log('Пользователи добавлены');

    const users = await pool.query('SELECT id, email FROM users');
    const userMap = {};
    users.rows.forEach(u => { userMap[u.email] = u.id; });

    const testCards = [
      {
        user_id: userMap['admin@cardforge.com'],
        title: 'CEO CardForge',
        slug: 'ceo-cardforge',
        data: {
          name: 'Дмитрий',
          position: 'CEO & Founder',
          company: 'CardForge',
          phone: '+7 999 123-45-67',
          email: 'dmitry@cardforge.com',
          website: 'https://cardforge.com',
          linkedin: 'dmitry',
          telegram: '@dmitry'
        }
      },
      {
        user_id: userMap['user1@example.com'],
        title: 'Маркетолог',
        slug: 'marketing-expert',
        data: {
          name: 'Иван Петров',
          position: 'Head of Marketing',
          company: 'CardForge',
          phone: '+7 999 234-56-78',
          email: 'ivan@cardforge.com',
          website: 'https://cardforge.com',
          linkedin: 'ivan-petrov',
          telegram: '@ivan_p'
        }
      },
      {
        user_id: userMap['user2@example.com'],
        title: 'Разработчик',
        slug: 'fullstack-dev',
        data: {
          name: 'Елена Смирнова',
          position: 'Senior Developer',
          company: 'CardForge',
          phone: '+7 999 345-67-89',
          email: 'elena@cardforge.com',
          website: 'https://github.com/elena',
          linkedin: 'elena-smirnova',
          telegram: '@elena_dev'
        }
      }
    ];

    for (const card of testCards) {
      if (card.user_id) {
        await pool.query(`
          INSERT INTO business_cards (user_id, title, slug, data, views, is_active)
          VALUES ($1, $2, $3, $4, floor(random() * 100 + 1), true)
          ON CONFLICT (slug) DO NOTHING
        `, [card.user_id, card.title, card.slug, card.data]);
      }
    }
    console.log('Визитки добавлены');

    console.log('\nГотово!');
    console.log('\nДля входа:');
    console.log('   Админ: admin@cardforge.com / 123456');
    console.log('   Пользователь: user1@example.com / 123456');
    
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

seedData();