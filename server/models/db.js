import fs from 'fs'
import path from 'path'
import sqlite3 from 'sqlite3'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import config from '../config/config.js'

sqlite3.verbose()

const dbDirectory = path.dirname(config.dbPath)
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true })
}

const database = new sqlite3.Database(config.dbPath)

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    database.run(sql, params, function callback(err) {
      if (err) {
        reject(err)
      } else {
        resolve(this)
      }
    })
  })

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })

export const initializeDatabase = async () => {
  await run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'voter',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`)

  await run(`CREATE TABLE IF NOT EXISTS elections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`)

  await run(`CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      election_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      bio TEXT,
      photo_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (election_id) REFERENCES elections (id) ON DELETE CASCADE
    )`)

  await run(`CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      election_id INTEGER NOT NULL,
      candidate_id INTEGER NOT NULL,
      voter_hash TEXT NOT NULL,
      block_hash TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (election_id) REFERENCES elections (id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE,
      UNIQUE (user_id, election_id)
    )`)

  await run(`CREATE TABLE IF NOT EXISTS blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block_index INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      hash TEXT NOT NULL,
      previous_hash TEXT NOT NULL,
      nonce INTEGER NOT NULL,
      data TEXT NOT NULL
    )`)

  await seedAdmin()
}

const seedAdmin = async () => {
  const adminEmail = 'admin@kabarak.ac.ke'
  const admin = await get('SELECT id FROM users WHERE email = ?', [adminEmail])
  if (admin) return

  const passwordHash = await bcrypt.hash('Admin@123', config.bcryptRounds)
  await run(
    `INSERT INTO users (uuid, name, email, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'System Administrator', adminEmail, passwordHash, 'admin'],
  )
  console.log('Seeded default admin account (admin@kabarak.ac.ke / Admin@123)')
}

export { database as db, run, get, all }
