import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { validateIndianMobile, formatIndianMobile, getMobileValidationError } from '../utils/validation.js';
import '../styles/pages/login.css';

function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [mobileError, setMobileError] = useState('');
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleMobileChange = (e) => {
    const value = e.target.value;
    setMobile(value);

    // Clear error when user starts typing
    if (mobileError) {
      setMobileError('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate mobile number
    const mobileValidationError = getMobileValidationError(mobile);
    if (mobileValidationError) {
      setMobileError(mobileValidationError);
      return;
    }

    // Format mobile number before sending
    const formattedMobile = formatIndianMobile(mobile);
    const user = await login(formattedMobile, password);
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
            <label className="login__label">Mobile Number</label>
            <input
              value={mobile}
              onChange={handleMobileChange}
              type="tel"
              required
              className={`login__input ${mobileError ? 'login__input--error' : ''}`}
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
            />
            {mobileError && <span className="login__field-error">{mobileError}</span>}
            <small className="login__field-hint">Enter 10-digit Indian mobile number (e.g., 9876543210)</small>
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
          <p className="login__forgot-text">
            <Link to="/forgot-password" className="login__link">Forgot Password?</Link>
          </p>
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
