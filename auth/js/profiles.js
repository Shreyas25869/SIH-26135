(() => {
  const $ = id => document.getElementById(id);
  const tableByRole = { trainee: 'trainees', provider: 'training_providers', employer: 'employers' };
  const fieldMap = {
    trainee: { full_name:'full_name', date_of_birth:'date_of_birth', phone:'phone', gender:'gender', district:'district', state:'state', preferred_language:'preferred_language', education_level:'education_level', employment_status:'employment_status' },
    provider: { name:'name', organization_type:'organization_type', established_year:'established_year', location:'location', address:'address', contact_person:'contact_person', designation:'designation', phone:'phone', contact_email:'contact_email', website:'website', description:'description' },
    employer: { name:'name', industry:'industry', location:'location', contact_person:'contact_person', contact_email:'contact_email', phone:'phone', description:'description' }
  };
  function msg(text,type='info'){ const el=$('profile-message'); if(!el)return; el.textContent=text; el.className=`profile-message ${type}`; }
  function value(id){ const el=$(id); return el ? (el.value || '').trim() : ''; }
  function set(id,v){ const el=$(id); if(el) el.value = v ?? ''; }
  function toastLike(text,type='success'){ msg(text,type); }
  async function getSession(){ const {data,error}=await window.supabaseClient.auth.getSession(); if(error)throw error; if(!data.session) throw new Error('Your session has expired. Please sign in again.'); return data.session; }
  async function loadRole(role){
    const session=await getSession();
    if(role==='admin'){
      const m=session.user.user_metadata||{}; set('name',m.full_name||session.user.email?.split('@')[0]||''); set('email',session.user.email||''); set('department',m.department||''); set('designation',m.designation||''); set('contact',m.contact||''); set('state',m.state||''); set('district',m.district||''); return;
    }
    const table=tableByRole[role];
    const {data,error}=await window.supabaseClient.from(table).select('*').eq('user_id',session.user.id).maybeSingle();
    if(error) throw error;
    if(!data){ msg('No profile exists yet. Fill the form and save it.', 'info'); return; }
    const map=fieldMap[role]; Object.entries(map).forEach(([id,col])=>set(id,data[col]));
    if(role==='trainee') set('email',session.user.email);
    if(role==='provider') set('email',data.contact_email);
    if(role==='employer') set('email',data.contact_email);
  }
  async function saveRole(role){
    const session=await getSession();
    if(role==='admin'){
      const {error}=await window.supabaseClient.auth.updateUser({data:{full_name:value('name'),department:value('department'),designation:value('designation'),contact:value('contact'),state:value('state'),district:value('district'),role:'admin'}});
      if(error)throw error; toastLike('Administrator profile updated.'); return;
    }
    const table=tableByRole[role], map=fieldMap[role], payload={user_id:session.user.id};
    Object.entries(map).forEach(([id,col])=>{ const v=value(id); if(v!=='') payload[col]=v; else payload[col]=null; });
    if(role==='trainee' && !payload.full_name) throw new Error('Full name is required.');
    if(role==='provider' && !payload.name) throw new Error('Organization name is required.');
    if(role==='employer' && (!payload.name || !payload.industry)) throw new Error('Company name and industry are required.');
    if(role==='provider' && payload.established_year) payload.established_year=Number(payload.established_year);
    const {data:existing,error:findError}=await window.supabaseClient.from(table).select('id').eq('user_id',session.user.id).maybeSingle();
    if(findError)throw findError;
    const query=existing ? window.supabaseClient.from(table).update(payload).eq('id',existing.id) : window.supabaseClient.from(table).insert(payload);
    const {error}=await query; if(error)throw error;
    toastLike(existing ? 'Profile updated successfully.' : 'Profile created successfully.');
  }
  function wire(role){
    const form=$('profile-form'); if(!form)return;
    form.addEventListener('submit',async e=>{e.preventDefault(); msg('Saving…','info'); try{await saveRole(role)}catch(err){console.error(err);msg(err.message||'Unable to save profile.','error')}});
    const back=$('back-btn'); if(back)back.addEventListener('click',()=>location.href='index.html');
    document.querySelectorAll('[data-logout]').forEach(b=>b.addEventListener('click',async()=>{await window.supabaseClient.auth.signOut();location.href='index.html'}));
    loadRole(role).catch(err=>{console.error(err);msg(err.message||'Unable to load profile.','error')});
  }
  window.initProfile=wire;
})();
