// Zamari Guest Club — client starter. Never place a Supabase service-role key here.
const SUPABASE_URL = "https://hotwkjqhcvngmqodsxrk.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_PUBLISHABLE_KEY";
const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
const db = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = (id) => document.getElementById(id);
let mode = "signup";
let currentUser = null;

$("year").textContent = new Date().getFullYear();
$("connection-status").textContent = configured ? "Connected" : "Preview mode";

document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  mode = tab.dataset.mode;
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === tab));
  $("full-name").closest("label").classList.toggle("hidden", mode === "login");
  $("full-name").required = mode === "signup";
  $("password").autocomplete = mode === "signup" ? "new-password" : "current-password";
  $("auth-submit").textContent = mode === "signup" ? "Create my account" : "Sign in";
  $("auth-message").textContent = "";
}));

$("auth-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("email").value.trim();
  const password = $("password").value;
  const name = $("full-name").value.trim();
  if (!db) {
    $("auth-message").textContent = "Preview only. Connect your Supabase project to enable real accounts.";
    return;
  }
  $("auth-submit").disabled = true;
  try {
    const result = mode === "signup"
      ? await db.auth.signUp({ email, password, options: { data: { full_name: name } } })
      : await db.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    if (mode === "signup" && !result.data.session) {
      $("auth-message").textContent = "Check your email to confirm your account, then sign in.";
    } else {
      await loadMember(result.data.user);
    }
  } catch (error) {
    $("auth-message").textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    $("auth-submit").disabled = false;
  }
});

async function loadMember(user) {
  currentUser = user;
  $("auth-panel").classList.add("hidden");
  $("dashboard").classList.remove("hidden");
  $("logout-btn").classList.remove("hidden");
  $("member-name").textContent = user.user_metadata?.full_name || user.email?.split("@")[0] || "Guest";
  if (db) {
    const { data, error } = await db.from("profiles").select("credits, full_name").eq("id", user.id).maybeSingle();
    if (!error && data) {
      $("credit-total").textContent = data.credits ?? 0;
      $("member-name").textContent = data.full_name || $("member-name").textContent;
    }
  }
}

$("logout-btn").addEventListener("click", async () => {
  if (db) await db.auth.signOut();
  currentUser = null;
  $("dashboard").classList.add("hidden");
  $("auth-panel").classList.remove("hidden");
  $("logout-btn").classList.add("hidden");
});

$("feedback-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!db || !currentUser) {
    $("feedback-message").textContent = "Feedback will be saved once your account and database are connected.";
    return;
  }
  const payload = {
    user_id: currentUser.id,
    category: $("category").value.toLowerCase(),
    rating: Number($("rating").value),
    comment: $("comment").value.trim()
  };
  const { error } = await db.from("feedback").insert(payload);
  $("feedback-message").textContent = error ? error.message : "Thank you. Your feedback has been received.";
  if (!error) $("feedback-form").reset();
});

if (db) {
  db.auth.getSession().then(({ data }) => {
    if (data.session?.user) loadMember(data.session.user);
  });
  db.auth.onAuthStateChange((_event, session) => {
    if (session?.user) loadMember(session.user);
  });
}
