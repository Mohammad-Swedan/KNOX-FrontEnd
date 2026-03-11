import { useSearchParams, Link } from "react-router-dom";
import { ChevronLeftIcon, MailCheck } from "lucide-react";

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

const VerifyAccountPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";

  // Guard: if no email param, show a helpful message
  if (!email) {
    return (
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
    );
  }

  return (
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
          <VerifyAccountForm email={email} />

          <Link
            to="/auth/login"
            className="group mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyAccountPage;
