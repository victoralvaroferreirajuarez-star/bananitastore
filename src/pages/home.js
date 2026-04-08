// ========================================
// Home Page — Redesign v2
// ========================================

import { getListings } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import { PETS_CATALOG } from '../data/pets.js';
import { formatPrice } from '../utils/helpers.js';
import { renderPetCard } from './marketplace.js';

// Iconic pets for the hero rotating showcase
const HERO_SHOWCASE_PETS = [
  { name: 'Dog', fallback: 'https://static.wikia.nocookie.net/adoptme/images/3/35/Dog.png/revision/latest/scale-to-width-down/168?cb=20260228184731' },
  { name: 'Dragon', fallback: 'https://static.wikia.nocookie.net/adoptme/images/3/3c/Dragon_Pet.png/revision/latest?cb=20210726173407' },
  { name: 'Unicorn', fallback: 'https://static.wikia.nocookie.net/adoptme/images/1/1f/Unicorn_Pet.png/revision/latest?cb=20250209082117' },
  { name: 'Turtle', fallback: 'https://static.wikia.nocookie.net/adoptme/images/3/3f/Turtle_In-game..png/revision/latest?cb=20210617223738' },
  { name: 'Frost Dragon', fallback: 'https://static.wikia.nocookie.net/adoptme/images/f/fd/Frost_Dragon_Pet.png/revision/latest?cb=20200116000126' },
  { name: 'Shadow Dragon', fallback: 'https://static.wikia.nocookie.net/adoptme/images/8/80/Shadow_Dragon_Gamepass_AM.png/revision/latest?cb=20201205093105' },
].map(p => {
  const catalogPet = PETS_CATALOG.find(c => c.name === p.name);
  return { name: p.name, image: catalogPet?.image || p.fallback };
});

export function renderHome() {
  const listings = getListings().filter(l => l.status === 'active').slice(0, 8);
  const user = getCurrentUser();
  const totalListings = getListings().length;

  return `
    <div class="container page-content animate-fade-up">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-showcase" id="hero-showcase">
          <div class="hero-showcase-glow"></div>
          <img
            id="hero-pet-img"
            class="hero-showcase-pet"
            src="${HERO_SHOWCASE_PETS[0].image}"
            alt="${HERO_SHOWCASE_PETS[0].name}"
            onerror="this.style.display='none'"
          >
          <div class="hero-showcase-name" id="hero-pet-name">${HERO_SHOWCASE_PETS[0].name}</div>
        </div>
        <div class="hero-content">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(255,210,63,0.1);border:1px solid rgba(255,210,63,0.2);border-radius:var(--radius-full);margin-bottom:20px;font-size:0.82rem;color:var(--banana-yellow);font-weight:600">
            <i class="ri ri-game-line"></i> Adopt Me Pet Marketplace
          </div>
          <h1>Tu tienda de pets<br><span class="highlight">de confianza</span></h1>
          <p>Compra y vende pets de Adopt Me de forma segura. Vendedores verificados, pagos protegidos y la mejor experiencia de trading.</p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" onclick="window.location.hash='/marketplace'">
              <i class="ri ri-store-2-line"></i> Explorar Marketplace
            </button>
            <button class="btn btn-secondary btn-lg" onclick="window.location.hash='/calculator'">
              <i class="ri ri-scales-3-line"></i> Calculadora
            </button>
          </div>
          <div class="hero-stats">
            <div>
              <div class="hero-stat-value">${totalListings > 0 ? totalListings + '+' : '1000+'}</div>
              <div class="hero-stat-label">Pets en venta</div>
            </div>
            <div>
              <div class="hero-stat-value">100%</div>
              <div class="hero-stat-label">Pago seguro</div>
            </div>
            <div>
              <div class="hero-stat-value">24/7</div>
              <div class="hero-stat-label">Soporte</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trust Badges -->
      <div class="section">
        <div class="grid-4">
          <div class="trust-card">
            <div class="trust-icon" style="background:var(--pastel-green);color:var(--pastel-green-text)">
              <i class="ri ri-shield-check-line"></i>
            </div>
            <h4 style="font-size:0.95rem;margin-bottom:6px">Vendedores Verificados</h4>
            <p class="text-sm text-muted">Aprobados manualmente por nuestro equipo</p>
          </div>
          <div class="trust-card">
            <div class="trust-icon" style="background:var(--pastel-blue);color:var(--pastel-blue-text)">
              <i class="ri ri-secure-payment-line"></i>
            </div>
            <h4 style="font-size:0.95rem;margin-bottom:6px">Pagos Seguros</h4>
            <p class="text-sm text-muted">PayPal, Yape y QR con confirmacion</p>
          </div>
          <div class="trust-card">
            <div class="trust-icon" style="background:var(--pastel-purple);color:var(--pastel-purple-text)">
              <i class="ri ri-customer-service-line"></i>
            </div>
            <h4 style="font-size:0.95rem;margin-bottom:6px">Soporte 24/7</h4>
            <p class="text-sm text-muted">Estamos aqui para ayudarte siempre</p>
          </div>
          <div class="trust-card">
            <div class="trust-icon" style="background:rgba(255,210,63,0.12);color:var(--banana-yellow)">
              <i class="ri ri-calculator-line"></i>
            </div>
            <h4 style="font-size:0.95rem;margin-bottom:6px">Calculadora de Trades</h4>
            <p class="text-sm text-muted">Sabe si tu trade vale la pena</p>
          </div>
        </div>
      </div>

      <!-- Featured Pets -->
      ${listings.length > 0 ? `
        <div class="section">
          <div class="flex-between mb-16">
            <div>
              <div class="section-header-glow" style="background:rgba(255,210,63,0.1);color:var(--banana-yellow)">En venta ahora</div>
              <h2 class="section-title" style="margin-bottom:4px">Pets Destacadas</h2>
              <p class="text-sm text-muted">Las ultimas pets anadidas al marketplace</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.location.hash='/marketplace'">
              Ver todas <i class="ri ri-arrow-right-line"></i>
            </button>
          </div>
          <div class="grid-4">
            ${listings.map(l => renderPetCard(l)).join('')}
          </div>
        </div>
      ` : `
        <div class="section">
          <div class="flex-between mb-16">
            <div>
              <div class="section-header-glow" style="background:rgba(255,210,63,0.1);color:var(--banana-yellow)">Los mas buscados</div>
              <h2 class="section-title" style="margin-bottom:4px">Pets Populares</h2>
              <p class="text-sm text-muted">Descubre los pets mas buscados de Adopt Me</p>
            </div>
          </div>
          <div class="grid-5">
            ${PETS_CATALOG.filter(p => p.rarity === 'Legendary').slice(0, 10).map(pet => `
              <div class="catalog-item" onclick="window.location.hash='/calculator'">
                <div class="catalog-item-emoji">${pet.image ? `<img src="${pet.image}" alt="${pet.name}" style="width:60px;height:60px;object-fit:contain" onerror="this.style.display='none'">` : ''}</div>
                <div class="catalog-item-name">${pet.name}</div>
                <span class="badge badge-legendary" style="margin-top:6px;font-size:0.65rem">${pet.rarity}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `}

      <!-- How it works -->
      <div class="section">
        <div class="text-center" style="margin-bottom:36px">
          <div class="section-header-glow" style="background:var(--pastel-purple);color:var(--pastel-purple-text)">Simple y rapido</div>
          <h2 class="section-title text-center" style="margin-bottom:8px">Como funciona?</h2>
          <p class="text-sm text-muted">En 3 simples pasos</p>
        </div>
        <div class="grid-3" style="margin-top:12px">
          <div class="step-card">
            <div class="step-number" style="background:var(--pastel-blue);color:var(--pastel-blue-text);border-color:var(--pastel-blue-text)">
              1
            </div>
            <h3 style="margin-bottom:10px">Busca tu pet</h3>
            <p class="text-sm text-muted">Explora nuestro marketplace con filtros por rareza, tipo y precio</p>
          </div>
          <div class="step-card">
            <div class="step-number" style="background:var(--pastel-green);color:var(--pastel-green-text);border-color:var(--pastel-green-text)">
              2
            </div>
            <h3 style="margin-bottom:10px">Paga seguro</h3>
            <p class="text-sm text-muted">Paga con PayPal o QR. El vendedor confirma tu pago</p>
          </div>
          <div class="step-card">
            <div class="step-number" style="background:var(--pastel-purple);color:var(--pastel-purple-text);border-color:var(--pastel-purple-text)">
              3
            </div>
            <h3 style="margin-bottom:10px">Recibe tu pet</h3>
            <p class="text-sm text-muted">Coordina la entrega in-game con tu vendedor verificado</p>
          </div>
        </div>
      </div>

      <!-- Popular Categories -->
      <div class="section">
        <div class="text-center" style="margin-bottom:36px">
          <div class="section-header-glow" style="background:var(--pastel-pink);color:var(--pastel-pink-text)">Explora por rareza</div>
          <h2 class="section-title text-center" style="margin-bottom:8px">Categorias</h2>
        </div>
        <div class="grid-5">
          ${[
            { name: 'Legendary', color: 'var(--banana-yellow)', bg: 'rgba(255,210,63,0.08)', border: 'rgba(255,210,63,0.2)', icon: 'ri-vip-crown-line', count: PETS_CATALOG.filter(p => p.rarity === 'Legendary').length },
            { name: 'Ultra Rare', color: 'var(--adopt-purple)', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)', icon: 'ri-star-line', count: PETS_CATALOG.filter(p => p.rarity === 'Ultra Rare').length },
            { name: 'Rare', color: 'var(--adopt-blue)', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', icon: 'ri-diamond-line', count: PETS_CATALOG.filter(p => p.rarity === 'Rare').length },
            { name: 'Uncommon', color: 'var(--adopt-green)', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', icon: 'ri-leaf-line', count: PETS_CATALOG.filter(p => p.rarity === 'Uncommon').length },
            { name: 'Common', color: 'var(--text-secondary)', bg: 'rgba(139,143,163,0.08)', border: 'rgba(139,143,163,0.2)', icon: 'ri-circle-line', count: PETS_CATALOG.filter(p => p.rarity === 'Common').length },
          ].map(cat => `
            <div onclick="window.location.hash='/marketplace'" style="background:${cat.bg};border:1px solid ${cat.border};border-radius:var(--radius-lg);padding:24px 16px;text-align:center;cursor:pointer;transition:all var(--transition-smooth);" onmouseenter="this.style.transform='translateY(-4px)'" onmouseleave="this.style.transform='translateY(0)'">
              <i class="ri ${cat.icon}" style="font-size:1.8rem;color:${cat.color};display:block;margin-bottom:10px"></i>
              <div style="font-weight:700;font-size:0.92rem;margin-bottom:4px">${cat.name}</div>
              <div class="text-xs text-muted">${cat.count} pets</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CTA -->
      <div class="section">
        <div class="cta-section">
          <div style="font-size:2.5rem;margin-bottom:16px">
            <i class="ri ri-store-3-line" style="color:var(--banana-yellow)"></i>
          </div>
          <h2 style="margin-bottom:12px">Quieres vender tus pets?</h2>
          <p class="text-muted" style="max-width:500px;margin:0 auto 28px">Registrate como vendedor, sube tus pets y empieza a ganar dinero. Proceso de aprobacion rapido y seguro.</p>
          <button class="btn btn-primary btn-lg" onclick="window.location.hash='${user ? '/profile' : '/register'}'">
            <i class="ri ri-rocket-line"></i>
            ${user ? 'Solicitar ser vendedor' : 'Crear cuenta gratis'}
          </button>
        </div>
      </div>
    </div>

    <script>
      (function() {
        const pets = ${JSON.stringify(HERO_SHOWCASE_PETS)};
        let index = 0;
        const img = document.getElementById('hero-pet-img');
        const name = document.getElementById('hero-pet-name');
        if (!img || !name) return;

        setInterval(function() {
          // Fade out
          img.style.opacity = '0';
          img.style.transform = 'scale(0.8) translateY(20px)';
          name.style.opacity = '0';

          setTimeout(function() {
            index = (index + 1) % pets.length;
            img.src = pets[index].image;
            img.alt = pets[index].name;
            name.textContent = pets[index].name;

            // Fade in
            setTimeout(function() {
              img.style.opacity = '1';
              img.style.transform = 'scale(1) translateY(0)';
              name.style.opacity = '1';
            }, 50);
          }, 400);
        }, 3500);
      })();
    </script>
  `;
}
