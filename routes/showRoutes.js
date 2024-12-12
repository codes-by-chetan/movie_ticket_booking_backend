const express = require('express');
const Show = require('../models/Show');
const Theater = require('../models/Theater');
const Movie = require('../models/Movie');

const router = express.Router();

// Create a new show
router.post('/', async (req, res) => {
  try {
    const { movieId, theaterId, showTime, date } = req.body;

    const theater = await Theater.findById(theaterId);
    if (!theater) {
      return res.status(404).send({ error: 'Theater not found' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).send({ error: 'Movie not found' });
    }

    // Check if the show time is valid
    if (!theater.showTimings.includes(showTime)) {
      return res.status(400).send({ error: 'Invalid show time' });
    }

    // Check for conflicting shows
    const conflictingShow = await Show.findOne({
      theater: theaterId,
      date,
      showTime
    });

    if (conflictingShow) {
      return res.status(400).send({ error: 'Show time conflicts with an existing show' });
    }

    const show = new Show({
      movie: movieId,
      theater: theaterId,
      showTime,
      date,
      availableSeats: theater.seatsCapacity,
      bookedSeats: []
    });

    await show.save();
    res.status(201).send(show);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get details of all shows for a specific movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const shows = await Show.find({ movie: req.params.movieId })
      .populate('theater', 'name address')
      .populate('movie', 'title');
    res.send(shows);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get details of a specific show
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('theater', 'name address seatsCapacity numberOfRows seatsPerRow')
      .populate('movie', 'title duration');
    if (!show) {
      return res.status(404).send();
    }
    res.send(show);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

