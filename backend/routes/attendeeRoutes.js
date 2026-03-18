const express = require('express');
const router = express.Router();
const { registerAttendee, checkInAttendee, getEventAttendees, regenerateQrCode } = require('../controllers/attendeeController');

const { protect } = require('../middleware/authMiddleware');


router.post('/register', registerAttendee);
router.post('/checkin', protect, checkInAttendee);
router.get('/event/:eventId', protect, getEventAttendees);
router.post('/regenerate-qr', regenerateQrCode); // No auth for demo, add protect if needed

module.exports = router;
