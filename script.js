const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("siteNav");
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const revealElements = document.querySelectorAll(".reveal");
const parallaxCards = document.querySelectorAll(".parallax-card");
const hero = document.getElementById("home");
const heroSubtitle = document.getElementById("heroSubtitle");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const closeMobileMenu = () => {
  if (!nav || !menuToggle) return;
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId) return;
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    event.preventDefault();
    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    closeMobileMenu();
  });
});

if (!prefersReducedMotion && revealElements.length > 0) {
  const observer = new IntersectionObserver(
    (entries, intersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          intersectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

if (hero && !prefersReducedMotion && parallaxCards.length > 0) {
  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    parallaxCards.forEach((card) => {
      const depth = Number(card.getAttribute("data-depth")) || 0.1;
      const moveX = x * 30 * depth;
      const moveY = y * 30 * depth;
      card.style.setProperty("--mx", `${moveX}px`);
      card.style.setProperty("--my", `${moveY}px`);
    });
  });

  hero.addEventListener("mouseleave", () => {
    parallaxCards.forEach((card) => {
      card.style.setProperty("--mx", "0px");
      card.style.setProperty("--my", "0px");
    });
  });
}

if (heroSubtitle && !prefersReducedMotion) {
  const fullText = heroSubtitle.textContent.trim();
  let index = 0;
  heroSubtitle.textContent = "";
  const typeInterval = window.setInterval(() => {
    heroSubtitle.textContent += fullText.charAt(index);
    index += 1;
    if (index >= fullText.length) {
      window.clearInterval(typeInterval);
    }
  }, 16);
}
