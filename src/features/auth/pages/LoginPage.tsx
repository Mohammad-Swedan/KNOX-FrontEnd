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
import LoginForm from "@/features/auth/components/login-form";

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute">
        <AuthBackgroundShape />
      </div>

      <Card className="z-1 w-full border-none shadow-md sm:max-w-lg">
        <CardHeader className="gap-6">
          <Logo className="gap-3" />

          <div>
            <CardTitle className="mb-1.5 text-2xl">
              {t("auth.login.title")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("auth.login.description")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Login Form */}
          <div className="space-y-4">
            <LoginForm />

            <p className="text-muted-foreground text-center">
              {t("auth.login.noAccount")}{" "}
              <a
                href="/auth/register"
                className="text-card-foreground hover:underline"
              >
                {t("auth.login.createAccount")}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
