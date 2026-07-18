/* =========================================
   PIXELPERFECT JOURNEY — CONTACT FORM
   Direct email via EmailJS (no backend)
   ========================================= */

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

/* ------------------------------------------
   EMAILJS TEMPLATE VARIABLES
   In your EmailJS template, use these tags:
   {{from_name}}   — sender's name
   {{from_email}}  — sender's email
   {{wedding_date}} — chosen wedding date
   {{package}}     — selected package
   {{message}}     — their message
   {{to_email}}    — your studio email
   ------------------------------------------ */

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


/* =========================================
   CONTACT BUTTON — mailto fallback
   ========================================= */
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


/* =========================================
   REELS SECTION — click-to-play
   Put a real Instagram Reel URL in the data-src of each
   .reel-frame__thumb in index.html. On click, this renders
   Instagram's own official embed (blockquote + embed.js),
   since Instagram doesn't allow direct linking to raw video files.
   ========================================= */
function reelPlay(el) {
  const src = el.getAttribute("data-src");

  if (!src) {
    const btn = el.querySelector(".reel-frame__play");
    btn.style.background = "rgba(139,28,43,0.9)";
    setTimeout(() => { btn.style.background = ""; }, 500);
    return;
  }

  el.classList.add("is-embedded");
  el.innerHTML = `<blockquote class="instagram-media" data-instgrm-permalink="${src}" data-instgrm-version="14" style="margin:0;width:100%;background:#4A1020;"></blockquote>`;

  if (window.instgrm) {
    window.instgrm.Embeds.process();
  } else {
    // embed.js hasn't loaded yet — load it now, it auto-processes on load
    const s = document.createElement("script");
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    document.body.appendChild(s);
  }
}