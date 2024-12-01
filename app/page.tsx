import type { ReactNode } from "react";

import { Experience } from "./experience";
import { Infor } from "./infor";
import { Products } from "./products";

export default function Page(): ReactNode {
  return (
    <>
      <Infor />
      <Products />
      <Experience />
    </>
  );
}
