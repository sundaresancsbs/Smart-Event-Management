import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('organizer');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Set default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('organizer', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
    setUser(data);
    localStorage.setItem('organizer', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('organizer');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
