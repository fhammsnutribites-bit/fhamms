import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../SEO.jsx';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/contact.css';

function Contact() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="contact container">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
        <SEO 
          title="Contact Us | FHAMMS Nutri Bites"
          description="Get in touch with FHAMMS Nutri Bites. Reach out for inquiries, support, or feedback about our premium dry fruit laddus."
          keywords="contact FHAMMS Nutri Bites, customer support, dry fruit laddus inquiries"
        />
        <h1>Contact Us</h1>
        <p>We'd love to hear from you! Reach out to us for any questions, feedback, or support.</p>
        <div className="contact-info">
          <div>
            <h3>📍 Address</h3>
            <p>Guntur | Hyderabad</p>
          </div>
          <div>
            <h3>📞 Phone</h3>
            <p>+91-7893873609</p>
          </div>
          <div>
            <h3>✉️ Email</h3>
            <p>fhammsnutribites@gmail.com</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
export default Contact;