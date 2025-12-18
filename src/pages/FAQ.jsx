import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../SEO.jsx';
import { faqData } from '../utils/faqData.js';
import '../styles/pages/faq.css';

function FAQ() {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
    setOpenQuestion(null); // Close any open questions when switching categories
  };

  const toggleQuestion = (questionId) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };

  return (
    <div className="faq">
      <SEO
        title="Frequently Asked Questions | NutriBites Laddus"
        description="Find answers to common questions about our premium dry fruit laddus, health benefits, ordering, delivery, and quality standards."
        keywords="dry fruit laddus FAQ, laddu questions, nutribites FAQ, dry fruit questions, healthy laddus FAQ"
      />
      <Navbar />

      <div className="faq__container">
        <div className="faq__header">
          <button
            className="faq__back-button"
            onClick={handleGoBack}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className="faq__title">Frequently Asked Questions</h1>
          <p className="faq__subtitle">
            Everything you need to know about our premium dry fruit laddus
          </p>
        </div>

        <div className="faq__content">
          {faqData.map((category) => (
            <div key={category.id} className="faq__category">
              <button
                className="faq__category-header"
                onClick={() => toggleCategory(category.id)}
              >
                <h2 className="faq__category-title">{category.category}</h2>
                <span className="faq__category-icon">
                  {openCategory === category.id ? '−' : '+'}
                </span>
              </button>

              {openCategory === category.id && (
                <div className="faq__questions">
                  {category.questions.map((item, index) => (
                    <div key={index} className="faq__question-item">
                      <button
                        className="faq__question-header"
                        onClick={() => toggleQuestion(`${category.id}-${index}`)}
                      >
                        <span className="faq__question-text">{item.question}</span>
                        <span className="faq__question-icon">
                          {openQuestion === `${category.id}-${index}` ? '−' : '+'}
                        </span>
                      </button>

                      {openQuestion === `${category.id}-${index}` && (
                        <div className="faq__answer">
                          <p>{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="faq__contact">
          <div className="faq__contact-content">
            <h2 className="faq__contact-title">Still have questions?</h2>
            <p className="faq__contact-text">
              Can't find the answer you're looking for? Our customer service team is here to help!
            </p>
            <div className="faq__contact-info">
              <div className="faq__contact-item">
                <span className="faq__contact-icon">📧</span>
                <div>
                  <strong>Email us:</strong>
                  <br />
                  hello@nutribitesladdus.com
                </div>
              </div>
              <div className="faq__contact-item">
                <span className="faq__contact-icon">📞</span>
                <div>
                  <strong>Call us:</strong>
                  <br />
                  +1 (555) 123-4567
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default FAQ;
