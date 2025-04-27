// Button Click Alert
const btn = document.getElementById("contactBtn");
if (btn) {
  btn.addEventListener("click", function() {
    alert("Thanks for reaching out! Email: vishalkumar4604@gmail.com");
  });
}

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});
