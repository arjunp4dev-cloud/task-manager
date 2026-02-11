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

  if (!token) {
    window.location.href = "/login/";
    return;
  }

  const res = await fetch(`${API_BASE}/projects/`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  if (!res.ok) {
    window.location.href = "/login/";
    return;
  }

  const projects = await res.json();
  const projectsList = document.getElementById("projectsList");

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

async function createProject() {
  const nameInput = document.getElementById("newProjectName");
  const name = nameInput.value.trim();

  if (!name) {
    alert("Project name required");
    return;
  }

  const res = await fetch(`${API_BASE}/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("access")
    },
    body: JSON.stringify({ name })
  });

  if (res.ok) {
    nameInput.value = "";
    loadProjects();
  } else {
    alert("Failed to create project");
  }
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

  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => addTask(projectId));
  }
}

async function loadProjectTitle(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/`, {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("access")
    }
  });

  if (res.ok) {
    const project = await res.json();
    document.getElementById("projectTitle").innerText = project.name;
  }
}

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

  todo.innerHTML = "";
  inprogress.innerHTML = "";
  done.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${task.title}</strong>`;

    if (task.status === "Todo") todo.appendChild(div);
    if (task.status === "In Progress") inprogress.appendChild(div);
    if (task.status === "Done") done.appendChild(div);
  });
}

async function addTask(projectId) {
  const title = prompt("Task Title:");
  if (!title) return;

  await fetch(`${API_BASE}/projects/${projectId}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("access")
    },
    body: JSON.stringify({
      title,
      status: "Todo"
    })
  });

  loadTasks(projectId);
}
