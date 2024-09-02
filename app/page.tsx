import { Container } from "@/components/Container";

import SocialList from "./social-list";
import Resume from "./resume";
import Newsletter from "./news-letter";
import SideProject from "./side-project";

export default function Home() {
  return (
    <>
      <Container className="mt-9">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            Software Engineer
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            👋 Hello! I&apos;m Khanh Duy, a dedicated Full-Stack Developer 🚀
            specializing in Next.JS | React | Mobile App development, with over
            4 years of experience. Currently, I working from the vibrant city of
            Ho Chi Minh, VietNam 🇻🇳.
          </p>
          <div className="mt-6">
            <SocialList />
          </div>
        </div>
      </Container>
      <Container className="mt-24 md:mt-28">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 mb-6">
          Job Experiences
        </h2>
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            <Resume />
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24 justify-center">
            <SideProject />
            <Newsletter />
          </div>
        </div>
      </Container>
    </>
  );
}
