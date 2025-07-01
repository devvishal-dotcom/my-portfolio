// Initialize AOS library
AOS.init({
  duration: 1000,
  once: true,
});

// Optional: Smooth scroll for navigation links
const navLinks = document.querySelectorAll(".navbar nav ul li a");

navLinks.forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    target.scrollIntoView({ behavior: "smooth" });
  });
});
