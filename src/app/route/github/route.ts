import axios from "axios";
import process from "process";
import { NextRequest, NextResponse } from "next/server";
import { RepoProps } from "@/src/components/project/GithubRepoCard";

// Environment variables
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const USE_GITHUB_DATA = process.env.USE_GITHUB_DATA;
const MEDIUM_USERNAME = process.env.MEDIUM_USERNAME;

// Error Messages
const ERR = {
  noUserName:
    "Github Username is undefined. Set all relevant environment variables.",
  requestFailed: "The request to GitHub failed. Check the GitHub token.",
  requestFailedMedium:
    "The request to Medium failed. Check the Medium username.",
};

export async function GET(req: NextRequest): Promise<Response> {
  if (USE_GITHUB_DATA === "true") {
    if (!GITHUB_USERNAME) {
      return Response.json(
        { message: ERR.noUserName },
        {
          status: 400,
        }
      );
    }

    const githubDataQuery = JSON.stringify({
      query: `
        {
          user(login: "${GITHUB_USERNAME}") {
            name
            bio
            avatarUrl
            location
            pinnedItems(first: 6, types: [REPOSITORY]) {
              totalCount
              edges {
                node {
                  ... on Repository {
                    name
                    description
                    forkCount
                    stargazers {
                      totalCount
                    }
                    url
                    id
                    diskUsage
                    primaryLanguage {
                      name
                      color
                    }
                  }
                }
              }
            }
          }
        }
      `,
    });

    const githubOptions = {
      url: "https://api.github.com/graphql",
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      data: githubDataQuery,
    };

    try {
      const {
        data: { data },
      } = await axios.request<{
        data: { user: { pinnedItems: { edges: { node: RepoProps }[] } } };
      }>(githubOptions);
      if (data) {
        return Response.json(data.user.pinnedItems.edges, {
          status: 200,
        });
      } else {
        return Response.json(
          { message: "something wrong" },
          {
            status: 500,
          }
        );
      }
    } catch (er) {
      return Response.json(
        { message: er },
        {
          status: 500,
        }
      );
    }
  } else if (MEDIUM_USERNAME) {
    // TODO handle serialization for medium object
    const mediumOptions = {
      hostname: "api.rss2json.com",
      path: `/v1/api.json?rss_url=https://medium.com/feed/@${MEDIUM_USERNAME}`,
      method: "GET",
    };

    try {
      const {
        data: { data },
      } = await axios.request<{
        data: { pinnedItems: { edges: { node: RepoProps }[] } };
      }>(mediumOptions);

      if (data) {
        return Response.json(data, {
          status: 200,
        });
      } else {
        return Response.json(
          { message: "something wrong" },
          {
            status: 500,
          }
        );
      }
    } catch (er) {
      return Response.json(
        { message: er },
        {
          status: 500,
        }
      );
    }
  } else {
    return Response.json(
      { message: "Invalid request" },
      {
        status: 400,
      }
    );
  }
}
