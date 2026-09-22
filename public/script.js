// ===== FORM SUBMIT ====
document.getElementById("repair-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const submitButton = form.querySelector("button[type='submit']");

  const data = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    problem: document.getElementById("problem").value.trim()
  };

  if (!data.name || !data.phone || !data.problem) {
    alert("Please sab fields fill karein.");
    return;
  }
  if (data.name.length < 2) {
  alert("Please apna valid name enter karein.");
  return;
  }
if (data.problem.length < 5) {
  alert("Please apni mobile problem thori detail mein enter karein.");
  return;
}
  const cleanPhone = data.phone.replace(/\s+/g, "");

if (cleanPhone.length !== 11 || !cleanPhone.startsWith("03")) {
  alert("Please valid Pakistani mobile number enter karein. Example: 03001234567");
  return;
}

  try {
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    const response = await fetch("/submit-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      alert("Request Submitted Successfully! ✅");
      form.reset();
    } else {
      alert("Request submit nahi ho saki. Please dobara try karein.");
    }

  } catch (error) {
    console.error("Submit Error:", error);
    alert("Server se connection nahi ho saka. Please dobara try karein.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit Karo - Hum Call Karenge";
  }
});


// ===== WHATSAPP =====
function openWhatsApp() {
  window.open("https://wa.me/923001234567", "_blank");
}


// ===== SCROLL TO FORM =====
function scrollToForm() {
  document.getElementById("repair-form").scrollIntoView({
    behavior: "smooth"
  });
}


// ===== ADMIN LOGIN =====
function goAdmin() {
  window.location.href = "/login";
}