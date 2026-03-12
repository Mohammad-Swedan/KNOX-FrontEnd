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
  children?: React.ReactNode;
}

const SEO = ({
  title,
  description,
  keywords,
  image = "/og-image.png",
  url,
  type = "website",
  noIndex = false,
  children,
}: SEOProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const lang = i18n.language;

  const siteName = "Uni-Hub";
  const defaultTitle = isRTL
    ? "يوني-هاب | منصة التعلم الجامعي الشاملة"
    : "Uni-Hub | Your Complete University Learning Platform";
  const defaultDescription = isRTL
    ? "منصة تعليمية شاملة للطلاب الجامعيين. احصل على مواد دراسية، اختبارات تفاعلية، وإرشاد أكاديمي ذكي. انضم لآلاف الطلاب الناجحين."
    : "A comprehensive learning platform for university students. Access study materials, interactive quizzes, and AI-powered academic guidance. Join thousands of successful students.";
  const defaultKeywords = isRTL
    ? "تعليم جامعي، مواد دراسية، اختبارات، ملخصات، جامعة، طلاب، تعلم، منصة تعليمية، اختبارات تفاعلية"
    : "university education, study materials, quizzes, notes, university, students, learning, educational platform, interactive quizzes";

  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={lang} dir={isRTL ? "rtl" : "ltr"} />
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content="Uni-Hub Team" />
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />
      <meta name="language" content={lang} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={isRTL ? "ar_SA" : "en_US"} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta */}
      {/* 'theme-color' is not supported by Firefox, Firefox for Android, Opera, but is safe to include for supported browsers */}
      <meta name="theme-color" content="#003450" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Canonical URL */}
      {pageUrl && <link rel="canonical" href={pageUrl} />}

      {children}
    </Helmet>
  );
};

export default SEO;
