import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Shared by "pages" and the per-project "thap-tang"/"cao-tang" collections -
// a title/hero/video/body page that can optionally carry a flat image
// gallery or several labeled groups of images (e.g. mặt bằng theo tầng).
const pageSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    seo_title: z.string().optional(),
    seo_description: z.string().max(200).optional(),
    hero_image: image().optional(),
    hero_image_alt: z.string().optional(),
    // Public-folder video path (e.g. /videos/foo.mp4) - not passed through
    // image(), since astro:assets only processes images.
    intro_video: z.string().optional(),
    gallery: z
      .array(
        z.object({
          image: image(),
          caption: z.string().optional(),
        })
      )
      .optional(),
    gallery_groups: z
      .array(
        z.object({
          label: z.string(),
          items: z.array(
            z.object({
              image: image(),
              caption: z.string().optional(),
            })
          ),
        })
      )
      .optional(),
  });

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: pageSchema,
});

// Thấp tầng: SOHO, SOLA. Cao tầng: Masteri Grand View, Lumière Midtown,
// Masteri Park Place, Masteri Cosmo Central, Masteri Cosmo Central (Nexus
// Zone) - one markdown file per product, listed in the header's dropdowns
// (src/components/Header.astro) and Decap's "files" collections.
const thapTang = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/thap-tang' }),
  schema: pageSchema,
});

const caoTang = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cao-tang' }),
  schema: pageSchema,
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      excerpt: z.string().max(200),
      cover: image().optional(),
      cover_alt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const settings = defineCollection({
  // site.yml nests its data under a top-level `site:` key so the file()
  // loader (which expects either an array of {id,...} objects or a map of
  // id -> entry) treats "site" as this entry's id.
  loader: file('./src/content/settings/site.yml'),
  schema: z.object({
    site_name: z.string(),
    tagline: z.string().optional(),
    phone: z.string(),
    email: z.string().email(),
    address: z.string().optional(),
    // Editors leave these blank ("") until a link exists, so plain
    // .url() would reject the empty-string default — accept "" or a URL.
    zalo_link: z.union([z.string().url(), z.literal('')]).optional(),
    facebook_link: z.union([z.string().url(), z.literal('')]).optional(),
    youtube_link: z.union([z.string().url(), z.literal('')]).optional(),
    website_link: z.union([z.string().url(), z.literal('')]).optional(),
    default_seo_description: z.string().max(160),
  }),
});

export const collections = { pages, news, settings, 'thap-tang': thapTang, 'cao-tang': caoTang };
