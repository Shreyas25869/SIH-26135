const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  message.className = "form-message info";
  message.textContent = "Signing in...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message.className = "form-message error";
    message.textContent = error.message;
    return;
  }

  message.className = "form-message success";
  message.textContent = "Login successful. Redirecting...";
  window.location.href = "dashboard.html";
});

(async () => {
  try {
    const user = await getCurrentUser();
    if (user) window.location.href = "dashboard.html";
  } catch (error) {
    console.error(error);
  }
})();
