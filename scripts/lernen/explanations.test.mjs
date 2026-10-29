import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseExplanations,explanationFor} from '../../lernen/explanation-data.mjs';
import {createSession,answerQuestion,nextQuestion,validateSession} from '../../lernen/engine.mjs';
const root=new URL('../../',import.meta.url);
const {version,questions}=JSON.parse(await readFile(new URL('lernen/questions.json',root),'utf8'));
const data=JSON.parse(await readFile(new URL('lernen/explanations.json',root),'utf8'));
const map=parseExplanations(data,questions,version);

test('all 310 official answers have short bilingual explanations and traceable sources',()=>{
  assert.deepEqual([...map.keys()],questions.map(q=>q.id));
  for(const entry of map.values())for(const language of ['ru','en']){
    const text=entry[language].replaceAll('**','');
    const sentences=[...new Intl.Segmenter(language,{granularity:'sentence'}).segment(text)];
    assert.ok(sentences.length>=2&&sentences.length<=3,`${entry.id}/${language}: ${sentences.length} sentences`);
    assert.ok(text.split(/\s+/).length<=80,`${entry.id}/${language}: explanation too long`);
    assert.match(entry[language],/\*\*[^*]+\*\*/);
    assert.equal(/[А-Яа-яЁё]/u.test(text),language==='ru');
    for(const key of entry.sources)assert.ok(data.sources[key].title&&data.sources[key].url.startsWith('https://'));
  }
});

test('incorrect feedback gains explanations on reload without changing attempts or retry order',()=>{
  let state=createSession(questions.map(q=>q.id),version,1000);
  const q=questions[0];state=answerQuestion(state,q,(q.correct+1)%4,2000);
  const serialized=JSON.stringify(state),restored=JSON.parse(serialized);
  assert.ok(validateSession(restored,questions,version));
  assert.equal(restored.pending.delay,62);
  for(const language of ['ru','en'])assert.equal(explanationFor(restored.pending,language,map),map.get(q.id)[language]);
  assert.equal(JSON.stringify(restored),serialized);
  assert.equal(restored.attempts,1);assert.equal(restored.mistakes,1);
  assert.equal(explanationFor(nextQuestion(restored,3000).pending,'ru',map),null);
});

test('every question reveals context only on an incorrect answer in either language',()=>{
  for(const q of questions){
    const fresh=()=>createSession([q.id],version,1000);
    const wrong=answerQuestion(fresh(),q,(q.correct+1)%4,2000);
    const correct=answerQuestion(fresh(),q,q.correct,2000);
    for(const lang of ['ru','en']){
      assert.equal(explanationFor(null,lang,map),null);
      assert.equal(explanationFor(correct.pending,lang,map),null);
      assert.equal(explanationFor(wrong.pending,lang,map),map.get(q.id)[lang]);
    }
  }
});

test('incomplete, stale, mismatched and unsafe explanation data is rejected',()=>{
  const altered=fn=>{const copy=structuredClone(data);fn(copy);return copy;};
  const invalid=[null,{},altered(d=>d.catalogueVersion='old'),altered(d=>d.explanations.pop()),
    altered(d=>d.explanations[1].id=1),altered(d=>d.explanations[0].correctAnswer='wrong'),
    altered(d=>d.explanations[0].ru=''),altered(d=>d.explanations[0].en+=' **unfinished'),
    altered(d=>d.explanations[0].en+='<img src=x>'),altered(d=>d.explanations[0].sources=['unknown']),
    altered(d=>d.sources.gg5.url='javascript:alert(1)')];
  for(const item of invalid)assert.throws(()=>parseExplanations(item,questions,version));
  assert.throws(()=>explanationFor({id:1,correct:false},'de',map));
});

test('context preserves important qualifications and image recognition clues',()=>{
  assert.match(map.get(5).en,/campaigning.*allowed/);
  assert.match(map.get(117).en,/exceptions.*minority.*three constituencies/);
  assert.match(map.get(184).en,/181.*1947/);assert.match(map.get(184).en,/not.*declaration/);
  assert.match(map.get(213).en,/approximate/);assert.match(map.get(256).en,/alcohol.*exemptions/i);
  assert.match(map.get(263).en,/mature/);assert.match(map.get(269).en,/age one/);
  assert.match(map.get(297).en,/nationality, birthplace and family origin/);
  assert.match(map.get(301).en,/diamonds/);assert.match(map.get(308).en,/southeastern.*Austria and Czechia/);
});
