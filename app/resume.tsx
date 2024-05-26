import { Card } from "@/components/Card";

const projects = [
  {
    date: "April - July 2021",
    name: "Mobile Developer - Intern",
    description: [
      "Designed the user interface for an e-commerce application using Flutter.",
      "Implemented the Bloc pattern for effective state management, enhancing app performance.",
    ],
    skill:
      "Flutter, Observer Design Pattern, Bloc Pattern, Performance Optimization",
  },
  {
    date: "August 2021 - November 2021",
    name: "Mobile Developer - Intern",
    description: [
      "Developed the Feedback application using Android Native Java.",
      "Participated in comprehensive product development planning.",
      "Assumed multiple roles, including design, business analysis, and testing, to ensure project success.",
    ],
    skill: "Android Native Java, Full Lifecycle Development, MVP pattern",
  },
  {
    date: "January 2022 - June 2022",
    name: "NodeJs - Fresher",
    description: [
      "Created a server using Node.js to automate Appium actions on mobile devices.",
      "Developed a function for AI-based automated actions across multiple mobile devices.",
      "Gained expertise in Kafka, microservices, AWS, and Jenkins.",
      "Contributed to system stability by resolving persistent issues and implementing best practices.",
    ],
    skill: "Node.js, Kafka, AWS, Jenkins, System Migration, Automated Testing",
  },
  {
    date: "June 2022 - September 2022",
    name: "Flutter - Junior",
    description: [
      "Utilized Flutter for front-end development and SocketIO for server communication with Node.js.",
      "Developed an application to streamline team planning, retrospectives, and sprint reviews.",
      "The application I worked on was enthusiastically adopted as a key tool for task organization and strategic planning.",
    ],
    skill: "Flutter, SocketIO, Node.js, Bloc Patern",
  },
  {
    date: "September 2022 - December 2023",
    name: "React Native - Junior",
    description: [
      "Designed the user interface for a garage store app using React Native.",
      "Implemented mobile authentication with Azure B2C and Auth0.",
      "Leveraged Expo for app development and production deployment.",
      "Contributed to backend development by creating DotNet APIs for the Garage application using the DDD pattern.",
      "Bridged the gap between front-end and back-end development, enhancing the team's full-stack capabilities and reducing reliance on the backend team.",
    ],
    skill:
      "React Native, Expo, SignalR, B2C Azure, Auth0, DotNet (Back-End), Azure DevOps (Back-End)",
  },
  {
    date: "January 2024 - June 2024",
    name: "Flutter - Junior",
    description: [
      "Developed the user interface for a garage application using Flutter.",
      "Integrated SignalR for efficient event handling from the back-end.",
      "Customized libraries and created specialized ones to enhance the app's functionality.",
    ],
    skill: "Flutter, SignalR, Bloc Patern, Build Runner library",
  },
  {
    date: "September 2023 - March 2024",
    name: "NextJs - OpenAI intergrate App - Fullstack Developer",
    description: [
      "Developed to assist researchers, master’s, and doctoral students in finding research questions for their studies or publications.",
      "The app helps users quickly discover compelling research topics and determine if they have been addressed in existing studies or publications.",
      "Built the first version of the product from scratch which made $20K in the first 2 months",
    ],
    skill:
      "NextJs, Tailwinds, Vercel KV, Vercel Devops, Lemon Squeezy Payment, OpenAI API, Clerk Authenticate",
  },
];

interface ResumeItemProps {
  title: string;
  date: string;
  description: string[];
  skill: string;
}

function ResumeItem({ title, description, date, skill }: ResumeItemProps) {
  return (
    <Card as="article">
      <Card.Title>{title}</Card.Title>
      <Card.Eyebrow as="time" dateTime={date} decorate>
        {date}
      </Card.Eyebrow>
      {description.map((description, index) => (
        <Card.Description key={index}>{description}</Card.Description>
      ))}
      <Card.Skill>
        <span className="font-bold">Skill: {skill}</span>
      </Card.Skill>
    </Card>
  );
}

export default function Resume() {
  return projects.map((project, index) => (
    <ResumeItem
      key={index}
      title={project.name}
      description={project.description}
      date={project.date}
      skill={project.skill}
    />
  ));
}
