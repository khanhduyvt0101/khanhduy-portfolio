import Head from "next/head";
import { HomeScreen } from "@/pages/Home";

export default function Home() {
  return (
    <div className={""}>
      <Head>
        <title>Khanh Duy Portfolio</title>
        <meta name="description" content="khanhduyvt0101@gmail.com" />
        <link rel="icon" href="/avatarHeader.svg" />
      </Head>
      <main className=" bg-black h-full w-full">
        <HomeScreen />
      </main>
    </div>
  );
}
