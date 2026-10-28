import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createExam,remainingMs,selectAnswer,navigateExam,finishExam,scoreExam,emptyExamStore,recordExam,validateExamStore,EXAM_DURATION} from '../../lernen/exam-engine.mjs';
const {questions,version}=JSON.parse(await readFile(new URL('../../lernen/questions.json',import.meta.url),'utf8'));
const byId=new Map(questions.map(q=>[q.id,q]));
const start=1000000;
const fresh=(mode='none',id='exam-1')=>createExam(questions,version,mode,id,start);
const roundtrip=value=>JSON.parse(JSON.stringify(value));

test('random papers always contain 30 unique general + 3 unique Bavaria questions in every mode',()=>{
  const papers=new Set();
  for(const mode of ['none','ru','en'])for(let i=0;i<80;i++){
    const exam=fresh(mode);papers.add(exam.ids.join(','));
    assert.equal(exam.ids.length,33);assert.equal(new Set(exam.ids).size,33);
    assert.ok(exam.ids.slice(0,30).every(id=>byId.get(id).region==='Deutschland'));
    assert.ok(exam.ids.slice(30).every(id=>byId.get(id).region==='Bayern'));
    assert.ok(validateExamStore(recordExam(emptyExamStore(version),exam),questions,version));
    assert.equal(exam.deadline-exam.startedAt,3600000);
  }
  assert.ok(papers.size>200);
});

test('choices can change and clear, skipped questions remain blank, navigation and reload preserve answers',()=>{
  let exam=fresh('ru');
  exam=selectAnswer(exam,2,start+100);exam=selectAnswer(exam,1,start+200);
  exam=navigateExam(exam,32,start+300);exam=selectAnswer(exam,0,start+400);
  exam=navigateExam(exam,0,start+500);assert.equal(exam.answers[0],1);
  exam=selectAnswer(exam,null,start+600);
  const restored=roundtrip(recordExam(emptyExamStore(version),exam));
  assert.ok(validateExamStore(restored,questions,version));assert.equal(restored.current.answers[0],null);
  assert.equal(restored.current.answers[32],0);assert.equal(restored.current.answers.filter(a=>a===null).length,32);
  assert.equal(restored.current.deadline,start+EXAM_DURATION);assert.throws(()=>scoreExam(exam,byId));
});

test('absolute deadline survives reload/background, expiry rejects edits and records exactly 60 minutes',()=>{
  let exam=roundtrip(fresh());
  exam=selectAnswer(exam,3,exam.deadline-1);
  assert.equal(remainingMs(exam,exam.deadline-1),1);
  assert.throws(()=>selectAnswer(exam,2,exam.deadline));assert.throws(()=>navigateExam(exam,2,exam.deadline));
  assert.equal(remainingMs(exam,exam.deadline+3600000),0);
  const result=finishExam(exam,exam.deadline+86400000);
  assert.equal(result.finishedAt,exam.deadline);assert.equal(result.endReason,'timeout');
  assert.equal(scoreExam(result,byId).elapsed,EXAM_DURATION);
  assert.deepEqual(result.answers,exam.answers);
  assert.ok(validateExamStore(recordExam(emptyExamStore(version),result),questions,version));
});

test('recorded time cannot move backwards within an attempt',()=>{
  const exam=selectAnswer(fresh(),1,start+30000);
  assert.equal(remainingMs(exam,start),EXAM_DURATION-30000);
  assert.equal(finishExam(exam,start).finishedAt,start+30000);
});

test('LiD pass boundary is 15, blanks count as unsuccessful, scores cannot be revealed early',()=>{
  for(const correctCount of [0,14,15,16,17,33]){
    let exam=fresh();
    for(let i=0;i<correctCount;i++){
      exam=navigateExam(exam,i,start+1000+i);
      exam=selectAnswer(exam,byId.get(exam.ids[i]).correct,start+1000+i);
    }
    assert.throws(()=>scoreExam(exam,byId));
    const result=scoreExam(finishExam(exam,start+2000),byId);
    assert.equal(result.correct,correctCount);assert.equal(result.passed,correctCount>=15);
    assert.equal(result.unanswered,33-correctCount);assert.equal(result.wrong,0);
  }
});

test('completed attempts are immutable and repeated submission cannot duplicate history',()=>{
  const exam=finishExam(fresh('en'),start+10000);
  assert.throws(()=>selectAnswer(exam,0,start+10001));assert.throws(()=>navigateExam(exam,1,start+10001));
  assert.equal(finishExam(exam,start+EXAM_DURATION),exam);
  let store=recordExam(emptyExamStore(version),exam);store=recordExam(store,exam);
  assert.equal(store.history.length,1);assert.ok(validateExamStore(roundtrip(store),questions,version));
});

test('mixed-mode history retains ordered scores and answers across reload, with no learning-store fields',()=>{
  let store=emptyExamStore(version);
  for(const [n,mode] of ['none','ru','en'].entries()){
    let exam=fresh(mode,`attempt-${n}`);
    for(let i=0;i<10+n*5;i++){exam=navigateExam(exam,i,start+100);exam=selectAnswer(exam,byId.get(exam.ids[i]).correct,start+100);}
    store=recordExam(store,finishExam(exam,start+20000+n*1000));
  }
  store=roundtrip(store);assert.ok(validateExamStore(store,questions,version));
  assert.deepEqual(store.history.map(e=>scoreExam(e,byId).correct),[20,15,10]);
  assert.deepEqual(store.history.map(e=>e.translation),['en','ru','none']);
  assert.equal(scoreExam(store.history[0],byId).correct-scoreExam(store.history[1],byId).correct,5);
  assert.ok(!('queue' in store));assert.ok(!('mastered' in store));
});

test('invalid persisted exams, modes, deadlines, choices and conflicting histories are rejected',()=>{
  const original=recordExam(emptyExamStore(version),fresh());
  const variants=[s=>{s.version='old';},s=>{s.revision=-1;},s=>{s.current.ids[0]=s.current.ids[1];},s=>{s.current.ids[32]=1;},
    s=>{s.current.translation='de';},s=>{s.current.deadline+=1;},s=>{s.current.answers[0]=4;},s=>{s.current.index=33;},s=>{s.current.startedAt=null;},
    s=>{s.current.finishedAt=start-1;},s=>{s.history=[s.current];}];
  for(const change of variants){const store=roundtrip(original);change(store);assert.equal(validateExamStore(store,questions,version),false);}
  const complete=recordExam(original,finishExam(original.current,start+10));
  const duplicate=roundtrip(complete);duplicate.history.push(duplicate.history[0]);assert.equal(validateExamStore(duplicate,questions,version),false);
  const conflict=roundtrip(complete);conflict.current.answers[0]=1;assert.equal(validateExamStore(conflict,questions,version),false);
  for(const bad of [null,{},[],{...original,history:[null]}])assert.equal(validateExamStore(bad,questions,version),false);
});

test('guards reject invalid catalogue, navigation and choices before mutation',()=>{
  assert.throws(()=>createExam(questions.slice(1),version,'none','x',start));
  assert.throws(()=>createExam(questions,version,'de','x',start));
  for(const choice of [-1,4,1.1,'1',undefined])assert.throws(()=>selectAnswer(fresh(),choice,start));
  for(const index of [-1,33,1.1,null])assert.throws(()=>navigateExam(fresh(),index,start));
});
