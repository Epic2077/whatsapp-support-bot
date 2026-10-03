import { createStore } from './store.js';
import { loadKnowledge } from './knowledge.js';
import { startBot, sendLeadSummary } from './bot.js';
import { config } from './config.js';
const store = await createStore(); const knowledge = await loadKnowledge(); const sock = await startBot(store, knowledge); console.log(`Loaded ${knowledge.length} knowledge pages. Admin: /admin <password> help`);
setInterval(async () => { const cutoff = Date.now() - config.timeoutMinutes * 60_000; for (const [jid, conversation] of Object.entries(store.get().conversations)) if (!conversation.closedAt && new Date(conversation.lastActivity).getTime() < cutoff) { conversation.closedAt = new Date().toISOString(); await sendLeadSummary(sock, store, jid); await store.save(); } }, 60_000);