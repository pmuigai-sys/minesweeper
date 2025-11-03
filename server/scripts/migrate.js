import { initializeDatabase } from '../models/db.js'

await initializeDatabase()
console.log('Database migrations executed successfully')
process.exit(0)
