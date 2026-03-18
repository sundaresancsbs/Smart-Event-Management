const crypto = require('crypto');

exports.createEvent = (req, res) => {
    try {
        const { title, description, date, venue, capacity } = req.body;
        const event = { 
            _id: crypto.randomBytes(8).toString('hex'),
            title, description, date, venue, capacity,
            createdAt: new Date().toISOString()
        };
        global.db.events.push(event);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEvents = (req, res) => {
    try {
        // Sort by newest
        const events = [...global.db.events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEventById = (req, res) => {
    try {
        const event = global.db.events.find(e => e._id === req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
