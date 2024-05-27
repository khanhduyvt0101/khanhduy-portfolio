import { Button } from "@/components/Button";
import { ReactNode } from "react";
import {
  PiArrowDownBold,
  PiBriefcaseBold,
  PiGithubLogoBold,
  PiLinkBold,
} from "react-icons/pi";
import Image, { StaticImageData } from "next/image";
import portfolioIcon from "@/images/portfolio-icon.png";
import magicianVideoIcon from "@/images/magician-video-icon.png";
import Link from "next/link";

type ProjectProps = {
  icon: StaticImageData;
  name: string;
  role: string;
  links: { icon: JSX.Element; href: string; label: string }[];
};

const Project: React.FC<ProjectProps> = ({ icon, name, role, links }) => (
  <li className="flex gap-4">
    <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
      <Image src={icon} alt="" className="h-7 w-7" unoptimized />
    </div>
    <dl className="flex flex-auto flex-wrap gap-x-2">
      <dt className="sr-only">Company</dt>
      <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {name}
      </dd>
      <dt className="sr-only">Role</dt>
      <dd className="text-xs text-zinc-500 dark:text-zinc-400">{role}</dd>
      <dt className="sr-only">Links</dt>
      {links.map((link, index) => (
        <dd
          key={index}
          className="ml-auto font-semibold text-indigo-600 hover:text-indigo-500 text-sm flex-row flex items-center"
        >
          {link.icon}
          <Link href={link.href}>{link.label}</Link>
        </dd>
      ))}
    </dl>
  </li>
);

const projects = [
  {
    icon: portfolioIcon,
    name: "Portfolio",
    role: "Owner",
    links: [
      {
        icon: <PiLinkBold className="mr-2" />,
        href: "https://www.khanhduy.site",
        label: "https://khanhduy.site",
      },
      {
        icon: <PiGithubLogoBold className="mr-2" />,
        href: "https://github.com/khanhduyvt0101/khanhduy-portfolio",
        label: "Github",
      },
    ],
  },
  {
    icon: magicianVideoIcon,
    name: "Video Editing GPT",
    role: "Owner",
    links: [
      {
        icon: <PiLinkBold className="mr-2" />,
        href: "https://lnkd.in/gxTeFYVW",
        label: "Custom GPT",
      },
    ],
  },
];

export default function SideProject(): ReactNode {
  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <PiBriefcaseBold className="h-6 w-6 flex-none" />
        <span className="ml-3">Side Project</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {projects.map((project, index) => (
          <Project key={index} {...project} />
        ))}
      </ol>
      <Button
        href="https://drive.google.com/file/d/1LQKt9drmSwyNzjrFOOFN3ahxxY1JLCyX/view?usp=sharing"
        variant="secondary"
        className="group mt-6 w-full"
      >
        Download CV
        <PiArrowDownBold className="h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50" />
      </Button>
    </div>
  );
}
