import type { ReactNode } from "react";

interface StandaloneCurriculumLayoutProps {
  children: ReactNode;
}

export const StandaloneCurriculumLayout = ({
  children,
}: StandaloneCurriculumLayoutProps) => {
  return (
    <div className="w-full h-screen bg-background flex flex-col overflow-hidden">
      {children}
    </div>
  );
};
