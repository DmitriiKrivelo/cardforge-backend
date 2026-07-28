const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { authenticateToken, isAdmin } = require('./auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { findEmployeeByFullName } = require('./employeeService');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Только изображения (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = 'cardforge-secret-key-change-me';

app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name || null]
    );

    const user = result.rows[0];

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({
      message: 'Регистрация успешна',
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    const result = await pool.query('SELECT id, email, name, password_hash FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({
      message: 'Вход выполнен',
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/cards', authenticateToken, async (req, res) => {
  const { title, templateId, data } = req.body;
  const userId = req.userId;

  data.website = 'https://agroeco.taplink.ws/';
  data.company = 'ГК АГРОЭКО';

  if (!title || !data) {
    return res.status(400).json({ error: 'Название и данные визитки обязательны' });
  }

  try {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO business_cards (user_id, title, template_id, slug, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, slug, is_active, data, views`,
      [userId, title, templateId || 1, slug, data]
    );

    res.json({ message: 'Визитка создана', card: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/cards', authenticateToken, async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT id, title, slug, is_active, views, created_at, updated_at FROM business_cards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/cards/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, title, data, views, user_id, template_id FROM business_cards WHERE slug = $1 AND is_active = true',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Визитка не найдена' });
    }

    await pool.query('UPDATE business_cards SET views = views + 1 WHERE slug = $1', [slug]);

    const updated = await pool.query(
      'SELECT id, title, data, views, user_id, template_id FROM business_cards WHERE slug = $1',
      [slug]
    );

    const cardId = updated.rows[0].id;
    await pool.query(
      'INSERT INTO card_views (card_id, user_id) VALUES ($1, $2)',
      [cardId, req.userId || null]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/cards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, templateId, data, isActive } = req.body;
  const userId = req.userId;

  if (data) {
    delete data.website;
    delete data.company;
  }

  try {
    const card = await pool.query('SELECT id FROM business_cards WHERE id = $1 AND user_id = $2', [id, userId]);
    if (card.rows.length === 0) {
      return res.status(404).json({ error: 'Визитка не найдена или доступ запрещён' });
    }

    await pool.query(
      `UPDATE business_cards 
       SET title = COALESCE($1, title),
           template_id = COALESCE($2, template_id),
           data = COALESCE($3, data),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [title, templateId, data, isActive, id]
    );

    res.json({ message: 'Визитка обновлена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/cards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query('DELETE FROM business_cards WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Визитка не найдена или доступ запрещён' });
    }
    res.json({ message: 'Визитка удалена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

const QRCode = require('qrcode');

app.get('/api/cards/:slug/qr', async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query('SELECT id FROM business_cards WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Визитка не найдена' });
    }

    const cardUrl = `${req.protocol}://${req.get('host')}/api/cards/${slug}`;
    
    const qrBuffer = await QRCode.toBuffer(cardUrl);
    
    res.setHeader('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка генерации QR-кода' });
  }
});

app.get('/api/cards/id/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT id, title, template_id, data, is_active FROM business_cards WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Визитка не найдена' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/stats'/*, authenticateToken, isAdmin*/, async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const cardsCount = await pool.query('SELECT COUNT(*) FROM business_cards');
    const totalViews = await pool.query('SELECT SUM(views) FROM business_cards');

    res.json({
      users: parseInt(usersCount.rows[0].count),
      cards: parseInt(cardsCount.rows[0].count),
      totalViews: parseInt(totalViews.rows[0].sum || 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  console.log('=== ЗАПРОС /api/admin/users ===');
  console.log('req.userId:', req.userId);
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const currentAdminId = req.userId;

  console.log('[ROLE] Изменение роли user', id, 'на', role);

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Некорректная роль' });
  }

  if (parseInt(id) === currentAdminId) {
    return res.status(403).json({ 
      error: 'Запрещено изменять свою собственную роль. Попросите другого администратора сделать это.' 
    });
  }

  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    console.log('[ROLE] Успешно');
    res.json({ message: 'Роль обновлена' });
  } catch (err) {
    console.error('[ROLE] ОШИБКА:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/cards', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bc.id, bc.title, bc.slug, bc.views, bc.is_active, bc.created_at,
              u.email as user_email, u.name as user_name
       FROM business_cards bc
       JOIN users u ON bc.user_id = u.id
       ORDER BY bc.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/templates', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description, preview_url, data, layout_type, is_active, created_at, updated_at FROM templates ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description, preview_url, data, layout_type FROM templates WHERE is_active = true');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/templates', authenticateToken, isAdmin, async (req, res) => {
  const { name, description, preview_url, data } = req.body;
  console.log('[TEMPLATES] Создание шаблона:', name);

  if (!name || !data) {
    return res.status(400).json({ error: 'Название и данные шаблона обязательны' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO templates (name, description, preview_url, data) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description || null, preview_url || null, data]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[TEMPLATES] Ошибка:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/templates/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, preview_url, data, is_active } = req.body;
  console.log('[TEMPLATES] Обновление шаблона:', id);

  try {
    const result = await pool.query(
      `UPDATE templates 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           preview_url = COALESCE($3, preview_url),
           data = COALESCE($4, data),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, description, preview_url, data, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[TEMPLATES] Ошибка:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/templates/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  console.log('[TEMPLATES] Удаление шаблона:', id);

  try {
    const result = await pool.query('DELETE FROM templates WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }
    res.json({ message: 'Шаблон удалён' });
  } catch (err) {
    console.error('[TEMPLATES] Ошибка:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/upload/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    const avatarUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/uploads/:filename', (req, res) => {
  const filepath = path.join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'Файл не найден' });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, name, layout_type, data FROM templates WHERE id = $1 AND is_active = true', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description, preview_url, data, layout_type FROM templates WHERE is_active = true');
    console.log('Шаблоны загружены:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка загрузки шаблонов:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload/preview', authenticateToken, isAdmin, (req, res) => {
  upload.single('preview')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' })
    const previewUrl = `http://localhost:3000/uploads/${req.file.filename}`
    res.json({ previewUrl })
  })
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'CardForge backend is running!' });
});

app.get('/api/reports/data', authenticateToken, async (req, res) => {
    const userId = req.userId;
    const { cardIds, dateFrom, dateTo } = req.query;

    let cardIdArray = [];
    if (cardIds && cardIds !== 'all') {
        cardIdArray = cardIds.split(',').map(Number);
        const check = await pool.query('SELECT id FROM business_cards WHERE id = ANY($1) AND user_id = $2', [cardIdArray, userId]);
        if (check.rows.length !== cardIdArray.length) {
            return res.status(403).json({ error: 'Некоторые визитки не принадлежат вам' });
        }
    } else {
        const cards = await pool.query('SELECT id FROM business_cards WHERE user_id = $1', [userId]);
        cardIdArray = cards.rows.map(r => r.id);
    }

    if (cardIdArray.length === 0) return res.json([]);

    let query = `
      SELECT 
          cv.card_id, 
          bc.title AS card_title, 
          u.email AS user_email,
          cv.viewed_at
      FROM card_views cv
      JOIN business_cards bc ON cv.card_id = bc.id
      JOIN users u ON bc.user_id = u.id
      WHERE cv.card_id = ANY($1)
    `;
    const params = [cardIdArray];
    let paramIndex = 2;
    if (dateFrom) { query += ` AND cv.viewed_at >= $${paramIndex}`; params.push(dateFrom); paramIndex++; }
    if (dateTo) { query += ` AND cv.viewed_at <= $${paramIndex}`; params.push(dateTo); paramIndex++; }
    query += ' ORDER BY cv.viewed_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
});

app.get('/api/admin/reports/data', authenticateToken, isAdmin, async (req, res) => {
  const { cardIds, dateFrom, dateTo } = req.query;

  console.log('Запрос отчёта (админ):', req.query);
  try {
    const { cardIds, dateFrom, dateTo } = req.query;
    console.log('cardIds:', cardIds);
    console.log('dateFrom:', dateFrom);
    console.log('dateTo:', dateTo);

    let cardIdArray = [];
    if (cardIds && cardIds !== 'all') {
      cardIdArray = cardIds.split(',').map(Number);
  } else {
      const cards = await pool.query('SELECT id FROM business_cards');
      cardIdArray = cards.rows.map(r => r.id);
  }

    if (cardIdArray.length === 0) return res.json([]);

    let query = `
      SELECT 
          cv.card_id, 
          bc.title AS card_title, 
          u.email AS user_email,
          cv.viewed_at
      FROM card_views cv
      JOIN business_cards bc ON cv.card_id = bc.id
      JOIN users u ON bc.user_id = u.id
      WHERE cv.card_id = ANY($1)
    `;
    const params = [cardIdArray];
    let paramIndex = 2;
    if (dateFrom) { query += ` AND cv.viewed_at >= $${paramIndex}`; params.push(dateFrom); paramIndex++; }
    if (dateTo) { query += ` AND cv.viewed_at <= $${paramIndex}`; params.push(dateTo); paramIndex++; }
    query += ' ORDER BY cv.viewed_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);

    } catch (err) {
    console.error('Ошибка в /api/admin/reports/data:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/user-stats', authenticateToken, isAdmin, async (req, res) => {
  const { dateFrom, dateTo } = req.query;

  try {
    let query = `
      SELECT 
        u.id,
        u.email,
        u.name,
        COUNT(bc.id) as card_count
      FROM users u
      LEFT JOIN business_cards bc ON u.id = bc.user_id
    `;
    const params = [];
    let paramIndex = 1;

    if (dateFrom && dateTo) {
      query += ` AND bc.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(dateFrom, dateTo);
      paramIndex += 2;
    }

    query += ` GROUP BY u.id, u.email, u.name ORDER BY card_count DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения статистики:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});