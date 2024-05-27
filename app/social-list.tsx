import Link from "next/link";
import { ReactNode } from "react";
import { IconType } from "react-icons";
import {
  PiEnvelopeBold,
  PiGithubLogoBold,
  PiLinkedinLogoBold,
  PiXLogoBold,
} from "react-icons/pi";

type SocialListProps = {
  isVertical?: boolean;
};

type SocialLinkProps = {
  href: string;
  label?: string;
  Icon: IconType;
};

const socialLinks: SocialLinkProps[] = [
  {
    href: "https://x.com/khanhduyvt",
    label: "Follow on X",
    Icon: PiXLogoBold,
  },
  {
    href: "https://github.com/khanhduyvt0101",
    label: "Follow on Github",
    Icon: PiGithubLogoBold,
  },
  {
    href: "https://www.linkedin.com/in/buitrongkhanhduy/",
    label: "Follow on Linkedin",
    Icon: PiLinkedinLogoBold,
  },
  {
    href: "mailto:khanhduyvt0101@gmail.com",
    label: "khanhduyvt0101@gmail.com",
    Icon: PiEnvelopeBold,
  },
];

const SocialLink = ({ href, label, Icon }: SocialLinkProps) => (
  <Link
    className={`group flex text-sm font-medium transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-50 flex-row items-center`}
    href={href}
  >
    <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500 mr-4" />
    {label}
  </Link>
);

export default function SocialList({
  isVertical = false,
}: SocialListProps): ReactNode {
  return (
    <div className={`flex ${isVertical ? "flex-col" : ""} gap-6`}>
      {socialLinks.map((link) => (
        <SocialLink
          key={link.href}
          label={isVertical ? link.label : ""}
          Icon={link.Icon}
          href={link.href}
        />
      ))}
    </div>
  );
}
