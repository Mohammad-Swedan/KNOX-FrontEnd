"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { changePassword } from "@/features/auth/api";
import { usePasswordValidation } from "../hooks/usePasswordValidation";

const ResetPasswordForm = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { validation, isValid: isPasswordValid } =
    usePasswordValidation(newPassword);

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const canSubmit =
    oldPassword.trim() && isPasswordValid && passwordsMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    try {
      await changePassword({ oldPassword, newPassword });
      toast.success("Password changed!", {
        description: "Your password has been updated successfully.",
        duration: 3000,
      });
      navigate("/profile");
    } catch (err: unknown) {
      let msg = "Failed to change password. Please try again.";
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
        };
        msg = axiosErr.response?.data?.message || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
      toast.error("Password change failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Current Password */}
      <div className="space-y-1">
        <Label className="leading-5" htmlFor="oldPassword">
          Current Password*
        </Label>
        <div className="relative">
          <Input
            id="oldPassword"
            type={showOld ? "text" : "password"}
            placeholder="••••••••••••••••"
            className="pr-9"
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value);
              setError(null);
            }}
            disabled={isLoading}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowOld((v) => !v)}
            className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
            disabled={isLoading}
          >
            {showOld ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>
      </div>

      {/* New Password */}
      <div className="space-y-1">
        <Label className="leading-5" htmlFor="newPassword">
          New Password*
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNew ? "text" : "password"}
            placeholder="••••••••••••••••"
            className="pr-9"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError(null);
            }}
            disabled={isLoading}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowNew((v) => !v)}
            className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
            disabled={isLoading}
          >
            {showNew ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>
        {/* Password requirements */}
        {newPassword && (
          <ul className="mt-2 space-y-1">
            {[
              { label: "At least 8 characters", valid: validation.minLength },
              { label: "One uppercase letter", valid: validation.hasUppercase },
              { label: "One lowercase letter", valid: validation.hasLowercase },
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

      {/* Confirm New Password */}
      <div className="space-y-1">
        <Label className="leading-5" htmlFor="confirmPassword">
          Confirm New Password*
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••••••••••"
            className="pr-9"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null);
            }}
            disabled={isLoading}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowConfirm((v) => !v)}
            className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
            disabled={isLoading}
          >
            {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-destructive mt-1">
            Passwords do not match.
          </p>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={!canSubmit}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Changing Password…
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
