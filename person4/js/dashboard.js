document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user=await window.SIHAuth.getCurrentUser(); if(!user)return;
    const role=await window.getAuthenticatedRole(user);
    if(role==="admin"){await loadAdminDashboard(user);return;}
    const {data:trainee,error}=await supabaseClient.from("trainees").select("id,full_name,employment_status").eq("user_id",user.id).maybeSingle();
    if(error)throw error;if(!trainee){document.querySelector("#status").textContent="Complete your trainee profile first.";return;}
    const [training,enrollments,applications,employment,followups,gaps,notifications]=await Promise.all([
      supabaseClient.from("trainee_training").select("id").eq("trainee_id",trainee.id),supabaseClient.from("enrollments").select("id").eq("trainee_id",trainee.id),supabaseClient.from("applications").select("id,status").eq("trainee_id",trainee.id),supabaseClient.from("employment").select("id").eq("trainee_id",trainee.id),supabaseClient.from("trainee_followups").select("id").eq("trainee_id",trainee.id),supabaseClient.from("skill_gaps").select("id,status").eq("trainee_id",trainee.id),supabaseClient.from("notifications").select("id").eq("user_id",user.id)]);
    for(const r of [training,enrollments,applications,employment,followups,gaps,notifications])if(r.error)throw r.error;
    document.querySelector("#status").textContent=`Signed in as ${user.email}${trainee.full_name?` · ${trainee.full_name}`:""}`;
    document.querySelector("#followups").textContent=followups.data?.length||0;document.querySelector("#history").textContent=employment.data?.length||0;document.querySelector("#gaps").textContent=(gaps.data||[]).filter(x=>String(x.status||"").toLowerCase()!=="resolved").length;document.querySelector("#notifications").textContent=notifications.data?.length||0;
    const s=document.querySelector("#outcomeSummary");if(s)s.innerHTML=`<div><strong>${enrollments.data?.length||0}</strong><span>Provider enrollments</span></div><div><strong>${training.data?.length||0}</strong><span>Training records</span></div><div><strong>${applications.data?.length||0}</strong><span>Applications</span></div><div><strong>${(applications.data||[]).filter(x=>String(x.status).toLowerCase()==="selected").length}</strong><span>Selected</span></div><div><strong>${employment.data?.length||0}</strong><span>Employment records</span></div>`;
  }catch(e){document.querySelector("#status").textContent=e.message;}});
async function loadAdminDashboard(user){
  const tables=["trainees","trainee_skills","trainee_training","enrollments","applications","employment","employment_verifications","skill_gaps","trainee_followups","notifications"];
  const rs=await Promise.all(tables.map(t=>supabaseClient.from(t).select("id",{count:"exact",head:true})));for(const r of rs)if(r.error)throw r.error;const c=Object.fromEntries(tables.map((t,i)=>[t,rs[i].count||0]));
  document.querySelector("#status").textContent=`Government analytics view · ${user.email}`;document.querySelector("#followups").textContent=c.trainee_followups;document.querySelector("#history").textContent=c.employment;document.querySelector("#gaps").textContent=c.skill_gaps;document.querySelector("#notifications").textContent=c.notifications;
  const s=document.querySelector("#outcomeSummary");if(s)s.innerHTML=`<div><strong>${c.trainees}</strong><span>Trainees</span></div><div><strong>${c.trainee_training}</strong><span>Training records</span></div><div><strong>${c.enrollments}</strong><span>Provider enrollments</span></div><div><strong>${c.applications}</strong><span>Applications</span></div><div><strong>${c.employment}</strong><span>Employment records</span></div><div><strong>${c.employment_verifications}</strong><span>Verifications</span></div>`;
}
