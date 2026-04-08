// ========================================
// Footer Component — Redesign v2
// ========================================

export function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">
              <img src="/logo.png" alt="BananaStore">
              <span>BananaStore.gg</span>
            </div>
            <p class="footer-desc">
              La plataforma mas segura para comprar y vender pets de Adopt Me.
              Pagos verificados, vendedores aprobados y soporte 24/7.
            </p>
            <div style="display:flex;gap:10px;margin-top:16px">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-elevated);border:1px solid var(--border-light);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all var(--transition-fast);color:var(--text-secondary)" onmouseenter="this.style.color='var(--banana-yellow)';this.style.borderColor='var(--banana-yellow)'" onmouseleave="this.style.color='var(--text-secondary)';this.style.borderColor='var(--border-light)'">
                <i class="ri ri-discord-line" style="font-size:1rem"></i>
              </div>
              <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-elevated);border:1px solid var(--border-light);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all var(--transition-fast);color:var(--text-secondary)" onmouseenter="this.style.color='var(--banana-yellow)';this.style.borderColor='var(--banana-yellow)'" onmouseleave="this.style.color='var(--text-secondary)';this.style.borderColor='var(--border-light)'">
                <i class="ri ri-twitter-x-line" style="font-size:1rem"></i>
              </div>
              <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-elevated);border:1px solid var(--border-light);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all var(--transition-fast);color:var(--text-secondary)" onmouseenter="this.style.color='var(--banana-yellow)';this.style.borderColor='var(--banana-yellow)'" onmouseleave="this.style.color='var(--text-secondary)';this.style.borderColor='var(--border-light)'">
                <i class="ri ri-youtube-line" style="font-size:1rem"></i>
              </div>
            </div>
          </div>
          <div>
            <h4 class="footer-title">Navegar</h4>
            <a class="footer-link" onclick="window.location.hash='/marketplace'"><i class="ri ri-store-2-line" style="margin-right:6px;font-size:0.85rem"></i>Marketplace</a>
            <a class="footer-link" onclick="window.location.hash='/calculator'"><i class="ri ri-scales-3-line" style="margin-right:6px;font-size:0.85rem"></i>Calculadora</a>
            <a class="footer-link" onclick="window.location.hash='/support'"><i class="ri ri-headphone-line" style="margin-right:6px;font-size:0.85rem"></i>Soporte</a>
          </div>
          <div>
            <h4 class="footer-title">Cuenta</h4>
            <a class="footer-link" onclick="window.location.hash='/login'"><i class="ri ri-login-box-line" style="margin-right:6px;font-size:0.85rem"></i>Iniciar Sesion</a>
            <a class="footer-link" onclick="window.location.hash='/register'"><i class="ri ri-user-add-line" style="margin-right:6px;font-size:0.85rem"></i>Registrarse</a>
            <a class="footer-link" onclick="window.location.hash='/profile'"><i class="ri ri-user-line" style="margin-right:6px;font-size:0.85rem"></i>Mi Perfil</a>
          </div>
          <div>
            <h4 class="footer-title">Legal</h4>
            <a class="footer-link"><i class="ri ri-file-text-line" style="margin-right:6px;font-size:0.85rem"></i>Terminos de Servicio</a>
            <a class="footer-link"><i class="ri ri-shield-line" style="margin-right:6px;font-size:0.85rem"></i>Politica de Privacidad</a>
            <a class="footer-link"><i class="ri ri-cookie-line" style="margin-right:6px;font-size:0.85rem"></i>Cookies</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} BananaStore.gg &mdash; Todos los derechos reservados. No afiliado con Uplift Games LLC ni Roblox Corporation.</p>
        </div>
      </div>
    </footer>
  `;
}
