import CurriculumTreePage from "./CurriculumTreePage";
import { StandaloneCurriculumLayout } from "../layout/StandaloneCurriculumLayout";
import SEO from "@/shared/components/seo/SEO";

export default function StandaloneCurriculumPage() {
  return (
    <>
      <SEO title="الخطة الدراسية | eCampus" noIndex={true} hreflang={false} />
      <StandaloneCurriculumLayout>
        <CurriculumTreePage isStandalone={true} />
      </StandaloneCurriculumLayout>
    </>
  );
}
