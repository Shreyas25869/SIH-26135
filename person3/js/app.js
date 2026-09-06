const state = { session: null, employers: [], jobs: [], applications: [], employment: [], verifications: [] };

const $ = id => document.getElementById(id);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (v, period="") => v == null || v === "" ? "—" : `₹${Number(v).toLocaleString("en-IN")}${period ? ` / ${period.toLowerCase()}` : ""}`;
function toast(msg, error=false){ const t=$("toast"); t.textContent=msg; t.classList.toggle("error",error); t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }
function requireClient(){ if(!window.supabaseClient) throw new Error("Supabase is not configured. Edit js/config.js."); return window.supabaseClient; }
function showError(err){ console.error(err); toast(err.message || String(err), true); }

async function boot(){
  if(!window.supabaseClient){ $("auth-screen").classList.remove("hidden"); $("login-error").textContent="Configure js/config.js before using the application."; return; }
  const {data:{session}} = await supabaseClient.auth.getSession();
  if(session) await enterApp(session);
  supabaseClient.auth.onAuthStateChange((_event, session)=>{ if(session) enterApp(session); else showLogin(); });
}
async function enterApp(session){
  state.session=session; $("auth-screen").classList.add("hidden"); $("app-shell").classList.remove("hidden");
  $("user-email").textContent=session.user.email || "";
  await refreshAll();
}
function showLogin(){ $("app-shell").classList.add("hidden"); $("auth-screen").classList.remove("hidden"); }

$("login-form").addEventListener("submit", async e=>{
  e.preventDefault(); $("login-error").textContent="";
  try{
    const {error}=await requireClient().auth.signInWithPassword({email:$("login-email").value.trim(),password:$("login-password").value});
    if(error) throw error;
  }catch(err){ $("login-error").textContent=err.message; }
});
$("logout-btn").addEventListener("click", async()=>{ try{ await requireClient().auth.signOut(); }catch(e){showError(e)} });

document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.view)));
function navigate(view){
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${view}`));
  render(view);
}

async function load(table, select="*"){
  const {data,error}=await requireClient().from(table).select(select);
  if(error) throw error; return data || [];
}
async function refreshAll(){
  try{
    [state.employers,state.jobs,state.applications,state.employment,state.verifications] = await Promise.all([
      load("employers"), load("jobs"), load("applications"), load("employment"), load("employment_verifications")
    ]);
    render("dashboard");
    populateEmployerSelects(); populateJobSelects(); populateEmploymentSelect(); renderAllTables();
  }catch(err){ showError(err); }
}

function employerName(id){ return state.employers.find(x=>x.id===id)?.name || id || "—"; }
function jobTitle(id){ return state.jobs.find(x=>x.id===id)?.title || id || "—"; }
function render(view){
  if(view==="dashboard") renderDashboard();
  if(view==="employers") renderEmployers();
  if(view==="jobs") renderJobs();
  if(view==="applications") renderApplications();
  if(view==="employment") renderEmployment();
  if(view==="verification") renderVerification();
}
function renderAllTables(){ renderEmployers(); renderJobs(); renderApplications(); renderEmployment(); renderVerification(); }

function renderDashboard(){
  const stats=[
    ["Employers",state.employers.length],
    ["Open jobs",state.jobs.filter(j=>String(j.status).toLowerCase()==="open").length],
    ["Applications",state.applications.length],
    ["Employment records",state.employment.length],
    ["Pending verification",state.verifications.filter(v=>String(v.status).toLowerCase()==="pending").length]
  ];
  $("stats").innerHTML=stats.map(([l,v])=>`<div class="stat"><div class="stat-label">${l}</div><div class="stat-value">${v}</div></div>`).join("");
  $("recent-applications").innerHTML=state.applications.slice(-5).reverse().map(a=>`<div class="list-row"><div><strong>${esc(jobTitle(a.job_id))}</strong><div class="muted">Trainee: ${esc(a.trainee_id)}</div></div><span class="badge">${esc(a.status||"Applied")}</span></div>`).join("") || `<div class="empty">No applications yet.</div>`;
  $("verification-queue").innerHTML=state.verifications.filter(v=>String(v.status).toLowerCase()==="pending").slice(-5).reverse().map(v=>`<div class="list-row"><div><strong>${esc(v.id)}</strong><div class="muted">Employment: ${esc(v.employment_id)}</div></div><span class="badge pending">Pending</span></div>`).join("") || `<div class="empty">No pending verifications.</div>`;
}

function populateEmployerSelects(){
  const opts=state.employers.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join("");
  ["job-employer","employment-employer"].forEach(id=>$(id).innerHTML=`<option value="">Select employer</option>${opts}`);
}
function populateJobSelects(){
  const opts=state.jobs.map(j=>`<option value="${j.id}">${esc(j.title)}</option>`).join("");
  $("application-job").innerHTML=`<option value="">Select job</option>${opts}`;
  $("employment-job").innerHTML=`<option value="">Optional job</option>${opts}`;
}
function populateEmploymentSelect(){
  $("verification-employment").innerHTML=`<option value="">Select employment record</option>`+state.employment.map(e=>`<option value="${e.id}">${esc(e.job_title||"Employment")} — ${esc(e.trainee_id)}</option>`).join("");
}

$("employer-form").addEventListener("submit",async e=>{
  e.preventDefault();
  try{
    const db=requireClient(), id=$("employer-id").value;
    const row={name:$("employer-name").value.trim(),industry:$("employer-industry").value.trim(),location:$("employer-location").value.trim()||null,contact_person:$("employer-contact").value.trim()||null,contact_email:$("employer-email").value.trim()||null,phone:$("employer-phone").value.trim()||null,description:$("employer-description").value.trim()||null,user_id:state.session.user.id};
    const q=id?db.from("employers").update(row).eq("id",id):db.from("employers").insert(row);
    const {error}=await q;if(error)throw error; resetEmployer();await refreshAll();toast(id?"Employer updated":"Employer created");
  }catch(err){showError(err)}
});
function resetEmployer(){ $("employer-form").reset(); $("employer-id").value=""; $("employer-cancel").classList.add("hidden"); }
$("employer-cancel").addEventListener("click",resetEmployer);
function editEmployer(id){const e=state.employers.find(x=>x.id===id);if(!e)return;$("employer-id").value=e.id;$("employer-name").value=e.name||"";$("employer-industry").value=e.industry||"";$("employer-location").value=e.location||"";$("employer-contact").value=e.contact_person||"";$("employer-email").value=e.contact_email||"";$("employer-phone").value=e.phone||"";$("employer-description").value=e.description||"";$("employer-cancel").classList.remove("hidden");navigate("employers");}
async function deleteEmployer(id){if(!confirm("Delete this employer?"))return;try{const{error}=await requireClient().from("employers").delete().eq("id",id);if(error)throw error;await refreshAll();toast("Employer deleted")}catch(e){showError(e)}}
function renderEmployers(){ $("employers-table").innerHTML=table(["Company","Industry","Location","Contact","Actions"],state.employers.map(e=>[esc(e.name),esc(e.industry),esc(e.location),esc(e.contact_email),`<button class="link-btn" onclick="editEmployer('${e.id}')">Edit</button><button class="link-btn danger-text" onclick="deleteEmployer('${e.id}')">Delete</button>`])); }

$("job-form").addEventListener("submit",async e=>{
  e.preventDefault();
  try{
    const db=requireClient(),id=$("job-id").value;
    const row={employer_id:$("job-employer").value,title:$("job-title").value.trim(),description:$("job-description").value.trim(),location:$("job-location").value.trim(),employment_type:$("job-type").value,category:$("job-category").value.trim(),experience_min_years:Number($("job-exp").value)||0,salary_min:Number($("job-salary-min").value)||null,salary_max:Number($("job-salary-max").value)||null,education:$("job-education").value,status:$("job-status").value};
    const q=id?db.from("jobs").update(row).eq("id",id):db.from("jobs").insert(row);const{error}=await q;if(error)throw error;
    $("job-form").reset();$("job-id").value="";$("job-cancel").classList.add("hidden");await refreshAll();toast(id?"Job updated":"Job posted");
  }catch(err){showError(err)}
});
$("job-cancel").addEventListener("click",()=>{$("job-form").reset();$("job-id").value="";$("job-cancel").classList.add("hidden")});
function editJob(id){const j=state.jobs.find(x=>x.id===id);if(!j)return;$("job-id").value=j.id;$("job-employer").value=j.employer_id||"";$("job-title").value=j.title||"";$("job-location").value=j.location||"";$("job-type").value=j.employment_type||"Full-time";$("job-category").value=j.category||"";$("job-exp").value=j.experience_min_years||0;$("job-salary-min").value=j.salary_min||"";$("job-salary-max").value=j.salary_max||"";$("job-education").value=j.education||"None";$("job-status").value=j.status||"Open";$("job-description").value=j.description||"";$("job-cancel").classList.remove("hidden");navigate("jobs");}
async function deleteJob(id){if(!confirm("Delete this job?"))return;try{const{error}=await requireClient().from("jobs").delete().eq("id",id);if(error)throw error;await refreshAll();toast("Job deleted")}catch(e){showError(e)}}
function renderJobs(){ $("jobs-table").innerHTML=table(["Title","Employer","Location","Type","Status","Actions"],state.jobs.map(j=>[esc(j.title),esc(employerName(j.employer_id)),esc(j.location),esc(j.employment_type),`<span class="badge ${String(j.status||"").toLowerCase()}">${esc(j.status)}</span>`,`<button class="link-btn" onclick="editJob('${j.id}')">Edit</button><button class="link-btn danger-text" onclick="deleteJob('${j.id}')">Delete</button>`])); }

$("application-form").addEventListener("submit",async e=>{
  e.preventDefault();
  try{
    const row={job_id:$("application-job").value,trainee_id:$("application-trainee").value.trim(),status:$("application-status").value,notes:$("application-notes").value.trim()||null,applied_at:new Date().toISOString()};
    const{error}=await requireClient().from("applications").insert(row);if(error)throw error;$("application-form").reset();await refreshAll();toast("Application created");
  }catch(err){showError(err)}
});
async function updateApplication(id,status){try{const{error}=await requireClient().from("applications").update({status}).eq("id",id);if(error)throw error;await refreshAll();toast("Application updated")}catch(e){showError(e)}}
function renderApplications(){ $("applications-table").innerHTML=table(["Job","Trainee","Applied","Status","Actions"],state.applications.map(a=>[esc(jobTitle(a.job_id)),esc(a.trainee_id),esc(a.applied_at?new Date(a.applied_at).toLocaleDateString("en-IN"):"—"),`<select onchange="updateApplication('${a.id}',this.value)">${["Applied","Shortlisted","Interview","Selected","Rejected","Withdrawn"].map(s=>`<option ${s===a.status?"selected":""}>${s}</option>`).join("")}</select>`,""])); }

$("employment-form").addEventListener("submit",async e=>{
  e.preventDefault();
  try{
    const row={trainee_id:$("employment-trainee").value.trim(),employer_id:$("employment-employer").value,job_id:$("employment-job").value||null,job_title:$("employment-title").value.trim(),employment_type:$("employment-type").value,start_date:$("employment-start").value,end_date:$("employment-end").value||null,salary:Number($("employment-salary").value)||null,salary_period:$("employment-period").value,location:$("employment-location").value.trim()||null,reason_for_leaving:$("employment-reason").value.trim()||null,verification_status:"Pending"};
    const{error}=await requireClient().from("employment").insert(row);if(error)throw error;$("employment-form").reset();await refreshAll();toast("Employment record saved");
  }catch(err){showError(err)}
});
function renderEmployment(){ $("employment-table").innerHTML=table(["Trainee","Employer","Role","Start","Salary","Verification"],state.employment.map(e=>[esc(e.trainee_id),esc(employerName(e.employer_id)),esc(e.job_title),esc(e.start_date),money(e.salary,e.salary_period),`<span class="badge">${esc(e.verification_status||"Pending")}</span>`])); }

$("verification-form").addEventListener("submit",async e=>{
  e.preventDefault();
  try{
    const row={employment_id:$("verification-employment").value,status:$("verification-status").value,verified_salary:Number($("verification-salary").value)||null,verified_start_date:$("verification-start").value||null,notes:$("verification-notes").value.trim()||null,verified_by:state.session.user.id,verified_at:$("verification-status").value==="Verified"?new Date().toISOString():null};
    const{error}=await requireClient().from("employment_verifications").insert(row);if(error)throw error;$("verification-form").reset();await refreshAll();toast("Verification saved");
  }catch(err){showError(err)}
});
function renderVerification(){ $("verification-table").innerHTML=table(["Employment","Status","Verified salary","Verified date","Notes"],state.verifications.map(v=>[esc(v.employment_id),`<span class="badge ${String(v.status||"").toLowerCase()}">${esc(v.status)}</span>`,money(v.verified_salary),esc(v.verified_at?v.verified_at.split("T")[0]:"—"),esc(v.notes)])); }

function table(headers,rows){
  if(!rows.length)return `<div class="empty">No records found.</div>`;
  return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
boot();
