document.getElementById("repair-form").addEventListener("submit", async function(e){
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    problem: document.getElementById("problem").value
  };
console.log("sending", data);// add this
  await fetch("/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  alert("Request Submitted!");
});

function openWhatsApp(){
  window.open("https://wa.me/923001234567", "_blank");
}

function scrollToForm(){
  document.getElementById("repair-form").scrollIntoView({
    behavior: "smooth"
  });
}

function goAdmin(){
  window.location.href = "/admin.html";
}