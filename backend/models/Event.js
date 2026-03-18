const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    capacity: { type: Number, required: true },
    organizerId: { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
