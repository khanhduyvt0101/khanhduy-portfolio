"use client";

import React from "react";
import { contactInfo } from "../../portfolio";
import { Fade } from "react-awesome-reveal";
import MotionDiv from "../motion-div";

export const FooterContact: React.FC = () => {
  return (
    <MotionDiv>
      <div className="main" id="contact">
        <h1 className="text-3xl font-bold">Reach Out to me!</h1>
        <div className="flex">
          <div className="flex-1">
            <div>
              <p className="text-sm py-4">{contactInfo.subtitle}</p>
            </div>
            <h2 className="text-lg">
              Software Engineer. We can simplify everything with technology.
            </h2>
            <div className="flex items-center justify-center my-4">
              <span className="w-4 h-2">
                <svg
                  viewBox="-0.5 -2 20 19"
                  version="1.1"
                  width="22"
                  height="16"
                  aria-hidden="true"
                  stroke="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 0C2.69 0 0 2.5 0 5.5 0 10.02 6 16 6 16s6-5.98 6-10.5C12 2.5 9.31 0 6 0zm0 14.55C4.14 12.52 1 8.44 1 5.5 1 3.02 3.25 1 6 1c1.34 0 2.61.48 3.56 1.36.92.86 1.44 1.97 1.44 3.14 0 2.94-3.14 7.02-5 9.05zM8 5.5c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"
                  ></path>
                </svg>
              </span>
              <p className="pt-2">Ho Chi Minh, VietNam</p>
            </div>
            <div>
              <span>
                Open for opportunities: <b>Yes</b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};
