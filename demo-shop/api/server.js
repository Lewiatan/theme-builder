import { createRequestHandler } from "@react-router/node";
import { installGlobals } from "@react-router/node";
import * as build from "../build/server/index.js";

installGlobals();

const handler = createRequestHandler(build, "production");

export default async function (req, res) {
  try {
    const request = new Request(
      new URL(req.url || "/", `https://${req.headers.host}`).href,
      {
        method: req.method,
        headers: new Headers(req.headers),
        body:
          req.method !== "GET" && req.method !== "HEAD"
            ? req.body
            : undefined,
      }
    );

    const response = await handler(request);

    res.statusCode = response.status;
    res.statusMessage = response.statusText;

    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    if (response.body) {
      const reader = response.body.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        await pump();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error) {
    console.error("SSR Error:", error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
