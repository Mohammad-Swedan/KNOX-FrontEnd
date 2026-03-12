"use client";

import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useAuth } from "@/app/providers/useAuth";

const LoginForm = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/", {
        replace: true,
        state: {
          toast: {
            type: "success" as const,
            title: t("auth.login.success"),
            description: t("auth.login.welcomeBack"),
          },
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      const is401 = axios.isAxiosError(err) && err.response?.status === 401;
      const errorMessage = is401
        ? t("auth.login.invalidCredentials")
        : t("auth.login.loginFailed");
      setError(errorMessage);
      toast.error(t("auth.login.loginFailed"), {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1">
        <Label htmlFor="userEmail" className="leading-5">
          {t("auth.login.emailLabel")}*
        </Label>
        <Input
          type="email"
          id="userEmail"
          name="email"
          autoComplete="email"
          placeholder={t("auth.login.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {/* Password */}
      <div className="w-full space-y-1">
        <Label htmlFor="password" className="leading-5">
          {t("auth.login.passwordLabel")}*
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            autoComplete="current-password"
            type={isVisible ? "text" : "password"}
            placeholder={t("auth.login.passwordPlaceholder")}
            className="pr-9"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible((prevState) => !prevState)}
            className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
            disabled={isLoading}
          >
            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className="sr-only">
              {isVisible
                ? t("auth.login.hidePassword")
                : t("auth.login.showPassword")}
            </span>
          </Button>
        </div>
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end">
        <Link
          to="/auth/forgot-password"
          className="text-primary text-sm font-medium hover:underline"
        >
          {t("auth.login.forgotPassword")}
        </Link>
      </div>

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("auth.login.signingIn")}
          </>
        ) : (
          t("auth.login.submitButton")
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
