import express from 'express';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import dotenv from 'dotenv';

import {
  createUser,
  authenticateUser,
} from '../controllers/authController.mjs';

const router = express.Router();
router.use(cookieParser());

// POST register user and generate token
router.post('/auth/register/', createUser);

// POST authenticate user and generate token
router.post('/auth/login/', authenticateUser);

export default router;
