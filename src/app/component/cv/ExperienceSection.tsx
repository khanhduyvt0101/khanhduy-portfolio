// src/components/cv/ExperienceSection.tsx

import React from "react";

const ExperienceSection = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Professional Experience</h2>
      <div className="mt-3">
        <p className="font-bold">Company Name (Start Year - End Year)</p>
        <p>Job Title</p>
        <ul className="list-disc ml-5 mt-1">
          <li>Responsibility or Achievement</li>
          {/* Add more responsibilities or achievements */}
        </ul>
      </div>
      {/* Add more experience entries if needed */}
    </div>
  );
};

export default ExperienceSection;
