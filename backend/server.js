const path = require("path");
require('dotenv').config({ path: path.join(__dirname,".env") });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Initialize express app
const app = express();

app.use(cookieParser());

// Initialize PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://spot-talk.vercel.app'], // Add allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Set up session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'some_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Routes for spots
require('./routes/spots')(app, pool);

// Create or alter tables for spots
pool.query(`
  CREATE TABLE IF NOT EXISTS spots (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) DEFAULT 'Anonymous',
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    image_url TEXT,
    comments JSONB DEFAULT '[]',
    stars INTEGER DEFAULT 0
  );
`).then(() => {
  console.log("Spots table is ready");
}).catch(err => console.error('Error creating spots table:', err));

app.get('/', async (req, res) => {
  res.send({ "status": "ready" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
