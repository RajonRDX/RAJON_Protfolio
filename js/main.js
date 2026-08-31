// Theme Management
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

themeToggle.addEventListener('click', toggleTheme);

// Mobile Menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const mobileCloseBtn = document.getElementById('mobileCloseBtn');

mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.add('active');
});

mobileCloseBtn.addEventListener('click', () => {
  navLinks.classList.remove('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Active Navigation Link
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navItems.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});

// Scroll Animations
const fadeElements = document.querySelectorAll('.fade-in');
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

fadeElements.forEach(el => fadeObserver.observe(el));

// Animated Counters
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);

  function update() {
    start += increment;
    if (start < target) {
      el.textContent = Math.floor(start) + '+';
      requestAnimationFrame(update);
    } else {
      el.textContent = target + '+';
    }
  }
  update();
}

const statsSection = document.querySelector('.stats-section');
let countersAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersAnimated) {
      countersAnimated = true;
      document.querySelectorAll('.stat-number').forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
      });
    }
  });
}, { threshold: 0.5 });

if (statsSection) {
  statsObserver.observe(statsSection);
}

// Skill Bar Animation
const skillBars = document.querySelectorAll('.skill-bar-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const width = entry.target.getAttribute('data-width');
      entry.target.style.width = width + '%';
    }
  });
}, { threshold: 0.5 });

skillBars.forEach(bar => skillObserver.observe(bar));

// Projects Data & Filtering
let allProjects = [];
let currentFilters = {
  paymentSystem: 'all',
  technology: 'all',
  category: 'all',
  search: ''
};

async function loadProjects() {
  try {
    const response = await fetch('data/projects.json');
    allProjects = await response.json();
    renderProjects(allProjects);
    populateFilters();
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';

  if (projects.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--gray);"><i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; color: var(--gold); opacity: 0.5;"></i><p>No projects found matching your criteria.</p></div>';
    return;
  }

  projects.forEach(project => {
    const card = createProjectCard(project);
    grid.appendChild(card);
  });
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card fade-in';
  card.setAttribute('data-id', project.id);

  const badgesHtml = project.paymentSystems.map(ps => {
    const badgeClass = 'badge-' + ps.toLowerCase().replace(/\s+/g, '');
    return `<span class="badge ${badgeClass}">${ps}</span>`;
  }).join('');

  const tagsHtml = project.technologies.slice(0, 4).map(tech => 
    `<span class="project-tag">${tech}</span>`
  ).join('');

  card.innerHTML = `
    <div class="project-image-wrapper">
      <img src="${project.image}" alt="${project.title}" class="project-image" loading="lazy">
    </div>
    <div class="project-content">
      <h3 class="project-title">${project.title}</h3>
      <p class="project-subtitle">${project.subtitle}</p>
      <div class="project-badges">${badgesHtml}</div>
      <div class="project-tags">${tagsHtml}</div>
      <p class="project-desc">${project.challenge}</p>
    </div>
  `;

  card.addEventListener('click', () => openModal(project));

  // Trigger fade-in animation
  setTimeout(() => card.classList.add('visible'), 100);

  return card;
}

function populateFilters() {
  const paymentSystems = new Set();
  const technologies = new Set();
  const categories = new Set();

  allProjects.forEach(p => {
    p.paymentSystems.forEach(ps => paymentSystems.add(ps));
    p.technologies.forEach(t => technologies.add(t));
    categories.add(p.category);
  });

  populateFilterGroup('paymentSystemFilters', Array.from(paymentSystems).sort());
  populateFilterGroup('technologyFilters', Array.from(technologies).sort());
  populateFilterGroup('categoryFilters', Array.from(categories).sort());
}

function populateFilterGroup(containerId, items) {
  const container = document.getElementById(containerId);
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = item;
    btn.setAttribute('data-value', item);
    btn.addEventListener('click', () => handleFilterClick(containerId, btn, item));
    container.appendChild(btn);
  });
}

function handleFilterClick(groupId, btn, value) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (groupId === 'paymentSystemFilters') currentFilters.paymentSystem = value;
  if (groupId === 'technologyFilters') currentFilters.technology = value;
  if (groupId === 'categoryFilters') currentFilters.category = value;

  applyFilters();
}

function applyFilters() {
  let filtered = allProjects.filter(project => {
    const matchPS = currentFilters.paymentSystem === 'all' || 
      project.paymentSystems.includes(currentFilters.paymentSystem);
    const matchTech = currentFilters.technology === 'all' || 
      project.technologies.includes(currentFilters.technology);
    const matchCat = currentFilters.category === 'all' || 
      project.category === currentFilters.category;
    const matchSearch = currentFilters.search === '' || 
      project.title.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
      project.subtitle.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
      project.challenge.toLowerCase().includes(currentFilters.search.toLowerCase());

    return matchPS && matchTech && matchCat && matchSearch;
  });

  renderProjects(filtered);
}

// Search functionality
const searchInput = document.getElementById('projectSearch');
searchInput.addEventListener('input', (e) => {
  currentFilters.search = e.target.value;
  applyFilters();
});

// Clear filters
document.getElementById('clearFilters').addEventListener('click', () => {
  currentFilters = { paymentSystem: 'all', technology: 'all', category: 'all', search: '' };
  searchInput.value = '';
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  renderProjects(allProjects);
});

// Modal
const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');

function openModal(project) {
  const badgesHtml = project.paymentSystems.map(ps => {
    const badgeClass = 'badge-' + ps.toLowerCase().replace(/\s+/g, '');
    return `<span class="badge ${badgeClass}">${ps}</span>`;
  }).join('');

  const tagsHtml = project.technologies.map(tech => 
    `<span class="project-tag">${tech}</span>`
  ).join('');

  const featuresHtml = project.keyFeatures.map(f => `<li>${f}</li>`).join('');
  const resultsHtml = project.results.map(r => `<li>${r}</li>`).join('');

  modalBody.innerHTML = `
    <img src="${project.image}" alt="${project.title}" class="modal-image">
    <div class="modal-body">
      <h2 class="modal-title">${project.title}</h2>
      <p class="modal-subtitle">${project.subtitle}</p>

      <div class="modal-section">
        <div class="project-badges" style="margin-bottom: 15px;">${badgesHtml}</div>
        <div class="project-tags">${tagsHtml}</div>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title"><i class="fas fa-user-tie"></i> Role</h4>
        <p>${project.role}</p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title"><i class="fas fa-exclamation-triangle"></i> Challenge</h4>
        <p>${project.challenge}</p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title"><i class="fas fa-lightbulb"></i> Solution</h4>
        <p>${project.solution}</p>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title"><i class="fas fa-star"></i> Key Features</h4>
        <ul>${featuresHtml}</ul>
      </div>

      <div class="modal-section">
        <h4 class="modal-section-title"><i class="fas fa-chart-line"></i> Results</h4>
        <div class="modal-results">
          <ul>${resultsHtml}</ul>
        </div>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Contact Form
const contactForm = document.getElementById('contactForm');
const formGroups = contactForm.querySelectorAll('.form-group');

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(input, message) {
  const group = input.closest('.form-group');
  group.classList.add('error');
  group.querySelector('.form-error').textContent = message;
}

function clearError(input) {
  const group = input.closest('.form-group');
  group.classList.remove('error');
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let isValid = true;

  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const subject = document.getElementById('subject');
  const message = document.getElementById('message');

  if (name.value.trim() === '') {
    showError(name, 'Name is required');
    isValid = false;
  } else {
    clearError(name);
  }

  if (email.value.trim() === '') {
    showError(email, 'Email is required');
    isValid = false;
  } else if (!validateEmail(email.value)) {
    showError(email, 'Please enter a valid email');
    isValid = false;
  } else {
    clearError(email);
  }

  if (subject.value.trim() === '') {
    showError(subject, 'Subject is required');
    isValid = false;
  } else {
    clearError(subject);
  }

  if (message.value.trim() === '') {
    showError(message, 'Message is required');
    isValid = false;
  } else if (message.value.trim().length < 10) {
    showError(message, 'Message must be at least 10 characters');
    isValid = false;
  } else {
    clearError(message);
  }

  if (isValid) {
    showToast('Message sent successfully! I will get back to you soon.');
    contactForm.reset();
  }
});

formGroups.forEach(group => {
  const input = group.querySelector('input, textarea');
  if (input) {
    input.addEventListener('input', () => clearError(input));
  }
});

// Copy to Clipboard
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} copied to clipboard!`);
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast(`${label} copied to clipboard!`);
  });
}

// Toast Notification
function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Hero Particles
function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (10 + Math.random() * 10) + 's';
    particle.style.width = (2 + Math.random() * 4) + 'px';
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadProjects();
  createParticles();

  // Hide loader
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 500);
});

// Featured Projects Carousel (simplified)
let featuredIndex = 0;
function initFeaturedCarousel() {
  const featured = allProjects.filter(p => p.featured);
  // Could implement a carousel here if needed
}
