const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const storedTheme = localStorage.getItem("theme");

if (storedTheme) {
  root.setAttribute("data-theme", storedTheme);
}

function updateThemeIcon() {
  if (!themeToggle) return;
  const isDark = root.getAttribute("data-theme") === "dark";
  themeToggle.innerHTML = `<i class="bi ${isDark ? "bi-sun" : "bi-moon-stars"}" aria-hidden="true"></i>`;
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

updateThemeIcon();

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
  updateThemeIcon();
});

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-link").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage || (currentPage === "" && href === "index.html")) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll("[data-animate]").forEach((element) => observer.observe(element));

document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = encodeURIComponent(form.name.value.trim());
  const email = encodeURIComponent(form.email.value.trim());
  const subject = encodeURIComponent(form.subject.value.trim() || "PhD research inquiry");
  const message = encodeURIComponent(form.message.value.trim());
  const body = `Name: ${name}%0AEmail: ${email}%0A%0A${message}`;
  
  // Attempt to open email client
  window.location.href = `mailto:davidahmadazeem@gmail.com?subject=${subject}&body=${body}`;
  
  // Show a helpful status notification in case mail client doesn't open
  const statusDiv = document.getElementById("form-status");
  if (statusDiv) {
    statusDiv.innerHTML = `
      <div class="alert alert-info alert-dismissible fade show mb-4" role="alert">
        <h3 class="h6 mb-2"><i class="bi bi-info-circle-fill me-2 text-primary"></i> Opening Email Application...</h3>
        <p class="mb-2" style="font-size: 0.9rem; color: var(--muted);">We are launching your default email application with your pre-filled message. If nothing happens, please copy the details below and send your message manually:</p>
        <div class="p-3 mb-2 rounded form-status-details" style="font-size: 0.85rem; font-family: monospace;">
          <strong>To:</strong> davidahmadazeem@gmail.com<br>
          <strong>Subject:</strong> ${decodeURIComponent(subject)}<br>
          <strong>Body:</strong> Name: ${decodeURIComponent(name)} (${decodeURIComponent(email)})<br>${decodeURIComponent(message)}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    
    // Target the rendered alert element directly so scroll-margin-top is honored
    const alertEl = statusDiv.querySelector(".alert");
    if (alertEl) {
      alertEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
});

// Copy email to clipboard utility with fallback for non-secure / file:// protocols
document.querySelectorAll("[data-copy-email]").forEach((button) => {
  button.addEventListener("click", () => {
    const email = button.getAttribute("data-copy-email");
    const originalText = button.innerHTML;
    
    const handleSuccess = () => {
      button.innerHTML = `<i class="bi bi-check2"></i> Copied!`;
      button.style.borderColor = "var(--accent)";
      button.style.color = "var(--accent)";
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.borderColor = "var(--border)";
        button.style.color = "var(--muted)";
      }, 2000);
    };

    const handleFallback = () => {
      const textArea = document.createElement("textarea");
      textArea.value = email;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand("copy");
        if (successful) {
          handleSuccess();
        } else {
          console.error("Fallback: execCommand copy was unsuccessful");
        }
      } catch (err) {
        console.error("Fallback: Unable to copy", err);
      }
      document.body.removeChild(textArea);
    };

    // If secure context and clipboard API is supported, try it first
    if (window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email)
        .then(handleSuccess)
        .catch((err) => {
          console.warn("Clipboard API failed, running fallback...", err);
          handleFallback();
        });
    } else {
      // Direct fallback for file:// or insecure http:// contexts
      handleFallback();
    }
  });
});
