import db from './database.js';
import fs from 'fs';

const initDatabase = async () => {
  let client;
  try {
    // Test connection first
    client = await db.connect();
    console.log('✅ Connected to car_service_db successfully');
    
    // Read SQL file
    const sql = fs.readFileSync('./config/schema.sql', 'utf8');
    
    // Split into individual statements and execute them one by one with error handling
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log(`✅ Executed SQL statement`);
        } catch (error) {
          // Ignore "already exists" errors, but log others
          if (error.code !== '42P07' && error.code !== '42710') { // table/constraint already exists
            console.warn(`⚠️  Warning executing statement: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Database schema check completed');
    
    // Insert sample data
    await insertSampleData(client);
    console.log('✅ Sample data inserted successfully');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  } finally {
    if (client) client.release();
    process.exit(0);
  }
};

const insertSampleData = async (client) => {
  try {
    // Service Stations
    await client.query(`
      INSERT INTO service_stations (id, name, address, phone, email) 
      VALUES 
      (1, 'City Auto Care', '123 Main St, Cityville', '555-0101', 'cityauto@example.com'),
      (2, 'Premium Car Services', '456 Oak Ave, Townsville', '555-0102', 'premium@example.com')
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email;
    `);

    // Services
    await client.query(`
      INSERT INTO services (id, name, description, base_price, duration_minutes) 
      VALUES 
      (1, 'Oil Change', 'Complete oil and filter change', 49.99, 30),
      (2, 'Tire Rotation', 'Tire rotation and pressure check', 29.99, 45),
      (3, 'Brake Inspection', 'Complete brake system inspection', 39.99, 60),
      (4, 'Engine Tune-Up', 'Complete engine performance check', 89.99, 90),
      (5, 'Car Wash', 'Full service car wash and vacuum', 24.99, 45)
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        base_price = EXCLUDED.base_price,
        duration_minutes = EXCLUDED.duration_minutes;
    `);

    // Service Pricing
    await client.query(`
      INSERT INTO service_pricing (service_id, service_station_id, price) 
      VALUES 
      (1, 1, 49.99), (2, 1, 29.99), (3, 1, 39.99), (4, 1, 89.99), (5, 1, 24.99),
      (1, 2, 54.99), (2, 2, 34.99), (3, 2, 44.99), (4, 2, 94.99), (5, 2, 29.99)
      ON CONFLICT (service_id, service_station_id) DO UPDATE SET 
        price = EXCLUDED.price;
    `);

    console.log('✅ Sample data inserted/updated');

  } catch (error) {
    console.error('Error inserting sample data:', error.message);
  }
};

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export default initDatabase;