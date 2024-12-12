const express = require('express');
const Movie = require('../models/Movie');

const router = express.Router();

// Add a new movie
router.post('/', async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).send(movie);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all movies with pagination, search, and sorting
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'title', sortOrder = 'asc' } = req.query;
    const query = search ? { title: new RegExp(search, 'i') } : {};
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const movies = await Movie.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Movie.countDocuments(query);

    res.send({
      movies,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get details of a specific movie
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).send();
    }
    res.send(movie);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

