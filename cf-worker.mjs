// Worker entry. parserail-mcp is now a page on ParseRail, so every path on this host answers 308 with
// the matching ParseRail page and keeps the query string: the crawl files go to the same file on
// ParseRail's host, and every other path, static assets included, goes to /docs/mcp, the page for
// parserail-mcp. assets.run_worker_first in wrangler.jsonc sends asset paths through this handler too.
// The Next app is still built and its Durable Object classes are still exported, the same shape
// as the ShipProbe redirect repos. Nothing else is exported: the Workers runtime reads every named
// export as an entrypoint and refuses a constant.
import { default as handler } from "./.open-next/worker.js";

const PARSERAIL = "https://parserail.thecompound.tech";
const PAGE = "/docs/mcp";
const SAME_PATH = new Set(["/llms.txt", "/robots.txt", "/sitemap.xml"]);

function parserailUrl(requestUrl) {
  const { pathname, search } = new URL(requestUrl);
  return PARSERAIL + (SAME_PATH.has(pathname) ? pathname : PAGE) + search;
}

export default {
  ...handler,
  async fetch(request) {
    const destination = parserailUrl(request.url);
    return new Response(
      `<a href="https://thecompound.tech">Built by Compound Labs</a>`,
      { status: 308, headers: { Location: destination, "Content-Type": "text/html; charset=UTF-8" } },
    );
  },
};

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
