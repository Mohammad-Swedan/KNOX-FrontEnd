import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Users, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

const CommunitySection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="relative mx-auto max-w-3xl text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <Heart className="h-6 w-6 text-primary" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t("home.community.title")}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-4 leading-relaxed">
            {t("home.community.description")}
          </p>

          {/* Stat line */}
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2 mb-6">
            <Users className="h-4 w-4 text-primary" />
            <span>{t("home.community.statLine")}</span>
          </div>

          {/* CTA Button */}
          <div>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group rounded-full px-6"
            >
              <Link to="/top-contributors">
                {t("home.community.cta")}
                <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
