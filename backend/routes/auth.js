import { Router } from 'express'
import { signup, login, getMe } from '../controllers/authController.js'

const router = Router()

// POST /api/auth/signup
router.post('/auth/signup', signup)

// POST /api/auth/login
router.post('/auth/login', login)

// GET /api/auth/me
router.get('/auth/me', getMe)

export default router


