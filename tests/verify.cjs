/* Targeted tests of calculations and conflict handling. No Supabase credentials required. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {webcrypto} = require('node:crypto');
const scriptPath=fs.existsSync(path.join(__dirname,'../dist/script.js'))?'../dist/script.js':'../script.js';
let source = fs.readFileSync(path.join(__dirname,scriptPath),'utf8');
const marker = "  if(new URLSearchParams(location.search).get('demo')==='1')startDemo();else renderLogin();";
assert(source.includes(marker));
source = source.replace(marker, `  globalThis.testAPI = {state,id,demoSeed,financials,filterTransactions,progress,update,insert,remove,saveDraft,eventLayout,calendarICS,csvCell,safeURL,esc,merge3,subtodos,todoDone,myTodos,todoParents}; return;`);
const timers=[];
const sandbox={
  window:{addEventListener(){}},document:{addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];}},
  crypto:{getRandomValues:webcrypto.getRandomValues.bind(webcrypto)},
  Date,Intl,URL,URLSearchParams,TextEncoder,console,
  setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout(){},
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../vendor/diff_match_patch.js'),'utf8'),sandbox,{filename:'diff_match_patch.js'});
vm.runInNewContext(source,sandbox,{filename:'script.js'});
const api=sandbox.testAPI;
let checks=0;
const test=async(name,fn)=>{await fn();checks++;console.log('PASS '+name);};
(async()=>{
  await test('UUID fallback works in an HTTP local preview',()=>{
    assert.match(api.id(),/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  api.state.demo=true;api.demoSeed();
  await test('Each project has the requested 11 tasks and three phases',()=>{
    for(const p of api.state.projects){const tasks=api.state.tasks.filter(t=>t.project_id===p.id);assert.equal(tasks.length,11);assert.equal(tasks.filter(t=>t.stage===0).length,7);assert.equal(tasks.filter(t=>t.stage===1).length,2);assert.equal(tasks.filter(t=>t.stage===2).length,2);}
    assert.equal(api.progress(api.state.projects[0]).percent,73);
  });
  await test('Currency sums use cents; margin is undefined with no revenue',()=>{
    const f=api.financials([{type:'revenue',amount:.1},{type:'revenue',amount:.2},{type:'cost',amount:.1}]);
    assert.equal(f.revenue,.3);assert.equal(f.cost,.1);assert.equal(f.net,.2);
    const empty=api.financials([{type:'cost',amount:1.23}]);assert.equal(empty.margin,null);assert.equal(empty.net,-1.23);
  });
  await test('Demo totals and equal cost settlement match the visible dashboard',()=>{
    const f=api.financials(api.state.transactions);assert.equal(f.revenue,485.50);assert.equal(f.cost,159.90);assert.equal(f.net,325.60);
    const [r,s]=api.state.members;
    const costs=id=>api.financials(api.state.transactions.filter(t=>t.member_id===id)).cost;
    assert.equal(Math.round((costs(r.id)-costs(s.id))/2*100)/100,42.05);
  });
  await test('Period filtering excludes records outside the selected month',()=>{
    const now=new Date(),month=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    assert(api.filterTransactions('month').every(t=>t.date.startsWith(month)));
    assert.equal(api.filterTransactions('all').length,6);
  });
  await test('Stale writes cannot overwrite a newer idea',async()=>{
    const n=api.state.ideas[0];const updated=await api.update('ideas',n.id,{content:'First author update'},n.version);
    await assert.rejects(api.update('ideas',n.id,{content:'Stale second update'},n.version),/CONFLICT/);
    assert.equal(api.state.ideas.find(i=>i.id===n.id).content,'First author update');assert.equal(updated.version,2);
  });
  await test('A conflicting autosave retains the full local draft',async()=>{
    const n=api.state.ideas[0];const d={content:'A local draft that must not disappear',baseVersion:n.version-1,dirty:true,saving:false,conflict:false,snapshot:{...n}};
    api.state.drafts.set(n.id,d);await api.saveDraft(n.id);assert.equal(d.conflict,true);assert.equal(d.content,'A local draft that must not disappear');assert.equal(api.state.ideas.find(i=>i.id===n.id).content,'First author update');api.state.drafts.delete(n.id);
  });
  await test('Typing while a save is pending schedules the newest text',async()=>{
    timers.length=0;const n=api.state.ideas[1];const d={content:'First text',baseVersion:n.version,dirty:true,saving:false,conflict:false,snapshot:{...n}};api.state.drafts.set(n.id,d);
    const pending=api.saveDraft(n.id);d.content='Most recent text';await pending;
    assert.equal(d.dirty,true);assert.equal(timers.length,1);await timers.shift()();
    assert.equal(api.state.ideas.find(i=>i.id===n.id).content,'Most recent text');assert.equal(api.state.drafts.has(n.id),false);
  });
  await test('Edits to different parts of an idea merge; edits to the same words do not',()=>{
    const base='Prima riga.\nSeconda riga.\nTerza riga.';
    const m=api.merge3(base,base.replace('Prima','La prima'),base.replace('Terza','Ultima'));
    assert.equal(m.ok,true);assert.equal(m.text,'La prima riga.\nSeconda riga.\nUltima riga.');
    assert.equal(api.merge3(base,base.replace('Seconda riga','Riga due'),base.replace('Seconda riga','Riga numero due')).ok,false);
    assert.equal(api.merge3(base,base,base+' x').text,base+' x');assert.equal(api.merge3(undefined,'a','b').ok,false);
  });
  await test('Two people writing in the same idea: the second save merges instead of blocking',async()=>{
    timers.length=0;const [r,s]=api.state.members;const n=api.state.ideas[2];const base=n.content;
    const d={content:base+'\nUna nuova riga mia.',baseContent:base,baseVersion:n.version,dirty:true,saving:false,conflict:false,snapshot:{...n}};api.state.drafts.set(n.id,d);
    await api.update('ideas',n.id,{content:'Titolo di Stefano.\n'+base,updated_by:s.id},n.version);
    await api.saveDraft(n.id);while(timers.length)await timers.shift()();
    const saved=api.state.ideas.find(i=>i.id===n.id).content;
    assert.equal(saved,'Titolo di Stefano.\n'+base+'\nUna nuova riga mia.');assert.equal(api.state.drafts.has(n.id),false);
  });
  await test('Same words changed by both: nothing is lost and both versions are kept for the choice',async()=>{
    timers.length=0;const [,s]=api.state.members;const n=api.state.ideas[2];const base=n.content;
    const d={content:base.replace('Titolo di Stefano','Titolo mio'),baseContent:base,baseVersion:n.version,dirty:true,saving:false,conflict:false,snapshot:{...n}};api.state.drafts.set(n.id,d);
    await api.update('ideas',n.id,{content:base.replace('Titolo di Stefano','Titolo suo'),updated_by:s.id},n.version);
    await api.saveDraft(n.id);while(timers.length)await timers.shift()();
    assert.equal(d.conflict,true);assert(d.content.includes('Titolo mio'));assert(d.theirs.includes('Titolo suo'));assert(api.state.ideas.find(i=>i.id===n.id).content.includes('Titolo suo'));
    api.state.drafts.delete(n.id);
  });
  await test('Overlapping meetings get separate lanes; touching meetings can reuse a lane',()=>{
    const e=(start,end,id)=>({id,start_at:`2026-10-23T${start}:00Z`,end_at:`2026-10-23T${end}:00Z`});
    const laid=api.eventLayout([e('09:00','10:00','a'),e('09:30','10:30','b'),e('10:30','11:00','c')]);
    assert.equal(laid[0].lanes,2);assert.equal(laid[1].lanes,2);assert.notEqual(laid[0].lane,laid[1].lane);assert.equal(laid[2].lanes,1);
  });
  await test('CSV formula-like descriptions are escaped',()=>{
    assert.equal(api.csvCell('=1+1'),'"\'=1+1"');assert.equal(api.csvCell('   +cmd'),'"\'   +cmd"');assert.equal(api.csvCell(-12.5),'"-12.5"');assert.equal(api.csvCell('a"b'),'"a""b"');
  });
  await test('Calendar export escapes text and folds UTF-8 lines',()=>{
    const text=api.calendarICS([{id:'test',title:'Incontro, insieme; '+ 'È'.repeat(80),agenda:'Prima riga\nBEGIN:VEVENT',start_at:'2026-10-23T10:00:00Z',end_at:'2026-10-23T11:00:00Z',meeting_url:'javascript:alert(1)'}]);
    assert(text.includes('SUMMARY:Incontro\\, insieme\\;'));assert(text.includes('Prima riga\\nBEGIN:VEVENT'));assert(!text.includes('URL:javascript'));
    assert.equal(text.split('\r\n').filter(l=>l==='BEGIN:VEVENT').length,1);
    assert(text.split('\r\n').every(l=>new TextEncoder().encode(l).length<=75));
  });
  await test('Untrusted content and unsafe links cannot become HTML',()=>{
    assert.equal(api.esc('<img src=x onerror=alert(1)>'),'&lt;img src=x onerror=alert(1)&gt;');assert.equal(api.safeURL('javascript:alert(1)'),'');assert.equal(api.safeURL('https://meet.google.com/test'),'https://meet.google.com/test');
  });
  await test('A task with steps is done only when every step is done',async()=>{
    const p=api.todoParents().find(t=>api.subtodos(t.id).length);const subs=api.subtodos(p.id);
    assert.equal(api.todoDone(p),false);
    for(const s of subs)if(!s.done)await api.update('todos',s.id,{done:true},s.version);
    assert.equal(api.todoDone(p),true);
    const s0=api.subtodos(p.id)[0];await api.update('todos',s0.id,{done:false},s0.version);assert.equal(api.todoDone(p),false);
  });
  await test('Personal lists show own and shared steps, never the other founder\'s',()=>{
    const [r,s]=api.state.members;const mine=api.myTodos(s.id).map(x=>x.item);
    assert(mine.length>0);assert(mine.every(t=>!t.owner_id||t.owner_id===s.id));
    assert(mine.some(t=>!t.owner_id));assert(api.myTodos(s.id,'solo').every(x=>x.item.owner_id===s.id));
    assert(api.myTodos(r.id).every(x=>!x.item.owner_id||x.item.owner_id===r.id));
    assert(mine.every(t=>!api.subtodos(t.id).length),'a task with steps is represented by its steps');
  });
  await test('Ticking from the personal list updates the shared record',async()=>{
    const [,s]=api.state.members;const x=api.myTodos(s.id).find(x=>!x.item.done);await api.update('todos',x.item.id,{done:true},x.item.version);
    assert.equal(api.state.todos.find(t=>t.id===x.item.id).done,true);
  });
  await test('Deleting a task removes its steps',async()=>{
    const p=api.todoParents().find(t=>api.subtodos(t.id).length);await api.remove('todos',p.id);
    assert.equal(api.state.todos.filter(t=>t.parent_id===p.id||t.id===p.id).length,0);
  });
  await test('Activity records who completed a step, and steps written with a new task stay quiet',async()=>{
    const [r]=api.state.members;const before=api.state.activity.length;
    const x=api.state.todos.find(t=>!t.done&&!api.state.todos.some(c=>c.parent_id===t.id));await api.update('todos',x.id,{done:true},x.version);
    assert.equal(api.state.activity[0].verb,'ha completato');assert.equal(api.state.activity[0].title,x.title);assert.equal(api.state.activity[0].actor_id,api.state.user.id);
    const y=api.state.todos.find(t=>t.id===x.id);await api.update('todos',y.id,{due_date:'2030-01-01'},y.version);
    assert.equal(api.state.activity.length,before+1,'date changes are not logged');
    const parent=await api.insert('todos',{title:'Nuova',parent_id:null,project_id:null,owner_id:null,done:false,position:0});
    await api.insert('todos',{title:'Passo',parent_id:parent.id,project_id:null,owner_id:null,done:false,position:0});
    assert.equal(api.state.activity[0].verb,'ha creato la task');
  });
  await test('Deleting a project preserves transactions and detaches related records',async()=>{
    const p=api.state.projects[0],before=api.financials(api.state.transactions);await api.remove('projects',p.id);
    assert.equal(api.state.tasks.filter(t=>t.project_id===p.id).length,0);assert(api.state.ideas.every(n=>n.project_id!==p.id));assert(api.state.transactions.every(t=>t.project_id!==p.id));assert(api.state.todos.every(t=>t.project_id!==p.id));assert(api.state.resources.every(x=>x.project_id!==p.id));assert.equal(api.financials(api.state.transactions).net,before.net);
  });
  console.log(`${checks} targeted checks passed. Live Supabase auth/RLS/Realtime requires a configured project.`);
})().catch(err=>{console.error(err);process.exitCode=1;});
