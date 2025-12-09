import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

export default function SEO({ 
  title, 
  description, 
  keywords,
  image,
  type = "website"
}) {
  const location = useLocation();
  const baseUrl = "https://fhamms.vercel.app";
  const currentUrl = `${baseUrl}${location.pathname}`;

  // Default values optimized for "dry fruit laddus"
  const defaultTitle = "Dry Fruit Laddus Online | Premium Nutri Laddus | FHAMMS Nutri Bites";
  const defaultDescription = "Buy premium dry fruit laddus online at FHAMMS Nutri Bites. Handmade dry fruit laddus with almonds, cashews, dates & jaggery. Best dry fruit laddus in India. Order now for healthy & delicious laddus.";
  const defaultKeywords = "dry fruit laddus, dry fruit laddu, dry fruit laddus online, buy dry fruit laddus, premium dry fruit laddus, dry fruit laddus price, best dry fruit laddus, dry fruit laddus near me, homemade dry fruit laddus, healthy dry fruit laddus, dry fruit laddus recipe, dry fruit laddus benefits, dry fruit laddus online shopping, dry fruit laddus delivery, dry fruit laddus india, nutri laddus, dry fruit laddus with jaggery, dry fruit laddus with dates, almond laddus, cashew laddus, dates laddus, healthy laddus, protein laddus, energy laddus";

  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const ogImage = image || `${baseUrl}/og-image.jpg`;

  return (
    <Helmet>
      <title>{seoTitle}</title>

      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content="FHAMMS Nutri Bites" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Google Search Console */}
      <meta
        name="google-site-verification"
        content="8nI_GhZVwW8DDUD3_dwGA6ZiiYJ6HdFSn2OVVwzwwkQ"
      />

      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="FHAMMS Nutri Bites" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Structured Data (JSON-LD) for better SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "FHAMMS Nutri Bites",
          "description": "Premium dry fruit laddus and healthy snacks online store",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`,
          "image": ogImage,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "reviewCount": "100+"
          },
          "offers": {
            "@type": "AggregateOffer",
            "offerCount": "20+",
            "lowPrice": "250",
            "highPrice": "2000",
            "priceCurrency": "INR"
          },
          "sameAs": [
            "https://www.facebook.com/fhamms",
            "https://www.instagram.com/fhamms"
          ]
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": baseUrl
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Dry Fruit Laddus",
              "item": `${baseUrl}/products`
            }
          ]
        })}
      </script>
    </Helmet>
  );
}
