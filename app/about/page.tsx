import { type Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/Container";

import portraitImage from "@/images/avatar.jpg";
import SocialList from "../social-list";

export const metadata: Metadata = {
  title: "About",
  description:
    "I’m Khanh Duy. I live in Ho Chi Minh City, enjoy building software and learning new technologies.",
};

export default function About() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={portraitImage}
              alt=""
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            My name is Khanh Duy, I&apos;m 24 years old, and I reside in Ho Chi
            Minh City.
          </h1>
          <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
            <p>
              I&apos;ve always been passionate about technology ever since I was
              young. I graduated from the University of Information Technology
              at Vietnam National University, Ho Chi Minh City – VNU-HCM in
              2022, and I now have nearly four years of experience building
              websites and mobile apps.
            </p>
            <p>
              Although I&apos;m relatively new to the field, my determination
              and effort are enormous. I thrive when tackling challenging
              projects and feel immensely satisfied upon completing them.
              Particularly, I love creating products that benefit many people;
              knowing that my work is useful to others brings me great joy.
            </p>
            <p>
              Currently, I am always on the lookout for new challenges and
              aspire to become an Indie Hacker. I&apos;m putting in a great deal
              of effort to achieve this goal.
            </p>
          </div>
        </div>
        <div className="lg:pl-20">
          <ul role="list">
            <SocialList isVertical />
          </ul>
        </div>
      </div>
    </Container>
  );
}
