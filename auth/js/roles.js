const AUTH_PROFILE_ROUTES={trainee:"trainee-profile.html",provider:"provider-profile.html",employer:"employer-profile.html",admin:"admin-profile.html"};
const AUTH_MODULE_ROUTES={trainee:"../person1/dashboard.html",provider:"../person2/index.html",employer:"../person3/index.html",admin:"admin-profile.html"};
const AUTH_ROLE_LABELS={trainee:"Trainee",provider:"Training Provider",employer:"Employer",admin:"Government / Admin"};
async function getAuthenticatedRole(user){
  if(!user)return null;
  if(user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin")return "admin";
  for(const [role,table] of [["trainee","trainees"],["provider","training_providers"],["employer","employers"]]){
    const {data,error}=await supabaseClient.from(table).select("id").eq("user_id",user.id).maybeSingle();
    if(!error&&data)return role;
  }
  return user.user_metadata?.role||null;
}
function getRoleRoute(role){return AUTH_PROFILE_ROUTES[role]||"index.html";}
function getModuleRoute(role){return AUTH_MODULE_ROUTES[role]||"index.html";}
