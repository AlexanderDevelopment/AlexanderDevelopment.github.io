import {createSession, answerQuestion, nextQuestion, validateSession} from './engine.mjs';

const SESSION_KEY='zb-lernen-bayern-session-v1';
const SETTINGS_KEY='zb-lernen-bayern-settings-v1';
const $=id=>document.getElementById(id);
const copy={
  ru:{skip:'Перейти к вопросу',interface:'Язык интерфейса',eyebrow:'ТВОЙ ШАГ К ГЕРМАНИИ',title:'Учимся. Ошибаемся.<br><span>Запоминаем.</span>',intro:'Один вопрос за другим — пока каждый ответ не станет правильным.',courseSize:'300 общих + 10 региональных',yourProgress:'Твой прогресс',masteredLabel:'освоено',outOf:'из 310 вопросов',remaining:'В очереди',attempts:'Всего ответов',mistakes:'Ошибок',saved:'Прогресс сохраняется в браузере',methodTitle:'Ошибка — часть обучения',methodText:'Не угадал? Вопрос вернётся через 20% оставшейся очереди. Ответил правильно — идём дальше.',restart:'Начать заново',loading:'Загружаем вопросы…',translation:'Язык перевода',chooseAnswer:'Выбери один правильный ответ',keyboard:' для ответа',next:'Следующий вопрос',completeTitle:'Все 310. Ты справился!',completeText:'На каждый вопрос дан правильный ответ. Отличная работа!',again:'Пройти ещё раз',loadError:'Не удалось загрузить вопросы',loadErrorText:'Проверь подключение к интернету и попробуй ещё раз. Сохранённый прогресс останется на месте.',retry:'Повторить',learningNote:'Жирным — слова, на которые стоит обратить внимание. Перевод помогает понять вопрос.',source:'Вопросы BAMF ↗',sourceDate:'Сверено 28.10.2026',disclaimer:'Независимый тренажёр. Переводы — учебная помощь, не официальный перевод BAMF. Прогресс хранится только в этом браузере.',resetTitle:'Начать с чистого листа?',resetText:'Текущая очередь и результаты будут сброшены. Все 310 вопросов начнутся заново.',cancel:'Отмена',resetConfirm:'Начать заново',question:n=>`Вопрос ${String(n).padStart(3,'0')} / 310`,good:'Richtig! Правильный ответ.',wrong:'Пока не получилось. Попробуем ещё.',correctAnswer:'Правильный ответ:',removed:'Вопрос освоен и убран из очереди.',repeat:n=>n===0?'Это последний вопрос. Он появится следующим.':`Вопрос поставлен после ${n} других вопросов в оставшейся очереди (20%, округление вверх).`,results:(a,m)=>`Всего ответов: ${a}. Ошибок: ${m}.`,finish:'Посмотреть результат',storageError:'Браузер не позволяет сохранить прогресс. Сейчас он хранится только до закрытия или обновления страницы.',restoreError:'Сохранённый прогресс повреждён или относится к другому каталогу. Старая запись сохранена без изменений. Можно заниматься в этой вкладке или нажать «Начать заново», чтобы заменить её.',notSaved:'Прогресс пока не сохраняется',synced:'Очередь обновилась в другой вкладке. Продолжай с текущего вопроса.',image:n=>`Оригинальная иллюстрация BAMF к вопросу ${n}. Нажми, чтобы открыть в полном размере.`,imageFail:'Иллюстрация не загрузилась. Открой оригинал по ссылке ниже перед ответом.',imageOpen:'Открыть иллюстрацию ↗',progressLabel:'Освоено вопросов',studyLabel:'Тренажёр',answerGood:'Правильный ответ',answerBad:'Неправильный ответ'},
  en:{skip:'Skip to question',interface:'Interface language',eyebrow:'ONE STEP CLOSER TO GERMANY',title:'Learn. Make mistakes.<br><span>Remember.</span>',intro:'One question at a time — until you have answered every one correctly.',courseSize:'300 general + 10 regional',yourProgress:'Your progress',masteredLabel:'completed',outOf:'of 310 questions',remaining:'In the queue',attempts:'Answers given',mistakes:'Mistakes',saved:'Progress saved in this browser',methodTitle:'Mistakes are part of learning',methodText:'Got it wrong? The question returns after 20% of the remaining queue. Got it right? Keep moving forward.',restart:'Start over',loading:'Loading questions…',translation:'Translation language',chooseAnswer:'Choose the one correct answer',keyboard:' to answer',next:'Next question',completeTitle:'All 310. You did it!',completeText:'You have answered every question correctly. Great work!',again:'Practise again',loadError:'Could not load the questions',loadErrorText:'Check your internet connection and try again. Your saved progress will remain in place.',retry:'Try again',learningNote:'Words in bold deserve a closer look. The translation helps you understand the question.',source:'BAMF questions ↗',sourceDate:'Verified 28 Oct 2026',disclaimer:'Independent study tool. Translations are learning aids, not official BAMF translations. Progress is stored only in this browser.',resetTitle:'Ready for a fresh start?',resetText:'Your current queue and results will be reset. All 310 questions will start again.',cancel:'Cancel',resetConfirm:'Start over',question:n=>`Question ${String(n).padStart(3,'0')} / 310`,good:'Richtig! Correct answer.',wrong:'Not quite. You’ll get another try.',correctAnswer:'Correct answer:',removed:'Question completed and removed from the queue.',repeat:n=>n===0?'This is the last question. It will appear next.':`Placed after ${n} other questions in the remaining queue (20%, rounded up).`,results:(a,m)=>`Answers given: ${a}. Mistakes: ${m}.`,finish:'See results',storageError:'This browser cannot save your progress. It will only last until you close or refresh this page.',restoreError:'The saved progress is damaged or belongs to a different catalogue. The old record has been kept unchanged. You can study in this tab or choose “Start over” to replace it.',notSaved:'Progress is not being saved',synced:'The queue was updated in another tab. Continue with the current question.',image:n=>`Original BAMF illustration for question ${n}. Click to open at full size.`,imageFail:'The illustration did not load. Open the original using the link below before answering.',imageOpen:'Open illustration ↗',progressLabel:'Questions completed',studyLabel:'Practice',answerGood:'Correct answer',answerBad:'Incorrect answer'}
};

let settings={ui:'ru',translation:'ru'}, questions=[], byId=new Map(), version='', state=null;
let lastSaved=null, preserveOld=false, storageIssue='', syncMessage=false;
try {
  const stored=JSON.parse(localStorage.getItem(SETTINGS_KEY));
  if(stored && ['ru','en'].includes(stored.ui) && ['ru','en'].includes(stored.translation)) settings=stored;
} catch(error){console.warn('Language settings could not be restored; using Russian.',error.name);}
const t=()=>copy[settings.ui];

function richText(element,text){
  element.replaceChildren(...text.split('**').map((part,index)=>{
    if(index%2===0) return document.createTextNode(part);
    const strong=document.createElement('strong');strong.textContent=part;return strong;
  }));
}

function renderLanguage(){
  document.documentElement.lang=settings.ui;
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.innerHTML=t()[el.dataset.i18n];});
  $('ui-language').value=settings.ui;
  $('ui-language').setAttribute('aria-label',t().interface);
  $('translation-language').value=settings.translation;
  $('translation-language').setAttribute('aria-label',t().translation);
  $('progress-bar').setAttribute('aria-label',t().progressLabel);
  document.querySelector('.sidebar').setAttribute('aria-label',t().yourProgress);
  document.querySelector('.study-column').setAttribute('aria-label',t().studyLabel);
  renderNotices();
}

function renderNotices(){
  $('storage-notice').hidden=!storageIssue;
  $('storage-notice').textContent=storageIssue?t()[storageIssue]:'';
  $('save-status').textContent=storageIssue?t().notSaved:t().saved;
  $('sync-notice').hidden=!syncMessage;
  $('sync-notice').textContent=t().synced;
}

function save(){
  if(preserveOld){console.warn('Progress not overwritten: invalid existing session is preserved until an explicit reset.');renderNotices();return;}
  try{const raw=JSON.stringify(state);localStorage.setItem(SESSION_KEY,raw);lastSaved=raw;storageIssue='';}
  catch(error){storageIssue='storageError';console.warn('Progress could not be saved; session continues in memory.',error.name);}
  renderNotices();
}

function useExternal(raw){
  if(!raw){console.info('External session removal ignored; current in-memory session is kept.');return false;}
  try{
    const updated=JSON.parse(raw);
    if(!validateSession(updated,questions,version)){console.warn('External session ignored: validation failed.');return false;}
    state=updated;lastSaved=raw;preserveOld=false;storageIssue='';syncMessage=true;render();return true;
  }catch(error){console.warn('External session ignored: invalid JSON.',error.name);return false;}
}

function commit(action){
  if(!state){console.warn('Action ignored: question catalogue is not ready.');return;}
  if(!preserveOld){
    try{
      const raw=localStorage.getItem(SESSION_KEY);
      if(raw!==lastSaved && useExternal(raw)){console.info('Action deferred: another tab changed the active question.');return;}
    }catch(error){console.warn('Could not check for another tab; continuing in memory.',error.name);}
  }
  state=action(state);syncMessage=false;save();render();
}

function choose(choice){
  if(!state || state.pending || state.queue.length===0){console.info('Answer ignored: no unanswered active question.');return;}
  commit(s=>answerQuestion(s,byId.get(s.queue[0]),choice));
  if(state.pending)$('feedback').focus({preventScroll:true});
}

function advance(){
  if(!state?.pending){console.info('Next ignored: answer a question first.');return;}
  commit(nextQuestion);
  if(!state.pending && state.queue.length)$('question-title').focus({preventScroll:false});
}

function render(){
  renderNotices();
  if(!state){console.info('Question rendering deferred until the catalogue is ready.');return;}
  const mastered=state.mastered.length, percent=Math.floor(mastered/questions.length*100);
  $('mastered-count').textContent=mastered;
  $('remaining-count').textContent=state.queue.length;
  $('attempt-count').textContent=state.attempts;
  $('mistake-count').textContent=state.mistakes;
  $('progress-percent').replaceChildren(document.createTextNode(String(percent)),Object.assign(document.createElement('span'),{textContent:'%'}));
  $('ring-fill').style.strokeDasharray=`${mastered/questions.length*100} 100`;
  $('progress-bar').setAttribute('aria-valuenow',mastered);
  $('progress-bar').firstElementChild.style.width=`${mastered/questions.length*100}%`;
  const complete=!state.pending && state.queue.length===0;
  $('question-card').hidden=complete;$('completion').hidden=!complete;
  $('completion-stats').textContent=t().results(state.attempts,state.mistakes);
  if(complete){console.info('Course completed: all questions answered correctly.');return;}
  const q=byId.get(state.pending?.id??state.queue[0]);
  $('question-number').textContent=t().question(q.id);
  $('question-region').textContent=q.region.toUpperCase();
  $('question-region').classList.toggle('bavaria',q.id>300);
  $('question-title').lang='de';richText($('question-title'),q.de);
  $('question-translation').lang=settings.translation;richText($('question-translation'),q[settings.translation]);
  $('question-figure').hidden=!q.image;
  if(q.image){
    $('question-image').alt=t().image(q.id);
    if($('question-image').getAttribute('src')!==q.image)$('question-image').src=q.image;
    $('image-link').href=q.image;$('image-link').setAttribute('aria-label',t().image(q.id));
    $('image-credit').textContent=q.imageCredit||'Quelle: BAMF';
  }else{$('question-image').removeAttribute('src');}
  $('answers').replaceChildren(...q.answers.map((answer,index)=>{
    const button=document.createElement('button');button.type='button';button.className='answer';button.lang='de';button.dataset.choice=index;
    const badge=document.createElement('span');badge.className='answer-index';badge.textContent=index+1;badge.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.className='answer-text';label.textContent=answer;
    button.append(badge,label);button.addEventListener('click',()=>choose(index));
    if(state.pending){
      button.disabled=true;
      if(index===q.correct || index===state.pending.choice){
        const good=index===q.correct;button.classList.add(good?'correct':'wrong');
        const result=document.createElement('span');result.className='answer-result';result.textContent=good?'✓':'×';result.setAttribute('aria-hidden','true');
        button.append(result);button.setAttribute('aria-label',`${answer} — ${good?t().answerGood:t().answerBad}`);
      }
    }
    return button;
  }));
  $('feedback').hidden=!state.pending;$('next').hidden=!state.pending;
  $('feedback').replaceChildren();
  if(state.pending){
    const p=state.pending, title=document.createElement('h3'),detail=document.createElement('p');
    $('feedback').className=`feedback ${p.correct?'good':'retry'}`;
    title.textContent=p.correct?t().good:t().wrong;
    detail.textContent=p.correct?t().removed:t().repeat(p.delay);
    $('feedback').append(title);
    if(!p.correct){const correct=document.createElement('p');correct.append(document.createTextNode(t().correctAnswer+' '));const answer=document.createElement('strong');answer.lang='de';answer.textContent=q.answers[q.correct];correct.append(answer);$('feedback').append(correct);}
    $('feedback').append(detail);
    $('next').firstElementChild.textContent=state.queue.length===0?t().finish:t().next;
  }
  $('question-card').setAttribute('aria-busy','false');
}

async function load(){
  $('load-error').hidden=true;$('question-card').hidden=false;$('question-card').setAttribute('aria-busy','true');$('restart').disabled=true;
  try{
    const response=await fetch('./questions.json');
    if(!response.ok)throw new Error(`Catalogue HTTP ${response.status}`);
    const data=await response.json();
    if(typeof data.version!=='string' || !Array.isArray(data.questions) || data.questions.length!==310)throw new Error('Incomplete catalogue');
    questions=data.questions;version=data.version;byId=new Map(questions.map(q=>[q.id,q]));
    if(byId.size!==310 || questions.some((q,i)=>q.id!==i+1 || ![q.de,q.ru,q.en].every(x=>typeof x==='string' && x.length>0) || q.answers.length!==4 || !Number.isInteger(q.correct) || q.correct<0 || q.correct>3))throw new Error('Invalid catalogue data');
    state=createSession(questions.map(q=>q.id),version);
    try{
      lastSaved=localStorage.getItem(SESSION_KEY);
      if(lastSaved){const parsed=JSON.parse(lastSaved);if(!validateSession(parsed,questions,version))throw new Error('Invalid saved session');state=parsed;}
    }catch(error){storageIssue=lastSaved?'restoreError':'storageError';preserveOld=!!lastSaved;console.warn('Could not restore progress; existing data is preserved.',error.name);}
    if(!lastSaved)save();
    render();$('restart').disabled=false;
  }catch(error){console.error('Catalogue failed to load.',error);$('question-card').hidden=true;$('load-error').hidden=false;}
}

function saveSettings(){
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}
  catch(error){console.warn('Language preference could not be saved.',error.name);}
  renderLanguage();if(state)render();
}
$('ui-language').addEventListener('change',event=>{settings.ui=event.target.value;saveSettings();});
$('translation-language').addEventListener('change',event=>{settings.translation=event.target.value;saveSettings();});
$('next').addEventListener('click',advance);
for(const id of ['restart','restart-complete'])$(id).addEventListener('click',()=>{$('reset-dialog').showModal();$('cancel-reset').focus();});
$('cancel-reset').addEventListener('click',()=>$('reset-dialog').close());
$('confirm-reset').addEventListener('click',()=>{
  state=createSession(questions.map(q=>q.id),version);preserveOld=false;storageIssue='';syncMessage=false;save();render();$('reset-dialog').close();$('question-title').focus();
});
$('retry').addEventListener('click',load);
$('question-image').addEventListener('error',()=>{
  if(!$('question-image').hasAttribute('src')){console.info('No illustration requested for this question.');return;}
  console.warn('Question image failed to load.');$('image-credit').textContent=t().imageFail;
  const link=document.createElement('a');link.href=$('question-image').getAttribute('src');link.target='_blank';link.rel='noopener';link.textContent=t().imageOpen;$('image-credit').append(' ',link);
});
document.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey||event.repeat||$('reset-dialog').open||event.target.closest('select,input,textarea,button,a'))return;
  if(/^[1-4]$/.test(event.key)){event.preventDefault();choose(Number(event.key)-1);}
  if(event.key==='Enter' && state?.pending){event.preventDefault();advance();}
});
window.addEventListener('storage',event=>{if(event.key===SESSION_KEY && state && event.newValue!==lastSaved)useExternal(event.newValue);});
renderLanguage();load();
