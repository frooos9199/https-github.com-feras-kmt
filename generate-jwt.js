const jwt = require('jsonwebtoken');
const payload = {
  id: 'cmia59i4w0000jy1oz93kx0zu', // ID الأدمن
  email: 'admin@kmt.kw',
  role: 'admin'
};
const secret = 'dev-secret-key'; // نفس JWT_SECRET في Vercel
const token = jwt.sign(payload, secret, { expiresIn: '7d' });
console.log(token);
