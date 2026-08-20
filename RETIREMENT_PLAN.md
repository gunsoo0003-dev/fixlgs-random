# fixlgs-random retirement deployment

- Domain: `https://random.fixlgs.com`
- Mode: `gone`
- Keep the Vercel project and DNS active while Google processes the retirement.
- `robots.txt` stays crawlable so crawlers can observe 301/410 responses.
- `sitemap.xml` is retired with HTTP 410.
- Do not restore the legacy sitemap or legacy content after deployment.

## Gone behavior

- Every retired content URL returns HTTP 410 Gone.
- `robots.txt` is the only 200 endpoint.
