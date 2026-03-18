import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Calendar, LayoutDashboard, QrCode, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import Scanner from './pages/Scanner';
import Register from './pages/Register';
import Login from './pages/Login';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppContent() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            <Calendar size={28} />
            SmartEvent
          </Link>
          <div className="navbar-links">
            {user && (
              <>
                <Link to="/" className="nav-link">
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
                <Link to="/scanner" className="nav-link">
                  <QrCode size={20} /> Scanner
                </Link>
                <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                  <LogOut size={20} /> Logout
                </button>
              </>
            )}
            {!user && (
               <Link to="/login" className="nav-link">
                 Login
               </Link>
            )}
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/event/:id/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/event/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
