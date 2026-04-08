// ========================================
// Support Page
// ========================================

import { getCurrentUser } from '../utils/auth.js';
import { addSupportTicket } from '../utils/storage.js';
import { showToast, generateId } from '../utils/helpers.js';

export function renderSupport() {
  const user = getCurrentUser();

  return `
    <div class="container page-content animate-fade-up" style="max-width:900px;margin:0 auto">
      <div class="text-center mb-32">
        <h1 style="font-size:2rem">Centro de Soporte</h1>
        <p class="text-muted" style="max-width:500px;margin:8px auto 0">
          ¿Tienes preguntas o necesitas ayuda? Estamos aquí para ti 24/7
        </p>
      </div>

      <!-- Quick help cards -->
      <div class="grid-3 mb-32">
        <div class="card">
          <div class="card-body text-center" style="padding:28px 20px">
            <div style="width:48px;height:48px;border-radius:50%;background:var(--pastel-blue);color:var(--pastel-blue-text);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:1.3rem;font-weight:700">
              ?
            </div>
            <h4 style="margin-bottom:4px">Preguntas Frecuentes</h4>
            <p class="text-sm text-muted">Respuestas rápidas a las dudas más comunes</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body text-center" style="padding:28px 20px">
            <div style="width:48px;height:48px;border-radius:50%;background:var(--pastel-green);color:var(--pastel-green-text);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:1.3rem;font-weight:700">
              ✓
            </div>
            <h4 style="margin-bottom:4px">Seguridad</h4>
            <p class="text-sm text-muted">Cómo protegemos tus transacciones</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body text-center" style="padding:28px 20px">
            <div style="width:48px;height:48px;border-radius:50%;background:var(--pastel-purple);color:var(--pastel-purple-text);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:1.3rem;font-weight:700">
              @
            </div>
            <h4 style="margin-bottom:4px">Contacto</h4>
            <p class="text-sm text-muted">Envíanos un ticket de soporte</p>
          </div>
        </div>
      </div>

      <div class="grid-2" style="gap:32px">
        <!-- FAQ Accordion -->
        <div>
          <h2 style="font-size:1.3rem;margin-bottom:16px">Preguntas Frecuentes</h2>
          
          <div class="accordion-item">
            <button class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
              ¿Cómo comprar una pet?
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                1. Explora el marketplace y encuentra la pet que deseas.<br>
                2. Haz clic en la pet para ver los detalles.<br>
                3. Pulsa "Comprar" y selecciona tu método de pago (PayPal o QR).<br>
                4. Realiza el pago y notifica al vendedor.<br>
                5. El vendedor confirmará tu pago y coordinará la entrega in-game.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <button class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
              ¿Cómo vender mis pets?
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                1. Regístrate y ve a tu perfil.<br>
                2. Solicita ser vendedor en la pestaña "Vendedor".<br>
                3. Nuestro equipo revisará tu solicitud (normalmente en menos de 24h).<br>
                4. Una vez aprobado, configura tu PIN y email de PayPal.<br>
                5. ¡Añade tus pets al marketplace y empieza a vender!
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <button class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
              ¿Es seguro comprar aquí?
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                ¡Absolutamente! Todos nuestros vendedores son verificados manualmente por nuestro equipo. 
                Además, cada transacción requiere confirmación del vendedor, lo que garantiza que 
                ambas partes están de acuerdo. En caso de problemas, nuestro equipo de soporte está 
                disponible 24/7 para resolver cualquier disputa.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <button class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
              ¿Qué métodos de pago aceptan?
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                Actualmente aceptamos pagos por PayPal y código QR. El pago va directamente al 
                vendedor, y este debe confirmar que lo ha recibido para completar la transacción. 
                Próximamente añadiremos más métodos de pago.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <button class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
              ¿Qué pasa si no recibo mi pet?
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                Si el vendedor confirmó el pago pero no entregó la pet, contacta inmediatamente a 
                nuestro equipo de soporte. Investigaremos el caso y tomaremos las medidas necesarias, 
                incluyendo la posibilidad de reembolso y suspensión del vendedor.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <button class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
              ¿Cómo funciona la calculadora de trades?
            </button>
            <div class="accordion-body">
              <div class="accordion-content">
                La calculadora usa valores basados en la demanda y disponibilidad de cada pet en la 
                comunidad. Añade las pets de cada lado del trade y te dirá si es Win (te favorece), 
                Fair (justo) o Lose (no te favorece). Los valores se actualizan regularmente.
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div>
          <h2 style="font-size:1.3rem;margin-bottom:16px">Enviar Ticket de Soporte</h2>
          <div class="card">
            <div class="card-body">
              <form id="support-form" onsubmit="return false">
                <div class="form-group">
                  <label class="form-label">Nombre</label>
                  <input type="text" class="form-input" id="sup-name" value="${user?.username || ''}" placeholder="Tu nombre" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-input" id="sup-email" value="${user?.email || ''}" placeholder="tu@email.com" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Asunto</label>
                  <select class="form-select" id="sup-subject" required>
                    <option value="">Selecciona un asunto...</option>
                    <option value="Problema con un pedido">Problema con un pedido</option>
                    <option value="Problema con el pago">Problema con el pago</option>
                    <option value="Reportar a un usuario">Reportar a un usuario</option>
                    <option value="Problema con mi cuenta">Problema con mi cuenta</option>
                    <option value="Sugerencia">Sugerencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Mensaje</label>
                  <textarea class="form-textarea" id="sup-message" placeholder="Describe tu problema en detalle..." required style="min-height:140px"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">
                  Enviar Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initSupport() {
  const form = document.getElementById('support-form');
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('sup-name').value.trim();
    const email = document.getElementById('sup-email').value.trim();
    const subject = document.getElementById('sup-subject').value;
    const message = document.getElementById('sup-message').value.trim();

    if (!name || !email || !subject || !message) {
      showToast('Completa todos los campos', 'warning');
      return;
    }

    const user = getCurrentUser();
    addSupportTicket({
      id: 'tkt_' + generateId(),
      userId: user?.id || null,
      name,
      email,
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString()
    });

    showToast('¡Ticket enviado! Te responderemos lo antes posible 📩', 'success');
    form.reset();
  };
}
