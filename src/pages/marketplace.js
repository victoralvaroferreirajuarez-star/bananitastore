// ========================================
// Marketplace Page
// ========================================

import { getListings } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import { PETS_CATALOG, getRarityClass } from '../data/pets.js';
import { formatPrice, showToast } from '../utils/helpers.js';
import { toggleFavorite, getFavorites, getUserById } from '../utils/storage.js';
import { openPetPicker, renderSelectedPetSummary } from '../components/petPicker.js';

let selectedMarketPetId = null;

export function renderPetCard(listing) {
  const pet = PETS_CATALOG.find(p => p.id === listing.petId);
  const petImg = pet && pet.image ? pet.image : '';
  const badges = [];
  if (listing.isFly) badges.push('<span class="badge badge-fly">F</span>');
  if (listing.isRide) badges.push('<span class="badge badge-ride">R</span>');
  if (listing.isNeon) badges.push('<span class="badge badge-neon">Neon</span>');
  if (listing.isMega) badges.push('<span class="badge badge-mega">Mega</span>');

  const seller = getUserById(listing.sellerId);
  const rarityClass = pet ? getRarityClass(pet.rarity) : 'badge-common';

  return `
    <div class="pet-card" onclick="window.location.hash='/pet/${listing.id}'">
      <div class="pet-card-image">
        <div class="pet-card-badges">
          ${badges.join('')}
        </div>
        ${petImg ? `<img src="${petImg}" alt="${listing.petName}" onerror="this.style.display='none'">` : ''}
      </div>
      <div class="pet-card-body">
        <div class="pet-card-name">${listing.petName}</div>
        <div class="pet-card-type">
          <span class="badge ${rarityClass}" style="font-size:0.65rem">${pet ? pet.rarity : listing.rarity}</span>
          ${listing.age ? `<span class="text-xs text-muted" style="margin-left:4px">${listing.age}</span>` : ''}
        </div>
        <div class="pet-card-footer">
          <span class="pet-card-price">${formatPrice(listing.price, listing.currency || 'USD')}</span>
          <span class="pet-card-seller">${seller ? seller.username : 'Vendedor'} · x${listing.quantity || 1}</span>
        </div>
      </div>
    </div>
  `;
}

export function renderMarketplace() {
  const allListings = getListings().filter(l => l.status === 'active');

  return `
    <div class="container page-content animate-fade-up">
      <div class="flex-between mb-24">
        <div>
          <div class="section-header-glow" style="background:var(--pastel-blue);color:var(--pastel-blue-text)">
            <i class="ri ri-store-2-line"></i> Tienda
          </div>
          <h1 style="font-size:1.8rem">Marketplace</h1>
          <p class="text-muted text-sm">${allListings.length} pets disponibles</p>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="search-bar mb-16" id="market-search-bar">
        <i class="ri ri-search-line"></i>
        <input type="text" placeholder="Buscar pets por nombre, tipo..." id="market-search" autocomplete="off">
        <button class="btn btn-primary btn-sm" style="border-radius:10px"><i class="ri ri-search-line"></i> Buscar</button>
      </div>

      <div class="card card-flat mb-24">
        <div class="card-body">
          <div class="flex-between gap-12 flex-wrap">
            <div id="market-selected-pet" style="flex:1">
              ${renderSelectedPetSummary(null, 'Filtro por pet: todos los pets')}
            </div>
            <div class="flex gap-8 flex-wrap">
              <button class="btn btn-secondary" id="market-pet-picker-btn">
                Elegir pet
              </button>
              <button class="btn btn-ghost" id="market-pet-clear-btn">
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-pills mb-24" id="rarity-filters">
        <button class="filter-pill active" data-rarity="all">Todos</button>
        <button class="filter-pill rarity-legendary" data-rarity="Legendary">Legendary</button>
        <button class="filter-pill rarity-ultra-rare" data-rarity="Ultra Rare">Ultra Rare</button>
        <button class="filter-pill rarity-rare" data-rarity="Rare">Rare</button>
        <button class="filter-pill rarity-uncommon" data-rarity="Uncommon">Uncommon</button>
        <button class="filter-pill rarity-common" data-rarity="Common">Common</button>
      </div>

      <div class="filter-pills mb-24" id="type-filters">
        <button class="filter-pill active" data-type="all">Todos</button>
        <button class="filter-pill type-fly" data-type="fly">Fly</button>
        <button class="filter-pill type-ride" data-type="ride">Ride</button>
        <button class="filter-pill type-neon" data-type="neon">Neon</button>
        <button class="filter-pill" data-type="mega">Mega Neon</button>
      </div>

      <!-- Results -->
      <div class="grid-4" id="market-results">
        ${allListings.length > 0 ? allListings.map(l => renderPetCard(l)).join('') : `
          <div class="empty-state" style="grid-column:1/-1">
            <h3>No hay pets en venta aún</h3>
            <p>Sé el primero en listar una pet. ¡Regístrate como vendedor!</p>
            <button class="btn btn-primary mt-16" onclick="window.location.hash='/register'">Registrarse</button>
          </div>
        `}
      </div>
    </div>
  `;
}

export function initMarketplace() {
  const searchInput = document.getElementById('market-search');
  const rarityFilters = document.getElementById('rarity-filters');
  const typeFilters = document.getElementById('type-filters');
  const results = document.getElementById('market-results');

  if (!searchInput || !results) return;

  let currentRarity = 'all';
  let currentType = 'all';
  let searchQuery = '';

  function refreshSelectedPetSummary() {
    const summary = document.getElementById('market-selected-pet');
    if (!summary) return;
    const selectedPet = PETS_CATALOG.find((pet) => pet.id === selectedMarketPetId) || null;
    summary.innerHTML = renderSelectedPetSummary(selectedPet, 'Filtro por pet: todos los pets');
  }

  function filterAndRender() {
    let listings = getListings().filter(l => l.status === 'active');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      listings = listings.filter(l => 
        l.petName.toLowerCase().includes(q) ||
        (l.rarity && l.rarity.toLowerCase().includes(q))
      );
    }

    if (currentRarity !== 'all') {
      listings = listings.filter(l => l.rarity === currentRarity);
    }

    if (selectedMarketPetId) {
      listings = listings.filter((l) => l.petId === selectedMarketPetId);
    }

    if (currentType !== 'all') {
      if (currentType === 'fly') listings = listings.filter(l => l.isFly);
      if (currentType === 'ride') listings = listings.filter(l => l.isRide);
      if (currentType === 'neon') listings = listings.filter(l => l.isNeon);
      if (currentType === 'mega') listings = listings.filter(l => l.isMega);
    }

    if (listings.length === 0) {
      results.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <h3>No se encontraron resultados</h3>
          <p>Intenta con otros filtros o términos de búsqueda</p>
        </div>
      `;
    } else {
      results.innerHTML = listings.map(l => renderPetCard(l)).join('');
    }
  }

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    filterAndRender();
  });

  document.getElementById('market-pet-picker-btn')?.addEventListener('click', () => {
    openPetPicker({
      title: 'Buscar pet para comprar',
      selectedPetId: selectedMarketPetId,
      onSelect: (pet) => {
        selectedMarketPetId = pet.id;
        refreshSelectedPetSummary();
        filterAndRender();
      }
    });
  });

  document.getElementById('market-pet-clear-btn')?.addEventListener('click', () => {
    selectedMarketPetId = null;
    refreshSelectedPetSummary();
    filterAndRender();
  });

  rarityFilters.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    rarityFilters.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentRarity = pill.dataset.rarity;
    filterAndRender();
  });

  typeFilters.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    typeFilters.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentType = pill.dataset.type;
    filterAndRender();
  });

  refreshSelectedPetSummary();
}
