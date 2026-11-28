/*
  Instala este archivo junto al HTML del portal y agrega antes de </body>:
  <script src="./chatbot-next-level-7.js" defer></script>

  Opcional: define window.NextLevel7Chat antes de cargar el script.
  En "enlaces" agrega las rutas reales de tu portal.
  Puedes usar "partidos", "tabla", "pendientes" e "inscripciones".
  Ejemplo: window.NextLevel7Chat = { enlaces: { tabla: '#tabla' } }

  Para responder dentro del chat, agrega una función consultar(tipo, equipo).
  Debe devolver un texto o una promesa de texto. Devuelve null si no hay
  respuesta; el chat ofrecerá el enlace configurado y WhatsApp.
  Los tipos son "partidos", "tabla" y "pendientes".
  Consulta únicamente información pública de la liga.
*/
(() => {
  if (document.querySelector('next-level-7-chat')) return;
  const config = window.NextLevel7Chat || {};
  const actions = [
    ['partidos', 'Próximo partido', 'consultar el próximo partido'],
    ['tabla', 'Tabla de posiciones', 'consultar la tabla de posiciones'],
    ['pendientes', 'Partidos pendientes', 'consultar los partidos pendientes'],
    ['inscripciones', 'Inscripciones', 'pedir información para inscribir un equipo'],
    ['renta', 'Rentar una cancha', 'consultar disponibilidad para rentar una cancha'],
    ['contacto', 'Hablar por WhatsApp', 'pedir información']
  ];

  const widget = document.createElement('next-level-7-chat');
  const root = widget.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      :host { all: initial; position: fixed; right: 16px; bottom: max(16px, env(safe-area-inset-bottom)); z-index: 10000; font: 15px/1.45 system-ui, sans-serif; color: #faf8ff; }
      * { box-sizing: border-box; }
      [hidden] { display: none !important; }
      button, input, a { font: inherit; }
      button, a { cursor: pointer; }
      button { border: 0; }
      button:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid #ddff76; outline-offset: 3px; }
      #open, .send { background: #d4ff56; color: #171221; border-radius: 24px; padding: 11px 16px; font-weight: 750; }
      #open { display: block; margin-left: auto; box-shadow: 0 6px 25px #0006; }
      section { width: min(360px, calc(100vw - 32px)); max-height: calc(100dvh - 34px); overflow: auto; background: #1d162a; border: 1px solid #655480; border-radius: 20px; box-shadow: 0 12px 40px #0007; }
      header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; color: #e0ff88; background: #312243; }
      #close { border-radius: 8px; background: transparent; color: white; font-size: 23px; min-width: 40px; min-height: 40px; }
      .body { padding: 16px; }
      p { margin: 0 0 12px; }
      nav { display: flex; flex-wrap: wrap; gap: 8px; }
      nav button { background: #35274a; color: white; border: 1px solid #695681; border-radius: 14px; padding: 9px 12px; }
      nav button[aria-pressed=true] { border-color: #d4ff56; color: #d4ff56; }
      #answer { margin-top: 14px; white-space: pre-wrap; overflow-wrap: anywhere; }
      form { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
      input { min-width: 0; width: 100%; padding: 9px; border: 1px solid #a18cb9; border-radius: 8px; color: white; background: #1d162a; font-size: 16px; }
      a { display: block; width: fit-content; color: #d4ff56; padding: 7px 0; }
    </style>
    <button id="open" type="button" aria-controls="panel" aria-expanded="false">¿En qué te ayudo?</button>
    <section id="panel" aria-labelledby="title" hidden>
      <header><strong id="title">Asistente Next Level 7</strong><button id="close" type="button" aria-label="Cerrar chat">×</button></header>
      <div class="body">
        <p>¡Hola! ¿Qué quieres consultar?</p>
        <nav aria-label="Opciones del chat"></nav>
        <div id="answer" role="status"></div>
        <form hidden>
          <input aria-label="Nombre del equipo" placeholder="Nombre del equipo" required maxlength="100">
          <button class="send" type="submit">Buscar</button>
        </form>
        <a id="portal" hidden></a>
        <a id="whatsapp" target="_blank" rel="noopener noreferrer" hidden>Abrir WhatsApp</a>
      </div>
    </section>`;

  const open = root.querySelector('#open');
  const close = root.querySelector('#close');
  const panel = root.querySelector('section');
  const nav = root.querySelector('nav');
  const answer = root.querySelector('#answer');
  const form = root.querySelector('form');
  const input = root.querySelector('input');
  const portal = root.querySelector('#portal');
  const whatsapp = root.querySelector('#whatsapp');
  let selected;
  let request = 0;

  function toggle(visible) {
    panel.hidden = !visible;
    open.hidden = visible;
    open.setAttribute('aria-expanded', String(visible));
    (visible ? close : open).focus();
  }

  function showWhatsapp(action, team = '') {
    const message = 'Hola, Next Level 7. Quiero ' + action[2] + (team ? ' para el equipo ' + team : '') + '.';
    whatsapp.href = 'https://wa.me/522214211261?text=' + encodeURIComponent(message);
    whatsapp.hidden = false;
  }

  function showPortal(action) {
    portal.hidden = true;
    const href = config.enlaces?.[action[0]];
    if (!href) return;
    try {
      const url = new URL(href, location.href);
      if (!['https:', 'http:', 'file:'].includes(url.protocol)) return;
      portal.href = url.href;
      portal.textContent = 'Ver ' + action[1].toLocaleLowerCase('es-MX');
      portal.hidden = false;
    } catch {
      // WhatsApp sigue disponible si la ruta no es válida.
    }
  }

  function select(action, button) {
    request++;
    selected = action;
    nav.querySelector('[aria-pressed=true]')?.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', 'true');
    showPortal(action);
    showWhatsapp(action);
    form.hidden = !['partidos', 'tabla', 'pendientes'].includes(action[0]) || typeof config.consultar !== 'function';
    const messages = {
      inscripciones: 'Escríbenos para consultar los torneos abiertos y la inscripción.',
      renta: 'Cuéntanos qué fecha y hora buscas para confirmar disponibilidad.',
      contacto: 'Puedes escribirnos al 221 421 1261.'
    };
    answer.textContent = messages[action[0]] || (form.hidden
      ? (portal.hidden ? 'Pídenos la información por WhatsApp.' : 'Abre la sección del portal para ver la información.')
      : 'Escribe el nombre de tu equipo.');
    if (!form.hidden) input.focus();
  }

  for (const action of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action[1];
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => select(action, button));
    nav.append(button);
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const team = input.value.trim();
    if (!team) {
      answer.textContent = 'Escribe el nombre de tu equipo.';
      input.focus();
      return;
    }
    const current = ++request;
    showWhatsapp(selected, team);
    answer.textContent = 'Consultando…';
    try {
      const result = await config.consultar(selected[0], team);
      if (current !== request) return;
      answer.textContent = typeof result === 'string' && result.trim()
        ? result : 'No encontré información para ese equipo. Revisa el nombre o escríbenos.';
    } catch {
      if (current === request) answer.textContent = 'No pude consultar los datos en este momento. Puedes escribirnos por WhatsApp.';
    }
  });

  open.addEventListener('click', () => toggle(true));
  close.addEventListener('click', () => toggle(false));
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) toggle(false);
  });
  document.body.append(widget);
})();
