import { Helmet } from "react-helmet-async";
import { meta } from "@/site/site";

export default function SEO({
  title,
  description,
  image = "/images/melt/cone-hero.webp",
}: {
  title?: string;
  description?: string;
  image?: string;
}) {
  const pageTitle = title ? `${title} | ${meta.title}` : meta.title;
  const pageDesc = description || meta.description;
  const url = "https://3dicecreamparlour.com";

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={`${url}${image}`} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={`${url}${image}`} />
      {/* Schema.org for Local Business */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "IceCreamShop",
          "name": meta.name,
          "image": `${url}${image}`,
          "@id": url,
          "url": url,
          "telephone": "+919876543210",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jubilee Hills",
            "addressLocality": "Hyderabad",
            "postalCode": "500033",
            "addressCountry": "IN"
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "11:00",
            "closes": "23:00"
          }
        })}
      </script>
    </Helmet>
  );
}
