const express = require('express');
const Theater = require('../models/Theater');

const router = express.Router();

// Add a new theater
router.post('/', async (req, res) => {
  try {
    const theater = new Theater({
      ...req.body,
      showTimings: ['10:00', '14:00', '18:00'] // Fixed 3 shows every day
    });
    await theater.save();
    res.status(201).send(theater);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all theaters
router.get('/', async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.send(theaters);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

