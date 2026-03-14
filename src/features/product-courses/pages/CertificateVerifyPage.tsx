import { useTranslation } from "react-i18next";
import CertificateVerifier from "../components/CertificateVerifier";
import SEO from "@/shared/components/seo/SEO";

const CertificateVerifyPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t("seo.certificateVerify.title")}
        description={t("seo.certificateVerify.description")}
        keywords={t("seo.certificateVerify.keywords")}
        canonical="https://ecampusjo.com/certificates/verify"
      />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Verify Certificate</h1>
        <p className="text-muted-foreground mb-6">
          Enter a certificate number to verify its authenticity.
        </p>
        <CertificateVerifier />
      </div>
    </>
  );
};

export default CertificateVerifyPage;
