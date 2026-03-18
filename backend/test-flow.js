const axios = require('axios');

async function runTest() {
  const API_URL = 'http://localhost:5000/api';
  console.log('--- Starting E2E Test ---');

  try {
    // 1. Create Event
    console.log('1. Creating Event...');
    const eventRes = await axios.post(`${API_URL}/events`, {
      title: 'E2E Test Hackathon',
      description: 'Testing the system',
      date: new Date().toISOString(),
      venue: 'Test Venue',
      capacity: 100
    });
    const eventId = eventRes.data._id;
    console.log(`   -> Event Created. ID: ${eventId}`);

    // 2. Register Attendee
    console.log('\n2. Registering Attendee...');
    const regRes = await axios.post(`${API_URL}/attendees/register`, {
      name: 'Test Setup User',
      email: 'test@example.com',
      eventId: eventId
    });
    const ticketId = regRes.data.ticket.ticketId;
    console.log(`   -> Registered. Ticket ID: ${ticketId}`);
    
    // 3. Check-in
    console.log('\n3. Checking in Attendee...');
    const checkinRes = await axios.post(`${API_URL}/attendees/checkin`, {
      ticketId,
      eventId
    });
    console.log(`   -> Check-in Status: ${checkinRes.data.message}`);
    console.log(`   -> User Status is now checked in: ${checkinRes.data.attendee.checkInStatus}`);

    console.log('\n--- E2E Test Passed Successfully ---');
  } catch (error) {
    console.error('\n--- E2E Test Failed ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

runTest();
