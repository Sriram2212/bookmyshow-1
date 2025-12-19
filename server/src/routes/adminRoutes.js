const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Admin Login
router.post('/login', adminController.login);

// Protected routes - require admin authentication
router.post('/movies', adminAuth, adminController.createMovie);
router.get('/movies', adminAuth, adminController.getAllMovies);
router.put('/movies/:id', adminAuth, adminController.updateMovie);
router.delete('/movies/:id', adminAuth, adminController.deleteMovie);

router.post('/theaters', adminAuth, adminController.createTheater);
router.get('/theaters', adminAuth, adminController.getAllTheaters);
router.put('/theaters/:id', adminAuth, adminController.updateTheater);
router.delete('/theaters/:id', adminAuth, adminController.deleteTheater);

router.post('/shows', adminAuth, adminController.createShow);
router.get('/shows', adminAuth, adminController.getAllShows);
router.put('/shows/:id', adminAuth, adminController.updateShow);
router.delete('/shows/:id', adminAuth, adminController.deleteShow);

router.get('/stats', adminAuth, adminController.getStats);

module.exports = router;
