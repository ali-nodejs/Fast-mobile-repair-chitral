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
    if(!data.name || !data.phone || !data.problem) {
        showToast("⚠️ Please fill all fields"); // <-- CHANGE 1
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
            showToast("✅ Request Submitted! Hum 10 min me call karenge"); // <-- CHANGE 2
            document.getElementById("repair-form").reset(); // Form khali kar do
        } else {
            showToast("❌ Server error. WhatsApp pe message kar den."); // <-- CHANGE 3
        }
    } catch (err) {
        console.error(err);
        showToast("❌ Network error. Apna internet check karen ya WhatsApp karen."); // <-- CHANGE 4
    } finally {
        // 3. Button wapis normal karo
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});

// YE NAYA FUNCTION SABSE NEECHE LAGA DEN
function showToast(message){
    let msg = document.createElement("div");
    msg.innerText = message;
    msg.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#111;color:white;padding:12px 20px;border-radius:8px;z-index:9999;font-weight:bold;box-shadow:0 4px 10px rgba(0,0,0,0.3)";
    document.body.appendChild(msg);
    setTimeout(()=>{ msg.remove(); }, 3000); // 3 sec baad gayab
}

function openWhatsApp(){
    // Yahan apna number + message customize karo
    const msg = encodeURIComponent("Salam! Mujhe mobile repair karwana hai. Mera masla: ");
    window.open(`https://wa.me/923438313362?text=${msg}`, "_blank")
}

function scrollToForm(){
    // Ab section ID pe scroll hoga, zyada smooth
    document.getElementById("quote").scrollIntoView({
        behavior: "smooth"
    });
}

function goAdmin(){
    window.location.href = "/admin"; // .html hata do agar route /admin hai
}