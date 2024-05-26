import Link from "next/link";
import { ReactNode } from "react";
import {
  PiGithubLogoBold,
  PiInstagramLogoBold,
  PiLinkedinLogoBold,
  PiXLogoBold,
} from "react-icons/pi";

export default function SocialList(): ReactNode {
  return (
    <div className="flex gap-6">
      <Link
        aria-label="Follow on X"
        className="group -m-1 p-1"
        href="https://x.com/khanhduyvt"
      >
        <PiXLogoBold className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
      </Link>
      <Link className="group -m-1 p-1" href="https://github.com/khanhduyvt0101">
        <PiGithubLogoBold className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
      </Link>
      <Link
        className="group -m-1 p-1"
        href="https://www.linkedin.com/in/buitrongkhanhduy/"
      >
        <PiLinkedinLogoBold className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
      </Link>
    </div>
  );
}
