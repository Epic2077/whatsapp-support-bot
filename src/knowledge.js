import fs from 'node:fs/promises';
import { config } from './config.js';
const normalize = (value) => value.toLocaleLowerCase('fa-IR').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[\u064B-\u065F\u0670]/g, '');
const tokens = (value) => normalize(value).split(/[^\p{L}\p{N}]+/u).filter((token) => token.length > 1);
const chunksFor = (page) => { const chunks = []; let current = ''; for (const paragraph of page.text.split(/(?<=[.!؟،؛:])\s+|\n+/).map((part) => part.trim()).filter(Boolean)) { if (current && current.length + paragraph.length + 1 > config.crawl.chunkChars) { chunks.push(current); current = ''; } current += `${current ? ' ' : ''}${paragraph}`; } if (current) chunks.push(current); return chunks.length ? chunks : [page.text.slice(0, config.crawl.chunkChars)]; };
export async function loadKnowledge() { try { const data = JSON.parse(await fs.readFile(config.knowledgeFile, 'utf8')); return Array.isArray(data) ? data : []; } catch { return []; } }
export function contextFor(question, pages) {
  const questionTokens = new Set(tokens(question)); if (!questionTokens.size) return '';
  const candidates = pages.flatMap((page) => chunksFor(page).map((text, index) => { const chunkTokens = new Set(tokens(text)); const overlap = [...questionTokens].filter((token) => chunkTokens.has(token)).length; const phraseBonus = normalize(text).includes(normalize(question)) ? 3 : 0; return { page, text, index, score: overlap + phraseBonus }; })).filter((candidate) => candidate.score > 0).sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = []; const used = new Set(); let size = 0;
  for (const candidate of candidates) { if (used.has(candidate.page.url) || selected.length >= 8) continue; const addition = `منبع: ${candidate.page.title || candidate.page.url}\nآدرس: ${candidate.page.url}\n${candidate.text}`; if (size + addition.length > config.maxContextChars) continue; selected.push(addition); used.add(candidate.page.url); size += addition.length; }
  return selected.join('\n\n');
}