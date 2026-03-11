"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  RefreshCw,
  EyeIcon,
  EyeOffIcon,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  resetPassword,
} from "@/features/auth/api";
import { usePasswordValidation } from "../hooks/usePasswordValidation";

const RESEND_COOLDOWN = 60;
const OTP_LENGTH = 6;

type Step = "email" | "otp" | "newPassword";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { validation, isValid: isPasswordValid } =
    usePasswordValidation(newPassword);

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await forgotPasswordSendOtp({ email: email.trim() });
      toast.success("OTP sent", {
        description: "Check your email for the 6-digit code.",
      });
      startCountdown();
      setStep("otp");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to send OTP. Try again.";
      setError(msg);
      toast.error("Failed to send OTP", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP input helpers ───────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError(null);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1)
      inputRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((c, i) => (next[i] = c));
    setOtp(next);
    const focus = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
    inputRefs.current[focus]?.focus();
  };

  const otpValue = otp.join("");
  const isOtpComplete = otpValue.length === OTP_LENGTH;

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpComplete) return;
    setIsLoading(true);
    setError(null);
    try {
      await forgotPasswordVerifyOtp({ email, otp: otpValue });
      toast.success("OTP verified", {
        description: "Now set your new password.",
      });
      setStep("newPassword");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Invalid or expired OTP.";
      setError(msg);
      toast.error("OTP verification failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await forgotPasswordSendOtp({ email });
      toast.success("OTP resent", {
        description: "A new OTP has been sent to your email.",
      });
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      startCountdown();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to resend OTP.";
      toast.error("Could not resend OTP", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Reset Password ──────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError("Password does not meet the requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword({ email, otp: otpValue, newPassword });
      toast.success("Password reset successfully!", {
        description: "You can now log in with your new password.",
        duration: 4000,
      });
      navigate("/auth/login", { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to reset password.";
      setError(msg);
      toast.error("Reset failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  // Step indicator dots
  const steps: Step[] = ["email", "otp", "newPassword"];
  const stepIndex = steps.indexOf(step);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                i <= stepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Step 1: Email ── */}
      {step === "email" && (
        <form className="space-y-4" onSubmit={handleSendOtp}>
          <div className="space-y-1">
            <Label htmlFor="fpEmail">Email address*</Label>
            <Input
              id="fpEmail"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP…
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>
      )}

      {/* ── Step 2: OTP ── */}
      {step === "otp" && (
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          <p className="text-sm text-muted-foreground text-center">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-foreground">{email}</span>
          </p>

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
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-lg border-2 bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  error
                    ? "border-destructive focus:ring-destructive/50"
                    : digit
                      ? "border-primary"
                      : "border-input"
                }`}
                disabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={!isOtpComplete || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify OTP"
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
              disabled={countdown > 0 || isLoading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setStep("email")}
          >
            ← Change email
          </Button>
        </form>
      )}

      {/* ── Step 3: New Password ── */}
      {step === "newPassword" && (
        <form className="space-y-4" onSubmit={handleResetPassword}>
          {/* New Password */}
          <div className="space-y-1">
            <Label htmlFor="newPw">New Password*</Label>
            <div className="relative">
              <Input
                id="newPw"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••••••"
                className="pr-9"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((v) => !v)}
                className="text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent focus-visible:ring-ring/50"
                disabled={isLoading}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
            </div>
            {/* Password requirements */}
            {newPassword && (
              <ul className="mt-2 space-y-1">
                {[
                  {
                    label: "At least 8 characters",
                    valid: validation.minLength,
                  },
                  {
                    label: "One uppercase letter",
                    valid: validation.hasUppercase,
                  },
                  {
                    label: "One lowercase letter",
                    valid: validation.hasLowercase,
                  },
                  {
                    label: "One special character",
                    valid: validation.hasSpecialChar,
                  },
                ].map((rule) => (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs ${
                      rule.valid
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <Label htmlFor="confirmPw">Confirm Password*</Label>
            <div className="relative">
              <Input
                id="confirmPw"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••••••••••"
                className="pr-9"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent focus-visible:ring-ring/50"
                disabled={isLoading}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive mt-1">
                Passwords do not match.
              </p>
            )}
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={
              isLoading || !isPasswordValid || newPassword !== confirmPassword
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting…
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
