# Kabarak Blockchain Voting System

Secure, transparent, and realtime election platform for Kabarak University. The solution couples a modern React frontend with a Node.js/Express backend that records every ballot on a proof-of-work blockchain persisted in SQLite.

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, React Router, Chart.js, Framer Motion, Socket.io client, React Toastify
- **Backend**: Node.js (ESM), Express 5, SQLite (sqlite3), Socket.io, JWT auth, bcrypt, CSRF protection
- **Blockchain**: Custom proof-of-work implementation with SHA-256 hashing, persisted ledger, integrity verification

## Project Structure

```
kabarak-voting-system/
??? client/                  # React frontend
?   ??? src/
?   ?   ??? components/      # Shared, admin, and user UI components
?   ?   ??? context/         # Auth + blockchain contexts
?   ?   ??? pages/           # Route views
?   ?   ??? services/        # Axios + socket helpers
?   ?   ??? styles/          # Tailwind entrypoint
?   ?   ??? utils/           # Storage helpers
?   ??? vite.config.js       # Dev server + proxy to backend
??? server/                  # Express API & blockchain engine
?   ??? config/              # Environment configuration
?   ??? controllers/         # Route handlers
?   ??? middleware/          # Auth, CSRF, and error handling
?   ??? models/              # SQLite access + Blockchain implementation
?   ??? routes/              # Express routers
?   ??? sockets/             # Socket.io bootstrap
?   ??? server.js            # HTTP + WebSocket entrypoint
??? README.md
```

## Getting Started

### 1. Install dependencies

```bash
cd server
npm install
npm run migrate   # creates SQLite schema and seeds default admin

cd ../client
npm install
```

### 2. Configure environment

Create `.env` files from the provided examples:

```bash
cp server/.env.example server/.env
# adjust JWT secret, allowed origins, difficulty, etc. as needed
```

### 3. Run development servers

In two terminals:

```bash
# backend (port 5000)
cd server
npm run dev

# frontend (port 5173)
cd client
npm run dev
```

The Vite dev server proxies API calls and WebSocket traffic to `http://localhost:5000` by default.

### 4. Test credentials

Seeded admin login: `admin@kabarak.ac.ke / Admin@123`

Students can register via the API or seeded data; each voter receives one ballot per election.

## API Overview

- `POST /api/auth/login` ? JWT + CSRF issuance
- `POST /api/auth/register` ? Create voter/admin accounts
- `GET /api/auth/me` ? Current authenticated user
- `GET /api/elections/active` ? Active elections for voters
- `GET /api/elections` ? Full election management (admin)
- `POST /api/elections` ? Create election (admin)
- `PATCH /api/elections/:id` ? Update election (admin)
- `DELETE /api/elections/:id` ? Remove election (admin)
- `POST /api/elections/:id/candidates` ? Add candidate (admin)
- `POST /api/votes` ? Cast vote (auth + CSRF protected)
- `GET /api/votes/stats` ? Aggregated statistics
- `GET /api/votes/history` ? Authenticated voter history
- `GET /api/blockchain` ? Ledger inspection (admin)
- `GET /api/blockchain/verify` ? Proof-of-work validation (admin)
- `GET /api/reports/export` ? CSV export of all votes (admin)
- `GET /api/health` ? Service heartbeat

All mutating requests require a valid JWT (`Authorization: Bearer <token>`) **and** CSRF header (`x-csrf-token`) that matches the value set in the `kb_csrf` cookie during login.

## Blockchain Design

- **Proof-of-work** difficulty configurable via `POW_DIFFICULTY` (default 4 leading zeros)
- Each block stores: vote ID, election ID, candidate ID, hashed voter identity, election metadata, timestamp
- Chain persists to SQLite `blocks` table for durability and restart recovery
- `POST /api/votes` mines a new block, links it to the previous hash, and stores the block hash back on the vote record
- `GET /api/blockchain/verify` recalculates hashes and chain links to detect tampering

## Frontend Highlights

- Tailwind-driven responsive dashboards with glassmorphism aesthetic
- Context-based auth with persistent JWT + CSRF handling
- Real-time updates via Socket.io hooks in `BlockchainContext`
- Admin analytics powered by Chart.js with live vote distribution and turnout metrics
- CSV export, blockchain inspection modals, and election management workflows

## Development Notes

- SQLite file lives in `server/data/kabarak-voting.db` (ignored by git)
- Socket.io authenticates connections using the same JWT as the REST API
- Default admin is seeded automatically; update password post-deployment
- Adjust CORS origins, JWT secrets, and proof-of-work difficulty before production

## License

MIT ? Kabarak University
