const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

router.get('/movies', catalogController.getMovies);
router.get('/movies/:id', catalogController.getMovieById);
router.get('/shows/movie/:movieId', catalogController.getShowsByMovie);
router.get('/shows/:showId', catalogController.getShowById);

module.exports = router;

