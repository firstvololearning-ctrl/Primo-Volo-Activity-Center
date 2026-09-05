import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://apkvvspubolyxlqtlkto.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_0O4rNLfhuW18xYRZSPkLpw_xyXR9d3n";
const PRODUCT_KEY = "primo-volo";
const ACCOUNT_HOME_URL = "https://firstvololearning-ctrl.github.io/First-Volo-Account/";
const EDUCATOR_SIGN_IN_URL = `${ACCOUNT_HOME_URL}?returnTo=primoVolo`;
const STUDENT_SIGN_IN_URL = `${ACCOUNT_HOME_URL}student-login.html?returnTo=primoVolo`;
const STUDENT_HOME_URL = `${ACCOUNT_HOME_URL}student-login.html`;
const educatorOnly = document.documentElement.dataset.primoAccessRole === "educator";
const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

function firstRow(data) {
  return Array.isArray(data) ? (data[0] || null) : (data || null);
}

function activeEntitlement(row) {
  const now = Date.now();
  const startsAt = Date.parse(row?.starts_at);
  const expiresAt = Date.parse(row?.expires_at);
  return row?.product_key === PRODUCT_KEY &&
    row?.status === "active" &&
    Number.isFinite(startsAt) &&
    Number.isFinite(expiresAt) &&
    startsAt <= now &&
    expiresAt > now;
}

async function authorize(session) {
  const user = session?.user;
  if (!user) return { status: "signed-out" };
  if (user.is_anonymous === true) {
    if (educatorOnly) return { status: "wrong-role" };
    const [contextResult, accessResult] = await Promise.all([
      client.rpc("get_student_session_context"),
      client.rpc("get_student_product_access")
    ]);
    const context = firstRow(contextResult.data);
    const allowed = !contextResult.error &&
      !accessResult.error &&
      context?.student_id &&
      (accessResult.data || []).some((row) => row?.product_key === PRODUCT_KEY);
    return allowed ? { status: "authorized", mode: "student" } : { status: "no-access" };
  }
  const result = await client.from("product_entitlements")
    .select("product_key,status,starts_at,expires_at")
    .eq("owner_user_id", user.id)
    .eq("product_key", PRODUCT_KEY);
  const allowed = !result.error && (result.data || []).some(activeEntitlement);
  return allowed ? { status: "authorized", mode: "educator" } : { status: "no-access" };
}

function link(label, href, primary = false) {
  const element = document.createElement("a");
  element.className = `pv-secondary-access-link${primary ? " is-primary" : ""}`;
  element.href = href;
  element.textContent = label;
  return element;
}

function showLocked(result) {
  const shell = document.createElement("main");
  shell.className = "pv-secondary-access-shell";
  const card = document.createElement("section");
  card.className = "pv-secondary-access-card";
  const title = document.createElement("h1");
  const message = document.createElement("p");
  const actions = document.createElement("div");
  actions.className = "pv-secondary-access-actions";
  if (result.status === "wrong-role") {
    title.textContent = "Educator access required";
    message.textContent = "This Primo Volo resource is available through an authorized educator account.";
    actions.append(link("Return to Student Sign In", STUDENT_HOME_URL, true));
  } else if (result.status === "no-access") {
    title.textContent = "Primo Volo is not included";
    message.textContent = "This account does not currently have access to this Primo Volo resource.";
    actions.append(link("View My First Volo", ACCOUNT_HOME_URL, true));
  } else {
    title.textContent = "Primo Volo is locked";
    message.textContent = "Sign in through My First Volo to continue.";
    actions.append(
      link("Educator sign in", EDUCATOR_SIGN_IN_URL, true),
      link("Student sign in", STUDENT_SIGN_IN_URL)
    );
  }
  card.append(title, message, actions);
  shell.append(card);
  document.body.replaceChildren(shell);
  document.documentElement.classList.remove("pv-secondary-access-pending");
  document.documentElement.classList.add("pv-secondary-access-locked");
}

async function verify(session = undefined) {
  let activeSession = session;
  if (activeSession === undefined) {
    const result = await client.auth.getSession();
    if (result.error) return showLocked({ status: "signed-out" });
    activeSession = result.data.session;
  }
  try {
    const result = await authorize(activeSession);
    if (result.status === "authorized") {
      document.documentElement.classList.remove("pv-secondary-access-pending");
      document.documentElement.classList.add("pv-secondary-access-authorized");
      return;
    }
    showLocked(result);
  } catch {
    showLocked({ status: "no-access" });
  }
}

verify();
client.auth.onAuthStateChange((event, session) => {
  if (!["SIGNED_IN", "SIGNED_OUT", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) return;
  window.setTimeout(() => verify(session), 0);
});
