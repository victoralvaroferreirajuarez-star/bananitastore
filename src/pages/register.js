// ========================================
// Register Page
// ========================================

import { register } from '../utils/auth.js';
import { showToast } from '../utils/helpers.js';
import { navigate } from '../utils/router.js';

export function renderRegister() {
  return `
    <div class="auth-container animate-fade-up">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="/logo.png" alt="BananaStore">
          <h2>Crear cuenta</h2>
          <p>Únete a BananaStore.gg</p>
        </div>

        <form id="register-form" onsubmit="return false">
          <div class="form-group">
            <label class="form-label">Nombre de usuario</label>
            <input type="text" class="form-input" id="reg-username" placeholder="TuNombre" required minlength="3" maxlength="20">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="reg-email" placeholder="tu@email.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-input" id="reg-password" placeholder="Mínimo 6 caracteres" required minlength="6">
          </div>
          <div class="form-group">
            <label class="form-label">Confirmar contraseña</label>
            <input type="password" class="form-input" id="reg-confirm" placeholder="Repite tu contraseña" required>
          </div>
          <div class="form-group">
            <label class="checkbox-group">
              <input type="checkbox" class="checkbox-input" id="reg-terms" required>
              <span class="text-sm">Acepto los <a style="color:var(--banana-dark);font-weight:600">Términos de Servicio</a></span>
            </label>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="register-btn">
            Crear Cuenta
          </button>
        </form>

        <div class="auth-footer">
          ¿Ya tienes cuenta? <a onclick="window.location.hash='/login'">Inicia sesión</a>
        </div>
      </div>
    </div>
  `;
}

export function initRegister() {
  const form = document.getElementById('register-form');
  const button = document.getElementById('register-btn');
  if (!form) return;

  const submitRegister = (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const terms = document.getElementById('reg-terms').checked;

    if (!username || !email || !password || !confirm) {
      showToast('Completa todos los campos', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }
    if (password !== confirm) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    if (!terms) {
      showToast('Debes aceptar los términos de servicio', 'warning');
      return;
    }

    const result = register(username, email, password);
    if (result.success) {
      showToast('¡Cuenta creada exitosamente! 🎉', 'success');
      navigate('/');
    } else {
      showToast(result.message, 'error');
    }
  };

  form.onsubmit = submitRegister;
  button?.addEventListener('click', submitRegister);
}
