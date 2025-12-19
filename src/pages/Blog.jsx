import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../SEO.jsx';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/blog.css';

function Blog() {
  const navigate = useNavigate();
  return (
    <>
      <Navbar />
      <div className="blog container">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
        <SEO 
          title="Blog | FHAMMS Nutri Bites"
          description="Read our latest blog posts about healthy eating, dry fruit benefits, and nutrition tips from FHAMMS Nutri Bites."
          keywords="dry fruit blog, nutrition tips, healthy eating, laddus recipes"
        />
        <h1>Our Blog</h1>
        <p>Stay updated with the latest news, tips, and insights about nutrition and healthy eating.</p>
        <p>Coming soon: Articles on the benefits of dry fruits, traditional recipes, and wellness tips.</p>
      </div>
      <Footer />
    </>
  );
}
export default Blog;