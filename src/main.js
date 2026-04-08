// ========================================
// BananaStore.gg — Main Entry
// ========================================

import './styles/index.css';

import { Storage } from './utils/storage.js';
import { registerRoute, initRouter, navigate, getCurrentPath } from './utils/router.js';
import { getCurrentUser, logout } from './utils/auth.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';

// Pages
import { renderHome } from './pages/home.js';
import { renderLogin, initLogin } from './pages/login.js';
import { renderRegister, initRegister } from './pages/register.js';
import { renderMarketplace, initMarketplace } from './pages/marketplace.js';
import { renderCalculator, initCalculator } from './pages/calculator.js';
import { renderProfile, initProfile } from './pages/profile.js';
import { renderSellerPanel, initSellerPanel } from './pages/seller.js';
import { renderPetDetail, initPetDetail } from './pages/petDetail.js';
import { renderOrders, initOrders, renderFavorites } from './pages/orders.js';
import { renderAdmin, initAdmin } from './pages/admin.js';
import { renderSupport, initSupport } from './pages/support.js';

// Initialize storage with default data
Storage.init();

// Mobile device detection
function detectDeviceType() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  document.body.classList.toggle('device-mobile', isMobile);
  document.body.classList.toggle('device-desktop', !isMobile);
}

detectDeviceType();
window.addEventListener('resize', detectDeviceType);
window.addEventListener('orientationchange', detectDeviceType);

// Global logout function
window.BS_LOGOUT = () => {
  logout();
  navigate('/');
};

// Page init functions map
const pageInits = {
  '/': null,
  '/login': initLogin,
  '/register': initRegister,
  '/marketplace': initMarketplace,
  '/calculator': initCalculator,
  '/profile': initProfile,
  '/seller': initSellerPanel,
  '/pet': initPetDetail,
  '/orders': initOrders,
  '/favorites': null,
  '/admin': initAdmin,
  '/support': initSupport,
};

// Register routes
registerRoute('/', renderHome);
registerRoute('/login', renderLogin);
registerRoute('/register', renderRegister);
registerRoute('/marketplace', renderMarketplace);
registerRoute('/calculator', renderCalculator);
registerRoute('/profile', renderProfile);
registerRoute('/seller', renderSellerPanel);
registerRoute('/pet', (params) => renderPetDetail(params));
registerRoute('/orders', renderOrders);
registerRoute('/favorites', renderFavorites);
registerRoute('/admin', renderAdmin);
registerRoute('/support', renderSupport);

// App container
const app = document.getElementById('app');

// Render function
function renderPage(pageRenderer, params) {
  const noLayoutPages = ['/login', '/register'];
  const currentPath = getCurrentPath();
  const [basePath] = currentPath.split('/').filter(Boolean);
  const routePath = '/' + (basePath || '');
  const isNoLayout = noLayoutPages.includes(routePath);

  let pageContent;
  if (typeof pageRenderer === 'function') {
    pageContent = pageRenderer(params);
  } else {
    pageContent = '<h1>404 — Página no encontrada</h1>';
  }

  if (isNoLayout) {
    app.innerHTML = `
      <nav class="navbar">
        <div class="navbar-inner">
          <a class="navbar-brand" onclick="window.location.hash='/'">
            <img src="/logo.png" alt="BananaStore">
            <span>BananaStore.gg</span>
          </a>
        </div>
      </nav>
      ${pageContent}
    `;
  } else {
    app.innerHTML = `
      ${renderNavbar()}
      ${pageContent}
      ${renderFooter()}
    `;
  }

  // Scroll to top
  window.scrollTo(0, 0);

  // Run page-specific init
  setTimeout(() => {
    const initFn = pageInits[routePath];
    if (initFn) {
      initFn(params);
    }
  }, 50);
}

// Initialize router
initRouter(renderPage);
