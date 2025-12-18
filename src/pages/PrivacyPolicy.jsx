import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../SEO.jsx';
import { privacyPolicyData } from '../utils/privacyPolicyData.js';
import '../styles/pages/privacy-policy.css';
import { useEffect } from 'react';

function PrivacyPolicy() {
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
    <div className="privacy-policy">
      <SEO
        title="Privacy Policy | NutriBites Laddus"
        description="Learn about how NutriBites Laddus collects, uses, and protects your personal information. Our privacy policy explains our data practices and your rights."
        keywords="privacy policy, data protection, personal information, NutriBites privacy"
      />
      <Navbar />

      <div className="privacy-policy__container">
        <div className="privacy-policy__header">
          <button
            className="privacy-policy__back-button"
            onClick={handleGoBack}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className="privacy-policy__title">Privacy Policy</h1>
          <p className="privacy-policy__last-updated">
            Last Updated: {privacyPolicyData.lastUpdated}
          </p>
        </div>

        <div className="privacy-policy__content">
          {privacyPolicyData.sections.map((section) => (
            <section key={section.id} className="privacy-policy__section">
              <h2 className="privacy-policy__section-title">{section.title}</h2>

              {section.content.map((item, index) => (
                <div key={index} className="privacy-policy__section-content">
                  {item.subtitle && (
                    <h3 className="privacy-policy__subsection-title">{item.subtitle}</h3>
                  )}

                  {item.text && (
                    <p className="privacy-policy__text">{item.text}</p>
                  )}

                  {item.list && (
                    <ul className="privacy-policy__list">
                      {item.list.map((listItem, listIndex) => (
                        <li key={listIndex} className="privacy-policy__list-item">
                          {listItem}
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.contact && (
                    <div className="privacy-policy__contact">
                      {item.contact.map((contactItem, contactIndex) => (
                        <div key={contactIndex} className="privacy-policy__contact-item">
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

export default PrivacyPolicy;
