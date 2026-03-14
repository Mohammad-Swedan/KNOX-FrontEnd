import { useNavigate } from "react-router-dom";
import SEO from "@/shared/components/seo/SEO";
import {
  Award,
  Download,
  ExternalLink,
  Loader2,
  RotateCcw,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  BadgeCheck,
  XCircle,
  Calendar,
  Hash,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { useMyCertificates } from "../hooks/useEnrollment";
import type { Certificate } from "../types";

// ── Certificate Card ───────────────────────────────────────

const CertificateCard = ({ cert }: { cert: Certificate }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const verifyUrl = `${window.location.origin}/certificates/verify?number=${cert.certificateNumber}`;

  const handleCopyVerifyLink = () => {
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setCopied(true);
      toast.success("Verify link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (cert.pdfUrl) {
      window.open(cert.pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  const formattedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card
      className="group relative overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/certificates/${cert.id}`)}
    >
      {/* Decorative top bar */}
      <div className="h-1.5 bg-linear-to-r from-primary via-primary/70 to-emerald-500" />

      <CardContent className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <Badge
            variant={cert.isValid ? "default" : "destructive"}
            className="gap-1 shrink-0"
          >
            {cert.isValid ? (
              <>
                <BadgeCheck className="h-3 w-3" />
                Valid
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Invalidated
              </>
            )}
          </Badge>
        </div>

        {/* Course name */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Certificate of Completion
          </p>
          <h3 className="font-bold text-base leading-snug line-clamp-2">
            {cert.courseName ?? "Course"}
          </h3>
          {cert.studentName && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {cert.studentName}
            </p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Issued {formattedDate}
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <Hash className="h-3.5 w-3.5" />
            {cert.certificateNumber}
          </span>
        </div>

        {/* Action buttons */}
        <div
          className="flex items-center gap-2 pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 text-xs cursor-pointer"
            disabled={!cert.pdfUrl}
            onClick={handleDownload}
            title={!cert.pdfUrl ? "PDF not available yet" : undefined}
          >
            <Download className="h-3.5 w-3.5" />
            {cert.pdfUrl ? "Download PDF" : "PDF Pending"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs cursor-pointer"
            onClick={handleCopyVerifyLink}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Share"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Main Page ──────────────────────────────────────────────

const MyCertificatesPage = () => {
  const { certificates, loading, error, refetch } = useMyCertificates();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground animate-pulse">
          Loading your certificates…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <RotateCcw className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <p className="font-semibold text-lg">Something went wrong</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
        <Button variant="outline" onClick={refetch} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <>
        <SEO
          title="My Certificates | eCampus"
          description="View and download your earned course certificates."
          noIndex={true}
          hreflang={false}
        />
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
              <GraduationCap className="h-12 w-12 text-primary/60" />
            </div>
            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-amber-400/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <div className="max-w-sm">
            <h2 className="text-2xl font-bold mb-2">No certificates yet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Complete all lessons in a course to earn your certificate. Start
              learning and finish a course today!
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => (window.location.href = "/browse/product-courses")}
            className="gap-2 rounded-full px-8 shadow-md hover:shadow-lg transition-shadow"
          >
            <Award className="h-5 w-5" />
            Explore Courses
          </Button>
        </div>
      </>
    );
  }

  const validCount = certificates.filter((c) => c.isValid).length;

  return (
    <>
      <SEO
        title="My Certificates | eCampus"
        description="View and download your earned course certificates."
        noIndex={true}
        hreflang={false}
      />
      <div className="min-h-screen bg-background">
        {/* ── Hero / Header ─────────────────────────────── */}
        <div className="bg-linear-to-br from-primary/8 via-background to-background border-b border-border/40">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-widest">
                    Achievements
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  My Certificates
                </h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                  Your earned certificates of completion.
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = "/certificates/verify")}
                variant="outline"
                className="self-start sm:self-auto gap-2 rounded-full border-primary/30 hover:border-primary/60 transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                Verify a Certificate
              </Button>
            </div>

            {/* ── Stat cards ──────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 max-w-sm">
              <div className="rounded-xl p-4 bg-primary/8 flex flex-col gap-1">
                <Award className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">{certificates.length}</p>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
              <div className="rounded-xl p-4 bg-emerald-500/8 flex flex-col gap-1">
                <BadgeCheck className="h-5 w-5 text-emerald-500" />
                <p className="text-2xl font-bold">{validCount}</p>
                <p className="text-xs text-muted-foreground">Valid</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Certificate Grid ───────────────────────────── */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {certificates.length} Certificate
              {certificates.length !== 1 ? "s" : ""}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ExternalLink className="h-3.5 w-3.5" />
              Click a card for details
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyCertificatesPage;
