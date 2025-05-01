// Button Click Alert for Contact
const btn = document.getElementById("contactBtn") || document.querySelector(".contact .btn");
if (btn) {
  btn.addEventListener("click", function (e) {
    // Prevent default link behavior
    e.preventDefault();
    alert("Thanks for reaching out!\nEmail: vishalkumar4604@gmail.com");
    // Open email client
    window.location.href = "mailto:vishalkumar4604@gmail.com";
  });
}

// Sticky Navbar Scroll Effect
window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Shrink "Welcome" text on scroll
  const welcome = document.querySelector('.navbar h1');
  if (welcome) {
    const scale = Math.max(1 - window.scrollY / 300, 0.7); // Limits scaling to 0.7
    welcome.style.transform = `scale(${scale})`;
  }
});

// Smooth Scroll for Navbar Links
document.querySelectorAll('.navbar a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Simple Fade-in Animation for Sections
const fadeElements = document.querySelectorAll('.section, .hero');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, {
  threshold: 0.1
});

fadeElements.forEach(el => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(40px)';
  el.style.transition = 'all 0.7s ease';
  observer.observe(el);
});
