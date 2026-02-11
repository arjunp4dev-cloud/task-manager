const API_BASE = "https://arjundev2003.pythonanywhere.com/api";

const currentPath = window.location.pathname;
const projectsList = document.getElementById("projectsList");

// ================= PROTECT ROUTES =================

if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
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

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful!");
        window.location.href = "/login/";
      } else {
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
        alert("Login successful!");
        window.location.href = "/projects/";
      } else {
        alert("Invalid username or password");
      }
    });
  }

  // ================= PROJECTS PAGE =================

  if (currentPath.includes("/projects/")) {
    loadProjects();
  }

  // ================= BOARD PAGE =================

  if (currentPath.includes("/board/")) {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project");

    if (!projectId) {
      window.location.href = "/projects/";
      return;
    }

    loadTasks(projectId);
  }

});

// ================= PROJECT FUNCTIONS =================

async function loadProjects() {
  const token = localStorage.getItem("access");

  if (!token) {
    window.location.href = "/login/";
    return;
  }

  const res = await fetch(`${API_BASE}/projects/`, {
    headers: { "Authorization": "Bearer " + token }
  });

  if (!res.ok) {
    window.location.href = "/login/";
    return;
  }

  const projects = await res.json();
  projectsList.innerHTML = "";

  projects.forEach(project => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${project.name}</strong>
      <div>
        <button onclick="openProject(${project.id})">Open</button>
        <button onclick="deleteProject(${project.id})">Delete</button>
      </div>
    `;

    projectsList.appendChild(li);
  });
}

function openProject(id) {
  window.location.href = `/board/?project=${id}`;
}

async function deleteProject(id) {
  await fetch(`${API_BASE}/projects/${id}/`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("access")
    }
  });

  loadProjects();
}

// ================= TASK FUNCTIONS =================

async function loadTasks(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/tasks/`, {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("access")
    }
  });

  if (!res.ok) return;

  const tasks = await res.json();

  const todo = document.getElementById("todo");
  const inprogress = document.getElementById("inprogress");
  const done = document.getElementById("done");

  if (!todo) return;

  todo.innerHTML = "";
  inprogress.innerHTML = "";
  done.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task-card";
    div.innerHTML = `
      <h4>${task.title}</h4>
      <p>${task.description || ""}</p>
      <p><strong>Status:</strong> ${task.status}</p>
    `;

    if (task.status === "Todo") {
      todo.appendChild(div);
    } else if (task.status === "In Progress") {
      inprogress.appendChild(div);
    } else {
      done.appendChild(div);
    }
  });
}

// ================= LOGOUT =================

function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login/";
}
