alert("JS file load ho gayi");

// 👇 showError yahin upar le aao
function showError(msg) {
  const box = document.getElementById('debug');
  if (box) {
    box.style.display = 'block';
    box.innerHTML += msg + '<br>';
  }
}

let allData = [];
let editIndex = null;

async function loadData() {
  try {
    showError("1. Fetch start ho raha hai...");
    const res = await fetch("/requests");
    showError("2. Server se response mila. Status: " + res.status);
    
    if (!res.ok) {
      showError("3. ERROR: Server ne " + res.status + " error diya");
      return;
    }
    
    const data = await res.json();
    showError("4. Data mila: " + JSON.stringify(data).slice(0,100) + "...");
    showError("5. Total items: " + data.length);
    
    allData = data; 
    renderTable(data);
    updateStats(data);
    showError("6. Table render ho gaya ✅");
    
  } catch (err) {
    showError("CATCH ERROR: " + err.message);
  }
}

window.filterData = function() {
  const value = document.getElementById("search").value.toLowerCase();
  const filtered = allData.filter(item => {
    const name = item.name ? item.name.toLowerCase() : "";
    const phone = item.phone ? String(item.phone) : "";
    return name.includes(value) || phone.includes(value);
  });
  renderTable(filtered);
};

function renderTable(data) {
  const list = document.getElementById("tableBody");
  list.innerHTML = "";
  data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name || ''}</td>
      <td>${item.phone || ''}</td>
      <td>${item.problem || ''}</td>
      <td class="${item.status === 'done' ? 'done' : 'pending'}">
        ${item.status || 'pending'}
      </td>
      <td>
        <button onclick="toggleStatus(${item.id})">Toggle</button>
        <button onclick="editRequest(${item.id})">Edit</button>
        <button onclick="deleteRequest(${item.id})">Delete</button>
      </td>
    `;
    list.appendChild(row);
  });
}

function editRequest(id) {
  const item = allData.find(x => x.id === id);
  if (!item) return alert("Item nahi mila!");
  editIndex = id;
  document.getElementById("editName").value = item.name;
  document.getElementById("editPhone").value = item.phone;
  document.getElementById("editproblem").value = item.problem;
  document.getElementById("editModal").style.display = "block";
}

async function saveEdit() {
  if (editIndex === null) return alert("No item selected!");
  const updatedData = {
    name: document.getElementById("editName").value.trim(),
    phone: document.getElementById("editPhone").value.trim(),
    problem: document.getElementById("editproblem").value.trim()
  };
  if(!updatedData.name || !updatedData.phone) return alert("Name aur Phone zaroori hai");
  
  await fetch(`/update/${editIndex}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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

// 👇 Ye line sabse zaroori thi, ye missing thi
loadData();