/* ------------------------------------------
   EMAILJS SETUP — REPLACE THESE 3 VALUES
   1. Go to https://emailjs.com and sign up (free)
   2. Create a service (Gmail recommended)
   3. Create an email template
   4. Paste your IDs below
   ------------------------------------------ */
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";   // e.g. "service_abc123"
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";  // e.g. "template_xyz789"
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";    // e.g. "aBcDeFgHiJkLmNoP"


const STUDIO_EMAIL = "pixelperfectjourney4u@gmail.com";

// ---- Load EmailJS SDK dynamically ----
(function loadEmailJS() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
  script.onload = () => {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  };
  document.head.appendChild(script);
})();

// ---- Form Submit Handler ----
document.getElementById("contactForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form        = this;
  const submitBtn   = form.querySelector("button[type='submit']");
  const successMsg  = document.getElementById("formSuccess");
  const errorMsg    = document.getElementById("formError");

  // Grab values
  const name    = document.getElementById("name").value.trim();
  const email   = document.getElementById("email").value.trim();
  const wdate   = document.getElementById("wdate").value;
  const pkg     = document.getElementById("pkg").value;
  const message = document.getElementById("message").value.trim();

  // Basic validation
  if (!name || !email) {
    showError(errorMsg, "Please fill in your name and email.");
    return;
  }
  if (!isValidEmail(email)) {
    showError(errorMsg, "Please enter a valid email address.");
    return;
  }

  // Loading state
  submitBtn.textContent = "Sending… ✦";
  submitBtn.disabled    = true;
  hideMsg(successMsg);
  hideMsg(errorMsg);

  const templateParams = {
    from_name:    name,
    from_email:   email,
    wedding_date: wdate   || "Not specified",
    package:      pkg     || "Not specified",
    message:      message || "No message provided",
    to_email:     STUDIO_EMAIL,
    reply_to:     email,
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

    // Success
    successMsg.textContent = `🙏 Thank you, ${name}! Your enquiry has been sent to ${STUDIO_EMAIL}. We'll reply within 24 hours.`;
    successMsg.classList.add("visible");
    form.reset();

  } catch (err) {
    console.error("EmailJS error:", err);
    showError(
      errorMsg,
      `Something went wrong. Please email us directly at ${STUDIO_EMAIL}`
    );

  } finally {
    submitBtn.textContent = "Send Enquiry ✦";
    submitBtn.disabled    = false;
  }
});

// ---- Helpers ----
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.add("visible");
}

function hideMsg(el) {
  el.classList.remove("visible");
  el.textContent = "";
}


const contactBtn = document.getElementById("contactBtn")
  || document.querySelector(".contact .btn--solid");

if (contactBtn) {
  contactBtn.addEventListener("click", function (e) {
    // Only intercept if it's not the form submit button
    if (this.type === "submit") return;
    e.preventDefault();
    window.location.href = `mailto:${STUDIO_EMAIL}?subject=Wedding Enquiry — Pixelperfect Journey`;
  });
}


function reelPlay(el) {
  const src = el.getAttribute("data-src");

  if (!src) {
    const btn = el.querySelector(".reel-frame__play");
    btn.style.background = "rgba(139,28,43,0.9)";
    setTimeout(() => { btn.style.background = ""; }, 500);
    return;
  }

  const video = document.createElement("video");
  video.src = src;
  video.autoplay = true;
  video.controls = true;
  video.loop = true;
  video.playsInline = true;

  el.innerHTML = "";
  el.appendChild(video);
}