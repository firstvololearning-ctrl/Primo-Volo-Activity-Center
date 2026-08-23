"use strict";
(function () {
  if (window.PrimoVoloCloud) return;
  const storage = window.PrimoVoloStorage;
  const students = window.PrimoVoloStudent;
  const supa = window.supabase;
  if (!storage || !students || !supa?.createClient) {
    console.warn("Primo Volo Cloud Save is not ready.");
    return;
  }

  const PRODUCT = "primo-volo";
  const URL = "https://apkvvspubolyxlqtlkto.supabase.co";
  const KEY = "sb_publishable_0O4rNLfhuW18xYRZSPkLpw_xyXR9d3n";
  const DIRTY_KEY = "primoVoloCloudDirtyV1";
  const TOMBSTONE_KEY = "primoVoloCloudStudentTombstonesV1";
  const client = supa.createClient(URL, KEY);
  const domains = storage.domains.filter(
    d => d.scope === "student" && d.cloudCandidate && !d.legacy
  );

  let session = null;
  let syncing = false;
  let queued = false;
  let timer = null;
  let lastSyncAt = null;
  let lastStudentIds = new Set(students.getStudents().map(s => s.id));
  let button, modal, message, signedOut, signedIn, recoveryPanel, emailInput, passwordInput, recoveryPasswordInput, accountEmail;

  const parse = (raw, fallback) => {
    if (raw == null || raw === "") return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  };
  const readObject = key => {
    const value = parse(localStorage.getItem(key), {});
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  };
  const writeObject = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const newer = (a, b) => (Date.parse(a || "") || 0) > (Date.parse(b || "") || 0);
  const same = (a, b) => {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
  };

  function normalizePracticeData(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return data;

    const normalized = JSON.parse(JSON.stringify(data));
    let changed = false;

    Object.values(normalized.byTopic || {}).forEach(topic => {
      if (!topic || !Array.isArray(topic.practiced)) return;

      const next = [...new Set(topic.practiced.map(mode =>
        mode === "conversation-choice" || mode === "conversation-write"
          ? "conversation-practice"
          : mode
      ))];

      if (!same(topic.practiced, next)) {
        topic.practiced = next;
        changed = true;
      }
    });

    return changed ? normalized : data;
  }

  function normalizeDomainData(storeKey, data) {
    return storeKey === "practice"
      ? normalizePracticeData(data)
      : data;
  }

  function markDirty(key, operation, changedAt) {
    const dirty = readObject(DIRTY_KEY);
    dirty[key] = {
      operation: operation === "remove" ? "remove" : "set",
      changedAt: changedAt || new Date().toISOString()
    };
    writeObject(DIRTY_KEY, dirty);
  }
  function clearDirty(key) {
    const dirty = readObject(DIRTY_KEY);
    if (!(key in dirty)) return;
    delete dirty[key];
    writeObject(DIRTY_KEY, dirty);
  }
  function addTombstone(id, changedAt) {
    const tombstones = readObject(TOMBSTONE_KEY);
    tombstones[id] = changedAt || new Date().toISOString();
    writeObject(TOMBSTONE_KEY, tombstones);
  }
  function clearTombstone(id) {
    const tombstones = readObject(TOMBSTONE_KEY);
    delete tombstones[id];
    writeObject(TOMBSTONE_KEY, tombstones);
  }

  function setMessage(text, state = "idle") {
    if (message) {
      message.textContent = text;
      message.dataset.state = state;
    }
    if (!button) return;
    button.textContent = !session
      ? "☁️ Cloud Save"
      : state === "syncing"
        ? "☁️ Syncing…"
        : state === "error"
          ? "⚠️ Cloud"
          : "☁️ Saved";
  }

  function updateUI() {
    if (!signedOut) return;
    const on = Boolean(session?.user);
    const recovering = recoveryPanel && !recoveryPanel.hidden;
    signedOut.hidden = on || recovering;
    signedIn.hidden = !on || recovering;
    if (accountEmail) accountEmail.textContent = on ? (session.user.email || "Signed in") : "";
    if (!on) setMessage("Local saving is on. Sign in to sync across devices.");
    else if (lastSyncAt) setMessage(`Cloud saving is on. Last synced ${new Date(lastSyncAt).toLocaleTimeString([], {hour:"numeric", minute:"2-digit"})}.`);
    else setMessage("Cloud saving is on.");
  }

  function buildUI() {
    const style = document.createElement("style");
    style.textContent = `
      .pv-cloud-modal[hidden]{display:none}.pv-cloud-modal{position:fixed;inset:0;z-index:100100;display:grid;place-items:center;padding:18px;background:rgba(25,42,68,.48)}
      .pv-cloud-dialog{width:min(500px,100%);padding:24px;border-radius:20px;background:#fff;box-shadow:0 20px 55px rgba(0,0,0,.22);color:#243a5e}
      .pv-cloud-head{display:flex;justify-content:space-between;gap:12px}.pv-cloud-head h2{margin:0;color:#274b84}.pv-cloud-close{border:0;background:transparent;font-size:1.5rem;cursor:pointer}
      .pv-cloud-message{padding:10px 12px;border:1px solid #dce6f4;border-radius:10px;background:#f8fbff;color:#53657e}.pv-cloud-message[data-state=error]{background:#fff6f6;border-color:#e5c0c0;color:#924848}
      .pv-cloud-form{display:grid;gap:10px}.pv-cloud-form label{display:grid;gap:4px;font-weight:800}.pv-cloud-form input{padding:10px 12px;border:1px solid #cbd8ea;border-radius:10px;font:inherit}
      .pv-cloud-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.pv-cloud-action{padding:9px 12px;border:1px solid #cbd8ea;border-radius:10px;background:#f5f8fd;color:#274b84;font:inherit;font-weight:800;cursor:pointer}.pv-cloud-primary{background:#eef8f1;border-color:#bcdcc5;color:#347348}
      .pv-cloud-note{margin-top:16px;padding-top:12px;border-top:1px solid #e5eaf1;color:#728096;font-size:.82rem;line-height:1.45}
    `;
    document.head.appendChild(style);

    button = document.createElement("button");
    button.id = "primoVoloCloudButton";
    button.type = "button";
    button.className = "pv-student-button pv-cloud-student-button";
    button.textContent = "☁️ Cloud Save";
    button.setAttribute(
      "aria-label",
      "Cloud Save account and sync"
    );
    button.title = "Cloud Save account and sync";
    function mountCloudButton() {
      const studentBar =
        document.querySelector(".pv-student-bar");

      if (studentBar) {
        if (button.parentElement !== studentBar) {
          studentBar.appendChild(button);
        }
        return;
      }

      const fallback =
        document.querySelector(".header-utilities");

      if (fallback && !button.parentElement) {
        fallback.appendChild(button);
      }

      setTimeout(mountCloudButton, 100);
    }

    mountCloudButton();

    modal = document.createElement("div");
    modal.className = "pv-cloud-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="pv-cloud-dialog" role="dialog" aria-modal="true" aria-labelledby="pvCloudTitle">
        <div class="pv-cloud-head"><div><h2 id="pvCloudTitle">☁️ Cloud Save</h2><p>Sync student profiles, Progress, Practice Path, and the Italy Journey across devices.</p></div><button class="pv-cloud-close" type="button" aria-label="Close">×</button></div>
        <p class="pv-cloud-message" aria-live="polite"></p>
        <div class="pv-cloud-signed-out">
          <form class="pv-cloud-form">
            <label>Email<input type="email" autocomplete="email" required></label>
            <label>Password<input type="password" autocomplete="current-password" minlength="6" required></label>
            <div class="pv-cloud-actions"><button class="pv-cloud-action pv-cloud-primary" type="submit">Sign in</button><button class="pv-cloud-action pv-cloud-create" type="button">Create account</button><button class="pv-cloud-action pv-cloud-forgot" type="button">Forgot password?</button></div>
          </form>
        </div>
        <div class="pv-cloud-recovery" hidden>
          <p><strong>Choose a new password</strong></p>
          <form class="pv-cloud-recovery-form">
            <label>New password<input class="pv-cloud-new-password" type="password" autocomplete="new-password" minlength="6" required></label>
            <div class="pv-cloud-actions"><button class="pv-cloud-action pv-cloud-primary" type="submit">Update password</button></div>
          </form>
        </div>
        <div class="pv-cloud-signed-in" hidden>
          <p>Signed in as <strong class="pv-cloud-email"></strong></p>
          <div class="pv-cloud-actions"><button class="pv-cloud-action pv-cloud-primary pv-cloud-sync" type="button">Sync now</button><button class="pv-cloud-action pv-cloud-signout" type="button">Sign out</button></div>
        </div>
        <p class="pv-cloud-note">Cloud Save is optional. Primo Volo remains local-first. The student selected on this device is not synced.</p>
      </div>`;
    document.body.appendChild(modal);

    message = modal.querySelector(".pv-cloud-message");
    signedOut = modal.querySelector(".pv-cloud-signed-out");
    signedIn = modal.querySelector(".pv-cloud-signed-in");
    recoveryPanel = modal.querySelector(".pv-cloud-recovery");
    accountEmail = modal.querySelector(".pv-cloud-email");
    emailInput = modal.querySelector('input[type="email"]');
    passwordInput = modal.querySelector(".pv-cloud-signed-out input[type=\"password\"]");
    recoveryPasswordInput = modal.querySelector(".pv-cloud-new-password");
    const close = () => { modal.hidden = true; };
    button.addEventListener("click", () => { modal.hidden = false; updateUI(); });
    modal.querySelector(".pv-cloud-close").addEventListener("click", close);
    modal.addEventListener("click", e => { if (e.target === modal) close(); });
    modal.querySelector("form").addEventListener("submit", async e => {
      e.preventDefault(); await signIn();
    });
    modal.querySelector(".pv-cloud-create").addEventListener("click", createAccount);
    modal.querySelector(".pv-cloud-forgot").addEventListener("click", sendPasswordReset);
    modal.querySelector(".pv-cloud-recovery-form").addEventListener("submit", async e => {
      e.preventDefault();
      await updateRecoveredPassword();
    });
    modal.querySelector(".pv-cloud-sync").addEventListener("click", () => schedule(0, "manual"));
    modal.querySelector(".pv-cloud-signout").addEventListener("click", signOut);
    updateUI();
  }

  async function signIn() {
    setMessage("Signing in…", "syncing");
    const { data, error } = await client.auth.signInWithPassword({
      email: emailInput.value.trim(), password: passwordInput.value
    });
    if (error) return setMessage(error.message, "error");
    session = data.session; updateUI(); schedule(0, "sign-in");
  }
  async function createAccount() {
    setMessage("Creating account…", "syncing");
    const { data, error } = await client.auth.signUp({
      email: emailInput.value.trim(), password: passwordInput.value
    });
    if (error) return setMessage(error.message, "error");
    if (data.session) { session = data.session; updateUI(); schedule(0, "account-created"); }
    else setMessage(
      "If this is a new email, check your inbox to confirm it. If you already have a First Volo account, use Sign in or Forgot password."
    );
  }

  async function sendPasswordReset() {
    const email = emailInput.value.trim();

    if (!email) {
      emailInput.focus();
      return setMessage(
        "Enter your account email first.",
        "error"
      );
    }

    setMessage(
      "Sending password reset email…",
      "syncing"
    );

    const redirectTo =
      window.location.origin +
      window.location.pathname;

    const { error } =
      await client.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );

    if (error) {
      return setMessage(
        `Password reset could not be sent: ${error.message}`,
        "error"
      );
    }

    setMessage(
      "Password reset email sent. Open the link in that email, then choose a new password."
    );
  }

  async function updateRecoveredPassword() {
    const nextPassword =
      recoveryPasswordInput.value;

    if (nextPassword.length < 6) {
      return setMessage(
        "Password must be at least 6 characters.",
        "error"
      );
    }

    setMessage(
      "Updating password…",
      "syncing"
    );

    const { error } =
      await client.auth.updateUser({
        password: nextPassword
      });

    if (error) {
      return setMessage(
        `Password could not be updated: ${error.message}`,
        "error"
      );
    }

    recoveryPasswordInput.value = "";
    recoveryPanel.hidden = true;
    updateUI();
    setMessage(
      "Password updated. You are signed in."
    );
    schedule(0, "password-recovery");
  }

  async function signOut() {
    setMessage("Signing out…", "syncing");
    const { error } = await client.auth.signOut();
    if (error) return setMessage(error.message, "error");
    session = null; lastSyncAt = null; updateUI();
  }

  async function fetchProfiles(user) {
    const { data, error } = await client.from("learner_profiles")
      .select("id,local_profile_id,display_name,created_at,updated_at,deleted_at")
      .eq("owner_user_id", user.id).eq("product_key", PRODUCT);
    if (error) throw error;
    return data || [];
  }
  async function upsertProfile(user, student) {
    const now = new Date().toISOString();
    const { data, error } = await client.from("learner_profiles").upsert({
      owner_user_id:user.id, product_key:PRODUCT, local_profile_id:student.id,
      display_name:student.name, updated_at:now, deleted_at:null
    }, {onConflict:"owner_user_id,product_key,local_profile_id"})
      .select("id,local_profile_id,display_name,created_at,updated_at,deleted_at").single();
    if (error) throw error;
    return data;
  }
  async function applyTombstones(user) {
    const tombstones = readObject(TOMBSTONE_KEY);
    for (const [id, deletedAt] of Object.entries(tombstones)) {
      const { data, error } = await client.from("learner_profiles").update({
        deleted_at:deletedAt, updated_at:deletedAt
      }).eq("owner_user_id",user.id).eq("product_key",PRODUCT).eq("local_profile_id",id).select("id");
      if (error) throw error;
      const ids = (data || []).map(x => x.id);
      if (ids.length) {
        const { error: e2 } = await client.from("learning_state").delete()
          .eq("product_key",PRODUCT).in("learner_profile_id",ids);
        if (e2) throw e2;
      }
      domains.forEach(d => clearDirty(storage.studentKey(d.baseKey,id)));
      clearTombstone(id);
    }
  }
  async function syncProfiles(user) {
    await applyTombstones(user);
    let cloud = await fetchProfiles(user);
    const byId = new Map(cloud.map(p => [p.local_profile_id,p]));
    const dirtyStudents = readObject(DIRTY_KEY)[storage.keys.students] || null;
    const merged = [];
    let changed = false;
    for (const local of students.getStudents()) {
      const student = {...local};
      const remote = byId.get(student.id);
      if (!remote) { await upsertProfile(user,student); merged.push(student); continue; }
      if (remote.deleted_at) {
        if (dirtyStudents && newer(dirtyStudents.changedAt,remote.deleted_at)) {
          await upsertProfile(user,student); merged.push(student);
        } else {
          storage.removeStudentData(student.id,{source:"cloud"}); changed = true;
        }
        continue;
      }
      if (remote.display_name !== student.name) {
        if (dirtyStudents && newer(dirtyStudents.changedAt,remote.updated_at)) await upsertProfile(user,student);
        else { student.name = remote.display_name; changed = true; }
      }
      merged.push(student);
    }
    cloud = await fetchProfiles(user);
    const active = cloud.filter(p => !p.deleted_at);
    const localIds = new Set(merged.map(s => s.id));
    for (const p of active) if (!localIds.has(p.local_profile_id)) {
      merged.push({id:p.local_profile_id,name:p.display_name,createdAt:p.created_at}); changed = true;
    }
    if (changed) storage.setItem(storage.keys.students,JSON.stringify(merged),{source:"cloud"});
    lastStudentIds = new Set(merged.map(s => s.id));
    clearDirty(storage.keys.students);
    return {profiles:active, merged, changed};
  }

  async function fetchState(profiles) {
    if (!profiles.length) return [];
    const { data, error } = await client.from("learning_state")
      .select("id,learner_profile_id,store_key,data,client_updated_at,updated_at")
      .eq("product_key",PRODUCT).in("learner_profile_id",profiles.map(p => p.id));
    if (error) throw error;
    return data || [];
  }
  async function upsertState(profileId, storeKey, data, changedAt) {
    const now = new Date().toISOString();
    const normalizedData = normalizeDomainData(storeKey, data);
    const { error } = await client.from("learning_state").upsert({
      learner_profile_id:profileId, product_key:PRODUCT, store_key:storeKey, data:normalizedData,
      client_updated_at:changedAt || now, updated_at:now
    }, {onConflict:"learner_profile_id,product_key,store_key"});
    if (error) throw error;
  }
  async function syncState(profiles) {
    const rows = await fetchState(profiles);

    for (const row of rows) {
      const normalizedRemote =
        normalizeDomainData(row.store_key, row.data);

      if (!same(row.data, normalizedRemote)) {
        row.data = normalizedRemote;
        await upsertState(
          row.learner_profile_id,
          row.store_key,
          normalizedRemote,
          row.client_updated_at || row.updated_at
        );
      }
    }

    const remote = new Map(rows.map(r => [`${r.learner_profile_id}:${r.store_key}`,r]));
    const dirty = readObject(DIRTY_KEY);
    const hydrated = new Set();
    for (const profile of profiles) for (const d of domains) {
      const key = storage.studentKey(d.baseKey,profile.local_profile_id);
      const raw = storage.getItem(key);
      const parsedLocal = raw == null ? null : parse(raw,raw);
      const local = normalizeDomainData(d.id, parsedLocal);

      if (raw != null && !same(parsedLocal, local)) {
        storage.setItem(
          key,
          JSON.stringify(local),
          {source:"cloud"}
        );
      }

      const change = dirty[key] || null;
      const row = remote.get(`${profile.id}:${d.id}`) || null;

      if (row) {
        const normalizedRemote = normalizeDomainData(d.id, row.data);

        if (!same(row.data, normalizedRemote)) {
          row.data = normalizedRemote;
          await upsertState(
            profile.id,
            d.id,
            normalizedRemote,
            row.client_updated_at || row.updated_at
          );
        }
      }
      if (change && (!row || newer(change.changedAt,row.client_updated_at || row.updated_at))) {
        if (change.operation === "remove" || raw == null) {
          if (row) {
            const { error } = await client.from("learning_state").delete()
              .eq("learner_profile_id",profile.id).eq("product_key",PRODUCT).eq("store_key",d.id);
            if (error) throw error;
          }
        } else await upsertState(profile.id,d.id,local,change.changedAt);
        clearDirty(key); continue;
      }
      if (!row) {
        if (raw != null) await upsertState(profile.id,d.id,local,null);
        clearDirty(key); continue;
      }
      if (raw == null || !same(local,row.data)) {
        storage.setItem(key,JSON.stringify(row.data),{source:"cloud"}); hydrated.add(profile.local_profile_id);
      }
      clearDirty(key);
    }
    return hydrated;
  }

  async function syncAll(reason="automatic") {
    if (!session?.user) return;
    if (syncing) { queued = true; return; }
    syncing = true; queued = false; setMessage("Syncing Primo Volo…","syncing");
    try {
      const profileResult = await syncProfiles(session.user);
      const hydrated = await syncState(profileResult.profiles);
      const current = storage.currentStudentId();
      if (profileResult.changed || hydrated.has(current)) {
        const ids = new Set(profileResult.merged.map(s => s.id));
        students.setCurrent(ids.has(current) ? current : "");
      }
      lastSyncAt = new Date().toISOString();
      setMessage(reason === "manual" ? "Cloud sync complete." : "Cloud saving is on.");
      updateUI();
    } catch (error) {
      console.error("Primo Volo Cloud Save failed.",error);
      setMessage(`Cloud sync could not finish: ${error.message || "unknown error"}`,"error");
    } finally {
      syncing = false;
      if (queued) { queued = false; schedule(250,"queued"); }
    }
  }
  function schedule(delay=700,reason="automatic") {
    if (!session?.user) return;
    clearTimeout(timer);
    timer = setTimeout(() => syncAll(reason),delay);
  }
  function onStorageChange(event) {
    const d = event.detail || {};
    const desc = d.descriptor || {};
    if (d.source === "cloud" || !desc.cloudCandidate) return;
    if (desc.id === "students") {
      const next = new Set((parse(d.value,[]) || []).map(s => s.id));
      lastStudentIds.forEach(id => { if (!next.has(id)) addTombstone(id,d.changedAt); });
      lastStudentIds = next;
    }
    markDirty(d.key,d.operation,d.changedAt);
    schedule();
  }

  window.addEventListener("primo-volo-storage-change",onStorageChange);
  window.addEventListener("focus",() => {
    if (session?.user && (!lastSyncAt || Date.now() - Date.parse(lastSyncAt) > 15000)) schedule(100,"focus");
  });
  client.auth.onAuthStateChange((event,next) => {
    session = next || null;

    if (event === "PASSWORD_RECOVERY") {
      modal.hidden = false;
      recoveryPanel.hidden = false;
      signedOut.hidden = true;
      signedIn.hidden = true;

      if (accountEmail) {
        accountEmail.textContent =
          session?.user?.email || "";
      }

      setMessage(
        "Password reset link accepted. Choose a new password below."
      );

      setTimeout(
        () => recoveryPasswordInput?.focus(),
        0
      );

      return;
    }

    if (recoveryPanel) {
      recoveryPanel.hidden = true;
    }

    updateUI();

    if (
      session &&
      (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED"
      )
    ) {
      schedule(50,"auth");
    }
  });

  window.PrimoVoloCloud = Object.freeze({
    productKey:PRODUCT,
    getStatus:() => ({signedIn:Boolean(session?.user),email:session?.user?.email || null,syncing,lastSyncAt}),
    syncNow:() => syncAll("manual")
  });

  buildUI();
  client.auth.getSession().then(({data,error}) => {
    if (error) console.warn("Cloud session restore failed.",error);
    session = data?.session || null; updateUI(); if (session) schedule(0,"startup");
  });
})();
