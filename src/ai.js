import { config } from './config.js';
const systemPrompt = (context) => `تو ${config.botName} هستی؛ کارشناس پشتیبانی صمیمی و دقیق واتساپ. همیشه فارسی پاسخ بده مگر کاربر زبان دیگری بخواهد. کوتاه و کاربردی بنویس. اگر پاسخ در دانش‌نامه نیست، حدس نزن و بگو درخواست را برای کارشناس انسانی ثبت می‌کنی.\n\nدانش‌نامه:\n${context || 'دانش‌نامه‌ای هنوز بارگذاری نشده است.'}`;
export function availableProviders() { return Object.entries(config.providers).filter(([, p]) => p.url && p.key).map(([name]) => name); }
export async function askAI(providerName, messages, context) {
  const name = providerName || config.defaultProvider; const provider = config.providers[name];
  if (!provider?.url || !provider.key) throw new Error(`Provider ${name} is not configured`);
  const response = await fetch(provider.url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${provider.key}` }, body: JSON.stringify({ model: provider.model, temperature: 0.2, messages: [{ role: 'system', content: systemPrompt(context) }, ...messages] }) });
  if (!response.ok) throw new Error(`${name} returned ${response.status}: ${await response.text()}`);
  return (await response.json()).choices?.[0]?.message?.content?.trim() || 'متأسفم، در حال حاضر امکان پاسخ‌گویی ندارم.';
}