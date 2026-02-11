const API_BASE = "https://arjundev2003.pythonanywhere.com/api";

const currentPath = window.location.pathname;

// ================= PROTECT ROUTES =================
if (currentPath !== "/login/" && currentPath !== "/register/") {
  if (!localStorage.getItem("access")) {
    window.location.href = "/login/";
  }
}

document.addEventListener("DOMContentLoaded", () => {

  // ================= REGISTER =================
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("reg_username").value;
      const email = document.getElementById("reg_email").value;
      const password = document.getElementById("reg_password").value;

      const res = await fetch(`${API_BASE}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      if (res.ok) {
        alert("Registration successful!");
        window.location.href = "/login/";
      } else {
        alert("Registration failed");
      }
    });
  }

  // ================= LOGIN =================
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

  // ================= BOARD PAGE INIT =================
  if (currentPath === "/board/") {
    const projectId = new URLSearchParams(window.location.search).get("project");

    if (!projectId) {
      window.location.href = "/projects/";
    } else {
      loadProjectTitle(projectId);
      loadTasks(projectId);
    }
  }

  // Hide form initially
  const form = document.getElementById("taskForm");
  if (form) {
    form.style.display = "none";
  }

});

// ================= PROJECTS =================

if (currentPath === "/projects/") {
  loadProjects();
}

async function loadProjects() {
  const res = await fetch(`${API_BASE}/projects/`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
  });

  const projects = await res.json();
  const list = document.getElementById("projectsList");

  if (!list) return;

  list.innerHTML = "";

  projects.forEach(project => {
    list.innerHTML += `
      <li>
        <strong>${project.name}</strong>
        <button onclick="openProject(${project.id})">Open</button>
        <button onclick="deleteProject(${project.id})">Delete</button>
      </li>
    `;
  });
}

function openProject(id) {
  window.location.href = `/board/?project=${id}`;
}

function logout() {
  localStorage.clear();
  window.location.href = "/login/";
}

// ================= BOARD FUNCTIONS =================

function toggleTaskForm() {
  const form = document.getElementById("taskForm");
  if (!form) return;

  form.style.display = form.style.display === "none" ? "block" : "none";
}

async function submitTask() {

  const projectId = new URLSearchParams(window.location.search).get("project");

  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const status = document.getElementById("taskStatus").value; // ✅ FIXED
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
      status,        // ✅ Now sending selected status
      priority,
      due_date
    })
  });

  // Clear form
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskPriority").value = "";
  document.getElementById("taskDueDate").value = "";
  document.getElementById("taskStatus").value = "Todo";

  toggleTaskForm();
  loadTasks(projectId);
}

async function loadProjectTitle(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
  });

  const project = await res.json();
  document.getElementById("projectTitle").innerText = project.name;
}

async function loadTasks(projectId) {

  const res = await fetch(`${API_BASE}/projects/${projectId}/tasks/`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
  });

  const tasks = await res.json();

  const todo = document.getElementById("todo");
  const inprogress = document.getElementById("inprogress");
  const done = document.getElementById("done");

  if (!todo) return;

  todo.innerHTML = "";
  inprogress.innerHTML = "";
  done.innerHTML = "";

  tasks.forEach(task => {

    const card = document.createElement("div");
    card.className = "task";

    card.innerHTML = `
      <strong>${task.title}</strong><br>
      ${task.description || ""}<br>
      <small>Priority: ${task.priority || "None"}</small><br>
      <small>Due: ${task.due_date || "No date"}</small>
    `;

    if (task.status === "Todo") {
      todo.appendChild(card);
    } else if (task.status === "In Progress") {
      inprogress.appendChild(card);
    } else if (task.status === "Done") {
      done.appendChild(card);
    }
  });
}
