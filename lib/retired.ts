export function handleRetiredRequest(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "") || "/";

  if (path === "/robots.txt") {
    return new Response("User-agent: *\nAllow: /\n", {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
    });
  }

  return new Response("This retired FIXLGS service is permanently gone.\n", {
    status: 410,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "x-robots-tag": "noindex",
    },
  });
}
