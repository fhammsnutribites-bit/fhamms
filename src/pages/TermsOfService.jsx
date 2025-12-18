import { useNavigate, } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../SEO.jsx';
import { termsOfServiceData } from '../utils/termsOfServiceData.js';
import '../styles/pages/terms-of-service.css';
import { useEffect } from 'react';
function TermsOfService() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="terms-of-service">
      <SEO
        title="Terms of Service | NutriBites Laddus"
        description="Read our terms of service to understand the rules and guidelines for using NutriBites Laddus website and services."
        keywords="terms of service, terms and conditions, NutriBites terms, service agreement"
      />
      <Navbar />

      <div className="terms-of-service__container">
        <div className="terms-of-service__header">
          <button
            className="terms-of-service__back-button"
            onClick={handleGoBack}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className="terms-of-service__title">Terms of Service</h1>
          <p className="terms-of-service__last-updated">
            Last Updated: {termsOfServiceData.lastUpdated}
          </p>
        </div>

        <div className="terms-of-service__content">
          {termsOfServiceData.sections.map((section) => (
            <section key={section.id} className="terms-of-service__section">
              <h2 className="terms-of-service__section-title">{section.title}</h2>

              {section.content.map((item, index) => (
                <div key={index} className="terms-of-service__section-content">
                  {item.subtitle && (
                    <h3 className="terms-of-service__subsection-title">{item.subtitle}</h3>
                  )}

                  {item.text && (
                    <p className="terms-of-service__text">{item.text}</p>
                  )}

                  {item.list && (
                    <ul className="terms-of-service__list">
                      {item.list.map((listItem, listIndex) => (
                        <li key={listIndex} className="terms-of-service__list-item">
                          {listItem}
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.contact && (
                    <div className="terms-of-service__contact">
                      {item.contact.map((contactItem, contactIndex) => (
                        <div key={contactIndex} className="terms-of-service__contact-item">
                          {contactItem}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TermsOfService;
