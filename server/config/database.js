import pkg from 'pg';
const { Pool } = pkg;

// Debug: Check if environment variables are loaded
import dotenv from 'dotenv';
dotenv.config();

console.log('DB Config:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD ? '***' : 'MISSING' // Don't log actual password
});

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'car_service_db',
  password: process.env.DB_PASSWORD, // This should be a string
  port: process.env.DB_PORT || 5432,
});

// Test connection immediately
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

export default pool;