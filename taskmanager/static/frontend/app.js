const API_BASE = "https://arjundev2003.pythonanywhere.com/api";
const currentPath = window.location.pathname;

// ================= PROTECT ROUTES =================
if (currentPath !== "/login/" && currentPath !== "/register/") {
  if (!localStorage.getItem("access")) {
    window.location.href = "/login/";
  }
}

document.addEventListener("DOMContentLoaded", () => {

  // REGISTER
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("reg_username").value;
      const email = document.getElementById("reg_email").value;
      const password = document.getElementById("reg_password").value;

      await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      window.location.href = "/login/";
    });
  }

  // LOGIN
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const res = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        window.location.href = "/projects/";
      } else {
        alert("Invalid credentials");
      }
    });
  }

});

// ================= BOARD =================

if (currentPath === "/board/") {
  const projectId = new URLSearchParams(window.location.search).get("project");
  if (projectId) {
    loadProjectTitle(projectId);
    loadTasks(projectId);
  }
}

function toggleTaskForm() {
  const form = document.getElementById("taskForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

// ================= APPLY FILTER =================

function applyFilters() {
  const projectId = new URLSearchParams(window.location.search).get("project");
  loadTasks(projectId);
}

// ================= CREATE TASK =================

async function submitTask() {

  const projectId = new URLSearchParams(window.location.search).get("project");

  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
  const status = document.getElementById("taskStatus").value;
  const priority = document.getElementById("taskPriority").value;
  const due_date = document.getElementById("taskDueDate").value;

  if (!title) {
    alert("Task title required");
    return;
  }

  await fetch(`${API_BASE}/projects/${projectId}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("access")
    },
    body: JSON.stringify({
      title,
      description,
      status,
      priority,
      due_date
    })
  });

  toggleTaskForm();
  loadTasks(projectId);
}

// ================= LOAD TASKS WITH FILTER =================

async function loadTasks(projectId) {

  const searchValue = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const statusFilter = document.getElementById("statusFilter")?.value || "";
  const sortValue = document.getElementById("sortSelect")?.value || "";

  const res = await fetch(`${API_BASE}/projects/${projectId}/tasks/`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
  });

  let tasks = await res.json();

  // 🔎 SEARCH
  if (searchValue) {
    tasks = tasks.filter(task =>
      task.title.toLowerCase().includes(searchValue)
    );
  }

  // 🎯 STATUS FILTER
  if (statusFilter) {
    tasks = tasks.filter(task => task.status === statusFilter);
  }

  // 🔄 SORT
  if (sortValue) {
    tasks.sort((a, b) => {
      if (!a[sortValue]) return 1;
      if (!b[sortValue]) return -1;
      return new Date(a[sortValue]) - new Date(b[sortValue]);
    });
  }

  const todo = document.getElementById("todo");
  const inprogress = document.getElementById("inprogress");
  const done = document.getElementById("done");

  todo.innerHTML = "";
  inprogress.innerHTML = "";
  done.innerHTML = "";

  tasks.forEach(task => {

    const card = document.createElement("div");
    card.className = "task";

    card.innerHTML = `
      <strong>${task.title}</strong><br>
      ${task.description || ""}<br>
      Priority: ${task.priority || "None"}<br>
      Due: ${task.due_date || "No date"}<br><br>

      <button onclick="editTask(${task.id})">Edit</button>
      <button onclick="deleteTask(${task.id})" style="background:red;">Delete</button>
    `;

    if (task.status === "Todo") todo.appendChild(card);
    if (task.status === "In Progress") inprogress.appendChild(card);
    if (task.status === "Done") done.appendChild(card);
  });
}

// ================= DELETE =================

async function deleteTask(taskId) {
  const projectId = new URLSearchParams(window.location.search).get("project");

  await fetch(`${API_BASE}/tasks/${taskId}/`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
  });

  loadTasks(projectId);
}

// ================= EDIT =================

async function editTask(taskId) {

  const newTitle = prompt("New Title:");
  const newStatus = prompt("Status (Todo / In Progress / Done):");

  await fetch(`${API_BASE}/tasks/${taskId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("access")
    },
    body: JSON.stringify({
      title: newTitle,
      status: newStatus
    })
  });

  const projectId = new URLSearchParams(window.location.search).get("project");
  loadTasks(projectId);
}

async function loadProjectTitle(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
  });

  const project = await res.json();
  document.getElementById("projectTitle").innerText = project.name;
}
