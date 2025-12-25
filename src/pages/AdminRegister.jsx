import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { authApi } from '../services/authApi.js';
import '../styles/pages/admin-register.css';

function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.register({ name, email, password, isAdmin: true });
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register">
      <Navbar />
      <div className="admin-register__container">
        <h2 className="admin-register__title">Admin Registration</h2>
        <p className="admin-register__subtitle">Create an admin account to manage products and orders</p>
        <form onSubmit={handleSubmit}>
          <div className="admin-register__field">
            <label className="admin-register__label">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="admin-register__input"
              type="text"
            />
          </div>
          <div className="admin-register__field">
            <label className="admin-register__label">Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              required
              className="admin-register__input"
            />
          </div>
          <div className="admin-register__field">
            <label className="admin-register__label">Password</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              required
              className="admin-register__input"
            />
          </div>
          {error && (
            <div className="admin-register__error">{error}</div>
          )}
          <button
            disabled={loading}
            type="submit"
            className="admin-register__button"
          >
            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </button>
        </form>
        <div className="admin-register__login-link">
          <p>
            Already have an account?{' '}
            <a href="/login">Login</a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default AdminRegister;
