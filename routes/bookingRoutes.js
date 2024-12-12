const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');

const router = express.Router();

// Book seats for a show
router.post('/', async (req, res) => {
  try {
    const { showId, seats } = req.body;

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).send({ error: 'Show not found' });
    }

    // Check if seats are available
    const unavailableSeats = seats.filter(seat => 
      show.bookedSeats.some(bookedSeat => 
        bookedSeat.row === seat.row && bookedSeat.seatNumber === seat.seatNumber
      )
    );

    if (unavailableSeats.length > 0) {
      return res.status(400).send({ error: 'Some seats are already booked', unavailableSeats });
    }

    // Create booking
    const booking = new Booking({
      show: showId,
      seats,
      totalPrice: seats.length * 10 // Assuming each seat costs $10
    });

    await booking.save();

    // Update show's booked seats and available seats
    show.bookedSeats.push(...seats);
    show.availableSeats -= seats.length;
    await show.save();

    res.status(201).send(booking);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all bookings with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const bookings = await Booking.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('show', 'showTime date')
      .exec();

    const count = await Booking.countDocuments();

    res.send({
      bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

