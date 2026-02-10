

const API_BASE = "https://arjundev2003.pythonanywhere.com/api";


// ================= PROTECT ROUTES =================

const currentPage = window.location.pathname.split("/").pop();
// Make projectsList global so all functions can use it
const projectsList = document.getElementById("projectsList");


if (currentPage !== "login.html" && currentPage !== "register.html") {
  if (!localStorage.getItem("access")) {
    window.location.href = "login.html";
  }
}


document.addEventListener("DOMContentLoaded", () => {

  console.log("Page loaded");

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
        window.location.href = "login.html";
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
       window.location.href = "projects.html";

      } else {
        alert("Invalid username or password");
      }
    });
  }

});
// ================= PROJECTS PAGE =================

if (currentPage === "projects.html") {

  const createBtn = document.getElementById("createProjectBtn");

  if (createBtn) {
    createBtn.addEventListener("click", createProject);
  }

  if (projectsList) {
    loadProjects();
  }
}

async function loadProjects() {
  const token = localStorage.getItem("access");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(`${API_BASE}/projects/`, {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  if (!res.ok) {
    window.location.href = "login.html";
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
        <button onclick="deleteProject(${project.id})" class="muted">Delete</button>
      </div>
    `;

    projectsList.appendChild(li);
  });
}

// Create Project
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

// Delete Project
async function deleteProject(id) {
  await fetch(`${API_BASE}/projects/${id}/`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("access")
    }
  });

  loadProjects();
}

// Open Project
function openProject(id) {
  window.location.href = `board.html?project=${id}`;
}


// Logout
function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "login.html";
}
// ================= BOARD PAGE =================


let projectId = null;

if (currentPage === "board.html") {

  const urlParams = new URLSearchParams(window.location.search);
  projectId = urlParams.get("project");

  if (!projectId) {
    window.location.href = "projects.html";
  }

}

const todoColumn = document.getElementById("todo");
const inProgressColumn = document.getElementById("inprogress"); // matches your HTML
const doneColumn = document.getElementById("done");
const projectTitle = document.getElementById("projectTitle");

if (projectId && todoColumn) {
  loadProjectTitle(projectId);
  loadTasks(projectId);
}

async function loadProjectTitle(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/`, {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("access")
    }
  });

  if (res.ok) {
    const project = await res.json();
    projectTitle.innerText = project.name;
  }
}

async function loadTasks(projectId) {

  const status = document.getElementById("filterStatus")?.value || "";
  const search = document.getElementById("searchInput")?.value || "";
  const sort = document.getElementById("sortSelect")?.value || "";

  let url = `${API_BASE}/projects/${projectId}/tasks/?`;

  if (status) url += `status=${status}&`;
  if (search) url += `search=${search}&`;
  if (sort) url += `sort=${sort}&`;

  const res = await fetch(url, {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("access")
    }
  });

  if (!res.ok) {
    console.log("Failed to load tasks");
    return;
  }

  const tasks = await res.json();

  // Clear columns
  todoColumn.innerHTML = "";
  inProgressColumn.innerHTML = "";
  doneColumn.innerHTML = "";

  tasks.forEach(task => {
  const div = document.createElement("div");
  div.className = "task-card";

  div.innerHTML = `
    <h4>${task.title}</h4>
    <p>${task.description || ""}</p>
    <p><strong>Priority:</strong> ${task.priority || "None"}</p>
    <p><strong>Due:</strong> ${task.due_date || "None"}</p>

    <select onchange="updateTaskStatus(${task.id}, this.value)">
      <option value="Todo" ${task.status === "Todo" ? "selected" : ""}>Todo</option>
      <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
      <option value="Done" ${task.status === "Done" ? "selected" : ""}>Done</option>
    </select>
    <button onclick="deleteTask(${task.id})" style="margin-top:5px;">
  Delete
</button>
<button onclick="editTask(${task.id}, '${task.title}', '${task.description || ""}', '${task.priority || ""}', '${task.due_date || ""}')">
  Edit
</button>


  `;


    if (task.status === "Todo") {
      todoColumn.appendChild(div);
    } else if (task.status === "In Progress") {
      inProgressColumn.appendChild(div);
    } else if (task.status === "Done") {
      doneColumn.appendChild(div);
    }
  });
}
async function updateTaskStatus(taskId, newStatus) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("access")
    },
    body: JSON.stringify({ status: newStatus })
  });

  if (res.ok) {
    loadTasks(projectId);
  } else {
    alert("Failed to update task");
  }
}
async function deleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  const res = await fetch(`${API_BASE}/tasks/${taskId}/`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("access")
    }
  });

  if (res.ok) {
    loadTasks(projectId);
  } else {
    alert("Failed to delete task");
  }
}
async function editTask(taskId, currentTitle, currentDesc, currentPriority, currentDue) {

  const title = prompt("Edit Title:", currentTitle);
  if (!title) return;

  const description = prompt("Edit Description:", currentDesc);

  const priority = prompt("Edit Priority (Low/Medium/High):", currentPriority);

  let due_date = prompt("Edit Due Date (YYYY-MM-DD):", currentDue);

  // 👇 IMPORTANT FIX
  if (!due_date) {
    due_date = null;   // instead of empty string
  }

  const res = await fetch(`${API_BASE}/tasks/${taskId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("access")
    },
    body: JSON.stringify({
      title,
      description,
      priority,
      due_date
    })
  });

  const data = await res.json();
  console.log("PATCH response:", data);

  if (res.ok) {
    loadTasks(projectId);
  } else {
    alert("Failed: " + JSON.stringify(data));
  }
}
// ================= ADD TASK BUTTON =================

const addTaskBtn = document.getElementById("addTaskBtn");

if (addTaskBtn && projectId) {
  addTaskBtn.addEventListener("click", async () => {

    const title = prompt("Task Title:");
    if (!title) return;

    const description = prompt("Description:") || "";
    let priority = prompt("Priority (Low/Medium/High):") || null;
    const due_date = prompt("Due Date (YYYY-MM-DD):") || null;

    // Fix priority case (Low/Medium/High)
    if (priority) {
      priority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
    }

    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("access")
      },
      body: JSON.stringify({
        title,
        description,
        status: "Todo",
        priority,
        due_date
      })
    });

    const data = await res.json();

    if (res.ok) {
      loadTasks(projectId);
    } else {
      alert("Error: " + JSON.stringify(data));
    }

  });
}
