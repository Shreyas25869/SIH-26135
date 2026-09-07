document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user=await requireUser(); if(!user)return;
    const {data: trainee,error:te}=await supabaseClient.from("trainees").select("id").eq("user_id",user.id).maybeSingle();
    if(te)throw te; if(!trainee)throw Error("No trainee profile found.");
    const {data: employment,error}=await supabaseClient.from("employment").select("id,employer_id,job_id,job_title,employment_type,start_date,end_date,salary,salary_period,location,reason_for_leaving,verification_status,created_at").eq("trainee_id",trainee.id).order("start_date",{ascending:false});
    if(error)throw error;
    const ids=(employment||[]).map(x=>x.id); let ver=[];
    if(ids.length){const r=await supabaseClient.from("employment_verifications").select("employment_id,status,verified_salary,verified_start_date,verified_at,notes").in("employment_id",ids);if(r.error)throw r.error;ver=r.data||[];}
    const vm=new Map(ver.map(x=>[x.employment_id,x]));
    document.getElementById("list").innerHTML=(employment||[]).map(x=>{const v=vm.get(x.id);return `<tr><td>${esc(x.job_title||"—")}</td><td>${esc(x.employment_type||"—")}</td><td>${esc(x.start_date||"—")} → ${esc(x.end_date||"Present")}</td><td>${money(x.salary,x.salary_period)}</td><td>${esc(x.location||"—")}</td><td><span class="badge">${esc(v?.status||x.verification_status||"Pending")}</span></td></tr>`}).join("")||`<tr><td colspan="6">No employment records yet. Employment created by the employer module will appear here.</td></tr>`;
  } catch(e){document.getElementById("message").textContent=e.message;}
});
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function money(v,p){return v==null||v===""?"—":`₹${Number(v).toLocaleString("en-IN")}${p?` / ${esc(p)}`:""}`;}
