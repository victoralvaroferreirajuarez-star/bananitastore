import { PETS_CATALOG, getDemandTier, getPetById, getRarityClass } from '../data/pets.js';
import { showModal, closeModal } from '../utils/helpers.js';

function renderPetCard(pet) {
  return `
    <button type="button" class="pet-picker-card" data-pet-id="${pet.id}">
      <img src="${pet.image}" alt="${pet.name}" class="pet-picker-card-image">
      <div class="pet-picker-card-name">${pet.name}</div>
      <div class="pet-picker-card-meta">
        <span class="badge ${getRarityClass(pet.rarity)}" style="font-size:0.62rem">${pet.rarity}</span>
        <span class="text-xs text-muted">Demanda ${getDemandTier(pet.demand)}</span>
      </div>
    </button>
  `;
}

function renderResults(pets) {
  if (pets.length === 0) {
    return `
      <div class="empty-state" style="grid-column:1 / -1;padding:32px 16px">
        <h3>No encontramos ese pet</h3>
        <p>Prueba con otro nombre o cambia el filtro de rareza.</p>
      </div>
    `;
  }

  return pets.map(renderPetCard).join('');
}

export function openPetPicker({
  title = 'Seleccionar pet',
  selectedPetId = null,
  onSelect
}) {
  const rarityOptions = ['all', 'Legendary', 'Ultra Rare', 'Rare', 'Uncommon', 'Common', 'Event'];
  const stats = rarityOptions.reduce((acc, rarity) => {
    acc[rarity] = rarity === 'all'
      ? PETS_CATALOG.length
      : PETS_CATALOG.filter((pet) => pet.rarity === rarity).length;
    return acc;
  }, {});

  showModal(
    title,
    `
      <div class="pet-picker">
        <div class="search-bar mb-16">
          <input type="text" id="pet-picker-search" placeholder="Buscar por nombre...">
        </div>
        <div class="filter-pills mb-16" id="pet-picker-rarities">
          ${rarityOptions.map((rarity, index) => `
            <button type="button" class="filter-pill ${index === 0 ? 'active' : ''}" data-rarity="${rarity}">
              ${rarity === 'all' ? 'Todos' : rarity} (${stats[rarity]})
            </button>
          `).join('')}
        </div>
        <div class="pet-picker-results" id="pet-picker-results">
          ${renderResults(PETS_CATALOG.slice(0, 120))}
        </div>
      </div>
    `
  );

  const results = document.getElementById('pet-picker-results');
  const searchInput = document.getElementById('pet-picker-search');
  const rarityRoot = document.getElementById('pet-picker-rarities');

  let currentRarity = 'all';
  let currentQuery = '';

  function filterPets() {
    let pets = PETS_CATALOG;
    if (currentRarity !== 'all') {
      pets = pets.filter((pet) => pet.rarity === currentRarity);
    }
    if (currentQuery) {
      pets = pets.filter((pet) => pet.name.toLowerCase().includes(currentQuery));
    }

    if (selectedPetId) {
      const selectedPet = getPetById(selectedPetId);
      if (selectedPet && !pets.some((pet) => pet.id === selectedPetId)) {
        pets = [selectedPet, ...pets];
      }
    }

    results.innerHTML = renderResults(pets.slice(0, 180));
  }

  searchInput?.addEventListener('input', (event) => {
    currentQuery = event.target.value.trim().toLowerCase();
    filterPets();
  });

  rarityRoot?.addEventListener('click', (event) => {
    const button = event.target.closest('.filter-pill');
    if (!button) return;
    rarityRoot.querySelectorAll('.filter-pill').forEach((pill) => pill.classList.remove('active'));
    button.classList.add('active');
    currentRarity = button.dataset.rarity;
    filterPets();
  });

  results?.addEventListener('click', (event) => {
    const card = event.target.closest('.pet-picker-card');
    if (!card) return;
    const pet = getPetById(card.dataset.petId);
    if (!pet) return;
    closeModal();
    onSelect?.(pet);
  });
}

export function renderSelectedPetSummary(pet, emptyText = 'Ningún pet seleccionado') {
  if (!pet) {
    return `<div class="pet-selection-summary is-empty">${emptyText}</div>`;
  }

  return `
    <div class="pet-selection-summary">
      <img src="${pet.image}" alt="${pet.name}" class="pet-selection-summary-image">
      <div class="pet-selection-summary-copy">
        <div class="pet-selection-summary-name">${pet.name}</div>
        <div class="pet-selection-summary-meta">
          <span class="badge ${getRarityClass(pet.rarity)}" style="font-size:0.62rem">${pet.rarity}</span>
          <span class="text-xs text-muted">Demanda ${getDemandTier(pet.demand)}</span>
        </div>
      </div>
    </div>
  `;
}
