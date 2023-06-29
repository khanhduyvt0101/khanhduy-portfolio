import Head from "next/head";
import { HomeScreen } from "@/Home";
import avatarImage from "@/images/avatar.jpeg";

export default function Home() {
  return (
    <>
      <Head>
        <meta name="description" content="khanhduyvt0101@gmail.com" />
        <title>Khanh Duy Portfolio</title>
        <meta name="description" content="khanhduyvt0101@gmail.com" />
        {/* Facebook */}
        <meta
          property="og:url"
          content="https://khanhduyvt-portfolio.netlify.app/"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Khanh Duy Portfolio" />
        <meta property="og:description" content="khanhduyvt0101@gmail.com" />
        <meta property="og:image" content={avatarImage.src}></meta>
        <link rel="icon" href="/avatarHeader.svg" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:domain"
          content="khanhduyvt-portfolio.netlify.app"
        />
        <meta
          property="twitter:url"
          content="https://khanhduyvt-portfolio.netlify.app/"
        />
        <meta name="twitter:title" content="Khanh Duy Portfolio" />
        <meta name="twitter:description" content="khanhduyvt0101@gmail.com" />
        <meta name="twitter:image" content={avatarImage.src}></meta>
      </Head>
      <main className=" bg-black h-full w-full">
        <HomeScreen />
      </main>
    </>
  );
}
