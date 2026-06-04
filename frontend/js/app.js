// ==========================
// MOBILE MENU
// ==========================
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// ==========================
// DARK MODE
// ==========================
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    
    // Save Mode
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
}

// Load Saved Theme
window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
});

// ==========================
// FAQ DROPDOWN
// ==========================
const faqQuestions = document.querySelectorAll(".faq-question");

if (faqQuestions.length > 0) {
  faqQuestions.forEach(question => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      if (answer) {
        if (answer.style.display === "block") {
          answer.style.display = "none";
        } else {
          answer.style.display = "block";
        }
      }
    });
  });
}

// ==========================
// NAVBAR SCROLL EFFECT
// ==========================
const navbar = document.querySelector(".navbar");

if (navbar) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.style.background = "#081120";
      navbar.style.padding = "15px 8%";
    } else {
      navbar.style.background = "rgba(255,255,255,0.08)";
      navbar.style.padding = "18px 8%";
    }
  });
}

// ==========================
// ACTIVE LINK ON CLICK
// ==========================
const links = document.querySelectorAll(".nav-links a");

if (links.length > 0 && navLinks) {
  links.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}

// ==========================
// CONTACT FORM DEMO
// ==========================
const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Message Sent Successfully!");
    contactForm.reset();
  });
}

// ==========================
// SCROLL ANIMATION EFFECT
// ==========================
const heroContent = document.querySelector(".hero-content");

if (heroContent) {
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    heroContent.style.transform = `translateY(${scrollTop * 0.2}px)`;
  });
}

// ==========================
// LOADER
// ==========================
window.addEventListener("load", () => {
  const loader = document.querySelector(".loader-wrapper");
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = "0";
      loader.style.visibility = "hidden";
    }, 1200);
  }
});

// ==========================
// SCROLL PROGRESS BAR
// ==========================
const progressBar = document.querySelector(".progress-bar");

if (progressBar) {
  window.addEventListener("scroll", () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = progress + "%";
  });
}

// ==========================
// TYPING EFFECT
// ==========================
const typingText = document.querySelector(".typing");

if (typingText) {
  const words = [
    "MEET SERVICES",
    "MEET SOLUTIONS",
    "MEET DIGITAL WORLD",
    "MEET INNOVATION"
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      typingText.textContent = currentWord.substring(0, charIndex--);
    } else {
      typingText.textContent = currentWord.substring(0, charIndex++);
    }
    
    let speed = isDeleting ? 70 : 120;
    
    if (!isDeleting && charIndex === currentWord.length) {
      speed = 1500;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
    }
    
    setTimeout(typeEffect, speed);
  }

  typeEffect();
}

// ==========================
// SERVICE SEARCH FILTER
// ==========================
const serviceSearch = document.getElementById("serviceSearch");

if (serviceSearch) {
  serviceSearch.addEventListener("keyup", () => {
    const value = serviceSearch.value.toLowerCase();
    const cards = document.querySelectorAll(".service-card");
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(value)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}

// ==========================
// SHOP SEARCH FILTER
// ==========================
const shopSearch = document.getElementById("shopSearch");

if (shopSearch) {
  shopSearch.addEventListener("keyup", () => {
    const value = shopSearch.value.toLowerCase();
    const cards = document.querySelectorAll(".product-card");
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(value)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}

// ==========================
// DEMO CART BUTTON
// ==========================
const cartButtons = document.querySelectorAll(".cart-btn");

if (cartButtons.length > 0) {
  cartButtons.forEach(button => {
    button.addEventListener("click", () => {
      alert("Product Added To Cart");
    });
  });
}
