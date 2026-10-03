import 'dotenv/config';
const number = (name, fallback) => Number.isFinite(Number(process.env[name])) ? Number(process.env[name]) : fallback;
export const config = {
  adminPassword: process.env.ADMIN_PASSWORD || 'change-this-password', botName: process.env.BOT_NAME || 'پشتیبانی هوشمند',
  supportGroupJid: process.env.SUPPORT_GROUP_JID || '', defaultProvider: (process.env.DEFAULT_PROVIDER || 'deepseek').toLowerCase(),
  sessionDir: process.env.SESSION_DIR || './auth_info', dataFile: process.env.DATA_FILE || './data/store.json',
  knowledgeFile: process.env.KNOWLEDGE_FILE || './data/knowledge.json', timeoutMinutes: number('CHAT_TIMEOUT_MINUTES', 30), maxContextChars: number('MAX_CONTEXT_CHARS', 12000),
  crawl: { maxDepth: number('CRAWL_MAX_DEPTH', 4), maxPages: number('CRAWL_MAX_PAGES', 250), chunkChars: number('KNOWLEDGE_CHUNK_CHARS', 1200), requestTimeoutMs: number('CRAWL_REQUEST_TIMEOUT_MS', 15000) },
  providers: { liria: { url: process.env.LIRIA_API_URL, key: process.env.LIRIA_API_KEY, model: process.env.LIRIA_MODEL }, deepseek: { url: process.env.DEEPSEEK_API_URL, key: process.env.DEEPSEEK_API_KEY, model: process.env.DEEPSEEK_MODEL }, gapgpt: { url: process.env.GAPGPT_API_URL, key: process.env.GAPGPT_API_KEY, model: process.env.GAPGPT_MODEL } },
};