import MotionDiv from "@/src/components/motion-div";
import MotionList from "@/src/components/motion-list";
import Image from "next/image";
import reactIcon from "@/src/assets/icons/react.png";
import typescriptIcon from "@/src/assets/icons/typescript.png";
import javascriptIcon from "@/src/assets/icons/javascript.png";
import tailwindcssIcon from "@/src/assets/icons/tailwindcss.png";
import shadcnuiIcon from "@/src/assets/icons/shadcn-ui.png";
import pnpmIcon from "@/src/assets/icons/pnpm.png";
import prettierIcon from "@/src/assets/icons/prettier.png";
import nodejsIcon from "@/src/assets/icons/nodejs.png";
import nextjsIcon from "@/src/assets/icons/next-js.png";
import mysqlIcon from "@/src/assets/icons/mysql.png";
import gitIcon from "@/src/assets/icons/git.png";
import macosIcon from "@/src/assets/icons/macos.png";
import vscodeIcon from "@/src/assets/icons/vscode.png";
import postmanIcon from "@/src/assets/icons/postman.svg";
import ExpoIcon from "@/src/assets/icons/expo.png";
import githubActionsIcon from "@/src/assets/icons/github-actions.png";
import androidIcon from "@/src/assets/icons/android.png";
import dartIcon from "@/src/assets/icons/dart.png";
import flutterIcon from "@/src/assets/icons/flutter.png";
import androidstudioIcon from "@/src/assets/icons/androidstudio.png";
export default function skills() {
  const data = [
    {
      title: "Web Development",
      skills: [
        {
          name: "React.js",
          icon: reactIcon,
        },
        {
          name: "TypeScript",
          icon: typescriptIcon,
        },
        {
          name: "JavaScript",
          icon: javascriptIcon,
        },
        {
          name: "Tailwind CSS",
          icon: tailwindcssIcon,
        },

        {
          name: "shadcn/ui",
          icon: shadcnuiIcon,
        },
        {
          name: "PNPM",
          icon: pnpmIcon,
        },
        {
          name: "Prettier",
          icon: prettierIcon,
        },
      ],
    },
    {
      title: "Backend Development",
      skills: [
        {
          name: "Node.js",
          icon: nodejsIcon,
        },
        {
          name: "Nest.js",
          icon: nextjsIcon,
        },
        {
          name: "MySQL",
          icon: mysqlIcon,
        },
      ],
    },
    {
      title: "Mobile Development",
      skills: [
        {
          name: "React Native",
          icon: reactIcon,
        },
        {
          name: "Flutter",
          icon: flutterIcon,
        },
        {
          name: "Expo",
          icon: ExpoIcon,
        },
      ],
    },
    {
      title: "DevOps",
      skills: [
        {
          name: "Git",
          icon: gitIcon,
        },
        {
          name: "GitHub Actions",
          icon: githubActionsIcon,
        },
      ],
    },
    {
      title: "Languages",
      skills: [
        {
          name: "TypeScript",
          icon: typescriptIcon,
        },
        {
          name: "JavaScript",
          icon: javascriptIcon,
        },
        {
          name: "Android",
          icon: androidIcon,
        },
        {
          name: "Dart",
          icon: dartIcon,
        },
      ],
    },
    {
      title: "Tools & Environment",
      skills: [
        {
          name: "macOS",
          icon: macosIcon,
        },
        {
          name: "VS Code",
          icon: vscodeIcon,
        },
        {
          name: "Android Studio",
          icon: androidstudioIcon,
        },
        {
          name: "Postman",
          icon: postmanIcon,
        },
      ],
    },
  ];

  return (
    <section
      id="skills"
      className="flex w-full flex-col items-center text-center"
    >
      <MotionDiv>
        <h2 className="mb-4">My Skills</h2>
      </MotionDiv>
      <div className="flex flex-wrap justify-center">
        {data.map((item, index) => (
          <MotionDiv key={index}>
            <div className="mb-6 md:px-2">
              <h3>{item.title}</h3>
              <MotionList className="flex flex-wrap justify-evenly gap-0 md:gap-5 md:px-6 lg:justify-center">
                {item.skills.map((skill) => (
                  <SkillCard key={skill.name} {...skill} />
                ))}
              </MotionList>
            </div>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
}

function SkillCard({ icon, name }: { icon: string; name: string }) {
  return (
    <div className="group rounded-xl border-none p-5 text-center shadow-none">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center">
          <Image src={icon} alt={name} priority />
        </div>
        <p>{name}</p>
      </div>
    </div>
  );
}
