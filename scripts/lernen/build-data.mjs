import { readFile, writeFile } from 'node:fs/promises';
const base = new URL('./', import.meta.url);
const catalogue = JSON.parse(await readFile(new URL('catalog-de.json', base), 'utf8'));
const lines = (await readFile(new URL('translations.tsv', base), 'utf8')).trim().split(/\r?\n/);
const translations = new Map(lines.map(line => {
  const fields = line.split('|');
  if (fields.length !== 4) throw new Error(`Invalid translation row: ${fields[0]}`);
  const [id, term, ru, en] = fields;
  return [Number(id), { term, ru, en }];
}));
if (translations.size !== 310 || lines.length !== 310) throw new Error('Expected 310 unique translations');
const questions = catalogue.map(q => {
  const t = translations.get(q.id);
  if (!t || !q.de.includes(t.term)) throw new Error(`Missing German emphasis: ${q.id}: ${t?.term} in ${q.de}`);
  for (const lang of ['ru','en']) {
    if (!/\*\*[^*]+\*\*/.test(t[lang]) || (t[lang].match(/\*\*/g) || []).length % 2) throw new Error(`Invalid emphasis ${q.id}/${lang}`);
  }
  // Extend a stem to the complete word; never split a word visually.
  const pattern = new RegExp(t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\p{L}]*', 'gu');
  return { ...q, de:q.de.replace(pattern, '**$&**'), ru:t.ru, en:t.en };
});
await writeFile(new URL('../../lernen/questions.json', base), JSON.stringify({version:'bamf-by-2026-10-28-v1',questions})+'\n');
console.log(`Built ${questions.length} questions, 620 translations, 930 marked question lines.`);
