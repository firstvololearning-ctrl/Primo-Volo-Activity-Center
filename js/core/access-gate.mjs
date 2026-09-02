import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://apkvvspubolyxlqtlkto.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_0O4rNLfhuW18xYRZSPkLpw_xyXR9d3n";
const PRODUCT_KEY = "primo-volo";
// Keep false until the reviewed P3 RPCs pass hosted Supabase integration QA.
const ENABLE_PRIMO_STUDENT_CLOUD = false;
const IS_LOCAL_PREVIEW = ["127.0.0.1", "localhost"].includes(
  window.location.hostname
);
const ACCOUNT_HOME_URL = IS_LOCAL_PREVIEW
  ? `${window.location.origin}/account/`
  : "https://firstvololearning-ctrl.github.io/First-Volo-Account/";
const ACCOUNT_URL = IS_LOCAL_PREVIEW
  ? ACCOUNT_HOME_URL
  : `${ACCOUNT_HOME_URL}?returnTo=primoVolo`;
const STUDENT_LOGIN_URL = IS_LOCAL_PREVIEW
  ? `${ACCOUNT_HOME_URL}student-login.html`
  : `${ACCOUNT_HOME_URL}student-login.html?returnTo=primoVolo`;
const AUTH_EVENTS_TO_VERIFY = new Set([
  "INITIAL_SESSION",
  "SIGNED_IN",
  "SIGNED_OUT",
  "TOKEN_REFRESHED",
  "USER_UPDATED"
]);

const COMMON_SCRIPTS = Object.freeze([
  "js/core/data.js",
  "js/core/storage-adapter.js?v=3",
  "js/core/activity-availability.js?v=1",
  "js/core/practice-rounds.js?v=1",
  "js/core/script.js?v=3",
  "js/core/audio-controls.js?v=3",
  "js/impara/impara-interactions.js",
  "js/impara/impara-prepositions-numbers.js",
  "js/core/carrier-phrases.js",
  "js/core/language-agreement.js",
  "js/starting-checks/concrete-vocabulary-starting-checks.js?v=1",
  "js/activities/words-in-action.js?v=4",
  "js/activities/assemble-sentences.js?v=10",
  "js/activities/conversation-practice.js?v=4",
  "js/activities/introductions-practice.js",
  "js/activities/days-activities.js?v=2",
  "js/activities/months-activities.js?v=2",
  "js/progress/flight-path.js?v=2",
  "js/progress/flight-path-clicks.js?v=1",
  "js/progress/passport-regions.js",
  "js/progress/volo-city-map.js?v=11",
  "js/core/header-groups.js",
  "js/progress/progress-v2.js?v=14",
  "js/impara/learn-sort.js?v=2",
  "js/impara/impara-sequences.js",
  "js/impara/learn-scenes.js?v=15",
  "js/impara/impara-supplies.js",
  "js/starting-checks/supplies-starting-check.js?v=2",
  "js/starting-checks/numbers-starting-check.js?v=3",
  "js/starting-checks/colors-starting-check.js?v=3",
  "js/starting-checks/weather-starting-check.js?v=4",
  "js/starting-checks/days-starting-check.js?v=2",
  "js/starting-checks/seasons-starting-check.js?v=2",
  "js/impara/impara-extra-links.js",
  "js/impara/impara-hobbies.js",
  "js/impara/impara-time.js",
  "js/activities/routines-activities.js",
  "js/core/topic-groups.js",
  "js/core/topic-picker.js",
  "js/progress/progress-groups.js",
  "js/core/starting-check-links.js?v=3"
]);

const STUDENT_CLOUD_SCRIPTS = Object.freeze([
  "js/core/primo-student-cloud-merge.js?v=1",
  "js/core/primo-student-cloud.js?v=1"
]);

const EDUCATOR_ONLY_SCRIPTS = Object.freeze([
  "js/progress/student-manager.js?v=2",
  "js/core/topic-read-talk.js?v=1",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
  "js/core/supabase-cloud.js?v=3",
  "js/core/about-accordion.js",
  "js/core/scope-modal.js"
]);

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

window.PrimoVoloStudentCloudRpc = Object.freeze({
  async get(storeKey) {
    const result = await supabase.rpc("get_primo_student_state", {
      p_store_key: storeKey
    });
    if (result.error) throw result.error;
    return firstRow(result.data);
  },
  async save(storeKey, data, baseUpdatedAt, writeId) {
    const result = await supabase.rpc("save_primo_student_state", {
      p_store_key: storeKey,
      p_data: data,
      p_base_updated_at: baseUpdatedAt,
      p_write_id: writeId
    });
    if (result.error) throw result.error;
    return firstRow(result.data);
  }
});

const accessShell = document.getElementById("primoVoloAccess");
const accessStatus = document.getElementById("primoVoloAccessStatus");
const accessActions = document.getElementById("primoVoloAccessActions");
const protectedNodes = Array.from(
  document.body.children
).filter((node) => node !== accessShell && node.tagName !== "SCRIPT");

const lockedAccess = Object.freeze({
  status: "locked",
  mode: null,
  user: null,
  studentContext: null,
  productKeys: Object.freeze([])
});

let currentAccess = lockedAccess;
let authorizationGeneration = 0;
let runtimeMode = null;
let runtimePromise = null;

function firstRow(data) {
  return Array.isArray(data) ? (data[0] || null) : (data || null);
}

function isAnonymousUser(user) {
  return user?.is_anonymous === true;
}

function setProtectedContentInert(inert) {
  protectedNodes.forEach((node) => {
    if (inert) {
      node.setAttribute("inert", "");
      node.setAttribute("aria-hidden", "true");
    } else {
      node.removeAttribute("inert");
      node.removeAttribute("aria-hidden");
    }
  });
}

function setRuntimeAccess(access) {
  currentAccess = access;
  window.PrimoVoloAccess = access;
}

function invalidateRuntime() {
  setProtectedContentInert(true);
  document.body.classList.add("pv-access-pending");
  document.body.dataset.accessStatus = "loading";
  delete document.body.dataset.accessMode;
  setRuntimeAccess(lockedAccess);
  window.PrimoVoloCloud?.suspend?.();
  window.PrimoVoloStudentCloud?.invalidate?.();
  window.dispatchEvent(new CustomEvent("primo-volo-access-invalidated"));
}

function makeLink({ label, href = "#", primary = false, retry = false }) {
  const link = document.createElement("a");
  link.className = "pv-access-link";
  if (primary) link.classList.add("is-primary");
  link.href = href;
  link.textContent = label;
  if (retry) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.reload();
    });
  }
  return link;
}

function showAccessState(title, message, actions = [], status = "locked") {
  setProtectedContentInert(true);
  document.body.classList.add("pv-access-pending");
  document.body.dataset.accessStatus = status;
  if (accessShell) accessShell.hidden = false;
  const heading = accessShell?.querySelector(".pv-access-title");
  if (heading) heading.textContent = title;
  if (accessStatus) accessStatus.textContent = message;
  const visibleActions = actions.filter(Boolean);
  if (accessActions) {
    accessActions.replaceChildren(...visibleActions.map(makeLink));
    accessActions.hidden = visibleActions.length === 0;
  }
}

function showLockedForSession(session) {
  if (!session?.user) {
    showAccessState(
      "Primo Volo is locked",
      "Sign in through My First Volo to continue.",
      [
        { label: "Educator sign in", href: ACCOUNT_URL, primary: true },
        { label: "Student sign in", href: STUDENT_LOGIN_URL }
      ]
    );
    return;
  }

  if (isAnonymousUser(session.user)) {
    showAccessState(
      "Student access could not be verified",
      "This student session is not connected to a class with Primo Volo access.",
      [
        { label: "Return to Student Sign In", href: STUDENT_LOGIN_URL, primary: true }
      ]
    );
    return;
  }

  showAccessState(
    "Primo Volo is not included",
    "This educator account does not currently have an active Primo Volo entitlement.",
    [
      { label: "View My First Volo", href: ACCOUNT_HOME_URL, primary: true }
    ]
  );
}

async function authorizeEducator(user) {
  if (!user?.id || isAnonymousUser(user)) return lockedAccess;

  const result = await supabase
    .from("product_entitlements")
    .select("product_key,status,starts_at,expires_at")
    .eq("owner_user_id", user.id)
    .eq("product_key", PRODUCT_KEY)
    .eq("status", "active")
    .limit(20);

  if (result.error) return lockedAccess;

  const now = Date.now();
  const active = (result.data || []).some((row) => {
    const startsAt = Date.parse(row?.starts_at);
    const expiresAt = Date.parse(row?.expires_at);
    return (
      row?.product_key === PRODUCT_KEY &&
      row?.status === "active" &&
      Number.isFinite(startsAt) &&
      Number.isFinite(expiresAt) &&
      startsAt <= now &&
      expiresAt > now
    );
  });

  if (!active) return lockedAccess;

  return Object.freeze({
    status: "authorized",
    mode: "educator",
    user,
    studentContext: null,
    productKeys: Object.freeze([PRODUCT_KEY])
  });
}

async function authorizeStudent(user) {
  if (!user?.id || !isAnonymousUser(user)) return lockedAccess;

  const contextResult = await supabase.rpc("get_student_session_context");
  if (contextResult.error) return lockedAccess;

  const studentContext = firstRow(contextResult.data);
  if (!studentContext?.student_id || !studentContext?.class_id) {
    return lockedAccess;
  }

  const accessResult = await supabase.rpc("get_student_product_access");
  if (accessResult.error) return lockedAccess;

  const productKeys = Object.freeze(
    (accessResult.data || [])
      .map((row) => row?.product_key)
      .filter((key) => typeof key === "string")
  );

  if (!productKeys.includes(PRODUCT_KEY)) return lockedAccess;

  return Object.freeze({
    status: "authorized",
    mode: "student",
    user,
    studentContext: Object.freeze({ ...studentContext }),
    productKeys
  });
}

async function determineAccess(session) {
  const user = session?.user;
  if (!user) return lockedAccess;
  return isAnonymousUser(user)
    ? authorizeStudent(user)
    : authorizeEducator(user);
}

function loadClassicScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error(`Could not load ${src}`)),
      { once: true }
    );
    document.body.appendChild(script);
  });
}

function removeStudentUnsafeShell() {
  const selectors = [
    '.header-link[href="worksheets.html"]',
    '.header-link[href="games.html"]',
    '.header-link[href="starting-checks.html"]',
    "#aboutItalianButton",
    "#aboutEnglishButton",
    "#aboutModal",
    "#scopeModal",
    ".topic-read-talk-resource"
  ];

  document.querySelectorAll(selectors.join(",")).forEach((node) => node.remove());
}

function mountSharedStudentIdentity(studentContext) {
  const bar = document.createElement("div");
  bar.className = "pv-shared-student-bar";
  bar.setAttribute("aria-label", "Current student");
  const label = document.createElement("span");
  label.textContent = "👤 Studente · Student:";
  const name = document.createElement("strong");
  name.textContent = studentContext.display_name || "Student";
  bar.append(label, name);
  document.querySelector("main.page")?.before(bar);
}

function installSharedStudentFacade(studentContext) {
  const student = Object.freeze({
    id: String(studentContext.student_id),
    name: String(studentContext.display_name || "Student")
  });
  window.PrimoVoloStudent = Object.freeze({
    getStudents: () => [student],
    getCurrent: () => student,
    getCurrentId: () => student.id
  });
}

async function startRuntime(access) {
  if (runtimePromise) return runtimePromise;

  runtimeMode = access.mode;
  if (access.mode === "student") {
    removeStudentUnsafeShell();
    installSharedStudentFacade(access.studentContext);
    mountSharedStudentIdentity(access.studentContext);
    window.PrimoVoloStudentCloudAutoEnable = ENABLE_PRIMO_STUDENT_CLOUD;
  }

  const scripts = access.mode === "educator"
    ? [...COMMON_SCRIPTS, ...EDUCATOR_ONLY_SCRIPTS]
    : [
        ...COMMON_SCRIPTS.slice(0, 2),
        ...STUDENT_CLOUD_SCRIPTS,
        ...COMMON_SCRIPTS.slice(2)
      ];

  runtimePromise = scripts.reduce(
    (promise, src) => promise.then(async () => {
      await loadClassicScript(src);
      if (src.startsWith("js/core/primo-student-cloud.js")) {
        await window.PrimoVoloStudentCloud?.ready;
      }
    }),
    Promise.resolve()
  );

  return runtimePromise;
}

function sameIdentity(left, right) {
  return Boolean(
    left?.status === "authorized" &&
    right?.status === "authorized" &&
    left.mode === right.mode &&
    left.user?.id === right.user?.id &&
    left.studentContext?.student_id === right.studentContext?.student_id &&
    left.studentContext?.class_id === right.studentContext?.class_id
  );
}

async function publishAccess(access, session, generation, previousAccess) {
  if (generation !== authorizationGeneration) return lockedAccess;

  if (access.status !== "authorized") {
    setRuntimeAccess(lockedAccess);
    showLockedForSession(session);
    return lockedAccess;
  }

  if (runtimeMode && !sameIdentity(previousAccess, access)) {
    window.location.reload();
    return access;
  }

  setRuntimeAccess(access);

  try {
    await startRuntime(access);
  } catch (error) {
    if (generation !== authorizationGeneration) return lockedAccess;
    console.error("Primo Volo runtime could not start.", error);
    setRuntimeAccess(lockedAccess);
    showAccessState(
      "Primo Volo could not start",
      "Access was verified, but the learning activities could not load. Please try again.",
      [
        { label: "Try again", retry: true, primary: true },
        { label: "View My First Volo", href: ACCOUNT_HOME_URL }
      ]
    );
    return lockedAccess;
  }

  if (generation !== authorizationGeneration) return lockedAccess;

  document.body.classList.remove("pv-access-pending");
  document.body.dataset.accessStatus = "authorized";
  document.body.dataset.accessMode = access.mode;
  setProtectedContentInert(false);
  return access;
}

export async function reauthorize(session = undefined, previousOverride = null) {
  const generation = ++authorizationGeneration;
  const previousAccess = previousOverride || currentAccess;
  invalidateRuntime();
  showAccessState(
    "Checking your First Volo access…",
    "Please wait while Primo Volo verifies this session.",
    [],
    "loading"
  );

  let activeSession = session;
  if (activeSession === undefined) {
    const sessionResult = await supabase.auth.getSession();
    if (generation !== authorizationGeneration) return lockedAccess;
    if (sessionResult.error) {
      showAccessState(
        "Access could not be verified",
        "Primo Volo could not check this First Volo session. Please try again.",
        [
          { label: "Try again", retry: true, primary: true },
          { label: "View My First Volo", href: ACCOUNT_HOME_URL }
        ]
      );
      return lockedAccess;
    }
    activeSession = sessionResult.data.session;
  }

  let access = lockedAccess;
  try {
    access = await determineAccess(activeSession);
  } catch (error) {
    console.error("Primo Volo authorization failed.", error);
  }

  return publishAccess(access, activeSession, generation, previousAccess);
}

export function getCurrentAccess() {
  return currentAccess;
}

setProtectedContentInert(true);
export const accessReady = reauthorize();

supabase.auth.onAuthStateChange((event, session) => {
  if (!AUTH_EVENTS_TO_VERIFY.has(event)) return;
  const previousAccess = currentAccess;
  invalidateRuntime();
  window.setTimeout(() => {
    reauthorize(session, previousAccess);
  }, 0);
});
