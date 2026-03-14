import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import {
  GraduationCap,
  Sparkles,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WHATSAPP_BUY_LINK = `https://wa.me/962795441474?text=${encodeURIComponent("مرحباً، أرغب في شراء بطاقة دورة. يرجى إرسال تفاصيل الأسعار.")}`;

const CTASection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const benefits = [
    t("home.cta.benefits.materials"),
    t("home.cta.benefits.quizzes"),
    t("home.cta.benefits.ai"),
    t("home.cta.benefits.community"),
  ];

  return (
    <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-background to-primary/5" />

      {/* Animated Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -start-10 md:-start-20 top-1/2 h-36 w-36 md:h-72 md:w-72 -translate-y-1/2 animate-pulse rounded-full bg-primary/20 blur-[60px] md:blur-[100px]" />
        <div className="absolute -end-10 md:-end-20 top-1/2 h-36 w-36 md:h-72 md:w-72 -translate-y-1/2 animate-pulse rounded-full bg-primary/20 blur-[60px] md:blur-[100px] delay-1000" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="relative mx-auto max-w-4xl">
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-primary/20 bg-linear-to-br from-card via-card to-primary/5 p-5 sm:p-6 md:p-8 lg:p-12 xl:p-16 shadow-xl md:shadow-2xl shadow-primary/10">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-size-[1.5rem_1.5rem] md:bg-size-[2rem_2rem]" />

            {/* Glowing Orb */}
            <div className="absolute -end-10 md:-end-20 -top-10 md:-top-20 h-32 w-32 md:h-64 md:w-64 rounded-full bg-primary/30 blur-[50px] md:blur-[80px]" />

            <div className="relative">
              {/* Badge */}
              <div className="mb-4 md:mb-6 inline-flex items-center gap-1.5 md:gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 md:px-4 md:py-2">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <span className="text-xs md:text-sm font-medium text-primary">
                  {t("home.cta.badge")}
                </span>
              </div>

              {/* Heading */}
              <h2 className="mb-3 md:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight">
                {t("home.cta.title")}
                <span className="block mt-1 md:mt-2 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {t("home.cta.titleHighlight")}
                </span>
              </h2>

              {/* Description */}
              <p className="mb-5 md:mb-8 max-w-2xl text-sm md:text-base lg:text-lg text-muted-foreground">
                {t("home.cta.description")}
              </p>

              {/* Benefits List */}
              <ul className="mb-6 md:mb-10 grid gap-2 md:gap-3 grid-cols-1 sm:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 md:gap-3 text-xs md:text-sm lg:text-base text-muted-foreground"
                  >
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Prepaid Code CTA */}
              <div className="mb-5 md:mb-8 rounded-xl border border-green-500/30 bg-green-500/10 p-4 md:p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-bold text-foreground mb-1">
                      {t("home.cta.prepaidCard.title")}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {t("home.cta.prepaidCard.description")}
                    </p>
                  </div>
                  <a
                    href={WHATSAPP_BUY_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 shrink-0 rounded-lg bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-5 py-2.5 text-sm font-bold transition-all shadow-md shadow-green-500/30 hover:scale-[1.03]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("home.cta.prepaidCard.whatsappBtn")}
                  </a>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button
                  size="lg"
                  className="group relative w-full sm:w-auto overflow-hidden rounded-xl bg-linear-to-r from-primary via-primary/90 to-secondary px-6 md:px-10 py-4 md:py-6 text-sm md:text-base lg:text-lg font-bold text-white shadow-xl shadow-primary/40 ring-2 ring-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/50 hover:scale-[1.04] hover:ring-primary/40 border-0"
                  onClick={() => navigate("/browse/product-courses")}
                >
                  <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    <GraduationCap className="h-5 w-5 md:h-6 md:w-6" />
                    {t("home.cta.getStarted")}
                  </span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-5 md:px-8 py-4 md:py-6 text-sm md:text-base lg:text-lg font-semibold backdrop-blur-sm transition-all hover:bg-primary/5 hover:scale-105"
                  onClick={() => navigate("/about")}
                >
                  {t("home.cta.browseMaterials")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
