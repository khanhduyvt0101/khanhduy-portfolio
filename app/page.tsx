import type { ReactNode } from "react";

import { Infor } from "./infor";
import { Projects } from "./projects";

export default function Page(): ReactNode {
  return (
    <>
      <Infor />
      <Projects />
    </>
  );
}
