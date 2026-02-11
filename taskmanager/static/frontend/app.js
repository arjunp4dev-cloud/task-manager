const API_BASE = "https://arjundev2003.pythonanywhere.com/api";

// ================= CURRENT PAGE =================
const currentPath = window.location.pathname;

// ================= PROTECT ROUTES =================
if (
  currentPath !== "/login/" &&
  currentPath !== "/register/"
) {
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
        const data = await res.json();
        alert(JSON.stringify(data));
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
        alert("Invalid username or password");
      }
    });
  }

});

// ================= PROJECTS PAGE =================
if (currentPath === "/projects/") {
  loadProjects();

  const createBtn = document.getElementById("createProjectBtn");
  if (createBtn) {
    createBtn.addEventListener("click", createProject);
  }
}

async function loadProjects() {
  const token = localStorage.getItem("access");

  const res = await fetch(`${API_BASE}/projects/`, {
    headers: { "Authorization": "Bearer " + token }
  });

  const projects = await res.json();
  const projectsList = document.getElementById("projectsList");
  projectsList.innerHTML = "";

  projects.forEach(project => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${project.name}</strong>
      <button onclick="openProject(${project.id})">Open</button>
      <button onclick="deleteProject(${project.id})">Delete</button>
    `;
    projectsList.appendChild(li);
  });
}

async function createProject() {
  const nameInput = document.getElementById("newProjectName");
  const name = nameInput.value.trim();

  if (!name) {
    alert("Project name required");
    return;
  }

  await fetch(`${API_BASE}/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("access")
    },
    body: JSON.stringify({ name })
  });

  nameInput.value = "";
  loadProjects();
}

async function deleteProject(id) {
  await fetch(`${API_BASE}/projects/${id}/`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
  });

  loadProjects();
}

function openProject(id) {
  window.location.href = `/board/?project=${id}`;
}

function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login/";
}

// ================= BOARD PAGE =================
if (currentPath === "/board/") {

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("project");

  if (!projectId) {
    window.location.href = "/projects/";
  } else {
    loadProjectTitle(projectId);
    loadTasks(projectId);
  }
}

async function loadProjectTitle(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
  });

  const project = await res.json();
  document.getElementById("projectTitle").innerText = project.name;
}

// ================= FILTER APPLY =================
function applyFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("project");
  loadTasks(projectId);
}

// ================= LOAD TASKS =================
async function loadTasks(projectId) {

  const search = document.getElementById("searchInput")?.value || "";
  const status = document.getElementById("statusFilter")?.value || "";
  const sort = document.getElementById("sortSelect")?.value || "";

  let url = `${API_BASE}/projects/${projectId}/tasks/?`;

  if (search) url += `search=${search}&`;
  if (status) url += `status=${status}&`;
  if (sort) url += `sort=${sort}&`;

  const res = await fetch(url, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("access") }
  });

  const tasks = await res.json();

  const todo = document.getElementById("todo");
  const inprogress = document.getElementById("inprogress");
  const done = document.getElementById("done");

  todo.innerHTML = "";
  inprogress.innerHTML = "";
  done.innerHTML = "";

  tasks.forEach(task => {

    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${task.title}</strong><br>
      ${task.description || ""}<br>
      Priority: ${task.priority || "-"}<br>
      Due: ${task.due_date || "-"}<br><br>

      <select onchange="updateStatus(${task.id}, this.value)">
        <option value="Todo" ${task.status === "Todo" ? "selected" : ""}>Todo</option>
        <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
        <option value="Done" ${task.status === "Done" ? "selected" : ""}>Done</option>
      </select>
    `;

    if (task.status === "Todo") todo.appendChild(div);
    if (task.status === "In Progress") inprogress.appendChild(div);
    if (task.status === "Done") done.appendChild(div);

  });
}

// ================= TASK FORM =================
function toggleTaskForm() {
  const form = document.getElementById("taskForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

async function submitTask() {

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("project");

  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
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
      priority,
      due_date,
      status: "Todo"
    })
  });

  document.getElementById("taskForm").style.display = "none";
  loadTasks(projectId);
}

// ================= UPDATE STATUS =================
async function updateStatus(taskId, newStatus) {

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("project");

  await fetch(`${API_BASE}/projects/${projectId}/tasks/${taskId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("access")
    },
    body: JSON.stringify({ status: newStatus })
  });

  loadTasks(projectId);
}
