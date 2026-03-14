import { useNavigate, useParams } from "react-router-dom";
import SEO from "@/shared/components/seo/SEO";
import {
  Award,
  Download,
  ArrowLeft,
  Loader2,
  BadgeCheck,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Hash,
  User,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { useCertificate } from "../hooks/useEnrollment";

const CertificateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const certId = id ? parseInt(id) : undefined;

  const { certificate, loading, error } = useCertificate(certId);
  const [copied, setCopied] = useState(false);

  const handleCopyVerifyLink = () => {
    if (!certificate) return;
    const url = `${window.location.origin}/certificates/verify?number=${certificate.certificateNumber}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Verify link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (certificate?.pdfUrl) {
      window.open(certificate.pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground animate-pulse">
          Loading certificate…
        </p>
      </div>
    );
  }

  // ── Error / Not found ──────────────────────────────────────
  if (error || !certificate) {
    return (
      <>
        <SEO
          title="Certificate Not Found | eCampus"
          noIndex={true}
          hreflang={false}
        />
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
            <Award className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div>
            <p className="font-semibold text-xl">Certificate not found</p>
            <p className="text-muted-foreground text-sm mt-2">
              This certificate doesn't exist or doesn't belong to your account.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate("/my-certificates")}
              className="gap-2"
            >
              <Award className="h-4 w-4" />
              My Certificates
            </Button>
          </div>
        </div>
      </>
    );
  }

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  // ── Detail view ────────────────────────────────────────────
  return (
    <>
      <SEO
        title={`${certificate.courseName ?? "Certificate"} | eCampus`}
        description={`Certificate of completion for ${certificate.courseName ?? "a course"} — issued to ${certificate.studentName ?? "student"}.`}
        noIndex={true}
        hreflang={false}
      />
      <div className="min-h-screen bg-background">
        {/* ── Back bar ───────────────────────────────── */}
        <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 max-w-3xl flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="cursor-pointer shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium truncate">
              Certificate Detail
            </span>
          </div>
        </div>

        {/* ── Certificate card ───────────────────────── */}
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          {/* Visual certificate */}
          <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
            {/* Top gradient strip */}
            <div className="h-2 bg-linear-to-r from-primary via-primary/70 to-emerald-500" />

            <CardContent className="p-8 sm:p-12 space-y-8">
              {/* Centered header */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    eCampus — Certificate of Completion
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {certificate.courseName ?? "Course"}
                  </h1>
                </div>

                {/* Validity badge */}
                <Badge
                  variant={certificate.isValid ? "default" : "destructive"}
                  className="gap-1.5 px-3 py-1 text-sm"
                >
                  {certificate.isValid ? (
                    <>
                      <BadgeCheck className="h-4 w-4" /> Valid Certificate
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" /> Certificate Invalidated
                    </>
                  )}
                </Badge>
              </div>

              <Separator />

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Issued To</p>
                    <p className="font-semibold">
                      {certificate.studentName ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Course</p>
                    <p className="font-semibold">
                      {certificate.courseName ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Issue Date</p>
                    <p className="font-semibold">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Certificate Number
                    </p>
                    <p className="font-mono font-semibold text-sm">
                      {certificate.certificateNumber}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  disabled={!certificate.pdfUrl}
                  onClick={handleDownload}
                  className="gap-2 cursor-pointer"
                  title={
                    !certificate.pdfUrl ? "PDF not available yet" : undefined
                  }
                >
                  <Download className="h-5 w-5" />
                  {certificate.pdfUrl ? "Download PDF" : "PDF Pending"}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleCopyVerifyLink}
                  className="gap-2 cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                  {copied ? "Link Copied!" : "Copy Verify Link"}
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() =>
                    navigate(
                      `/certificates/verify?number=${certificate.certificateNumber}`,
                    )
                  }
                  className="gap-2 cursor-pointer"
                >
                  <ShieldCheck className="h-5 w-5" />
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Back to my certificates */}
          <div className="mt-6 flex justify-center">
            <Button
              variant="link"
              onClick={() => navigate("/my-certificates")}
              className="gap-2 text-muted-foreground hover:text-primary cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Certificates
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CertificateDetailPage;
