import { Link } from 'react-router-dom';
import '../styles/components/footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* Company Info */}
          <div>
            <div className="footer__company-info">
              <span className="footer__logo-emoji">
                <span className="navbar__logo-icon">
                  <img src="https://iili.io/f03PSlj.md.png" alt="FHAMMS Nutri Bites Logo" />
                </span>
              </span>
              <span className="footer__company-name">FHAMMS Nutri Bites</span>
            </div>
            <p className="footer__text">
              Your trusted destination for premium, handcrafted laddus. We deliver authentic taste and nutrition straight to your doorstep with guaranteed freshness and satisfaction.
            </p>
            <div className="footer__social">
              {['📘', '📷', '🐦'].map((icon, idx) => (
                <a key={idx} href="#" className="footer__social-link">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="footer__section-title">Quick Links</h3>
            <div className="footer__links-container">
              <Link to="/" className="footer__link">Home</Link>
              <Link to="/products" className="footer__link">Shop All</Link>
              <Link to="/about" className="footer__link">About Us</Link>
              <Link to="/contact" className="footer__link">Contact</Link>
              <Link to="/blog" className="footer__link">Blog</Link>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="footer__section-title">Customer Care</h3>
            <div className="footer__links-container">
              <Link to="/faq" className="footer__link">
                FAQ
              </Link>
              <Link to="/privacy-policy" className="footer__link">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="footer__link">
                Terms of Service
              </Link>
              <Link to="/shipping-policy" className="footer__link">
                Shipping Policy
              </Link>
              {['Returns & Refunds'].map(link => (
                <a key={link} href="#" className="footer__link">
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="footer__section-title">Contact Us</h3>
            <div className="footer__contact-container">
              <div className="footer__contact-item footer__contact-item--address">
                <span>📍</span>
                <span>Guntur | Hyderabad</span>
              </div>
              <div className="footer__contact-item">
                <span>📞</span>
                <span>+91-7893873609</span>
              </div>
              <div className="footer__contact-item">
                <span>✉️</span>
                <span>fhammsnutribites@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div>© 2025 FHAMMS Nutri Bites. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
