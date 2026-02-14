import { Router } from 'express';
import { signup, login, getMe } from '../controllers/authController.js';

const router = Router();

// POST /signup
router.post('/signup', signup);

// POST /login
router.post('/login', login);

// GET /me
router.get('/me', getMe);

export default router;


