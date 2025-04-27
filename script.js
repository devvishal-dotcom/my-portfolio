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
// Shrink Welcome Text on Scroll
window.addEventListener('scroll', function () {
  const welcome = document.querySelector('.navbar h1'); // Targeting Welcome heading
  if (welcome) {
    let scale = Math.max(1 - window.scrollY / 300, 0.6); // Adjust scale, minimum 0.6
    welcome.style.transform = `scale(${scale})`;
  }
});

