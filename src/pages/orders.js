// ========================================
// Orders / Buyer Panel Page
// ========================================

import { getCurrentUser } from '../utils/auth.js';
import { getOrders, getUserById, getListings, getFavorites, getListingById, updateOrder } from '../utils/storage.js';
import { formatPrice, formatDate, timeAgo, showToast } from '../utils/helpers.js';
import { navigate } from '../utils/router.js';
import { PETS_CATALOG, getRarityClass } from '../data/pets.js';

export function renderOrders() {
  const user = getCurrentUser();
  if (!user) { navigate('/login'); return ''; }

  const myOrders = getOrders().filter(o => o.buyerId === user.id);
  const activeOrders = myOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const completedOrders = myOrders.filter(o => o.status === 'completed');

  return `
    <div class="container page-content animate-fade-up" style="max-width:900px;margin:0 auto">
      <h1 style="font-size:1.8rem;margin-bottom:24px">Mis Pedidos 📦</h1>

      <div class="tabs" id="orders-tabs">
        <button class="tab active" data-tab="active">Activos ${activeOrders.length > 0 ? `<span class="badge badge-warning" style="margin-left:4px">${activeOrders.length}</span>` : ''}</button>
        <button class="tab" data-tab="completed">Completados</button>
      </div>

      <!-- Active Orders -->
      <div id="orders-tab-active">
        ${activeOrders.length > 0 ? activeOrders.map(o => {
          const pet = PETS_CATALOG.find(p => p.id === o.petId);
          const seller = getUserById(o.sellerId);
          const statusMap = {
            pending_payment: { label: 'Esperando pago', class: 'badge-info' },
            payment_sent: { label: 'Pago enviado — Verificando', class: 'badge-warning' },
            confirmed: { label: 'Confirmado', class: 'badge-success' }
          };
          const st = statusMap[o.status] || { label: o.status, class: 'badge-info' };
          return `
            <div class="card mb-12">
              <div class="card-body flex gap-16" style="align-items:center">
                ${pet && pet.image ? `<img src="${pet.image}" style="width:48px;height:48px;object-fit:contain;flex-shrink:0" onerror="this.style.display='none'">` : ''}
                <div style="flex:1">
                  <div class="font-bold">${o.petName}</div>
                  <div class="text-sm text-muted">Vendedor: ${seller?.username || 'Desconocido'} • ${timeAgo(o.createdAt)}</div>
                </div>
                <div style="text-align:right">
                  <div class="font-bold">${formatPrice(o.amount, o.currency || 'USD')}</div>
                  <span class="badge ${st.class}">${st.label}</span>
                </div>
              </div>
              <div class="card-body" style="padding-top:0">
                ${o.paymentProof ? `<div class="mb-12"><strong>Comprobante de pago:</strong> <a href="${o.paymentProof}" target="_blank">Ver imagen</a></div>` : ''}
                ${o.messages && o.messages.length > 0 ? `
                  <div class="mb-12" style="background:var(--bg-secondary);padding:12px;border-radius:var(--radius-sm)">
                    <div class="text-sm text-muted mb-8">Historial de mensajes</div>
                    ${o.messages.map(msg => `
                      <div style="margin-bottom:8px;">
                        <div style="font-size:0.85rem;font-weight:700;color:var(--text-secondary)">${msg.sender === 'buyer' ? 'Comprador' : 'Vendedor'}</div>
                        <div style="font-size:0.95rem">${msg.text}</div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                <div class="form-row" style="gap:12px;flex-wrap:wrap">
                  <input type="text" class="form-input" id="order-msg-${o.id}" placeholder="Escribe un mensaje para el vendedor" style="flex:1;min-width:220px">
                  <button class="btn btn-secondary btn-sm send-order-msg-btn" data-id="${o.id}">Enviar</button>
                </div>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="empty-state">
            <h3>No tienes pedidos activos</h3>
            <p>Cuando compres una pet, tu pedido aparecerá aquí</p>
            <button class="btn btn-primary mt-16" onclick="window.location.hash='/marketplace'">Ir al Marketplace</button>
          </div>
        `}
      </div>

      <!-- Completed Orders -->
      <div id="orders-tab-completed" style="display:none">
        ${completedOrders.length > 0 ? completedOrders.map(o => {
          const pet = PETS_CATALOG.find(p => p.id === o.petId);
          return `
            <div class="card mb-12">
              <div class="card-body flex gap-16" style="align-items:center">
                ${pet && pet.image ? `<img src="${pet.image}" style="width:48px;height:48px;object-fit:contain;flex-shrink:0" onerror="this.style.display='none'">` : ''}
                <div style="flex:1">
                  <div class="font-bold">${o.petName}</div>
                  <div class="text-sm text-muted">${formatDate(o.completedAt || o.createdAt)}</div>
                </div>
                <div style="text-align:right">
                  <div class="font-bold">${formatPrice(o.amount, o.currency || 'USD')}</div>
                  <span class="badge badge-success">✓ Completado</span>
                </div>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="empty-state">
            <h3>Sin compras completadas</h3>
            <p>Tu historial de compras aparecerá aquí</p>
          </div>
        `}
      </div>
    </div>
  `;
}

export function initOrders() {
  const tabs = document.getElementById('orders-tabs');
  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('[id^="orders-tab-"]').forEach(el => el.style.display = 'none');
      document.getElementById('orders-tab-' + tab.dataset.tab).style.display = '';
    });
  }

  document.querySelectorAll('.send-order-msg-btn').forEach(btn => {
    btn.onclick = () => {
      const orderId = btn.dataset.id;
      const input = document.getElementById(`order-msg-${orderId}`);
      const text = input?.value.trim();
      if (!text) return;
      const order = getOrders().find(o => o.id === orderId);
      if (!order) return;
      const messages = order.messages || [];
      messages.push({ sender: 'buyer', text, createdAt: new Date().toISOString() });
      updateOrder(orderId, { messages });
      input.value = '';
      showToast('Mensaje enviado al vendedor', 'success');
      navigate('/orders');
    };
  });
}

// ========================================
// Favorites Page
// ========================================

export function renderFavorites() {
  const user = getCurrentUser();
  if (!user) { navigate('/login'); return ''; }

  const favIds = getFavorites(user.id);
  const favListings = favIds.map(id => getListingById(id)).filter(Boolean);

  return `
    <div class="container page-content animate-fade-up" style="max-width:900px;margin:0 auto">
      <h1 style="font-size:1.8rem;margin-bottom:24px">Mis Favoritos</h1>
      
      ${favListings.length > 0 ? `
        <div class="grid-4">
          ${favListings.map(l => {
            const pet = PETS_CATALOG.find(p => p.id === l.petId);
            return `
              <div class="pet-card" onclick="window.location.hash='/pet/${l.id}'">
                <div class="pet-card-image">
                  ${pet && pet.image ? `<img src="${pet.image}" alt="${l.petName}" style="height:100px;object-fit:contain" onerror="this.style.display='none'">` : ''}
                </div>
                <div class="pet-card-body">
                  <div class="pet-card-name">${l.petName}</div>
                  <div class="pet-card-footer">
                    <span class="pet-card-price">${formatPrice(l.price, l.currency || 'USD')}</span>
                    <span class="badge ${getRarityClass(l.rarity)}" style="font-size:0.65rem">${l.rarity}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <h3>No tienes favoritos aún</h3>
          <p>Marca pets como favoritas para verlas aquí</p>
          <button class="btn btn-primary mt-16" onclick="window.location.hash='/marketplace'">Ir al Marketplace</button>
        </div>
      `}
    </div>
  `;
}
