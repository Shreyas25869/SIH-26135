let currentUser = null;
let currentTrainee = null;
const message = document.getElementById("message");
function escapeHtml(value){return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function money(min,max){if(min==null&&max==null)return "Not specified";const f=v=>v==null?"":`₹${Number(v).toLocaleString("en-IN")}`;return min!=null&&max!=null?`${f(min)} – ${f(max)}`:f(min??max);}
async function loadJobs(){
 const jobsEl=document.getElementById("jobsList");
 const {data:jobs,error}=await supabaseClient.from("jobs").select("id,title,description,location,employment_type,category,experience_min_years,salary_min,salary_max,education,status").eq("status","Open").order("created_at",{ascending:false});
 if(error)throw error;
 const {data:apps,error:appError}=await supabaseClient.from("applications").select("id,job_id,status,applied_at,notes").eq("trainee_id",currentTrainee.id).order("applied_at",{ascending:false});
 if(appError)throw appError;
 const applied=new Set((apps||[]).map(a=>a.job_id));
 jobsEl.innerHTML=(jobs||[]).map(j=>`<article class="panel"><div class="section-head"><div><h2>${escapeHtml(j.title)}</h2><p>${escapeHtml(j.category||j.employment_type||"Opportunity")}</p></div><span class="status-badge">Open</span></div><p class="muted">${escapeHtml(j.description||"No description provided.")}</p><div class="grid grid-2"><div><strong>Location</strong><div class="muted">${escapeHtml(j.location||"Not specified")}</div></div><div><strong>Education</strong><div class="muted">${escapeHtml(j.education||"Not specified")}</div></div><div><strong>Experience</strong><div class="muted">${Number(j.experience_min_years||0)}+ years</div></div><div><strong>Salary</strong><div class="muted">${escapeHtml(money(j.salary_min,j.salary_max))}</div></div></div><div class="form-actions end"><button class="btn ${applied.has(j.id)?"btn-ghost":"btn-primary"}" ${applied.has(j.id)?"disabled":""} data-apply="${escapeHtml(j.id)}">${applied.has(j.id)?"Applied":"Apply now"}</button></div></article>`).join("")||`<article class="panel"><h2>No open jobs</h2><p class="muted">Employers have not posted any open opportunities yet.</p></article>`;
 document.querySelectorAll("[data-apply]").forEach(b=>b.onclick=()=>apply(b.dataset.apply));
 document.getElementById("applicationRows").innerHTML=(apps||[]).map(a=>{const j=(jobs||[]).find(x=>x.id===a.job_id);return `<tr><td><strong>${escapeHtml(j?.title||a.job_id)}</strong></td><td>${escapeHtml(a.status||"Applied")}</td><td>${escapeHtml(a.applied_at?new Date(a.applied_at).toLocaleDateString("en-IN"):"—")}</td><td>${escapeHtml(a.notes||"—")}</td></tr>`}).join("")||`<tr><td colspan="4" class="table-empty">No applications yet.</td></tr>`;
}
async function apply(jobId){
 message.className="form-message";message.textContent="Submitting application…";
 try{const {error}=await supabaseClient.from("applications").insert({job_id:jobId,trainee_id:currentTrainee.id,status:"Applied",applied_at:new Date().toISOString()});if(error)throw error;message.className="form-message success";message.textContent="Application submitted successfully.";await loadJobs();}catch(error){console.error(error);message.className="form-message error";message.textContent=error.message||"Unable to submit application.";}
}
document.getElementById("logoutButton").addEventListener("click",signOutAndRedirect);
(async()=>{try{currentUser=await requireUser();currentTrainee=await requireTrainee(currentUser.id);if(!currentTrainee)throw new Error("Complete your trainee profile before applying to jobs.");await loadJobs();}catch(error){console.error(error);message.className="form-message error";message.textContent=error.message;}})();
