-- Run this in Supabase SQL Editor

CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  legal_name TEXT NOT NULL,
  ein TEXT,
  brand_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  brand_id TEXT,
  campaign_id TEXT,
  use_case TEXT,
  message_flow TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE phone_numbers (
  id SERIAL PRIMARY KEY,
  campaign_id TEXT,
  phone_number TEXT NOT NULL,
  carrier_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
