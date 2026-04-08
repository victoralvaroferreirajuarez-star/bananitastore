// ========================================
// Profile Page
// ========================================

import { getCurrentUser, updateProfile, logout } from '../utils/auth.js';
import { showToast } from '../utils/helpers.js';
import { navigate } from '../utils/router.js';
import { addSellerRequest, getSellerRequests } from '../utils/storage.js';

export function renderProfile() {
  const user = getCurrentUser();
  if (!user) {
    navigate('/login');
    return '<div class="loading-overlay"><div class="spinner"></div></div>';
  }

  const hasPendingRequest = getSellerRequests().find(r => r.userId === user.id && r.status === 'pending');
  const isSellerApproved = user.sellerApproved || user.role === 'admin';

  return `
    <div class="container page-content animate-fade-up" style="max-width:720px;margin:0 auto">
      <h1 style="font-size:1.8rem;margin-bottom:24px">Mi Perfil 👤</h1>
      
      <!-- Profile Header -->
      <div class="card mb-24">
        <div class="card-body flex gap-20" style="align-items:center">
          <div class="navbar-avatar" style="width:64px;height:64px;font-size:1.5rem;flex-shrink:0">
            ${user.avatar || user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style="font-size:1.3rem">${user.username}</h2>
            <p class="text-sm text-muted">${user.email}</p>
            <div class="flex gap-8 mt-8">
              <span class="badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'seller' ? 'badge-success' : 'badge-info'}">
                ${user.role === 'admin' ? '👑 Admin' : user.role === 'seller' ? '🏪 Vendedor' : user.role === 'both' ? '🔄 Vendedor & Comprador' : '🛒 Comprador'}
              </span>
              ${isSellerApproved && user.role !== 'admin' ? '<span class="badge badge-success">✓ Verificado</span>' : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="profile-tabs">
        <button class="tab active" data-tab="info">Datos Personales</button>
        <button class="tab" data-tab="security">Seguridad</button>
        <button class="tab" data-tab="seller">Vendedor</button>
      </div>

      <!-- Info Tab -->
      <div id="tab-info" class="card">
        <div class="card-body">
          <form id="profile-form" onsubmit="return false">
            <div class="form-group">
              <label class="form-label">Nombre de usuario</label>
              <input type="text" class="form-input" id="prof-username" value="${user.username}">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" id="prof-email" value="${user.email}">
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea class="form-textarea" id="prof-bio" placeholder="Cuéntanos algo sobre ti...">${user.bio || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">
              Guardar cambios
            </button>
          </form>
        </div>
      </div>

      <!-- Security Tab -->
      <div id="tab-security" class="card" style="display:none">
        <div class="card-body">
          <form id="password-form" onsubmit="return false">
            <div class="form-group">
              <label class="form-label">Contraseña actual</label>
              <input type="password" class="form-input" id="sec-current" placeholder="••••••••">
            </div>
            <div class="form-group">
              <label class="form-label">Nueva contraseña</label>
              <input type="password" class="form-input" id="sec-new" placeholder="Mínimo 6 caracteres">
            </div>
            <div class="form-group">
              <label class="form-label">Confirmar nueva contraseña</label>
              <input type="password" class="form-input" id="sec-confirm" placeholder="Repite la nueva contraseña">
            </div>
            <button type="submit" class="btn btn-primary">
              Cambiar contraseña
            </button>
          </form>
        </div>
      </div>

      <!-- Seller Tab -->
      <div id="tab-seller" class="card" style="display:none">
        <div class="card-body">
          ${user.role === 'admin' ? `
            <div class="flex gap-12" style="align-items:center;padding:16px;background:var(--pastel-green);border-radius:var(--radius-md)">
              <div>
                <h4 style="color:var(--pastel-green-text)">Eres administrador</h4>
                <p class="text-sm" style="color:var(--pastel-green-text)">Tienes acceso completo a todas las funciones de vendedor</p>
              </div>
            </div>
          ` : isSellerApproved ? `
            <div class="flex gap-12" style="align-items:center;padding:16px;background:var(--pastel-green);border-radius:var(--radius-md);margin-bottom:20px">
              <div>
                <h4 style="color:var(--pastel-green-text)">¡Eres vendedor verificado!</h4>
                <p class="text-sm" style="color:var(--pastel-green-text)">Tu solicitud fue aprobada. Puedes acceder a tu panel de vendedor.</p>
              </div>
            </div>
            <form id="seller-settings-form">
            <div class="form-group">
              <label class="form-label">Email de PayPal</label>
              <input type="email" class="form-input" id="seller-paypal" value="${user.paypalEmail || ''}" placeholder="tu-paypal@email.com">
              <p class="form-hint">Los compradores enviarán el pago a este email</p>
            </div>
            <div class="form-group">
              <label class="form-label">Número de Yape (opcional)</label>
              <input type="tel" class="form-input" id="seller-yape" value="${user.yapeNumber || ''}" placeholder="999888777" maxlength="9">
              <p class="form-hint">Número de celular registrado en Yape para recibir pagos</p>
            </div>
            <div class="form-group">
              <label class="form-label">PIN de acceso al panel (6 dígitos)</label>
              <input type="text" class="form-input" id="seller-pin" value="${user.sellerPin || ''}" maxlength="6" pattern="[0-9]{6}" placeholder="123456">
              <p class="form-hint">Necesitarás este PIN para acceder a tu panel de vendedor</p>
            </div>
            <button type="submit" class="btn btn-primary" id="save-seller-settings">
              Guardar configuración
            </button>
          </form>
          ` : hasPendingRequest ? `
            <div class="flex gap-12" style="align-items:center;padding:16px;background:var(--banana-light);border-radius:var(--radius-md)">
              <div>
                <h4 style="color:var(--banana-dark)">Solicitud pendiente</h4>
                <p class="text-sm" style="color:var(--banana-dark)">Tu solicitud de vendedor está siendo revisada por el equipo. Te notificaremos pronto.</p>
              </div>
            </div>
          ` : `
            <div class="text-center" style="padding:24px 0">
              <h3 style="margin-bottom:8px">¿Quieres vender pets?</h3>
              <p class="text-sm text-muted mb-24" style="max-width:400px;margin-left:auto;margin-right:auto">
                Solicita ser vendedor verificado. Nuestro equipo revisará tu solicitud para garantizar la seguridad de la plataforma.
              </p>
              <button class="btn btn-primary btn-lg" id="request-seller-btn">
                Solicitar ser vendedor
              </button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

export function initProfile() {
  const user = getCurrentUser();
  if (!user) return;

  // Tab switching
  const tabs = document.getElementById('profile-tabs');
  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.querySelectorAll('[id^="tab-"]').forEach(el => el.style.display = 'none');
      document.getElementById('tab-' + tabName).style.display = '';
    });
  }

  // Profile form
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.onsubmit = (e) => {
      e.preventDefault();
      const username = document.getElementById('prof-username').value.trim();
      const email = document.getElementById('prof-email').value.trim();
      const bio = document.getElementById('prof-bio').value.trim();
      if (!username || !email) { showToast('Completa los campos obligatorios', 'warning'); return; }
      updateProfile({ username, email, bio, avatar: username.charAt(0).toUpperCase() });
      showToast('Perfil actualizado ✓', 'success');
      navigate('/profile');
    };
  }

  // Password form
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.onsubmit = (e) => {
      e.preventDefault();
      const current = document.getElementById('sec-current').value;
      const newPass = document.getElementById('sec-new').value;
      const confirm = document.getElementById('sec-confirm').value;
      if (current !== user.password) { showToast('Contraseña actual incorrecta', 'error'); return; }
      if (newPass.length < 6) { showToast('La nueva contraseña debe tener al menos 6 caracteres', 'warning'); return; }
      if (newPass !== confirm) { showToast('Las contraseñas no coinciden', 'error'); return; }
      updateProfile({ password: newPass });
      showToast('Contraseña actualizada ✓', 'success');
    };
  }

  // Seller request
  const reqBtn = document.getElementById('request-seller-btn');
  if (reqBtn) {
    reqBtn.onclick = () => {
      addSellerRequest({
        id: 'sr_' + Date.now(),
        userId: user.id,
        username: user.username,
        email: user.email,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      showToast('¡Solicitud enviada! El equipo la revisará pronto', 'success');
      navigate('/profile');
    };
  }

  // Save seller settings
  const sellerSettingsForm = document.getElementById('seller-settings-form');
  if (sellerSettingsForm) {
    sellerSettingsForm.onsubmit = (e) => {
      e.preventDefault();
      const paypal = document.getElementById('seller-paypal').value.trim();
      const yape = document.getElementById('seller-yape').value.trim();
      const pin = document.getElementById('seller-pin').value.trim();
      if (pin && (pin.length !== 6 || !/^\d{6}$/.test(pin))) {
        showToast('El PIN debe ser exactamente 6 dígitos numéricos', 'warning');
        return;
      }
      updateProfile({ paypalEmail: paypal, yapeNumber: yape, sellerPin: pin });
      showToast('Configuración de vendedor guardada ✓', 'success');
    };
  }
}
