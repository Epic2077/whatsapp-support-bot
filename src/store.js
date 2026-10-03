import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';
const initial = { contacts: {}, conversations: {}, usage: {}, settings: { provider: config.defaultProvider } };
export const now = () => new Date().toISOString();
export async function createStore() {
  await fs.mkdir(path.dirname(config.dataFile), { recursive: true }); let state = initial;
  try { state = { ...initial, ...(JSON.parse(await fs.readFile(config.dataFile, 'utf8'))) }; } catch { await fs.writeFile(config.dataFile, JSON.stringify(state, null, 2)); }
  let writing = Promise.resolve();
  const save = async () => { writing = writing.then(() => fs.writeFile(config.dataFile, JSON.stringify(state, null, 2))); await writing; };
  return { get: () => state, save, update: async (fn) => { await fn(state); await save(); return state; } };
}