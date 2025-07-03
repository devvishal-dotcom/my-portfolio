// Initialize AOS animations
document.addEventListener("DOMContentLoaded", () => {
  AOS.init({
    duration: 1000,
    once: true,
  });

  // Smooth scroll for navbar links
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Password strength checker
  const passwordInput = document.querySelector('input[name="password"]');
  const strengthMessage = document.getElementById('strengthMessage');

  if (passwordInput && strengthMessage) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      let strength = 'Weak';

      if (val.length > 6 && /[A-Z]/.test(val) && /[0-9]/.test(val)) {
        strength = 'Strong';
      } else if (val.length > 5) {
        strength = 'Medium';
      }

      strengthMessage.textContent = `Password Strength: ${strength}`;
      strengthMessage.className = strength.toLowerCase();
    });
  }
});
