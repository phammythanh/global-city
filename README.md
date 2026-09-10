# Global City

Astro 5 (static) + Decap CMS + Cloudflare Pages.

- **Site**: https://globalcity.batdongsansinhloi.com
- **Repo**: `phammythanh/globalcity` (private)
- **Cloudflare Pages project**: `global-city`

## Stack

| Piece      | Choice                                          |
| ---------- | ------------------------------------------------ |
| Framework  | Astro 5, `output: 'static'`                       |
| Content    | Astro content collections (`src/content`)         |
| CMS        | Decap CMS (`public/admin`), GitHub backend        |
| CMS auth   | Custom Cloudflare Worker OAuth provider (`cms-oauth-worker/`) |
| Hosting    | Cloudflare Pages                                  |
| Images     | `sharp` (Astro's built-in image optimization)     |

No headless CMS (Directus/Strapi/etc.) — content lives as markdown/YAML in
this repo and is edited through `/admin` (Decap), which commits straight to
`main` via the GitHub API.

## Project structure

```
src/
  content/
    config.ts          content collection schemas
    settings/site.yml   contact info + default SEO (single "file" collection)
    pages/*.md          Tổng quan / Vị trí / Thấp tầng / Cao tầng / Liên hệ
    news/*.md           Tin tức posts (folder collection)
  components/           Header, Footer, SEO, FloorPlanGallery, GlobalLightbox
  layouts/               BaseLayout (head/nav/footer), PageLayout (hero + prose)
  pages/                 routes (see table below)
public/
  admin/                 Decap CMS (index.html + config.yml)
  images/uploads/        CMS media folder
  fonts/                 self-hosted "Cera Black" font files (see Brand below)
scripts/
  sanitize-content.mjs   cleans HTML/entities pasted into markdown fields (turndown + he)
  generate-og.mjs        renders public/og/default.jpg with sharp
  generate-favicon.mjs   renders public/favicon.png from src/assets/logo.png
cms-oauth-worker/        standalone Cloudflare Worker, GitHub OAuth for Decap
```

## Routes / menu chính

| Route         | Menu       | Source                             |
| ------------- | ---------- | ----------------------------------- |
| `/`           | Tổng quan  | `src/content/pages/tong-quan.md`    |
| `/vi-tri`     | Vị trí     | `src/content/pages/vi-tri.md`       |
| `/thap-tang`  | Thấp tầng  | `src/content/pages/thap-tang.md`    |
| `/cao-tang`   | Cao tầng   | `src/content/pages/cao-tang.md`     |
| `/tin-tuc`    | Tin tức    | `src/content/news/*.md`             |
| `/lien-he`    | Liên hệ    | `src/content/pages/lien-he.md`      |

Plus `/rss.xml` (news feed) and an auto-generated `/sitemap-index.xml`.

## Local development

```bash
npm install
npm run dev
```

To try the CMS locally, run Decap's local proxy in a second terminal
(`npx decap-server`) and add `local_backend: true` to
`public/admin/config.yml` temporarily — do not commit that line.

## Setting up the CMS (one-time)

1. Deploy the OAuth worker — see [`cms-oauth-worker/README.md`](cms-oauth-worker/README.md).
2. Update `base_url` in [`public/admin/config.yml`](public/admin/config.yml)
   with the deployed worker URL.
3. Give editors write access to `phammythanh/globalcity` on GitHub —
   Decap CMS authenticates as the logged-in GitHub user and commits as them.

## Deploying to Cloudflare Pages

Dashboard → **Workspace → Pages → Create → Connect to Git**:

- Account: (id `f37fcccb57dec33761183b5ebd169582`)
- Project name: `global-city`
- Repository: `phammythanh/globalcity`
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable: `NODE_VERSION=20` (also pinned in `.node-version`)

Then **Custom domains → Add** → `globalcity.batdongsansinhloi.com`, and add
the CNAME record it gives you under the `batdongsansinhloi.com` zone in
Cloudflare DNS (or let Cloudflare add it automatically if the zone is on the
same account).

Before the first deploy, also create the KV namespace the contact form
writes to, and paste its id into `wrangler.toml`:

```bash
npx wrangler kv namespace create LIEN_HE_LEADS
```

## Brand

- Primary `#B87018` · Accent `#B88040` · Nền `#F0F0E8`
- Text phụ `#8B7355` · Text đậm `#4A3F30`
- Heading: **Cera Black** · Body: Be Vietnam Pro (loaded via Google Fonts in
  `src/layouts/BaseLayout.astro`)
- Cera Black is a commercial font, not available on Google Fonts. Drop the
  purchased files into `public/fonts/` as `CeraPro-Black.woff2` /
  `CeraPro-Black.woff` (declared in `src/styles/global.css`); until then the
  site falls back to Montserrat/system sans automatically.
- `src/assets/logo.png` and `src/assets/og-cover.png` are placeholders —
  replace with the real Global City logo and cover render, then run
  `npm run dev` (or `predev`/`prebuild`) to regenerate `public/favicon.png`
  and `public/og/default.jpg`.
- Hotline `0903596692` · Email `thanh@batdongsansinhloi.com` (edit under
  **Cấu hình chung** in the CMS, not hardcoded — see `src/content/settings/site.yml`)

## Not yet done

- [ ] Real logo / OG cover art (placeholders in `src/assets/`)
- [ ] Cera Black font files in `public/fonts/`
- [ ] Create the GitHub repo `phammythanh/globalcity` (private) and push
- [ ] Deploy `cms-oauth-worker/` and point `public/admin/config.yml` at it
- [ ] Create the Cloudflare Pages project + KV namespace + custom domain
- [ ] Add a Google Analytics (GA4) tag once you have a Global City property
      (deliberately not wired up yet — the old snippet was Sensa Park's own
      measurement ID)
