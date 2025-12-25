import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { authApi } from '../services/authApi.js';
import { validateIndianMobile, formatIndianMobile, getMobileValidationError } from '../utils/validation.js';
import '../styles/pages/forgot-password.css';

function ForgotPassword() {
  const [mobile, setMobile] = useState('');
  const [formattedMobile, setFormattedMobile] = useState(''); // Store formatted mobile for API calls
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: enter mobile, 2: enter OTP, 3: enter new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const handleMobileChange = (e) => {
    const value = e.target.value;
    setMobile(value);

    // Clear error when user starts typing
    if (mobileError) {
      setMobileError('');
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    // Validate mobile number
    const mobileValidationError = getMobileValidationError(mobile);
    if (mobileValidationError) {
      setMobileError(mobileValidationError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Format mobile number before sending
      const formattedMobileNumber = formatIndianMobile(mobile);
      await authApi.sendOtp(formattedMobileNumber);
      
      // Store the formatted mobile for subsequent API calls
      setFormattedMobile(formattedMobileNumber);
      setSuccess('OTP sent to your mobile number');
      setStep(2);
      setResendCooldown(30); // 30 second cooldown
      
      // Start cooldown timer
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('OTP send error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.verifyOtp(formattedMobile, otp);
      
      setSuccess('OTP verified successfully');
      setStep(3);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword(mobile, newPassword);
      setSuccess('Password reset successfully');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password">
      <Navbar />
      <div className="forgot-password__container">
        <h2 className="forgot-password__title">Forgot Password</h2>
        <p className="forgot-password__subtitle">Reset your password using SMS OTP verification</p>

        {error && <div className="forgot-password__error">{error}</div>}
        {success && <div className="forgot-password__success">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="forgot-password__form">
            <div className="forgot-password__field">
              <label className="forgot-password__label">Mobile Number</label>
              <input
                value={mobile}
                onChange={handleMobileChange}
                type="tel"
                required
                className={`forgot-password__input ${mobileError ? 'forgot-password__input--error' : ''}`}
                placeholder="Enter your registered mobile number"
                maxLength="10"
              />
              {mobileError && <span className="forgot-password__field-error">{mobileError}</span>}
              <small className="forgot-password__field-hint">Enter 10-digit Indian mobile number (e.g., 9876543210)</small>
            </div>
            <button type="submit" disabled={loading} className="forgot-password__button">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="forgot-password__form">
            <div className="forgot-password__field">
              <label className="forgot-password__label">Enter OTP</label>
              <input
                value={otp}
                onChange={e => setOtp(e.target.value)}
                type="text"
                required
                className="forgot-password__input"
                placeholder="Enter 6-digit OTP"
                maxLength="6"
              />
            </div>
            <button type="submit" disabled={loading} className="forgot-password__button">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="forgot-password__back-button">
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-password__form">
            <div className="forgot-password__field">
              <label className="forgot-password__label">New Password</label>
              <input
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                type="password"
                required
                className="forgot-password__input"
                placeholder="Enter new password"
              />
            </div>
            <button type="submit" disabled={loading} className="forgot-password__button">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="forgot-password__links">
          <p className="forgot-password__login-text">
            Remember your password? <Link to="/login" className="forgot-password__link">Sign In</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ForgotPassword;