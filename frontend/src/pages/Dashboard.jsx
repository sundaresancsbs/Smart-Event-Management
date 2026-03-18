import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, PlusCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', venue: '', capacity: ''
  });

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/events`);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/events`, formData);
      setShowForm(false);
      setFormData({ title: '', description: '', date: '', venue: '', capacity: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  if (loading) return <div className="text-center mt-4">Loading events...</div>;

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1 className="gradient-text">Organizer Dashboard</h1>
          <p className="text-secondary">Manage your upcoming events</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={20} />
          {showForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4" style={{ backgroundColor: 'var(--surface-light)' }}>
          <h3>Create New Event</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-layout">
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input required type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Hackathon 2026" />
              </div>
              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input required type="datetime-local" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Venue</label>
                <input required type="text" className="form-input" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} placeholder="Main Auditorium" />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input required type="number" min="1" className="form-input" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} placeholder="500" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea className="form-input" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Event details..."></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Save Event</button>
          </form>
        </div>
      )}

      <div className="grid-layout">
        {events.length === 0 ? (
          <div className="card text-center" style={{ gridColumn: '1 / -1' }}>
            <p className="text-secondary">No events created yet.</p>
          </div>
        ) : (
          events.map(event => (
            <Link to={`/event/${event._id}`} key={event._id} style={{ textDecoration: 'none' }}>
              <div className="card">
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{event.title}</h3>
                <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>
                  {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} /> <span style={{ fontSize: '0.9rem'}}>{event.venue}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Users size={16} /> <span style={{ fontSize: '0.9rem'}}>Capacity: {event.capacity}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
