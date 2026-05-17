/**
 * GLOBAL APP LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    loadFeaturedCars();
    initScrollAnimations();
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
            // Inline mobile styles if needed, but better via CSS
        });
    }
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
        lucide.createIcons(); // Re-initialize icons for new elements
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
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
}
