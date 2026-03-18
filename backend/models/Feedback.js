const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
