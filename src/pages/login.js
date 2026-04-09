// ========================================
// Login Page
// ========================================

import { login } from '../utils/auth.js';
import { showToast } from '../utils/helpers.js';
import { navigate } from '../utils/router.js';

export function renderLogin() {
  return `
    <div class="auth-container animate-fade-up">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="/logo.png" alt="BananitaShop">
          <h2>Bienvenido de vuelta</h2>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        <form id="login-form" onsubmit="return false">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="login-email" placeholder="tu@email.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-input" id="login-password" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-btn">
            Iniciar Sesión
          </button>
        </form>

        <div class="auth-footer">
          ¿No tienes cuenta? <a onclick="window.location.hash='/register'">Regístrate aquí</a>
        </div>
      </div>
    </div>
  `;
}

export function initLogin() {
  const form = document.getElementById('login-form');
  const button = document.getElementById('login-btn');
  if (!form) return;

  const submitLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showToast('Completa todos los campos', 'warning');
      return;
    }

    const result = login(email, password);
    if (result.success) {
      showToast(`¡Bienvenido, ${result.user.username}!`, 'success');
      navigate('/');
    } else {
      showToast(result.message, 'error');
    }
  };

  form.onsubmit = submitLogin;
  button?.addEventListener('click', submitLogin);
}
