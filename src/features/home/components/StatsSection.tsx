import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

interface StatItem {
  value: number;
  suffix: string;
  labelKey: string;
}

const stats: StatItem[] = [
  { value: 50000, suffix: "+", labelKey: "home.stats.studyMaterials" },
  { value: 100000, suffix: "+", labelKey: "home.stats.quizQuestions" },
  { value: 50, suffix: "K+", labelKey: "home.stats.activeStudents" },
  { value: 100, suffix: "+", labelKey: "home.stats.universities" },
];

const AnimatedCounter = ({
  value,
  suffix,
  isVisible,
}: {
  value: number;
  suffix: string;
  isVisible: boolean;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 0);
    }
    return num.toString();
  };

  return (
    <span>
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-12 md:py-16 lg:py-20 overflow-hidden bg-linear-to-b from-background via-primary/5 to-background"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.1),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 -z-10 rounded-2xl md:rounded-3xl bg-primary/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative rounded-2xl md:rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl p-4 sm:p-5 md:p-6 lg:p-8 transition-all duration-500 hover:border-primary/30 hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-xl md:hover:shadow-2xl hover:shadow-primary/10">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    isVisible={isVisible}
                  />
                </div>
                <p className="mt-1.5 sm:mt-2 md:mt-3 text-xs sm:text-sm md:text-base font-medium text-muted-foreground">
                  {t(stat.labelKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
