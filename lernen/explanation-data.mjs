// Presentation-only data. Never changes the catalogue or persisted learning state.
export function parseExplanations(data, questions, catalogueVersion) {
  if(data?.version!=='bamf-by-explanations-v1'||data.catalogueVersion!==catalogueVersion||!Array.isArray(data.explanations)||data.explanations.length!==questions.length)
    throw new Error('Incomplete or mismatched explanations');
  const byId=new Map(data.explanations.map(entry=>[entry.id,entry]));
  if(byId.size!==questions.length)throw new Error('Duplicate explanation IDs');
  for(const q of questions){
    const entry=byId.get(q.id);
    if(!entry||entry.correctAnswer!==q.answers[q.correct])throw new Error(`Explanation does not match correct answer: ${q.id}`);
    for(const lang of ['ru','en']){
      const value=entry[lang];
      if(typeof value!=='string'||value.trim().length<40||value.length>900||/[<>\uFFFD]/u.test(value)||!/^([^*]|\*\*[^*]+\*\*)+$/u.test(value))
        throw new Error(`Invalid explanation text: ${q.id}/${lang}`);
    }
    if(!Array.isArray(entry.sources)||entry.sources.length===0||entry.sources.some(key=>{
      const source=data.sources?.[key];
      if(!source||typeof source.title!=='string'||!source.title.trim())return true;
      try{const url=new URL(source.url);return url.protocol!=='https:'||!!url.username||!!url.password;}catch{return true;}
    }))throw new Error(`Invalid explanation sources: ${q.id}`);
  }
  return byId;
}

export function explanationFor(pending, language, explanations) {
  // Correct/unanswered questions never reveal a teaching block.
  if(!pending||pending.correct!==false)return null;
  if(!['ru','en'].includes(language))throw new Error('Unsupported explanation language');
  const entry=explanations.get(pending.id);
  if(!entry)throw new Error(`Missing explanation: ${pending.id}`);
  return entry[language];
}
