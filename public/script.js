document.getElementById("repair-form").addEventListener("submit", async function(e){
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerText;
  
  // 1. Button loading state
  submitBtn.innerText = "Sending...";
  submitBtn.disabled = true;

  const data = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    problem: document.getElementById("problem").value.trim()
  };

  // 2. Basic validation
  if (!data.name || !data.phone || !data.problem) {
    alert("Please fill all fields");
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
    return;
  }

  console.log("sending", data);

  try {
    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("✅ Request Submitted! Hum 10 min me call karenge.");
      document.getElementById("repair-form").reset(); // 👈 Form khali kar do
    } else {
      alert("❌ Server error. WhatsApp pe message kar den.");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Network error. Apna internet check karen ya WhatsApp karen.");
  } finally {
    // 3. Button wapis normal karo
    submitBtn.innerText = originalText;
    submitBtn.disabled = false;
  }
});

function openWhatsApp(){
  // 👇 Yahan apna number + message customize karo
  const msg = encodeURIComponent("Salam! Mujhe mobile repair karwana hai. Mera masla: ");
  window.open(`https://wa.me/923001234567?text=${msg}`, "_blank");
}

function scrollToForm(){
  // 👇 Ab section ID pe scroll hoga, zyada smooth
  document.getElementById("quote").scrollIntoView({
    behavior: "smooth"
  });
}

function goAdmin(){
  window.location.href = "/admin"; // 👈 .html hata do agar route /admin hai
}