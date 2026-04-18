let allData = [];
let editIndex = null;
async function loadData() {
  const res = await fetch("/requests");
  const data = await res.json();

  allData = data; // 👈 store globally

  renderTable(data);
  updateStats(data);
}
window.filterData = function() {
  const value = document.getElementById("search").value.toLowerCase();
  const filtered = allData.filter(item => {
    return (
      item.name.toLowerCase().includes(value) ||
      item.phone.includes(value)
    );
  });
  renderTable(filtered);
};
// 👇 table render function
function renderTable(data) {
  const list = document.getElementById("list");
  list.innerHTML = "";
  data.forEach((item, index) => {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${item.name}</td>
    <td>${item.phone}</td>
    <td>${item.problem}</td>
    <td class="${item.status === 'done' ? 'done' : 'pending'}">
      ${item.status}
    </td>
    <td>
  <button class="toggle-btn" onclick="toggleStatus(${item.id})">Toggle</button>
<button class="edit-btn" onclick="editRequest(${item.id})">Edit</button>
<button class="delete-btn" onclick="deleteRequest(${item.id})">Delete</button>
    </td>
  `;
  list.appendChild(row);
});
} // 👇 ab ye functions bahar likho
function editRequest(id) {
  const item = allData.find(x => x.id === id);

  editIndex = id;

  document.getElementById("editName").value = item.name;
  document.getElementById("editPhone").value = item.phone;
  document.getElementById("editproblem").value = item.problem;

  document.getElementById("editModal").style.display = "block";
}
async function saveEdit() {
  if (editIndex === null) {
    alert("No item selected!");
    return;
  }

  const updatedData = {
    name: document.getElementById("editName").value,
    phone: document.getElementById("editPhone").value,
    problem: document.getElementById("editproblem").value
  };

  await fetch(`/update/${editIndex}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updatedData)
  });

  document.getElementById("editModal").style.display = "none";
  editIndex = null;

  loadData();
}
function updateStats(data) {
  document.getElementById("total").innerText = data.length;

  const pending = data.filter(item => item.status === "pending").length;
  const done = data.filter(item => item.status === "done").length;

  document.getElementById("pending").innerText = pending;
  document.getElementById("done").innerText = done;
}
window.toggleStatus = async function(id) {
  await fetch(`/toggle/${id}`, { method: "POST" });
  loadData();
};

window.deleteRequest = async function(id) {
  if (confirm("Are you sure?")) {
    await fetch(`/delete/${id}`, { method: "POST" });
    loadData();
  }
};

// ✅ IMPORTANT
loadData();