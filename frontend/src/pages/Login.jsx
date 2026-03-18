import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Calendar } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/'); // Redirect to dashboard
    } catch (err) {
        setError(err.response?.data?.message || 'Authentication failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <Calendar size={48} color="var(--primary-color)" />
          <h2 className="gradient-text mt-4">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-secondary">Organizer Portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input required type="password" className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600' }} onClick={() => {setIsLogin(!isLogin); setError('');}}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
