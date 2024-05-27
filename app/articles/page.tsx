import { Container } from "@/components/Container";
import Image from "next/image";

const posts = [
  {
    id: 1,
    title:
      "Effortless Subtitling for Developers: Mastering Video Subtitles with FFmpeg",
    href: "https://medium.com/@khanhduyvt/effortless-subtitling-for-developers-mastering-video-subtitles-with-ffmpeg-ca0a1027b1e5",
    description:
      "FFmpeg is a powerful tool used for audio and video processing. It’s known for its flexibility, supporting a wide range of formats, and the ability to automate batch processing tasks.",
    imageUrl:
      "https://miro.medium.com/v2/resize:fit:720/format:webp/1*ZVxwARTx7oiEh4bAX2rkPg.png",
    date: "Nov 29, 2023",
    datetime: "2023-11-29",
    category: { title: "Developer", href: "#" },
  },
  {
    id: 2,
    title: "Is the Health of Developers Declining?",
    href: "https://medium.com/@khanhduyvt/is-the-health-of-developers-declining-df85c599d4de",
    description:
      "In recent years, developers have faced declining health due to their sedentary work style, leading to concerns about obesity, cardiovascular problems, and musculoskeletal issues. Mental health challenges, including stress, anxiety, and burnout, are prevalent in the high-pressure tech environment.",
    imageUrl:
      "https://miro.medium.com/v2/resize:fit:720/format:webp/1*kSoiA_4LGYj9S5WW7gAERw.png",
    date: "Dec 1, 2023",
    datetime: "2023-12-01",
    category: { title: "Health", href: "#" },
  },
  {
    id: 3,
    title:
      "Top 6 No-Code Mobile App Builders of 2024: Revolutionizing App Development",
    href: "https://medium.com/@khanhduyvt/top-6-no-code-mobile-app-builders-of-2024-revolutionizing-app-development-ca08afb3c797",
    description:
      "The era of no-code development has unleashed a revolution, empowering entrepreneurs and businesses to create mobile apps without any coding expertise.",
    imageUrl:
      "https://miro.medium.com/v2/resize:fit:720/format:webp/1*Z-hIXn0X7FSAY_DjmRO2Tw.png",
    date: "Dec 9, 2023",
    datetime: "2023-12-09",
    category: { title: "Developer", href: "#" },
  },
  {
    id: 4,
    title: "Boosting React App Performance with useMemo and useCallback",
    href: "https://medium.com/@khanhduyvt/boosting-react-app-performance-with-usememo-and-usecallback-b698a3e1a076",
    description:
      "In this blog post, we will dive into how you can leverage these hooks to enhance the rendering performance of your React app.",
    imageUrl:
      "https://miro.medium.com/v2/resize:fit:720/format:webp/1*WHxA66_jGo8Xs3n5b5silg.png",
    date: "Nov 27, 2023",
    datetime: "2020-11-27",
    category: { title: "Developer", href: "#" },
  },
];

export default function Articles() {
  return (
    <Container>
      <div className="sm:py-32">
        <div className="mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-300 sm:text-4xl">
              Article
            </h2>
            <p className="mt-2 text-lg leading-8 text-zinc-800 dark:text-zinc-300">
              Writing is a way to share knowledge and insights with the world.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col items-start justify-between"
              >
                <div className="relative w-full">
                  <Image
                    height={360}
                    width={540}
                    src={post.imageUrl}
                    alt=""
                    className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                </div>
                <div className="max-w-xl">
                  <div className="mt-8 flex items-center gap-x-4 text-xs">
                    <time
                      dateTime={post.datetime}
                      className="text-zinc-800 dark:text-zinc-300"
                    >
                      {post.date}
                    </time>
                    <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-zinc-800">
                      {post.category.title}
                    </span>
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6  text-zinc-800 dark:text-zinc-300 group-hover:text-teal-500 dark:group-hover:text-teal-50">
                      <a href={post.href}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </a>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-800 dark:text-zinc-300 group-hover:text-teal-500 dark:group-hover:text-teal-50">
                      {post.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
