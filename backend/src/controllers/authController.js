import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Pointing to backend/data. 
// Since this file is in backend/controllers, we need to go up one level (..) to backend, then to data.
const DATA_DIR = path.join(__dirname, '..', 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const JWT_SECRET = process.env.JWT_SECRET || 'movie-rec-secret-key'

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadUsers() {
  ensureDataDir()
  if (!existsSync(USERS_FILE)) return []
  try {
    const raw = readFileSync(USERS_FILE, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  ensureDataDir()
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
}

function generateToken(user) {
  const payload = { id: user.id, email: user.email, name: user.name }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const signup = (req, res) => {
  try {
    const { name, email, password } = req.body || {}
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    const users = loadUsers()
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hashed = bcrypt.hashSync(password, 10)
    const nextId = users.length ? Math.max(...users.map((u) => u.id || 0)) + 1 : 1
    const user = { id: nextId, name, email, passwordHash: hashed, createdAt: new Date().toISOString() }
    users.push(user)
    saveUsers(users)

    const token = generateToken(user)
    const { passwordHash, ...safeUser } = user
    res.status(201).json({ user: safeUser, token })
  } catch (err) {
    console.error('Error in POST /auth/signup', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const login = (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const users = loadUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const ok = bcrypt.compareSync(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user)
    const { passwordHash, ...safeUser } = user
    res.json({ user: safeUser, token })
  } catch (err) {
    console.error('Error in POST /auth/login', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getMe = (req, res) => {
  try {
    const authHeader = req.headers.authorization || ''
    const [, token] = authHeader.split(' ')
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization header' })
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET)
      const users = loadUsers()
      const user = users.find((u) => u.id === payload.id)
      if (!user) {
        return res.status(401).json({ error: 'User not found' })
      }
      const { passwordHash, ...safeUser } = user
      res.json({ user: safeUser })
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  } catch (err) {
    console.error('Error in GET /auth/me', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
