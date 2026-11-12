/* ShiningBulbs Studio — buildless, GitHub Pages compatible.
   Application records live in Supabase; preview data and auth sessions only in memory. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const id = () => {if(crypto.randomUUID)return crypto.randomUUID();const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;return [...b].map((v,i)=>([4,6,8,10].includes(i)?'-':'')+v.toString(16).padStart(2,'0')).join('');};
  const today = () => new Date();
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const dayDate = s => new Date(`${s}T12:00:00`);
  const shiftDay = (d,n) => { const r = new Date(d); r.setDate(r.getDate()+n); return r; };
  const money = n => new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0);
  const shortMoney = n => new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(n)||0);
  const fmtDate = (s, opts = {day:'numeric',month:'short'}) => s ? dayDate(s).toLocaleDateString('it-IT',opts) : 'Da definire';
  const fmtTime = s => new Date(s).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  const relativeDay = n => dateKey(shiftDay(today(),n));
  const safeURL = value => {try {const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}};
  const icons = {
    bulb:'<path d="M9 18h6m-5 3h4M8.5 14.5a6 6 0 1 1 7 0C14.7 15.1 15 16 15 17H9c0-1 .3-1.9-.5-2.5Z"/><path d="M12 1v1M3 4l1 1M21 4l-1 1M1 11h1m20 0h1"/>',
    projects:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h.01M12 15h.01M16 15h.01"/>',
    ideas:'<path d="M9 18h6m-5 3h4m-5-5c0-3-3-3.5-3-7a6 6 0 0 1 12 0c0 3.5-3 4-3 7Z"/>',
    revenues:'<path d="M3 3v18h18M7 14l4-4 4 2 6-7m-5 0h5v5"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',
    left:'<path d="m15 5-7 7 7 7"/>',
    down:'<path d="m6 9 6 6 6-6"/>',
    settings:'<path d="m10 2-.5 3-2 .9L5 4.5 2.5 9l2.5 1.6v2.8L2.5 15 5 19.5l2.5-1.4 2 .9.5 3h4l.5-3 2-.9 2.5 1.4 2.5-4.5-2.5-1.6v-2.8L21.5 9 19 4.5l-2.5 1.4-2-.9L14 2Z"/><circle cx="12" cy="12" r="3"/>',
    logout:'<path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4m6-12 4 4-4 4m-7-4h11"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users:'<path d="M3 21v-2a5 5 0 0 1 10 0v2m4 0v-2a5 5 0 0 0-3-4.6m2-11.2a4 4 0 0 1 0 7.6"/><circle cx="8" cy="7" r="4"/>',
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    edit:'<path d="m16 3 5 5-12 12-6 1 1-6Z"/><path d="m13 6 5 5"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    link:'<path d="m10 13 4-4m-6 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4-1 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
    upRight:'<path d="M7 17 17 7M7 7h10v10"/>',
    downLeft:'<path d="M17 7 7 17m0-10v10h10"/>',
    wallet:'<path d="M3 7V5a2 2 0 0 1 2-2h13v4M3 7h17v14H5a2 2 0 0 1-2-2Zm17 4h-5v6h5"/>',
    globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    code:'<path d="m8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18"/>',
    heart:'<path d="M20 5c-2-2-5-2-8 1-3-3-6-3-8-1-3 3-1 7 8 14 9-7 11-11 8-14Z"/>',
    book:'<path d="M12 5v16m0-16C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z"/>',
    sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
    cloud:'<path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13 0 5 5 0 0 1 0 10m-6 3V11m-3 3 3-3 3 3"/>',
    expand:'<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
    todos:'<path d="M11 6h9M11 12h9M11 18h9"/><path d="m3 6 1.5 1.5L7 5m-4 7 1.5 1.5L7 11"/><circle cx="5" cy="18" r="1.3"/>',
    mytodos:'<circle cx="9" cy="7" r="4"/><path d="M2 21v-1a6 6 0 0 1 10-4.5m3 2.5 2.5 2.5L22 16"/>',
  };
  const icon = (name,size=18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.projects}</svg>`;
  const STAGES = [
    {title:'Dall’idea all’applicazione beta',subtitle:'Dare forma, provare, migliorare.',tasks:['Ideas sharing','Prima realizzazione','Prima fase di test','Risoluzione errori e miglioramenti','Seconda fase di test','Consolidamento','Capire come monetizzare l’app']},
    {title:'Porting su iOS / Android',subtitle:'La vostra app, nelle mani di tutti.',tasks:['Porting su iOS / Android','Terza e ultima fase di test']},
    {title:'Pubblicazione e vendita',subtitle:'È il momento di andare live.',tasks:['Pubblicazione','Gestione vendita']}
  ];
  const TABLES=['projects','tasks','todos','ideas','events','transactions','resources'];
  const COLORS={blue:'#89a5e6',purple:'#b09ad6',green:'#8ab9a2',amber:'#d8b67f'};
  const CATEGORIES={revenue:'Ricavi app',ai:'Software e AI',developer:'Account sviluppatori',hosting:'Hosting e servizi',marketing:'Marketing',other:'Altro'};
  const state={user:null,demo:false,view:'projects',projectId:null,filter:'all',ideaFilter:'all',period:'all',calView:'week',calDate:today(),members:[],projects:[],tasks:[],ideas:[],events:[],transactions:[],todos:[],resources:[],activity:[],typing:new Map(),missing:{},remember:false,todoProject:'all',todoStatus:'open',myStatus:'open',myScope:'all',todosMissing:false,connected:false,loading:false,client:null,channel:null,drafts:new Map(),noteTimers:new Map(),loadSeq:0};
  const isPhone=()=>!!window.matchMedia?.('(max-width:720px)').matches;
  if(isPhone())state.calView='list';
  const member = uid => state.members.find(m=>m.id===uid);
  const memberName = uid => member(uid)?.display_name || 'Entrambi';
  const isStefano = m => m?.display_name?.toLowerCase().startsWith('stefano');
  const avatar = (uid,title=true) => {const m=member(uid);return m?`<span class="avatar ${isStefano(m)?'stefano':''}" ${title?`title="${esc(m.display_name)}"`:''}>${esc(m.display_name.slice(0,1).toUpperCase())}</span>`:'';};
  const avatars = owner => `<span class="avatars">${owner?avatar(owner):state.members.map(m=>avatar(m.id)).join('')}</span>`;
  const project = pid => state.projects.find(p=>p.id===pid);
  const tasksOf = pid => state.tasks.filter(t=>t.project_id===pid).sort((a,b)=>a.position-b.position);
  const progress = p => {const t=tasksOf(p.id),done=t.filter(x=>x.done).length;return {total:t.length,done,percent:t.length?Math.round(done/t.length*100):0};};
  const phaseName = p => {const ts=tasksOf(p.id);const t=ts.find(x=>!x.done);return t?['Idea e beta','Porting','Pubblicazione'][t.stage]:'Completato';};
  const projectIcon = p => icon(p?.icon||'code',22);
  const ownerOptions = (value=null,includeBoth=true) => `${includeBoth?`<option value="" ${!value?'selected':''}>Entrambi</option>`:''}${state.members.map(m=>`<option value="${m.id}" ${m.id===value?'selected':''}>${esc(m.display_name)}</option>`).join('')}`;
  const projectOptions = (value=null) => `<option value="">ShiningBulbs · generale</option>${state.projects.map(p=>`<option value="${p.id}" ${p.id===value?'selected':''}>${esc(p.name)}</option>`).join('')}`;
  const todoParents = () => state.todos.filter(t=>!t.parent_id);
  const subtodos = pid => state.todos.filter(t=>t.parent_id===pid).sort((a,b)=>((a.position||0)-(b.position||0))||(a.created_at||'').localeCompare(b.created_at||''));
  const todoDone = t => {const s=subtodos(t.id);return s.length?s.every(x=>x.done):!!t.done;};
  const todoProgress = t => {const s=subtodos(t.id);return s.length?{done:s.filter(x=>x.done).length,total:s.length}:{done:t.done?1:0,total:1};};
  const assignedTo = (t,uid) => !t.owner_id||t.owner_id===uid;
  const myTodos = (uid,scope='all') => todoParents().flatMap(p=>{const s=subtodos(p.id);return (s.length?s:[p]).filter(t=>scope==='solo'?t.owner_id===uid:assignedTo(t,uid)).map(t=>({item:t,parent:p}));});
  const openMine = () => state.user?myTodos(state.user.id).filter(x=>!x.item.done).length:0;
  const byDue = (a,b) => (a.due_date||'9999').localeCompare(b.due_date||'9999');
  function notify(message,error=false){if(!$('#toasts'))return;const d=document.createElement('div');d.className=`toast${error?' error':''}`;d.innerHTML=icon(error?'info':'checkCircle',16)+`<span>${esc(message)}</span>`;const box=$('#toasts');if(!box)return;box.append(d);setTimeout(()=>d.remove(),5200);}
  function demoSeed(){
    const r=id(),s=id(),p1=id(),p2=id(),p3=id();
    state.members=[{id:r,display_name:'Riccardo'},{id:s,display_name:'Stefano'}];
    state.user={id:r};
    state.projects=[
      {id:p1,name:'Vocabulary',description:'Un nuovo modo di imparare, una parola alla volta.',color:'blue',icon:'book',owner_id:r,due_date:relativeDay(18),platform:'iOS',created_at:new Date().toISOString()},
      {id:p2,name:'Together',description:'I ricordi più belli, tutti nello stesso posto.',color:'purple',icon:'heart',owner_id:null,due_date:relativeDay(32),platform:'iOS e Android',created_at:new Date().toISOString()},
      {id:p3,name:'Pocket Finance',description:'Più chiarezza sulle spese. Più spazio alle idee.',color:'green',icon:'wallet',owner_id:s,due_date:relativeDay(45),platform:'iOS',created_at:new Date().toISOString()}
    ];
    state.tasks=[];
    state.projects.forEach((p,pi)=>{let n=0;STAGES.forEach((st,stage)=>st.tasks.forEach(title=>{state.tasks.push({id:id(),project_id:p.id,title,stage,position:n,done:n<[8,5,2][pi],owner_id:n%2?r:s,due_date:relativeDay((n-[8,5,2][pi])*2+3+pi),version:1});n++;}));});
    const eventAt=(offset,hour)=>{const d=shiftDay(today(),offset);d.setHours(hour,0,0,0);return d.toISOString();};
    state.events=[
      {id:id(),title:'Weekly founders',start_at:eventAt(1,10),end_at:eventAt(1,11),agenda:'A che punto siamo?\nPriorità della settimana\nCosa serve per il prossimo rilascio',project_id:null,meeting_url:'',created_by:r},
      {id:id(),title:'Vocabulary · ultimo test',start_at:eventAt(3,15),end_at:eventAt(3,16),agenda:'Test su dispositivi reali\nControllare onboarding e notifiche\nRaccogliere gli ultimi feedback',project_id:p1,meeting_url:'',created_by:s},
      {id:id(),title:'Together · ideas sharing',start_at:eventAt(5,11),end_at:eventAt(5,12),agenda:'Confronto sulle nuove funzioni\nPrimi passi del prototipo',project_id:p2,meeting_url:'',created_by:r}
    ];
    state.ideas=[
      {id:id(),title:'Una piccola idea, ogni giorno.',content:'E se Vocabulary ci suggerisse una parola ispirata a quello che leggiamo?\n\nUn modo per imparare senza sentirlo come un compito. Da esplorare nel prossimo confronto.',created_by:r,updated_by:r,project_id:p1,color:'blue',version:1,created_at:new Date().toISOString()},
      {id:id(),title:'La prima impressione conta.',content:'Onboarding breve: meno schermate, più app.\n\nVorrei far provare subito la funzione principale, prima di chiedere di creare un account. Che ne pensi?',created_by:s,updated_by:s,project_id:null,color:'green',version:1,created_at:new Date().toISOString()},
      {id:id(),title:'Il nostro prossimo passo',content:'Tre cose da portare al prossimo weekly:\n\n→ Un nome che ci rappresenti\n→ Una funzione che useremmo ogni giorno\n→ Una prima versione semplice, ma fatta bene',created_by:r,updated_by:r,project_id:null,color:'purple',version:1,created_at:new Date().toISOString()}
    ];
    state.transactions=[
      {id:id(),type:'revenue',description:'Primi acquisti in-app',amount:186.50,date:relativeDay(-3),project_id:p1,member_id:r,category:'revenue'},
      {id:id(),type:'revenue',description:'Vendite App Store',amount:299,date:relativeDay(-19),project_id:p1,member_id:s,category:'revenue'},
      {id:id(),type:'cost',description:'Apple Developer Program',amount:99,date:relativeDay(-24),project_id:null,member_id:r,category:'developer'},
      {id:id(),type:'cost',description:'ChatGPT · abbonamento',amount:23,date:relativeDay(-10),project_id:null,member_id:r,category:'ai'},
      {id:id(),type:'cost',description:'Claude Code · abbonamento',amount:23,date:relativeDay(-6),project_id:null,member_id:s,category:'ai'},
      {id:id(),type:'cost',description:'Dominio ShiningBulbs',amount:14.90,date:relativeDay(-15),project_id:null,member_id:s,category:'hosting'}
    ];
    const mk=o=>({id:id(),project_id:null,parent_id:null,notes:'',done:false,owner_id:null,due_date:null,position:0,version:1,created_by:r,created_at:new Date().toISOString(),...o});
    const t1=id(),t2=id();
    state.todos=[
      mk({id:t1,project_id:p1,title:'Nuova schermata di onboarding',notes:'Tre schermate al massimo, poi subito la prima parola.',due_date:relativeDay(6)}),
      mk({parent_id:t1,title:'Wireframe delle tre schermate',done:true,owner_id:s,due_date:relativeDay(1),position:0}),
      mk({parent_id:t1,title:'Scrivere i testi',owner_id:r,due_date:relativeDay(3),position:1}),
      mk({parent_id:t1,title:'Animazione di benvenuto',owner_id:null,due_date:relativeDay(5),position:2}),
      mk({id:t2,project_id:p2,title:'Preparare la beta per gli amici',owner_id:s,due_date:relativeDay(10),created_by:s}),
      mk({project_id:null,title:'Aprire l’account Google Play',owner_id:r,due_date:relativeDay(-1)})
    ];
    state.resources=[{id:id(),project_id:p1,title:'Repository GitHub',url:'https://github.com/',kind:'repo',version:1,created_at:new Date().toISOString()},{id:id(),project_id:p1,title:'Schermate in Figma',url:'https://www.figma.com/',kind:'design',version:1,created_at:new Date().toISOString()}];
    const minsAgo=n=>new Date(Date.now()-n*60000).toISOString();
    state.activity=[{id:id(),actor_id:s,verb:'ha completato',title:'Wireframe delle tre schermate',context:'Nuova schermata di onboarding',created_at:minsAgo(35)},{id:id(),actor_id:r,verb:'ha pianificato',title:'Vocabulary · ultimo test',context:'Vocabulary',created_at:minsAgo(190)},{id:id(),actor_id:s,verb:'ha registrato il costo',title:'Claude Code · abbonamento',context:'',created_at:minsAgo(60*26)},{id:id(),actor_id:r,verb:'ha creato la task',title:'Nuova schermata di onboarding',context:'Vocabulary',created_at:minsAgo(60*30)}];
  }
  // Sessione: in memoria, oppure anche sul dispositivo se si sceglie "Resta collegato".
  const AUTH_KEY='shiningbulbs-auth',memStore=new Map();
  const hasStoredSession=()=>{try{return !!localStorage.getItem(AUTH_KEY);}catch{return false;}};
  const authStorage={
    getItem:k=>{if(state.remember){try{const v=localStorage.getItem(k);if(v!==null)return v;}catch{}}return memStore.has(k)?memStore.get(k):null;},
    setItem:(k,v)=>{memStore.set(k,v);if(state.remember){try{localStorage.setItem(k,v);}catch{}}},
    removeItem:k=>{memStore.delete(k);try{localStorage.removeItem(k);}catch{}}
  };
  async function enterStudio(c,user){
    state.user=user;state.demo=false;
    const res=await c.from('members').select('id,display_name');if(res.error)throw new Error('Database non pronto. Esegui database.sql e controlla i permessi.');
    state.members=res.data;
    if(!state.members.some(m=>m.id===user.id)){await c.auth.signOut();throw new Error('Questo account non è autorizzato a entrare nello studio.');}
    $('#app').innerHTML='<div class="loading-page"><div class="spinner"></div><p>Apriamo lo studio…</p></div>';
    await loadRemote();renderShell();subscribe();
  }
  async function restoreSession(){
    if(!hasStoredSession())return;
    state.remember=true;$('#app').innerHTML='<div class="loading-page"><div class="spinner"></div><p>Riapriamo lo studio…</p></div>';
    try{const c=await getClient();const {data}=await c.auth.getSession();const user=data?.session?.user;if(!user)throw new Error('');await enterStudio(c,user);}
    catch(err){state.user=null;renderLogin();if(err.message)$('.login-error').textContent=err.message;}
  }
  const configured = () => {const c=window.SHININGBULBS_CONFIG;return !!(c?.supabaseUrl&&c?.supabasePublishableKey);};
  async function getClient(){
    if(state.client)return state.client;
    const c=window.SHININGBULBS_CONFIG;
    if(!configured())throw new Error('Collega prima il database: trovi i passaggi nella guida alla configurazione.');
    if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(c.supabaseUrl))throw new Error('Controlla il Project URL in config.js.');
    if(!c.supabasePublishableKey.startsWith('sb_publishable_'))throw new Error('Inserisci una chiave sb_publishable_ in config.js. Non usare chiavi segrete.');
    await new Promise((resolve,reject)=>{const el=document.createElement('script');el.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';el.onload=resolve;el.onerror=()=>reject(new Error('Impossibile caricare il servizio di accesso. Controlla la connessione e riprova.'));document.head.append(el);});
    state.client=window.supabase.createClient(c.supabaseUrl,c.supabasePublishableKey,{auth:{persistSession:true,storage:authStorage,storageKey:AUTH_KEY,detectSessionInUrl:false,autoRefreshToken:true}});
    state.client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'&&state.user&&!state.demo){resetSession();renderLogin();}if(event==='TOKEN_REFRESHED'&&session)state.client.realtime.setAuth(session.access_token);});
    return state.client;
  }
  async function login(form){
    const button=$('[type=submit]',form);button.disabled=true;button.innerHTML='<span class="spinner"></span> Accesso…';$('.login-error',form).textContent='';
    try{
      const values=new FormData(form);state.remember=values.get('remember')==='on';if(!state.remember)authStorage.removeItem(AUTH_KEY);const c=await getClient();
      const {data,error}=await c.auth.signInWithPassword({email:values.get('email').trim(),password:values.get('password')});
      if(error)throw new Error('Email o password non corrette. Controllale e riprova.');
      await enterStudio(c,data.user);
    }catch(err){state.user=null;renderLogin();$('.login-error').textContent=err.message;}
  }
  function resetSession(){
    for(const t of state.noteTimers.values())clearTimeout(t);
    state.noteTimers.clear();state.drafts.clear();state.loadSeq++;
    if(state.channel&&state.client)state.client.removeChannel(state.channel);
    state.channel=null;state.connected=false;state.user=null;state.demo=false;state.projectId=null;state.view='projects';
    TABLES.forEach(t=>state[t]=[]);state.members=[];state.activity=[];
  }
  async function logout(){
    if([...state.drafts.values()].some(d=>d.dirty||d.saving||d.conflict)){confirmDialog('Ci sono idee non salvate','Uscendo perderai i testi non ancora salvati. Puoi tornare alle idee per salvarli.',async()=>{await finishLogout();},'Esci comunque');return;}
    await finishLogout();
  }
  async function finishLogout(){const c=state.demo?null:state.client;resetSession();closeModal();if(c)await c.auth.signOut();renderLogin();}
  function startDemo(){resetSession();state.demo=true;demoSeed();state.connected=false;renderShell();}
  async function loadRemote(){
    if(state.demo||!state.user)return;
    const seq=++state.loadSeq;
    const results=await Promise.all([...TABLES.map(t=>state.client.from(t).select('*')),state.client.from('activity').select('*').order('created_at',{ascending:false}).limit(150)]);
    if(seq!==state.loadSeq||!state.user)return;
    const act=results.pop();state.activity=act.error?[]:act.data;
    ['todos','resources'].forEach(t=>{const i=TABLES.indexOf(t);state.missing[t]=!!results[i].error;if(state.missing[t])results[i]={data:[],error:null};});state.todosMissing=state.missing.todos;
    const err=results.find(r=>r.error)?.error;if(err)throw new Error('Non riusciamo ad aggiornare i dati. Controlla la connessione.');
    TABLES.forEach((t,i)=>state[t]=results[i].data);
    if(state.projectId&&!project(state.projectId))state.projectId=null;
  }
  let refreshTimer;
  function subscribe(){
    let ch=state.client.channel('shiningbulbs-database');
    TABLES.filter(t=>!state.missing[t]).forEach(table=>{ch=ch.on('postgres_changes',{event:'*',schema:'public',table},()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(async()=>{try{await loadRemote();if(state.user)renderContent(true);}catch(e){state.connected=false;updateSync();notify(e.message,true);}},160);});});
    ch=ch.on('broadcast',{event:'typing'},msg=>receiveTyping(msg?.payload));
    state.channel=ch.subscribe(async status=>{state.connected=status==='SUBSCRIBED';updateSync();if(status==='SUBSCRIBED'){try{await loadRemote();if(state.user)renderContent(true);}catch(e){notify(e.message,true);}}});
  }
  function updateSync(){const el=$('#sync-status');if(el)el.outerHTML=syncMarkup();}
  function syncMarkup(){return `<span id="sync-status" class="sync-state ${state.demo?'':state.connected?'live':'offline'}"><span class="dot"></span>${state.demo?'Anteprima':state.connected?'Sincronizzato':'Riconnessione…'}</span>`;}
  async function insert(table,values){
    state.loadSeq++;
    if(state.demo){const row={id:id(),created_at:new Date().toISOString(),version:1,...values};state[table].push(row);logLocal(table,'insert',null,row);return row;}
    const {data,error}=await state.client.from(table).insert(values).select().single();if(error)throw new Error('Salvataggio non riuscito. Controlla i dati e riprova.');state[table]=[...state[table].filter(r=>r.id!==data.id),data];return data;
  }
  async function insertMany(table,rows){
    if(!rows.length)return [];state.loadSeq++;
    if(state.demo){const out=rows.map(v=>({id:id(),created_at:new Date().toISOString(),version:1,...v}));state[table].push(...out);return out;}
    const {data,error}=await state.client.from(table).insert(rows).select();if(error)throw new Error('Salvataggio non riuscito. Controlla i dati e riprova.');const ids=new Set(data.map(r=>r.id));state[table]=[...state[table].filter(r=>!ids.has(r.id)),...data];return data;
  }
  async function update(table,uid,values,version){
    state.loadSeq++;
    if(state.demo){const index=state[table].findIndex(r=>r.id===uid);if(index<0)throw new Error('Questo elemento è stato eliminato.');const prev=state[table][index];if(version!==undefined&&prev.version!==version)throw new Error('CONFLICT');const row={...prev,...values,version:(prev.version||0)+1};state[table][index]=row;logLocal(table,'update',prev,row);return row;}
    let q=state.client.from(table).update(values).eq('id',uid);if(version!==undefined)q=q.eq('version',version);
    const {data,error}=await q.select();if(error)throw new Error('Modifica non salvata. Controlla la connessione e riprova.');if(!data.length)throw new Error('CONFLICT');
    const idx=state[table].findIndex(r=>r.id===uid);if(idx>=0)state[table][idx]=data[0];return data[0];
  }
  async function remove(table,uid){
    state.loadSeq++;
    if(!state.demo){const {data,error}=await state.client.from(table).delete().eq('id',uid).select('id');if(error||!data.length)throw new Error('Eliminazione non riuscita. Aggiorna i dati e riprova.');}
    if(state.demo)logLocal(table,'delete',state[table].find(r=>r.id===uid),null);
    state[table]=state[table].filter(r=>r.id!==uid);
    if(table==='todos')state.todos=state.todos.filter(t=>t.parent_id!==uid);
    if(table==='projects'){state.tasks=state.tasks.filter(t=>t.project_id!==uid);state.resources=state.resources.filter(r=>r.project_id!==uid);const gone=new Set(state.todos.filter(t=>t.project_id===uid).map(t=>t.id));state.todos=state.todos.filter(t=>!gone.has(t.id)&&!gone.has(t.parent_id));['ideas','events','transactions'].forEach(t=>state[t].forEach(r=>{if(r.project_id===uid)r.project_id=null;}));}
  }
  function renderLogin(){
    $('#app').innerHTML=`<div class="login-page"><section class="login-intro"><div class="brand"><div class="brand-mark">${icon('bulb',34)}</div><div>ShiningBulbs<small>THE FOUNDERS’ STUDIO</small></div></div><div class="login-story"><p class="eyebrow">DUE PERSONE. UN SACCO DI IDEE.</p><h1>Le idee si accendono.<br><span>Insieme.</span></h1><p>Uno spazio per dare forma alle intuizioni, costruire le vostre app e seguire ogni piccolo passo.</p><div class="login-mini-board"><div class="row">${icon('projects',17)}<strong>Dall’idea al primo download.</strong><span class="avatars"><span class="avatar">R</span><span class="avatar stefano">S</span></span></div><div class="login-mini-task">${icon('checkCircle',16)}Condividere un’idea<span>Fatto, insieme.</span></div><div class="login-mini-task">${icon('ideas',16)}Costruire qualcosa di bello<span>Il prossimo passo</span></div></div></div><footer>SHININGBULBS STUDIO &nbsp;·&nbsp; MADE FOR YOUR NEXT BIG THING.</footer></section><section class="login-form-area"><form class="login-form" id="login-form"><div class="brand-mark">${icon('bulb',26)}</div><h2>Benvenuto nello studio.</h2><p>Accedi al vostro spazio condiviso.<br>Le prossime idee vi aspettano.</p><label class="field"><span>Email</span><input name="email" type="email" placeholder="La tua email" autocomplete="username" required></label><label class="field"><span>Password</span><input name="password" type="password" placeholder="La tua password" autocomplete="current-password" required></label><label class="remember-me"><input type="checkbox" name="remember" checked><span>Resta collegato su questo dispositivo</span></label><button class="btn primary" type="submit">Entra nello studio ${icon('arrow',15)}</button><p class="login-error" role="alert"></p><div class="login-divider">DAI UN’OCCHIATA</div><button type="button" class="btn demo-cta" data-action="demo">${icon('sparkles',15)}Esplora l’anteprima</button><p class="login-footnote">Esempi modificabili, conservati solo finché la pagina resta aperta.</p>${!configured()?`<p class="login-footnote">Accesso condiviso da attivare. <button type="button" class="btn subtle" data-action="setup">Guida alla configurazione ${icon('arrow',12)}</button></p>`:''}</form></section></div>`;
    $('#login-form').addEventListener('submit',e=>{e.preventDefault();login(e.currentTarget);});
  }
  function renderShell(){
    $('#app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">${icon('bulb',31)}</div><div>ShiningBulbs<small>THE FOUNDERS’ STUDIO</small></div></div><div class="sidebar-label">WORKSPACE</div><nav class="nav" aria-label="Navigazione principale">${[['projects','Progetti'],['todos','Task'],['mytodos','Le mie task'],['calendar','Calendario'],['ideas','Idee'],['revenues','Revenues']].map(([key,name])=>`<button data-action="nav" data-view="${key}" class="${state.view===key?'active':''}" ${state.view===key?'aria-current="page"':''}>${icon(key,17)}<span>${name}</span>${key==='projects'?`<span class="count" id="project-count">${state.projects.length}</span>`:''}${key==='mytodos'?`<span class="count" id="my-todo-count">${openMine()}</span>`:''}</button>`).join('')}</nav><div class="studio-note"><div class="mini-icon">${icon('sparkles',20)}</div><strong>Una buona idea è un inizio.</strong><p>Costruirla insieme<br>è tutta un’altra storia.</p></div><div class="sidebar-bottom"><button class="settings" data-action="nav" data-view="settings">${icon('settings',16)}<span>Impostazioni</span></button><div class="identity">${avatar(state.user.id)}<div><strong>${esc(memberName(state.user.id))}</strong><small>${state.demo?'Profilo di esempio':'Founder · ShiningBulbs'}</small></div><button class="icon-btn" title="Esci dallo studio" aria-label="Esci dallo studio" data-action="logout">${icon('logout',16)}</button></div></div></aside><div class="work-area"><header class="topbar"><div class="breadcrumb">${icon('projects',12)}<span>Workspace</span>${icon('chevron',10)}<b id="breadcrumb-view">Progetti</b></div><div class="top-actions"><button class="search-trigger" data-action="search" aria-label="Cerca nello studio">${icon('search',15)}<span>Cerca nello studio</span><kbd>⌘ K</kbd></button><div class="top-divider"></div>${syncMarkup()}<span class="avatars">${state.members.map(m=>avatar(m.id)).join('')}</span></div></header>${state.demo?`<div class="demo-banner">${icon('info',12)}Anteprima con dati di esempio · le modifiche non vengono salvate né condivise.<button data-action="setup">Attiva lo studio condiviso ${icon('arrow',11)}</button></div>`:''}<main id="main-content" class="page" tabindex="-1"></main></div><nav class="tabbar" aria-label="Navigazione">${[['projects','Progetti','projects'],['todos','Task','todos'],['mytodos','Le mie','mytodos'],['calendar','Calendario','calendar']].map(([key,label,ic])=>`<button data-action="nav" data-view="${key}" class="${state.view===key?'active':''}">${icon(ic,21)}<span>${label}</span>${key==='mytodos'?`<i class="tab-badge" id="tab-todo-count"></i>`:''}</button>`).join('')}<button data-action="more-menu" class="more-tab">${icon('more',21)}<span>Altro</span></button></nav></div>`;
    renderContent();
  }
  function renderContent(preserve=false){
    if(!state.user)return;
    const main=$('#main-content');if(!main)return;
    const active=document.activeElement,key=active?.dataset?.focusKey,start=active?.selectionStart,end=active?.selectionEnd,typed=active?.tagName==='INPUT'&&active.type==='text'?active.value:undefined,noteOld=active?.dataset?.noteId?active.value:undefined;
    const scrollY=window.scrollY,scrollBox=$('.calendar-scroll'),scrollTop=scrollBox?.scrollTop;
    const titles={projects:'Progetti',todos:'Task',mytodos:'Le mie task',calendar:'Calendario',ideas:'Idee',revenues:'Revenues',settings:'Impostazioni'};
    $('#breadcrumb-view').textContent=state.projectId&&state.view==='projects'?project(state.projectId)?.name||'Progetti':titles[state.view];
    $$('.nav [data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===state.view);if(b.dataset.view===state.view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    $('#project-count').textContent=state.projects.length;if($('#my-todo-count'))$('#my-todo-count').textContent=openMine();const tb=$('#tab-todo-count');if(tb){const n=openMine();tb.textContent=n>9?'9+':n;tb.hidden=!n;}$$('.tabbar [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));$('.tabbar .more-tab')?.classList.toggle('active',['ideas','revenues','settings'].includes(state.view));
    const views={projects:()=>state.projectId?renderProject():renderProjects(),todos:renderTodos,mytodos:renderMyTodos,calendar:renderCalendar,ideas:renderIdeas,revenues:renderRevenues,settings:renderSettings};
    main.innerHTML=views[state.view]()+`<footer class="page-footer"><span>ShiningBulbs Studio &nbsp;·&nbsp; Built together.</span><span>Un’idea alla volta. Una release alla volta.</span></footer>`;
    if(preserve&&key){const el=$$('[data-focus-key]',main).find(e=>e.dataset.focusKey===key);if(el){if(typed!==undefined&&el.tagName==='INPUT'&&el.type==='text')el.value=typed;el.focus({preventScroll:true});if(typeof start==='number'&&typeof el.setSelectionRange==='function'){let s0=start,e0=end;if(noteOld!==undefined&&el.value!==noteOld){s0=mapCursor(noteOld,el.value,start);e0=mapCursor(noteOld,el.value,end);}try{el.setSelectionRange(s0,e0);}catch{}}}}
    if(preserve){window.scrollTo(0,scrollY);if(scrollTop!==undefined&&$('.calendar-scroll'))$('.calendar-scroll').scrollTop=scrollTop;}
    refreshTodoModal();refreshIdeaModal();
    if(state.view==='calendar'&&state.calView==='week'&&!preserve&&$('.calendar-scroll'))$('.calendar-scroll').scrollTop=7*60;
  }
  function heading(title,subtitle,action='',eyebrow=''){return `<div class="page-heading"><div>${eyebrow?`<div class="eyebrow">${esc(eyebrow)}</div>`:''}<h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>${action}</div>`;}
  const newButton=(what,label)=>`<button class="btn primary" data-action="new-${what}">${icon('plus',15)}${label}</button>`;
  function renderProjectCard(p){const pr=progress(p);return `<button class="project-card card" data-action="open-project" data-id="${p.id}"><div class="project-card-top"><div class="app-icon ${p.color}">${projectIcon(p)}</div><span class="tag ${pr.percent===100?'green':p.color==='purple'?'purple':'blue'}">${pr.percent===100?icon('check',10):'<span class="dot"></span>'}${phaseName(p)}</span></div><h3>${esc(p.name)}</h3><p class="description">${esc(p.description||'Una nuova idea che prende forma.')}</p><div class="project-progress"><div class="progress-label"><span>${pr.done} di ${pr.total} attività completate</span><span>${pr.percent}%</span></div><div class="progress-track ${p.color}"><span style="width:${pr.percent}%"></span></div></div><div class="project-footer"><span class="row">${avatars(p.owner_id)}${esc(memberName(p.owner_id))}</span><span>${icon('calendar',10)}${p.due_date?fmtDate(p.due_date):'Nessuna scadenza'}</span></div></button>`;}
  function renderProjects(){
    const active=state.projects.filter(p=>progress(p).percent<100).length,done=state.tasks.filter(t=>t.done).length;
    const meetings=state.events.filter(e=>new Date(e.end_at)>=today()).sort((a,b)=>a.start_at.localeCompare(b.start_at));
    const dueTasks=state.tasks.filter(t=>!t.done&&t.due_date).sort((a,b)=>a.due_date.localeCompare(b.due_date)).slice(0,4);
    const list=state.projects.filter(p=>state.filter==='all'||(state.filter==='active'?progress(p).percent<100:progress(p).percent===100));
    return heading('Progetti','Uno spazio per tutte le vostre prossime grandi idee.',newButton('project','Nuovo progetto'),'BENVENUTO NELLO STUDIO')+
    `<section class="welcome-banner"><div><h2>Piccole idee.<br><span>Grandi possibilità.</span></h2><p>Dall’intuizione al primo download.<br>Ogni passo del vostro viaggio, in un solo posto.</p></div><div class="welcome-art" aria-hidden="true"><div class="art-circle"></div><div class="art-bulb">${icon('bulb',89)}</div><div class="art-card">${icon('code',16)}Una nuova app</div><div class="art-card second">${icon('checkCircle',16)}Un passo in più</div></div></section>
    <div class="overview-metrics"><div class="card metric"><div class="metric-icon">${icon('projects',18)}</div><div><div class="metric-label">Progetti in corso</div><div class="metric-value">${String(active).padStart(2,'0')}<small>idee che prendono forma</small></div></div></div><div class="card metric"><div class="metric-icon">${icon('checkCircle',18)}</div><div><div class="metric-label">Attività completate</div><div class="metric-value">${String(done).padStart(2,'0')}<small>su ${state.tasks.length} totali</small></div></div></div><div class="card metric"><div class="metric-icon">${icon('calendar',18)}</div><div><div class="metric-label">Prossimo incontro</div><div class="metric-value" style="font-size:22px">${meetings.length?fmtDate(dateKey(new Date(meetings[0].start_at))):'—'}<small>${meetings.length?fmtTime(meetings[0].start_at):'Da programmare'}</small></div></div></div></div>
    <div class="projects-layout"><section><div class="section-head"><h2>I vostri progetti <span class="muted" style="font-weight:400;margin-left:4px;font-size:11px">${state.projects.length}</span></h2><div class="segmented" aria-label="Filtra progetti">${[['all','Tutti'],['active','In corso'],['done','Completati']].map(([key,label])=>`<button data-action="project-filter" data-filter="${key}" class="${state.filter===key?'active':''}">${label}</button>`).join('')}</div></div><div class="project-grid">${list.map(renderProjectCard).join('')}<button class="project-add" data-action="new-project"><span class="add-circle">${icon('plus',17)}</span>Accendete una nuova idea</button></div></section><aside class="project-aside"><section><div class="section-head"><h2 class="aside-heading">In calendario</h2><button class="icon-btn" aria-label="Apri calendario" data-action="nav" data-view="calendar">${icon('arrow',14)}</button></div>${meetings.length?meetings.slice(0,2).map(upcomingMarkup).join(''):`<p class="muted" style="font-size:11px">Nessun incontro in programma.<br>È un buon momento per confrontarsi.</p>`}</section><section class="deadlines"><div class="section-head"><h2 class="aside-heading">Prossime scadenze</h2><span class="tag">${dueTasks.length}</span></div>${dueTasks.length?dueTasks.map(t=>`<div class="deadline-item"><span class="tiny-circle"></span><button data-action="open-project" data-id="${t.project_id}">${esc(t.title)}<p>${esc(project(t.project_id)?.name||'')}</p></button><time class="${t.due_date<dateKey(today())?'overdue-text':''}">${fmtDate(t.due_date)}</time></div>`).join(''):`<p class="muted" style="font-size:11px">Avete spazio per pianificare il prossimo passo.</p>`}</section><section class="activity-aside"><div class="section-head"><h2 class="aside-heading">Ultime attività</h2>${state.activity.length?`<button class="icon-btn" data-action="activity" aria-label="Tutta la cronologia">${icon('arrow',14)}</button>`:''}</div>${state.activity.length?`<div class="activity-list">${state.activity.slice(0,5).map(activityRow).join('')}</div>`:'<p class="muted" style="font-size:11px">Qui vedrete cosa fa l’altro: task completate, nuovi incontri, idee.</p>'}</section><div class="aside-card">${icon('ideas',22)}<h3>Un’intuizione al volo?</h3><p>Scrivetela prima che scappi.<br>Le idee migliori partono da qui.</p><button class="btn subtle" style="font-size:10px" data-action="nav" data-view="ideas">Vai alle idee ${icon('arrow',12)}</button></div></aside></div>`;
  }
  function upcomingMarkup(ev){const d=new Date(ev.start_at);return `<div class="upcoming"><div class="mini-date"><span>${d.toLocaleDateString('it-IT',{month:'short'})}</span><b>${d.getDate()}</b></div><button data-action="edit-event" data-id="${ev.id}"><div class="title">${esc(ev.title)}</div><p>${fmtTime(ev.start_at)} – ${fmtTime(ev.end_at)} &nbsp;·&nbsp; ${ev.project_id?esc(project(ev.project_id)?.name||'Progetto'):'Riccardo e Stefano'}</p></button></div>`;}
  function startOfWeek(d){const r=new Date(d);r.setHours(0,0,0,0);r.setDate(r.getDate()-((r.getDay()+6)%7));return r;}
  function eventLayout(events){
    const list=events.slice().sort((a,b)=>a.start_at.localeCompare(b.start_at));const result=[];let group=[],ends=[],maxEnd=0;
    const flush=()=>{group.forEach(x=>result.push({...x,lanes:ends.length}));group=[];ends=[];maxEnd=0;};
    for(const ev of list){const st=+new Date(ev.start_at),en=+new Date(ev.end_at);if(group.length&&st>=maxEnd)flush();let lane=ends.findIndex(e=>e<=st);if(lane<0)lane=ends.length;ends[lane]=en;maxEnd=Math.max(maxEnd,en);group.push({ev,lane});}if(group.length)flush();return result;
  }
  // Tema: automatico (segue il sistema), chiaro o scuro. La scelta resta su questo dispositivo.
  const THEME_KEY='shiningbulbs-theme';
  const themePref=()=>{try{return localStorage.getItem(THEME_KEY)||'auto';}catch{return 'auto';}};
  const systemDark=()=>!!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  function applyTheme(){
    if(typeof document==='undefined'||!document.documentElement?.setAttribute)return;
    const pref=themePref(),dark=pref==='dark'||(pref==='auto'&&systemDark());
    document.documentElement.setAttribute('data-theme',dark?'dark':'light');
    const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=dark?'#0e1014':'#f5f6f8';
  }
  function setTheme(pref){try{if(pref==='auto')localStorage.removeItem(THEME_KEY);else localStorage.setItem(THEME_KEY,pref);}catch{}applyTheme();}
  const themeSwitch=()=>`<div class="segmented theme-switch" aria-label="Tema">${[['auto','Automatico'],['light','Chiaro'],['dark','Scuro']].map(([k,l])=>`<button data-action="set-theme" data-theme-value="${k}" class="${themePref()===k?'active':''}">${l}</button>`).join('')}</div>`;
  function calendarList(){
    const startKey=dateKey(state.calDate),endKey=dateKey(shiftDay(state.calDate,60)),todayKey=dateKey(today());
    const evs=state.events.filter(e=>{const k=dateKey(new Date(e.start_at));return k>=startKey&&k<=endKey;}).sort((a,b)=>a.start_at.localeCompare(b.start_at));
    const days=[];evs.forEach(e=>{const k=dateKey(new Date(e.start_at));let d=days.find(x=>x.key===k);if(!d){d={key:k,items:[]};days.push(d);}d.items.push(e);});
    if(!days.length)return `<div class="card empty-state">${icon('calendar',30)}<h3>Nessun incontro nei prossimi due mesi.</h3><p>È un buon momento per confrontarsi.</p>${newButton('event','Nuovo incontro')}</div>`;
    return `<div class="card cal-list">${days.map(d=>`<section class="list-day"><h3 class="${d.key===todayKey?'today':''}">${d.key===todayKey?'Oggi · ':''}${esc(dayDate(d.key).toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'}))}</h3>${d.items.map(e=>`<button class="list-event ${project(e.project_id)?.color||'blue'}" data-action="edit-event" data-id="${e.id}"><span class="list-time">${fmtTime(e.start_at)}<small>${fmtTime(e.end_at)}</small></span><span class="list-info"><b>${esc(e.title)}</b><small>${esc(project(e.project_id)?.name||'Riccardo e Stefano')}${e.meeting_url?' · call':''}</small></span>${icon('chevron',13)}</button>`).join('')}</section>`).join('')}</div>`;
  }
  function moreSheet(){
    const d=$('#modal');if(d.open)d.close();d.className='sheet';
    const item=(action,view,ic,label)=>`<button class="sheet-item ${state.view===view?'active':''}" data-action="${action}" ${view?`data-view="${view}"`:''}>${icon(ic,18)}<span>${label}</span>${icon('chevron',13)}</button>`;
    d.innerHTML=`<div class="modal-header"><div class="row">${avatar(state.user.id)}<div><h2 id="modal-title" style="font-size:16px">${esc(memberName(state.user.id))}</h2><small class="muted" style="font-size:10px">${state.demo?'Profilo di esempio':'Founder · ShiningBulbs'}</small></div></div><button type="button" class="icon-btn" data-action="close-modal" aria-label="Chiudi">${icon('close',17)}</button></div><div class="modal-body sheet-list">${item('nav','ideas','ideas','Idee')}${item('nav','revenues','revenues','Revenues')}${item('search','','search','Cerca nello studio')}<div class="sheet-theme"><span>Aspetto</span>${themeSwitch()}</div>${item('nav','settings','settings','Impostazioni')}${item('logout','','logout','Esci dallo studio')}</div>`;d.showModal();
  }
  function renderCalendar(){
    const start=startOfWeek(state.calDate),days=Array.from({length:7},(_,i)=>shiftDay(start,i));
    const monthTitle=state.calDate.toLocaleDateString('it-IT',{month:'long',year:'numeric'});
    const upcoming=state.events.filter(e=>new Date(e.end_at)>=today()).sort((a,b)=>a.start_at.localeCompare(b.start_at)).slice(0,3);
    let content;
    if(state.calView==='list'){content=calendarList();}
    else if(state.calView==='week'){
      content=`<div class="card calendar-scroll"><div class="week"><div class="week-header"><span></span>${days.map(d=>`<div class="week-day ${dateKey(d)===dateKey(today())?'today':''}">${d.toLocaleDateString('it-IT',{weekday:'short'})}<b>${d.getDate()}</b></div>`).join('')}</div><div class="week-body" style="height:1440px"><div class="time-axis">${Array.from({length:24},(_,h)=>`<span style="top:${h*60}px">${h?`${String(h).padStart(2,'0')}:00`:''}</span>`).join('')}</div>${days.map(d=>{const events=eventLayout(state.events.filter(e=>dateKey(new Date(e.start_at))===dateKey(d)));return `<div class="day-column ${dateKey(d)===dateKey(today())?'today':''}" data-action="calendar-slot" data-date="${dateKey(d)}" tabindex="0" role="button" aria-label="Aggiungi incontro il ${esc(fmtDate(dateKey(d)))}">${events.map(({ev,lane,lanes})=>{const st=new Date(ev.start_at),top=st.getHours()*60+st.getMinutes(),height=Math.max(23,(+new Date(ev.end_at)-st)/60000-3),color=project(ev.project_id)?.color||'blue';return `<button class="calendar-event ${color}" style="top:${top}px;height:${height}px;left:calc(${lane*100/lanes}% + 4px);width:calc(${100/lanes}% - 8px);right:auto" data-action="edit-event" data-id="${ev.id}" aria-label="${esc(ev.title)}, ${fmtTime(ev.start_at)}"><b>${esc(ev.title)}</b><small>${fmtTime(ev.start_at)} – ${fmtTime(ev.end_at)}</small></button>`;}).join('')}</div>`;}).join('')}</div></div></div>`;
    }else{
      const first=new Date(state.calDate.getFullYear(),state.calDate.getMonth(),1),gridStart=startOfWeek(first);
      content=`<div class="card calendar-scroll month-scroll"><div class="month-header">${['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(d=>`<div>${d}</div>`).join('')}</div><div class="month-grid">${Array.from({length:42},(_,i)=>{const d=shiftDay(gridStart,i),key=dateKey(d),evs=state.events.filter(e=>dateKey(new Date(e.start_at))===key).sort((a,b)=>a.start_at.localeCompare(b.start_at));return `<div class="month-day ${d.getMonth()!==state.calDate.getMonth()?'off-month':''} ${key===dateKey(today())?'today':''}" data-action="new-event" data-date="${key}" tabindex="0" role="button" aria-label="Aggiungi incontro il ${esc(fmtDate(key))}"><span>${d.getDate()}</span>${evs.map(e=>`<button class="month-event" data-action="edit-event" data-id="${e.id}" title="${esc(e.title)}">${fmtTime(e.start_at)} ${esc(e.title)}</button>`).join('')}</div>`;}).join('')}</div></div>`;
    }
    return heading('Calendario','Trovate il tempo per costruire, insieme.',newButton('event','Nuovo incontro'))+`<div class="calendar-toolbar"><h2>${esc(monthTitle)}</h2><div class="row" style="gap:1px"><button class="icon-btn" data-action="cal-prev" aria-label="Periodo precedente">${icon('left',15)}</button><button class="icon-btn" data-action="cal-next" aria-label="Periodo successivo">${icon('chevron',15)}</button></div><button class="btn small" data-action="cal-today">Oggi</button><div class="segmented">${[['list','Elenco'],['week','Settimana'],['month','Mese']].map(([key,label])=>`<button data-action="cal-view" data-view="${key}" class="${state.calView===key?'active':''}">${label}</button>`).join('')}</div></div>${content}<div class="calendar-below"><span>${icon('info',12)} ${state.calView==='list'?'Tocca un incontro per vederlo o modificarlo.':`Clicca ${state.calView==='week'?'un orario':'un giorno'} per aggiungere un incontro.`}</span><span>Orari locali · ${esc(Intl.DateTimeFormat().resolvedOptions().timeZone)}</span><button class="btn subtle" style="font-size:10px;margin-left:auto" data-action="export-calendar">${icon('download',12)}Esporta calendario</button><button class="btn subtle" style="font-size:10px" data-action="iphone-calendar">${icon('calendar',12)}Su iPhone</button></div><div class="card agenda-panel"><h2 style="font-size:13px">I prossimi momenti insieme</h2><div class="agenda-grid">${upcoming.length?upcoming.map(upcomingMarkup).join(''):'<p class="muted" style="font-size:11px;margin-top:15px">Nessun incontro in programma. Pianificate il prossimo confronto.</p>'}</div></div>`;
  }
  function renderIdeas(){
    const orphaned=[...state.drafts.entries()].filter(([uid,d])=>!state.ideas.some(n=>n.id===uid)&&d.snapshot).map(([,d])=>{d.conflict=true;return d.snapshot;});
    const list=[...state.ideas,...orphaned].filter(n=>state.ideaFilter==='all'||state.ideaFilter===n.created_by||state.ideaFilter===n.project_id).sort((a,b)=>(a.created_at||'').localeCompare(b.created_at||''));
    return heading('Idee','Lo spazio bianco prima della prossima grande cosa.',newButton('idea','Nuova idea'))+`<div class="ideas-toolbar"><button class="filter-chip ${state.ideaFilter==='all'?'active':''}" data-action="idea-filter" data-filter="all">Tutte le idee</button>${state.members.map(m=>`<button class="filter-chip ${state.ideaFilter===m.id?'active':''}" data-action="idea-filter" data-filter="${m.id}">${esc(m.display_name)}</button>`).join('')}${state.projects.map(p=>`<button class="filter-chip ${state.ideaFilter===p.id?'active':''}" data-action="idea-filter" data-filter="${p.id}">${esc(p.name)}</button>`).join('')}</div><div class="ideas-grid">${list.map(n=>{const draft=state.drafts.get(n.id),content=draft?draft.content:n.content;return `<article class="card note ${n.color||'blue'}"><div class="row between"><span class="tag ${n.color||'blue'}">${n.project_id?esc(project(n.project_id)?.name||'Studio'):'Pensieri sparsi'}</span><button class="icon-btn" data-action="edit-idea" data-id="${n.id}" title="Apri in grande" aria-label="Apri ${esc(n.title)} in grande">${icon('expand',15)}</button></div><h3 class="todo-open" data-action="edit-idea" data-id="${n.id}" role="button" tabindex="0" title="Apri in grande">${esc(n.title)}</h3><span class="typing-indicator ${state.typing.has(n.id)?'active':''}" data-typing-for="${n.id}" aria-live="polite">${esc(typingLabel(n.id))}</span><textarea data-note-id="${n.id}" data-focus-key="note-${n.id}" aria-label="Testo: ${esc(n.title)}" placeholder="Inizia da un’intuizione…" maxlength="20000">${esc(content)}</textarea>${ideaConflict(n,draft)}<div class="note-foot">${avatar(n.created_by)}<span>Idea di ${esc(memberName(n.created_by))}</span>${n.updated_by&&n.updated_by!==n.created_by?`<span title="Ultima modifica di ${esc(memberName(n.updated_by))}">· modificata da ${esc(memberName(n.updated_by))}</span>`:''}<span class="save-status" data-save-status="${n.id}">${draft?.conflict?'Da risolvere':draft?.saving?'Salvataggio…':draft?.dirty?'Da salvare':state.demo?'Temporanea':'Salvata'}</span></div></article>`;}).join('')}<button class="project-add note-add" data-action="new-idea"><span class="add-circle">${icon('plus',17)}</span>C’è spazio per un’altra idea</button></div><div class="ideas-caption">${icon('info',13)}Ogni idea ha una firma. Il testo si salva mentre scrivete; se scrivete insieme nella stessa idea, le modifiche vengono unite da sole.</div>`;
  }
  function setNoteStatus(uid,text){$$('[data-save-status]').filter(x=>x.dataset.saveStatus===uid).forEach(el=>el.textContent=text);}
  // ===== Idee: unione automatica delle modifiche (3 vie) e indicatore "sta scrivendo"
  let dmpInstance=null;
  const dmp=()=>{if(!dmpInstance&&window.diff_match_patch){dmpInstance=new window.diff_match_patch();dmpInstance.Diff_Timeout=0.5;}return dmpInstance;};
  // Intervalli del testo base toccati da una modifica (dopo una pulizia "a parole").
  function changedRanges(d,base,other){
    const diffs=d.diff_main(base,other);d.diff_cleanupSemantic(diffs);
    const out=[];let i=0,cur=null;
    for(const [op,text] of diffs){if(op===0){if(cur){out.push(cur);cur=null;}i+=text.length;}else{if(!cur)cur={s:i,e:i};if(op===-1){i+=text.length;cur.e=i;}}}
    if(cur)out.push(cur);return out;
  }
  // Unisce le mie modifiche e le sue partendo dalla stessa base; rifiuta se toccano le stesse parole.
  function merge3(base,mine,theirs){
    if(mine===theirs||theirs===base)return {ok:true,text:mine};
    if(typeof base!=='string')return {ok:false};
    if(mine===base)return {ok:true,text:theirs};
    const d=dmp();if(!d)return {ok:false};
    const a=changedRanges(d,base,mine),b=changedRanges(d,base,theirs);
    const clash=a.some(x=>b.some(y=>(x.s<y.e&&y.s<x.e)||x.s===y.s||(x.s===x.e&&x.s>y.s&&x.s<y.e)||(y.s===y.e&&y.s>x.s&&y.s<x.e)));
    if(clash)return {ok:false};
    const [text,results]=d.patch_apply(d.patch_make(base,mine),theirs);
    return results.every(Boolean)?{ok:true,text}:{ok:false};
  }
  const mapCursor=(oldText,newText,pos)=>{const d=dmp();if(!d||typeof pos!=='number')return Math.min(pos||0,newText.length);return d.diff_xIndex(d.diff_main(oldText,newText),pos);};
  function setNoteText(uid,text){
    for(const el of $$('[data-note-id]').filter(x=>x.dataset.noteId===uid)){if(el.value===text)continue;
    const focused=document.activeElement===el,old=el.value,s=el.selectionStart,e=el.selectionEnd;el.value=text;
    if(focused){try{el.setSelectionRange(mapCursor(old,text,s),mapCursor(old,text,e));}catch{}}}
  }
  async function fetchLatestIdea(uid){
    if(state.demo)return state.ideas.find(i=>i.id===uid)||null;
    const {data,error}=await state.client.from('ideas').select('*').eq('id',uid).maybeSingle();if(error)throw error;
    if(data){const i=state.ideas.findIndex(x=>x.id===uid);if(i>=0)state.ideas[i]=data;else state.ideas.push(data);}
    return data;
  }
  async function tryMerge(uid,d){
    try{
      const latest=await fetchLatestIdea(uid);if(!latest||state.drafts.get(uid)!==d)return false;
      const r=merge3(d.baseContent,d.content,latest.content);
      d.theirs=latest.content;d.theirsVersion=latest.version;d.theirsBy=latest.updated_by;
      if(!r.ok||(d.merges||0)>=5)return false;
      d.content=r.text;d.baseContent=latest.content;d.baseVersion=latest.version;d.dirty=true;d.merges=(d.merges||0)+1;
      if(latest.updated_by&&latest.updated_by!==state.user?.id)d.mergedWith=latest.updated_by;
      setNoteText(uid,r.text);setNoteStatus(uid,'Unione delle modifiche…');
      setTimeout(()=>saveDraft(uid),0);return true;
    }catch{return false;}
  }
  async function resolveConflict(uid,choice){
    const d=state.drafts.get(uid);if(!d)return;
    if(choice==='theirs'){clearTimeout(state.noteTimers.get(uid));state.drafts.delete(uid);if(!state.demo)await loadRemote();renderContent(true);notify('Tenuta la versione più recente.');return;}
    const latest=await fetchLatestIdea(uid);if(!latest){notify('Questa idea è stata eliminata. Salva il tuo testo come nuova idea.',true);return;}
    d.conflict=false;d.baseVersion=latest.version;d.baseContent=latest.content;d.dirty=true;d.merges=0;renderContent(true);await saveDraft(uid);notify('Il tuo testo è stato salvato.');
  }
  let lastTypingSent=0;
  function sendTyping(uid){
    if(state.demo||!state.channel||!state.connected||Date.now()-lastTypingSent<1500)return;lastTypingSent=Date.now();
    try{const r=state.channel.send({type:'broadcast',event:'typing',payload:{idea:uid,user:state.user.id}});r?.catch?.(()=>{});}catch{}
  }
  const typingLabel=uid=>{const t=state.typing.get(uid);return t?`✎ ${memberName(t.user)} sta scrivendo…`:'';};
  function paintTyping(uid){$$('[data-typing-for]').filter(x=>x.dataset.typingFor===uid).forEach(el=>{el.textContent=typingLabel(uid);el.classList.toggle('active',state.typing.has(uid));});}
  function receiveTyping(p){
    if(!p||!p.idea||p.user===state.user?.id||!member(p.user))return;
    clearTimeout(state.typing.get(p.idea)?.timer);
    const timer=setTimeout(()=>{state.typing.delete(p.idea);paintTyping(p.idea);},4000);
    state.typing.set(p.idea,{user:p.user,timer});paintTyping(p.idea);
  }
  function noteInput(el){
    const uid=el.dataset.noteId,note=state.ideas.find(n=>n.id===uid);if(!note)return;
    let d=state.drafts.get(uid);if(!d){d={content:note.content,baseContent:note.content,baseVersion:note.version,dirty:false,saving:false,conflict:false,snapshot:{...note}};state.drafts.set(uid,d);}
    d.content=el.value;d.dirty=true;clearTimeout(state.noteTimers.get(uid));sendTyping(uid);
    $$('[data-note-id]').forEach(x=>{if(x!==el&&x.dataset.noteId===uid&&x.value!==el.value)x.value=el.value;});
    setNoteStatus(uid,d.conflict?'Da risolvere':'Scrittura…');
    if(!d.conflict)state.noteTimers.set(uid,setTimeout(()=>saveDraft(uid),650));
  }
  async function saveDraft(uid){
    const d=state.drafts.get(uid);if(!d||d.saving||d.conflict||!d.dirty)return;
    d.saving=true;d.failed=false;setNoteStatus(uid,'Salvataggio…');const sent=d.content,ver=d.baseVersion;
    try{
      const note=await update('ideas',uid,{content:sent,updated_by:state.user.id},ver);
      if(state.drafts.get(uid)!==d)return;d.baseVersion=note.version;d.baseContent=sent;d.saving=false;d.dirty=d.content!==sent;d.merges=0;
      if(d.mergedWith){notify(`Le modifiche di ${memberName(d.mergedWith)} sono state unite alle tue.`);d.mergedWith=null;}
      setNoteStatus(uid,d.dirty?'Scrittura…':state.demo?'Temporanea':'Salvata');
      if(d.dirty)state.noteTimers.set(uid,setTimeout(()=>saveDraft(uid),200));else state.drafts.delete(uid);
    }catch(err){d.saving=false;if(err.message==='CONFLICT'){if(await tryMerge(uid,d))return;d.conflict=true;renderContent(true);}else{d.failed=true;renderContent(true);setNoteStatus(uid,'Non salvata');notify('Idea non salvata. Il testo resta qui: usa Riprova sotto l’idea.',true);}}
  }
  function filterTransactions(period=state.period){const now=dateKey(today());return state.transactions.filter(t=>period==='all'||(period==='month'?t.date.slice(0,7)===now.slice(0,7):t.date.slice(0,4)===now.slice(0,4)));}
  const sumAmount=(arr,type)=>arr.filter(t=>!type||t.type===type).reduce((sum,t)=>sum+Math.round(Number(t.amount)*100),0)/100;
  function financials(rows){const revenue=sumAmount(rows,'revenue'),cost=sumAmount(rows,'cost');return {revenue,cost,net:Math.round((revenue-cost)*100)/100,margin:revenue?(revenue-cost)/revenue*100:null};}
  function financeChart(rows){
    const months=Array.from({length:6},(_,i)=>new Date(today().getFullYear(),today().getMonth()-5+i,1));
    const series=months.map(d=>{const key=dateKey(d).slice(0,7);return {label:d.toLocaleDateString('it-IT',{month:'short'}),...financials(rows.filter(t=>t.date.startsWith(key)))};});
    const max=Math.max(...series.flatMap(s=>[s.revenue,s.cost]),10),axis=Math.ceil(max/5)*5;
    return `<svg class="bar-chart" viewBox="0 0 560 180" role="img" aria-label="Ricavi e costi mensili negli ultimi sei mesi, con il filtro selezionato"><title>Ricavi e costi registrati</title>${[0,.5,1].map(f=>`<line x1="45" y1="${140-f*120}" x2="555" y2="${140-f*120}" stroke="#edf1f7" ${f?'stroke-dasharray="3 4"':''}/><text x="35" y="${144-f*120}" text-anchor="end" fill="#aab6c9" font-size="9">${Math.round(axis*f)} €</text>`).join('')}${series.map((s,i)=>{const x=72+i*82;return `<g><title>${s.label}: ricavi ${money(s.revenue)}, costi ${money(s.cost)}</title><rect x="${x}" y="${140-s.revenue/axis*120}" width="18" height="${s.revenue/axis*120}" rx="4" fill="#91abe7"/><rect x="${x+23}" y="${140-s.cost/axis*120}" width="18" height="${s.cost/axis*120}" rx="4" fill="#d5dfee"/><text x="${x+20}" y="165" text-anchor="middle" fill="#a1afc4" font-size="10">${s.label}</text></g>`;}).join('')}</svg>`;
  }
  function renderRevenues(){
    const rows=filterTransactions(),f=financials(rows),costs=rows.filter(t=>t.type==='cost');
    const groups=Object.keys(CATEGORIES).filter(c=>c!=='revenue').map((cat,i)=>({cat,label:CATEGORIES[cat],amount:sumAmount(costs.filter(t=>t.category===cat)),color:['#90a9df','#b4a3d7','#9bbfaf','#e2c493','#c2cad9'][i]})).filter(c=>c.amount);
    let angle=0;const gradient=groups.map(g=>{const start=angle;angle+=g.amount/(f.cost||1)*360;return `${g.color} ${start}deg ${angle}deg`;}).join(',')||'#eef2f8 0deg 360deg';
    const [m1,m2]=state.members;const paid1=m1?sumAmount(costs.filter(t=>t.member_id===m1.id)):0,paid2=m2?sumAmount(costs.filter(t=>t.member_id===m2.id)):0;
    const balance=Math.round((paid1-paid2)/2*100)/100;
    const rowsSorted=rows.slice().sort((a,b)=>b.date.localeCompare(a.date));
    const ranges=`<select class="period-select" id="finance-period" aria-label="Periodo dei ricavi e costi"><option value="all" ${state.period==='all'?'selected':''}>Tutto il periodo</option><option value="year" ${state.period==='year'?'selected':''}>Quest’anno</option><option value="month" ${state.period==='month'?'selected':''}>Questo mese</option></select>`;
    return heading('Revenues','Numeri chiari. Decisioni migliori.',`<div class="row">${ranges}${newButton('transaction','Nuovo movimento')}</div>`)+
    `<div class="finance-metrics">${[
      ['Ricavi totali',money(f.revenue),'Incassi registrati','upRight','positive'],
      ['Costi totali',money(f.cost),'Spese registrate','downLeft',''],
      ['Risultato netto',money(f.net),'Ricavi meno costi','wallet',f.net>=0?'positive':'negative'],
      ['Margine',f.margin===null?'—':`${Math.round(f.margin)}%`,'Risultato netto / ricavi','revenues','']
    ].map(([label,value,caption,ic,cls])=>`<div class="card finance-metric"><div class="metric-top">${label}${icon(ic,15)}</div><div class="value ${cls}">${value}</div><p>${caption}</p></div>`).join('')}</div>
    <div class="finance-charts"><div class="card chart-panel"><div class="section-head"><h2 style="font-size:14px">Il percorso, in numeri</h2><div class="chart-legend"><span><i class="dot" style="color:#91abe7"></i>Ricavi</span><span><i class="dot" style="color:#d5dfee"></i>Costi</span></div></div>${financeChart(rows)}<p class="muted" style="font-size:9px;margin:5px 0 0 44px">Ultimi 6 mesi · filtro periodo applicato</p></div><div class="card chart-panel"><div class="section-head"><h2 style="font-size:14px">Dove investite</h2><span class="tag">Costi</span></div><div class="donut-layout"><div class="donut" style="background:conic-gradient(${gradient})" role="img" aria-label="Ripartizione costi: ${esc(groups.map(g=>g.label+' '+money(g.amount)).join(', '))}"><span><strong>${shortMoney(f.cost)}</strong>totale</span></div><div class="cost-legend">${groups.length?groups.map(g=>`<div><i class="dot" style="color:${g.color}"></i>${g.label}<b>${Math.round(g.amount/(f.cost||1)*100)}%</b></div>`).join(''):'<span>Nessun costo registrato.</span>'}</div></div></div></div>
    <section class="card table-card"><div class="section-head"><h2 style="font-size:14px">Tutti i movimenti <span class="muted" style="font-size:10px;font-weight:400;margin-left:5px">${rows.length}</span></h2><button class="btn small" data-action="export-finance">${icon('download',12)}Esporta CSV</button></div><div class="table-wrap"><table><thead><tr><th>Movimento</th><th>App / Progetto</th><th>Data</th><th>Pagato / incassato da</th><th style="text-align:right">Importo</th><th></th></tr></thead><tbody>${rowsSorted.length?rowsSorted.map(t=>`<tr><td><strong>${esc(t.description)}</strong><span class="table-sub">${t.type==='revenue'?'Ricavo':esc(CATEGORIES[t.category]||'Altro')}</span></td><td>${esc(project(t.project_id)?.name||'ShiningBulbs Studio')}</td><td>${fmtDate(t.date,{day:'numeric',month:'short',year:'numeric'})}</td><td><span class="row" style="gap:6px">${avatar(t.member_id)}${esc(memberName(t.member_id))}</span></td><td class="amount ${t.type==='revenue'?'income':''}" style="text-align:right">${t.type==='revenue'?'+':'−'} ${money(t.amount)}</td><td style="width:35px;padding-left:0"><button class="icon-btn" data-action="edit-transaction" data-id="${t.id}" aria-label="Modifica ${esc(t.description)}">${icon('more',16)}</button></td></tr>`).join(''):'<tr><td colspan="6"><div class="empty-state">Nessun movimento in questo periodo. Iniziate dal primo ricavo o dalla prima spesa.</div></td></tr>'}</tbody></table></div></section>
    <div class="finance-bottom"><section class="card balance-panel"><h2 style="font-size:14px">Chi ha anticipato i costi</h2><div class="balance-members">${state.members.map(m=>`<div class="balance-member"><div class="row">${avatar(m.id)}${esc(m.display_name)}</div><b>${money(sumAmount(costs.filter(t=>t.member_id===m.id)))}</b></div>`).join('')}</div><div class="balance-note">${Math.abs(balance)<.01?'Siete in pari sulle spese.':`${esc(balance>0?m2?.display_name:m1?.display_name)} → ${esc(balance>0?m1?.display_name:m2?.display_name)}: ${money(Math.abs(balance))}`}</div><p style="margin-top:10px">Ipotesi: costi condivisi al 50%, nel periodo selezionato. Sono esclusi incassi ed eventuali rimborsi già effettuati.</p></section><section class="card balance-panel"><h2 style="font-size:14px">Ogni app, il suo risultato</h2>${state.projects.length?state.projects.map(p=>{const pf=financials(rows.filter(t=>t.project_id===p.id));return `<div class="app-performance"><span class="row"><i class="dot" style="color:${COLORS[p.color]||COLORS.blue}"></i>${esc(p.name)}</span><span style="font-size:9px">${money(pf.revenue)} ricavi &nbsp;·&nbsp; <b style="color:${pf.net<0?'#b68780':''}">${money(pf.net)}</b></span></div>`;}).join(''):'<p class="muted" style="margin-top:18px">Aggiungete un progetto per seguirne il risultato.</p>'}<p style="font-size:9px;margin-top:11px">Il risultato per app include solo i costi assegnati al progetto. I costi generali restano nel totale dello studio.</p></section></div>`;
  }
  const todoCheck=(t,done)=>`<button type="button" class="task-check ${done?'checked':''}" data-action="toggle-todo" data-id="${t.id}" role="checkbox" aria-checked="${done}" aria-label="${esc(t.title)}">${done?icon('check',12):''}</button>`;
  const todoOwner=(t,k='')=>`<select class="task-owner" data-action="todo-owner" data-id="${t.id}" data-focus-key="${k}todo-owner-${t.id}" aria-label="Assegnata a: ${esc(t.title)}">${ownerOptions(t.owner_id)}</select>`;
  const todoDate=(t,done,k='')=>`<input class="task-date ${!done&&t.due_date&&t.due_date<dateKey(today())?'overdue':''}" type="date" value="${esc(t.due_date||'')}" data-action="todo-date" data-id="${t.id}" data-focus-key="${k}todo-date-${t.id}" aria-label="Scadenza: ${esc(t.title)}">`;
  const projectTag=pid=>{const pj=project(pid);return `<span class="tag ${pj?pj.color:''}">${esc(pj?pj.name:'Studio · generale')}</span>`;};
  const todoStepRows=(subs,k='')=>subs.map(s=>`<div class="task-row">${todoCheck(s,!!s.done)}<input class="task-title-input ${s.done?'done':''}" value="${esc(s.title)}" maxlength="200" data-action="todo-title" data-id="${s.id}" data-focus-key="${k}todo-title-${s.id}" aria-label="Titolo del passo">${todoOwner(s,k)}${todoDate(s,s.done,k)}<button type="button" class="icon-btn" data-action="delete-subtodo" data-id="${s.id}" aria-label="Elimina ${esc(s.title)}">${icon('close',13)}</button></div>`).join('');
  function todoCard(p){
    const subs=subtodos(p.id),done=todoDone(p),pr=todoProgress(p);
    const people=[...new Set(subs.map(s=>s.owner_id||'both'))];
    const who=subs.length?`<span class="todo-people" title="I passi hanno i loro assegnatari">${people.includes('both')||people.length>1?avatars(null):avatars(people[0])}</span>`:todoOwner(p);
    return `<article class="card todo-card ${done?'is-done':''}" id="todo-${p.id}"><div class="todo-head">${todoCheck(p,done)}<div class="todo-main"><h3 class="todo-open ${done?'done':''}" data-action="edit-todo" data-id="${p.id}" role="button" tabindex="0" title="Apri la task">${esc(p.title)}</h3><div class="todo-meta">${projectTag(p.project_id)}${subs.length?`<span class="tag ${pr.done===pr.total?'green':''}">${pr.done} di ${pr.total} passi</span>`:''}</div>${p.notes?`<p class="todo-notes todo-open" data-action="edit-todo" data-id="${p.id}">${esc(p.notes)}</p>`:''}</div>${who}${todoDate(p,done)}<button class="icon-btn" data-action="edit-todo" data-id="${p.id}" aria-label="Modifica ${esc(p.title)}">${icon('more',16)}</button></div>${subs.length?`<div class="task-list">${todoStepRows(subs)}</div>`:''}<form class="todo-add" data-parent="${p.id}"><span class="add-icon">${icon('plus',13)}</span><input name="title" maxlength="200" placeholder="${subs.length?'Aggiungi un passo…':'Dividila in passi più piccoli…'}" data-focus-key="todo-add-${p.id}" aria-label="Nuovo passo per ${esc(p.title)}" autocomplete="off"><select name="owner_id" class="task-owner" aria-label="Assegna il nuovo passo">${ownerOptions(p.owner_id)}</select><button class="btn small" type="submit">Aggiungi</button></form></article>`;
  }
  function renderTodos(){
    if(!['all','studio'].includes(state.todoProject)&&!project(state.todoProject))state.todoProject='all';
    const parents=todoParents().filter(p=>state.todoProject==='all'||(state.todoProject==='studio'?!p.project_id:p.project_id===state.todoProject)).filter(p=>state.todoStatus==='all'||(state.todoStatus==='done')===todoDone(p)).sort((a,b)=>(todoDone(a)-todoDone(b))||byDue(a,b)||(a.created_at||'').localeCompare(b.created_at||''));
    const chip=(key,label)=>`<button class="filter-chip ${state.todoProject===key?'active':''}" data-action="todo-project" data-filter="${key}">${esc(label)}</button>`;
    const warn=state.todosMissing?`<div class="card todo-warning">${icon('info',18)}<div><strong>Manca la tabella delle task nel database.</strong><p>Eseguite una volta <code>migrations/002_todos.sql</code> nel SQL Editor di Supabase, poi ricaricate la pagina.</p></div></div>`:'';
    return heading('Task','Le cose da fare, divise in piccoli passi. Ognuno sa cosa tocca a lui.',state.todosMissing?'':newButton('todo','Nuova task'))+warn+
    `<div class="todo-toolbar"><div class="ideas-toolbar">${chip('all','Tutte')}${chip('studio','Studio · generale')}${state.projects.map(p=>chip(p.id,p.name)).join('')}</div><div class="segmented" aria-label="Filtra per stato">${[['open','Da fare'],['done','Completate'],['all','Tutte']].map(([k,l])=>`<button data-action="todo-status" data-filter="${k}" class="${state.todoStatus===k?'active':''}">${l}</button>`).join('')}</div></div>`+
    `<div class="todo-list">${parents.length?parents.map(todoCard).join(''):`<div class="card empty-state">${icon('todos',30)}<h3>${state.todoStatus==='done'?'Ancora nessuna task completata.':'Niente in sospeso.'}</h3><p>Create una task e dividetela in passi più piccoli.</p>${state.todosMissing?'':newButton('todo','Nuova task')}</div>`}</div>`;
  }
  function renderMyTodos(){
    const uid=state.user.id,all=myTodos(uid,state.myScope),open=all.filter(x=>!x.item.done),todayKey=dateKey(today()),week=dateKey(shiftDay(today(),7));
    const late=x=>x.item.due_date&&x.item.due_date<todayKey,soon=x=>x.item.due_date&&x.item.due_date>=todayKey&&x.item.due_date<=week;
    const list=all.filter(x=>state.myStatus==='all'||(state.myStatus==='done')===!!x.item.done).sort((a,b)=>byDue(a.item,b.item)||((a.item.position||0)-(b.item.position||0)));
    const openL=list.filter(x=>!x.item.done),doneL=list.filter(x=>x.item.done);
    const buckets=[['In ritardo',openL.filter(late),'amber'],['Oggi e prossimi 7 giorni',openL.filter(soon),'blue'],['Più avanti',openL.filter(x=>x.item.due_date&&x.item.due_date>week),''],['Senza scadenza',openL.filter(x=>!x.item.due_date),''],['Completate',doneL,'green']].filter(b=>b[1].length);
    const row=x=>{const t=x.item,p=x.parent,sub=t!==p;return `<div class="task-row my-row">${todoCheck(t,!!t.done)}<div class="my-main"><span class="task-title todo-open ${t.done?'done':''}" data-action="edit-todo" data-id="${p.id}" role="button" tabindex="0" title="Apri la task">${esc(t.title)}</span><small>${sub?`${esc(p.title)} · `:''}${esc(project(p.project_id)?.name||'Studio · generale')}</small></div>${!t.owner_id?`<span class="tag purple" title="Assegnata a entrambi">${icon('users',11)}Insieme</span>`:''}<span class="my-due ${!t.done&&late(x)?'overdue-text':''}">${t.due_date?fmtDate(t.due_date):'—'}</span><button class="icon-btn" data-action="goto-todo" data-id="${p.id}" aria-label="Apri ${esc(p.title)} nelle task">${icon('arrow',13)}</button></div>`;};
    const seg=(action,cur,opts)=>`<div class="segmented">${opts.map(([k,l])=>`<button data-action="${action}" data-filter="${k}" class="${cur===k?'active':''}">${l}</button>`).join('')}</div>`;
    return heading('Le mie task',`${memberName(uid)}, ecco cosa ti aspetta. Quello che spunti qui risulta fatto anche nelle task condivise.`,'','LA TUA LISTA')+
    `<div class="overview-metrics"><div class="card metric"><div class="metric-icon">${icon('todos',18)}</div><div><div class="metric-label">Da fare</div><div class="metric-value">${String(open.length).padStart(2,'0')}<small>passi aperti</small></div></div></div><div class="card metric"><div class="metric-icon">${icon('calendar',18)}</div><div><div class="metric-label">Prossimi 7 giorni</div><div class="metric-value">${String(open.filter(soon).length).padStart(2,'0')}<small>in scadenza</small></div></div></div><div class="card metric"><div class="metric-icon">${icon('clock',18)}</div><div><div class="metric-label">In ritardo</div><div class="metric-value ${open.filter(late).length?'overdue-text':''}">${String(open.filter(late).length).padStart(2,'0')}<small>da recuperare</small></div></div></div></div>`+
    `<div class="todo-toolbar">${seg('my-status',state.myStatus,[['open','Da fare'],['done','Completate'],['all','Tutte']])}${seg('my-scope',state.myScope,[['all','Mie e condivise'],['solo','Solo mie']])}</div>`+
    (buckets.length?`<div class="todo-list">${buckets.map(([title,l,color])=>`<section class="card phase"><div class="phase-header"><div><h2>${title}</h2></div><span class="tag ${color}">${l.length}</span></div><div class="task-list">${l.map(row).join('')}</div></section>`).join('')}</div>`:`<div class="card empty-state">${icon('checkCircle',30)}<h3>${state.myStatus==='done'?'Nessuna task completata, per ora.':'Tutto fatto. Goditi il momento.'}</h3><p>Le task assegnate a te o a entrambi compariranno qui.</p><button class="btn" data-action="nav" data-view="todos">Vai alle task ${icon('arrow',12)}</button></div>`);
  }
  function todoForm(uid){
    if(uid){const any=state.todos.find(x=>x.id===uid);if(any?.parent_id)return todoForm(any.parent_id);}
    const t=uid?state.todos.find(x=>x.id===uid)||null:null,isNew=!t;
    const defProject=t?t.project_id:(!['all','studio'].includes(state.todoProject)&&project(state.todoProject)?state.todoProject:null);
    const hasSteps=t&&subtodos(t.id).length;
    const main=`<div class="todo-modal-main"><input class="todo-modal-title" name="title" value="${esc(t?.title||'')}" required maxlength="200" placeholder="Cosa c’è da fare?" aria-label="Titolo della task" autocomplete="off"><textarea class="todo-modal-notes" name="notes" maxlength="4000" placeholder="Note: contesto, link, dettagli, idee…" aria-label="Note">${esc(t?.notes||'')}</textarea><section class="todo-modal-steps"><div class="todo-modal-steps-head"><h3>Passi</h3><span class="muted">${isNew?'uno per riga · facoltativi':'spunta, rinomina o assegna direttamente qui'}</span></div>${isNew?`<textarea name="steps" class="todo-modal-stepsarea" maxlength="8000" placeholder="Wireframe&#10;Testi&#10;Animazioni" aria-label="Passi, uno per riga"></textarea><small class="muted todo-modal-hint">Dopo potrai assegnare ogni passo a Riccardo, a Stefano o a entrambi.</small>`:`<div class="task-list" id="todo-modal-steps">${todoModalSteps(t)}</div><div class="todo-modal-add"><span class="add-icon">${icon('plus',13)}</span><input data-modal-add="${t.id}" maxlength="200" placeholder="Aggiungi un passo e premi Invio…" aria-label="Nuovo passo" autocomplete="off"><select data-modal-add-owner class="task-owner" aria-label="Assegna il nuovo passo">${ownerOptions(t.owner_id)}</select><button type="button" class="btn small" data-action="modal-add-step" data-id="${t.id}">Aggiungi</button></div>`}</section></div>`;
    const side=`<aside class="todo-modal-side"><label class="field"><span>Progetto</span><select name="project_id">${projectOptions(defProject)}</select></label>${inputField('Scadenza','due_date',t?.due_date||'','date')}<label class="field"><span>${isNew?'Assegnata a · vale anche per i passi':hasSteps?'Assegnata a · i passi hanno assegnatari propri':'Assegnata a'}</span><select name="owner_id">${ownerOptions(t?.owner_id)}</select></label>${t?`<div id="todo-modal-status">${todoModalStatus(t)}</div><p class="todo-modal-meta">Creata da ${esc(memberName(t.created_by))}${t.created_at?' · '+esc(fmtDate(dateKey(new Date(t.created_at)),{day:'numeric',month:'short',year:'numeric'})):''}</p>`:''}</aside>`;
    openForm(isNew?'Una nuova task':'La task',`<div class="todo-modal">${main}${side}</div>`,async fd=>{
      const values={title:fd.get('title').trim(),notes:fd.get('notes').trim(),project_id:fd.get('project_id')||null,due_date:fd.get('due_date')||null,owner_id:fd.get('owner_id')||null};
      if(!values.title)throw new Error('Scrivi cosa c’è da fare.');
      if(t){const cur=state.todos.find(x=>x.id===t.id)||t;await update('todos',t.id,values,cur.version);notify('Task aggiornata.');return;}
      const steps=String(fd.get('steps')||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,50);
      if(steps.some(s=>s.length>200))throw new Error('Ogni passo può avere al massimo 200 caratteri.');
      const parent=await insert('todos',{...values,parent_id:null,done:false,position:0});
      try{await insertMany('todos',steps.map((title,i)=>({title,parent_id:parent.id,project_id:null,owner_id:values.owner_id,done:false,position:i})));}catch{notify('Task creata, ma i passi non sono stati salvati. Aggiungili dalla lista.',true);}
      state.view='todos';state.projectId=null;if(state.todoStatus==='done')state.todoStatus='open';notify(steps.length?`Task creata con ${steps.length} passi.`:'Task creata.');
    },{className:'modal-xl',saveLabel:isNew?'Crea task':'Salva modifiche',extra:t?`<button type="button" class="btn danger" data-action="delete-todo" data-id="${t.id}">${icon('trash',13)}Elimina</button>`:''});
    const d=$('#modal');if(t)d.dataset.todoId=t.id;if(isNew)setTimeout(()=>$('.todo-modal-title',d)?.focus(),30);
  }
  const todoModalSteps=p=>{const subs=subtodos(p.id);return subs.length?todoStepRows(subs,'m-'):`<p class="todo-modal-empty">Nessun passo per ora. Se la task è lunga, dividila qui sotto in passi più piccoli.</p>`;};
  function todoModalStatus(p){const subs=subtodos(p.id),pr=todoProgress(p),done=todoDone(p),pct=Math.round(pr.done/pr.total*100);return `<div class="progress-label"><span>${subs.length?`${pr.done} di ${pr.total} passi completati`:done?'Completata':'Da fare'}</span><strong>${pct}%</strong></div><div class="progress-track ${project(p.project_id)?.color||'blue'}"><span style="width:${pct}%"></span></div>`;}
  // Dopo ogni aggiornamento (anche dell'altro founder) i passi nella finestra aperta restano allineati.
  function refreshTodoModal(){
    const d=$('#modal'),uid=d?.dataset?.todoId;if(!d?.open||!uid)return;
    const box=$('#todo-modal-steps',d),status=$('#todo-modal-status',d),p=state.todos.find(t=>t.id===uid);if(!box||!p)return;
    const active=document.activeElement,inBox=box.contains(active),key=inBox?active.dataset.focusKey:null,val=active?.value,ss=active?.selectionStart,se=active?.selectionEnd;
    box.innerHTML=todoModalSteps(p);if(status)status.innerHTML=todoModalStatus(p);
    if(key){const el=$$('[data-focus-key]',box).find(e=>e.dataset.focusKey===key);if(el){if(el.tagName==='INPUT'&&el.type==='text'&&val!==undefined)el.value=val;el.focus({preventScroll:true});try{el.setSelectionRange(ss,se);}catch{}}}
  }
  async function addStepFromModal(pid){
    const d=$('#modal'),input=$('[data-modal-add]',d),sel=$('[data-modal-add-owner]',d),title=input?.value.trim();if(!title)return;
    if(!state.todos.some(t=>t.id===pid))return;const subs=subtodos(pid);
    input.disabled=true;
    try{await insert('todos',{title:title.slice(0,200),parent_id:pid,project_id:null,owner_id:sel?.value||null,done:false,position:subs.length?Math.max(...subs.map(x=>x.position||0))+1:0});input.value='';}
    finally{input.disabled=false;}
    renderContent(true);input.focus();
  }
  function gotoTodo(uid){state.view='todos';state.projectId=null;state.todoProject='all';state.todoStatus='all';renderContent();const c=document.getElementById('todo-'+uid);if(c)c.scrollIntoView({behavior:'smooth',block:'center'});}
  const ago=s=>{const sec=(Date.now()-new Date(s))/1000,rtf=new Intl.RelativeTimeFormat('it',{numeric:'auto'});if(sec<60)return 'adesso';if(sec<3600)return rtf.format(-Math.round(sec/60),'minute');if(sec<86400)return rtf.format(-Math.round(sec/3600),'hour');if(sec<604800)return rtf.format(-Math.round(sec/86400),'day');return fmtDate(dateKey(new Date(s)),{day:'numeric',month:'short',year:'numeric'});};
  const activityRow=a=>`<div class="activity-item">${avatar(a.actor_id)}<div><p><strong>${esc(member(a.actor_id)?.display_name||'Qualcuno')}</strong> ${esc(a.verb)} <span class="activity-title">${esc(a.title)}</span></p><small>${a.context?esc(a.context)+' · ':''}${esc(ago(a.created_at))}</small></div></div>`;
  function activityDialog(){
    const d=$('#modal');if(d.open)d.close();d.className='';
    d.innerHTML=`<div class="modal-header"><h2 id="modal-title">Cosa è successo nello studio</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Chiudi finestra">${icon('close',17)}</button></div><div class="modal-body"><div class="activity-list">${state.activity.length?state.activity.slice(0,150).map(activityRow).join(''):'<p class="muted" style="font-size:11px">Ancora nessuna attività registrata.</p>'}</div><p class="modal-description" style="font-size:10px;margin:14px 0 0">La cronologia conserva gli ultimi 120 giorni.</p></div><div class="modal-footer"><button class="btn primary" data-action="close-modal">Chiudi</button></div>`;d.showModal();
  }
  // Solo anteprima: replica le regole del database (migrations/004) per mostrare la cronologia.
  function logLocal(table,op,prev,row){
    if(!state.demo||!state.user)return;
    const r=row||prev,pname=pid=>project(pid)?.name||'';let v=null,ctx='',t=r?.title;
    if(table==='todos'){const par=state.todos.find(x=>x.id===r.parent_id);ctx=r.parent_id?par?.title||'':pname(r.project_id)||'Studio · generale';
      if(op==='insert'){if(r.parent_id&&par&&Date.now()-new Date(par.created_at)<60000)return;v=r.parent_id?'ha aggiunto il passo':'ha creato la task';}
      else if(op==='delete')v=r.parent_id?'ha eliminato il passo':'ha eliminato la task';
      else if(!!prev.done!==!!row.done)v=row.done?'ha completato':'ha riaperto';
      else if((prev.owner_id||null)!==(row.owner_id||null))v='ha assegnato a '+(member(row.owner_id)?.display_name||'entrambi');}
    else if(table==='tasks'&&op==='update'&&!!prev.done!==!!row.done){v=row.done?'ha completato l’attività':'ha riaperto l’attività';ctx=pname(row.project_id);}
    else if(table==='projects'&&op!=='update'){t=r.name;v=op==='insert'?'ha creato il progetto':'ha eliminato il progetto';}
    else if(table==='events'){if(op==='insert')v='ha pianificato';else if(op==='delete')v='ha annullato';else if(prev.start_at!==row.start_at)v='ha spostato';ctx=pname(r.project_id);}
    else if(table==='ideas'&&op==='insert')v='ha scritto l’idea';
    else if(table==='transactions'&&op==='insert'){t=r.description;v=r.type==='revenue'?'ha registrato il ricavo':'ha registrato il costo';ctx=pname(r.project_id);}
    else if(table==='resources'&&op==='insert'){v='ha aggiunto il link';ctx=pname(r.project_id);}
    if(v)state.activity.unshift({id:id(),actor_id:state.user.id,verb:v,title:t||'',context:ctx||'',created_at:new Date().toISOString()});
  }
  const RESOURCE_KINDS={repo:['Repository','code'],design:['Design','sparkles'],store:['Store','globe'],docs:['Documenti','book'],folder:['Cartella','projects'],other:['Altro','link']};
  const hostOf=u=>{try{return new URL(u).hostname.replace(/^www\./,'');}catch{return '';}};
  function resourcesPanel(p){
    const list=state.resources.filter(r=>r.project_id===p.id).sort((a,b)=>(a.created_at||'').localeCompare(b.created_at||''));
    const body=state.missing.resources?`<p class="muted" style="font-size:11px">Per attivare le risorse eseguite <code>migrations/004_resources_activity.sql</code> nel SQL Editor di Supabase.</p>`:list.length?`<div class="resource-list">${list.map(r=>`<div class="resource-item"><span class="resource-icon">${icon(RESOURCE_KINDS[r.kind]?.[1]||'link',16)}</span><a href="${esc(safeURL(r.url))}" target="_blank" rel="noopener noreferrer"><strong>${esc(r.title)}</strong><small>${esc(RESOURCE_KINDS[r.kind]?.[0]||'Link')} · ${esc(hostOf(r.url))}</small></a><button class="icon-btn" data-action="edit-resource" data-id="${r.id}" aria-label="Modifica ${esc(r.title)}">${icon('more',15)}</button></div>`).join('')}</div>`:`<p class="muted" style="font-size:11px">Repository, Figma, pagina sullo store, cartella delle icone: tutto a un clic. Solo link, le password restano nel vostro password manager.</p>`;
    return `<section class="card resources-panel"><div class="section-head"><h2>Risorse</h2>${state.missing.resources?'':`<button class="btn small" data-action="new-resource" data-id="${p.id}">${icon('plus',12)}Aggiungi link</button>`}</div>${body}</section>`;
  }
  function resourceForm(uid,projectId){
    const r=state.resources.find(x=>x.id===uid);
    openForm(r?'Modifica il link':'Un nuovo link utile.',`<div class="form-grid"><div class="full">${inputField('Nome','title',r?.title||'','text','required maxlength="120" placeholder="Es. Repository GitHub, Figma, App Store…"')}</div><div class="full">${inputField('Link','url',r?.url||'','url','required maxlength="2000" placeholder="https://…"')}</div><label class="field"><span>Tipo</span><select name="kind">${Object.entries(RESOURCE_KINDS).map(([k,[l]])=>`<option value="${k}" ${(r?.kind||'other')===k?'selected':''}>${l}</option>`).join('')}</select></label><label class="field"><span>Progetto</span><select name="project_id" required>${state.projects.map(p=>`<option value="${p.id}" ${p.id===(r?.project_id||projectId)?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label></div><p class="modal-description" style="font-size:10px;margin-bottom:0">Non inserite password o chiavi nei link: chiunque nello studio può vederli.</p>`,async fd=>{
      const url=String(fd.get('url')||'').trim();if(!safeURL(url))throw new Error('Inserisci un link che inizi con https:// oppure http://.');
      const values={title:fd.get('title').trim(),url,kind:fd.get('kind'),project_id:fd.get('project_id')};if(!values.title)throw new Error('Dai un nome al link.');
      if(r)await update('resources',uid,values,r.version);else await insert('resources',values);notify(r?'Link aggiornato.':'Link aggiunto alle risorse.');
    },{saveLabel:r?'Salva modifiche':'Aggiungi link',extra:r?`<button type="button" class="btn danger" data-action="delete-resource" data-id="${r.id}">${icon('trash',13)}Elimina</button>`:''});
  }
  function renderSettings(){
    return heading('Lo studio','Le persone, i dati e le piccole impostazioni che contano.')+`<div class="settings-grid"><section class="card settings-panel"><span class="tag blue">SHININGBULBS</span><h2 style="margin-top:17px">Due founder. Uno spazio.</h2><p>Accessi personali, progetti condivisi e idee che mantengono la firma di chi le ha scritte.</p><div class="member-list">${state.members.map(m=>`<div class="member-item">${avatar(m.id)}${esc(m.display_name)}<span class="tag">Founder</span></div>`).join('')}</div>${state.demo?`<div style="margin-top:25px"><p style="font-size:11px">Nell’anteprima puoi cambiare profilo per provare le firme:</p><div class="row">${state.members.map(m=>`<button class="btn small" data-action="demo-user" data-id="${m.id}">${avatar(m.id)}${esc(m.display_name)}</button>`).join('')}</div></div>`:''}</section><section class="card settings-panel"><h2>Il vostro database</h2><p>${state.demo?'Questa anteprima usa soltanto dati di esempio in memoria. I dati reali si salvano nel database condiviso dopo la configurazione.':'I dati dello studio sono salvati su Supabase. Se all’accesso hai scelto “Resta collegato”, la sessione resta su questo dispositivo finché non esci; altrimenti, ricaricando la pagina, dovrai accedere di nuovo.'}</p><span class="tag ${state.demo?'amber':state.connected?'green':'amber'}"><i class="dot"></i>${state.demo?'Anteprima · sincronizzazione da attivare':state.connected?'Database collegato':'Connessione in ripristino'}</span><div style="margin-top:22px"><button class="btn" data-action="setup">${icon('cloud',15)}Guida alla configurazione</button></div></section><section class="card settings-panel"><h2>I dati, anche fuori dallo studio.</h2><p>Scarica un’istantanea JSON di progetti, attività, idee, calendario e movimenti. Le password e le sessioni di accesso sono escluse.</p><button class="btn" data-action="export-all">${icon('download',15)}Esporta tutti i dati</button></section><section class="card settings-panel"><h2>Aspetto</h2><p>Automatico segue il tema chiaro o scuro del dispositivo. La scelta vale solo su questo dispositivo.</p>${themeSwitch()}</section><section class="card settings-panel"><h2>Le cose semplici, più veloci.</h2><p>Usa <strong>⌘ K / Ctrl K</strong> per cercare nello studio e <strong>⌘ ⇧ N / Ctrl ⇧ N</strong> per creare un elemento nella sezione aperta. Puoi installare il sito come web app dal browser.</p><span class="tag">Connessione Internet necessaria</span></section></div>`;
  }
  function closeModal(){const d=$('#modal');if(d.open)d.close();d.innerHTML='';delete d.dataset.todoId;delete d.dataset.ideaId;}
  function openForm(title,body,onSave,options={}){
    const d=$('#modal');if(d.open)d.close();d.className=options.className||'';delete d.dataset.todoId;delete d.dataset.ideaId;
    d.innerHTML=`<form id="dialog-form"><div class="modal-header"><h2 id="modal-title">${esc(title)}</h2><button class="icon-btn" data-action="close-modal" type="button" aria-label="Chiudi finestra">${icon('close',17)}</button></div><div class="modal-body">${body}<p class="form-error" role="alert"></p></div><div class="modal-footer">${options.extra||''}<button class="btn" type="button" data-action="close-modal">Annulla</button><button class="btn ${options.danger?'danger':'primary'}" type="submit">${esc(options.saveLabel||'Salva')}</button></div></form>`;
    $('#dialog-form',d).addEventListener('submit',async e=>{
      e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const btn=$('[type=submit]',form);btn.disabled=true;const txt=btn.textContent;btn.textContent='Salvataggio…';$('.form-error',form).textContent='';
      try{await onSave(new FormData(form),form);if(d.contains(form))closeModal();if(state.user)renderContent(true);}catch(err){$('.form-error',form).textContent=err.message==='CONFLICT'?'Questo elemento è stato modificato. Riaprilo per vedere la versione aggiornata.':err.message;btn.disabled=false;btn.textContent=txt;}
    });d.showModal();
  }
  function confirmDialog(title,text,onConfirm,label='Elimina'){
    openForm(title,`<p class="modal-description">${esc(text)}</p>`,async()=>{await onConfirm();},{saveLabel:label,danger:true});
  }
  const inputField=(label,name,value='',type='text',extra='')=>`<label class="field"><span>${label}</span><input type="${type}" name="${name}" value="${esc(value)}" ${extra}></label>`;
  function projectForm(uid){
    const p=project(uid),isNew=!p;
    openForm(isNew?'Accendete una nuova idea.':'I dettagli del progetto',`<p class="modal-description">${isNew?'Un nome, una direzione e il vostro prossimo progetto prende forma. Le 11 attività del percorso saranno già pronte.':'Le attività e i loro responsabili si gestiscono direttamente nella roadmap.'}</p><div class="form-grid"><div class="full">${inputField('Nome dell’app','name',p?.name||'','text','required maxlength="80" placeholder="Come si chiamerà?"')}</div><label class="field full"><span>In poche parole</span><textarea name="description" maxlength="800" style="min-height:75px" placeholder="L’idea dietro l’app…">${esc(p?.description||'')}</textarea></label><label class="field"><span>Responsabile del progetto</span><select name="owner_id">${ownerOptions(p?.owner_id)}</select></label>${inputField('Scadenza indicativa','due_date',p?.due_date||'','date')}<label class="field"><span>Piattaforma</span><select name="platform">${['iOS','Android','iOS e Android','Web','Da definire'].map(v=>`<option ${v===(p?.platform||'iOS e Android')?'selected':''}>${v}</option>`).join('')}</select></label><label class="field"><span>Colore</span><select name="color">${Object.keys(COLORS).map((c,i)=>`<option value="${c}" ${(p?.color||'blue')===c?'selected':''}>${['Blu cielo','Lavanda','Salvia','Sabbia'][i]}</option>`).join('')}</select></label><label class="field full"><span>Icona</span><select name="icon">${[['code','Sviluppo'],['book','Lettura e apprendimento'],['heart','Ricordi e relazioni'],['wallet','Finanze'],['globe','Esplorazione'],['sparkles','Creatività']].map(([v,l])=>`<option value="${v}" ${v===(p?.icon||'code')?'selected':''}>${l}</option>`).join('')}</select></label></div>`,async fd=>{
      const values={name:fd.get('name').trim(),description:fd.get('description').trim(),owner_id:fd.get('owner_id')||null,due_date:fd.get('due_date')||null,platform:fd.get('platform'),color:fd.get('color'),icon:fd.get('icon')};
      if(!values.name)throw new Error('Dai un nome al progetto.');
      if(isNew){
        if(state.demo){const row=await insert('projects',values);let n=0;for(const [stage,st]of STAGES.entries())for(const title of st.tasks)state.tasks.push({id:id(),project_id:row.id,title,stage,position:n++,done:false,owner_id:values.owner_id,due_date:null,version:1});state.projectId=row.id;}
        else{const {data,error}=await state.client.rpc('create_project_with_tasks',{p_name:values.name,p_description:values.description,p_owner:values.owner_id,p_due:values.due_date,p_platform:values.platform,p_color:values.color,p_icon:values.icon});if(error)throw new Error('Creazione non riuscita. Controlla che database.sql sia stato eseguito.');await loadRemote();state.projectId=data;}
        state.view='projects';notify('Un nuovo progetto è pronto a prendere forma.');
      }else{await update('projects',uid,values,p.version);notify('Dettagli del progetto aggiornati.');}
    },{saveLabel:isNew?'Crea progetto':'Salva modifiche',extra:p?`<button type="button" class="btn danger" data-action="delete-project" data-id="${p.id}">${icon('trash',13)}Elimina</button>`:''});
  }
  function eventForm(uid,defaults={}){
    const ev=state.events.find(e=>e.id===uid),st=ev?new Date(ev.start_at):null,en=ev?new Date(ev.end_at):null;
    const dt=st?dateKey(st):defaults.date||dateKey(today());const time=st?`${String(st.getHours()).padStart(2,'0')}:${String(st.getMinutes()).padStart(2,'0')}`:defaults.time||'10:00';
    const mins=Number(time.slice(0,2))*60+Number(time.slice(3)),endM=Math.min(mins+60,1439);const endTime=en?`${String(en.getHours()).padStart(2,'0')}:${String(en.getMinutes()).padStart(2,'0')}`:`${String(Math.floor(endM/60)).padStart(2,'0')}:${String(endM%60).padStart(2,'0')}`;
    openForm(ev?'Un momento per confrontarsi.':'Pianificate il prossimo incontro.',`<div class="form-grid"><div class="full">${inputField('Titolo','title',ev?.title||'','text','required maxlength="120" placeholder="Di cosa parliamo?"')}</div><div class="full">${inputField('Giorno','date',dt,'date','required')}</div>${inputField('Dalle','start',time,'time','required')}${inputField('Alle','end',endTime,'time','required')}<label class="field full"><span>Progetto</span><select name="project_id">${projectOptions(ev?.project_id||defaults.project)}</select></label><label class="field full"><span>Agenda e punti da discutere</span><textarea name="agenda" maxlength="6000" placeholder="Obiettivi, decisioni da prendere, cose da portare al tavolo…" style="min-height:115px">${esc(ev?.agenda||'')}</textarea></label><div class="full">${inputField('Link della call · facoltativo','meeting_url',ev?.meeting_url||'','url','placeholder="https://meet.google.com/…" maxlength="2000"')}</div></div><div class="row" style="font-size:11px;color:#99a7be">${avatars(null)}Riccardo e Stefano · orari locali</div>${ev?.meeting_url?`<a class="btn small" style="margin-top:15px" target="_blank" rel="noopener noreferrer" href="${esc(safeURL(ev.meeting_url))}">${icon('link',13)}Apri la call</a>`:''}`,async fd=>{
      const start=new Date(`${fd.get('date')}T${fd.get('start')}`),end=new Date(`${fd.get('date')}T${fd.get('end')}`);
      if(!(end>start))throw new Error('L’orario di fine deve essere successivo a quello di inizio.');
      const link=fd.get('meeting_url').trim();if(link&&!safeURL(link))throw new Error('Inserisci un link che inizi con https:// oppure http://.');
      const values={title:fd.get('title').trim(),start_at:start.toISOString(),end_at:end.toISOString(),agenda:fd.get('agenda').trim(),project_id:fd.get('project_id')||null,meeting_url:link};
      if(!values.title)throw new Error('Inserisci un titolo per l’incontro.');
      if(ev)await update('events',uid,values,ev.version);else await insert('events',{...values,created_by:state.user.id});notify(ev?'Incontro aggiornato.':'Incontro aggiunto al calendario.');
    },{saveLabel:ev?'Salva modifiche':'Aggiungi incontro',extra:ev?`<button class="btn danger" type="button" data-action="delete-event" data-id="${ev.id}" aria-label="Elimina incontro">${icon('trash',13)}</button><button class="btn" type="button" data-action="download-event" data-id="${ev.id}" aria-label="Esporta incontro">${icon('download',13)}</button>`:''});
  }
  const ideaConflict=(n,draft)=>draft?.conflict?`<div class="note-conflict"><strong>${draft.theirsBy&&draft.theirsBy!==state.user.id?esc(memberName(draft.theirsBy))+' ha modificato le stesse parole mentre scrivevi.':'L’idea è cambiata durante la scrittura.'}</strong> Nessun testo è andato perso: qui sopra c’è il tuo.${typeof draft.theirs==='string'?`<details><summary>Vedi l’altra versione</summary><pre>${esc(draft.theirs)}</pre></details>`:''}<div class="note-conflict-actions"><button class="btn small primary" data-action="keep-mine" data-id="${n.id}">Tieni il mio</button>${typeof draft.theirs==='string'?`<button class="btn small" data-action="keep-theirs" data-id="${n.id}">Tieni l’altra</button>`:''}<button class="btn small" data-action="copy-draft" data-id="${n.id}">Salva il mio come nuova idea</button></div></div>`:draft?.failed?`<div class="note-conflict">Connessione non disponibile. Il testo è ancora qui.<br><button class="btn small" data-action="retry-note" data-id="${n.id}" style="margin-top:6px">Riprova il salvataggio</button></div>`:'';
  const colorOptions=v=>Object.keys(COLORS).map((c,i)=>`<option value="${c}" ${(v||'blue')===c?'selected':''}>${['Blu cielo','Lavanda','Salvia','Sabbia'][i]}</option>`).join('');
  function ideaForm(uid){
    if(uid)return ideaModal(uid);
    const defProject=state.ideaFilter!=='all'&&project(state.ideaFilter)?state.ideaFilter:null;
    openForm('Ogni grande app inizia così.',`<div class="todo-modal"><div class="todo-modal-main"><input class="todo-modal-title" name="title" required maxlength="120" placeholder="Un titolo per ritrovarla" aria-label="Titolo dell’idea" autocomplete="off"><textarea class="todo-modal-notes idea-modal-text" name="content" maxlength="20000" placeholder="Scrivi liberamente. Qui c’è spazio per tutto." aria-label="L’idea"></textarea></div><aside class="todo-modal-side"><label class="field"><span>Collegata a</span><select name="project_id">${projectOptions(defProject)}</select></label><label class="field"><span>Colore</span><select name="color">${colorOptions('blue')}</select></label><p class="todo-modal-meta">L’idea porterà la firma di ${esc(memberName(state.user.id))}. Potrete modificarla entrambi.</p></aside></div>`,async fd=>{
      const values={title:fd.get('title').trim(),project_id:fd.get('project_id')||null,color:fd.get('color'),updated_by:state.user.id};if(!values.title)throw new Error('Dai un titolo all’idea.');
      await insert('ideas',{...values,content:fd.get('content'),created_by:state.user.id});state.ideaFilter='all';notify('Una nuova idea nello studio.');
    },{className:'modal-xl',saveLabel:'Aggiungi idea'});
    setTimeout(()=>$('#modal .todo-modal-title')?.focus(),30);
  }
  const ideaMeta=n=>`Idea di ${esc(memberName(n.created_by))}${n.updated_by&&n.updated_by!==n.created_by?` · modificata da ${esc(memberName(n.updated_by))}`:''}`;
  const ideaStatus=(n,draft)=>draft?.conflict?'Da risolvere':draft?.saving?'Salvataggio…':draft?.dirty?'Da salvare':state.demo?'Temporanea':'Salvata';
  // Finestra grande per leggere e scrivere un'idea: tutto si salva da solo, come nella card.
  function ideaModal(uid){
    const n=state.ideas.find(i=>i.id===uid);if(!n)return;
    const draft=state.drafts.get(uid),d=$('#modal');if(d.open)d.close();d.className='modal-xl';delete d.dataset.todoId;
    d.innerHTML=`<div class="modal-header"><span class="tag ${n.color||'blue'}" id="idea-modal-tag">${n.project_id?esc(project(n.project_id)?.name||'Studio'):'Pensieri sparsi'}</span><button type="button" class="icon-btn" data-action="close-modal" aria-label="Chiudi finestra">${icon('close',17)}</button></div><div class="modal-body"><div class="todo-modal"><div class="todo-modal-main"><input class="todo-modal-title" value="${esc(n.title)}" maxlength="120" data-idea-field="title" data-id="${n.id}" aria-label="Titolo dell’idea" autocomplete="off"><span class="typing-indicator ${state.typing.has(n.id)?'active':''}" data-typing-for="${n.id}" aria-live="polite">${esc(typingLabel(n.id))}</span><textarea class="todo-modal-notes idea-modal-text" data-note-id="${n.id}" data-focus-key="m-note-${n.id}" maxlength="20000" placeholder="Scrivi liberamente. Qui c’è spazio per tutto." aria-label="Testo: ${esc(n.title)}">${esc(draft?draft.content:n.content)}</textarea><div id="idea-modal-conflict">${ideaConflict(n,draft)}</div></div><aside class="todo-modal-side"><label class="field"><span>Collegata a</span><select data-idea-field="project_id" data-id="${n.id}">${projectOptions(n.project_id)}</select></label><label class="field"><span>Colore</span><select data-idea-field="color" data-id="${n.id}">${colorOptions(n.color)}</select></label><p class="todo-modal-meta" id="idea-modal-meta">${ideaMeta(n)}</p><p class="idea-modal-save">${icon('cloud',13)}<span class="save-status" data-save-status="${n.id}">${ideaStatus(n,draft)}</span></p><p class="todo-modal-meta">Il testo si salva da solo mentre scrivi. Se scrivete insieme, le modifiche vengono unite.</p></aside></div></div><div class="modal-footer"><button type="button" class="btn danger" data-action="delete-idea" data-id="${n.id}">${icon('trash',13)}Elimina</button><button type="button" class="btn primary" data-action="close-modal">Fatto ${icon('check',14)}</button></div>`;
    d.dataset.ideaId=n.id;d.showModal();
    const ta=$('textarea[data-note-id]',d);setTimeout(()=>{ta.focus();try{ta.setSelectionRange(ta.value.length,ta.value.length);}catch{}},30);
  }
  // Tiene allineata la finestra aperta con le modifiche arrivate (dell'altro founder o salvate altrove).
  function refreshIdeaModal(){
    const d=$('#modal'),uid=d?.dataset?.ideaId;if(!d?.open||!uid)return;
    const n=state.ideas.find(i=>i.id===uid);if(!n)return;
    const draft=state.drafts.get(uid),ta=$('textarea[data-note-id]',d);
    if(ta&&!draft&&ta.value!==n.content){const focused=document.activeElement===ta,old=ta.value,s=ta.selectionStart,e=ta.selectionEnd;ta.value=n.content;if(focused){try{ta.setSelectionRange(mapCursor(old,n.content,s),mapCursor(old,n.content,e));}catch{}}}
    const c=$('#idea-modal-conflict',d);if(c)c.innerHTML=ideaConflict(n,draft);
    for(const el of $$('[data-idea-field]',d)){const f=el.dataset.ideaField,v=n[f]||'';if(document.activeElement!==el&&el.value!==v)el.value=v;}
    const tag=$('#idea-modal-tag',d);if(tag){tag.className=`tag ${n.color||'blue'}`;tag.textContent=n.project_id?project(n.project_id)?.name||'Studio':'Pensieri sparsi';}
    const meta=$('#idea-modal-meta',d);if(meta)meta.innerHTML=ideaMeta(n);
    const st=$('[data-save-status]',d);if(st)st.textContent=ideaStatus(n,draft);
  }
  async function saveIdeaField(el){
    const n=state.ideas.find(i=>i.id===el.dataset.id);if(!n)return;const f=el.dataset.ideaField;let v=el.value;
    if(f==='title'){v=v.trim();if(!v){el.value=n.title;return;}}
    if(f==='project_id')v=v||null;
    if((n[f]||null)===(v||null))return;
    const saved=await update('ideas',n.id,{[f]:v,updated_by:state.user.id});
    const draft=state.drafts.get(n.id);if(draft&&!draft.saving&&!draft.conflict&&draft.baseVersion===n.version)draft.baseVersion=saved.version;
    renderContent(true);
  }
  function transactionForm(uid){
    const t=state.transactions.find(i=>i.id===uid);
    openForm(t?'Modifica il movimento':'Un nuovo movimento.',`<div class="form-grid"><label class="field full"><span>Tipo di movimento</span><select name="type" id="movement-type"><option value="revenue" ${t?.type==='revenue'?'selected':''}>Ricavo</option><option value="cost" ${t?.type!=='revenue'?'selected':''}>Costo</option></select></label><div class="full">${inputField('Descrizione','description',t?.description||'','text','required maxlength="160" placeholder="Es. Vendite App Store, ChatGPT…"')}</div>${inputField('Importo · EUR','amount',t?.amount||'','number','required min="0.01" max="9999999999.99" step="0.01" placeholder="0,00"')}${inputField('Data','date',t?.date||dateKey(today()),'date','required')}<label class="field"><span>App / progetto</span><select name="project_id">${projectOptions(t?.project_id)}</select></label><label class="field"><span id="payer-label">Pagato da</span><select name="member_id" required>${ownerOptions(t?.member_id||state.user.id,false)}</select></label><label class="field full" id="category-field"><span>Categoria di costo</span><select name="category">${Object.keys(CATEGORIES).filter(c=>c!=='revenue').map(c=>`<option value="${c}" ${c===(t?.category||'ai')?'selected':''}>${esc(CATEGORIES[c])}</option>`).join('')}</select></label></div><p class="modal-description" style="font-size:10px;margin-bottom:0">Inserite l’importo effettivamente incassato o pagato. Ogni movimento vale una sola volta; gli abbonamenti vanno registrati a ogni addebito.</p>`,async fd=>{
      const type=fd.get('type'),amount=Number(fd.get('amount'));
      if(!Number.isFinite(amount)||amount<=0||amount>9999999999.99)throw new Error('Inserisci un importo positivo valido.');
      if(type==='revenue'&&!fd.get('project_id'))throw new Error('Associa il ricavo a un progetto.');
      const values={type,description:fd.get('description').trim(),amount:Math.round(amount*100)/100,date:fd.get('date'),project_id:fd.get('project_id')||null,member_id:fd.get('member_id'),category:type==='revenue'?'revenue':fd.get('category')};if(!values.description)throw new Error('Inserisci una descrizione.');
      if(t)await update('transactions',uid,values,t.version);else await insert('transactions',values);notify(t?'Movimento aggiornato.':'Movimento registrato.');
    },{saveLabel:t?'Salva modifiche':'Registra movimento',extra:t?`<button type="button" class="btn danger" data-action="delete-transaction" data-id="${t.id}">${icon('trash',13)}Elimina</button>`:''});
    const updateType=()=>{const isRev=$('#movement-type').value==='revenue';$('#category-field').hidden=isRev;$('#payer-label').textContent=isRev?'Incassato da':'Pagato da';};$('#movement-type').addEventListener('change',updateType);updateType();
  }
  const feedURL=(token,scheme='https')=>{const base=(window.SHININGBULBS_CONFIG?.supabaseUrl||'').replace(/\/$/,'').replace(/^https:\/\//,'');return `${scheme}://${base}/functions/v1/calendar?token=${encodeURIComponent(token)}`;};
  async function iphoneCalendarDialog(rotate=false){
    const d=$('#modal');if(d.open)d.close();d.className='';
    const frame=body=>`<div class="modal-header"><h2 id="modal-title">Il calendario, anche sull’iPhone.</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Chiudi finestra">${icon('close',17)}</button></div><div class="modal-body">${body}</div><div class="modal-footer"><button class="btn primary" data-action="close-modal">Fatto ${icon('check',14)}</button></div>`;
    if(state.demo){d.innerHTML=frame(`<p class="modal-description">Nello studio condiviso ognuno ha un link personale da aggiungere al Calendario dell’iPhone o del Mac: gli incontri compaiono lì e si aggiornano da soli. Nell’anteprima non c’è un database, quindi il link non è disponibile.</p>`);d.showModal();return;}
    d.innerHTML=frame(`<div class="loading-page" style="min-height:120px"><div class="spinner"></div></div>`);if(!d.open)d.showModal();
    try{
      const {data:token,error}=await state.client.rpc(rotate?'rotate_calendar_token':'my_calendar_token');
      if(error||!token)throw new Error('Il link non è ancora attivo. Eseguite migrations/003_calendar_feed.sql e pubblicate la funzione “calendar” (vedi README).');
      const web=feedURL(token),cal=feedURL(token,'webcal');
      d.innerHTML=frame(`<p class="modal-description">Gli incontri del gestionale e le tue task con scadenza compaiono nel Calendario dell’iPhone e si aggiornano da soli. Le task spariscono quando le completi. Il collegamento è in sola lettura: gli incontri si creano e si modificano qui.</p><a class="btn primary" href="${esc(cal)}" style="width:100%;justify-content:center">${icon('calendar',15)}Iscriviti dall’iPhone o dal Mac</a><ol class="setup-steps" style="margin-top:18px"><li><strong>Apri questa pagina sull’iPhone</strong> e tocca il pulsante qui sopra, poi conferma “Iscriviti”.</li><li><strong>In alternativa</strong> copia il link e incollalo in Impostazioni → Calendario → Account → Aggiungi account → Altro → Aggiungi calendario in abbonamento.</li><li><strong>Aggiornamenti:</strong> l’iPhone ricarica il calendario periodicamente, non all’istante.</li></ol><label class="field" style="margin-top:6px"><span>Il tuo link personale · trattalo come una password</span><input readonly value="${esc(web)}" id="feed-url"></label><div class="row" style="flex-wrap:wrap"><button class="btn small" type="button" data-action="copy-feed">${icon('link',12)}Copia link</button><button class="btn small danger" type="button" data-action="rotate-feed">Genera un nuovo link</button></div><p class="modal-description" style="font-size:10px;margin:12px 0 0">Generando un nuovo link quello vecchio smette subito di funzionare: dovrai iscriverti di nuovo dall’iPhone.</p>`);
      if(rotate)notify('Nuovo link creato. Quello precedente non funziona più.');
    }catch(err){d.innerHTML=frame(`<p class="modal-description">${esc(err.message)}</p>`);}
  }
  function setupDialog(){
    const d=$('#modal');if(d.open)d.close();d.className='';d.innerHTML=`<div class="modal-header"><h2 id="modal-title">Lo studio, davvero condiviso.</h2><button type="button" class="icon-btn" data-action="close-modal" aria-label="Chiudi finestra">${icon('close',17)}</button></div><div class="modal-body"><p class="modal-description">Il sito è pronto per GitHub Pages. Per attivare accessi personali, salvataggio e aggiornamenti tra i vostri PC, serve un progetto Supabase di vostra proprietà.</p><ol class="setup-steps"><li><strong>Crea un progetto su <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>.</strong> Usa un database dedicato a ShiningBulbs.</li><li><strong>Esegui database.sql</strong> nel SQL Editor. Crea poi i vostri due utenti in Authentication → Users.</li><li><strong>Autorizza i due account</strong> inserendo i loro UUID nella tabella <code>members</code>, con i nomi Riccardo e Stefano. Il file SQL contiene il modello.</li><li><strong>Compila config.js</strong> con Project URL e chiave <code>sb_publishable_…</code>. Le password restano personali e non vanno nel codice.</li><li><strong>Carica i file su GitHub Pages.</strong> Accedete dai vostri PC e provate una modifica da entrambe le finestre.</li></ol><p class="modal-description" style="font-size:11px;margin-bottom:0">La guida README accompagna il codice scaricabile. L’anteprima ospitata qui è privata e resta separata dal vostro sito GitHub.</p></div><div class="modal-footer"><button class="btn primary" data-action="close-modal">Ho capito ${icon('check',14)}</button></div>`;d.showModal();
  }
  function download(filename,text,type='application/json'){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  const csvCell=v=>{let s=String(v??'');if(typeof v!=='number'&&/^[\s]*[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
  function exportFinance(){const data=[['Data','Descrizione','Tipo','Progetto','Categoria','Pagato/incassato da','Importo EUR'],...filterTransactions().sort((a,b)=>b.date.localeCompare(a.date)).map(t=>[t.date,t.description,t.type==='revenue'?'Ricavo':'Costo',project(t.project_id)?.name||'Studio',CATEGORIES[t.category]||'Altro',memberName(t.member_id),t.type==='revenue'?Number(t.amount):-Number(t.amount)])];download(`ShiningBulbs-movimenti-${dateKey(today())}.csv`,'\uFEFF'+data.map(r=>r.map(csvCell).join(';')).join('\r\n'),'text/csv;charset=utf-8');notify('Movimenti esportati.');}
  const icsEscape=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\r/g,'').replace(/\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  const utcDate=s=>new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  function foldICS(line){let out='',part='',length=0;for(const char of line){const size=new TextEncoder().encode(char).length;if(length+size>73){out+=part+'\r\n ';part='';length=1;}part+=char;length+=size;}return out+part;}
  function calendarICS(events){const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ShiningBulbs//Studio//IT','CALSCALE:GREGORIAN'];for(const e of events)lines.push('BEGIN:VEVENT',`UID:${e.id}@shiningbulbs`,`DTSTAMP:${utcDate(new Date())}`,`DTSTART:${utcDate(e.start_at)}`,`DTEND:${utcDate(e.end_at)}`,`SUMMARY:${icsEscape(e.title)}`,`DESCRIPTION:${icsEscape(e.agenda)}`,...(safeURL(e.meeting_url)?[`URL:${safeURL(e.meeting_url)}`]:[]),'END:VEVENT');lines.push('END:VCALENDAR');return lines.map(foldICS).join('\r\n')+'\r\n';}
  function exportCalendar(uid){const list=uid?state.events.filter(e=>e.id===uid):state.events;if(!list.length){notify('Non ci sono ancora incontri da esportare.');return;}download(uid?'ShiningBulbs-incontro.ics':'ShiningBulbs-calendario.ics',calendarICS(list),'text/calendar;charset=utf-8');notify('Calendario esportato.');}
  function exportAll(){const data={format:'shiningbulbs-studio-v1',exported_at:new Date().toISOString(),preview:state.demo,members:state.members};TABLES.forEach(t=>data[t]=state[t]);download(`ShiningBulbs-${dateKey(today())}.json`,JSON.stringify(data,null,2));notify('I dati dello studio sono stati esportati.');}
  function searchDialog(){
    const d=$('#modal');if(d.open)d.close();d.className='search-modal';d.innerHTML=`<div class="modal-header" style="padding-bottom:0"><h2 id="modal-title" style="font-size:14px">Cerca nello studio</h2><button class="icon-btn" data-action="close-modal" aria-label="Chiudi ricerca">${icon('close',15)}</button></div><input id="studio-search" type="search" placeholder="Progetti, task, idee, incontri…" aria-label="Cerca nello studio" autocomplete="off"><div class="search-results"></div>`;d.showModal();const input=$('#studio-search');
    const search=()=>{const q=input.value.trim().toLocaleLowerCase('it');if(!q){$('.search-results',d).innerHTML='<p class="search-hint">Inizia a scrivere per ritrovare un’idea o il prossimo passo.</p>';return;}
      const results=[...state.projects.map(p=>({title:p.name,detail:'Progetto',text:p.description,type:'project',id:p.id})),...state.tasks.map(t=>({title:t.title,detail:project(t.project_id)?.name||'Attività',text:'',type:'project',id:t.project_id})),...state.resources.map(x=>({title:x.title,detail:'Link · '+(project(x.project_id)?.name||''),text:x.url,type:'project',id:x.project_id})),...state.todos.map(t=>({title:t.title,detail:'Task · '+(t.parent_id?state.todos.find(x=>x.id===t.parent_id)?.title||'':project(t.project_id)?.name||'Studio'),text:t.notes||'',type:'todo',id:t.parent_id||t.id})),...state.ideas.map(n=>({title:n.title,detail:'Idea · '+memberName(n.created_by),text:n.content,type:'idea',id:n.id})),...state.events.map(e=>({title:e.title,detail:'Incontro · '+fmtDate(dateKey(new Date(e.start_at))),text:e.agenda,type:'event',id:e.id}))].filter(r=>(r.title+' '+r.text).toLocaleLowerCase('it').includes(q)).slice(0,20);
      $('.search-results',d).innerHTML=results.length?results.map(r=>`<button class="search-result" data-action="search-result" data-type="${r.type}" data-id="${r.id}">${icon(r.type==='todo'?'todos':r.type==='project'?'projects':r.type==='idea'?'ideas':'calendar',17)}<span>${esc(r.title)}<small>${esc(r.detail)}</small></span>${icon('arrow',13)}</button>`).join(''):'<p class="search-hint">Nessun risultato. Magari è la prossima idea da aggiungere.</p>';
    };input.addEventListener('input',search);search();setTimeout(()=>input.focus(),10);
  }
  async function deleteItem(kind,uid){
    const table={project:'projects',event:'events',idea:'ideas',transaction:'transactions',todo:'todos',resource:'resources'}[kind];
    const labels={resource:['Eliminare questo link?','Il link sarà rimosso dalle risorse del progetto.'],todo:['Eliminare questa task?','La task e tutti i suoi passi saranno eliminati per entrambi.'],project:['Eliminare questo progetto?','La roadmap, le attività e le task del progetto saranno eliminate. Idee, incontri e movimenti resteranno nello studio, senza un progetto associato.'],event:['Eliminare questo incontro?','L’incontro sarà rimosso dal calendario condiviso.'],idea:['Eliminare questa idea?','L’idea e il suo testo saranno eliminati per entrambi, compresi eventuali testi non salvati in questa finestra.'],transaction:['Eliminare questo movimento?','Il movimento sarà eliminato e i totali saranno ricalcolati.']};
    confirmDialog(...labels[kind],async()=>{await remove(table,uid);if(kind==='project')state.projectId=null;if(kind==='idea'){clearTimeout(state.noteTimers.get(uid));state.drafts.delete(uid);}notify('Elemento eliminato.');});
  }
  async function handleAction(el,event){
    const a=el.dataset.action,uid=el.dataset.id;
    if(a==='demo'){closeModal();startDemo();return;}
    if(a==='setup'){setupDialog();return;}
    if(a==='close-modal'){closeModal();return;}
    if(!state.user)return;
    switch(a){
      case 'more-menu':moreSheet();break;
      case 'modal-add-step':await addStepFromModal(uid);break;
      case 'set-theme':setTheme(el.dataset.themeValue);$$('[data-action=set-theme]').forEach(b=>b.classList.toggle('active',b.dataset.themeValue===themePref()));break;
      case 'nav':closeModal();state.view=el.dataset.view;state.projectId=null;if(state.view==='ideas')state.ideaFilter='all';renderContent();window.scrollTo(0,0);break;
      case 'logout':await logout();break;
      case 'new-project':projectForm();break;
      case 'edit-project':projectForm(uid);break;
      case 'open-project':state.view='projects';state.projectId=uid;closeModal();renderContent();window.scrollTo(0,0);break;
      case 'back-projects':state.projectId=null;renderContent();break;
      case 'project-filter':state.filter=el.dataset.filter;renderContent(true);break;
      case 'toggle-task':{
        const t=state.tasks.find(t=>t.id===uid);if(!t)break;el.disabled=true;
        try{await update('tasks',uid,{done:!t.done},t.version);renderContent(true);}catch(e){el.disabled=false;if(e.message==='CONFLICT'){if(!state.demo)await loadRemote();renderContent(true);notify('Attività già modificata: ora vedi la versione aggiornata.',true);}else throw e;}break;
      }
      case 'new-todo':todoForm();break;
      case 'edit-todo':todoForm(uid);break;
      case 'todo-project':state.todoProject=el.dataset.filter;renderContent(true);break;
      case 'todo-status':state.todoStatus=el.dataset.filter;renderContent(true);break;
      case 'my-status':state.myStatus=el.dataset.filter;renderContent(true);break;
      case 'my-scope':state.myScope=el.dataset.filter;renderContent(true);break;
      case 'project-todos':state.view='todos';state.projectId=null;state.todoProject=uid;state.todoStatus='open';renderContent();window.scrollTo(0,0);break;
      case 'goto-todo':gotoTodo(uid);break;
      case 'toggle-todo':{
        const t=state.todos.find(x=>x.id===uid);if(!t)break;el.disabled=true;
        const subs=t.parent_id?[]:subtodos(t.id);
        try{
          if(subs.length){const target=!todoDone(t);for(const s of subs)if(!!s.done!==target)await update('todos',s.id,{done:target},s.version);}
          else await update('todos',uid,{done:!t.done},t.version);
          renderContent(true);
        }catch(e){el.disabled=false;if(e.message==='CONFLICT'){if(!state.demo)await loadRemote();renderContent(true);notify('Task già modificata: ora vedi la versione aggiornata.',true);}else throw e;}break;
      }
      case 'delete-subtodo':await remove('todos',uid);renderContent(true);notify('Passo eliminato.');break;
      case 'new-event':eventForm(null,{date:el.dataset.date,project:el.dataset.project});break;
      case 'edit-event':eventForm(uid);break;
      case 'calendar-slot':{
        if(event.target.closest('.calendar-event'))break;const rect=el.getBoundingClientRect(),mins=Math.min(1425,Math.max(0,Math.floor((event.clientY-rect.top)/15)*15));eventForm(null,{date:el.dataset.date,time:`${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`});break;
      }
      case 'cal-view':state.calView=el.dataset.view;renderContent();break;
      case 'cal-prev':case 'cal-next':{const n=a==='cal-prev'?-1:1;if(state.calView!=='month')state.calDate=shiftDay(state.calDate,n*7);else state.calDate=new Date(state.calDate.getFullYear(),state.calDate.getMonth()+n,1);renderContent();break;}
      case 'cal-today':state.calDate=today();renderContent();break;
      case 'new-idea':ideaForm();break;
      case 'edit-idea':ideaForm(uid);break;
      case 'idea-filter':state.ideaFilter=el.dataset.filter;renderContent(true);break;
      case 'project-ideas':state.view='ideas';state.ideaFilter=uid;state.projectId=null;renderContent();window.scrollTo(0,0);break;
      case 'copy-draft':{
        const d=state.drafts.get(uid),n=state.ideas.find(i=>i.id===uid)||d?.snapshot;if(!d||!n)break;await insert('ideas',{title:n.title+' · copia',content:d.content,project_id:project(n.project_id)?n.project_id:null,color:n.color,created_by:state.user.id,updated_by:state.user.id});state.drafts.delete(uid);notify('Il tuo testo è salvato in una nuova idea.');renderContent(true);break;
      }
      case 'keep-mine':await resolveConflict(uid,'mine');break;
      case 'keep-theirs':await resolveConflict(uid,'theirs');break;
      case 'retry-note':await saveDraft(uid);renderContent(true);break;
      case 'new-transaction':transactionForm();break;
      case 'edit-transaction':transactionForm(uid);break;
      case 'delete-project':case 'delete-event':case 'delete-idea':case 'delete-transaction':case 'delete-todo':case 'delete-resource':await deleteItem(a.slice(7),uid);break;
      case 'search':searchDialog();break;
      case 'search-result':{
        const type=el.dataset.type;closeModal();if(type==='project'){state.view='projects';state.projectId=uid;renderContent();}else if(type==='event'){eventForm(uid);}else if(type==='todo'){gotoTodo(uid);}else{state.view='ideas';state.ideaFilter='all';renderContent();ideaModal(uid);}break;
      }
      case 'export-finance':exportFinance();break;
      case 'export-calendar':exportCalendar();break;
      case 'activity':activityDialog();break;
      case 'new-resource':resourceForm(null,uid);break;
      case 'edit-resource':resourceForm(uid);break;
      case 'iphone-calendar':await iphoneCalendarDialog();break;
      case 'rotate-feed':confirmDialog('Generare un nuovo link?','Il link attuale smetterà subito di funzionare, anche sull’iPhone dove l’hai aggiunto. Dovrai iscriverti di nuovo con quello nuovo.',async()=>{setTimeout(()=>iphoneCalendarDialog(true),0);},'Genera nuovo link');break;
      case 'copy-feed':{const v=$('#feed-url')?.value;if(!v)break;try{await navigator.clipboard.writeText(v);notify('Link copiato.');}catch{$('#feed-url').select();notify('Seleziona il link e copialo manualmente.',true);}break;}
      case 'download-event':exportCalendar(uid);break;
      case 'export-all':exportAll();break;
      case 'demo-user':if(state.demo){for(const key of state.drafts.keys())await saveDraft(key);state.user.id=uid;renderShell();notify('Anteprima dal profilo di '+memberName(uid)+'.');}break;
    }
  }
  document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.tagName==='SELECT'||el.tagName==='INPUT')return;if(el.matches('button:disabled'))return;if(el.dataset.action==='calendar-slot'&&e.target!==el)return;handleAction(el,e).catch(err=>notify(err.message==='CONFLICT'?'Questo elemento è cambiato. Aggiorna i dati e riprova.':err.message,true));});
  document.addEventListener('input',e=>{if(e.target.matches('[data-note-id]'))noteInput(e.target);});
  document.addEventListener('change',async e=>{
    const el=e.target;try{
      if(el.id==='finance-period'){state.period=el.value;renderContent(true);}
      if(el.dataset.ideaField){el.disabled=true;await saveIdeaField(el);el.disabled=false;return;}
      if(['todo-owner','todo-date','todo-title'].includes(el.dataset.action)){
        const t=state.todos.find(x=>x.id===el.dataset.id);if(!t)return;const a=el.dataset.action;let values;
        if(a==='todo-owner')values={owner_id:el.value||null};else if(a==='todo-date')values={due_date:el.value||null};else{const v=el.value.trim();if(!v){el.value=t.title;return;}if(v===t.title)return;values={title:v};}
        el.disabled=true;await update('todos',t.id,values,t.version);renderContent(true);notify('Task aggiornata.');
      }
      if(el.dataset.action==='task-owner'||el.dataset.action==='task-date'){
        const t=state.tasks.find(t=>t.id===el.dataset.id);if(!t)return;const values=el.dataset.action==='task-owner'?{owner_id:el.value||null}:{due_date:el.value||null};el.disabled=true;await update('tasks',t.id,values,t.version);renderContent(true);notify('Attività aggiornata.');
      }
    }catch(err){el.disabled=false;if(!state.demo){try{await loadRemote();}catch{}}renderContent(true);notify(err.message==='CONFLICT'?'L’attività è stata modificata dall’altro account. Controlla i dati aggiornati.':err.message,true);}
  });
  document.addEventListener('submit',async e=>{
    const form=e.target;if(!form.matches('.todo-add'))return;e.preventDefault();
    const input=form.elements.title,title=input.value.trim();if(!title||!state.user)return;
    const parent=state.todos.find(t=>t.id===form.dataset.parent);if(!parent)return;
    const subs=subtodos(parent.id),btn=$('[type=submit]',form);btn.disabled=true;
    try{await insert('todos',{title:title.slice(0,200),parent_id:parent.id,project_id:null,owner_id:form.elements.owner_id.value||null,done:false,position:subs.length?Math.max(...subs.map(x=>x.position||0))+1:0});input.value='';renderContent(true);}
    catch(err){btn.disabled=false;notify(err.message,true);}
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.target.matches?.('.task-title-input')){e.preventDefault();e.target.blur();}
    if(e.key==='Enter'&&e.target.matches?.('[data-modal-add]')){e.preventDefault();addStepFromModal(e.target.dataset.modalAdd).catch(err=>notify(err.message,true));}
    if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('.todo-open[role=button]')){e.preventDefault();handleAction(e.target,e).catch(err=>notify(err.message,true));}
    if(e.key==='Enter'&&e.target.matches?.('[data-idea-field=title]')){e.preventDefault();e.target.blur();}
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&state.user){e.preventDefault();searchDialog();}
    if((e.metaKey||e.ctrlKey)&&e.shiftKey&&e.key.toLowerCase()==='n'&&state.user&&!$('#modal').open){e.preventDefault();({projects:projectForm,todos:todoForm,mytodos:todoForm,calendar:eventForm,ideas:ideaForm,revenues:transactionForm,settings:()=>{}}[state.view])();}
    if((e.key==='Enter'||e.key===' ')&&e.target.matches('.day-column,.month-day')){e.preventDefault();eventForm(null,{date:e.target.dataset.date});}
  });
  window.addEventListener('beforeunload',e=>{if([...state.drafts.values()].some(d=>d.dirty||d.saving)){e.preventDefault();e.returnValue='';}});
  window.addEventListener('offline',()=>{if(state.user&&!state.demo){state.connected=false;updateSync();notify('Connessione assente. Le modifiche non salvate restano in questa finestra.',true);}});
  window.addEventListener('online',async()=>{if(state.user&&!state.demo){try{await loadRemote();for(const uid of state.drafts.keys())await saveDraft(uid);renderContent(true);}catch(e){notify(e.message,true);}}});
  applyTheme();try{window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(themePref()==='auto')applyTheme();});}catch{}
  if(new URLSearchParams(location.search).get('demo')==='1')startDemo();else renderLogin();
  if(new URLSearchParams(location.search).get('demo')!=='1'&&configured())restoreSession();
  if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  function renderProject(){
    const p=project(state.projectId);if(!p){state.projectId=null;return renderProjects();}const pr=progress(p);
    return `<button class="back-btn" data-action="back-projects">${icon('left',13)}Tutti i progetti</button><div class="detail-header"><div class="app-icon ${p.color}">${projectIcon(p)}</div><div><h1>${esc(p.name)}</h1><p>${esc(p.description)}</p></div><div class="detail-actions"><button class="btn" data-action="edit-project" data-id="${p.id}">${icon('edit',14)}<span>Modifica</span></button><button class="btn" data-action="new-event" data-project="${p.id}">${icon('calendar',14)}<span>Pianifica una call</span></button></div></div><div class="card detail-summary"><div class="progress-area"><div class="progress-label"><span>Il viaggio, fin qui</span><strong>${pr.percent}%</strong></div><div class="progress-track ${p.color}"><span style="width:${pr.percent}%"></span></div></div><span class="tag blue">${pr.done} / ${pr.total} attività</span><div class="detail-meta"><span class="row">${avatars(p.owner_id)}${esc(memberName(p.owner_id))}</span><span>${icon('calendar',13)} ${p.due_date?fmtDate(p.due_date):'Scadenza da definire'}</span><span class="tag">${esc(p.platform)}</span></div></div><div class="roadmap">${STAGES.map((st,stage)=>{const tasks=tasksOf(p.id).filter(t=>t.stage===stage),completed=tasks.filter(t=>t.done).length;return `<section class="card phase"><div class="phase-header"><span class="phase-number">${completed===tasks.length?icon('check',15):String(stage+1).padStart(2,'0')}</span><div><h2>${esc(st.title)}</h2><p>${esc(st.subtitle)}</p></div><span class="tag ${completed===tasks.length?'green':''}">${completed} di ${tasks.length}</span></div><div class="task-list">${tasks.map(t=>`<div class="task-row"><button class="task-check ${t.done?'checked':''}" data-action="toggle-task" data-id="${t.id}" role="checkbox" aria-checked="${t.done}" aria-label="${esc(t.title)}">${t.done?icon('check',12):''}</button><span class="task-title ${t.done?'done':''}">${esc(t.title)}</span><select class="task-owner" data-action="task-owner" data-id="${t.id}" data-focus-key="owner-${t.id}" aria-label="Responsabile: ${esc(t.title)}">${ownerOptions(t.owner_id)}</select><input class="task-date ${!t.done&&t.due_date&&t.due_date<dateKey(today())?'overdue':''}" type="date" value="${esc(t.due_date||'')}" data-action="task-date" data-id="${t.id}" data-focus-key="date-${t.id}" aria-label="Scadenza: ${esc(t.title)}"></div>`).join('')}</div></section>`;}).join('')}</div>${resourcesPanel(p)}<div class="detail-bottom three">${(()=>{const pt=todoParents().filter(t=>t.project_id===p.id),openN=pt.filter(t=>!todoDone(t)).length;return `<div class="card detail-panel"><h2>Le task del progetto</h2><p>${openN} da fare · ${pt.length-openN} completate</p><button class="btn small" data-action="project-todos" data-id="${p.id}">${icon('todos',13)}Apri le task ${icon('arrow',12)}</button></div>`;})()}<div class="card detail-panel"><h2>Le idee dietro l’app</h2><p>Intuizioni, spunti e cose da riprendere insieme.</p><button class="btn small" data-action="project-ideas" data-id="${p.id}">${icon('ideas',13)}Apri le idee ${icon('arrow',12)}</button></div><div class="card detail-panel"><h2>Come sta andando?</h2><p>Ricavi e costi registrati per ${esc(p.name)}.</p><span class="tag green">${money(state.transactions.filter(t=>t.project_id===p.id).reduce((sum,t)=>sum+(t.type==='revenue'?Number(t.amount):-Number(t.amount)),0))} di risultato</span></div></div>`;
  }

})();
