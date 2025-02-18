import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

const router = express.Router();

router.use(cookieParser());

const authenticateMiddleware = (req, res, next) => {
  const { method, cubySession } = req.body;
  console.log(req.body);
  console.log(req.method);

  if (!cubySession) { 
    console.log('no token');
    return res.status(401).json({ error: 'Unauthorized - Token missing' });
  }

  console.log(cubySession);

  if (method) {
    req.method = method.toUpperCase();
  }

  delete req.body.token;

  const secretKey = process.env.SECRET_KEY || 'your-secret-key';

  jwt.verify(cubySession, secretKey, (err, decoded) => {
    if (err) {
      console.log('invalid token');
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    console.log(decoded);
    // Attach the user ID to the request body
    req.body.userId = decoded.userId;
    next();
  });
};

const authProxy = createProxyMiddleware({
  target: process.env.AUTH_URL || 'http://auth-ms:3013',
  changeOrigin: true,
  onProxyReq: fixRequestBody,
  onProxyRes: (proxyRes, req, res) => {
    const userId = proxyRes.headers['x-user-id'];
    console.log(userId);

    if (userId) {
      const secretKey = process.env.SECRET_KEY || 'your-secret-key';
      const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
      console.log(token);
      const responseBody = {
        token,
      };

      res.end(JSON.stringify(responseBody));
    }
  },
});

const eventProxy = createProxyMiddleware({
  target: process.env.EVENTS_URL || 'http://events-ms:3010' ,
  changeOrigin: true,
  onProxyReq: fixRequestBody,
});

const calendarProxy = createProxyMiddleware({
  target: process.env.CALENDAR_URL || 'http://calendar-ms:3015' ,
  changeOrigin: true,
  onProxyReq: fixRequestBody,
});

const profileProxy = createProxyMiddleware({
  target: process.env.PROFILES_URL || 'http://profiles-ms:3012',
  changeOrigin: true,
  onProxyReq: fixRequestBody,
});

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.use(cors());

router.get('/logout', (req, res) => {
  res.redirect('http://localhost:5173');
});

router.use('/auth', cors(), authProxy);
router.use('/events', authenticateMiddleware, cors(), eventProxy);
router.use('/profiles', authenticateMiddleware, cors(), profileProxy);
router.use('/calendar', authenticateMiddleware, cors(), calendarProxy);

export default router;
