import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  // First connect to the default 'postgres' database to create our target database
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Connect to default database
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check if database exists
    const dbCheck = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = 'car_service_db'
    `);
    
    if (dbCheck.rows.length === 0) {
      // Create database if it doesn't exist
      await client.query('CREATE DATABASE car_service_db');
      console.log('✅ Database "car_service_db" created successfully');
    } else {
      console.log('✅ Database "car_service_db" already exists');
    }
    
    await client.end();
    
    // Now test connection to the new database
    const testClient = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: 'car_service_db',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
    
    await testClient.connect();
    console.log('✅ Successfully connected to car_service_db');
    await testClient.end();
    
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
  }
}

createDatabase();