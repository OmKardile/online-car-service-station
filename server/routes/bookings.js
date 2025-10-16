import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { serviceId, stationId, date, time, clientId } = req.body;

    // Get service price for this station
    const priceResult = await db.query(`
      SELECT COALESCE(sp.price, s.base_price) as price 
      FROM services s 
      LEFT JOIN service_pricing sp ON s.id = sp.service_id AND sp.service_station_id = $2 
      WHERE s.id = $1
    `, [serviceId, stationId]);

    if (priceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const finalPrice = priceResult.rows[0].price;

    // Create booking
    const result = await db.query(
      `INSERT INTO bookings (client_id, service_id, service_station_id, booking_date, booking_time, final_price, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
       RETURNING *`,
      [clientId, serviceId, stationId, date, time, finalPrice]
    );

    const booking = result.rows[0];

    // Generate quotation text
    const quotationText = `Service Booking Quotation:
Service: TODO_GET_SERVICE_NAME
Station: TODO_GET_STATION_NAME
Date: ${booking.booking_date}
Time: ${booking.booking_time}
Total: $${finalPrice}`;

    // Update booking with quotation
    await db.query(
      'UPDATE bookings SET quotation_text = $1 WHERE id = $2',
      [quotationText, booking.id]
    );

    booking.quotation_text = quotationText;

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error during booking' });
  }
});

// Get user's bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(`
      SELECT b.*, s.name as service_name, ss.name as station_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN service_stations ss ON b.service_station_id = ss.id
      WHERE b.client_id = $1
      ORDER BY b.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (for admin)
router.put('/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const result = await db.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;