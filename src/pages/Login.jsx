import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/pages/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    const user = await login(email, password);
    if (user) navigate(user.isAdmin ? '/admin' : '/');
  };

  return (
    <div className="login">
      <Navbar />
      <div className="login__container">
        <h2 className="login__title">Welcome Back</h2>
        <p className="login__subtitle">Login as Customer or Admin</p>
        {error && <div className="login__error">{error}</div>}
        <form onSubmit={handleSubmit} className="login__form">
          <div className="login__field">
            <label className="login__label">Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              required
              className="login__input"
            />
          </div>
          <div className="login__field">
            <label className="login__label">Password</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              required
              className="login__input"
            />
          </div>
          <button type="submit" disabled={loading} className="login__button">
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        <div className="login__links">
          <p className="login__signup-text">
            Don't have an account? <Link to="/register" className="login__link">Sign Up</Link>
          </p>
          {/* <div className="login__divider">or</div>
          <Link to="/admin/register" className="login__link">Register as Admin</Link> */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default Login;
