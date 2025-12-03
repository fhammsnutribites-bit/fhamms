import { Link } from 'react-router-dom';
import '../styles/components/footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* Company Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px' }}>🍪</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>NutriBites Laddus</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Home', 'Shop All', 'About Us', 'Contact', 'Blog'].map(link => (
                <Link
                  key={link}
                  to={link === 'Home' ? '/' : '#'}
                  className="footer__link"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="footer__section-title">Customer Care</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['FAQ', 'Shipping Policy', 'Returns & Refunds', 'Privacy Policy', 'Terms of Service'].map(link => (
                <a key={link} href="#" className="footer__link">
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="footer__section-title">Contact Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '10px', color: '#b0bec5' }}>
                <span>📍</span>
                <span>123 Shopping Street, E-commerce City, EC 12345, USA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b0bec5' }}>
                <span>📞</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b0bec5' }}>
                <span>✉️</span>
                <span>hello@nutribitesladdus.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div>© 2024 NutriBites Laddus. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '10px' }}>
            <span>Payment Methods:</span>
            <div style={{ display: 'flex', gap: '10px', fontSize: '20px' }}>
              {['💳', '💳', '💳', '💳'].map((icon, idx) => (
                <span key={idx}>{icon}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
