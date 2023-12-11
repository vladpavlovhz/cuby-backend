import express from 'express';
import cors from 'cors';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

const router = express.Router();

const authProxy = createProxyMiddleware({
  target: 'http://auth-ms:3013',
  changeOrigin: true,
  onProxyReq: fixRequestBody,
})
const eventProxy = createProxyMiddleware({
  target: 'http://events-ms:3010',
  changeOrigin: true,
  onProxyReq: fixRequestBody,
});

const profileProxy = createProxyMiddleware({
  target: 'http://profile-ms:3012',
  changeOrigin: true,
  onProxyReq: fixRequestBody,
});


router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.use('/users', cors(), authProxy);
router.use('/login', cors(), authProxy);
router.use('/register', cors(), authProxy);
router.use('/events', cors(), eventProxy);
router.use('/profiles', cors(), profileProxy);

export default router;
