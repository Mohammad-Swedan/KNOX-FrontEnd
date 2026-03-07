import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Loader2, Search, CheckCircle, XCircle } from "lucide-react";
import { verifyCertificate } from "../api";
import type { Certificate } from "../types";

export default function CertificateVerifier() {
  const [certNumber, setCertNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim()) return;
    setLoading(true);
    setError(null);
    setCertificate(null);
    setSearched(true);
    try {
      const cert = await verifyCertificate(certNumber.trim());
      setCertificate(cert);
    } catch (err) {
      console.error("Verification failed:", err);
      setError("Certificate not found or verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleVerify} className="flex gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="certNumber">Certificate Number</Label>
          <Input
            id="certNumber"
            value={certNumber}
            onChange={(e) => setCertNumber(e.target.value)}
            placeholder="Enter certificate number"
          />
        </div>
        <Button type="submit" disabled={loading || !certNumber.trim()} className="mt-8 cursor-pointer">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Verify
            </>
          )}
        </Button>
      </form>

      {searched && !loading && error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-6">
            <XCircle className="h-8 w-8 text-destructive" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {certificate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Certificate Details</CardTitle>
              <Badge
                className={
                  certificate.isValid
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }
              >
                {certificate.isValid ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Valid
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> Invalid
                  </span>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Student</p>
                <p className="font-medium">{certificate.studentName ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Course</p>
                <p className="font-medium">{certificate.courseName ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Certificate Number</p>
                <p className="font-medium">{certificate.certificateNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Issued</p>
                <p className="font-medium">
                  {new Date(certificate.issuedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {certificate.pdfUrl && (
              <Button asChild variant="outline" className="mt-2">
                <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
