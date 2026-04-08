import {
  PETS_CATALOG,
  analyzeTradeOffer,
  calculateDemandScore,
  calculatePetValue,
  explainPetValuation,
  getRarityClass
} from '../data/pets.js';
import { openPetPicker } from '../components/petPicker.js';
import { showToast } from '../utils/helpers.js';

let yourPets = [];
let theirPets = [];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderCatalogGrid(pets) {
  return pets.map((pet) => `
    <button type="button" class="catalog-item" data-pet-id="${pet.id}">
      <div class="catalog-item-emoji">
        <img src="${pet.image}" alt="${escapeHtml(pet.name)}" style="width:56px;height:56px;object-fit:contain">
      </div>
      <div class="catalog-item-name">${escapeHtml(pet.name)}</div>
      <div class="catalog-item-rarity">
        <span class="badge ${getRarityClass(pet.rarity)}" style="font-size:0.6rem">${escapeHtml(pet.rarity)}</span>
      </div>
    </button>
  `).join('');
}

function renderPetChip(entry, index, side) {
  const pet = PETS_CATALOG.find((item) => item.id === entry.id);
  const flags = [];
  if (entry.isFly) flags.push('F');
  if (entry.isRide) flags.push('R');
  if (entry.isNeon) flags.push('N');
  if (entry.isMega) flags.push('M');

  return `
    <div class="calc-pet-item">
      <img src="${pet?.image || ''}" alt="${escapeHtml(entry.name)}" style="width:28px;height:28px;object-fit:contain">
      <span style="font-weight:700">${escapeHtml(entry.name)}</span>
      ${flags.length ? `<span class="text-xs text-muted">${flags.join('/')}</span>` : ''}
      <button class="remove-pet" data-side="${side}" data-index="${index}" type="button">x</button>
    </div>
  `;
}

function renderValueBreakdown(entries, title) {
  if (!entries.length) {
    return `
      <div class="card card-flat">
        <div class="card-body">
          <div class="text-sm font-bold mb-8">${title}</div>
          <div class="text-sm text-muted">No hay pets en este lado todavia.</div>
        </div>
      </div>
    `;
  }

  const items = entries.map((entry) => {
    const explanation = explainPetValuation(entry.id, entry.isFly, entry.isRide, entry.isNeon, entry.isMega);
    if (!explanation) return '';

    return `
      <div style="border:1px solid var(--border-light);border-radius:12px;padding:14px;margin-top:10px;text-align:left">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <img src="${explanation.pet.image}" alt="${escapeHtml(explanation.pet.name)}" style="width:34px;height:34px;object-fit:contain">
          <div>
            <div class="font-bold">${escapeHtml(explanation.pet.name)}</div>
            <div class="text-xs text-muted">${escapeHtml(explanation.pet.rarity)} | Demanda ${escapeHtml(explanation.demandTier)}</div>
          </div>
        </div>
        <div class="text-sm" style="margin-bottom:6px">
          Valor final: <strong>${explanation.finalValue}</strong> | Demanda final: <strong>${explanation.finalDemand}</strong>
        </div>
        <div class="text-xs text-muted" style="line-height:1.6">
          ${explanation.reasons.map((reason) => `<div>${escapeHtml(reason)}</div>`).join('')}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="card card-flat">
      <div class="card-body">
        <div class="text-sm font-bold mb-8">${title}</div>
        <div class="text-xs text-muted">El valor sale de rareza, demanda, disponibilidad, categoria y modificadores.</div>
        ${items}
      </div>
    </div>
  `;
}

function openModifierModal(side, pet) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Anadir ${escapeHtml(pet.name)}</h3>
        <button class="modal-close" type="button" id="close-add-pet-modal">
          ×
        </button>
      </div>
      <div class="modal-body">
        <div style="text-align:center">
          <img src="${pet.image}" alt="${escapeHtml(pet.name)}" style="width:88px;height:88px;object-fit:contain;margin:0 auto 12px">
          <div style="font-weight:700;font-size:1.1rem">${escapeHtml(pet.name)}</div>
          <div class="mt-8">
            <span class="badge ${getRarityClass(pet.rarity)}">${escapeHtml(pet.rarity)}</span>
          </div>
        </div>
        <div class="flex gap-12 mt-24" style="justify-content:center;flex-wrap:wrap">
          <label class="checkbox-group"><input type="checkbox" class="checkbox-input" id="mod-fly"> <span>Fly</span></label>
          <label class="checkbox-group"><input type="checkbox" class="checkbox-input" id="mod-ride"> <span>Ride</span></label>
          <label class="checkbox-group"><input type="checkbox" class="checkbox-input" id="mod-neon"> <span>Neon</span></label>
          <label class="checkbox-group"><input type="checkbox" class="checkbox-input" id="mod-mega"> <span>Mega</span></label>
        </div>
        <button class="btn btn-primary btn-block mt-24" id="confirm-add-pet" type="button">Anadir al trade</button>
      </div>
    </div>
  `;
  overlay.classList.add('show');
  overlay.onclick = (event) => {
    if (event.target === overlay) overlay.classList.remove('show');
  };

  document.getElementById('close-add-pet-modal')?.addEventListener('click', () => {
    overlay.classList.remove('show');
  });

  document.getElementById('confirm-add-pet')?.addEventListener('click', () => {
    const entry = {
      id: pet.id,
      name: pet.name,
      isFly: document.getElementById('mod-fly')?.checked || false,
      isRide: document.getElementById('mod-ride')?.checked || false,
      isNeon: document.getElementById('mod-neon')?.checked || false,
      isMega: document.getElementById('mod-mega')?.checked || false
    };

    if (side === 'your') {
      yourPets.push(entry);
    } else {
      theirPets.push(entry);
    }

    overlay.classList.remove('show');
    updateCalcUI();
  });
}

function bindAutocomplete(inputId, dropdownId, side) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    const matches = PETS_CATALOG
      .filter((pet) => pet.name.toLowerCase().includes(query))
      .slice(0, 8);

    if (!matches.length) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    dropdown.innerHTML = matches.map((pet) => `
      <button type="button" class="calc-dropdown-item" data-pet-id="${pet.id}">
        <span style="display:flex;align-items:center;gap:8px">
          <img src="${pet.image}" alt="${escapeHtml(pet.name)}" style="width:24px;height:24px;object-fit:contain">
          ${escapeHtml(pet.name)}
        </span>
        <span class="badge ${getRarityClass(pet.rarity)}" style="font-size:0.6rem">${escapeHtml(pet.rarity)}</span>
      </button>
    `).join('');
    dropdown.style.display = 'block';
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      dropdown.style.display = 'none';
    }, 160);
  });

  dropdown.addEventListener('click', (event) => {
    const item = event.target.closest('[data-pet-id]');
    if (!item) return;
    const pet = PETS_CATALOG.find((entry) => entry.id === item.dataset.petId);
    if (!pet) return;
    input.value = '';
    dropdown.innerHTML = '';
    dropdown.style.display = 'none';
    openModifierModal(side, pet);
  });
}

function updateCalcUI() {
  const yourList = document.getElementById('your-pets-list');
  const theirList = document.getElementById('their-pets-list');
  const yourBreakdown = document.getElementById('calc-your-breakdown');
  const theirBreakdown = document.getElementById('calc-their-breakdown');
  if (!yourList || !theirList) return;

  yourList.innerHTML = yourPets.length
    ? yourPets.map((pet, index) => renderPetChip(pet, index, 'your')).join('')
    : '<div class="empty-state" style="padding:20px;width:100%"><p class="text-sm text-muted">Anade pets a tu lado</p></div>';

  theirList.innerHTML = theirPets.length
    ? theirPets.map((pet, index) => renderPetChip(pet, index, 'their')).join('')
    : '<div class="empty-state" style="padding:20px;width:100%"><p class="text-sm text-muted">Anade pets al otro lado</p></div>';

  const yourTotal = yourPets.reduce(
    (sum, pet) => sum + calculatePetValue(pet.id, pet.isFly, pet.isRide, pet.isNeon, pet.isMega),
    0
  );
  const theirTotal = theirPets.reduce(
    (sum, pet) => sum + calculatePetValue(pet.id, pet.isFly, pet.isRide, pet.isNeon, pet.isMega),
    0
  );
  const yourDemand = yourPets.reduce(
    (sum, pet) => sum + calculateDemandScore(pet.id, pet.isFly, pet.isRide, pet.isNeon, pet.isMega),
    0
  );
  const theirDemand = theirPets.reduce(
    (sum, pet) => sum + calculateDemandScore(pet.id, pet.isFly, pet.isRide, pet.isNeon, pet.isMega),
    0
  );
  const maxValue = Math.max(yourTotal, theirTotal, 1);

  document.getElementById('your-total-value').textContent = `Valor total: ${yourTotal}`;
  document.getElementById('their-total-value').textContent = `Valor total: ${theirTotal}`;
  document.getElementById('your-demand-value').textContent = `Demanda total: ${yourDemand}`;
  document.getElementById('their-demand-value').textContent = `Demanda total: ${theirDemand}`;
  document.getElementById('your-value-bar').style.width = `${(yourTotal / maxValue) * 100}%`;
  document.getElementById('their-value-bar').style.width = `${(theirTotal / maxValue) * 100}%`;

  if (yourBreakdown) {
    yourBreakdown.innerHTML = renderValueBreakdown(yourPets, 'Como se valora tu lado');
  }
  if (theirBreakdown) {
    theirBreakdown.innerHTML = renderValueBreakdown(theirPets, 'Como se valora el otro lado');
  }

  const result = document.getElementById('calc-result');
  if (!result) return;

  if (!yourPets.length || !theirPets.length) {
    result.style.display = 'none';
  } else {
    const analysis = analyzeTradeOffer(yourPets, theirPets);
    result.style.display = '';

    const label = document.getElementById('calc-result-label');
    const desc = document.getElementById('calc-result-desc');
    const recommendation = document.getElementById('calc-ai-recommendation');

    if (analysis.outcome === 'win') {
      label.textContent = 'GANAS';
      label.className = 'calc-result-label win';
      desc.textContent = 'Tu oferta sale beneficiada.';
    } else if (analysis.outcome === 'lose') {
      label.textContent = 'PIERDES';
      label.className = 'calc-result-label lose';
      desc.textContent = 'La otra oferta se lleva mas valor y mejor demanda.';
    } else {
      label.textContent = 'EMPATE';
      label.className = 'calc-result-label fair';
      desc.textContent = 'Los dos lados estan bastante equilibrados.';
    }

    recommendation.textContent = `${analysis.recommendation}${analysis.drivers?.length ? ` ${analysis.drivers.join(' ')}` : ''}`;
    document.getElementById('result-your-val').textContent = analysis.yourValue;
    document.getElementById('result-their-val').textContent = analysis.theirValue;
    document.getElementById('result-diff').textContent = `${analysis.valueDiff > 0 ? '+' : ''}${analysis.valueDiff}`;
    document.getElementById('result-demand-diff').textContent = `${analysis.demandDiff > 0 ? '+' : ''}${analysis.demandDiff}`;
  }

  document.querySelectorAll('.remove-pet').forEach((button) => {
    button.onclick = () => {
      const side = button.dataset.side;
      const index = Number(button.dataset.index);
      if (side === 'your') yourPets.splice(index, 1);
      if (side === 'their') theirPets.splice(index, 1);
      updateCalcUI();
    };
  });
}

export function renderCalculator() {
  return `
    <div class="container page-content animate-fade-up">
      <div class="text-center mb-32">
        <h1 style="font-size:2rem">Calculadora de Trades</h1>
        <p class="text-muted" style="max-width:680px;margin:8px auto 0">
          Compara ambos lados del trade con valor, demanda y explicacion de por que cada pet pesa lo que pesa.
        </p>
      </div>

      <div class="calc-container">
        <div class="calc-side">
          <div class="calc-side-title">Tu oferta</div>
          <div class="calc-pets-list" id="your-pets-list"></div>
          <div style="position:relative">
            <input type="text" class="form-input" placeholder="Buscar pet para anadir..." id="your-search" autocomplete="off">
            <div class="calc-dropdown" id="your-dropdown"></div>
          </div>
          <button class="btn btn-secondary btn-block mt-12" id="your-picker-btn" type="button">Seleccionar del catalogo</button>
          <div class="calc-value-bar mt-12">
            <div class="calc-value-fill" id="your-value-bar" style="width:0%;background:var(--pastel-blue-text)"></div>
          </div>
          <div class="text-sm text-muted mt-4" id="your-total-value">Valor total: 0</div>
          <div class="text-xs text-muted mt-4" id="your-demand-value">Demanda total: 0</div>
        </div>

        <div class="calc-vs">VS</div>

        <div class="calc-side">
          <div class="calc-side-title">Su oferta</div>
          <div class="calc-pets-list" id="their-pets-list"></div>
          <div style="position:relative">
            <input type="text" class="form-input" placeholder="Buscar pet para anadir..." id="their-search" autocomplete="off">
            <div class="calc-dropdown" id="their-dropdown"></div>
          </div>
          <button class="btn btn-secondary btn-block mt-12" id="their-picker-btn" type="button">Seleccionar del catalogo</button>
          <div class="calc-value-bar mt-12">
            <div class="calc-value-fill" id="their-value-bar" style="width:0%;background:var(--pastel-purple-text)"></div>
          </div>
          <div class="text-sm text-muted mt-4" id="their-total-value">Valor total: 0</div>
          <div class="text-xs text-muted mt-4" id="their-demand-value">Demanda total: 0</div>
        </div>
      </div>

      <div class="calc-result" id="calc-result" style="display:none">
        <div class="calc-result-label" id="calc-result-label">EMPATE</div>
        <div class="calc-result-desc" id="calc-result-desc"></div>
        <div class="card card-flat mt-16" style="text-align:left">
          <div class="card-body">
            <div class="text-sm font-bold mb-8">Recomendacion del sistema</div>
            <div class="text-sm text-muted" id="calc-ai-recommendation"></div>
          </div>
        </div>
        <div style="display:flex;justify-content:center;gap:24px;margin-top:16px;flex-wrap:wrap">
          <div><div class="text-sm text-muted">Tu valor</div><div class="font-bold" id="result-your-val">0</div></div>
          <div><div class="text-sm text-muted">Su valor</div><div class="font-bold" id="result-their-val">0</div></div>
          <div><div class="text-sm text-muted">Diferencia</div><div class="font-bold" id="result-diff">0</div></div>
          <div><div class="text-sm text-muted">Demanda</div><div class="font-bold" id="result-demand-diff">0</div></div>
        </div>
      </div>

      <div class="grid grid-2 mt-24" style="gap:16px">
        <div id="calc-your-breakdown">
          ${renderValueBreakdown([], 'Como se valora tu lado')}
        </div>
        <div id="calc-their-breakdown">
          ${renderValueBreakdown([], 'Como se valora el otro lado')}
        </div>
      </div>

      <div class="text-center mt-24">
        <button class="btn btn-secondary" id="calc-reset" type="button">
          Reiniciar
        </button>
      </div>

      <div class="section mt-32">
        <h2 class="section-title">Catalogo de Pets</h2>
        <p class="section-subtitle">Todos los pets de Adopt Me listos para comparar.</p>

        <div class="filter-pills mb-16" id="catalog-rarity-filter">
          <button class="filter-pill active" data-rarity="all" type="button">Todos</button>
          <button class="filter-pill rarity-legendary" data-rarity="Legendary" type="button">Legendary</button>
          <button class="filter-pill rarity-ultra-rare" data-rarity="Ultra Rare" type="button">Ultra Rare</button>
          <button class="filter-pill rarity-rare" data-rarity="Rare" type="button">Rare</button>
          <button class="filter-pill rarity-uncommon" data-rarity="Uncommon" type="button">Uncommon</button>
          <button class="filter-pill rarity-common" data-rarity="Common" type="button">Common</button>
          <button class="filter-pill rarity-event" data-rarity="Event" type="button">Event</button>
        </div>

        <div class="search-bar mb-16">
          <input type="text" placeholder="Buscar en el catalogo..." id="catalog-search" autocomplete="off">
        </div>

        <div class="catalog-grid" id="catalog-grid">
          ${renderCatalogGrid(PETS_CATALOG)}
        </div>
      </div>
    </div>
  `;
}

export function initCalculator() {
  yourPets = [];
  theirPets = [];

  bindAutocomplete('your-search', 'your-dropdown', 'your');
  bindAutocomplete('their-search', 'their-dropdown', 'their');

  document.getElementById('your-picker-btn')?.addEventListener('click', () => {
    openPetPicker({
      title: 'Selecciona un pet para tu oferta',
      onSelect: (pet) => openModifierModal('your', pet)
    });
  });

  document.getElementById('their-picker-btn')?.addEventListener('click', () => {
    openPetPicker({
      title: 'Selecciona un pet para la otra oferta',
      onSelect: (pet) => openModifierModal('their', pet)
    });
  });

  document.getElementById('calc-reset')?.addEventListener('click', () => {
    yourPets = [];
    theirPets = [];
    updateCalcUI();
    showToast('Calculadora reiniciada', 'info');
  });

  const catalogFilter = document.getElementById('catalog-rarity-filter');
  const catalogSearch = document.getElementById('catalog-search');
  const catalogGrid = document.getElementById('catalog-grid');
  let currentRarity = 'all';

  function refreshCatalog() {
    let pets = PETS_CATALOG;
    const query = catalogSearch?.value.trim().toLowerCase() || '';

    if (currentRarity !== 'all') {
      pets = pets.filter((pet) => pet.rarity === currentRarity);
    }
    if (query) {
      pets = pets.filter((pet) => pet.name.toLowerCase().includes(query) || pet.category.toLowerCase().includes(query));
    }

    catalogGrid.innerHTML = pets.length
      ? renderCatalogGrid(pets)
      : '<div class="empty-state" style="grid-column:1/-1"><p>No se encontraron pets.</p></div>';
  }

  catalogFilter?.addEventListener('click', (event) => {
    const button = event.target.closest('.filter-pill');
    if (!button) return;
    catalogFilter.querySelectorAll('.filter-pill').forEach((pill) => pill.classList.remove('active'));
    button.classList.add('active');
    currentRarity = button.dataset.rarity;
    refreshCatalog();
  });

  catalogSearch?.addEventListener('input', refreshCatalog);

  catalogGrid?.addEventListener('click', (event) => {
    const item = event.target.closest('[data-pet-id]');
    if (!item) return;
    const pet = PETS_CATALOG.find((entry) => entry.id === item.dataset.petId);
    if (!pet) return;

    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Anadir desde catalogo</h3>
          <button class="modal-close" type="button" id="close-catalog-side-modal">
            ×
          </button>
        </div>
        <div class="modal-body" style="text-align:center">
          <img src="${pet.image}" alt="${escapeHtml(pet.name)}" style="width:88px;height:88px;object-fit:contain;margin:0 auto 12px">
          <div style="font-weight:700;font-size:1.1rem">${escapeHtml(pet.name)}</div>
          <div class="mt-8"><span class="badge ${getRarityClass(pet.rarity)}">${escapeHtml(pet.rarity)}</span></div>
          <div class="flex gap-12 mt-24" style="justify-content:center">
            <button class="btn btn-secondary" type="button" id="add-catalog-your">A tu oferta</button>
            <button class="btn btn-primary" type="button" id="add-catalog-their">A la otra oferta</button>
          </div>
        </div>
      </div>
    `;
    overlay.classList.add('show');

    document.getElementById('close-catalog-side-modal')?.addEventListener('click', () => {
      overlay.classList.remove('show');
    });
    document.getElementById('add-catalog-your')?.addEventListener('click', () => {
      overlay.classList.remove('show');
      openModifierModal('your', pet);
    });
    document.getElementById('add-catalog-their')?.addEventListener('click', () => {
      overlay.classList.remove('show');
      openModifierModal('their', pet);
    });
  });

  updateCalcUI();
}
