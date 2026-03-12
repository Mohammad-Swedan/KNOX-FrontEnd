"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, ShieldCheck, SkipForward } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { useAuth } from "@/app/providers/useAuth";
import { sendVerificationOtp, verifyAccount } from "@/features/auth/api";

const RESEND_COOLDOWN = 60; // seconds
const OTP_LENGTH = 6;

interface VerifyAccountFormProps {
  email: string;
  /** Whether the user came from the profile (already logged in) */
  fromProfile?: boolean;
}

const VerifyAccountForm = ({
  email,
  fromProfile = false,
}: VerifyAccountFormProps) => {
  const navigate = useNavigate();
  const { loginWithTokens, isAuthenticated } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown
  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Auto-send OTP when the page loads
  const hasSentInitialOtp = useRef(false);
  useEffect(() => {
    if (hasSentInitialOtp.current) return;
    hasSentInitialOtp.current = true;

    const sendInitialOtp = async () => {
      try {
        await sendVerificationOtp({ email });
        toast.success("OTP sent", {
          description: "A verification code has been sent to your email.",
          duration: 3000,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to send OTP.";
        toast.error("Could not send OTP", { description: msg });
      }
      startCountdown();
    };

    sendInitialOtp();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [email, startCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Accept only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    // Move focus forward
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextEmpty =
      pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
    inputRefs.current[nextEmpty]?.focus();
  };

  const otpValue = otp.join("");
  const isOtpComplete = otpValue.length === OTP_LENGTH;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpComplete) return;

    setIsVerifying(true);
    setError(null);
    try {
      const result = await verifyAccount({ email, otp: otpValue });

      toast.success("Account verified!", {
        description: "Your account has been verified successfully.",
        duration: 3000,
      });

      // Use returned tokens to log the user in
      if (result.accessToken && result.refreshToken) {
        await loginWithTokens(result.accessToken, result.refreshToken);
        navigate(fromProfile ? "/profile" : "/", { replace: true });
      } else {
        navigate(isAuthenticated ? "/profile" : "/auth/login", {
          replace: true,
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Invalid or expired OTP.";
      setError(msg);
      toast.error("Verification failed", { description: msg });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setError(null);
    try {
      await sendVerificationOtp({ email });
      toast.success("OTP resent", {
        description: "A new OTP has been sent to your email.",
        duration: 3000,
      });
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      startCountdown();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend OTP.";
      toast.error("Could not resend OTP", { description: msg });
    } finally {
      setIsResending(false);
    }
  };

  const handleSkip = () => {
    toast.info("Verification skipped", {
      description: "You can verify your account later from your profile page.",
      duration: 4000,
    });
    navigate(isAuthenticated ? "/profile" : "/auth/login", { replace: true });
  };

  return (
    <form className="space-y-6" onSubmit={handleVerify}>
      {/* Email display */}
      <p className="text-sm text-muted-foreground text-center">
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-foreground">{email}</span>
      </p>

      {/* OTP Boxes */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            aria-label={`OTP digit ${index + 1}`}
            title={`OTP digit ${index + 1}`}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-lg border-2 bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              error
                ? "border-destructive focus:ring-destructive/50"
                : digit
                  ? "border-primary"
                  : "border-input"
            }`}
            disabled={isVerifying}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      {/* Verify Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!isOtpComplete || isVerifying}
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying…
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verify Account
          </>
        )}
      </Button>

      {/* Resend */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="gap-2"
        >
          {isResending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
        </Button>
      </div>

      {/* Skip */}
      <div className="border-t pt-4">
        <Button
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground gap-2"
          onClick={handleSkip}
        >
          <SkipForward className="h-4 w-4" />
          Skip for now (not recommended)
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Some features may be restricted until your account is verified.
        </p>
      </div>
    </form>
  );
};

export default VerifyAccountForm;
