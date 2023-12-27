import MotionDiv from "@/src/components/motion-div";
import React, { useContext } from "react";
import avatar from "@/src/assets/photo/landing.jpeg";
import { StyleContext } from "../app/contexts/StyleContext";

export default function about() {
  return (
    <div>
      <section
        id="about"
        className="mx-auto my-16 flex flex-col items-center justify-center gap-4 px-12 md:my-20 md:max-w-full lg:flex-row lg:items-center lg:gap-16"
      >
        <div className="order-1 lg:order-1 lg:w-2/3">
          <MotionDiv delayOffset={0.2}>
            <h2 className="mb-3 w-full text-center text-3xl font-bold md:mb-6">
              About Me
            </h2>
          </MotionDiv>
          <article className="flex flex-col gap-4 text-lg">
            <MotionDiv delayOffset={0.4}>
              <p>
                Hello, I'm Khanh Duy, a <strong>Full-Stack Developer</strong>{" "}
                specializing in <strong>Next.JS | React | Mobile</strong> with
                over <strong>3 years of experience</strong>. Currently, I
                freelance from the vibrant city of Ho Chi Minh, VietNam.
              </p>
            </MotionDiv>
            <MotionDiv delayOffset={0.5}>
              <ul className="list-disc space-y-2">
                <li>
                  Development of iOS & Android Mobile Apps using React Native,
                  Redux, and Expo.
                </li>
                <li>
                  Creation of cross-platform solutions with Flutter, BloC, GetX,
                  and Firebase.
                </li>
                <li>
                  Expertise in Android Mobile app development using Android
                  Native Java and MVVM architecture.
                </li>
                <li>
                  Integration of MongoDB or REST APIs within mobile
                  applications.
                </li>
                <li>
                  Implementation of Firebase Auth for multiple platforms
                  (Email/pass, Facebook, Google, Twitter).
                </li>
                <li>
                  Database design using Cloud Firestore and Realtime Database.
                </li>
                <li>Chat app development with Firebase Realtime Database.</li>
                <li>Setup and handling of Firebase Push Notifications.</li>
                <li>
                  Feel free to check my GitHub for past projects:{" "}
                  <a
                    href="https://github.com/khanhduyvt0101"
                    className="text-blue-600 hover:underline"
                  >
                    Github
                  </a>
                </li>
              </ul>
            </MotionDiv>
          </article>
        </div>
        <div className="lg:order-2 order-2">
          <MotionDiv delayOffset={0.4}>
            <img
              src={avatar.src}
              alt="Khanh Duy"
              className="w-[500px] rounded-xl transition-all hover:rotate-3 hover:scale-105"
            />
          </MotionDiv>
        </div>
      </section>
    </div>
  );
}
