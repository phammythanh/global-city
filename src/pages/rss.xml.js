import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import he from 'he';

const { decode } = he;

export async function GET(context) {
  const posts = (await getCollection('news', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: 'Global City - Tin tức',
    description: 'Tin tức và cập nhật mới nhất từ dự án Global City.',
    site: context.site,
    items: posts.map((post) => ({
      title: decode(post.data.title),
      description: decode(post.data.excerpt),
      pubDate: post.data.date,
      link: `/tin-tuc/${post.id}`,
    })),
    customData: '<language>vi-vn</language>',
  });
}
