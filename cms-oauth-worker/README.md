# Global City CMS OAuth worker

Decap CMS's `github` backend needs an OAuth provider to exchange a GitHub
authorization code for an access token (Netlify normally hosts this; on
Cloudflare we host it ourselves as a small Worker). This worker is
independent of the Astro site and deploys separately.

## 1. Create a GitHub OAuth App

GitHub → Settings → Developer settings → OAuth Apps → New OAuth App:

- Homepage URL: `https://globalcity.batdongsansinhloi.com`
- Authorization callback URL: `https://global-city-cms-auth.<your-subdomain>.workers.dev/callback`

Copy the generated **Client ID** and **Client Secret**.

## 2. Deploy the worker

```bash
cd cms-oauth-worker
npm install
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npm run deploy
```

Wrangler prints the deployed URL, e.g.
`https://global-city-cms-auth.<your-subdomain>.workers.dev`.

## 3. Point Decap CMS at it

In [`public/admin/config.yml`](../public/admin/config.yml), set:

```yaml
backend:
  base_url: https://global-city-cms-auth.<your-subdomain>.workers.dev
```

Commit and push — Cloudflare Pages redeploys the site, and `/admin` will be
able to log editors in with their GitHub account (they must have write
access to `phammythanh/global-city`).
