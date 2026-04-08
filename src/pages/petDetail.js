// ========================================
// Pet Detail & Payment Page
// ========================================

import { getListingById, getUserById, addOrder, updateListing, getFavorites, toggleFavorite } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import { PETS_CATALOG, getRarityClass, PET_AGES } from '../data/pets.js';
import { formatPrice, showToast, generateId, showModal, closeModal } from '../utils/helpers.js';
import { navigate } from '../utils/router.js';

export function renderPetDetail(params) {
  const listingId = params[0];
  const listing = getListingById(listingId);
  const user = getCurrentUser();

  if (!listing) {
    return `
      <div class="container page-content">
        <div class="empty-state">
          <h3>Pet no encontrada</h3>
          <p>Esta publicación no existe o fue eliminada</p>
          <button class="btn btn-primary mt-16" onclick="window.location.hash='/marketplace'">Volver al Marketplace</button>
        </div>
      </div>
    `;
  }

  const pet = PETS_CATALOG.find(p => p.id === listing.petId);
  const seller = getUserById(listing.sellerId);
  const isFav = user ? getFavorites(user.id).includes(listing.id) : false;

  const badges = [];
  if (listing.isFly) badges.push('<span class="badge badge-fly">Fly</span>');
  if (listing.isRide) badges.push('<span class="badge badge-ride">Ride</span>');
  if (listing.isNeon) badges.push('<span class="badge badge-neon">Neon</span>');
  if (listing.isMega) badges.push('<span class="badge badge-mega">Mega Neon</span>');

  return `
    <div class="container page-content animate-fade-up" style="max-width:900px;margin:0 auto">
      <button class="btn btn-ghost mb-16" onclick="window.location.hash='/marketplace'">
        Volver al Marketplace
      </button>

      <div class="grid-2" style="gap:32px">
        <!-- Pet Image -->
        <div class="card">
          <div style="padding:40px;text-align:center;background:var(--bg-secondary);min-height:280px;display:flex;align-items:center;justify-content:center">
            ${pet && pet.image ? `<img src="${pet.image}" alt="${listing.petName}" style="max-height:200px;object-fit:contain" onerror="this.style.display='none'">` : ''}
          </div>
        </div>

        <!-- Pet Info -->
        <div>
          <div class="flex gap-8 mb-8">
            <span class="badge ${getRarityClass(listing.rarity)}">${listing.rarity}</span>
            ${badges.join('')}
          </div>
          
          <h1 style="font-size:2rem;margin-bottom:4px">${listing.petName}</h1>
          <p class="text-muted mb-16">${pet?.category || 'Adopt Me Pet'}</p>

          <div class="card card-flat mb-16">
            <div class="card-body">
              <div class="grid-2" style="gap:12px">
                <div><span class="text-sm text-muted">Edad</span><div class="font-bold">${listing.age || 'No especificada'}</div></div>
                <div><span class="text-sm text-muted">Precio</span><div class="font-bold" style="font-size:1.5rem;color:var(--banana-dark)">${formatPrice(listing.price, listing.currency || 'USD')}</div></div>
                <div><span class="text-sm text-muted">Stock</span><div class="font-bold">x${listing.quantity || 1}</div></div>
              </div>
            </div>
          </div>

          ${listing.description ? `
            <div class="mb-16">
              <h4 class="text-sm text-muted mb-4">Descripción</h4>
              <p style="font-size:0.9rem">${listing.description}</p>
            </div>
          ` : ''}

          <!-- Seller Info -->
          <div class="card card-flat mb-16">
            <div class="card-body flex gap-12" style="align-items:center">
              <div class="navbar-avatar" style="width:40px;height:40px">${seller?.avatar || '?'}</div>
              <div>
                <div class="font-bold">${seller?.username || 'Vendedor'}</div>
                <div class="text-xs text-muted">Vendedor ${seller?.sellerApproved ? '✓ Verificado' : ''}</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-12">
            ${user && user.id !== listing.sellerId ? `
              <button class="btn btn-primary btn-lg" style="flex:1" id="buy-btn">
                Comprar Now
              </button>
              <button class="btn btn-secondary btn-icon btn-lg" id="fav-btn" style="font-size:1.2rem">
                ${isFav ? '♥' : '♡'}
              </button>
            ` : user && user.id === listing.sellerId ? `
              <div class="card card-flat" style="width:100%;background:var(--banana-light);border-color:var(--banana-yellow)">
                <div class="card-body text-center text-sm" style="color:var(--banana-dark)">
                  Esta es tu publicación
                </div>
              </div>
            ` : `
              <button class="btn btn-primary btn-lg btn-block" onclick="window.location.hash='/login'">
                Inicia sesión para comprar
              </button>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initPetDetail(params) {
  const listingId = params[0];
  const listing = getListingById(listingId);
  const user = getCurrentUser();
  if (!listing || !user) return;

  // Favorite
  const favBtn = document.getElementById('fav-btn');
  if (favBtn) {
    favBtn.onclick = () => {
      toggleFavorite(user.id, listing.id);
      showToast('Favorito actualizado', 'info');
      navigate('/pet/' + listingId);
    };
  }

  // Buy
  const buyBtn = document.getElementById('buy-btn');
  if (buyBtn) {
    buyBtn.onclick = () => {
      const seller = getUserById(listing.sellerId);
      const paypalEmail = seller?.paypalEmail || '';

      const detailPet = PETS_CATALOG.find(p => p.id === listing.petId);
      const html = `
        <div>
          <div class="text-center mb-24">
            ${detailPet && detailPet.image ? `<img src="${detailPet.image}" style="width:64px;height:64px;object-fit:contain;margin:0 auto" onerror="this.style.display='none'">` : ''}
            <h3 style="margin-top:8px">${listing.petName}</h3>
            <div class="font-bold" style="font-size:1.5rem;color:var(--banana-dark);margin-top:4px">${formatPrice(listing.price, listing.currency || 'USD')}</div>
          </div>

          <h4 class="mb-12">Método de pago</h4>
          <div class="payment-methods" id="payment-methods">
            <div class="payment-method selected" data-method="paypal">
              <span>PayPal</span>
            </div>
            <div class="payment-method" data-method="qr">
              <span>QR Code</span>
            </div>
            ${seller?.yapeNumber ? `<div class="payment-method" data-method="yape">
              <span>Yape</span>
            </div>` : ''}
          </div>

          <!-- PayPal section -->
          <div id="paypal-section">
            <div class="card card-flat mb-16">
              <div class="card-body">
                <p class="text-sm mb-8">Envía <strong>${formatPrice(listing.price, listing.currency || 'USD')}</strong> al siguiente PayPal:</p>
                <div style="padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm);font-weight:700;text-align:center;font-size:1.1rem">
                  ${paypalEmail || 'Email no configurado'}
                </div>
                ${paypalEmail ? `<a id="paypal-send-button" class="btn btn-ghost btn-block mt-12" target="_blank" rel="noreferrer">Pagar con PayPal</a>` : ''}
                <p class="form-hint mt-8">Una vez enviado el pago, haz clic en "He pagado" para notificar al vendedor</p>
              </div>
            </div>
          </div>

          <!-- QR section -->
          <div id="qr-section" style="display:none">
            <div class="qr-display">
              <div class="qr-placeholder">
                <div style="text-align:center">
                  <p class="text-xs text-muted mt-8">QR de pago</p>
                </div>
              </div>
              <p class="text-sm text-muted">Escanea el QR para realizar el pago de <strong>${formatPrice(listing.price, listing.currency || 'USD')}</strong></p>
            </div>
          </div>

          <!-- Yape section -->
          <div id="yape-section" style="display:none">
            <div class="card card-flat mb-16">
              <div class="card-body">
                <p class="text-sm mb-8">Envía <strong>${formatPrice(listing.price, listing.currency || 'USD')}</strong> vía Yape al número:</p>
                <div style="padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm);font-weight:700;text-align:center;font-size:1.1rem">
                  ${seller?.yapeNumber || 'Número no configurado'}
                </div>
                <p class="form-hint mt-8">Abre Yape, selecciona "Enviar dinero" y usa este número. Una vez enviado, haz clic en "He pagado"</p>
              </div>
            </div>
          </div>

          <div class="card card-flat mb-16">
            <div class="card-body">
              <label class="form-label">Mensaje para el vendedor</label>
              <textarea class="form-textarea" id="payment-chat-message" placeholder="Escribe aquí un comentario o instrucción..." rows="3"></textarea>
              <label class="form-label" style="margin-top:12px">Sube el comprobante de pago</label>
              <input type="file" class="form-input" id="payment-proof-input" accept="image/*">
              <p class="form-hint mt-8">Adjunta una imagen del comprobante si ya realizaste el pago.</p>
            </div>
          </div>

          <button class="btn btn-success btn-block btn-lg mt-16" id="confirm-purchase-btn">
            He realizado el pago
          </button>
          <p class="text-xs text-muted text-center mt-8" id="confirm-hint">El vendedor confirmará tu pago manualmente</p>
        </div>
      `;

      showModal('Completar Compra', html);

      setTimeout(() => {
        // Payment method switch
        const methods = document.querySelectorAll('#payment-methods .payment-method');
        methods.forEach(m => {
          m.onclick = () => {
            methods.forEach(mm => mm.classList.remove('selected'));
            m.classList.add('selected');
            document.getElementById('paypal-section').style.display = m.dataset.method === 'paypal' ? '' : 'none';
            document.getElementById('qr-section').style.display = m.dataset.method === 'qr' ? '' : 'none';
            document.getElementById('yape-section').style.display = m.dataset.method === 'yape' ? '' : 'none';
          };
        });

        const paypalButton = document.getElementById('paypal-send-button');
        if (paypalButton && paypalEmail) {
          const amount = listing.price.toFixed(2);
          const currency = listing.currency || 'USD';
          const itemName = encodeURIComponent(listing.petName);
          const business = encodeURIComponent(paypalEmail);
          paypalButton.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${business}&item_name=${itemName}&amount=${amount}&currency_code=${currency}`;
          paypalButton.textContent = 'Pagar con PayPal';
        }

        // Confirm purchase
        document.getElementById('confirm-purchase-btn').onclick = () => {
          const method = document.querySelector('.payment-method.selected')?.dataset.method || 'paypal';
          const message = document.getElementById('payment-chat-message')?.value.trim();
          const proofInput = document.getElementById('payment-proof-input');

          const createOrder = (proofData) => {
            const order = {
              id: 'ord_' + generateId(),
              buyerId: user.id,
              sellerId: listing.sellerId,
              listingId: listing.id,
              petId: listing.petId,
              petName: listing.petName,
              quantity: 1,
              amount: listing.price,
              currency: listing.currency || 'USD',
              paymentMethod: method,
              status: 'payment_sent',
              createdAt: new Date().toISOString(),
              messages: message ? [{ sender: 'buyer', text: message, createdAt: new Date().toISOString() }] : [],
              paymentProof: proofData || null
            };
            addOrder(order);
            const remainingQuantity = Math.max(0, (listing.quantity || 1) - 1);
            updateListing(listing.id, {
              quantity: remainingQuantity,
              status: remainingQuantity > 0 ? 'active' : 'sold'
            });
            closeModal();
            showToast('Pago notificado. El vendedor verificará tu pago pronto', 'success');
            navigate('/orders');
          };

          if (proofInput && proofInput.files.length > 0) {
            const file = proofInput.files[0];
            const reader = new FileReader();
            reader.onload = () => createOrder(reader.result);
            reader.readAsDataURL(file);
          } else {
            createOrder(null);
          }
        };
      }, 100);
    };
  }
}
