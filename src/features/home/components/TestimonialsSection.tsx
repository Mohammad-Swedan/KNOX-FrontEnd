import { useTranslation } from "react-i18next";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

interface Testimonial {
  key: string;
  rating: number;
  avatar: string;
}

const testimonialKeys: Testimonial[] = [
  { key: "sarah", rating: 5, avatar: "ل" },
  { key: "michael", rating: 5, avatar: "ع" },
  { key: "emma", rating: 5, avatar: "ن" },
  { key: "david", rating: 5, avatar: "أ" },
  { key: "lisa", rating: 5, avatar: "ر" },
  { key: "james", rating: 5, avatar: "ك" },
];

const TestimonialCard = ({
  testimonial,
  t,
}: {
  testimonial: Testimonial;
  t: (key: string) => string;
}) => (
  <Card className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
    {/* Gradient Border Effect */}
    <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/20 via-transparent to-primary/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    <div className="absolute inset-px rounded-xl bg-card" />

    <CardContent className="relative p-4 md:p-6">
      {/* Quote Icon */}
      <div className="absolute -top-1 md:-top-2 -end-1 md:-end-2 opacity-10">
        <Quote className="h-12 w-12 md:h-20 md:w-20 text-primary" />
      </div>

      {/* Rating */}
      <div className="mb-2 md:mb-4 flex gap-0.5 md:gap-1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            className="h-3 w-3 md:h-4 md:w-4 fill-yellow-500 text-yellow-500"
          />
        ))}
      </div>

      {/* Content */}
      <p className="mb-3 md:mb-6 text-xs md:text-sm lg:text-base text-muted-foreground leading-relaxed line-clamp-4 md:line-clamp-none">
        "{t(`home.testimonials.items.${testimonial.key}.content`)}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex h-8 w-8 md:h-10 lg:h-12 md:w-10 lg:w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/60 text-primary-foreground text-xs md:text-sm font-semibold">
          {testimonial.avatar}
        </div>
        <div>
          <p className="text-xs md:text-sm lg:text-base font-semibold text-foreground">
            {t(`home.testimonials.items.${testimonial.key}.name`)}
          </p>
          <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground">
            {t(`home.testimonials.items.${testimonial.key}.role`)} •{" "}
            {t(`home.testimonials.items.${testimonial.key}.university`)}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TestimonialsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute end-0 top-0 h-48 w-48 md:h-96 md:w-96 rounded-full bg-primary/10 blur-[80px] md:blur-[120px]" />
        <div className="absolute start-0 bottom-0 h-48 w-48 md:h-96 md:w-96 rounded-full bg-primary/10 blur-[80px] md:blur-[120px]" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 md:mb-12 lg:mb-16 text-center">
          <Badge
            variant="secondary"
            className="mb-3 md:mb-4 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium"
          >
            <Star className="me-1.5 md:me-2 h-3 w-3 md:h-4 md:w-4 fill-yellow-500 text-yellow-500" />
            {t("home.testimonials.badge")}
          </Badge>
          <h2 className="mb-3 md:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            {t("home.testimonials.title")}
            <span className="block mt-1 md:mt-2 bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              {t("home.testimonials.titleHighlight")}
            </span>
          </h2>
          <p className="mx-auto max-w-xl md:max-w-2xl text-sm md:text-base lg:text-lg text-muted-foreground px-2">
            {t("home.testimonials.description")}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-3 md:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {testimonialKeys.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
