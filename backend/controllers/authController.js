const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

exports.registerOrganizer = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const organizerExists = global.db.organizers.find(o => o.email === email);
        if (organizerExists) {
            return res.status(400).json({ message: 'Organizer already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const organizer = {
            _id: crypto.randomBytes(8).toString('hex'),
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        global.db.organizers.push(organizer);

        res.status(201).json({
            _id: organizer._id,
            name: organizer.name,
            email: organizer.email,
            token: generateToken(organizer._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginOrganizer = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const organizer = global.db.organizers.find(o => o.email === email);
        if (!organizer) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, organizer.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: organizer._id,
            name: organizer.name,
            email: organizer.email,
            token: generateToken(organizer._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
