import fs from 'node:fs/promises';
import { config } from './config.js';

const normalizeUrl = (value) => { const url = new URL(value); url.hash = ''; if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/$/, ''); return url.toString(); };
const isHttp = (url) => url.protocol === 'http:' || url.protocol === 'https:';
const stripHtml = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim();
const titleOf = (html, fallback) => html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || fallback;

function linksFrom(html, sourceUrl, origin) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    try { const url = new URL(match[1], sourceUrl); if (isHttp(url) && url.origin === origin) links.push(normalizeUrl(url.toString())); } catch { /* Ignore malformed links. */ }
  }
  return [...new Set(links)];
}

async function fetchPage(url) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), config.crawl.requestTimeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { 'user-agent': 'whatsapp-support-bot/1.0', accept: 'text/html,application/xhtml+xml' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!(response.headers.get('content-type') || '').includes('html')) return null;
    const html = await response.text(); return { title: titleOf(html, url), text: stripHtml(html), links: linksFrom(html, url, new URL(url).origin) };
  } finally { clearTimeout(timer); }
}

export async function crawlSite(seedUrl) {
  const root = new URL(normalizeUrl(seedUrl)); const queue = [{ url: root.toString(), depth: 0 }]; const seen = new Set(); const pages = [];
  while (queue.length && pages.length < config.crawl.maxPages) {
    const current = queue.shift(); if (seen.has(current.url)) continue; seen.add(current.url);
    try {
      const page = await fetchPage(current.url); if (!page) continue;
      pages.push({ url: current.url, title: page.title, text: page.text.slice(0, 50000), depth: current.depth, scrapedAt: new Date().toISOString() });
      console.log(`Scraped ${pages.length}/${config.crawl.maxPages}: ${current.url}`);
      if (current.depth < config.crawl.maxDepth) for (const link of page.links) if (!seen.has(link) && !queue.some((item) => item.url === link)) queue.push({ url: link, depth: current.depth + 1 });
    } catch (error) { console.error(`Could not scrape ${current.url}: ${error.message}`); }
  }
  return pages;
}

export async function scrapeKnowledge() {
  const seeds = (process.env.KNOWLEDGE_URLS || '').split(',').map((url) => url.trim()).filter(Boolean); const pages = [];
  for (const seed of seeds) { try { pages.push(...await crawlSite(seed)); } catch (error) { console.error(`Invalid seed ${seed}: ${error.message}`); } }
  const unique = [...new Map(pages.map((page) => [page.url, page])).values()]; await fs.mkdir('data', { recursive: true }); await fs.writeFile(config.knowledgeFile, JSON.stringify(unique, null, 2)); console.log(`Saved ${unique.length} pages to ${config.knowledgeFile}`); return unique;
}
if (process.argv[1]?.endsWith('scrape.js')) await scrapeKnowledge();