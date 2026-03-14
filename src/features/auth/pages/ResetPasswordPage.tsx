import { ChevronLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import Logo from "@/assets/logo";
import AuthBackgroundShape from "@/assets/svg/auth-background-shape";
import ResetPasswordForm from "@/features/auth/components/reset-password-form";
import SEO from "@/shared/components/seo/SEO";

const ResetPasswordPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={t("seo.forgotPassword.title")}
        description={t("seo.forgotPassword.description")}
        canonical={
          typeof window !== "undefined" ? window.location.href : undefined
        }
        noIndex={true}
        hreflang={false}
      />
      <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute">
          <AuthBackgroundShape />
        </div>

        <Card className="z-1 w-full border-none shadow-md sm:max-w-md">
          <CardHeader className="gap-6">
            <Logo className="gap-3" />

            <div>
              <CardTitle className="mb-1.5 text-2xl">Change Password</CardTitle>
              <CardDescription className="text-base">
                Enter your current password and choose a new secure password for
                your account.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ResetPasswordForm />

            <Link
              to="/profile"
              className="group mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeftIcon className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span>Back to profile</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ResetPasswordPage;
