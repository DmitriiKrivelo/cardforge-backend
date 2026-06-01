const jwt = require('jsonwebtoken');
const pool = require('./db');

const JWT_SECRET = 'cardforge-secret-key-change-me';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Доступ запрещён. Нет токена.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Неверный или просроченный токен' });
  }
}

function isAdmin(req, res, next) {
  const userId = req.userId;
  console.log('isAdmin: проверка пользователя', userId);

  pool.query('SELECT role FROM users WHERE id = $1', [userId])
    .then(result => {
      console.log('isAdmin: результат', result.rows);
      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Доступ запрещён. Пользователь не найден.' });
      }
      if (result.rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещён. Требуются права администратора.' });
      }
      console.log('isAdmin: доступ разрешён');
      next();
    })
    .catch(err => {
      console.error('isAdmin ошибка:', err);
      res.status(500).json({ error: 'Ошибка проверки прав' });
    });
}

module.exports = { authenticateToken, isAdmin };