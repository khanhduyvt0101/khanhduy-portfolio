import React from "react";
import HeaderSection from "@/app/component/cv/HeaderSection";
import EducationSection from "@/app/component/cv/EducationSection";
import ExperienceSection from "@/app/component/cv/ExperienceSection";
import SkillsSection from "@/app/component/cv/SkillsSection";
import OtherSections from "@/app/component/cv/OtherSections";

export const CVPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <HeaderSection />
        <EducationSection />
        <ExperienceSection />
        <SkillsSection />
        <OtherSections />
      </div>
    </div>
  );
};
