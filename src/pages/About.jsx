import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../SEO.jsx';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/about.css';

function About() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="about container">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
        <SEO 
          title="About Us | FHAMMS Nutri Bites"
          description="Learn about FHAMMS Nutri Bites - your trusted destination for premium, handcrafted dry fruit laddus made with authentic ingredients."
          keywords="about FHAMMS Nutri Bites, dry fruit laddus story, premium laddus, handmade laddus"
        />
        <h1>About FHAMMS Nutri Bites</h1>
        <p>Welcome to FHAMMS Nutri Bites, where tradition meets nutrition. We are dedicated to providing premium, handcrafted dry fruit laddus made with the finest ingredients.</p>
        <p>Our mission is to deliver authentic taste and nutrition straight to your doorstep with guaranteed freshness and satisfaction.</p>
      </div>
      <Footer />
    </>
  );
}
export default About;