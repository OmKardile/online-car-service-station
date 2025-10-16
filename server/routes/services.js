import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all service stations
router.get('/stations', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ss.*, u.name as admin_name, u.email as admin_email 
      FROM service_stations ss 
      LEFT JOIN users u ON ss.admin_id = u.id 
      ORDER BY ss.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get services for a specific station with pricing
router.get('/station/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;

    const result = await db.query(`
      SELECT s.*, COALESCE(sp.price, s.base_price) as price
      FROM services s
      LEFT JOIN service_pricing sp ON s.id = sp.service_id AND sp.service_station_id = $1
      ORDER BY s.name
    `, [stationId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching station services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all services (for admin management)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM services ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;