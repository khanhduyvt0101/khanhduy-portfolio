import axios from "axios";
import process from "process";
import { NextRequest } from "next/server";

// Environment variables
const MEDIUM_USERNAME = process.env.MEDIUM_USERNAME;

export async function GET(req: NextRequest): Promise<Response> {
  const mediumOptions = {
    url: `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${MEDIUM_USERNAME}`,
    method: "GET",
  };

  try {
    const result = await axios.request(mediumOptions);
    if (result.data.items) {
      return Response.json(result.data.items, {
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
}
