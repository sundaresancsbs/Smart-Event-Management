// Regenerate or resend QR code for an attendee's ticket
exports.regenerateQrCode = async (req, res) => {
    try {
        const { attendeeId, ticketId } = req.body;
        let ticket = null;
        if (ticketId) {
            ticket = global.db.tickets.find(t => t.ticketId === ticketId);
        } else if (attendeeId) {
            ticket = global.db.tickets.find(t => t.attendeeId === attendeeId);
        }
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Regenerate QR code (in case it was lost or needs to be refreshed)
        const qrCodeDataURI = await qrcode.toDataURL(ticket.ticketId);
        ticket.qrCodeData = qrCodeDataURI;

        res.status(200).json({
            message: 'QR code regenerated',
            ticket: {
                ticketId: ticket.ticketId,
                qrCodeData: ticket.qrCodeData
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const qrcode = require('qrcode');
const crypto = require('crypto');

exports.registerAttendee = async (req, res) => {
    try {
        const { name, email, eventId } = req.body;

        const event = global.db.events.find(e => e._id === eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (!event.title) return res.status(400).json({ message: 'Event title is missing. Cannot generate ticket.' });
        
        const attendeeCount = global.db.attendees.filter(a => a.eventId === eventId).length;
        if (attendeeCount >= event.capacity) {
            return res.status(400).json({ message: 'Event is at full capacity' });
        }

        const attendee = {
            _id: crypto.randomBytes(8).toString('hex'),
            name, email, eventId,
            checkInStatus: false,
            createdAt: new Date().toISOString()
        };
        global.db.attendees.push(attendee);
    // Generate ticketId with event title and sequential number
    const eventName = event.title ? event.title.replace(/\s+/g, '') : ''; // Remove spaces for ID
            // Only consider tickets for this event that match the eventName-XXX pattern
            const eventTickets = global.db.tickets.filter(t => t.eventId === eventId && new RegExp(`^${eventName}-\\d{3,}$`).test(t.ticketId));
            let maxNum = 0;
            eventTickets.forEach(t => {
                const match = t.ticketId.match(new RegExp(`^${eventName}-(\\d{3,})$`));
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            });
            const nextNum = maxNum + 1;
            const ticketId = `${eventName}-${nextNum.toString().padStart(3, '0')}`;

            // Generate QR code from the new ticketId only
            const qrCodeDataURI = await qrcode.toDataURL(ticketId);

            // Use only the new ticketId for the ticket object
            const ticket = {
                _id: crypto.randomBytes(8).toString('hex'),
                ticketId: ticketId,
                attendeeId: attendee._id,
                eventId,
                qrCodeData: qrCodeDataURI,
                used: false
            };
            global.db.tickets.push(ticket);

        res.status(201).json({ attendee, ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkInAttendee = (req, res) => {
    try {
        const { ticketId, eventId } = req.body;
        
        const ticketIndex = global.db.tickets.findIndex(t => t.ticketId === ticketId && t.eventId === eventId);
        if (ticketIndex === -1) return res.status(404).json({ message: 'Invalid ticket' });

        const ticket = global.db.tickets[ticketIndex];
        if (ticket.used) return res.status(400).json({ message: 'Ticket already used' });

        // Update ticket
        global.db.tickets[ticketIndex].used = true;

        // Update attendee
        const attendeeIndex = global.db.attendees.findIndex(a => a._id === ticket.attendeeId);
        if (attendeeIndex !== -1) {
            global.db.attendees[attendeeIndex].checkInStatus = true;
            global.db.attendees[attendeeIndex].checkInTime = new Date().toISOString();
        }
        

        const attendee = global.db.attendees[attendeeIndex];
        // Find event
        const event = global.db.events.find(e => e._id === eventId);
        // Return event title, attendee name, attendee email, and ticket ID
        res.status(200).json({
            message: 'Check-in successful',
            eventTitle: event ? event.title : '',
            attendeeName: attendee ? attendee.name : '',
            attendeeEmail: attendee ? attendee.email : '',
            ticketId: ticket.ticketId
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEventAttendees = (req, res) => {
    try {
        const attendees = global.db.attendees.filter(a => a.eventId === req.params.eventId);
        // For each attendee, find their ticket and add ticketId
        const attendeesWithTicket = attendees.map(a => {
            const ticket = global.db.tickets.find(t => t.attendeeId === a._id && t.eventId === a.eventId);
            return {
                ...a,
                ticketId: ticket ? ticket.ticketId : null
            };
        });
        res.status(200).json(attendeesWithTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
