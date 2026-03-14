import { useSearchParams, Link } from "react-router-dom";
import { ChevronLeftIcon, MailCheck } from "lucide-react";
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
import VerifyAccountForm from "@/features/auth/components/verify-account-form";
import { useAuth } from "@/app/providers/useAuth";
import SEO from "@/shared/components/seo/SEO";

const VerifyAccountPage = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const email = searchParams.get("email") ?? "";
  const { isAuthenticated } = useAuth();
  const fromProfile = isAuthenticated;

  // Guard: if no email param, show a helpful message
  if (!email) {
    return (
      <>
        <SEO
          title={t("seo.verifyAccount.title")}
          description={t("seo.verifyAccount.description")}
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
                <CardTitle className="mb-1.5 text-2xl">Invalid Link</CardTitle>
                <CardDescription className="text-base">
                  No email address found. Please register again.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link
                to="/auth/register"
                className="group flex items-center gap-2 text-sm hover:underline"
              >
                <ChevronLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                Back to Register
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={t("seo.verifyAccount.title")}
        description={t("seo.verifyAccount.description")}
        canonical="https://ecampusjo.com/auth/verify-account"
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

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <MailCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="mb-1.5 text-2xl">
                  Verify Your Account
                </CardTitle>
                <CardDescription className="text-base">
                  Enter the 6-digit OTP sent to your email to activate your
                  account.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <VerifyAccountForm email={email} fromProfile={fromProfile} />

            <Link
              to={fromProfile ? "/profile" : "/auth/login"}
              className="group mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              {fromProfile ? "Back to profile" : "Back to login"}
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VerifyAccountPage;
