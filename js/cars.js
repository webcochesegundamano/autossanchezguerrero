/**
 * CARS LISTING & FILTERING LOGIC
 */

let allCars = [];
const filters = {
    search: '',
    brand: '',
    maxPrice: 30000,
    transmission: '',
    sortBy: 'price-asc'
};

document.addEventListener('DOMContentLoaded', async () => {
    await fetchInventory();
    initFilters();
    renderFilteredCars();
});

// Fetch data
async function fetchInventory() {
    try {
        const response = await fetch('data/inventory.json');
        const data = await response.json();
        allCars = data.cars;
        
        // Populate brand dropdown
        const brands = [...new Set(allCars.map(c => c.brand))].sort();
        const brandSelect = document.getElementById('brand-filter');
        if (brandSelect) {
            brands.forEach(brand => {
                const opt = document.createElement('option');
                opt.value = brand;
                opt.textContent = brand;
                brandSelect.appendChild(opt);
            });
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

// Attach event listeners
function initFilters() {
    const searchInput = document.getElementById('search-input');
    const brandSelect = document.getElementById('brand-filter');
    const priceRange = document.getElementById('price-range');
    const priceVal = document.getElementById('price-val');
    const sortSelect = document.getElementById('sort-order');
    const resetBtn = document.getElementById('reset-filters');

    if (searchInput) searchInput.addEventListener('input', (e) => {
        filters.search = e.target.value.toLowerCase();
        renderFilteredCars();
    });

    if (brandSelect) brandSelect.addEventListener('change', (e) => {
        filters.brand = e.target.value;
        renderFilteredCars();
    });

    if (priceRange) priceRange.addEventListener('input', (e) => {
        filters.maxPrice = parseInt(e.target.value);
        priceVal.textContent = new Intl.NumberFormat('es-ES').format(filters.maxPrice) + '€';
        renderFilteredCars();
    });

    if (sortSelect) sortSelect.addEventListener('change', (e) => {
        filters.sortBy = e.target.value;
        renderFilteredCars();
    });

    if (resetBtn) resetBtn.addEventListener('click', () => {
        filters.search = '';
        filters.brand = '';
        filters.maxPrice = 30000;
        filters.transmission = '';
        
        if (searchInput) searchInput.value = '';
        if (brandSelect) brandSelect.value = '';
        if (priceRange) {
            priceRange.value = 30000;
            priceVal.textContent = '30.000€';
        }
        
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.val === '');
        });

        renderFilteredCars();
    });

    // Handle chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const type = chip.dataset.type;
            const val = chip.dataset.val;

            // Remove active from peers
            document.querySelectorAll(`.filter-chip[data-type="${type}"]`).forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            filters[type] = val;
            renderFilteredCars();
        });
    });
}

// Core filtering engine
function renderFilteredCars() {
    const grid = document.getElementById('cars-grid');
    const countDisplay = document.getElementById('results-count');
    if (!grid) return;

    let filtered = allCars.filter(car => {
        const matchesSearch = car.brand.toLowerCase().includes(filters.search) || 
                              car.model.toLowerCase().includes(filters.search);
        const matchesBrand = filters.brand === '' || car.brand === filters.brand;
        const matchesPrice = car.price <= filters.maxPrice;
        const matchesTransmission = filters.transmission === '' || car.transmission.includes(filters.transmission);

        return matchesSearch && matchesBrand && matchesPrice && matchesTransmission;
    });

    // Sort
    filtered.sort((a, b) => {
        switch (filters.sortBy) {
            case 'price-asc': return a.price - b.price;
            case 'price-desc': return b.price - a.price;
            case 'year-desc': return b.year - a.year;
            case 'km-asc': return a.km - b.km;
            default: return 0;
        }
    });

    // Render
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="text-center py-lg" style="grid-column: 1/-1;">No se encontraron coches con estos filtros.</div>';
    } else {
        grid.innerHTML = filtered.map(car => createCarCardHTML(car)).join('');
        lucide.createIcons();
    }

    if (countDisplay) {
        countDisplay.textContent = `Mostrando ${filtered.length} coches`;
    }
}
