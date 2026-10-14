// Archive the current tools.ly WordPress content (public REST API) into _source/
// Usage: node tools/fetch-wp-content.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://tools.ly';
const API = `${SITE}/wp-json/wp/v2`;
const OUT = join(ROOT, '_source');

const get = async (url) => {
  const res = await fetch(url, { headers: { 'user-agent': 'tools-ly-rebuild/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const total = res.headers.get('x-wp-totalpages');
  return { data: await res.json(), totalPages: total ? Number(total) : 1 };
};

const paged = async (path, fields) => {
  const out = [];
  let page = 1;
  for (;;) {
    const sep = path.includes('?') ? '&' : '?';
    const { data, totalPages } = await get(`${API}/${path}${sep}per_page=100&page=${page}${fields ? `&_fields=${fields}` : ''}`);
    out.push(...data);
    if (page >= totalPages || data.length === 0) break;
    page += 1;
  }
  return out;
};

const save = async (rel, text) => {
  const file = join(OUT, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, text, 'utf8');
  return rel;
};

const FIELDS = 'id,slug,link,date,modified,title,content,excerpt,categories,tags,featured_media,author';

const [posts, pages, categories, tags, media, users] = await Promise.all([
  paged('posts', FIELDS),
  paged('pages', FIELDS),
  paged('categories', 'id,name,slug,link,count,parent'),
  paged('tags', 'id,name,slug,link,count'),
  paged('media', 'id,slug,source_url,alt_text,title,mime_type,media_details'),
  paged('users', 'id,name,slug,link'),
]);

const written = [];
written.push(await save('wp/posts.json', JSON.stringify(posts, null, 2)));
written.push(await save('wp/pages.json', JSON.stringify(pages, null, 2)));
written.push(await save('wp/categories.json', JSON.stringify(categories, null, 2)));
written.push(await save('wp/tags.json', JSON.stringify(tags, null, 2)));
written.push(await save('wp/media.json', JSON.stringify(media, null, 2)));
written.push(await save('wp/users.json', JSON.stringify(users, null, 2)));

// Manifest: every URL that must keep working after the migration.
const urls = [
  ...pages.map((p) => ({ type: 'page', id: p.id, title: p.title.rendered, url: p.link, slug: p.slug })),
  ...posts.map((p) => ({ type: 'post', id: p.id, title: p.title.rendered, url: p.link, slug: p.slug })),
  ...categories.map((c) => ({ type: 'category', id: c.id, title: c.name, url: c.link, slug: c.slug })),
];
written.push(await save('urls.json', JSON.stringify(urls, null, 2)));

// Raw rendered HTML snapshot of every live page (for design/content reference).
const snap = async (entry) => {
  try {
    const res = await fetch(entry.url, { headers: { 'user-agent': 'tools-ly-rebuild/1.0' } });
    const html = await res.text();
    await save(`html/${entry.type}-${entry.id}.html`, html);
    return true;
  } catch {
    return false;
  }
};
let snapOk = 0;
for (const entry of urls) if (await snap(entry)) snapOk += 1;

console.log(JSON.stringify({ posts: posts.length, pages: pages.length, categories: categories.length, media: media.length, urls: urls.length, snapshots: snapOk, written }, null, 2));
