/** Learning queue. A wrong answer returns after ceil(remaining / 5) other questions. */
export function createSession(ids, version, now = Date.now()) {
  return {version, queue:[...ids], mastered:[], attempts:0, mistakes:0, pending:null, startedAt:now, updatedAt:now};
}

export function answerQuestion(state, question, choice, now = Date.now()) {
  if (state.pending || state.queue[0] !== question.id || !Number.isInteger(choice) || choice < 0 || choice > 3) {
    throw new Error('Answer rejected: question is not active, already answered, or choice is invalid.');
  }
  const queue = state.queue.slice(1);
  const correct = choice === question.correct;
  const delay = correct ? 0 : Math.ceil(queue.length / 5);
  if (!correct) queue.splice(delay, 0, question.id);
  return {...state, queue, mastered:correct ? [...state.mastered, question.id] : [...state.mastered],
    attempts:state.attempts + 1, mistakes:state.mistakes + Number(!correct), updatedAt:now,
    pending:{id:question.id, choice, correct, delay}};
}

export function nextQuestion(state, now = Date.now()) {
  if (!state.pending) throw new Error('Next rejected: no answer has been submitted.');
  return {...state, pending:null, updatedAt:now};
}

export function validateSession(state, questions, version) {
  if (!state || state.version !== version || !Array.isArray(state.queue) || !Array.isArray(state.mastered)) return false;
  const ids = new Set(questions.map(q=>q.id));
  const all = [...state.queue, ...state.mastered];
  if (all.length !== ids.size || new Set(all).size !== ids.size || all.some(id=>!ids.has(id))) return false;
  if (!Number.isSafeInteger(state.attempts) || !Number.isSafeInteger(state.mistakes) || state.mistakes < 0 || state.attempts !== state.mastered.length + state.mistakes) return false;
  if (!Number.isFinite(state.startedAt) || !Number.isFinite(state.updatedAt)) return false;
  if (state.pending !== null) {
    const p=state.pending, q=questions.find(item=>item.id===p?.id);
    if (!q || !Number.isInteger(p.choice) || p.choice<0 || p.choice>3 || p.correct !== (p.choice === q.correct)) return false;
    if (!Number.isInteger(p.delay) || p.delay<0 || state.attempts===0) return false;
    if (p.correct ? (p.delay!==0 || state.mastered.at(-1)!==p.id) : (p.delay!==Math.ceil((state.queue.length-1)/5) || state.queue[p.delay]!==p.id || state.mistakes===0)) return false;
  }
  return true;
}
