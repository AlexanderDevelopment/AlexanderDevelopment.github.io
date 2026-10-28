export const EXAM_DURATION = 60 * 60 * 1000;
export const PASS_SCORE = 15;

function sample(items, count, random) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count).map(q => q.id);
}

export function createExam(questions, version, translation, id, now = Date.now(), random = Math.random) {
  const general = questions.filter(q => q.region === 'Deutschland');
  const bavaria = questions.filter(q => q.region === 'Bayern');
  if (general.length !== 300 || bavaria.length !== 10 || !['none', 'ru', 'en'].includes(translation) || !id) {
    throw new Error('Exam start rejected: incomplete catalogue, mode or attempt ID.');
  }
  return {id, version, translation, ids:[...sample(general, 30, random), ...sample(bavaria, 3, random)],
    answers:Array(33).fill(null), index:0, startedAt:now, deadline:now + EXAM_DURATION,
    updatedAt:now, finishedAt:null, endReason:null};
}

export function remainingMs(exam, now = Date.now()) {
  return Math.max(0, exam.deadline - Math.max(now, exam.updatedAt));
}

export function selectAnswer(exam, choice, now = Date.now()) {
  if (exam.finishedAt !== null || remainingMs(exam, now) === 0 ||
      (choice !== null && (!Number.isInteger(choice) || choice < 0 || choice > 3))) {
    throw new Error('Exam answer rejected: attempt ended, time expired or choice invalid.');
  }
  const answers = [...exam.answers];
  answers[exam.index] = choice;
  return {...exam, answers, updatedAt:Math.max(now, exam.updatedAt)};
}

export function navigateExam(exam, index, now = Date.now()) {
  if (exam.finishedAt !== null || remainingMs(exam, now) === 0 || !Number.isInteger(index) || index < 0 || index > 32) {
    throw new Error('Exam navigation rejected: attempt ended, time expired or index invalid.');
  }
  return {...exam, index, updatedAt:Math.max(now, exam.updatedAt)};
}

export function finishExam(exam, now = Date.now()) {
  if (exam.finishedAt !== null) {console.info('Exam already submitted; preserving its original result.'); return exam;}
  const timedOut = remainingMs(exam, now) === 0;
  const finishedAt = timedOut ? exam.deadline : Math.max(now, exam.updatedAt);
  return {...exam, finishedAt, updatedAt:finishedAt, endReason:timedOut ? 'timeout' : 'submitted'};
}

export function scoreExam(exam, byId) {
  if (exam.finishedAt === null) throw new Error('Exam score is hidden until submission.');
  const correct = exam.ids.reduce((n, id, i) => n + Number(exam.answers[i] === byId.get(id).correct), 0);
  const unanswered = exam.answers.filter(a => a === null).length;
  return {correct, unanswered, wrong:33 - correct - unanswered, passed:correct >= PASS_SCORE,
    elapsed:exam.finishedAt - exam.startedAt};
}

export function emptyExamStore(version) {
  return {schema:1, version, revision:0, current:null, history:[]};
}

export function recordExam(store, exam) {
  const history = exam.finishedAt !== null && !store.history.some(item => item.id === exam.id)
    ? [exam, ...store.history] : store.history;
  return {...store, revision:store.revision + 1, current:exam, history};
}

function validExam(exam, byId, version) {
  if (!exam || typeof exam.id !== 'string' || !exam.id || exam.version !== version ||
      !['none', 'ru', 'en'].includes(exam.translation) || !Array.isArray(exam.ids) || exam.ids.length !== 33 ||
      new Set(exam.ids).size !== 33 || exam.ids.some((id, i) => byId.get(id)?.region !== (i < 30 ? 'Deutschland' : 'Bayern')) ||
      !Array.isArray(exam.answers) || exam.answers.length !== 33 ||
      exam.answers.some(a => a !== null && (!Number.isInteger(a) || a < 0 || a > 3)) ||
      !Number.isInteger(exam.index) || exam.index < 0 || exam.index > 32 ||
      ![exam.startedAt, exam.deadline, exam.updatedAt].every(Number.isSafeInteger) || exam.startedAt < 0 ||
      exam.deadline !== exam.startedAt + EXAM_DURATION || exam.updatedAt < exam.startedAt || exam.updatedAt > exam.deadline) {
    console.warn('Saved exam rejected: catalogue, choices, mode or timing failed validation.'); return false;
  }
  if (exam.finishedAt === null) return exam.endReason === null;
  return Number.isSafeInteger(exam.finishedAt) && exam.finishedAt === exam.updatedAt &&
    (exam.endReason === 'submitted' && exam.finishedAt < exam.deadline || exam.endReason === 'timeout' && exam.finishedAt === exam.deadline);
}

export function validateExamStore(store, questions, version) {
  const byId = new Map(questions.map(q => [q.id, q]));
  if (!store || store.schema !== 1 || store.version !== version || !Number.isSafeInteger(store.revision) || store.revision < 0 ||
      !Array.isArray(store.history) || new Set(store.history.map(e => e?.id)).size !== store.history.length ||
      store.history.some(e => !validExam(e, byId, version) || e.finishedAt === null) ||
      store.current !== null && !validExam(store.current, byId, version)) {
    console.warn('Exam storage rejected: invalid envelope, catalogue version or attempt history.'); return false;
  }
  if (store.current !== null) {
    const recorded = store.history.find(e => e.id === store.current.id);
    if (store.current.finishedAt === null ? !!recorded : JSON.stringify(recorded) !== JSON.stringify(store.current)) {
      console.warn('Exam storage rejected: current attempt conflicts with completed history.'); return false;
    }
  }
  return true;
}
