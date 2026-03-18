import { useState, useEffect } from 'react';
import { Copy, Award } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Users, UserCheck, ArrowLeft, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState(null);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  // Filter attendees by search
  const [qrLoadingId, setQrLoadingId] = useState(null);
  const [qrSuccessId, setQrSuccessId] = useState(null);
  const filteredAttendees = attendees.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  // Leaderboard: Most recent check-ins (top 5)
  const leaderboard = attendees
    .filter(a => a.checkInStatus && a.checkInTime)
    .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
    .slice(0, 5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, attendeesRes] = await Promise.all([
          axios.get(`${API_URL}/events/${id}`),
          axios.get(`${API_URL}/attendees/event/${id}`)
        ]);
        setEvent(eventRes.data);
        setAttendees(attendeesRes.data);
      } catch (error) {
        console.error('Error fetching event details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Auto-refresh attendees every 10 seconds for live updates
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API_URL}/attendees/event/${id}`);
        setAttendees(data);
      } catch (e) {
        console.error(e);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading || !event) return <div className="text-center mt-4">Loading details...</div>;

  const checkedInCount = attendees.filter(a => a.checkInStatus).length;
  const totalRegistered = attendees.length;

  const chartData = [
    { name: 'Registered', count: totalRegistered, fill: 'var(--primary-color)' },
    { name: 'Checked In', count: checkedInCount, fill: 'var(--secondary-color)' },
    { name: 'Capacity', count: event.capacity, fill: 'var(--border-color)' }
  ];

  return (
    <div>
      {/* Live Check-In Leaderboard */}
      <div className="card mb-4" style={{ maxWidth: 500, margin: '0 auto', background: 'rgba(16,185,129,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Award size={22} color="var(--secondary-color)" />
          <h3 style={{ margin: 0, color: 'var(--secondary-color)' }}>Live Check-In Leaderboard</h3>
        </div>
        {leaderboard.length === 0 ? (
          <div className="text-secondary">No check-ins yet.</div>
        ) : (
          <ol style={{ paddingLeft: 18, margin: 0 }}>
            {leaderboard.map((a, idx) => (
              <li key={a._id} style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{a.name}</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: 8, fontSize: '0.95em' }}>{a.email}</span>
                <span style={{ color: 'var(--secondary-color)', marginLeft: 8, fontSize: '0.95em' }}>
                  {a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : ''}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="mb-4">
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
      
      <div className="flex-between mb-4">
        <h1 className="gradient-text" style={{ marginBottom: 0 }}>{event.title}</h1>
        <Link to={`/event/${event._id}/register`} target="_blank" className="btn btn-secondary">
          Registration Page <ExternalLink size={16} />
        </Link>
      </div>

      <div className="grid-layout mb-4">
        <div className="card stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h4>Total Registered</h4>
            <p>{totalRegistered} <span style={{fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>/ {event.capacity}</span></p>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-color)' }}>
            <UserCheck size={24} />
          </div>
          <div className="stat-details">
            <h4>Live Check-ins</h4>
            <p>{checkedInCount}</p>
          </div>
        </div>
      </div>

      <div className="grid-layout">
        <div className="card">
          <h3 className="mb-4">Attendance Analytics</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip cursor={{fill: 'var(--surface-light)'}} contentStyle={{ backgroundColor: 'var(--surface-dark)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Attendee Roster</h3>
          <input
            type="text"
            className="form-input mb-3"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
          <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table>
              <thead style={{ position: 'sticky', top: 0 }}>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map(a => (
                  <tr
                    key={a._id}
                    style={{ cursor: 'pointer', background: a.checkInStatus ? 'rgba(16,185,129,0.07)' : undefined }}
                    onClick={() => setSelectedAttendeeId(selectedAttendeeId === a._id ? null : a._id)}
                  >
                    <td>
                      <div style={{ fontWeight: 500 }}>{a.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.email}</div>
                      {a.ticketId && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', marginTop: '0.3rem' }}>
                          Ticket ID: <strong>{a.ticketId}</strong>
                          <button
                            style={{ marginLeft: 8, border: 'none', background: 'none', cursor: 'pointer', verticalAlign: 'middle' }}
                            title="Copy Ticket ID"
                            onClick={e => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(a.ticketId);
                              setCopiedId(a._id);
                              setTimeout(() => setCopiedId(null), 1200);
                            }}
                          >
                            <Copy size={16} color={copiedId === a._id ? 'var(--secondary-color)' : 'var(--text-secondary)'} />
                          </button>
                          <button
                            style={{
                              marginLeft: 8,
                              border: '1px solid var(--secondary-color)',
                              background: 'white',
                              color: 'var(--secondary-color)',
                              borderRadius: 4,
                              padding: '2px 8px',
                              cursor: qrLoadingId === a._id ? 'wait' : 'pointer',
                              opacity: qrLoadingId === a._id ? 0.7 : 1
                            }}
                            disabled={qrLoadingId === a._id}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setQrLoadingId(a._id);
                              setQrSuccessId(null);
                              try {
                                const res = await axios.post(`${API_URL}/attendees/regenerate-qr`, { attendeeId: a._id });
                                setAttendees(prev =>
                                  prev.map(att =>
                                    att._id === a._id
                                      ? { ...att, qrCodeData: res.data.ticket.qrCodeData }
                                      : att
                                  )
                                );
                                setQrSuccessId(a._id);
                                setTimeout(() => setQrSuccessId(null), 1500);
                              } catch (err) {
                                alert('Failed to regenerate QR code');
                              } finally {
                                setQrLoadingId(null);
                              }
                            }}
                          >
                            {qrLoadingId === a._id ? 'Regenerating...' : qrSuccessId === a._id ? 'Success!' : 'Regenerate QR'}
                          </button>
                          {copiedId === a._id && <span style={{ marginLeft: 6, color: 'var(--secondary-color)', fontSize: '0.85em' }}>Copied!</span>}
                          {a.qrCodeData && (
                            <div style={{ marginTop: 8 }}>
                              <img src={a.qrCodeData} alt="QR Code" style={{ width: 90, height: 90, borderRadius: 8, background: '#fff', border: '1px solid #eee' }} />
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {a.checkInStatus ? (
                        <span className="badge badge-success">Checked In</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAttendees.length === 0 && (
                  <tr>
                    <td colSpan="2" className="text-center text-secondary">No attendees registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
