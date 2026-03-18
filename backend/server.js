require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-Memory Data Store
global.db = {
    organizers: [],
    events: [],
    attendees: [],
    tickets: []
};

// Routes
const eventRoutes = require('./routes/eventRoutes');
const attendeeRoutes = require('./routes/attendeeRoutes');
const authRoutes = require('./routes/authRoutes');

// Basic route
app.get('/', (req, res) => {
    res.send('Smart Event API is running (In-Memory Mode)...');
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendees', attendeeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
