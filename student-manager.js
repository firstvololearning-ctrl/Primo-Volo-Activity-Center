(function () {
  "use strict";

  const STUDENTS_KEY = "primoVoloStudentsV1";
  const CURRENT_KEY = "primoVoloCurrentStudentV1";

  function loadStudents() {
    try {
      const value = JSON.parse(localStorage.getItem(STUDENTS_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function saveStudents(students) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }

  function currentId() {
    return localStorage.getItem(CURRENT_KEY) || "";
  }

  function currentStudent() {
    const id = currentId();
    return loadStudents().find((student) => student.id === id) || null;
  }

  function setCurrent(id) {
    if (id) {
      localStorage.setItem(CURRENT_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_KEY);
    }

    renderSelect();

    window.dispatchEvent(
      new CustomEvent("primo-volo-student-changed", {
        detail: {
          student: currentStudent()
        }
      })
    );

    /*
      A student change is also a learner-context
      change. Keep the selected topic, but rerun
      its normal setup so the new student does
      not inherit another student's active
      activity screen.
    */
    const topicSelect =
      document.querySelector("#topicSelect");

    if (
      topicSelect &&
      topicSelect.value
    ) {
      topicSelect.dispatchEvent(
        new Event("change", {
          bubbles: true
        })
      );
    }
  }

  function makeId() {
    return (
      "student-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function addStudent(name) {
    const cleanName = String(name || "").trim();

    if (!cleanName) {
      return null;
    }

    const students = loadStudents();

    const student = {
      id: makeId(),
      name: cleanName,
      createdAt: new Date().toISOString()
    };

    students.push(student);
    saveStudents(students);
    setCurrent(student.id);

    return student;
  }

  function renameStudent(id, name) {
    const cleanName = String(name || "").trim();

    if (!cleanName) {
      return;
    }

    const students = loadStudents();
    const student = students.find((item) => item.id === id);

    if (!student) {
      return;
    }

    student.name = cleanName;
    saveStudents(students);
    renderSelect();
    renderStudentList();
  }

  function deleteStudent(id) {
    const students = loadStudents();
    const student = students.find((item) => item.id === id);

    if (!student) {
      return;
    }

    const ok = window.confirm(
      `Remove ${student.name} from this device?\n\nThis will remove the student profile.`
    );

    if (!ok) {
      return;
    }

    saveStudents(
      students.filter((item) => item.id !== id)
    );

    if (currentId() === id) {
      setCurrent("");
    } else {
      renderSelect();
    }

    renderStudentList();
  }

  let selectEl;
  let modalEl;
  let listEl;
  let nameInput;

  function renderSelect() {
    if (!selectEl) {
      return;
    }

    const students = loadStudents();
    const selected = currentId();

    selectEl.innerHTML = "";

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "No student selected";
    selectEl.appendChild(emptyOption);

    students.forEach((student) => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = student.name;
      selectEl.appendChild(option);
    });

    selectEl.value = students.some(
      (student) => student.id === selected
    )
      ? selected
      : "";
  }

  function renderStudentList() {
    if (!listEl) {
      return;
    }

    const students = loadStudents();
    listEl.innerHTML = "";

    if (!students.length) {
      const empty = document.createElement("p");
      empty.className = "pv-student-empty";
      empty.textContent = "No students added yet.";
      listEl.appendChild(empty);
      return;
    }

    students.forEach((student) => {
      const row = document.createElement("div");
      row.className = "pv-student-row";

      const name = document.createElement("strong");
      name.textContent = student.name;

      const actions = document.createElement("div");
      actions.className = "pv-student-row-actions";

      const useButton = document.createElement("button");
      useButton.type = "button";
      useButton.textContent =
        currentId() === student.id
          ? "✓ Current"
          : "Select";

      useButton.addEventListener("click", () => {
        setCurrent(student.id);
        renderStudentList();
      });

      const renameButton = document.createElement("button");
      renameButton.type = "button";
      renameButton.textContent = "Rename";

      renameButton.addEventListener("click", () => {
        const nextName = window.prompt(
          "Student name:",
          student.name
        );

        if (nextName !== null) {
          renameStudent(student.id, nextName);
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "pv-student-delete";
      deleteButton.textContent = "Remove";

      deleteButton.addEventListener("click", () => {
        deleteStudent(student.id);
      });

      actions.append(
        useButton,
        renameButton,
        deleteButton
      );

      row.append(name, actions);
      listEl.appendChild(row);
    });
  }

  function openModal() {
    renderStudentList();
    modalEl.hidden = false;
    document.body.classList.add("pv-student-modal-open");

    setTimeout(() => {
      nameInput.focus();
    }, 0);
  }

  function closeModal() {
    modalEl.hidden = true;
    document.body.classList.remove("pv-student-modal-open");
  }

  function buildUI() {
    if (document.querySelector(".pv-student-bar")) {
      return;
    }

    const style = document.createElement("style");
    style.textContent = `
      .pv-student-bar {
        width: min(1180px, calc(100% - 28px));
        margin: 12px auto 4px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
        background: #fff;
        border: 1px solid #dce6f4;
        border-radius: 16px;
        box-shadow: 0 4px 14px rgba(39,75,132,.07);
      }

      .pv-student-label {
        color: #274b84;
        font-size: .9rem;
        font-weight: 800;
      }

      .pv-student-select {
        min-width: 190px;
        padding: 8px 34px 8px 11px;
        border: 1px solid #cbd8ea;
        border-radius: 10px;
        background: #f9fbff;
        color: #243a5e;
        font: inherit;
        font-weight: 700;
      }

      .pv-student-button {
        padding: 8px 12px;
        border: 1px solid #cbd8ea;
        border-radius: 10px;
        background: #f5f8fd;
        color: #274b84;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      .pv-student-button:hover {
        background: #edf4fc;
      }

      .pv-student-add {
        background: #eef8f1;
        border-color: #bcdcc5;
        color: #347348;
      }

      .pv-student-modal[hidden] {
        display: none;
      }

      .pv-student-modal {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(25, 42, 68, .46);
      }

      .pv-student-dialog {
        width: min(520px, 100%);
        max-height: min(700px, 88vh);
        overflow: auto;
        padding: 24px;
        background: #fff;
        border-radius: 22px;
        box-shadow: 0 20px 55px rgba(0,0,0,.22);
      }

      .pv-student-dialog-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }

      .pv-student-dialog h2 {
        margin: 0;
        color: #274b84;
      }

      .pv-student-dialog-subtitle {
        margin: 5px 0 20px;
        color: #66758b;
        line-height: 1.45;
      }

      .pv-student-close {
        border: 0;
        background: transparent;
        font-size: 1.5rem;
        cursor: pointer;
      }

      .pv-student-add-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 9px;
        margin-bottom: 20px;
      }

      .pv-student-add-row input {
        min-width: 0;
        padding: 10px 12px;
        border: 1px solid #cbd8ea;
        border-radius: 10px;
        font: inherit;
      }

      .pv-student-list {
        display: grid;
        gap: 9px;
      }

      .pv-student-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px;
        background: #f8faff;
        border: 1px solid #e0e8f3;
        border-radius: 12px;
      }

      .pv-student-row-actions {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .pv-student-row-actions button {
        padding: 6px 8px;
        border: 1px solid #cbd8ea;
        border-radius: 8px;
        background: #fff;
        color: #274b84;
        font: inherit;
        font-size: .78rem;
        font-weight: 800;
        cursor: pointer;
      }

      .pv-student-row-actions .pv-student-delete {
        color: #a24444;
        border-color: #e6c5c5;
      }

      .pv-student-empty {
        margin: 8px 0;
        color: #728096;
        text-align: center;
      }

      .pv-student-note {
        margin: 18px 0 0;
        padding-top: 14px;
        border-top: 1px solid #e5eaf1;
        color: #728096;
        font-size: .82rem;
        line-height: 1.4;
      }

      body.pv-student-modal-open {
        overflow: hidden;
      }

      @media (max-width: 600px) {
        .pv-student-bar {
          justify-content: stretch;
        }

        .pv-student-label {
          width: 100%;
          text-align: center;
        }

        .pv-student-select {
          flex: 1 1 100%;
        }

        .pv-student-button {
          flex: 1;
        }

        .pv-student-row {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `;

    document.head.appendChild(style);

    const bar = document.createElement("div");
    bar.className = "pv-student-bar";

    const label = document.createElement("span");
    label.className = "pv-student-label";
    label.textContent = "👤 Studente · Current Student";

    selectEl = document.createElement("select");
    selectEl.className = "pv-student-select";
    selectEl.setAttribute(
      "aria-label",
      "Current student"
    );

    selectEl.addEventListener("change", () => {
      setCurrent(selectEl.value);
    });

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className =
      "pv-student-button pv-student-add";
    addButton.textContent = "＋ Add Student";
    addButton.addEventListener("click", openModal);

    const manageButton = document.createElement("button");
    manageButton.type = "button";
    manageButton.className = "pv-student-button";
    manageButton.textContent = "Manage";
    manageButton.addEventListener("click", openModal);

    bar.append(
      label,
      selectEl,
      addButton,
      manageButton
    );

    const header = document.querySelector("header");

    if (header) {
      header.insertAdjacentElement("afterend", bar);
    } else {
      document.body.insertAdjacentElement("afterbegin", bar);
    }

    modalEl = document.createElement("div");
    modalEl.className = "pv-student-modal";
    modalEl.hidden = true;

    const dialog = document.createElement("div");
    dialog.className = "pv-student-dialog";

    const head = document.createElement("div");
    head.className = "pv-student-dialog-head";

    const titleWrap = document.createElement("div");

    const title = document.createElement("h2");
    title.textContent = "👤 Students";

    const subtitle = document.createElement("p");
    subtitle.className = "pv-student-dialog-subtitle";
    subtitle.textContent =
      "Choose a student when you want practice and progress connected to an individual learner.";

    titleWrap.append(title, subtitle);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "pv-student-close";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.textContent = "×";
    closeButton.addEventListener("click", closeModal);

    head.append(titleWrap, closeButton);

    const addRow = document.createElement("form");
    addRow.className = "pv-student-add-row";

    nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Student name or initials";
    nameInput.autocomplete = "off";

    const createButton = document.createElement("button");
    createButton.type = "submit";
    createButton.className =
      "pv-student-button pv-student-add";
    createButton.textContent = "＋ Add";

    addRow.append(nameInput, createButton);

    addRow.addEventListener("submit", (event) => {
      event.preventDefault();

      const student = addStudent(nameInput.value);

      if (!student) {
        nameInput.focus();
        return;
      }

      nameInput.value = "";
      renderStudentList();
    });

    listEl = document.createElement("div");
    listEl.className = "pv-student-list";

    const note = document.createElement("p");
    note.className = "pv-student-note";
    note.textContent =
      "Student profiles are stored only in this browser on this device. You can also use Primo Volo without selecting a student.";

    dialog.append(
      head,
      addRow,
      listEl,
      note
    );

    modalEl.appendChild(dialog);
    document.body.appendChild(modalEl);

    modalEl.addEventListener("click", (event) => {
      if (event.target === modalEl) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        !modalEl.hidden
      ) {
        closeModal();
      }
    });

    renderSelect();
  }

  window.PrimoVoloStudent = {
    getStudents: loadStudents,
    getCurrent: currentStudent,
    getCurrentId: currentId,
    setCurrent,
    addStudent
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      buildUI
    );
  } else {
    buildUI();
  }
})();
