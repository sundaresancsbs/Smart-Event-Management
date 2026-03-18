import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Register() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(err => setError('Event not found or failed to load.'));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/attendees/register`, {
        ...formData,
        eventId: id
      });
      setTicketData(data.ticket);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <div className="text-center mt-4">Loading event details...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <div className="card text-center mb-4">
        <h1 className="gradient-text">{event.title}</h1>
        <p className="text-secondary">{new Date(event.date).toLocaleDateString()} @ {event.venue}</p>
      </div>

      {!ticketData ? (
        <div className="card">
          <h2 className="mb-4">Secure Your Ticket</h2>
          {error && <div className="mb-4 p-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Processing...' : 'Register Now'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card text-center" style={{ border: '2px solid var(--secondary-color)' }}>
          <h2 style={{ color: 'var(--secondary-color)' }}>Registration Successful!</h2>
          <p className="text-secondary mb-4">Here is your ticket QR code. Please present this at the venue for check-in.</p>
          <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <img src={ticketData.qrCodeData} alt="Ticket QR Code" style={{ width: '250px', height: '250px' }} />
          </div>
          <div className="mb-2" style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>
            Event: <strong>{event.title}</strong>
          </div>
          <div className="mb-2" style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>
            Name: <strong>{formData.name}</strong>
          </div>
          <div className="mb-2" style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>
            Email: <strong>{formData.email}</strong>
          </div>
          <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
            Ticket ID: <strong style={{color: 'var(--text-primary)'}}>{ticketData.ticketId}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
