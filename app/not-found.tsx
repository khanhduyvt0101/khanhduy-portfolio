import { IconAlertCircle } from "@tabler/icons-react";
import type { ReactNode } from "react";

import {
  Banner,
  BannerContent,
  BannerDescription,
  BannerIcon,
  BannerTitle,
} from "~/components/ui/banner";

export default function NotFound(): ReactNode {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <Banner dismissible={false}>
        <BannerIcon asChild>
          <IconAlertCircle />
        </BannerIcon>
        <BannerContent>
          <BannerTitle>404</BannerTitle>
          <BannerDescription>
            The page you are looking for does not exist or has been moved.
          </BannerDescription>
        </BannerContent>
      </Banner>
    </div>
  );
}
