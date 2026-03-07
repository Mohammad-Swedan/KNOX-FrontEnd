import CertificateVerifier from "../components/CertificateVerifier";

const CertificateVerifyPage = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Verify Certificate</h1>
      <p className="text-muted-foreground mb-6">
        Enter a certificate number to verify its authenticity.
      </p>
      <CertificateVerifier />
    </div>
  );
};

export default CertificateVerifyPage;
