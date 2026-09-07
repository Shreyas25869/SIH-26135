document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user=await requireUser(); if(!user)return;
    const {data: trainee,error:te}=await supabaseClient.from("trainees").select("id").eq("user_id",user.id).maybeSingle();
    if(te)throw te;if(!trainee)throw Error("No trainee profile found.");
    const [skills,gaps]=await Promise.all([supabaseClient.from("trainee_skills").select("skill_name,skill_category,proficiency_level").eq("trainee_id",trainee.id),supabaseClient.from("skill_gaps").select("skill_name,skill_category,required_level,current_level,gap_score,identified_from,recommended_action,status,target_job_id").eq("trainee_id",trainee.id).order("created_at",{ascending:false})]);
    if(skills.error)throw skills.error;if(gaps.error)throw gaps.error;
    document.getElementById("skillsList").innerHTML=(skills.data||[]).map(x=>`<tr><td>${esc(x.skill_name)}</td><td>${esc(x.skill_category||"—")}</td><td>${esc(x.proficiency_level||"—")}</td></tr>`).join("")||`<tr><td colspan="3">No trainee skill records yet.</td></tr>`;
    document.getElementById("list").innerHTML=(gaps.data||[]).map(x=>`<tr><td>${esc(x.skill_name)}</td><td>${esc(x.current_level??"—")}</td><td>${esc(x.required_level??"—")}</td><td>${esc(x.gap_score??"—")}</td><td>${esc(x.identified_from||"—")}</td><td>${esc(x.recommended_action||"—")}</td><td>${esc(x.status||"—")}</td></tr>`).join("")||`<tr><td colspan="7">No skill-gap records yet.</td></tr>`;
  }catch(e){document.getElementById("message").textContent=e.message;}
});
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
