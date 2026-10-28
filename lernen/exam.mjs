import {createExam, remainingMs, selectAnswer, navigateExam, finishExam, scoreExam, emptyExamStore, recordExam, validateExamStore} from './exam-engine.mjs';

const STORE_KEY='zb-lernen-bayern-exams-v1', SETTINGS_KEY='zb-lernen-bayern-settings-v1';
const $=id=>document.getElementById(id);
const copy={
  ru:{skip:'Перейти к экзамену',interface:'Язык интерфейса',back:'← К обучению',title:'Пробный экзамен',subtitle:'Проверь себя. Сравни результат. Попробуй ещё.',loading:'Загружаем вопросы…',loadError:'Не удалось загрузить вопросы. Проверь подключение.',retry:'Повторить',setupTitle:'Выбери свой режим',questions:'вопроса',minutes:'минут',threshold:'для успешной сдачи LiD',mode:'Режим экзамена',without:'Без перевода',withoutHelp:'Только немецкий — формат настоящего экзамена.',with:'С переводом',withHelp:'Учебный вариант: перевод вопроса и выделенные слова.',translation:'Язык перевода',rules:'30 общих вопросов + 3 по Баварии. Можно пропускать вопросы и менять ответы. Результат — после сдачи. Таймер идёт без паузы, даже если закрыть страницу; через 60 минут ответы будут сданы автоматически.',start:'Начать экзамен — 60 минут',timeLeft:'Осталось времени',answered:'Отвечено',navigation:'Вопросы',navigationHelp:'Заливка — ответ выбран. Обводка — текущий вопрос.',submit:'Завершить экзамен',choose:'Выбери один ответ. Его можно изменить до сдачи.',clear:'Убрать ответ',prev:'← Назад',next:'Далее →',complete:'ЭКЗАМЕН ЗАВЕРШЁН',resultTitle:'Твой результат',currentResult:'Текущий результат',previousResult:'Предыдущий результат',again:'Пройти новый экзамен',review:'Разбор ответов',reviewHelp:'Открой вопрос, чтобы увидеть свой ответ и правильный вариант.',history:'История попыток',historyHelp:'Результаты хранятся в этом браузере. Режим каждой попытки указан отдельно.',empty:'Здесь появится результат твоего первого экзамена.',officialRules:'Правила LiD ↗',disclaimer:'Независимый пробный экзамен из каталога BAMF. С переводом — учебный режим. Конкретные официальные экзаменационные бланки не публикуются. Учебная очередь сохраняется отдельно.',confirmTitle:'Завершить экзамен?',continue:'Продолжить',submitNow:'Сдать ответы',passed:'LiD сдан',failed:'LiD не сдан',noPrevious:'Первая попытка',noComparison:'После следующего экзамена здесь появится сравнение.',same:'Столько же правильных ответов, как в предыдущей попытке.',differentMode:'Режимы отличаются — учитывай это при сравнении.',timeout:'Время истекло. Ответы сданы автоматически.',submitted:'Ответы сданы. Проходной балл Leben in Deutschland — 15 из 33.',yourAnswer:'Твой ответ',correctAnswer:'Правильный ответ',unanswered:'Нет ответа',correct:'Верно',incorrect:'Ошибка',open:'Разбор',answerStatus:'ответ выбран',emptyStatus:'нет ответа',examLabel:'Экзамен',savedError:'Не удалось сохранить экзамен. Он продолжается в памяти этой страницы; после закрытия или обновления ответы могут потеряться.',restoreError:'Сохранённая история повреждена или относится к другой версии вопросов. Старая запись сохранена. Новые попытки пока доступны только в этой вкладке.',synced:'Экзамен изменён в другой вкладке. Показана актуальная версия; повтори действие при необходимости.',fiveMinutes:'Осталось 5 минут или меньше.',imageFail:'Иллюстрация не загрузилась. Открой её по ссылке перед ответом.',imageOpen:'Открыть иллюстрацию ↗',question:n=>`Вопрос ${n} / 33`,modeName:l=>l==='none'?'Без перевода':`С переводом · ${l==='ru'?'русский':'English'}`,confirm:n=>n?`Без ответа: ${n} из 33. Они будут засчитаны как неверные. После сдачи изменить ответы нельзя.`:'Все 33 вопроса заполнены. После сдачи изменить ответы нельзя.',delta:n=>`${n>0?'+':''}${n} к предыдущему результату.`,detail:(r,time)=>`Правильно: ${r.correct} · Ошибок: ${r.wrong} · Без ответа: ${r.unanswered} · Время: ${time}`,previous:(score,mode)=>`Предыдущая попытка: ${score} / 33 · ${mode}`,image:n=>`Иллюстрация BAMF к вопросу ${n}`},
  en:{skip:'Skip to exam',interface:'Interface language',back:'← Back to practice',title:'Mock exam',subtitle:'Test yourself. Compare your score. Try again.',loading:'Loading questions…',loadError:'Could not load the questions. Check your connection.',retry:'Try again',setupTitle:'Choose your mode',questions:'questions',minutes:'minutes',threshold:'to pass LiD',mode:'Exam mode',without:'Without translation',withoutHelp:'German only — the format of the real exam.',with:'With translation',withHelp:'Study version: translated questions and highlighted vocabulary.',translation:'Translation language',rules:'30 general questions + 3 about Bavaria. Skip questions and change answers until you submit. Results appear afterwards. The timer runs without pausing, even if you close the page; answers are submitted automatically after 60 minutes.',start:'Start exam — 60 minutes',timeLeft:'Time remaining',answered:'Answered',navigation:'Questions',navigationHelp:'Filled: answered. Outlined: current question.',submit:'Finish exam',choose:'Choose one answer. You can change it before submitting.',clear:'Clear answer',prev:'← Previous',next:'Next →',complete:'EXAM COMPLETE',resultTitle:'Your result',currentResult:'Current result',previousResult:'Previous result',again:'Take a new exam',review:'Answer review',reviewHelp:'Open a question to see your answer and the correct option.',history:'Attempt history',historyHelp:'Results are stored in this browser. Each attempt shows its mode.',empty:'Your first exam result will appear here.',officialRules:'LiD rules ↗',disclaimer:'Independent mock exam using the BAMF catalogue. Translation is a study aid. The actual official exam papers are not published. Your practice queue is saved separately.',confirmTitle:'Finish the exam?',continue:'Continue',submitNow:'Submit answers',passed:'LiD passed',failed:'LiD not passed',noPrevious:'First attempt',noComparison:'Your next exam will include a comparison here.',same:'The same number of correct answers as your previous attempt.',differentMode:'The modes differ — bear this in mind when comparing.',timeout:'Time is up. Your answers were submitted automatically.',submitted:'Answers submitted. The Leben in Deutschland pass mark is 15 out of 33.',yourAnswer:'Your answer',correctAnswer:'Correct answer',unanswered:'No answer',correct:'Correct',incorrect:'Incorrect',open:'Review',answerStatus:'answered',emptyStatus:'unanswered',examLabel:'Exam',savedError:'The exam could not be saved. You can continue on this page, but closing or refreshing it may lose your answers.',restoreError:'The saved history is damaged or uses a different question version. It has been preserved. New attempts will only last in this tab for now.',synced:'The exam changed in another tab. The latest version is shown; repeat your action if needed.',fiveMinutes:'5 minutes or less remaining.',imageFail:'The illustration did not load. Open it using the link before answering.',imageOpen:'Open illustration ↗',question:n=>`Question ${n} / 33`,modeName:l=>l==='none'?'Without translation':`With translation · ${l==='ru'?'Russian':'English'}`,confirm:n=>n?`${n} of 33 questions are unanswered and will count as incorrect. You cannot change answers after submission.`:'All 33 questions have an answer. You cannot change answers after submission.',delta:n=>`${n>0?'+':''}${n} compared with your previous result.`,detail:(r,time)=>`Correct: ${r.correct} · Incorrect: ${r.wrong} · Unanswered: ${r.unanswered} · Time: ${time}`,previous:(score,mode)=>`Previous attempt: ${score} / 33 · ${mode}`,image:n=>`BAMF illustration for question ${n}`}
};
let settings={ui:'ru',translation:'ru'}, questions=[], byId=new Map(), version='', store=null;
let lastSaved=null, preserveOld=false, storageIssue='', synced=false, screen='setup', reviewedId=null, warnedAttempt=null;
let renderedAttempt=null, renderedIndex=null;
try {
  const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY));
  if(saved && ['ru','en'].includes(saved.ui) && ['ru','en'].includes(saved.translation))settings=saved;
} catch(error){console.warn('Exam language settings could not be restored.',error.name);}
const t=()=>copy[settings.ui];
const plain=text=>text.replaceAll('**','');
const active=()=>store?.current && store.current.finishedAt===null;
const duration=ms=>{const seconds=Math.ceil(Math.max(0,ms)/1000);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
const date=ms=>new Intl.DateTimeFormat(settings.ui==='ru'?'ru-RU':'en-GB',{dateStyle:'medium',timeStyle:'short'}).format(ms);

function richText(element,text){
  element.replaceChildren(...text.split('**').map((part,index)=>index%2?Object.assign(document.createElement('strong'),{textContent:part}):document.createTextNode(part)));
}
function node(tag,text,className=''){
  const element=document.createElement(tag);element.textContent=text;element.className=className;return element;
}
function renderNotice(){
  $('exam-notice').hidden=!storageIssue&&!synced;
  $('exam-notice').textContent=[storageIssue?t()[storageIssue]:'',synced?t().synced:''].filter(Boolean).join(' ');
}
function renderLanguage(){
  document.documentElement.lang=settings.ui;document.title=`Leben in Deutschland — ${t().title}`;
  document.querySelectorAll('[data-exam]').forEach(el=>{el.textContent=t()[el.dataset.exam];});
  $('exam-ui').value=settings.ui;$('exam-ui').setAttribute('aria-label',t().interface);
  $('exam-translation').value=settings.translation;$('exam-translation').setAttribute('aria-label',t().translation);
  $('exam-active').setAttribute('aria-label',t().examLabel);$('exam-grid').setAttribute('aria-label',t().navigation);
  renderNotice();
}
function saveSettings(){
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}
  catch(error){console.warn('Exam language preference could not be saved.',error.name);}
  renderLanguage();if(store)render();
}
function persist(){
  if(preserveOld){console.warn('Existing invalid exam history preserved; new exam remains in memory.');renderNotice();return;}
  try{const raw=JSON.stringify(store);localStorage.setItem(STORE_KEY,raw);lastSaved=raw;storageIssue='';}
  catch(error){storageIssue='savedError';console.warn('Exam persistence failed; continuing in memory.',error.name);}
  renderNotice();
}
function adopt(raw){
  if(!raw){console.info('External exam history removal ignored; keeping this tab in memory.');return false;}
  try{
    const value=JSON.parse(raw);
    if(!validateExamStore(value,questions,version)){console.warn('External exam update ignored: invalid state.');return false;}
    store=value;lastSaved=raw;preserveOld=false;storageIssue='';synced=true;
    screen=active()?'active':store.current?'results':'setup';reviewedId=store.current?.id??null;
    if($('exam-submit-dialog').open)$('exam-submit-dialog').close();
    render();return true;
  }catch(error){console.warn('External exam update ignored: invalid JSON.',error.name);return false;}
}
function changedElsewhere(){
  if(!preserveOld){
    try{const raw=localStorage.getItem(STORE_KEY);if(raw!==lastSaved && adopt(raw))return true;}
    catch(error){console.warn('Exam cross-tab check unavailable; using this tab.',error.name);}
  }
  return false;
}
function record(exam){store=recordExam(store,exam);synced=false;persist();}
function submit(){
  if(!active()){console.info('Exam submission ignored: no active attempt.');return;}
  if(changedElsewhere()){console.info('Submission deferred after another tab updated the attempt.');return;}
  record(finishExam(store.current));screen='results';reviewedId=store.current.id;
  if($('exam-submit-dialog').open)$('exam-submit-dialog').close();
  render();$('result-heading').focus({preventScroll:false});
}
function tick(){
  if(active()){
    const left=remainingMs(store.current);$('exam-timer').textContent=duration(left);
    document.querySelector('.exam-status').classList.toggle('urgent',left<=300000);
    if(left<=300000 && warnedAttempt!==store.current.id){warnedAttempt=store.current.id;$('time-warning').textContent=t().fiveMinutes;}
    if(left===0)submit();
  }
}
function mutate(action){
  if(!active()){console.info('Exam input ignored: no active attempt.');return;}
  if(changedElsewhere()){console.info('Exam input deferred after another tab updated the attempt.');return;}
  if(remainingMs(store.current)===0){console.info('Exam input ignored: deadline reached; submitting.');submit();return;}
  record(action(store.current));render();
}
function choose(choice){mutate(exam=>selectAnswer(exam,choice));}
function go(index){
  mutate(exam=>navigateExam(exam,index));
  if(active())$('exam-question').focus({preventScroll:false});
}
function showSetup(){
  if(active()){console.info('New attempt unavailable while an exam is running.');return;}
  screen='setup';reviewedId=null;render();$('exam-heading').focus({preventScroll:false});
}
function start(){
  if(!store || active()){console.info('Exam start ignored: catalogue unavailable or an attempt is running.');return;}
  if(changedElsewhere()){console.info('Exam start deferred after another tab updated the history.');return;}
  const translation=document.querySelector('input[name="exam-mode"]:checked').value==='none'?'none':settings.translation;
  record(createExam(questions,version,translation,crypto.randomUUID()));
  screen='active';reviewedId=null;warnedAttempt=null;$('time-warning').textContent='';render();tick();$('exam-question').focus({preventScroll:false});
}
function renderActive(){
  const exam=store.current,q=byId.get(exam.ids[exam.index]);
  $('exam-answered').textContent=`${exam.answers.filter(a=>a!==null).length} / 33`;
  $('exam-timer').textContent=duration(remainingMs(exam));$('active-mode').textContent=t().modeName(exam.translation);
  $('exam-grid').replaceChildren(...exam.ids.map((id,index)=>{
    const answered=exam.answers[index]!==null,button=node('button',String(index+1),answered?'answered':'');
    button.type='button';button.setAttribute('aria-label',`${t().question(index+1)}, ${answered?t().answerStatus:t().emptyStatus}`);
    if(index===exam.index)button.setAttribute('aria-current','true');
    button.addEventListener('click',()=>go(index));return button;
  }));
  $('exam-number').textContent=t().question(exam.index+1);$('exam-region').textContent=q.region.toUpperCase();
  $('exam-region').classList.toggle('bavaria',q.region==='Bayern');
  if(exam.translation==='none')$('exam-question').textContent=plain(q.de);else richText($('exam-question'),q.de);
  $('exam-question-translation').hidden=exam.translation==='none';
  if(exam.translation!=='none'){$('exam-question-translation').lang=exam.translation;richText($('exam-question-translation'),q[exam.translation]);}
  else $('exam-question-translation').replaceChildren();
  $('exam-figure').hidden=!q.image;
  if(q.image){
    $('exam-image').alt=t().image(q.id);$('exam-image-link').href=q.image;
    if($('exam-image').getAttribute('src')!==q.image)$('exam-image').src=q.image;
    $('exam-credit').textContent=q.imageCredit||'Quelle: BAMF';
  }else $('exam-image').removeAttribute('src');
  // Keep the focused answer button alive when only its selection changes.
  if(renderedAttempt!==exam.id || renderedIndex!==exam.index){
    $('exam-answers').replaceChildren(...q.answers.map((answer,index)=>{
      const button=node('button','','answer');button.type='button';button.lang='de';button.dataset.choice=index;
      const badge=node('span',String(index+1),'answer-index');badge.setAttribute('aria-hidden','true');
      button.append(badge,node('span',answer,'answer-text'));button.addEventListener('click',()=>choose(index));return button;
    }));renderedAttempt=exam.id;renderedIndex=exam.index;
  }
  for(const [index,button] of [...$('exam-answers').children].entries()){
    const selected=exam.answers[exam.index]===index;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
  }
  $('exam-clear').disabled=exam.answers[exam.index]===null;$('exam-prev').disabled=exam.index===0;
  $('exam-next').textContent=exam.index===32?t().submit:t().next;
}
function previousAttempt(exam){
  const index=store.history.findIndex(item=>item.id===exam.id);
  return index>=0?store.history[index+1]??null:null;
}
function renderResults(){
  const exam=store.history.find(item=>item.id===reviewedId)||store.current;
  if(!exam || exam.finishedAt===null){console.warn('Results unavailable: no completed attempt selected.');showSetup();return;}
  const result=scoreExam(exam,byId),previous=previousAttempt(exam),old=previous?scoreExam(previous,byId):null;
  $('result-pass').textContent=result.passed?t().passed:t().failed;$('result-pass').classList.toggle('failed',!result.passed);
  $('result-reason').textContent=exam.endReason==='timeout'?`${t().timeout} ${t().submitted}`:t().submitted;
  $('result-score').textContent=`${result.correct} / 33`;$('result-mode').textContent=t().modeName(exam.translation);$('result-date').textContent=date(exam.startedAt);
  $('previous-score').textContent=old?`${old.correct} / 33`:'—';$('previous-mode').textContent=previous?t().modeName(previous.translation):t().noPrevious;$('previous-date').textContent=previous?date(previous.startedAt):'';
  $('result-delta').textContent=old?(result.correct===old.correct?t().same:t().delta(result.correct-old.correct)):t().noComparison;
  if(previous && previous.translation!==exam.translation)$('result-delta').append(' ',t().differentMode);
  $('result-detail').textContent=t().detail(result,duration(result.elapsed));
  $('exam-review').replaceChildren(...exam.ids.map((id,index)=>{
    const q=byId.get(id),choice=exam.answers[index],correct=choice===q.correct;
    const details=node('details','','review-item'+(correct?'':' incorrect')),summary=node('summary','');
    summary.append(node('span',`${index+1}. ${choice===null?t().unanswered:correct?t().correct:t().incorrect}`),node('span',plain(q.de),'review-question'));
    summary.lastChild.lang='de';
    const body=node('div','','review-body'),german=node('p','');german.lang='de';
    if(exam.translation==='none')german.textContent=plain(q.de);else richText(german,q.de);body.append(german);
    if(exam.translation!=='none'){const translation=node('p','','question-translation');translation.lang=exam.translation;richText(translation,q[exam.translation]);body.append(translation);}
    if(q.image){const figure=node('figure',''),link=node('a',''),image=document.createElement('img');image.src=q.image;image.loading='lazy';image.alt=t().image(q.id);link.href=q.image;link.target='_blank';link.rel='noopener';link.append(image);figure.append(link,node('figcaption',q.imageCredit||'Quelle: BAMF'));body.append(figure);}
    for(const [label,value,className] of [[t().yourAnswer,choice===null?t().unanswered:q.answers[choice],'review-answer'],[t().correctAnswer,q.answers[q.correct],'review-answer correct']]){
      const answer=node('div','',className),text=node('div',value);if(value!==t().unanswered)text.lang='de';answer.append(node('span',label),text);body.append(answer);
    }
    details.append(summary,body);return details;
  }));
}
function renderHistory(){
  $('history-empty').hidden=store.history.length>0;
  $('exam-history').replaceChildren(...store.history.map(exam=>{
    const result=scoreExam(exam,byId),row=node('div','','history-row'),description=node('div',''),button=node('button',t().open,'secondary-button');
    description.append(node('p',t().modeName(exam.translation)),node('small',`${date(exam.startedAt)} · ${duration(result.elapsed)} · ${result.passed?t().passed:t().failed}`));
    button.type='button';button.setAttribute('aria-label',`${t().open}: ${date(exam.startedAt)}, ${result.correct} / 33, ${t().modeName(exam.translation)}`);
    button.addEventListener('click',()=>{reviewedId=exam.id;screen='results';render();$('result-heading').focus({preventScroll:false});});
    row.append(node('strong',`${result.correct} / 33`),description,button);return row;
  }));
}
function render(){
  if(!store){console.info('Exam rendering deferred until the catalogue is loaded.');return;}
  if(active())screen='active';
  $('exam-setup').hidden=screen!=='setup';$('exam-active').hidden=screen!=='active';$('exam-results').hidden=screen!=='results';
  $('exam-history-section').hidden=screen==='active';renderNotice();
  if(screen==='active')renderActive();
  else{
    if(screen==='results')renderResults();
    const previous=store.history[0];$('setup-previous').hidden=!previous;
    $('setup-previous').textContent=previous?t().previous(scoreExam(previous,byId).correct,t().modeName(previous.translation)):'';
    renderHistory();
  }
}
async function load(){
  $('exam-error').hidden=true;$('exam-load').hidden=false;
  try{
    const response=await fetch('./questions.json');if(!response.ok)throw new Error(`Catalogue HTTP ${response.status}`);
    const data=await response.json();
    if(typeof data.version!=='string'||!Array.isArray(data.questions)||data.questions.length!==310)throw new Error('Incomplete catalogue');
    questions=data.questions;version=data.version;byId=new Map(questions.map(q=>[q.id,q]));
    if(byId.size!==310 || questions.some((q,i)=>q.id!==i+1||q.region!==(i<300?'Deutschland':'Bayern')||![q.de,q.ru,q.en].every(v=>typeof v==='string'&&v.length)||!Array.isArray(q.answers)||q.answers.length!==4||q.answers.some(a=>typeof a!=='string')||!Number.isInteger(q.correct)||q.correct<0||q.correct>3))throw new Error('Invalid catalogue');
    store=emptyExamStore(version);lastSaved=null;preserveOld=false;storageIssue='';
    try{
      lastSaved=localStorage.getItem(STORE_KEY);
      if(lastSaved){const saved=JSON.parse(lastSaved);if(!validateExamStore(saved,questions,version))throw new Error('Invalid saved exams');store=saved;}
    }catch(error){storageIssue=lastSaved?'restoreError':'savedError';preserveOld=!!lastSaved;console.warn('Exam restore failed; existing data is preserved.',error.name);}
    screen=active()?'active':store.current?'results':'setup';reviewedId=store.current?.id??null;
    $('exam-load').hidden=true;render();tick();
  }catch(error){console.error('Exam catalogue failed to load.',error);$('exam-load').hidden=true;$('exam-error').hidden=false;}
}
function confirmSubmit(){
  if(!active()){console.info('Submit dialog unavailable: no active attempt.');return;}
  if(changedElsewhere()){console.info('Submit dialog deferred after a cross-tab update.');return;}
  if(remainingMs(store.current)===0){submit();return;}
  $('exam-submit-detail').textContent=t().confirm(store.current.answers.filter(a=>a===null).length);
  $('exam-submit-dialog').showModal();$('exam-cancel-submit').focus();
}
$('exam-ui').addEventListener('change',event=>{settings.ui=event.target.value;saveSettings();});
$('exam-translation').addEventListener('change',event=>{settings.translation=event.target.value;saveSettings();});
document.querySelectorAll('input[name="exam-mode"]').forEach(input=>input.addEventListener('change',()=>{$('exam-translation-label').hidden=input.value==='none';}));
$('exam-start').addEventListener('click',start);$('exam-new').addEventListener('click',showSetup);$('exam-retry').addEventListener('click',load);
$('exam-clear').addEventListener('click',()=>choose(null));$('exam-prev').addEventListener('click',()=>go(store.current.index-1));
$('exam-next').addEventListener('click',()=>{if(store.current.index===32)confirmSubmit();else go(store.current.index+1);});
$('exam-submit').addEventListener('click',confirmSubmit);$('exam-cancel-submit').addEventListener('click',()=>$('exam-submit-dialog').close());$('exam-confirm-submit').addEventListener('click',submit);
$('exam-image').addEventListener('error',()=>{
  if(!$('exam-image').hasAttribute('src')){console.info('Exam image error ignored: no image requested.');return;}
  console.warn('Exam illustration failed to load.');$('exam-credit').textContent=t().imageFail;
  const link=node('a',t().imageOpen);link.href=$('exam-image').getAttribute('src');link.target='_blank';link.rel='noopener';$('exam-credit').append(' ',link);
});
document.addEventListener('keydown',event=>{
  if(active()&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.repeat&&!$('exam-submit-dialog').open&&!event.target.closest('select,input,textarea,button,a')&&/^[1-4]$/.test(event.key)){
    event.preventDefault();choose(Number(event.key)-1);
  }
});
window.addEventListener('storage',event=>{if(store&&event.key===STORE_KEY&&event.newValue!==lastSaved){adopt(event.newValue);tick();}});
document.addEventListener('visibilitychange',tick);window.addEventListener('focus',tick);setInterval(tick,1000);
renderLanguage();load();
