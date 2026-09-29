-- Cloudflare D1 Schema for Cardverse TCG Shop

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER', -- 'ADMIN' or 'CUSTOMER'
    store_credit REAL NOT NULL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    name TEXT NOT NULL,
    set_code TEXT NOT NULL,
    rarity TEXT NOT NULL,
    condition TEXT NOT NULL,
    language TEXT NOT NULL,
    is_graded INTEGER NOT NULL DEFAULT 0,
    grading_company TEXT,
    grade_number REAL,
    cert_number TEXT,
    price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RESERVED', 'SOLD'
    reserved_until INTEGER,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    total_amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    items_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Buylist Orders table
CREATE TABLE IF NOT EXISTS buylist_orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    customer_email TEXT NOT NULL,
    items_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'INSPECTED', 'APPROVED', 'REJECTED'
    estimated_amount REAL NOT NULL,
    final_amount REAL,
    payout_type TEXT NOT NULL, -- 'BANK_TRANSFER', 'STORE_CREDIT'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Admin User: seree999@gmail.com
INSERT OR REPLACE INTO users (id, email, name, role, store_credit)
VALUES ('admin-seree999', 'seree999@gmail.com', 'Seree (Admin)', 'ADMIN', 10000.0);
