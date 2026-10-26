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
  };
  const icon = (name,size=18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.projects}</svg>`;
  const STAGES = [
    {title:'Dall’idea all’applicazione beta',subtitle:'Dare forma, provare, migliorare.',tasks:['Ideas sharing','Prima realizzazione','Prima fase di test','Risoluzione errori e miglioramenti','Seconda fase di test','Consolidamento','Capire come monetizzare l’app']},
    {title:'Porting su iOS / Android',subtitle:'La vostra app, nelle mani di tutti.',tasks:['Porting su iOS / Android','Terza e ultima fase di test']},
    {title:'Pubblicazione e vendita',subtitle:'È il momento di andare live.',tasks:['Pubblicazione','Gestione vendita']}
  ];
  const TABLES=['projects','tasks','ideas','events','transactions'];
  const COLORS={blue:'#89a5e6',purple:'#b09ad6',green:'#8ab9a2',amber:'#d8b67f'};
  const CATEGORIES={revenue:'Ricavi app',ai:'Software e AI',developer:'Account sviluppatori',hosting:'Hosting e servizi',marketing:'Marketing',other:'Altro'};
  const state={user:null,demo:false,view:'projects',projectId:null,filter:'all',ideaFilter:'all',period:'all',calView:'week',calDate:today(),members:[],projects:[],tasks:[],ideas:[],events:[],transactions:[],connected:false,loading:false,client:null,channel:null,drafts:new Map(),noteTimers:new Map(),loadSeq:0};
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
  function notify(message,error=false){const d=document.createElement('div');d.className=`toast${error?' error':''}`;d.innerHTML=icon(error?'info':'checkCircle',16)+`<span>${esc(message)}</span>`;$('#toasts').append(d);setTimeout(()=>d.remove(),5200);}
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
  }
  const configured = () => {const c=window.SHININGBULBS_CONFIG;return !!(c?.supabaseUrl&&c?.supabasePublishableKey);};
  async function getClient(){
    if(state.client)return state.client;
    const c=window.SHININGBULBS_CONFIG;
    if(!configured())throw new Error('Collega prima il database: trovi i passaggi nella guida alla configurazione.');
    if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(c.supabaseUrl))throw new Error('Controlla il Project URL in config.js.');
    if(!c.supabasePublishableKey.startsWith('sb_publishable_'))throw new Error('Inserisci una chiave sb_publishable_ in config.js. Non usare chiavi segrete.');
    await new Promise((resolve,reject)=>{const el=document.createElement('script');el.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';el.onload=resolve;el.onerror=()=>reject(new Error('Impossibile caricare il servizio di accesso. Controlla la connessione e riprova.'));document.head.append(el);});
    state.client=window.supabase.createClient(c.supabaseUrl,c.supabasePublishableKey,{auth:{persistSession:false,detectSessionInUrl:false,autoRefreshToken:true}});
    state.client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'&&state.user&&!state.demo){resetSession();renderLogin();}if(event==='TOKEN_REFRESHED'&&session)state.client.realtime.setAuth(session.access_token);});
    return state.client;
  }
  async function login(form){
    const button=$('[type=submit]',form);button.disabled=true;button.innerHTML='<span class="spinner"></span> Accesso…';$('.login-error',form).textContent='';
    try{
      const c=await getClient();const values=new FormData(form);
      const {data,error}=await c.auth.signInWithPassword({email:values.get('email').trim(),password:values.get('password')});
      if(error)throw new Error('Email o password non corrette. Controllale e riprova.');
      state.user=data.user;state.demo=false;
      const res=await c.from('members').select('id,display_name');if(res.error)throw new Error('Database non pronto. Esegui database.sql e controlla i permessi.');
      state.members=res.data;
      if(!state.members.some(m=>m.id===data.user.id)){await c.auth.signOut();throw new Error('Questo account non è autorizzato a entrare nello studio.');}
      $('#app').innerHTML='<div class="loading-page"><div class="spinner"></div><p>Apriamo lo studio…</p></div>';
      await loadRemote();renderShell();subscribe();
    }catch(err){state.user=null;renderLogin();$('.login-error').textContent=err.message;}
  }
  function resetSession(){
    for(const t of state.noteTimers.values())clearTimeout(t);
    state.noteTimers.clear();state.drafts.clear();state.loadSeq++;
    if(state.channel&&state.client)state.client.removeChannel(state.channel);
    state.channel=null;state.connected=false;state.user=null;state.demo=false;state.projectId=null;state.view='projects';
    TABLES.forEach(t=>state[t]=[]);state.members=[];
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
    const results=await Promise.all(TABLES.map(t=>state.client.from(t).select('*')));
    if(seq!==state.loadSeq||!state.user)return;
    const err=results.find(r=>r.error)?.error;if(err)throw new Error('Non riusciamo ad aggiornare i dati. Controlla la connessione.');
    TABLES.forEach((t,i)=>state[t]=results[i].data);
    if(state.projectId&&!project(state.projectId))state.projectId=null;
  }
  let refreshTimer;
  function subscribe(){
    let ch=state.client.channel('shiningbulbs-database');
    TABLES.forEach(table=>{ch=ch.on('postgres_changes',{event:'*',schema:'public',table},()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(async()=>{try{await loadRemote();if(state.user)renderContent(true);}catch(e){state.connected=false;updateSync();notify(e.message,true);}},160);});});
    state.channel=ch.subscribe(async status=>{state.connected=status==='SUBSCRIBED';updateSync();if(status==='SUBSCRIBED'){try{await loadRemote();if(state.user)renderContent(true);}catch(e){notify(e.message,true);}}});
  }
  function updateSync(){const el=$('#sync-status');if(el)el.outerHTML=syncMarkup();}
  function syncMarkup(){return `<span id="sync-status" class="sync-state ${state.demo?'':state.connected?'live':'offline'}"><span class="dot"></span>${state.demo?'Anteprima':state.connected?'Sincronizzato':'Riconnessione…'}</span>`;}
  async function insert(table,values){
    state.loadSeq++;
    if(state.demo){const row={id:id(),created_at:new Date().toISOString(),version:1,...values};state[table].push(row);return row;}
    const {data,error}=await state.client.from(table).insert(values).select().single();if(error)throw new Error('Salvataggio non riuscito. Controlla i dati e riprova.');state[table]=[...state[table].filter(r=>r.id!==data.id),data];return data;
  }
  async function update(table,uid,values,version){
    state.loadSeq++;
    if(state.demo){const index=state[table].findIndex(r=>r.id===uid);if(index<0)throw new Error('Questo elemento è stato eliminato.');const prev=state[table][index];if(version!==undefined&&prev.version!==version)throw new Error('CONFLICT');const row={...prev,...values,version:(prev.version||0)+1};state[table][index]=row;return row;}
    let q=state.client.from(table).update(values).eq('id',uid);if(version!==undefined)q=q.eq('version',version);
    const {data,error}=await q.select();if(error)throw new Error('Modifica non salvata. Controlla la connessione e riprova.');if(!data.length)throw new Error('CONFLICT');
    const idx=state[table].findIndex(r=>r.id===uid);if(idx>=0)state[table][idx]=data[0];return data[0];
  }
  async function remove(table,uid){
    state.loadSeq++;
    if(!state.demo){const {data,error}=await state.client.from(table).delete().eq('id',uid).select('id');if(error||!data.length)throw new Error('Eliminazione non riuscita. Aggiorna i dati e riprova.');}
    state[table]=state[table].filter(r=>r.id!==uid);
    if(table==='projects'){state.tasks=state.tasks.filter(t=>t.project_id!==uid);['ideas','events','transactions'].forEach(t=>state[t].forEach(r=>{if(r.project_id===uid)r.project_id=null;}));}
  }
  function renderLogin(){
    $('#app').innerHTML=`<div class="login-page"><section class="login-intro"><div class="brand"><div class="brand-mark">${icon('bulb',34)}</div><div>ShiningBulbs<small>THE FOUNDERS’ STUDIO</small></div></div><div class="login-story"><p class="eyebrow">DUE PERSONE. UN SACCO DI IDEE.</p><h1>Le idee si accendono.<br><span>Insieme.</span></h1><p>Uno spazio per dare forma alle intuizioni, costruire le vostre app e seguire ogni piccolo passo.</p><div class="login-mini-board"><div class="row">${icon('projects',17)}<strong>Dall’idea al primo download.</strong><span class="avatars"><span class="avatar">R</span><span class="avatar stefano">S</span></span></div><div class="login-mini-task">${icon('checkCircle',16)}Condividere un’idea<span>Fatto, insieme.</span></div><div class="login-mini-task">${icon('ideas',16)}Costruire qualcosa di bello<span>Il prossimo passo</span></div></div></div><footer>SHININGBULBS STUDIO &nbsp;·&nbsp; MADE FOR YOUR NEXT BIG THING.</footer></section><section class="login-form-area"><form class="login-form" id="login-form"><div class="brand-mark">${icon('bulb',26)}</div><h2>Benvenuto nello studio.</h2><p>Accedi al vostro spazio condiviso.<br>Le prossime idee vi aspettano.</p><label class="field"><span>Email</span><input name="email" type="email" placeholder="La tua email" autocomplete="username" required></label><label class="field"><span>Password</span><input name="password" type="password" placeholder="La tua password" autocomplete="current-password" required></label><button class="btn primary" type="submit">Entra nello studio ${icon('arrow',15)}</button><p class="login-error" role="alert"></p><div class="login-divider">DAI UN’OCCHIATA</div><button type="button" class="btn demo-cta" data-action="demo">${icon('sparkles',15)}Esplora l’anteprima</button><p class="login-footnote">Esempi modificabili, conservati solo finché la pagina resta aperta.</p>${!configured()?`<p class="login-footnote">Accesso condiviso da attivare. <button type="button" class="btn subtle" data-action="setup">Guida alla configurazione ${icon('arrow',12)}</button></p>`:''}</form></section></div>`;
    $('#login-form').addEventListener('submit',e=>{e.preventDefault();login(e.currentTarget);});
  }
  function renderShell(){
    $('#app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">${icon('bulb',31)}</div><div>ShiningBulbs<small>THE FOUNDERS’ STUDIO</small></div></div><div class="sidebar-label">WORKSPACE</div><nav class="nav" aria-label="Navigazione principale">${[['projects','Progetti'],['calendar','Calendario'],['ideas','Idee'],['revenues','Revenues']].map(([key,name])=>`<button data-action="nav" data-view="${key}" class="${state.view===key?'active':''}" ${state.view===key?'aria-current="page"':''}>${icon(key,17)}<span>${name}</span>${key==='projects'?`<span class="count" id="project-count">${state.projects.length}</span>`:''}</button>`).join('')}</nav><div class="studio-note"><div class="mini-icon">${icon('sparkles',20)}</div><strong>Una buona idea è un inizio.</strong><p>Costruirla insieme<br>è tutta un’altra storia.</p></div><div class="sidebar-bottom"><button class="settings" data-action="nav" data-view="settings">${icon('settings',16)}<span>Impostazioni</span></button><div class="identity">${avatar(state.user.id)}<div><strong>${esc(memberName(state.user.id))}</strong><small>${state.demo?'Profilo di esempio':'Founder · ShiningBulbs'}</small></div><button class="icon-btn" title="Esci dallo studio" aria-label="Esci dallo studio" data-action="logout">${icon('logout',16)}</button></div></div></aside><div class="work-area"><header class="topbar"><div class="breadcrumb">${icon('projects',12)}<span>Workspace</span>${icon('chevron',10)}<b id="breadcrumb-view">Progetti</b></div><div class="top-actions"><button class="search-trigger" data-action="search" aria-label="Cerca nello studio">${icon('search',15)}<span>Cerca nello studio</span><kbd>⌘ K</kbd></button><div class="top-divider"></div>${syncMarkup()}<span class="avatars">${state.members.map(m=>avatar(m.id)).join('')}</span></div></header>${state.demo?`<div class="demo-banner">${icon('info',12)}Anteprima con dati di esempio · le modifiche non vengono salvate né condivise.<button data-action="setup">Attiva lo studio condiviso ${icon('arrow',11)}</button></div>`:''}<main id="main-content" class="page" tabindex="-1"></main></div></div>`;
    renderContent();
  }
  function renderContent(preserve=false){
    if(!state.user)return;
    const main=$('#main-content');if(!main)return;
    const active=document.activeElement,key=active?.dataset?.focusKey,start=active?.selectionStart,end=active?.selectionEnd;
    const scrollY=window.scrollY,scrollBox=$('.calendar-scroll'),scrollTop=scrollBox?.scrollTop;
    const titles={projects:'Progetti',calendar:'Calendario',ideas:'Idee',revenues:'Revenues',settings:'Impostazioni'};
    $('#breadcrumb-view').textContent=state.projectId&&state.view==='projects'?project(state.projectId)?.name||'Progetti':titles[state.view];
    $$('.nav [data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===state.view);if(b.dataset.view===state.view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    $('#project-count').textContent=state.projects.length;
    const views={projects:()=>state.projectId?renderProject():renderProjects(),calendar:renderCalendar,ideas:renderIdeas,revenues:renderRevenues,settings:renderSettings};
    main.innerHTML=views[state.view]()+`<footer class="page-footer"><span>ShiningBulbs Studio &nbsp;·&nbsp; Built together.</span><span>Un’idea alla volta. Una release alla volta.</span></footer>`;
    if(preserve&&key){const el=$$('[data-focus-key]',main).find(e=>e.dataset.focusKey===key);if(el){el.focus({preventScroll:true});if(typeof start==='number'&&typeof el.setSelectionRange==='function'){try{el.setSelectionRange(start,end);}catch{}}}}
    if(preserve){window.scrollTo(0,scrollY);if(scrollTop!==undefined&&$('.calendar-scroll'))$('.calendar-scroll').scrollTop=scrollTop;}
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
    <div class="projects-layout"><section><div class="section-head"><h2>I vostri progetti <span class="muted" style="font-weight:400;margin-left:4px;font-size:11px">${state.projects.length}</span></h2><div class="segmented" aria-label="Filtra progetti">${[['all','Tutti'],['active','In corso'],['done','Completati']].map(([key,label])=>`<button data-action="project-filter" data-filter="${key}" class="${state.filter===key?'active':''}">${label}</button>`).join('')}</div></div><div class="project-grid">${list.map(renderProjectCard).join('')}<button class="project-add" data-action="new-project"><span class="add-circle">${icon('plus',17)}</span>Accendete una nuova idea</button></div></section><aside class="project-aside"><section><div class="section-head"><h2 class="aside-heading">In calendario</h2><button class="icon-btn" aria-label="Apri calendario" data-action="nav" data-view="calendar">${icon('arrow',14)}</button></div>${meetings.length?meetings.slice(0,2).map(upcomingMarkup).join(''):`<p class="muted" style="font-size:11px">Nessun incontro in programma.<br>È un buon momento per confrontarsi.</p>`}</section><section class="deadlines"><div class="section-head"><h2 class="aside-heading">Prossime scadenze</h2><span class="tag">${dueTasks.length}</span></div>${dueTasks.length?dueTasks.map(t=>`<div class="deadline-item"><span class="tiny-circle"></span><button data-action="open-project" data-id="${t.project_id}">${esc(t.title)}<p>${esc(project(t.project_id)?.name||'')}</p></button><time class="${t.due_date<dateKey(today())?'overdue-text':''}">${fmtDate(t.due_date)}</time></div>`).join(''):`<p class="muted" style="font-size:11px">Avete spazio per pianificare il prossimo passo.</p>`}</section><div class="aside-card">${icon('ideas',22)}<h3>Un’intuizione al volo?</h3><p>Scrivetela prima che scappi.<br>Le idee migliori partono da qui.</p><button class="btn subtle" style="font-size:10px" data-action="nav" data-view="ideas">Vai alle idee ${icon('arrow',12)}</button></div></aside></div>`;
  }
  function upcomingMarkup(ev){const d=new Date(ev.start_at);return `<div class="upcoming"><div class="mini-date"><span>${d.toLocaleDateString('it-IT',{month:'short'})}</span><b>${d.getDate()}</b></div><button data-action="edit-event" data-id="${ev.id}"><div class="title">${esc(ev.title)}</div><p>${fmtTime(ev.start_at)} – ${fmtTime(ev.end_at)} &nbsp;·&nbsp; ${ev.project_id?esc(project(ev.project_id)?.name||'Progetto'):'Riccardo e Stefano'}</p></button></div>`;}
  function startOfWeek(d){const r=new Date(d);r.setHours(0,0,0,0);r.setDate(r.getDate()-((r.getDay()+6)%7));return r;}
  function eventLayout(events){
    const list=events.slice().sort((a,b)=>a.start_at.localeCompare(b.start_at));const result=[];let group=[],ends=[],maxEnd=0;
    const flush=()=>{group.forEach(x=>result.push({...x,lanes:ends.length}));group=[];ends=[];maxEnd=0;};
    for(const ev of list){const st=+new Date(ev.start_at),en=+new Date(ev.end_at);if(group.length&&st>=maxEnd)flush();let lane=ends.findIndex(e=>e<=st);if(lane<0)lane=ends.length;ends[lane]=en;maxEnd=Math.max(maxEnd,en);group.push({ev,lane});}if(group.length)flush();return result;
  }
  function renderCalendar(){
    const start=startOfWeek(state.calDate),days=Array.from({length:7},(_,i)=>shiftDay(start,i));
    const monthTitle=state.calDate.toLocaleDateString('it-IT',{month:'long',year:'numeric'});
    const upcoming=state.events.filter(e=>new Date(e.end_at)>=today()).sort((a,b)=>a.start_at.localeCompare(b.start_at)).slice(0,3);
    let content;
    if(state.calView==='week'){
      content=`<div class="card calendar-scroll"><div class="week"><div class="week-header"><span></span>${days.map(d=>`<div class="week-day ${dateKey(d)===dateKey(today())?'today':''}">${d.toLocaleDateString('it-IT',{weekday:'short'})}<b>${d.getDate()}</b></div>`).join('')}</div><div class="week-body" style="height:1440px"><div class="time-axis">${Array.from({length:24},(_,h)=>`<span style="top:${h*60}px">${h?`${String(h).padStart(2,'0')}:00`:''}</span>`).join('')}</div>${days.map(d=>{const events=eventLayout(state.events.filter(e=>dateKey(new Date(e.start_at))===dateKey(d)));return `<div class="day-column ${dateKey(d)===dateKey(today())?'today':''}" data-action="calendar-slot" data-date="${dateKey(d)}" tabindex="0" role="button" aria-label="Aggiungi incontro il ${esc(fmtDate(dateKey(d)))}">${events.map(({ev,lane,lanes})=>{const st=new Date(ev.start_at),top=st.getHours()*60+st.getMinutes(),height=Math.max(23,(+new Date(ev.end_at)-st)/60000-3),color=project(ev.project_id)?.color||'blue';return `<button class="calendar-event ${color}" style="top:${top}px;height:${height}px;left:calc(${lane*100/lanes}% + 4px);width:calc(${100/lanes}% - 8px);right:auto" data-action="edit-event" data-id="${ev.id}" aria-label="${esc(ev.title)}, ${fmtTime(ev.start_at)}"><b>${esc(ev.title)}</b><small>${fmtTime(ev.start_at)} – ${fmtTime(ev.end_at)}</small></button>`;}).join('')}</div>`;}).join('')}</div></div></div>`;
    }else{
      const first=new Date(state.calDate.getFullYear(),state.calDate.getMonth(),1),gridStart=startOfWeek(first);
      content=`<div class="card calendar-scroll month-scroll"><div class="month-header">${['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(d=>`<div>${d}</div>`).join('')}</div><div class="month-grid">${Array.from({length:42},(_,i)=>{const d=shiftDay(gridStart,i),key=dateKey(d),evs=state.events.filter(e=>dateKey(new Date(e.start_at))===key).sort((a,b)=>a.start_at.localeCompare(b.start_at));return `<div class="month-day ${d.getMonth()!==state.calDate.getMonth()?'off-month':''} ${key===dateKey(today())?'today':''}" data-action="new-event" data-date="${key}" tabindex="0" role="button" aria-label="Aggiungi incontro il ${esc(fmtDate(key))}"><span>${d.getDate()}</span>${evs.map(e=>`<button class="month-event" data-action="edit-event" data-id="${e.id}" title="${esc(e.title)}">${fmtTime(e.start_at)} ${esc(e.title)}</button>`).join('')}</div>`;}).join('')}</div></div>`;
    }
    return heading('Calendario','Trovate il tempo per costruire, insieme.',newButton('event','Nuovo incontro'))+`<div class="calendar-toolbar"><h2>${esc(monthTitle)}</h2><div class="row" style="gap:1px"><button class="icon-btn" data-action="cal-prev" aria-label="Periodo precedente">${icon('left',15)}</button><button class="icon-btn" data-action="cal-next" aria-label="Periodo successivo">${icon('chevron',15)}</button></div><button class="btn small" data-action="cal-today">Oggi</button><div class="segmented">${[['week','Settimana'],['month','Mese']].map(([key,label])=>`<button data-action="cal-view" data-view="${key}" class="${state.calView===key?'active':''}">${label}</button>`).join('')}</div></div>${content}<div class="calendar-below"><span>${icon('info',12)} Clicca ${state.calView==='week'?'un orario':'un giorno'} per aggiungere un incontro.</span><span>Orari locali · ${esc(Intl.DateTimeFormat().resolvedOptions().timeZone)}</span><button class="btn subtle" style="font-size:10px;margin-left:auto" data-action="export-calendar">${icon('download',12)}Esporta calendario</button></div><div class="card agenda-panel"><h2 style="font-size:13px">I prossimi momenti insieme</h2><div class="agenda-grid">${upcoming.length?upcoming.map(upcomingMarkup).join(''):'<p class="muted" style="font-size:11px;margin-top:15px">Nessun incontro in programma. Pianificate il prossimo confronto.</p>'}</div></div>`;
  }
  function renderIdeas(){
    const orphaned=[...state.drafts.entries()].filter(([uid,d])=>!state.ideas.some(n=>n.id===uid)&&d.snapshot).map(([,d])=>{d.conflict=true;return d.snapshot;});
    const list=[...state.ideas,...orphaned].filter(n=>state.ideaFilter==='all'||state.ideaFilter===n.created_by||state.ideaFilter===n.project_id).sort((a,b)=>(a.created_at||'').localeCompare(b.created_at||''));
    return heading('Idee','Lo spazio bianco prima della prossima grande cosa.',newButton('idea','Nuova idea'))+`<div class="ideas-toolbar"><button class="filter-chip ${state.ideaFilter==='all'?'active':''}" data-action="idea-filter" data-filter="all">Tutte le idee</button>${state.members.map(m=>`<button class="filter-chip ${state.ideaFilter===m.id?'active':''}" data-action="idea-filter" data-filter="${m.id}">${esc(m.display_name)}</button>`).join('')}${state.projects.map(p=>`<button class="filter-chip ${state.ideaFilter===p.id?'active':''}" data-action="idea-filter" data-filter="${p.id}">${esc(p.name)}</button>`).join('')}</div><div class="ideas-grid">${list.map(n=>{const draft=state.drafts.get(n.id),content=draft?draft.content:n.content;return `<article class="card note ${n.color||'blue'}"><div class="row between"><span class="tag ${n.color||'blue'}">${n.project_id?esc(project(n.project_id)?.name||'Studio'):'Pensieri sparsi'}</span><button class="icon-btn" data-action="edit-idea" data-id="${n.id}" title="Modifica titolo e dettagli" aria-label="Modifica ${esc(n.title)}">${icon('more',16)}</button></div><h3>${esc(n.title)}</h3><textarea data-note-id="${n.id}" data-focus-key="note-${n.id}" aria-label="Testo: ${esc(n.title)}" placeholder="Inizia da un’intuizione…" maxlength="20000">${esc(content)}</textarea>${draft?.conflict?`<div class="note-conflict">L’idea è cambiata durante la scrittura. Il tuo testo è qui al sicuro.<br><button class="btn small" style="margin-top:6px" data-action="copy-draft" data-id="${n.id}">Salva il mio testo come nuova idea</button></div>`:draft?.failed?`<div class="note-conflict">Connessione non disponibile. Il testo è ancora qui.<br><button class="btn small" data-action="retry-note" data-id="${n.id}" style="margin-top:6px">Riprova il salvataggio</button></div>`:''}<div class="note-foot">${avatar(n.created_by)}<span>Idea di ${esc(memberName(n.created_by))}</span>${n.updated_by&&n.updated_by!==n.created_by?`<span title="Ultima modifica di ${esc(memberName(n.updated_by))}">· modificata da ${esc(memberName(n.updated_by))}</span>`:''}<span class="save-status" data-save-status="${n.id}">${draft?.conflict?'Da risolvere':draft?.saving?'Salvataggio…':draft?.dirty?'Da salvare':state.demo?'Temporanea':'Salvata'}</span></div></article>`;}).join('')}<button class="project-add note-add" data-action="new-idea"><span class="add-circle">${icon('plus',17)}</span>C’è spazio per un’altra idea</button></div><div class="ideas-caption">${icon('info',13)}Ogni idea ha una firma. Il testo si salva mentre scrivete; le modifiche allo stesso blocco sono controllate.</div>`;
  }
  function setNoteStatus(uid,text){const el=$$('[data-save-status]').find(x=>x.dataset.saveStatus===uid);if(el)el.textContent=text;}
  function noteInput(el){
    const uid=el.dataset.noteId,note=state.ideas.find(n=>n.id===uid);if(!note)return;
    let d=state.drafts.get(uid);if(!d){d={content:note.content,baseVersion:note.version,dirty:false,saving:false,conflict:false,snapshot:{...note}};state.drafts.set(uid,d);}
    d.content=el.value;d.dirty=true;clearTimeout(state.noteTimers.get(uid));
    setNoteStatus(uid,d.conflict?'Da risolvere':'Scrittura…');
    if(!d.conflict)state.noteTimers.set(uid,setTimeout(()=>saveDraft(uid),650));
  }
  async function saveDraft(uid){
    const d=state.drafts.get(uid);if(!d||d.saving||d.conflict||!d.dirty)return;
    d.saving=true;d.failed=false;setNoteStatus(uid,'Salvataggio…');const sent=d.content,ver=d.baseVersion;
    try{
      const note=await update('ideas',uid,{content:sent,updated_by:state.user.id},ver);
      if(state.drafts.get(uid)!==d)return;d.baseVersion=note.version;d.saving=false;d.dirty=d.content!==sent;
      setNoteStatus(uid,d.dirty?'Scrittura…':state.demo?'Temporanea':'Salvata');
      if(d.dirty)state.noteTimers.set(uid,setTimeout(()=>saveDraft(uid),200));else state.drafts.delete(uid);
    }catch(err){d.saving=false;if(err.message==='CONFLICT'){d.conflict=true;renderContent(true);}else{d.failed=true;renderContent(true);setNoteStatus(uid,'Non salvata');notify('Idea non salvata. Il testo resta qui: usa Riprova sotto l’idea.',true);}}
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
  function renderSettings(){
    return heading('Lo studio','Le persone, i dati e le piccole impostazioni che contano.')+`<div class="settings-grid"><section class="card settings-panel"><span class="tag blue">SHININGBULBS</span><h2 style="margin-top:17px">Due founder. Uno spazio.</h2><p>Accessi personali, progetti condivisi e idee che mantengono la firma di chi le ha scritte.</p><div class="member-list">${state.members.map(m=>`<div class="member-item">${avatar(m.id)}${esc(m.display_name)}<span class="tag">Founder</span></div>`).join('')}</div>${state.demo?`<div style="margin-top:25px"><p style="font-size:11px">Nell’anteprima puoi cambiare profilo per provare le firme:</p><div class="row">${state.members.map(m=>`<button class="btn small" data-action="demo-user" data-id="${m.id}">${avatar(m.id)}${esc(m.display_name)}</button>`).join('')}</div></div>`:''}</section><section class="card settings-panel"><h2>Il vostro database</h2><p>${state.demo?'Questa anteprima usa soltanto dati di esempio in memoria. I dati reali si salvano nel database condiviso dopo la configurazione.':'I dati dello studio sono salvati su Supabase. La sessione di accesso rimane solo in memoria: ricaricando la pagina sarà necessario accedere di nuovo.'}</p><span class="tag ${state.demo?'amber':state.connected?'green':'amber'}"><i class="dot"></i>${state.demo?'Anteprima · sincronizzazione da attivare':state.connected?'Database collegato':'Connessione in ripristino'}</span><div style="margin-top:22px"><button class="btn" data-action="setup">${icon('cloud',15)}Guida alla configurazione</button></div></section><section class="card settings-panel"><h2>I dati, anche fuori dallo studio.</h2><p>Scarica un’istantanea JSON di progetti, attività, idee, calendario e movimenti. Le password e le sessioni di accesso sono escluse.</p><button class="btn" data-action="export-all">${icon('download',15)}Esporta tutti i dati</button></section><section class="card settings-panel"><h2>Le cose semplici, più veloci.</h2><p>Usa <strong>⌘ K / Ctrl K</strong> per cercare nello studio e <strong>⌘ ⇧ N / Ctrl ⇧ N</strong> per creare un elemento nella sezione aperta. Puoi installare il sito come web app dal browser.</p><span class="tag">Connessione Internet necessaria</span></section></div>`;
  }
  function closeModal(){const d=$('#modal');if(d.open)d.close();d.innerHTML='';}
  function openForm(title,body,onSave,options={}){
    const d=$('#modal');if(d.open)d.close();d.className=options.className||'';
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
  function ideaForm(uid){
    const n=state.ideas.find(i=>i.id===uid);
    openForm(n?'I dettagli dell’idea':'Ogni grande app inizia così.',`<div class="form-grid"><div class="full">${inputField('Un titolo per ritrovarla','title',n?.title||'','text','required maxlength="120" placeholder="E se provassimo a…?"')}</div>${!n?'<label class="field full"><span>L’idea</span><textarea name="content" maxlength="20000" style="min-height:160px" placeholder="Scrivi liberamente. Qui c’è spazio per tutto."></textarea></label>':''}<label class="field"><span>Collegata a</span><select name="project_id">${projectOptions(n?.project_id||(state.ideaFilter!=='all'&&project(state.ideaFilter)?state.ideaFilter:null))}</select></label><label class="field"><span>Colore</span><select name="color">${Object.keys(COLORS).map((c,i)=>`<option value="${c}" ${(n?.color||'blue')===c?'selected':''}>${['Blu cielo','Lavanda','Salvia','Sabbia'][i]}</option>`).join('')}</select></label></div><p class="modal-description" style="margin-bottom:0">${n?'Il testo si modifica direttamente nel foglio dell’idea.':'L’idea porterà la firma di '+esc(memberName(state.user.id))+'. Potrete modificarla entrambi.'}</p>`,async fd=>{
      const values={title:fd.get('title').trim(),project_id:fd.get('project_id')||null,color:fd.get('color'),updated_by:state.user.id};if(!values.title)throw new Error('Dai un titolo all’idea.');
      if(n){const saved=await update('ideas',uid,values);const draft=state.drafts.get(uid);if(draft&&!draft.saving&&!draft.conflict&&draft.baseVersion===n.version)draft.baseVersion=saved.version;}
      else{await insert('ideas',{...values,content:fd.get('content'),created_by:state.user.id});state.ideaFilter='all';}notify(n?'Dettagli dell’idea aggiornati.':'Una nuova idea nello studio.');
    },{saveLabel:n?'Salva dettagli':'Aggiungi idea',extra:n?`<button type="button" class="btn danger" data-action="delete-idea" data-id="${n.id}">${icon('trash',13)}Elimina</button>`:''});
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
    const d=$('#modal');if(d.open)d.close();d.className='search-modal';d.innerHTML=`<div class="modal-header" style="padding-bottom:0"><h2 id="modal-title" style="font-size:14px">Cerca nello studio</h2><button class="icon-btn" data-action="close-modal" aria-label="Chiudi ricerca">${icon('close',15)}</button></div><input id="studio-search" type="search" placeholder="Progetti, idee, attività, incontri…" aria-label="Cerca nello studio" autocomplete="off"><div class="search-results"></div>`;d.showModal();const input=$('#studio-search');
    const search=()=>{const q=input.value.trim().toLocaleLowerCase('it');if(!q){$('.search-results',d).innerHTML='<p class="search-hint">Inizia a scrivere per ritrovare un’idea o il prossimo passo.</p>';return;}
      const results=[...state.projects.map(p=>({title:p.name,detail:'Progetto',text:p.description,type:'project',id:p.id})),...state.tasks.map(t=>({title:t.title,detail:project(t.project_id)?.name||'Attività',text:'',type:'project',id:t.project_id})),...state.ideas.map(n=>({title:n.title,detail:'Idea · '+memberName(n.created_by),text:n.content,type:'idea',id:n.id})),...state.events.map(e=>({title:e.title,detail:'Incontro · '+fmtDate(dateKey(new Date(e.start_at))),text:e.agenda,type:'event',id:e.id}))].filter(r=>(r.title+' '+r.text).toLocaleLowerCase('it').includes(q)).slice(0,20);
      $('.search-results',d).innerHTML=results.length?results.map(r=>`<button class="search-result" data-action="search-result" data-type="${r.type}" data-id="${r.id}">${icon(r.type==='project'?'projects':r.type==='idea'?'ideas':'calendar',17)}<span>${esc(r.title)}<small>${esc(r.detail)}</small></span>${icon('arrow',13)}</button>`).join(''):'<p class="search-hint">Nessun risultato. Magari è la prossima idea da aggiungere.</p>';
    };input.addEventListener('input',search);search();setTimeout(()=>input.focus(),10);
  }
  async function deleteItem(kind,uid){
    const table={project:'projects',event:'events',idea:'ideas',transaction:'transactions'}[kind];
    const labels={project:['Eliminare questo progetto?','La roadmap e le attività saranno eliminate. Idee, incontri e movimenti resteranno nello studio, senza un progetto associato.'],event:['Eliminare questo incontro?','L’incontro sarà rimosso dal calendario condiviso.'],idea:['Eliminare questa idea?','L’idea e il suo testo saranno eliminati per entrambi, compresi eventuali testi non salvati in questa finestra.'],transaction:['Eliminare questo movimento?','Il movimento sarà eliminato e i totali saranno ricalcolati.']};
    confirmDialog(...labels[kind],async()=>{await remove(table,uid);if(kind==='project')state.projectId=null;if(kind==='idea'){clearTimeout(state.noteTimers.get(uid));state.drafts.delete(uid);}notify('Elemento eliminato.');});
  }
  async function handleAction(el,event){
    const a=el.dataset.action,uid=el.dataset.id;
    if(a==='demo'){closeModal();startDemo();return;}
    if(a==='setup'){setupDialog();return;}
    if(a==='close-modal'){closeModal();return;}
    if(!state.user)return;
    switch(a){
      case 'nav':state.view=el.dataset.view;state.projectId=null;if(state.view==='ideas')state.ideaFilter='all';renderContent();window.scrollTo(0,0);break;
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
      case 'new-event':eventForm(null,{date:el.dataset.date,project:el.dataset.project});break;
      case 'edit-event':eventForm(uid);break;
      case 'calendar-slot':{
        if(event.target.closest('.calendar-event'))break;const rect=el.getBoundingClientRect(),mins=Math.min(1425,Math.max(0,Math.floor((event.clientY-rect.top)/15)*15));eventForm(null,{date:el.dataset.date,time:`${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`});break;
      }
      case 'cal-view':state.calView=el.dataset.view;renderContent();break;
      case 'cal-prev':case 'cal-next':{const n=a==='cal-prev'?-1:1;if(state.calView==='week')state.calDate=shiftDay(state.calDate,n*7);else state.calDate=new Date(state.calDate.getFullYear(),state.calDate.getMonth()+n,1);renderContent();break;}
      case 'cal-today':state.calDate=today();renderContent();break;
      case 'new-idea':ideaForm();break;
      case 'edit-idea':ideaForm(uid);break;
      case 'idea-filter':state.ideaFilter=el.dataset.filter;renderContent(true);break;
      case 'project-ideas':state.view='ideas';state.ideaFilter=uid;state.projectId=null;renderContent();window.scrollTo(0,0);break;
      case 'copy-draft':{
        const d=state.drafts.get(uid),n=state.ideas.find(i=>i.id===uid)||d?.snapshot;if(!d||!n)break;await insert('ideas',{title:n.title+' · copia',content:d.content,project_id:project(n.project_id)?n.project_id:null,color:n.color,created_by:state.user.id,updated_by:state.user.id});state.drafts.delete(uid);notify('Il tuo testo è salvato in una nuova idea.');renderContent(true);break;
      }
      case 'retry-note':await saveDraft(uid);renderContent(true);break;
      case 'new-transaction':transactionForm();break;
      case 'edit-transaction':transactionForm(uid);break;
      case 'delete-project':case 'delete-event':case 'delete-idea':case 'delete-transaction':await deleteItem(a.slice(7),uid);break;
      case 'search':searchDialog();break;
      case 'search-result':{
        const type=el.dataset.type;closeModal();if(type==='project'){state.view='projects';state.projectId=uid;renderContent();}else if(type==='event'){eventForm(uid);}else{state.view='ideas';state.ideaFilter='all';renderContent();const input=$$('[data-note-id]').find(e=>e.dataset.noteId===uid);if(input){input.scrollIntoView({behavior:'smooth',block:'center'});input.focus({preventScroll:true});}}break;
      }
      case 'export-finance':exportFinance();break;
      case 'export-calendar':exportCalendar();break;
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
      if(el.dataset.action==='task-owner'||el.dataset.action==='task-date'){
        const t=state.tasks.find(t=>t.id===el.dataset.id);if(!t)return;const values=el.dataset.action==='task-owner'?{owner_id:el.value||null}:{due_date:el.value||null};el.disabled=true;await update('tasks',t.id,values,t.version);renderContent(true);notify('Attività aggiornata.');
      }
    }catch(err){el.disabled=false;if(!state.demo){try{await loadRemote();}catch{}}renderContent(true);notify(err.message==='CONFLICT'?'L’attività è stata modificata dall’altro account. Controlla i dati aggiornati.':err.message,true);}
  });
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&state.user){e.preventDefault();searchDialog();}
    if((e.metaKey||e.ctrlKey)&&e.shiftKey&&e.key.toLowerCase()==='n'&&state.user&&!$('#modal').open){e.preventDefault();({projects:projectForm,calendar:eventForm,ideas:ideaForm,revenues:transactionForm,settings:()=>{}}[state.view])();}
    if((e.key==='Enter'||e.key===' ')&&e.target.matches('.day-column,.month-day')){e.preventDefault();eventForm(null,{date:e.target.dataset.date});}
  });
  window.addEventListener('beforeunload',e=>{if([...state.drafts.values()].some(d=>d.dirty||d.saving)){e.preventDefault();e.returnValue='';}});
  window.addEventListener('offline',()=>{if(state.user&&!state.demo){state.connected=false;updateSync();notify('Connessione assente. Le modifiche non salvate restano in questa finestra.',true);}});
  window.addEventListener('online',async()=>{if(state.user&&!state.demo){try{await loadRemote();for(const uid of state.drafts.keys())await saveDraft(uid);renderContent(true);}catch(e){notify(e.message,true);}}});
  if(new URLSearchParams(location.search).get('demo')==='1')startDemo();else renderLogin();
  if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  function renderProject(){
    const p=project(state.projectId);if(!p){state.projectId=null;return renderProjects();}const pr=progress(p);
    return `<button class="back-btn" data-action="back-projects">${icon('left',13)}Tutti i progetti</button><div class="detail-header"><div class="app-icon ${p.color}">${projectIcon(p)}</div><div><h1>${esc(p.name)}</h1><p>${esc(p.description)}</p></div><div class="detail-actions"><button class="btn" data-action="edit-project" data-id="${p.id}">${icon('edit',14)}<span>Modifica</span></button><button class="btn" data-action="new-event" data-project="${p.id}">${icon('calendar',14)}<span>Pianifica una call</span></button></div></div><div class="card detail-summary"><div class="progress-area"><div class="progress-label"><span>Il viaggio, fin qui</span><strong>${pr.percent}%</strong></div><div class="progress-track ${p.color}"><span style="width:${pr.percent}%"></span></div></div><span class="tag blue">${pr.done} / ${pr.total} attività</span><div class="detail-meta"><span class="row">${avatars(p.owner_id)}${esc(memberName(p.owner_id))}</span><span>${icon('calendar',13)} ${p.due_date?fmtDate(p.due_date):'Scadenza da definire'}</span><span class="tag">${esc(p.platform)}</span></div></div><div class="roadmap">${STAGES.map((st,stage)=>{const tasks=tasksOf(p.id).filter(t=>t.stage===stage),completed=tasks.filter(t=>t.done).length;return `<section class="card phase"><div class="phase-header"><span class="phase-number">${completed===tasks.length?icon('check',15):String(stage+1).padStart(2,'0')}</span><div><h2>${esc(st.title)}</h2><p>${esc(st.subtitle)}</p></div><span class="tag ${completed===tasks.length?'green':''}">${completed} di ${tasks.length}</span></div><div class="task-list">${tasks.map(t=>`<div class="task-row"><button class="task-check ${t.done?'checked':''}" data-action="toggle-task" data-id="${t.id}" role="checkbox" aria-checked="${t.done}" aria-label="${esc(t.title)}">${t.done?icon('check',12):''}</button><span class="task-title ${t.done?'done':''}">${esc(t.title)}</span><select class="task-owner" data-action="task-owner" data-id="${t.id}" data-focus-key="owner-${t.id}" aria-label="Responsabile: ${esc(t.title)}">${ownerOptions(t.owner_id)}</select><input class="task-date ${!t.done&&t.due_date&&t.due_date<dateKey(today())?'overdue':''}" type="date" value="${esc(t.due_date||'')}" data-action="task-date" data-id="${t.id}" data-focus-key="date-${t.id}" aria-label="Scadenza: ${esc(t.title)}"></div>`).join('')}</div></section>`;}).join('')}</div><div class="detail-bottom"><div class="card detail-panel"><h2>Le idee dietro l’app</h2><p>Intuizioni, spunti e cose da riprendere insieme.</p><button class="btn small" data-action="project-ideas" data-id="${p.id}">${icon('ideas',13)}Apri le idee ${icon('arrow',12)}</button></div><div class="card detail-panel"><h2>Come sta andando?</h2><p>Ricavi e costi registrati per ${esc(p.name)}.</p><span class="tag green">${money(state.transactions.filter(t=>t.project_id===p.id).reduce((sum,t)=>sum+(t.type==='revenue'?Number(t.amount):-Number(t.amount)),0))} di risultato</span></div></div>`;
  }

})();
