import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://globalcity.batdongsansinhloi.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap(), mdx()],
  image: {
    domains: ['globalcity.batdongsansinhloi.com'],
  },
});
