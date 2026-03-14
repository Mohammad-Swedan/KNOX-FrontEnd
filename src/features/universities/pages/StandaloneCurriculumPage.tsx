import CurriculumTreePage from "./CurriculumTreePage";
import { StandaloneCurriculumLayout } from "../layout/StandaloneCurriculumLayout";

export default function StandaloneCurriculumPage() {
  return (
    <StandaloneCurriculumLayout>
      <CurriculumTreePage isStandalone={true} />
    </StandaloneCurriculumLayout>
  );
}
