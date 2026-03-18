const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById } = require('../controllers/eventController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createEvent);
router.get('/', protect, getEvents);
router.get('/:id', getEventById); // Public for attendee registration page

module.exports = router;
