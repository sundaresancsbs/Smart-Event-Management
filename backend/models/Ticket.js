const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    qrCodeData: { type: String, required: true },
    used: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
