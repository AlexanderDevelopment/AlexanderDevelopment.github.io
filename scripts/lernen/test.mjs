import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createSession,answerQuestion,nextQuestion,validateSession} from '../../lernen/engine.mjs';
const root=new URL('../../',import.meta.url);
const {version,questions}=JSON.parse(await readFile(new URL('lernen/questions.json',root),'utf8'));
const ids=questions.map(q=>q.id),byId=new Map(questions.map(q=>[q.id,q]));
const plain=JSON.parse(await readFile(new URL('scripts/lernen/catalog-de.json',root),'utf8'));
const provenance=JSON.parse(await readFile(new URL('scripts/lernen/provenance.json',root),'utf8'));
const fresh=()=>createSession(ids,version,1000);
const wrong=(state)=>{const q=byId.get(state.queue[0]);return answerQuestion(state,q,(q.correct+1)%4,2000);};

test('310 contiguous questions, exactly 300 general and 10 Bavaria',()=>{
  assert.deepEqual(ids,Array.from({length:310},(_,i)=>i+1));
  assert.equal(questions.filter(q=>q.region==='Deutschland').length,300);
  assert.equal(questions.filter(q=>q.region==='Bayern').length,10);
  for(const q of questions){assert.equal(q.answers.length,4);assert.ok(q.answers.every(a=>typeof a==='string'&&a.trim()));assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);}
});
test('all translations and German lines have balanced bold terms and preserve German wording',()=>{
  for(const [i,q] of questions.entries()){
    for(const lang of ['de','ru','en']){assert.ok(q[lang].includes('**'),`${q.id}/${lang}`);assert.equal(q[lang].split('**').length%2,1);assert.ok(!/[<>\uFFFD]/.test(q[lang]),`${q.id}/${lang}`);}
    assert.equal(q.de.replaceAll('**',''),plain[i].de);
    assert.ok(/[А-Яа-яЁё]/u.test(q.ru));assert.ok(!/[А-Яа-яЁё]/u.test(q.en));
    assert.deepEqual(q.answers,plain[i].answers);assert.equal(q.correct,plain[i].correct);
  }
});
test('official key spot checks: first, Chancellor, parliamentary groups, Bavaria coat and map',()=>{
  assert.equal(byId.get(1).correct,3);assert.equal(byId.get(72).answers[byId.get(72).correct],'Friedrich Merz');
  assert.equal(byId.get(73).answers[byId.get(73).correct],'CDU/CSU und AfD.');
  assert.equal(byId.get(301).correct,1);assert.equal(byId.get(308).correct,3);
});
test('every bundled illustration exists and is byte-identical to official download',async()=>{
  assert.equal(provenance.images.length,13);
  for(const image of provenance.images){const file=new URL(`lernen/assets/${image.file}`,root);assert.ok((await stat(file)).size>100);assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),image.sha256);assert.equal(byId.get(image.id).image,`assets/${image.file}`);}
});
test('a correct answer removes the question exactly once and survives reload with feedback',()=>{
  const state=answerQuestion(fresh(),questions[0],questions[0].correct);
  assert.equal(state.queue[0],2);assert.deepEqual(state.mastered,[1]);assert.equal(state.attempts,1);assert.equal(state.mistakes,0);
  const restored=JSON.parse(JSON.stringify(state));assert.ok(validateSession(restored,questions,version));assert.equal(restored.pending.id,1);
  assert.throws(()=>answerQuestion(state,questions[0],0));assert.equal(nextQuestion(restored).queue[0],2);
});
test('20% insertion uses remaining questions with ceiling, not total course length',()=>{
  for(const [size,delay] of [[310,62],[101,20],[100,20],[7,2],[6,1],[2,1],[1,0]]){
    const slice=questions.slice(0,size),s=createSession(slice.map(q=>q.id),version),result=wrong(s);
    assert.equal(result.pending.delay,delay,`size ${size}`);assert.equal(result.queue.indexOf(1),delay);
    assert.equal(result.queue.length,size);assert.equal(result.mastered.length,0);assert.equal(new Set(result.queue).size,size);
    assert.ok(validateSession(result,slice,version));
  }
});
test('wrong question is seen after exactly 20 other successful answers when 100 remain',()=>{
  const subset=questions.slice(0,101);let s=nextQuestion(wrong(createSession(subset.map(q=>q.id),version)));
  for(let i=2;i<=21;i++){assert.equal(s.queue[0],i);s=nextQuestion(answerQuestion(s,byId.get(i),byId.get(i).correct));}
  assert.equal(s.queue[0],1);assert.equal(s.mastered.length,20);
});
test('last question can fail repeatedly, then finish only on a correct answer',()=>{
  let s=createSession([1],version);
  for(let i=0;i<12;i++){s=wrong(s);assert.equal(s.queue.length,1);assert.equal(s.pending.delay,0);s=nextQuestion(s);}
  s=answerQuestion(s,questions[0],questions[0].correct);assert.equal(s.queue.length,0);assert.equal(s.attempts,13);assert.equal(s.mistakes,12);
  s=nextQuestion(s);assert.equal(s.pending,null);assert.deepEqual(s.mastered,[1]);
});
test('mixed failures terminate with all questions mastered; every intermediate state round-trips',()=>{
  let s=fresh(),seen=new Map();
  while(s.queue.length){
    const q=byId.get(s.queue[0]),count=seen.get(q.id)||0;seen.set(q.id,count+1);
    const choice=q.id%3===0&&count<2?(q.correct+1)%4:q.correct;
    s=answerQuestion(s,q,choice);
    assert.ok(validateSession(JSON.parse(JSON.stringify(s)),questions,version));
    assert.equal(s.queue.length+s.mastered.length,310);
    s=nextQuestion(s);assert.ok(validateSession(s,questions,version));
    assert.ok(s.attempts<1000);
  }
  assert.equal(s.mastered.length,310);assert.equal(s.mistakes,206);assert.equal(s.attempts,516);
});
test('malformed storage, stale versions, duplicates and forged feedback are rejected',()=>{
  const s=fresh();assert.ok(validateSession(s,questions,version));
  for(const bad of [null,{}, {...s,version:'old'},{...s,queue:[1,...s.queue.slice(0,-1)]},{...s,mastered:[1]},{...s,attempts:-1},{...s,mistakes:1},{...s,startedAt:null},{...s,pending:{id:1,choice:0,correct:true,delay:0}}])assert.equal(validateSession(bad,questions,version),false);
  const p=wrong(s);assert.equal(validateSession({...p,pending:{...p.pending,delay:61}},questions,version),false);
});
test('answer and next guards reject stale UI, invalid answers and duplicate next',()=>{
  assert.throws(()=>answerQuestion(fresh(),questions[1],0));
  for(const choice of [-1,4,1.5,null,'1'])assert.throws(()=>answerQuestion(fresh(),questions[0],choice));
  assert.throws(()=>nextQuestion(fresh()));
});
