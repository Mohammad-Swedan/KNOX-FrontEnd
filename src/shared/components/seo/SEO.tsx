import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
  /** Canonical URL override (defaults to current window URL) */
  canonical?: string;
  /** Pass false to skip hreflang tags (e.g. dashboard pages) */
  hreflang?: boolean;
  children?: React.ReactNode;
}

const SITE_NAME = "eCampus";
const BASE_URL = "https://ecampusjo.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

const SEO = ({
  title,
  description,
  keywords,
  image = DEFAULT_OG_IMAGE,
  url,
  type = "website",
  noIndex = false,
  canonical,
  hreflang = true,
  children,
}: SEOProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const lang = i18n.language || "ar";

  // ── Default copy (Arabic-first, since primary audience is Jordanian) ────────
  const defaultTitle = isRTL
    ? `${SITE_NAME} | منصة ايكامبس - منصة التعلم الجامعي للجامعات الأردنية`
    : `${SITE_NAME} | eCampus Platform - University Learning Platform Jordan`;

  const defaultDescription = isRTL
    ? "منصة ايكامبس eCampus - المنصة التعليمية الشاملة لطلاب الجامعات الأردنية. مواد دراسية، ملازم، اختبارات سابقة، كويزات، وكورسات لجميع الجامعات الأردنية."
    : "eCampus platform - The comprehensive learning platform for Jordanian university students. Study materials, past exams, quizzes, and courses for all Jordanian universities.";

  const defaultKeywords = isRTL
    ? "eCampus, ايكامبس, منصة ايكامبس, ecampusjo, منصة تعليمية اردنية, جامعات الاردن, طلاب جامعيين, مواد دراسية, ملازم جامعية, اختبارات سابقة, كويزات جامعية, كورسات جامعية, الجامعة الأردنية, جامعة اليرموك, جامعة العلوم والتكنولوجيا, الجامعة الهاشمية, جامعة مؤتة, جامعة البلقاء التطبيقية"
    : "eCampus, ecampusjo, eCampus platform, Jordanian university platform, Jordan students, study materials, past exams, university quizzes, online courses Jordan, Jordanian universities";

  // ── Computed values ──────────────────────────────────────────────────────────
  const pageTitle = title ? `${title} | ${SITE_NAME}` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;

  const currentUrl =
    url ||
    canonical ||
    (typeof window !== "undefined" ? window.location.href : BASE_URL);

  const canonicalUrl = canonical || currentUrl;

  // Build clean base path for hreflang (strip ?lang=... if present)
  const basePath =
    typeof window !== "undefined"
      ? window.location.pathname
      : canonicalUrl.replace(BASE_URL, "");

  const arUrl = `${BASE_URL}${basePath}`;
  const enUrl = `${BASE_URL}${basePath}?lang=en`;

  return (
    <Helmet>
      {/* Document language */}
      <html lang={lang} dir={isRTL ? "rtl" : "ltr"} />

      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content="eCampus Team" />
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />
      <meta name="language" content={lang} />
      <meta name="geo.region" content="JO" />
      <meta name="geo.country" content="Jordan" />
      <meta name="copyright" content={SITE_NAME} />

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Hreflang – bilingual Arabic / English */}
      {hreflang && !noIndex && (
        <>
          <link rel="alternate" hrefLang="ar" href={arUrl} />
          <link rel="alternate" hrefLang="en" href={enUrl} />
          <link rel="alternate" hrefLang="x-default" href={arUrl} />
        </>
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE_NAME} - منصة ايكامبس`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={isRTL ? "ar_JO" : "en_US"} />
      <meta
        property="og:locale:alternate"
        content={isRTL ? "en_US" : "ar_JO"}
      />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ecampusjo" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} - منصة ايكامبس`} />

      {/* PWA / App Meta */}
      <meta name="theme-color" content="#003450" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />

      {children}
    </Helmet>
  );
};

export default SEO;
