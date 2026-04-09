// ========================================
// Navbar Component — Redesign v2
// ========================================

import { getCurrentUser, isAdmin, logout } from '../utils/auth.js';
import { navigate, getCurrentPath } from '../utils/router.js';

window.closeMobileNav = () => {
  const navLinks = document.getElementById('nav-links');
  navLinks?.classList.remove('open');
};

export function renderNavbar() {
  const user = getCurrentUser();
  const path = getCurrentPath();

  const navLinks = [
    { label: 'Marketplace', path: '/marketplace', icon: 'ri-store-2-line' },
    { label: 'Calculadora', path: '/calculator', icon: 'ri-scales-3-line' },
    { label: 'Soporte', path: '/support', icon: 'ri-headphone-line' },
  ];

  return `
    <nav class="navbar" id="main-navbar">
      <div class="navbar-inner">
        <a class="navbar-brand" onclick="window.location.hash='/'">
          <img src="/logo.png" alt="BananaStore">
          <span>BananaStore<span style="-webkit-text-fill-color:var(--text-secondary);font-weight:400;font-size:0.85em">.gg</span></span>
        </a>

        <div class="navbar-links" id="nav-links">
          ${navLinks.map(link => `
            <a class="nav-link ${path === link.path ? 'active' : ''}"
               onclick="window.closeMobileNav();window.location.hash='${link.path}'">
              <i class="ri ${link.icon}" style="font-size:1rem;margin-right:4px"></i>
              ${link.label}
            </a>
          `).join('')}
          ${!user ? `
            <div class="mobile-auth-btns">
              <button class="btn btn-ghost w-full" onclick="window.closeMobileNav();window.location.hash='/login'">
                <i class="ri ri-login-box-line"></i> Iniciar Sesion
              </button>
              <button class="btn btn-primary w-full" onclick="window.closeMobileNav();window.location.hash='/register'">
                Registrarse
              </button>
            </div>
          ` : ''}
        </div>

        <div class="navbar-actions">
          ${user ? `
            <div class="navbar-user" id="nav-user-btn" onclick="document.getElementById('nav-dropdown').classList.toggle('show')">
              <div class="navbar-avatar">${user.avatar || user.username.charAt(0).toUpperCase()}</div>
              <span class="navbar-username">${user.username}</span>
              <div class="navbar-dropdown" id="nav-dropdown">
                <div class="dropdown-item" onclick="event.stopPropagation();window.location.hash='/profile'">
                  <i class="ri ri-user-line"></i> Mi Perfil
                </div>
                ${user.role === 'seller' || user.role === 'both' || user.role === 'admin' ? `
                  <div class="dropdown-item" onclick="event.stopPropagation();window.location.hash='/seller'">
                    <i class="ri ri-store-line"></i> Panel Vendedor
                  </div>
                ` : ''}
                <div class="dropdown-item" onclick="event.stopPropagation();window.location.hash='/orders'">
                  <i class="ri ri-shopping-bag-line"></i> Mis Pedidos
                </div>
                <div class="dropdown-item" onclick="event.stopPropagation();window.location.hash='/favorites'">
                  <i class="ri ri-heart-line"></i> Favoritos
                </div>
                ${isAdmin() ? `
                  <div class="dropdown-divider"></div>
                  <div class="dropdown-item" onclick="event.stopPropagation();window.location.hash='/admin'">
                    <i class="ri ri-settings-3-line"></i> Admin Panel
                  </div>
                ` : ''}
                <div class="dropdown-divider"></div>
                <div class="dropdown-item danger" onclick="event.stopPropagation();window.BS_LOGOUT()">
                  <i class="ri ri-logout-box-line"></i> Cerrar Sesion
                </div>
              </div>
            </div>
          ` : `
            <button class="btn btn-ghost" onclick="window.closeMobileNav();window.location.hash='/login'">
              <i class="ri ri-login-box-line"></i> Iniciar Sesion
            </button>
            <button class="btn btn-primary" onclick="window.closeMobileNav();window.location.hash='/register'">
              Registrarse
            </button>
          `}
          <button class="nav-toggle" onclick="document.getElementById('nav-links').classList.toggle('open')">
            <i class="ri ri-menu-line"></i>
          </button>
        </div>
      </div>
    </nav>
  `;
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('nav-dropdown');
  const btn = document.getElementById('nav-user-btn');
  if (dropdown && btn && !btn.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});
