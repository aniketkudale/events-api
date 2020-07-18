const { Router } = require('express');
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getEvent,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventPhoto,
} = require('../controllers/events');

const Events = require('../models/events');
const advancedResults = require('../middleware/advancedResults');

router
  .route('/')
  .get(advancedResults(Events), getEvents)
  .post(protect, authorize('publisher', 'admin'), createEvent);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), uploadEventPhoto);

router
  .route('/:id')
  .get(getEvent)
  .put(protect, authorize('publisher', 'admin'), updateEvent)
  .delete(protect, authorize('publisher', 'admin'), deleteEvent);

module.exports = router;
