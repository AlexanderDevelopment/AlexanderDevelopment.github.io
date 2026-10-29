import { readFile, writeFile } from 'node:fs/promises';
import {parseExplanations} from '../../lernen/explanation-data.mjs';
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

const explanationSources=JSON.parse(await readFile(new URL('explanation-sources.json',base),'utf8'));
const explanationRows=(await readFile(new URL('explanations.tsv',base),'utf8')).trim().split(/\r?\n/);
const explanationById=new Map();
for(const line of explanationRows){
  const fields=line.split('|');
  if(fields.length!==4)throw new Error(`Invalid explanation row: ${fields[0]}`);
  const [ids,sources,ru,en]=fields;
  for(const rawId of ids.split(',')){
    const id=Number(rawId);
    if(!Number.isInteger(id)||id<1||id>310||explanationById.has(id))throw new Error(`Invalid or duplicate explanation ID: ${rawId}`);
    explanationById.set(id,{id,ru,en,sources:sources.split(',')});
  }
}
if(explanationById.size!==catalogue.length)throw new Error('Expected explanations for all 310 questions');
const explanations=catalogue.map(q=>({...explanationById.get(q.id),correctAnswer:q.answers[q.correct]}));
const explanationData={version:'bamf-by-explanations-v1',catalogueVersion:'bamf-by-2026-10-28-v1',reviewedAt:explanationSources.reviewedAt,sources:explanationSources.sources,explanations};
parseExplanations(explanationData,questions,explanationData.catalogueVersion);
await writeFile(new URL('../../lernen/explanations.json',base),JSON.stringify(explanationData)+'\n');
console.log(`Built ${explanations.length} explanations in Russian and English; learning/exam storage unchanged.`);
