import MotionDiv from "@/src/components/motion-div";
import React, { useContext } from "react";
import aboutIcon from "@/src/assets/svg/aboutIcon.svg";
import avatar from "@/src/assets/photo/avatar.png";
import Image from "next/image";
import styles from "@/src/components/intro/downloadCVButton.module.css";
import sendMessageIcon from "@/src/assets/svg/sendMessageIcon.svg";
import { contactInfo } from "../portfolio";

export default function about() {
  return (
    <div>
      <section id="about">
        <div className="px-24 flex flex-col gap-4 md:my-24 w-full h-full">
          <div className="flex flex-row justify-center items-center md:self-end lg:self-end lg:mr-[40px]">
            <p className="mr-4 text-xl text-mask">About me</p>
            <Image src={aboutIcon} alt="projectIcon" width={87} height={27} />
          </div>
          <article className="gap-4 text-lg flex flex-col justify-center">
            <MotionDiv>
              <div>
                <Image
                  className="lg:float-right md:float-right sm:order-1 sm:ml-16"
                  src={avatar}
                  alt="projectIcon"
                  width={300}
                  height={300}
                />
                <h1 className="my-8">Hello</h1>
                <p className="sm:order-2">
                  Hello, I'm Khanh Duy, a <strong>Full-Stack Developer</strong>{" "}
                  specializing in <strong>Next.JS | React | Mobile</strong> with
                  over <strong>3 years of experience</strong>. Currently, I
                  freelance from the vibrant city of Ho Chi Minh, Vietnam.
                </p>
                <MotionDiv className="p-0 m-0">
                  <div>
                    <h1 className="mt-12 mb-8">My expertise</h1>
                    <ul className="list-disc space-y-2 sm:order-3 mb-8 ml-6">
                      <li>
                        Development of iOS & Android Mobile Apps using React
                        Native, Redux, and Expo.
                      </li>
                      <li>
                        Creation of cross-platform solutions with Flutter, BloC,
                        GetX, and Firebase.
                      </li>
                      <li>
                        Expertise in Android Mobile app development using
                        Android Native Java and MVVM architecture.
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
                        Database design using Cloud Firestore and Realtime
                        Database.
                      </li>
                      <li>
                        Chat app development with Firebase Realtime Database.
                      </li>
                      <li>
                        Setup and handling of Firebase Push Notifications.
                      </li>
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
                    <button
                      onClick={() => {
                        window.open(contactInfo.cv, "_blank");
                      }}
                      className={styles.button}
                    >
                      <Image
                        src={sendMessageIcon}
                        alt="logo"
                        width={30}
                        height={26}
                      />
                      <span
                        className={`transition-opacity duration-500 absolute inset-0 flex items-center justify-center text-mask`}
                      >
                        Send me a message
                      </span>
                    </button>
                  </div>
                </MotionDiv>
              </div>
            </MotionDiv>
          </article>
        </div>
      </section>
    </div>
  );
}
