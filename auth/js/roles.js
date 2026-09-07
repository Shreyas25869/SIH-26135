const AUTH_ROLE_ROUTES={trainee:"trainee-profile.html",provider:"provider-profile.html",employer:"employer-profile.html",admin:"admin-profile.html"};
const AUTH_ROLE_LABELS={trainee:"Trainee",provider:"Training Provider",employer:"Employer",admin:"Government / Admin"};
async function getAuthenticatedRole(user){
  if(!user)return null;
  if(user.app_metadata?.role==="admin")return "admin";
  for(const [role,table] of [["trainee","trainees"],["provider","training_providers"],["employer","employers"]]){
    const {data,error}=await supabaseClient.from(table).select("id").eq("user_id",user.id).maybeSingle();
    if(!error&&data)return role;
  }
  return user.user_metadata?.role||null;
}
function getRoleRoute(role){return AUTH_ROLE_ROUTES[role]||"index.html";}
