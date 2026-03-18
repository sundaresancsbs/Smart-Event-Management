const mongoose = require('mongoose');

const attendeeSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    checkInStatus: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Attendee', attendeeSchema);
