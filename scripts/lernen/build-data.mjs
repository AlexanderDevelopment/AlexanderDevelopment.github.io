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

// Answer feedback is additive presentation data: preserve catalogue/session versions.
const answerLines=(await readFile(new URL('answer-translations.tsv',base),'utf8')).trim().split(/\r?\n/);
const answerRows=new Map(answerLines.map(line=>{
  const fields=line.split('|');
  if(fields.length!==4)throw new Error(`Invalid answer translation row: ${fields[0]}`);
  const [id,term,ru,en]=fields;
  return [Number(id),{term,ru,en}];
}));
if(answerLines.length!==310||answerRows.size!==310)throw new Error('Expected 310 unique answer translation rows');
const answers=catalogue.map(q=>{
  const row=answerRows.get(q.id),original=q.answers[q.correct];
  if(!row?.term||!original.includes(row.term))throw new Error(`Missing answer emphasis: ${q.id}/${row?.term}`);
  for(const lang of ['ru','en']){
    if(!/\*\*[^*]+\*\*/.test(row[lang])||(row[lang].match(/\*\*/g)||[]).length%2||/[<>\uFFFD]/.test(row[lang]))throw new Error(`Invalid answer translation: ${q.id}/${lang}`);
  }
  const pattern=new RegExp(row.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\\p{L}]*','gu');
  return {id:q.id,de:original.replace(pattern,'**$&**'),ru:row.ru,en:row.en};
});
await writeFile(new URL('../../lernen/answer-translations.json',base),JSON.stringify({version:'bamf-by-answer-feedback-v1',catalogueVersion:'bamf-by-2026-10-28-v1',answers})+'\n');
console.log(`Built ${answers.length} correct-answer records and 620 answer translations; catalogue version unchanged.`);
