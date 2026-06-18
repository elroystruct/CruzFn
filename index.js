require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Auto-create tables on startup
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT,
      message TEXT,
      sms_consent BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS brands (
      id SERIAL PRIMARY KEY,
      legal_name TEXT NOT NULL,
      ein TEXT,
      brand_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      brand_id TEXT,
      campaign_id TEXT,
      use_case TEXT,
      message_flow TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS phone_numbers (
      id SERIAL PRIMARY KEY,
      campaign_id TEXT,
      phone_number TEXT NOT NULL,
      carrier_status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Tables ready');
}

// Health check
app.get('/', (req, res) => res.send('10DLC API running'));

// --- BRANDS ---
app.post('/brands', async (req, res) => {
  const { legal_name, ein, brand_id, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO brands (legal_name, ein, brand_id, status) VALUES ($1,$2,$3,$4) RETURNING *',
      [legal_name, ein, brand_id, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/brands', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM brands ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CAMPAIGNS ---
app.post('/campaigns', async (req, res) => {
  const { brand_id, campaign_id, use_case, message_flow, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO campaigns (brand_id, campaign_id, use_case, message_flow, status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [brand_id, campaign_id, use_case, message_flow, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/campaigns', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CONTACTS ---
app.post('/contact', async (req, res) => {
  const { full_name, phone, service, message, sms_consent } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO contacts (full_name, phone, service, message, sms_consent) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [full_name, phone, service, message, sms_consent]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/contacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PHONE NUMBERS ---
app.post('/numbers', async (req, res) => {
  const { campaign_id, phone_number, carrier_status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO phone_numbers (campaign_id, phone_number, carrier_status) VALUES ($1,$2,$3) RETURNING *',
      [campaign_id, phone_number, carrier_status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/numbers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM phone_numbers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
