import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import '../styles/components/navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">
        {/* <span className="navbar__logo-icon"><img src='https://img.sanishtech.com/u/58c68d9880d9312fc6cd4f952b2fd642.jpg' alt="FHAMMS NutriBites Logo" /></span> */}
        <span className="navbar__logo-icon"><img src='https://iili.io/f03PSlj.md.png' alt="FHAMMS NutriBites Logo" /></span>
        <span className="navbar__logo-text">FHAMMS Nutri Bites</span>
      </Link>

      <button
        className="navbar__menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      <div className="navbar__nav-links">
        <Link
          to="/"
          className={`navbar__nav-link ${location.pathname === '/' ? 'navbar__nav-link--active' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/products"
          className={`navbar__nav-link ${location.pathname.startsWith('/products') ? 'navbar__nav-link--active' : ''}`}
        >
          Products
        </Link>
        <span className="navbar__nav-link navbar__nav-link--disabled" title="Coming soon">About Us</span>
        <span className="navbar__nav-link navbar__nav-link--disabled" title="Coming soon">Blog</span>
      </div>

      <div className="navbar__right-section">
    
        <Link to="/cart" className="navbar__cart-link">
          🛒
          <span className="navbar__cart-badge">{cartItems.length || 0}</span>
        </Link>

        {user && (
          <>
            <Link
              to="/orders"
              className={`navbar__nav-link ${location.pathname.startsWith('/orders') ? 'navbar__nav-link--active' : ''}`}
            >
              📦 Orders
            </Link>
            <Link
              to="/account"
              className={`navbar__nav-link ${location.pathname.startsWith('/account') ? 'navbar__nav-link--active' : ''}`}
            >
              <span role="img" aria-label="account">👤</span> My Account
            </Link>
          </>
        )}

        {user ? (
          <div className="navbar__user-actions">
            {user.isAdmin && (
              <Link to="/admin" className="navbar__button navbar__button--admin">
                ⚙️ Admin
              </Link>
            )}
            <button onClick={logout} className="navbar__button">
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="navbar__button">
            Sign In
          </Link>
        )}
      </div>

      {mobileMenuOpen && (
        <div className={`navbar__mobile-menu ${mobileMenuOpen ? 'navbar__mobile-menu--open' : ''}`}>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`navbar__mobile-link ${location.pathname === '/' ? 'navbar__mobile-link--active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={`navbar__mobile-link ${location.pathname.startsWith('/products') ? 'navbar__mobile-link--active' : ''}`}
          >
            Products
          </Link>
          {user && (
            <>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`navbar__mobile-link ${location.pathname.startsWith('/orders') ? 'navbar__mobile-link--active' : ''}`}
              >
                📦 Orders
              </Link>
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className={`navbar__mobile-link ${location.pathname.startsWith('/account') ? 'navbar__mobile-link--active' : ''}`}
              >
                👤 My Account
              </Link>
            </>
          )}
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="navbar__mobile-link"
          >
            🛒 Cart ({cartItems.length || 0})
          </Link>
          {user && user.isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="navbar__button navbar__button--admin"
            >
              ⚙️ Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="navbar__button navbar__button--fullwidth"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="navbar__button navbar__button--centered"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
export default Navbar;
