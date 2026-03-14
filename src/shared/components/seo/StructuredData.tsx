/**
 * StructuredData — JSON-LD Schema.org component for eCampus
 * ==========================================================
 * Injects <script type="application/ld+json"> blocks via react-helmet-async.
 * Supports: Organization, WebSite (SearchAction), Course, BreadcrumbList, FAQPage.
 *
 * Usage examples:
 *
 *   // On the homepage — renders Organization + WebSite schemas
 *   <StructuredData type="organization" />
 *   <StructuredData type="website" />
 *
 *   // On a course detail page
 *   <StructuredData
 *     type="course"
 *     data={{ name: "Calculus I", description: "...", provider: "JUST" }}
 *   />
 *
 *   // On university/faculty/major hierarchy pages
 *   <StructuredData
 *     type="breadcrumb"
 *     data={{
 *       items: [
 *         { name: "الجامعات", url: "/courses" },
 *         { name: "جامعة اليرموك", url: "/dashboard/universities/3/faculties/..." },
 *         { name: "كلية الهندسة", url: "..." },
 *       ],
 *     }}
 *   />
 */

import { Helmet } from "react-helmet-async";

const BASE_URL = "https://ecampusjo.com";
const LOGO_URL = `${BASE_URL}/logo.png`;

// ─── Type definitions ─────────────────────────────────────────────────────────

interface CourseData {
  name: string;
  description?: string;
  provider?: string;
  url?: string;
  image?: string;
  educationalLevel?: string;
  inLanguage?: string[];
  price?: number;
  priceCurrency?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbData {
  items: BreadcrumbItem[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqData {
  faqs: FaqItem[];
}

type StructuredDataType =
  | "organization"
  | "website"
  | "course"
  | "breadcrumb"
  | "faq";

interface StructuredDataProps {
  type: StructuredDataType;
  data?: CourseData | BreadcrumbData | FaqData;
}

// ─── Schema builders ──────────────────────────────────────────────────────────

function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "eCampus",
    alternateName: ["منصة ايكامبس", "ecampusjo", "eCampus Platform", "ايكامبس"],
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      width: 200,
      height: 60,
    },
    description:
      "منصة ايكامبس eCampus - المنصة التعليمية الأردنية الشاملة لطلاب الجامعات. مواد دراسية، ملازم، اختبارات سابقة، وكورسات لجميع الجامعات الأردنية.",
    foundingDate: "2023",
    areaServed: {
      "@type": "Country",
      name: "Jordan",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Arabic", "English"],
    },
    sameAs: [
      "https://www.instagram.com/ecampusjo",
      "https://www.facebook.com/ecampusjo",
      "https://twitter.com/ecampusjo",
    ],
  };
}

function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "eCampus | منصة ايكامبس",
    alternateName: "ecampusjo",
    url: BASE_URL,
    description:
      "منصة تعليمية شاملة لطلاب الجامعات الأردنية - مواد دراسية، ملازم، كويزات، واختبارات سابقة",
    inLanguage: ["ar", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/courses?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function buildCourseSchema(data: CourseData) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: data.name,
    description:
      data.description ||
      `تعلم ${data.name} على منصة ايكامبس eCampus - مواد دراسية، ملازم، وكويزات`,
    url: data.url || BASE_URL,
    image: data.image || `${BASE_URL}/og-image.png`,
    educationalLevel: data.educationalLevel || "University",
    inLanguage: data.inLanguage || ["ar", "en"],
    provider: {
      "@type": "Organization",
      name: data.provider
        ? `${data.provider} - eCampus`
        : "eCampus | منصة ايكامبس",
      url: BASE_URL,
    },
    offers:
      data.price !== undefined
        ? {
            "@type": "Offer",
            price: data.price,
            priceCurrency: data.priceCurrency || "JOD",
            availability: "https://schema.org/InStock",
            validFrom: new Date().toISOString().split("T")[0],
          }
        : {
            "@type": "Offer",
            price: 0,
            priceCurrency: "JOD",
            availability: "https://schema.org/InStock",
          },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      inLanguage: ["ar", "en"],
    },
  };
}

function buildBreadcrumbSchema(data: BreadcrumbData) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "eCampus",
        item: BASE_URL,
      },
      ...data.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
      })),
    ],
  };
}

function buildFaqSchema(data: FaqData) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const StructuredData = ({ type, data }: StructuredDataProps) => {
  let schema: object | null = null;

  switch (type) {
    case "organization":
      schema = buildOrganizationSchema();
      break;
    case "website":
      schema = buildWebSiteSchema();
      break;
    case "course":
      if (data) schema = buildCourseSchema(data as CourseData);
      break;
    case "breadcrumb":
      if (data) schema = buildBreadcrumbSchema(data as BreadcrumbData);
      break;
    case "faq":
      if (data) schema = buildFaqSchema(data as FaqData);
      break;
  }

  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema, null, 2)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
