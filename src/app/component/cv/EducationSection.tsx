// src/components/cv/EducationSection.tsx

import React from "react";

const EducationSection = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Education</h2>
      <div className="mt-3">
        <p className="font-bold">Your University Name (Year - Year)</p>
        <p>{`Bachelor's Master's in Your Field`}</p>
        <p>Relevant coursework, achievements, etc.</p>
      </div>
      {/* Add more education entries if needed */}
    </div>
  );
};

export default EducationSection;
