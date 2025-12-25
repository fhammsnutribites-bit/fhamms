import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { validateIndianMobile, formatIndianMobile, getMobileValidationError } from '../utils/validation.js';
import '../styles/pages/register.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [step, setStep] = useState(1); // 1: registration form, 2: OTP verification
  const [tempUserId, setTempUserId] = useState(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { register, verifyRegistration, resendOtp, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleMobileChange = (e) => {
    const value = e.target.value;
    setMobile(value);

    // Clear error when user starts typing
    if (mobileError) {
      setMobileError('');
    }
  };

  const handleSendOTP = async e => {
    e.preventDefault();

    // Validate mobile number
    const mobileValidationError = getMobileValidationError(mobile);
    if (mobileValidationError) {
      setMobileError(mobileValidationError);
      return;
    }

    // Format mobile number before sending
    const formattedMobile = formatIndianMobile(mobile);

    const result = await register(name, email, password, formattedMobile);
    if (result && result.tempUserId) {
      setTempUserId(result.tempUserId);
      setStep(2);
    }
  };

  const handleVerifyOTP = async e => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      return;
    }

    const user = await verifyRegistration(tempUserId, otp);
    if (user) navigate('/');
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;

    const result = await resendOtp(tempUserId);
    if (result) {
      setResendDisabled(true);
      setResendCountdown(30); // 30 second countdown
      const timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            setResendDisabled(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleBackToForm = () => {
    setStep(1);
    setOtp('');
    setTempUserId(null);
    setResendDisabled(false);
    setResendCountdown(0);
  };

  return (
    <div className="register">
      <Navbar />
      <div className="register__container">
        <h2 className="register__title">
          {step === 1 ? 'Create Account' : 'Verify Your Mobile'}
        </h2>
        <p className="register__subtitle">
          {step === 1
            ? 'Create a customer account to shop'
            : 'Enter the 6-digit OTP sent to your mobile number'
          }
        </p>
        {error && <div className="register__error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="register__form">
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
              <label className="register__label">Mobile Number</label>
              <input
                value={mobile}
                onChange={handleMobileChange}
                type="tel"
                required
                className={`register__input ${mobileError ? 'register__input--error' : ''}`}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
              />
              {mobileError && <span className="register__field-error">{mobileError}</span>}
              <small className="register__field-hint">Enter 10-digit Indian mobile number (e.g., 9876543210)</small>
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
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="register__form">
            <div className="register__field">
              <label className="register__label">Enter OTP</label>
              <input
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                type="text"
                required
                className={`register__input ${otp.length === 6 ? 'register__input--complete' : ''}`}
                placeholder="000000"
                maxLength="6"
              />
              {otp.length === 6 && (
                <div className="register__otp-status">
                  <span className="register__otp-check">✓</span>
                  <span className="register__otp-ready">OTP ready for verification</span>
                </div>
              )}
              <small className="register__field-hint">Enter the 6-digit OTP sent to {mobile}</small>
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="register__button">
              {loading ? 'Verifying...' : otp.length === 6 ? 'Verify & Create Account' : 'Enter 6-digit OTP to continue'}
            </button>
            <div className="register__resend-section">
              <p className="register__resend-text">
                Didn't receive OTP?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || loading}
                  className="register__resend-link"
                >
                  {resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                </button>
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackToForm}
              className="register__back-button"
            >
              Back to Registration
            </button>
          </form>
        )}

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
