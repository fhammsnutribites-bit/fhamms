import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../SEO.jsx';
import { shippingPolicyData } from '../utils/shippingPolicyData.js';
import '../styles/pages/shipping-policy.css';
import { useEffect } from 'react';
function ShippingPolicy() {
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
    <div className="shipping-policy">
      <SEO
        title="Shipping Policy | NutriBites Laddus"
        description="Learn about our shipping methods, delivery times, costs, and policies for ordering premium dry fruit laddus."
        keywords="shipping policy, delivery information, shipping rates, NutriBites shipping, laddu delivery"
      />
      <Navbar />

      <div className="shipping-policy__container">
        <div className="shipping-policy__header">
          <button
            className="shipping-policy__back-button"
            onClick={handleGoBack}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className="shipping-policy__title">Shipping Policy</h1>
          <p className="shipping-policy__last-updated">
            Last Updated: {shippingPolicyData.lastUpdated}
          </p>
        </div>

        <div className="shipping-policy__content">
          {shippingPolicyData.sections.map((section) => (
            <section key={section.id} className="shipping-policy__section">
              <h2 className="shipping-policy__section-title">{section.title}</h2>

              {section.content.map((item, index) => (
                <div key={index} className="shipping-policy__section-content">
                  {item.subtitle && (
                    <h3 className="shipping-policy__subsection-title">{item.subtitle}</h3>
                  )}

                  {item.text && (
                    <p className="shipping-policy__text">{item.text}</p>
                  )}

                  {item.list && (
                    <ul className="shipping-policy__list">
                      {item.list.map((listItem, listIndex) => (
                        <li key={listIndex} className="shipping-policy__list-item">
                          {listItem}
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.contact && (
                    <div className="shipping-policy__contact">
                      {item.contact.map((contactItem, contactIndex) => (
                        <div key={contactIndex} className="shipping-policy__contact-item">
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

export default ShippingPolicy;
