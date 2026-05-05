let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function renderTasks() {
  const columns = ["todo", "inprogress", "done"];

  columns.forEach(col => {
    const list = document.getElementById(`${col}-list`);
    const colTasks = tasks.filter(t => t.status === col);

    document.getElementById(`${col}-count`).textContent = colTasks.length;

    if (colTasks.length === 0) {
      const icons = { todo: "inbox", inprogress: "pending", done: "check_circle" };
      const labels = { todo: "No tasks yet", inprogress: "Nothing in progress", done: "Nothing done yet" };
      list.innerHTML = `<div class="empty-state"><span class="material-icons">${icons[col]}</span>${labels[col]}</div>`;
      return;
    }

    list.innerHTML = "";
    colTasks.forEach(task => {
      const div = document.createElement("div");
      div.className = `task ${task.priority.toLowerCase()}`;
      div.draggable = true;
      div.id = task.id;
      div.innerHTML = `
        <div class="task-top">
          <span class="task-text">${escapeHtml(task.text)}</span>
          <div class="task-actions">
            <button onclick="deleteTask('${task.id}')" title="Delete">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
        <div class="task-meta">
          <span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
          <span class="task-date">${formatDate(task.id)}</span>
        </div>
      `;
      div.ondragstart = drag;
      list.appendChild(div);
    });
  });

  const total = tasks.length;
  document.getElementById("totalCount").textContent = `${total} task${total !== 1 ? "s" : ""}`;
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function addTask() {
  const input = document.getElementById("taskInput");
  const priority = document.getElementById("priority").value;
  const text = input.value.trim();

  if (!text) {
    input.classList.add("shake");
    input.addEventListener("animationend", () => input.classList.remove("shake"), { once: true });
    input.focus();
    return;
  }

  tasks.push({ id: Date.now().toString(), text, priority, status: "todo" });
  saveTasks();
  renderTasks();
  input.value = "";
  input.focus();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function allowDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drag-over");
}

function dragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function drag(e) {
  e.dataTransfer.setData("text", e.target.id);
}

function drop(e) {
  e.preventDefault();
  const col = e.currentTarget;
  col.classList.remove("drag-over");
  const id = e.dataTransfer.getData("text");
  const newStatus = col.id;

  tasks = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
  saveTasks();
  renderTasks();
}

document.getElementById("taskInput").addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

renderTasks();
