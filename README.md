# Global City

Astro 5 (static) + Decap CMS + Cloudflare Pages.

- **Site**: https://globalcity.batdongsansinhloi.com
- **Repo**: `phammythanh/global-city` (private)
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
    pages/*.md          Tổng quan / Liên hệ
    thap-tang/*.md      SOHO, SOLA (folder collection, fixed set of files)
    cao-tang/*.md       Masteri Grand View / Lumière Midtown / Masteri Park
                         Place / Masteri Cosmo Central / Masteri Cosmo
                         Central (Nexus Zone) (folder collection)
    news/*.md           Tin tức posts (folder collection)
  components/           Header (incl. dropdown nav), Footer, SEO,
                         FloorPlanGallery, GlobalLightbox
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

| Route                                  | Menu                              | Source                                              |
| --------------------------------------- | ---------------------------------- | ---------------------------------------------------- |
| `/`                                      | Tổng quan                          | `src/content/pages/tong-quan.md`                     |
| `/thap-tang`                              | Thấp tầng (dropdown)               | overview, cards → SOHO / SOLA                        |
| `/thap-tang/soho`, `/thap-tang/sola`      | ↳ SOHO, SOLA                       | `src/content/thap-tang/*.md`                         |
| `/cao-tang`                                | Cao tầng (dropdown)                 | overview, cards → 5 dự án bên dưới                   |
| `/cao-tang/masteri-grand-view`             | ↳ Masteri Grand View                | `src/content/cao-tang/masteri-grand-view.md`         |
| `/cao-tang/lumiere-midtown`                | ↳ Lumière Midtown                   | `src/content/cao-tang/lumiere-midtown.md`            |
| `/cao-tang/masteri-park-place`             | ↳ Masteri Park Place                | `src/content/cao-tang/masteri-park-place.md`         |
| `/cao-tang/masteri-cosmo-central`          | ↳ Masteri Cosmo Central             | `src/content/cao-tang/masteri-cosmo-central.md`      |
| `/cao-tang/masteri-cosmo-central-nexus-zone` | ↳ Masteri Cosmo Central (Nexus Zone) | `src/content/cao-tang/masteri-cosmo-central-nexus-zone.md` |
| `/tin-tuc`                                 | Tin tức                            | `src/content/news/*.md`                              |
| `/lien-he`                                 | Liên hệ                            | `src/content/pages/lien-he.md`                       |

The "Thấp tầng" and "Cao tầng" nav items open a dropdown (hover on desktop,
tap the caret on mobile/touch) straight to each project's page; the parent
link itself goes to an overview page listing the same options as cards.

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
3. Give editors write access to `phammythanh/global-city` on GitHub —
   Decap CMS authenticates as the logged-in GitHub user and commits as them.

## Deploying to Cloudflare Pages

Dashboard → **Workspace → Pages → Create → Connect to Git**:

- Account: (id `f37fcccb57dec33761183b5ebd169582`)
- Project name: `global-city`
- Repository: `phammythanh/global-city`
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable: `NODE_VERSION=20` (also pinned in `.node-version`)

Then **Custom domains → Add** → `globalcity.batdongsansinhloi.com`, and add
the CNAME record it gives you under the `batdongsansinhloi.com` zone in
Cloudflare DNS (or let Cloudflare add it automatically if the zone is on the
same account).

The KV namespace the contact form writes to (`LIEN_HE_LEADS`) already exists
and its id is in `wrangler.toml`.

## Brand

- Primary `#A78948` — nút CTA, logo, heading, số liệu nhấn
- Accent `#66542C` — header/footer background, hover, overlay
- Accent đậm nhất `#41361E` — text thường/heading (`--color-primary-dark`,
  `--color-text`), và nền cần tương phản mạnh (lightbox/modal overlay)
- Tint nhạt `#B8A782` — `--color-text-muted` / `--color-tint`: viền nút nhạt,
  badge phụ
- Nền `#F8F8F8` (`--color-bg`) / `#FFFFFF` (`--color-surface`)
- Text trên nền tối `#FFFFFF` (`--color-on-dark`)
- Heading: **Cera Black** · Body: Be Vietnam Pro (loaded via Google Fonts in
  `src/layouts/BaseLayout.astro`)
- Cera Black is a commercial font, not available on Google Fonts. Drop the
  purchased files into `public/fonts/` as `CeraPro-Black.woff2` /
  `CeraPro-Black.woff` (declared in `src/styles/global.css`); until then the
  site falls back to Montserrat/system sans automatically.
- `src/assets/logo.png` is the real logo; `src/assets/og-cover.png` is that
  logo composited onto a brand-colored card for link previews. Replace
  either and run `npm run dev` (or `predev`/`prebuild`) to regenerate
  `public/favicon.png` and `public/og/default.jpg`.
- Hotline `0903596692` · Email `thanh@batdongsansinhloi.com` (edit under
  **Cấu hình chung** in the CMS, not hardcoded — see `src/content/settings/site.yml`)

## Not yet done

- [ ] Cera Black font files in `public/fonts/`
- [x] Create the GitHub repo `phammythanh/global-city` (private) and push
- [ ] Deploy `cms-oauth-worker/` and point `public/admin/config.yml` at it
- [x] Create the KV namespace (id pasted into `wrangler.toml`)
- [ ] Create the Cloudflare Pages project (dashboard, Connect to Git) + custom domain
- [ ] Add a Google Analytics (GA4) tag once you have a Global City property
      (deliberately not wired up yet — the old snippet was Sensa Park's own
      measurement ID)
