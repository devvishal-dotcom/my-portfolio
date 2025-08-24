const addBtn = document.getElementById("add-task");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

// Add Task
addBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  const li = document.createElement("li");
  li.textContent = taskText;

  // Click to mark complete
  li.addEventListener("click", () => {
    li.classList.toggle("completed");
  });

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.style.marginLeft = "10px";
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent toggle
    li.remove();
  });

  li.appendChild(delBtn);
  taskList.appendChild(li);

  taskInput.value = "";
});
