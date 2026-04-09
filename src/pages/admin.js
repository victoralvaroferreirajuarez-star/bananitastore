// ========================================
// Admin Panel (CEO)
// ========================================

import { isAdmin, getCurrentUser } from '../utils/auth.js';
import { getUsers, saveUsers, getListings, saveListings, getOrders, getSellerRequests, saveSellerRequests, getSiteConfig, saveSiteConfig, getSupportTickets, updateUser } from '../utils/storage.js';
import { showToast, formatDate, formatPrice, generateId } from '../utils/helpers.js';
import { navigate } from '../utils/router.js';

export function renderAdmin() {
  if (!isAdmin()) { navigate('/'); return ''; }

  const users = getUsers();
  const listings = getListings();
  const orders = getOrders();
  const sellerReqs = getSellerRequests();
  const tickets = getSupportTickets();
  const config = getSiteConfig();
  const pendingReqs = sellerReqs.filter(r => r.status === 'pending');

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.amount, 0);

  return `
    <div class="container page-content animate-fade-up">
      <div class="flex-between mb-24">
        <div>
          <h1 style="font-size:1.8rem">Panel de Administración</h1>
          <p class="text-sm text-muted">Control total de BananitaShop</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid-4 mb-32">
        <div class="stat-card">
          <div class="stat-icon blue"></div>
          <div><div class="stat-value">${users.length}</div><div class="stat-label">Usuarios</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow"></div>
          <div><div class="stat-value">${listings.filter(l => l.status === 'active').length}</div><div class="stat-label">Listings activos</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"></div>
          <div><div class="stat-value">${orders.length}</div><div class="stat-label">Órdenes totales</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"></div>
          <div><div class="stat-value">${formatPrice(totalRevenue, 'USD')}</div><div class="stat-label">Revenue total</div></div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="admin-tabs">
        <button class="tab active" data-tab="requests">
          Vendedores ${pendingReqs.length > 0 ? `<span class="badge badge-warning" style="margin-left:4px">${pendingReqs.length}</span>` : ''}
        </button>
        <button class="tab" data-tab="users">Usuarios</button>
        <button class="tab" data-tab="listings">Listings</button>
        <button class="tab" data-tab="orders">Órdenes</button>
        <button class="tab" data-tab="tickets">Soporte</button>
        <button class="tab" data-tab="config">Configuración</button>
      </div>

      <!-- SELLER REQUESTS -->
      <div id="admin-tab-requests">
        <h3 class="mb-16">Solicitudes de Vendedor</h3>
        ${pendingReqs.length > 0 ? `
          ${pendingReqs.map(r => `
            <div class="card mb-12">
              <div class="card-body flex-between">
                <div class="flex gap-12" style="align-items:center">
                  <div class="navbar-avatar" style="width:40px;height:40px">${r.username.charAt(0).toUpperCase()}</div>
                  <div>
                    <div class="font-bold">${r.username}</div>
                    <div class="text-sm text-muted">${r.email} • ${formatDate(r.createdAt)}</div>
                  </div>
                </div>
                <div class="flex gap-8">
                  <button class="btn btn-success btn-sm approve-seller-btn" data-id="${r.id}" data-user-id="${r.userId}">
                    Aprobar
                  </button>
                  <button class="btn btn-danger btn-sm reject-seller-btn" data-id="${r.id}">
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        ` : `
          <div class="empty-state">
            <h3>No hay solicitudes pendientes</h3>
          </div>
        `}

        ${sellerReqs.filter(r => r.status !== 'pending').length > 0 ? `
          <h4 class="mt-24 mb-12 text-muted">Historial</h4>
          ${sellerReqs.filter(r => r.status !== 'pending').map(r => `
            <div class="card card-flat mb-8">
              <div class="card-body flex-between" style="padding:12px 16px">
                <span>${r.username} — ${r.email}</span>
                <span class="badge ${r.status === 'approved' ? 'badge-success' : 'badge-danger'}">${r.status === 'approved' ? '✓ Aprobado' : '✗ Rechazado'}</span>
              </div>
            </div>
          `).join('')}
        ` : ''}
      </div>

      <!-- USERS -->
      <div id="admin-tab-users" style="display:none">
        <h3 class="mb-16">Gestión de Usuarios</h3>
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td class="font-bold">${u.username}</td>
                  <td class="text-sm text-muted">${u.email}</td>
                  <td><span class="badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'seller' ? 'badge-success' : 'badge-info'}">${u.role}</span></td>
                  <td>
                    <span class="status ${u.banned ? 'status-inactive' : 'status-active'}">
                      <span class="status-dot"></span>
                      ${u.banned ? 'Baneado' : 'Activo'}
                    </span>
                  </td>
                  <td class="text-sm text-muted">${formatDate(u.createdAt)}</td>
                  <td>
                    ${u.role !== 'admin' ? `
                      <button class="btn btn-ghost btn-sm toggle-ban-btn" data-id="${u.id}" data-banned="${u.banned}">
                        ${u.banned ? '🔓 Desbanear' : '🔒 Banear'}
                      </button>
                    ` : '<span class="text-xs text-muted">CEO</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- LISTINGS -->
      <div id="admin-tab-listings" style="display:none">
        <h3 class="mb-16">Todos los Listings</h3>
        ${listings.length > 0 ? `
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr><th>Pet</th><th>Vendedor</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                ${listings.map(l => {
                  const seller = getUsers().find(u => u.id === l.sellerId);
                  return `
                    <tr>
                      <td class="font-bold">${l.petName}</td>
                      <td class="text-sm">${seller?.username || '?'}</td>
                      <td>${formatPrice(l.price, l.currency || 'USD')}</td>
                      <td><span class="badge ${l.status === 'active' ? 'badge-success' : 'badge-pending'}">${l.status}</span></td>
                      <td>
                        <button class="btn btn-ghost btn-sm admin-remove-listing" data-id="${l.id}">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : '<div class="empty-state"><h3>No hay listings</h3></div>'}
      </div>

      <!-- ORDERS -->
      <div id="admin-tab-orders" style="display:none">
        <h3 class="mb-16">Todas las Órdenes</h3>
        ${orders.length > 0 ? `
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr><th>ID</th><th>Pet</th><th>Comprador</th><th>Vendedor</th><th>Monto</th><th>Estado</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                ${orders.map(o => {
                  const buyer = getUsers().find(u => u.id === o.buyerId);
                  const seller = getUsers().find(u => u.id === o.sellerId);
                  return `
                    <tr>
                      <td class="text-xs text-muted">#${o.id.slice(-6)}</td>
                      <td>${o.petName}</td>
                      <td class="text-sm">${buyer?.username || '?'}</td>
                      <td class="text-sm">${seller?.username || '?'}</td>
                      <td class="font-bold">${formatPrice(o.amount, o.currency || 'USD')}</td>
                      <td><span class="badge ${o.status === 'completed' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
                      <td class="text-sm text-muted">${formatDate(o.createdAt)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : '<div class="empty-state"><h3>No hay órdenes</h3></div>'}
      </div>

      <!-- SUPPORT TICKETS -->
      <div id="admin-tab-tickets" style="display:none">
        <h3 class="mb-16">Tickets de Soporte</h3>
        ${tickets.length > 0 ? tickets.map(t => `
          <div class="card mb-12">
            <div class="card-body">
              <div class="flex-between mb-8">
                <div class="font-bold">${t.subject}</div>
                <span class="badge ${t.status === 'open' ? 'badge-warning' : 'badge-success'}">${t.status}</span>
              </div>
              <p class="text-sm text-muted mb-8">${t.name} — ${t.email}</p>
              <p class="text-sm">${t.message}</p>
              <p class="text-xs text-muted mt-8">${formatDate(t.createdAt)}</p>
            </div>
          </div>
        `).join('') : '<div class="empty-state"><h3>No hay tickets</h3></div>'}
      </div>

      <!-- CONFIG -->
      <div id="admin-tab-config" style="display:none">
        <h3 class="mb-16">Configuración del Sitio</h3>
        <div class="card">
          <div class="card-body">
            <form id="config-form" onsubmit="return false">
              <div class="form-group">
                <label class="form-label">Nombre del sitio</label>
                <input type="text" class="form-input" id="cfg-name" value="${config.siteName || 'BananitaShop'}">
              </div>
              <div class="form-group">
                <label class="form-label">Comisión (%)</label>
                <input type="number" class="form-input" id="cfg-commission" value="${config.commission || 0}" min="0" max="100" step="0.5">
                <p class="form-hint">Porcentaje de comisión por venta (0 = sin comisión)</p>
              </div>
              <div class="form-group">
                <label class="form-label">Anuncio global</label>
                <textarea class="form-textarea" id="cfg-announcement" placeholder="Mensaje que se mostrará a todos los usuarios...">${config.announcement || ''}</textarea>
              </div>
              <div class="form-group">
                <label class="checkbox-group">
                  <input type="checkbox" class="checkbox-input" id="cfg-maintenance" ${config.maintenanceMode ? 'checked' : ''}>
                  <span>Modo mantenimiento</span>
                </label>
                <p class="form-hint">Cuando está activo, solo los admins pueden acceder</p>
              </div>
              <button type="submit" class="btn btn-primary">
                Guardar Configuración
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initAdmin() {
  if (!isAdmin()) return;

  // Tab switching
  const tabs = document.getElementById('admin-tabs');
  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('[id^="admin-tab-"]').forEach(el => el.style.display = 'none');
      document.getElementById('admin-tab-' + tab.dataset.tab).style.display = '';
    });
  }

  // Approve seller
  document.querySelectorAll('.approve-seller-btn').forEach(btn => {
    btn.onclick = () => {
      const reqId = btn.dataset.id;
      const userId = btn.dataset.userId;
      const reqs = getSellerRequests();
      const idx = reqs.findIndex(r => r.id === reqId);
      if (idx !== -1) { reqs[idx].status = 'approved'; saveSellerRequests(reqs); }
      updateUser(userId, { role: 'seller', sellerApproved: true });
      showToast('Vendedor aprobado ✓', 'success');
      navigate('/admin');
    };
  });

  // Reject seller
  document.querySelectorAll('.reject-seller-btn').forEach(btn => {
    btn.onclick = () => {
      const reqId = btn.dataset.id;
      const reqs = getSellerRequests();
      const idx = reqs.findIndex(r => r.id === reqId);
      if (idx !== -1) { reqs[idx].status = 'rejected'; saveSellerRequests(reqs); }
      showToast('Solicitud rechazada', 'info');
      navigate('/admin');
    };
  });

  // Ban/unban
  document.querySelectorAll('.toggle-ban-btn').forEach(btn => {
    btn.onclick = () => {
      const userId = btn.dataset.id;
      const isBanned = btn.dataset.banned === 'true';
      updateUser(userId, { banned: !isBanned });
      showToast(isBanned ? 'Usuario desbaneado' : 'Usuario baneado', 'info');
      navigate('/admin');
    };
  });

  // Remove listing
  document.querySelectorAll('.admin-remove-listing').forEach(btn => {
    btn.onclick = () => {
      const listings = getListings().filter(l => l.id !== btn.dataset.id);
      saveListings(listings);
      showToast('Listing eliminado', 'info');
      navigate('/admin');
    };
  });

  // Config form
  const configForm = document.getElementById('config-form');
  if (configForm) {
    configForm.onsubmit = (e) => {
      e.preventDefault();
      saveSiteConfig({
        siteName: document.getElementById('cfg-name').value.trim(),
        commission: parseFloat(document.getElementById('cfg-commission').value) || 0,
        announcement: document.getElementById('cfg-announcement').value.trim(),
        maintenanceMode: document.getElementById('cfg-maintenance').checked
      });
      showToast('Configuración guardada ✓', 'success');
    };
  }
}
