"use client";
import React, { useState, useEffect, Suspense, lazy, useContext } from "react";
import { openSource, socialMediaLinks } from "../../portfolio";
import { RepoProps } from "./GithubRepoCard";
import MotionDiv from "../motion-div";
import { Button } from "../ui/button";
import { cn } from "@/src/lib/utils";
import SkeletonGithubCard from "./SkeletonGithubCard";
import { StyleContext } from "@/src/app/contexts/StyleContext";

const GithubRepoCard = lazy(() => import("./GithubRepoCard"));

export default function GithubProjects() {
  const [repos, setRepos] = useState<RepoProps[]>([]);
  const { isDark } = useContext(StyleContext);

  useEffect(() => {
    fetch("/route/github")
      .then((result) => {
        if (result.ok) {
          return result.json();
        }
        throw result;
      })
      .then((response) => {
        setRepos(response);
      })
      .catch((error) => {
        console.error(`${error} (error in Projects section)`);
        setRepos([]);
      });
  }, []);

  if (
    !(typeof repos === "string" || repos instanceof String) &&
    openSource.display
  ) {
    return (
      <div
        className={`${
          isDark ? "bg-backgroundDarkMode text-white" : ""
        } p-4 flex flex-col items-center`}
      >
        <MotionDiv>
          <h1 className="my-2 w-full text-center text-3xl font-bold">
            My Projects
          </h1>
        </MotionDiv>
        <MotionDiv>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {repos.map((v, i) => (
              <GithubRepoCard node={v.node} key={v.node.id} isDark={isDark} />
            ))}
          </div>
        </MotionDiv>
        <MotionDiv>
          <Button
            onClick={() => window.open(socialMediaLinks.github)}
            className={`${
              isDark ? "bg-moreProjectsButton text-white" : ""
            } mt-4`}
          >
            More Projects
          </Button>
        </MotionDiv>
      </div>
    );
  } else {
    return <SkeletonGithubCard />;
  }
}
