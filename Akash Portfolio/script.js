// js/main.js

document.getElementById("contactForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    date: document.getElementById("wdate").value,
    package: document.getElementById("pkg").value,
    message: document.getElementById("message").value,
  };

  try {
    const res = await fetch("http://localhost:5000/send-enquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      document.getElementById("formSuccess").style.display = "block";
      this.reset();
    } else {
      alert("Failed to send enquiry");
    }
  } catch (err) {
    console.error(err);
    alert("Error sending enquiry");
  }
});
// Button Click Alert for Contact
const btn = document.getElementById("contactBtn") || document.querySelector(".contact .btn");
if (btn) {
  btn.addEventListener("click", function (e) {
    // Prevent default link behavior
    e.preventDefault();
    alert("Thanks for reaching out!\nEmail: pixelperfectjourney4u@gmail.com");
    // Open email client
    window.location.href = "mailto:pixelperfectjourney4u@gmail.com";
  });
}
