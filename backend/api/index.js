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
  origin: ['http://localhost:3000', 'https://spot-talk.vercel.app', 'https://www.canbyr.com'], // Frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());


// Set up session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'some_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Routes for spots
require('./spots')(app, pool);

// Create or alter tables for spots
pool.query(`
  CREATE TABLE IF NOT EXISTS spots (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) DEFAULT 'Anonymous',
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    image_url JSONB,
    comments JSONB DEFAULT '[]',
    stars INTEGER DEFAULT 0,
    name VARCHAR(255),
    description TEXT
  );
`).then(() => {
  console.log("Spots table is ready");
}).catch(err => console.error('Error creating spots table:', err));

// Create or alter table and ensure the image_url column is JSONB
pool.query(`
 DO $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'spots' AND column_name = 'image_url' AND data_type <> 'jsonb'
    ) THEN
      UPDATE spots
      SET image_url = CASE
        WHEN image_url::TEXT LIKE '[%' THEN image_url::JSONB  -- Valid JSON data
        ELSE json_build_array(image_url)::JSONB              -- Wrap non-JSON as an array
      END
      WHERE image_url IS NOT NULL;

      ALTER TABLE spots ALTER COLUMN image_url TYPE JSONB USING image_url::JSONB;
    END IF;
  END $$;

`).then(() => {
  console.log("image_url column updated to JSONB");
}).catch(err => console.error('Error updating image_url column:', err));




app.get('/', async (req, res) => {
  res.send({ "status": "ready" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
