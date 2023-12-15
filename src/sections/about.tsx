import MotionDiv from "@/components/motion-div";
import React from "react";
import avatar from "@/assets/photo/landing.jpeg";

export default function about() {
  return (
    <section
      id="about"
      className="mx-auto my-16 flex flex-col items-center justify-center gap-4 px-2 md:my-20  md:max-w-full lg:flex-row lg:items-center lg:gap-16"
    >
      <div className="order-2 lg:order-1 lg:w-2/3">
        <MotionDiv delayOffset={0.2}>
          <h2 className="mb-3 w-full text-center md:mb-6">About Me</h2>
        </MotionDiv>
        <article className="flex flex-col gap-4">
          <MotionDiv delayOffset={0.4}>
            <p>
              Hello, I'm Khanh Duy. I'm an freelancer <b>Next.JS</b>. Full-Stack
              developer based in Ho Chi Minh, VietNam.
            </p>
          </MotionDiv>
          <MotionDiv delayOffset={0.5}>
            <p>
              {`I have 2 year+ of experience in mobile apps and system mobile. I
                am working on developing iOS & Android Mobile App using React
                Native, Redux, Flutter, Android Native (java), Firebase, MongoDB,
                etc. I have also experience developing Mobile App using
                Swift-Xcode and Android- Studio.

                I can do: - Build iOS & Android
                Mobile apps using React Native, Redux, Expo, and firebase.
                - Build iOS & Android Mobile apps using Flutter, BloC, GetX, and firebase.
                - Build Android Mobile app using Android Native Java, MVVM.
                - Integrate MongoDB or Rest Api within Mobile app.
                - Integrate Firebase Auth (Email/pass, Facebook, Google, Twitter).
                - Design Database using Cloud Fire store, Realtime Database.
                - Integrate Firebase Realtime Database for chat app implementation.
                - Firebase Push Notification.
                - My github: https://github.com/khanhduyvt0101`}
            </p>
          </MotionDiv>
        </article>
      </div>
      <div className="lg:order-2 lg:w-1/3">
        <MotionDiv delayOffset={0.4}>
          <img
            src={avatar.src}
            alt="photo"
            className="w-[350px] min-w-[300px] rounded-xl transition-all hover:rotate-3 hover:scale-105"
          />
        </MotionDiv>
      </div>
    </section>
  );
}
