/**
 * GLOBAL APP LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initThemeToggle();
    loadFeaturedCars();
    loadPremiumHero();
    initScrollAnimations();
    initCounters();
    initParallax();
});

// Header scroll effect
function initHeaderScroll() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (toggle) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}

// Theme toggle (dark/light)
function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    const icon = toggle?.querySelector('i');
    const saved = localStorage.getItem('theme');

    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (icon) icon.setAttribute('data-lucide', 'sun');
    }

    toggle?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : '');
        localStorage.setItem('theme', newTheme);

        if (icon) {
            icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
            lucide.createIcons();
        }
    });
}

// Load premium hero car (most expensive non-commercial vehicle)
async function loadPremiumHero() {
    const heroSection = document.getElementById('hero-premium');
    if (!heroSection) return;

    try {
        const response = await fetch('data/inventory.json');
        const data = await response.json();
        
        // Find the most expensive car (excluding commercial vans)
        const cars = data.cars.filter(c => !c.sold);
        const premiumCar = cars.reduce((max, car) => {
            const isCommercial = car.model.toLowerCase().includes('sprinter') || 
                                car.model.toLowerCase().includes('carga') ||
                                car.brand.toLowerCase().includes('sprinter');
            return (!isCommercial && car.price > max.price) ? car : max;
        }, cars[0]);

        if (!premiumCar) return;

        // Update hero content
        document.getElementById('hero-car-image').src = premiumCar.imageUrl;
        document.getElementById('hero-car-image').alt = `${premiumCar.brand} ${premiumCar.model}`;
        document.getElementById('hero-brand').textContent = premiumCar.brand;
        document.getElementById('hero-model').textContent = premiumCar.model;
        document.getElementById('hero-year').textContent = premiumCar.year;
        
        const formattedKm = new Intl.NumberFormat('es-ES').format(premiumCar.km);
        document.getElementById('hero-km').textContent = `${formattedKm} km`;
        document.getElementById('hero-fuel').textContent = premiumCar.fuel;
        document.getElementById('hero-transmission').textContent = premiumCar.transmission;
        
        document.getElementById('hero-car-link').href = `coche.html?id=${premiumCar.id}`;
        document.getElementById('hero-whatsapp').href = `https://wa.me/34722277313?text=Hola,%20estoy%20interesado%20en%20el%20${encodeURIComponent(premiumCar.brand + ' ' + premiumCar.model)}%20de%20Autos%20Sanchez%20Guerrero.`;

        // Calculate discount from ~15.000€
        const originalPrice = 15000;
        const savings = originalPrice - premiumCar.price;
        
        // Show original price (crossed out) and savings badge
        const originalEl = document.getElementById('hero-price-original');
        const saveEl = document.getElementById('hero-save-badge');
        if (originalEl) {
            originalEl.textContent = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(originalPrice);
        }
        if (saveEl && savings > 0) {
            saveEl.textContent = `Ahorra ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(savings)}`;
        }

        // Animate price counter: count DOWN from originalPrice to actual price
        animateCounter('hero-price-value', premiumCar.price, 1500, originalPrice);
        
    } catch (error) {
        console.error('Error loading premium hero:', error);
    }
}

// Animate counter from start to target (supports counting up or down)
function animateCounter(elementId, target, duration = 1500, start = 0) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);
        
        element.textContent = new Intl.NumberFormat('es-ES').format(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Parallax effect on hero background
function initParallax() {
    const heroBg = document.getElementById('hero-bg');
    if (!heroBg) return;

    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                const heroHeight = document.getElementById('hero-premium')?.offsetHeight || 700;
                
                if (scrolled < heroHeight) {
                    const parallaxValue = scrolled * 0.3;
                    heroBg.style.transform = `translateY(${parallaxValue}px)`;
                }
                
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Counter animation for stats
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const suffix = el.textContent.includes('+') ? '+' : el.textContent.includes('%') ? '%' : '+';
                
                animateCounterElement(el, target, suffix, 2000);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounterElement(element, target, suffix, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        
        element.textContent = current.toLocaleString('es-ES') + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Loads cars with featured: true from inventory.json
async function loadFeaturedCars() {
    const featuredGrid = document.getElementById('featured-cars-grid');
    if (!featuredGrid) return;

    try {
        const response = await fetch('data/inventory.json');
        const data = await response.json();
        const featured = data.cars.filter(car => car.featured === true).slice(0, 3);
        
        if (featured.length === 0) {
            featuredGrid.innerHTML = '<p class="text-center text-muted">No hay ofertas destacadas en este momento.</p>';
            return;
        }

        featuredGrid.innerHTML = featured.map(car => createCarCardHTML(car)).join('');
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading cars:', error);
        featuredGrid.innerHTML = '<p class="text-center text-danger">Error al cargar el inventario.</p>';
    }
}

// Helper to generate car card HTML
function createCarCardHTML(car) {
    const formattedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.price);
    const formattedKm = new Intl.NumberFormat('es-ES').format(car.km);
    
    return `
        <div class="car-card" onclick="window.location.href='coche.html?id=${car.id}'">
            ${car.featured ? '<span class="badge-featured">Destacado</span>' : ''}
            ${car.sold ? '<span class="badge-sold">Vendido</span>' : ''}
            <div class="car-img-wrapper">
                <img src="${car.imageUrl}" alt="${car.brand} ${car.model}" loading="lazy">
                <div class="car-price-top">${formattedPrice}</div>
            </div>
            <div class="car-info">
                <h3 class="car-title">${car.brand} ${car.model}</h3>
                <div class="car-specs">
                    <div class="spec-item"><i data-lucide="calendar" style="width:14px"></i><span>${car.year}</span></div>
                    <div class="spec-item"><i data-lucide="gauge" style="width:14px"></i><span>${formattedKm} km</span></div>
                    <div class="spec-item"><i data-lucide="activity" style="width:14px"></i><span>${car.transmission}</span></div>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-muted" style="font-size: 0.8rem;">Año: ${car.year} | ${car.fuel}</span>
                    <a href="coche.html?id=${car.id}" class="btn btn-outline btn-sm" style="padding: 0.4rem 0.8rem;">Ver Detalle</a>
                </div>
            </div>
        </div>
    `;
}

// Scroll animations with IntersectionObserver
function initScrollAnimations() {
    // Handle reveal elements
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Handle fade-in-up elements
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => fadeObserver.observe(el));
}
