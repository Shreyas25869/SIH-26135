async function currentUser(){const {data,error}=await supabaseClient.auth.getUser();if(error)throw error;return data.user;}
async function requireUser(){const u=await currentUser();if(!u){location.href="login.html";return null;}return u;}
