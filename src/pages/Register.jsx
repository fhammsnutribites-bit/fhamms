import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/pages/register.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    const user = await register(name, email, password);
    if (user) navigate('/');
  };

  return (
    <div className="register">
      <Navbar />
      <div className="register__container">
        <h2 className="register__title">Create Account</h2>
        <p className="register__subtitle">Create a customer account to shop</p>
        {error && <div className="register__error">{error}</div>}
        <form onSubmit={handleSubmit} className="register__form">
          <div className="register__field">
            <label className="register__label">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="register__input"
            />
          </div>
          <div className="register__field">
            <label className="register__label">Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              required
              className="register__input"
            />
          </div>
          <div className="register__field">
            <label className="register__label">Password</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              required
              className="register__input"
            />
          </div>
          <button type="submit" disabled={loading} className="register__button">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="register__links">
          <p className="register__signin-text">
            Already have an account? <Link to="/login" className="register__link">Sign In</Link>
          </p>
          {/* <div className="register__divider">or</div>
          <Link to="/admin/register" className="register__link">Register as Admin</Link> */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default Register;
