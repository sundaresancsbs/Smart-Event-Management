import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { CheckCircle2, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Scanner() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/events`)
      .then(res => setEvents(res.data))
      .catch(err => console.error('Failed to load events', err));
  }, []);

  const resetScan = () => {
    setScanResult(null);
    setIsScanning(false);
  };

  const handleScanSuccess = async (decodedText) => {
    if (isScanning) return;
    setIsScanning(true);

    try {
      const res = await axios.post(`${API_URL}/attendees/checkin`, {
        ticketId: decodedText,
        eventId: selectedEventId
      });


      // Store full attendee/ticket info for display
      setScanResult({
        success: true,
        message: 'Check-in Successful!',
        eventTitle: res.data.eventTitle,
        attendeeName: res.data.attendeeName,
        attendeeEmail: res.data.attendeeEmail,
        ticketId: res.data.ticketId
      });

      timeoutRef.current = setTimeout(resetScan, 2000);

    } catch (error) {
      setScanResult({
        success: false,
        message: error.response?.data?.message || 'Invalid Ticket'
      });
      timeoutRef.current = setTimeout(resetScan, 2000);
    }
  };

  useEffect(() => {
    if (!selectedEventId) return;

    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(
      (decodedText) => handleScanSuccess(decodedText),
      (error) => {}
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectedEventId]);

  useEffect(() => {
    if (!scanResult && scannerRef.current) {
      setIsScanning(false);
    }
  }, [scanResult]);

  return (
    <div className="scanner-container">
      <div className="card mb-4 text-center">
        <h2>Volunteer Check-in Scanner</h2>
        <p className="text-secondary mb-4">Select an event to start scanning tickets or enter manually.</p>
        <div className="form-group text-left">
          <label className="form-label">Active Event</label>
          <select
            className="form-input"
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setScanResult(null);
            }}
          >
            <option value="">-- Choose an Event --</option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        </div>
        {/* Manual Entry Form */}
        {selectedEventId && (
          <form
            className="form-group mt-3"
            style={{ maxWidth: 350, margin: '0 auto' }}
            onSubmit={async (e) => {
              e.preventDefault();
              const ticketId = e.target.ticketId.value.trim();
              if (!ticketId) return;
              setIsScanning(true);
              try {
                const res = await axios.post(`${API_URL}/attendees/checkin`, {
                  ticketId,
                  eventId: selectedEventId
                });
                setScanResult({
                  success: true,
                  message: 'Check-in Successful!',
                  eventTitle: res.data.eventTitle,
                  attendeeName: res.data.attendeeName,
                  attendeeEmail: res.data.attendeeEmail,
                  ticketId: res.data.ticketId
                });
                timeoutRef.current = setTimeout(resetScan, 2000);
              } catch (error) {
                setScanResult({
                  success: false,
                  message: error.response?.data?.message || 'Invalid Ticket'
                });
                timeoutRef.current = setTimeout(resetScan, 2000);
              } finally {
                setIsScanning(false);
              }
            }}
          >
            <label className="form-label">Manual Ticket ID Entry</label>
            <input
              type="text"
              name="ticketId"
              className="form-input mb-2"
              placeholder="Enter Ticket ID"
              autoComplete="off"
              required
              style={{ textAlign: 'center' }}
            />
            <button type="submit" className="btn btn-secondary btn-block" disabled={isScanning}>
              {isScanning ? 'Checking...' : 'Check-in Manually'}
            </button>
          </form>
        )}
      </div>

      {selectedEventId && (
        <div className="card text-center" style={{ position: 'relative' }}>
          {scanResult && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              zIndex: 10, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', borderRadius: '12px'
            }}>
              {scanResult.success ? (
                <>
                  <CheckCircle2 color="var(--secondary-color)" size={80} className="mb-4" />
                  <h2 style={{ color: 'var(--secondary-color)' }}>{scanResult.message}</h2>
                  <div className="mb-2" style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                    Event: <strong>{scanResult.eventTitle}</strong>
                  </div>
                  <div className="mb-2" style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                    Name: <strong>{scanResult.attendeeName}</strong>
                  </div>
                  <div className="mb-2" style={{ color: 'var(--text-primary)' }}>
                    Email: <strong>{scanResult.attendeeEmail}</strong>
                  </div>
                  <div className="mb-2" style={{ color: 'var(--text-primary)' }}>
                    Ticket ID: <strong>{scanResult.ticketId}</strong>
                  </div>
                </>
              ) : (
                <>
                  <XCircle color="var(--danger)" size={80} className="mb-4" />
                  <h2 style={{ color: 'var(--danger)' }}>Check-in Failed</h2>
                  <p className="text-primary">{scanResult.message}</p>
                </>
              )}
              <button
                className="btn btn-primary mt-3"
                onClick={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  resetScan();
                }}
              >
                Scan Next
              </button>
            </div>
          )}
          <div id="reader" style={{ width: '100%', marginBottom: '1rem' }}></div>
          <p className="text-secondary">Point camera at attendee QR code or barcode, or enter ticket ID manually above.</p>
        </div>
      )}
    </div>
  );
}