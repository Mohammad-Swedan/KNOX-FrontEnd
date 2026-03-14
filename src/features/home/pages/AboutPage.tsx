import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Users,
  Award,
  Globe,
  Zap,
  Shield,
  Check,
  ArrowRight,
  TrendingUp,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/app/providers/useAuth";
import { useNavigate } from "react-router-dom";
import SEO from "@/shared/components/seo/SEO";

const AboutPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const WHATSAPP_NUMBER = "962795441474";
  const whatsappCreatorLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("home.about.contribute.whatsappMessage"))}`;

  const features = [
    {
      icon: BookOpen,
      title: t("home.about.features.centralizedLearning.title"),
      description: t("home.about.features.centralizedLearning.description"),
    },
    {
      icon: Users,
      title: t("home.about.features.collaborative.title"),
      description: t("home.about.features.collaborative.description"),
    },
    {
      icon: Award,
      title: t("home.about.features.assessments.title"),
      description: t("home.about.features.assessments.description"),
    },
    {
      icon: Globe,
      title: t("home.about.features.accessible.title"),
      description: t("home.about.features.accessible.description"),
    },
    {
      icon: Zap,
      title: t("home.about.features.efficient.title"),
      description: t("home.about.features.efficient.description"),
    },
    {
      icon: Shield,
      title: t("home.about.features.secure.title"),
      description: t("home.about.features.secure.description"),
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: t("home.about.howItWorks.step1.title"),
      description: t("home.about.howItWorks.step1.description"),
    },
    {
      step: "2",
      title: t("home.about.howItWorks.step2.title"),
      description: t("home.about.howItWorks.step2.description"),
    },
    {
      step: "3",
      title: t("home.about.howItWorks.step3.title"),
      description: t("home.about.howItWorks.step3.description"),
    },
    {
      step: "4",
      title: t("home.about.howItWorks.step4.title"),
      description: t("home.about.howItWorks.step4.description"),
    },
  ];

  return (
    <>
      <SEO
        title={t("seo.about.title")}
        description={t("seo.about.description")}
        keywords={t("seo.about.keywords")}
        url="https://uni-hub.com/about"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-primary py-10 md:py-16 lg:py-20">
          <div className="container mx-auto px-3 sm:px-4 text-center">
            <h1 className="mb-4 md:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-primary-foreground">
              {t("home.about.hero.title")}
            </h1>
            <p className="mx-auto max-w-xl md:max-w-3xl text-sm md:text-lg lg:text-xl xl:text-2xl text-primary-foreground/90 mb-5 md:mb-8 px-2">
              {t("home.about.hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 px-4 sm:px-0">
              <button
                onClick={() =>
                  navigate(isAuthenticated ? "/courses" : "/auth/register")
                }
                className="bg-background text-foreground px-5 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-background/90 transition flex items-center justify-center gap-2"
              >
                {t("home.about.hero.getStarted")}{" "}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 rtl:rotate-180" />
              </button>
              <button
                onClick={() => navigate("/courses")}
                className="border-2 border-primary-foreground text-primary-foreground px-5 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-primary-foreground/10 transition"
              >
                {t("home.about.hero.learnMore")}
              </button>
            </div>
          </div>
        </div>

        {/* Value Proposition Cards */}
        <div className="container mx-auto px-3 sm:px-4 -mt-8 md:-mt-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
            <div className="bg-card rounded-xl shadow-lg p-4 md:p-6 border">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-primary mb-2 md:mb-3" />
              <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2">
                {t("home.about.valueCards.allInOne.title")}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                {t("home.about.valueCards.allInOne.description")}
              </p>
            </div>
            <div className="bg-card rounded-xl shadow-lg p-4 md:p-6 border">
              <Zap className="w-8 h-8 md:w-10 md:h-10 text-primary mb-2 md:mb-3" />
              <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2">
                {t("home.about.valueCards.saveTime.title")}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                {t("home.about.valueCards.saveTime.description")}
              </p>
            </div>
            <div className="bg-card rounded-xl shadow-lg p-4 md:p-6 border sm:col-span-2 md:col-span-1">
              <Award className="w-8 h-8 md:w-10 md:h-10 text-primary mb-2 md:mb-3" />
              <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2">
                {t("home.about.valueCards.studySmarter.title")}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                {t("home.about.valueCards.studySmarter.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="container mx-auto px-3 sm:px-4 py-10 md:py-16">
          <div className="max-w-4xl mx-auto text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              {t("home.about.mission.title")}
            </h2>
            <p className="text-sm md:text-lg lg:text-xl text-muted-foreground leading-relaxed px-2">
              {t("home.about.mission.description")}
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-10 md:mb-16">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-6 md:mb-12">
              {t("home.about.features.title")}
            </h2>
            <div className="grid gap-3 md:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card border p-4 md:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <feature.icon className="w-8 h-8 md:w-10 lg:w-12 md:h-10 lg:h-12 text-primary mb-3 md:mb-4" />
                  <h3 className="text-sm md:text-lg lg:text-xl font-bold mb-2 md:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-muted/50 py-10 md:py-16">
          <div className="container mx-auto px-3 sm:px-4">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-6 md:mb-12">
              {t("home.about.howItWorks.title")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
              {howItWorks.map((item, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-10 h-10 md:w-14 lg:w-16 md:h-14 lg:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg md:text-xl lg:text-2xl font-bold mx-auto mb-3 md:mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-xs md:text-base lg:text-lg mb-1 md:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-[10px] md:text-xs lg:text-sm">
                    {item.description}
                  </p>
                  {index < howItWorks.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-5 md:top-6 lg:top-8 -end-2 md:-end-3 lg:-end-4 text-muted-foreground/30 w-4 h-4 md:w-6 lg:w-8 md:h-6 lg:h-8 rtl:rotate-180" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What You Can Do Section */}
        <div className="container mx-auto px-3 sm:px-4 py-10 md:py-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-6 md:mb-12">
            {t("home.about.whatYouCanDo.title")}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
            <div className="bg-card border p-5 md:p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-lg transition">
              <Users className="w-8 h-8 md:w-10 lg:w-12 md:h-10 lg:h-12 text-primary mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6">
                {t("home.about.whatYouCanDo.access.title")}
              </h3>
              <ul className="space-y-2 md:space-y-3">
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.whatYouCanDo.access.items.browse")}
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.whatYouCanDo.access.items.download")}
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.whatYouCanDo.access.items.quizzes")}
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.whatYouCanDo.access.items.search")}
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-card border p-5 md:p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-lg transition">
              <FileText className="w-8 h-8 md:w-10 lg:w-12 md:h-10 lg:h-12 text-primary mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6">
                {t("home.about.whatYouCanDo.contribute.title")}
              </h3>
              <ul className="space-y-2 md:space-y-3">
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.whatYouCanDo.contribute.items.upload")}
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.whatYouCanDo.contribute.items.create")}
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.whatYouCanDo.contribute.items.organize")}
                  </span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.whatYouCanDo.contribute.items.build")}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Features Highlight */}
        <div className="bg-muted/30 py-10 md:py-14 lg:py-16">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10 lg:mb-12">
                {t("home.about.keyFeatures.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                <div className="bg-card border p-4 md:p-5 lg:p-6 rounded-lg shadow-sm">
                  <Clock className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-primary mb-2 md:mb-3" />
                  <h3 className="font-bold text-sm md:text-base lg:text-lg mb-1.5 md:mb-2">
                    {t("home.about.keyFeatures.selfPaced.title")}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.keyFeatures.selfPaced.description")}
                  </p>
                </div>
                <div className="bg-card border p-4 md:p-5 lg:p-6 rounded-lg shadow-sm">
                  <TrendingUp className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-primary mb-2 md:mb-3" />
                  <h3 className="font-bold text-sm md:text-base lg:text-lg mb-1.5 md:mb-2">
                    {t("home.about.keyFeatures.progress.title")}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.keyFeatures.progress.description")}
                  </p>
                </div>
                <div className="bg-card border p-4 md:p-5 lg:p-6 rounded-lg shadow-sm">
                  <FileText className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-primary mb-2 md:mb-3" />
                  <h3 className="font-bold text-sm md:text-base lg:text-lg mb-1.5 md:mb-2">
                    {t("home.about.keyFeatures.library.title")}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.keyFeatures.library.description")}
                  </p>
                </div>
                <div className="bg-card border p-4 md:p-5 lg:p-6 rounded-lg shadow-sm">
                  <MessageSquare className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-primary mb-2 md:mb-3" />
                  <h3 className="font-bold text-sm md:text-base lg:text-lg mb-1.5 md:mb-2">
                    {t("home.about.keyFeatures.community.title")}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm lg:text-base">
                    {t("home.about.keyFeatures.community.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contribute Section */}
        <div className="container mx-auto px-3 sm:px-4 py-10 md:py-14 lg:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-primary p-5 sm:p-6 md:p-8 lg:p-10 rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl">
              <div className="text-center mb-5 md:mb-6 lg:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 md:mb-3 lg:mb-4 text-primary-foreground">
                  {t("home.about.contribute.title")}
                </h2>
                <p className="text-sm md:text-base lg:text-lg text-primary-foreground/90">
                  {t("home.about.contribute.description")}
                </p>
              </div>

              <div className="space-y-4 md:space-y-5 lg:space-y-6">
                <p className="text-sm md:text-base text-primary-foreground/90 text-center">
                  {t("home.about.contribute.whatsappNote")}
                </p>
                <a
                  href={whatsappCreatorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-background text-foreground py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-background/90 transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  {t("home.about.contribute.whatsappBtn")}
                </a>
              </div>

              <div className="mt-5 md:mt-6 lg:mt-8 pt-5 md:pt-6 lg:pt-8 border-t border-primary-foreground/20">
                <h3 className="font-bold text-sm md:text-base lg:text-lg mb-3 md:mb-4 text-primary-foreground">
                  {t("home.about.contribute.benefits.title")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3 lg:gap-4 text-primary-foreground">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm lg:text-base">
                      {t("home.about.contribute.benefits.dashboard")}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 md:gap-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm lg:text-base">
                      {t("home.about.contribute.benefits.analytics")}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 md:gap-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm lg:text-base">
                      {t("home.about.contribute.benefits.recognition")}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 md:gap-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm lg:text-base">
                      {t("home.about.contribute.benefits.support")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-card border-t py-10 md:py-14 lg:py-16">
          <div className="container mx-auto px-3 sm:px-4 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 md:mb-3 lg:mb-4">
              {t("home.about.finalCta.title")}
            </h2>
            <p className="text-sm md:text-base lg:text-xl text-muted-foreground mb-5 md:mb-6 lg:mb-8 max-w-2xl mx-auto">
              {t("home.about.finalCta.description")}
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4">
              {!isAuthenticated && (
                <>
                  <button
                    onClick={() => navigate("/auth/register")}
                    className="bg-primary text-primary-foreground px-5 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded-lg text-sm md:text-base font-semibold hover:opacity-90 transition"
                  >
                    {t("home.about.finalCta.createAccount")}
                  </button>
                  <button
                    onClick={() => navigate("/auth/login")}
                    className="border-2 border-primary text-primary px-5 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-primary/10 transition"
                  >
                    {t("home.about.finalCta.signIn")}
                  </button>
                </>
              )}
              <button
                onClick={() => navigate("/courses")}
                className="bg-secondary text-secondary-foreground px-5 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded-lg text-sm md:text-base font-semibold hover:opacity-90 transition"
              >
                {t("home.about.finalCta.browseCourses")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
