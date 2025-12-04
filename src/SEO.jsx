import { Helmet } from "react-helmet";

export default function SEO() {
  return (
    <Helmet>
      <title>FHAMMS Nutri Bites | Healthy Snacks, Chikkis & Laddoos</title>

      <meta
        name="description"
        content="Discover premium healthy snacks from FHAMMS Nutri Bites — Dry Fruit Chikkis, Nutri Bites, Laddoos, and nutritious delights made with quality ingredients."
      />

      <meta
        name="keywords"
        content="Fhamms, Nutri Bites, Healthy Snacks, Chikki, Laddoo, Dry Fruit Snacks, Jaggery Sweets, Healthy Indian Snacks, Natural Snacks"
      />

      <meta name="author" content="FHAMMS Nutri Bites" />

      {/* Google Search Console */}
      <meta
        name="google-site-verification"
        content="8nI_GhZVwW8DDUD3_dwGA6ZiiYJ6HdFSn2OVVwzwwkQ"
      />

      {/* Open Graph */}
      <meta property="og:title" content="FHAMMS Nutri Bites" />
      <meta
        property="og:description"
        content="Wholesome goodness in every bite — premium healthy snacks made with care."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://fhamms.vercel.app/" />
      <meta property="og:image" content="https://fhamms.vercel.app/og-image.jpg" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="FHAMMS Nutri Bites" />
      <meta
        name="twitter:description"
        content="Healthy snacks crafted with quality ingredients."
      />
      <meta name="twitter:image" content="https://fhamms.vercel.app/og-image.jpg" />

      <link rel="canonical" href="https://fhamms.vercel.app/" />
    </Helmet>
  );
}
