import { useTranslation } from "react-i18next";
import { UserProfile } from "@/features/profile/components/UserProfile";
import SEO from "@/shared/components/seo/SEO";

const ProfilePage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SEO
        title={t("seo.profile.title")}
        description={t("seo.profile.description")}
      />
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 lg:py-12">
        <UserProfile />
      </div>
    </div>
  );
};

export default ProfilePage;
