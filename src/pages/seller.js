// ========================================
// Seller Panel Page
// ========================================

import { getCurrentUser, verifySellerPin, isSeller, isAdmin } from '../utils/auth.js';
import { getListings, addListing, removeListing, updateListing, getOrders, updateOrder, getUserById } from '../utils/storage.js';
import { PETS_CATALOG, PET_AGES, getRarityClass } from '../data/pets.js';
import { showToast, formatPrice, formatDate, generateId, showModal, closeModal } from '../utils/helpers.js';
import { navigate } from '../utils/router.js';
import { openPetPicker } from '../components/petPicker.js';

let pinVerified = false;
const PRICE_CURRENCIES = ['USD', 'EUR', 'GBP', 'MXN'];

export function renderSellerPanel() {
  const user = getCurrentUser();
  if (!user) { navigate('/login'); return ''; }
  if (!isSeller() && !isAdmin()) { navigate('/profile'); return ''; }

  if (!pinVerified && !isAdmin() && user.sellerPin) {
    return renderPinScreen();
  }

  const myListings = getListings().filter(l => l.sellerId === user.id);
  const activeListings = myListings.filter(l => l.status === 'active');
  const myOrders = getOrders().filter(o => o.sellerId === user.id);
  const pendingOrders = myOrders.filter(o => o.status === 'payment_sent');
  const totalSales = myOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.amount, 0);

  return `
    <div class="container page-content animate-fade-up">
      <div class="flex-between mb-24">
        <div>
          <h1 style="font-size:1.8rem">Panel de Vendedor</h1>
          <p class="text-sm text-muted">Gestiona tu inventario y pedidos</p>
        </div>
        <button class="btn btn-primary" id="add-pet-btn">
          Añadir Pet
        </button>
      </div>

      <!-- Stats -->
      <div class="grid-4 mb-32">
        <div class="stat-card">
          <div class="stat-icon yellow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 18C13.6569 18 15 16.6569 15 15C15 13.3431 13.6569 12 12 12C10.3431 12 9 13.3431 9 15C9 16.6569 10.3431 18 12 18Z" fill="currentColor"/>
              <path d="M7 11C8.10457 11 9 10.1046 9 9C9 7.89543 8.10457 7 7 7C5.89543 7 5 7.89543 5 9C5 10.1046 5.89543 11 7 11Z" fill="currentColor"/>
              <path d="M17 11C18.1046 11 19 10.1046 19 9C19 7.89543 18.1046 7 17 7C15.8954 7 15 7.89543 15 9C15 10.1046 15.8954 11 17 11Z" fill="currentColor"/>
              <path d="M7 4C7.55228 4 8 3.55228 8 3C8 2.44772 7.55228 2 7 2C6.44772 2 6 2.44772 6 3C6 3.55228 6.44772 4 7 4Z" fill="currentColor"/>
              <path d="M17 4C17.5523 4 18 3.55228 18 3C18 2.44772 17.5523 2 17 2C16.4477 2 16 2.44772 16 3C16 3.55228 16.4477 4 17 4Z" fill="currentColor"/>
            </svg>
          </div>
          <div><div class="stat-value">${activeListings.length}</div><div class="stat-label">Pets en venta</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><i class="ri ri-wallet-3-line"></i></div>
          <div><div class="stat-value">${pendingOrders.length}</div><div class="stat-label">Pagos pendientes</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="ri ri-check-double-line"></i></div>
          <div><div class="stat-value">${myOrders.filter(o => o.status === 'completed').length}</div><div class="stat-label">Ventas completadas</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="ri ri-money-dollar-circle-line"></i></div>
          <div><div class="stat-value">${formatPrice(totalSales, user.preferredCurrency || 'USD')}</div><div class="stat-label">Ingresos totales</div></div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="seller-tabs">
        <button class="tab active" data-tab="stock">Stock</button>
        <button class="tab" data-tab="orders">Pedidos ${pendingOrders.length > 0 ? `<span class="badge badge-warning" style="margin-left:4px">${pendingOrders.length}</span>` : ''}</button>
        <button class="tab" data-tab="history">Historial</button>
      </div>

      <!-- Stock Tab -->
      <div id="seller-tab-stock">
        ${activeListings.length > 0 ? `
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Tipo</th>
                  <th>Rareza</th>
                  <th>Edad</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${myListings.map(l => {
                  const pet = PETS_CATALOG.find(p => p.id === l.petId);
                  const badges = [];
                  if (l.isFly) badges.push('F');
                  if (l.isRide) badges.push('R');
                  if (l.isNeon) badges.push('N');
                  if (l.isMega) badges.push('M');
                  return `
                    <tr>
                      <td style="display:flex;align-items:center;gap:8px">${pet && pet.image ? `<img src="${pet.image}" style="width:32px;height:32px;object-fit:contain" onerror="this.outerHTML=''">` : ''} ${l.petName}</td>
                      <td>${badges.join('/') || '—'}</td>
                      <td><span class="badge ${getRarityClass(l.rarity)}">${l.rarity}</span></td>
                      <td>${l.age || '—'}</td>
                      <td>x${l.quantity || 1}</td>
                      <td class="font-bold">${formatPrice(l.price, l.currency || 'USD')}</td>
                      <td>
                        <span class="status status-${l.status === 'active' ? 'active' : 'inactive'}">
                          <span class="status-dot"></span>
                          ${l.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-ghost btn-sm remove-listing-btn" data-id="${l.id}">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <h3>No tienes pets en venta</h3>
            <p>Añade tu primera pet al marketplace</p>
          </div>
        `}
      </div>

      <!-- Orders Tab -->
      <div id="seller-tab-orders" style="display:none">
        ${myOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 ? `
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr><th>Pedido</th><th>Pet</th><th>Comprador</th><th>Monto</th><th>Método</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                ${myOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map(o => {
                  const buyer = getUserById(o.buyerId);
                  const messages = o.messages || [];
                  return `
                    <tr>
                      <td class="text-sm text-muted">#${o.id.slice(-6)}</td>
                      <td>${o.petName}</td>
                      <td>${buyer?.username || 'Anónimo'}</td>
                      <td class="font-bold">${formatPrice(o.amount, o.currency || 'USD')}</td>
                      <td>${o.paymentMethod === 'paypal' ? '<i class="ri ri-paypal-line"></i> PayPal' : '<i class="ri ri-scan-line"></i> QR'}</td>
                      <td>
                        <span class="badge ${o.status === 'payment_sent' ? 'badge-warning' : o.status === 'pending_payment' ? 'badge-info' : 'badge-success'}">
                          ${o.status === 'payment_sent' ? 'Verificar pago' : o.status === 'pending_payment' ? 'Esperando pago' : o.status}
                        </span>
                      </td>
                      <td>
                        ${o.status === 'payment_sent' ? `
                          <button class="btn btn-success btn-sm confirm-payment-btn" data-id="${o.id}">
                            Confirmar
                          </button>
                        ` : '—'}
                      </td>
                    </tr>
                    <tr class="order-chat-row">
                      <td colspan="7" style="padding:12px 16px;background:var(--bg-secondary);border-bottom:1px solid var(--border-light)">
                        ${o.paymentProof ? `<div class="mb-12"><strong>Comprobante:</strong> <a href="${o.paymentProof}" target="_blank">Ver imagen</a></div>` : ''}
                        ${messages.length > 0 ? `
                          <div class="mb-12" style="display:grid;gap:8px">
                            ${messages.map(msg => `
                              <div style="padding:10px;border-radius:10px;background:${msg.sender === 'buyer' ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)'};">
                                <div style="font-size:0.8rem;font-weight:700;color:var(--text-secondary);margin-bottom:4px">${msg.sender === 'buyer' ? 'Comprador' : 'Vendedor'}</div>
                                <div style="font-size:0.9rem;line-height:1.4">${msg.text}</div>
                              </div>
                            `).join('')}
                          </div>
                        ` : ''}
                        <div class="form-row" style="gap:12px;flex-wrap:wrap">
                          <input type="text" class="form-input" id="seller-order-msg-${o.id}" placeholder="Escribe una respuesta..." style="flex:1;min-width:220px">
                          <button class="btn btn-secondary btn-sm seller-send-order-msg-btn" data-id="${o.id}">Responder</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <h3>No hay pedidos pendientes</h3>
            <p>Los pedidos nuevos aparecerán aquí</p>
          </div>
        `}
      </div>

      <!-- History Tab -->
      <div id="seller-tab-history" style="display:none">
        ${myOrders.filter(o => o.status === 'completed').length > 0 ? `
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr><th>Pedido</th><th>Pet</th><th>Comprador</th><th>Monto</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                ${myOrders.filter(o => o.status === 'completed').map(o => {
                  const buyer = getUserById(o.buyerId);
                  return `
                    <tr>
                      <td class="text-sm text-muted">#${o.id.slice(-6)}</td>
                      <td>${o.petName}</td>
                      <td>${buyer?.username || 'Anónimo'}</td>
                      <td class="font-bold">${formatPrice(o.amount, o.currency || 'USD')}</td>
                      <td class="text-sm text-muted">${formatDate(o.completedAt || o.createdAt)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-state">
            <h3>Sin historial aún</h3>
            <p>Tus ventas completadas aparecerán aquí</p>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderPinScreen() {
  return `
    <div class="pin-container animate-fade-up">
      <div style="text-align:center">
        <img src="/logo.png" alt="BananitaShop" style="height:56px;margin:0 auto 16px">
        <h2>Panel de Vendedor</h2>
        <p class="text-muted text-sm mb-8">Introduce tu PIN de 6 dígitos para acceder</p>
      </div>
      <form id="pin-form">
        <div class="pin-inputs" id="pin-inputs">
          <input type="tel" class="pin-input" maxlength="1" data-index="0" inputmode="numeric" pattern="[0-9]"> 
          <input type="tel" class="pin-input" maxlength="1" data-index="1" inputmode="numeric" pattern="[0-9]">
          <input type="tel" class="pin-input" maxlength="1" data-index="2" inputmode="numeric" pattern="[0-9]">
          <input type="tel" class="pin-input" maxlength="1" data-index="3" inputmode="numeric" pattern="[0-9]">
          <input type="tel" class="pin-input" maxlength="1" data-index="4" inputmode="numeric" pattern="[0-9]">
          <input type="tel" class="pin-input" maxlength="1" data-index="5" inputmode="numeric" pattern="[0-9]">
        </div>
        <p class="text-sm text-muted" id="pin-error" style="color:var(--pastel-red-text);display:none">PIN incorrecto</p>
        <button type="submit" class="btn btn-primary btn-block mt-16">Confirmar PIN</button>
      </form>
    </div>
  `;
}

function renderAddPetModal() {
  const selectedPet = window.marketplaceSelectedPet;
  if (!selectedPet) {
    return `
      <div class="empty-state">
        <h3>Selecciona un pet primero</h3>
        <p>Usa el catálogo para elegir el pet que quieres publicar.</p>
      </div>
    `;
  }

  return `
    <form id="add-pet-form" onsubmit="return false">
      <div style="display:flex;gap:16px;margin-bottom:24px;padding:16px;background:#f8f9fa;border-radius:8px">
        <div>
          ${selectedPet.image ? `<img src="${selectedPet.image}" style="width:80px;height:80px;object-fit:contain;border-radius:8px;background:white;padding:8px"/>` : `<div style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:white;border-radius:8px;font-size:2rem;color:#94a3b8"></div>`}
        </div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:1.1rem;color:#2c3e50">${selectedPet.name}</div>
          <div style="color:#7f8c8d;font-size:0.9rem;margin:4px 0">
            <span class="badge ${getRarityClass(selectedPet.rarity)}" style="display:inline-block">${selectedPet.rarity}</span>
          </div>
          <div style="color:#95a5a6;font-size:0.85rem;margin-top:8px">
            <strong>Categoría:</strong> ${selectedPet.category}
          </div>
        </div>
        <button type="button" class="btn btn-ghost" id="back-to-pets-btn" style="align-self:flex-start">
          Cambiar
        </button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Edad</label>
          <select class="form-select" id="pet-age">
            ${PET_AGES.map(a => `<option value="${a}">${a}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Precio</label>
          <input type="number" class="form-input" id="pet-price" min="0.01" step="0.01" placeholder="0.00" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Moneda</label>
          <select class="form-select" id="pet-currency">
            ${PRICE_CURRENCIES.map(currency => `<option value="${currency}" ${currency === (getCurrentUser()?.preferredCurrency || 'USD') ? 'selected' : ''}>${currency}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cantidad disponible</label>
          <input type="number" class="form-input" id="pet-quantity" min="1" step="1" value="1" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Características</label>
        <div class="flex gap-16" style="flex-wrap:wrap">
          <label class="checkbox-group"><input type="checkbox" class="checkbox-input" id="pet-fly"> <span>Fly</span></label>
          <label class="checkbox-group"><input type="checkbox" class="checkbox-input" id="pet-ride"> <span>Ride</span></label>
          <label class="checkbox-group"><input type="checkbox" class="checkbox-input" id="pet-neon"> <span>Neon</span></label>
          <label class="checkbox-group"><input type="checkbox" class="checkbox-input" id="pet-mega"> <span>Mega Neon</span></label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Descripción (opcional)</label>
        <textarea class="form-textarea" id="pet-desc" placeholder="Información adicional..."></textarea>
      </div>

      <button type="submit" class="btn btn-primary btn-block">
        Publicar en Marketplace
      </button>
    </form>
  `;
}

export function initSellerPanel() {
  const user = getCurrentUser();
  if (!user) return;

  // PIN logic
  if (!pinVerified && !isAdmin() && user.sellerPin) {
    const pinInputs = document.querySelectorAll('.pin-input');
    const pinForm = document.getElementById('pin-form');
    if (pinInputs.length === 0) return;

    const verifyPin = () => {
      const fullPin = Array.from(pinInputs).map(inp => inp.value.trim()).join('');
      if (fullPin.length !== 6) {
        const error = document.getElementById('pin-error');
        error.textContent = 'Completa los 6 dígitos';
        error.style.display = '';
        return;
      }
      if (verifySellerPin(fullPin)) {
        pinVerified = true;
        navigate('/seller');
      } else {
        const error = document.getElementById('pin-error');
        error.textContent = 'PIN incorrecto';
        error.style.display = '';
        pinInputs.forEach(inp => { inp.value = ''; inp.style.borderColor = 'var(--pastel-red-text)'; });
        pinInputs[0].focus();
        setTimeout(() => { pinInputs.forEach(inp => inp.style.borderColor = ''); }, 1500);
      }
    };

    pinInputs.forEach((input, i) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val;
        if (val && i < 5) pinInputs[i + 1].focus();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && i > 0) pinInputs[i - 1].focus();
      });
    });

    if (pinForm) {
      pinForm.onsubmit = (e) => {
        e.preventDefault();
        verifyPin();
      };
    }

    pinInputs[0].focus();
    return;
  }

  // Tab switching
  const tabs = document.getElementById('seller-tabs');
  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('[id^="seller-tab-"]').forEach(el => el.style.display = 'none');
      document.getElementById('seller-tab-' + tab.dataset.tab).style.display = '';
    });
  }

  // Add pet
  const addBtn = document.getElementById('add-pet-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      window.marketplaceSelectedPet = null;
      openPetPicker({
        title: 'Selecciona el pet que quieres vender',
        onSelect: (pet) => {
          window.marketplaceSelectedPet = pet;
          showModal('Agregar Pet al Marketplace', renderAddPetModal());
          initPetFormSubmit();
        }
      });
    };
  }

  // Remove listing
  document.querySelectorAll('.remove-listing-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      removeListing(id);
      showToast('Pet eliminada del marketplace', 'info');
      navigate('/seller');
    };
  });

  // Confirm payment
  document.querySelectorAll('.confirm-payment-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      updateOrder(id, { status: 'completed', completedAt: new Date().toISOString() });
      showToast('Pago confirmado. Venta completada', 'success');
      navigate('/seller');
    };
  });

  // Seller message reply
  document.querySelectorAll('.seller-send-order-msg-btn').forEach(btn => {
    btn.onclick = () => {
      const orderId = btn.dataset.id;
      const input = document.getElementById(`seller-order-msg-${orderId}`);
      const text = input?.value.trim();
      if (!text) return;
      const order = getOrders().find(o => o.id === orderId);
      if (!order) return;
      const messages = order.messages || [];
      messages.push({ sender: 'seller', text, createdAt: new Date().toISOString() });
      updateOrder(orderId, { messages });
      input.value = '';
      showToast('Respuesta enviada al comprador', 'success');
      navigate('/seller');
    };
  });
}

function initPetFormSubmit() {
  const form = document.getElementById('add-pet-form');
  if (!form) return;

  const user = getCurrentUser();
  const pet = window.marketplaceSelectedPet;
  const backBtn = document.getElementById('back-to-pets-btn');

  backBtn?.addEventListener('click', () => {
    closeModal();
    openPetPicker({
      title: 'Selecciona el pet que quieres vender',
      selectedPetId: pet?.id || null,
      onSelect: (nextPet) => {
        window.marketplaceSelectedPet = nextPet;
        showModal('Agregar Pet al Marketplace', renderAddPetModal());
        initPetFormSubmit();
      }
    });
  });

  form.onsubmit = (e) => {
    e.preventDefault();
    const price = parseFloat(document.getElementById('pet-price').value);
    if (!price || price <= 0) { showToast('Introduce un precio válido', 'warning'); return; }
    const quantity = parseInt(document.getElementById('pet-quantity').value, 10);
    if (!quantity || quantity <= 0) { showToast('Introduce una cantidad válida', 'warning'); return; }

    const listing = {
      id: 'lst_' + generateId(),
      sellerId: user.id,
      petId: pet.id,
      petName: pet.name,
      rarity: pet.rarity,
      age: document.getElementById('pet-age').value,
      currency: document.getElementById('pet-currency').value,
      quantity,
      price,
      isFly: document.getElementById('pet-fly').checked,
      isRide: document.getElementById('pet-ride').checked,
      isNeon: document.getElementById('pet-neon').checked,
      isMega: document.getElementById('pet-mega').checked,
      description: document.getElementById('pet-desc').value.trim(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    addListing(listing);
    user.preferredCurrency = listing.currency;
    closeModal();
    showToast('Pet publicada exitosamente', 'success');
    navigate('/seller');
  };
}
