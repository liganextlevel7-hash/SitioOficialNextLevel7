const CSV_USUARIOS          = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=961328720&single=true&output=csv';
const CSV_PARTIDOS_C        = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1362473459&single=true&output=csv';
const CSV_EQUIPOS_C         = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1894947293&single=true&output=csv';
const CSV_JUGADORES_C       = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1940220650&single=true&output=csv';
const CSV_PARTICIPACIONES_C = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=626975401&single=true&output=csv';
const CSV_EVENTOS_C         = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=645868286&single=true&output=csv';

let usuarioActual       = null;
let modoArbitro         = false;
let partidoActual       = null;
let todosJugadores      = [];
let todasParticipaciones= [];
let todosEquiposC       = [];
let todosPartidosC      = [];
let todosEventosC       = [];
let eventosRegistrados  = {};

function parseCSV(text) {
  const lines = text.replace(/\r/g,'').trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,''));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = []; let cur = '', inQ = false;
    for (let ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur=''; }
      else cur += ch;
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h,i) => obj[h] = (vals[i]||'').replace(/^"|"$/g,'').trim());
    return obj;
  });
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('partidos-section').style.display = 'block';
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('cedula-section').style.display = 'none';
  await cargarDatos();
  renderListaPartidos();
});

async function cargarDatos() {
  document.getElementById('lista-partidos-cedula').innerHTML = '<div style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">⏳ Cargando partidos...</div>';
  const [resP, resE, resJ, resPart, resEv] = await Promise.all([
    fetch(CSV_PARTIDOS_C), fetch(CSV_EQUIPOS_C),
    fetch(CSV_JUGADORES_C), fetch(CSV_PARTICIPACIONES_C),
    fetch(CSV_EVENTOS_C)
  ]);
  todosPartidosC       = parseCSV(await resP.text());
  todosEquiposC        = parseCSV(await resE.text());
  todosJugadores       = parseCSV(await resJ.text());
  todasParticipaciones = parseCSV(await resPart.text());
  todosEventosC        = parseCSV(await resEv.text());
}

// ===== LISTA DE PARTIDOS =====
function renderListaPartidos() {
  const eqMap = {};
  todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });

  const jugados     = todosPartidosC.filter(p => p.Estado?.trim() === 'Jugado');
  const programados = todosPartidosC.filter(p => p.Estado?.trim() === 'Programado');

  let html = '';

  // Botón modo árbitro
  html += `
  <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
    ${modoArbitro
      ? `<div style="display:flex;align-items:center;gap:10px;">
           <span style="font-size:12px;color:#39ff14;">🟢 Modo Árbitro: <b>${usuarioActual?.Nombre||'Árbitro'}</b></span>
           <button onclick="cerrarSesion()" style="padding:6px 12px;background:rgba(255,68,68,0.2);border:1px solid #ff4444;border-radius:8px;color:#ff4444;cursor:pointer;font-size:12px;">Salir</button>
         </div>`
      : `<button onclick="mostrarLogin()" style="padding:8px 16px;background:rgba(57,255,20,0.1);border:1px solid #39ff14;border-radius:8px;color:#39ff14;cursor:pointer;font-size:13px;font-weight:bold;letter-spacing:1px;">🔐 Modo Árbitro</button>`
    }
  </div>`;

  if (programados.length) {
    html += `<div style="color:#39ff14;font-size:12px;letter-spacing:2px;margin-bottom:12px;text-transform:uppercase;">🟢 Programados</div>`;
    programados.forEach(p => {
      const eqL = eqMap[String(p.Equipo_Local).trim()] || {};
      const eqV = eqMap[String(p.Equipo_Visita).trim()] || {};
      const badge = modoArbitro
        ? `<div style="font-size:11px;color:rgba(57,255,20,0.7);margin-top:6px;letter-spacing:1px;">📝 LLENAR CÉDULA →</div>`
        : `<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:6px;letter-spacing:1px;">👁 VER CÉDULA →</div>`;
      html += `
      <div onclick="abrirCedula('${p.ID_Partido}')" style="
        background:${modoArbitro ? 'rgba(57,255,20,0.07)' : 'rgba(255,255,255,0.04)'};
        border:1px solid ${modoArbitro ? 'rgba(57,255,20,0.3)' : 'rgba(255,255,255,0.1)'};
        border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;transition:0.2s;
      " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="${eqL.URL||''}" style="width:36px;height:36px;object-fit:contain;">
            <span style="font-size:13px;font-weight:700;color:#fff;">${eqL.Nombre||'?'}</span>
          </div>
          <span style="color:#ffd700;font-weight:700;font-size:13px;">VS</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:13px;font-weight:700;color:#fff;">${eqV.Nombre||'?'}</span>
            <img src="${eqV.URL||''}" style="width:36px;height:36px;object-fit:contain;">
          </div>
        </div>
        <div style="display:flex;gap:16px;margin-top:6px;font-size:11px;color:rgba(255,255,255,0.4);">
          ${p.Jornada ? `<span>🏆 Jornada ${p.Jornada}</span>` : ''}
          ${p.Fecha   ? `<span>📅 ${p.Fecha}</span>` : ''}
          ${p.Cancha  ? `<span>📍 ${p.Cancha}</span>` : ''}
        </div>
        ${badge}
      </div>`;
    });
  }

  if (jugados.length) {
    html += `<div style="color:rgba(255,255,255,0.4);font-size:12px;letter-spacing:2px;margin:20px 0 12px;text-transform:uppercase;">📁 Jugados</div>`;
    jugados.forEach(p => {
      const eqL = eqMap[String(p.Equipo_Local).trim()] || {};
      const eqV = eqMap[String(p.Equipo_Visita).trim()] || {};
      html += `
      <div onclick="abrirCedula('${p.ID_Partido}')" style="
        background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);
        border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;transition:0.2s;
      " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="${eqL.URL||''}" style="width:32px;height:32px;object-fit:contain;">
            <span style="font-size:12px;color:rgba(255,255,255,0.7);">${eqL.Nombre||'?'}</span>
          </div>
          <span style="color:#d4f030;font-weight:900;font-size:18px;">${p.Goles_Local} - ${p.Goles_Visita}</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:rgba(255,255,255,0.7);">${eqV.Nombre||'?'}</span>
            <img src="${eqV.URL||''}" style="width:32px;height:32px;object-fit:contain;">
          </div>
        </div>
        <div style="display:flex;gap:16px;margin-top:6px;font-size:11px;color:rgba(255,255,255,0.3);">
          ${p.Jornada ? `<span>🏆 Jornada ${p.Jornada}</span>` : ''}
          ${p.Fecha   ? `<span>📅 ${p.Fecha}</span>` : ''}
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.25);margin-top:4px;letter-spacing:1px;">👁 VER CÉDULA →</div>
      </div>`;
    });
  }

  if (!html) html = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px;">No hay partidos disponibles</div>';
  document.getElementById('lista-partidos-cedula').innerHTML = html;
}

// ===== LOGIN =====
function mostrarLogin() {
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('login-section').scrollIntoView({ behavior:'smooth' });
}

async function iniciarSesion() {
  const user  = document.getElementById('login-user').value.trim();
  const pass  = document.getElementById('login-pass').value.trim();
  const errEl = document.getElementById('login-error');
  errEl.textContent = '⏳ Verificando...';
  try {
    const res = await fetch(CSV_USUARIOS);
    const usuarios = parseCSV(await res.text());
    const found = usuarios.find(u =>
      u.UsuarioID?.trim() === user &&
      u.Contraseña?.trim() === pass &&
      (u.Perfil?.trim() === 'Arbitro' || u.Perfil?.trim() === 'Desarrollador')
    );
    if (!found) { errEl.textContent = '❌ Usuario o contraseña incorrectos'; return; }
    usuarioActual = found;
    modoArbitro   = true;
    errEl.textContent = '';
    document.getElementById('login-section').style.display = 'none';
    renderListaPartidos();
  } catch(e) {
    errEl.textContent = '❌ Error: ' + e.message;
  }
}

function cerrarSesion() {
  usuarioActual = null;
  modoArbitro   = false;
  renderListaPartidos();
}

// ===== ABRIR CÉDULA =====
function abrirCedula(idPartido) {
  partidoActual = todosPartidosC.find(p => String(p.ID_Partido).trim() === String(idPartido));
  if (!partidoActual) return;
  eventosRegistrados = {};

  const eqMap = {};
  todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });
  const eqL = eqMap[String(partidoActual.Equipo_Local).trim()]  || {};
  const eqV = eqMap[String(partidoActual.Equipo_Visita).trim()] || {};
  const estado = partidoActual.Estado?.trim();
  const esEditable = modoArbitro && estado === 'Programado';

  // Header
  document.getElementById('cedula-header').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <img src="${eqL.URL||''}" style="width:60px;height:60px;object-fit:contain;">
        <div style="font-size:13px;font-weight:700;color:#fff;text-align:center;text-transform:uppercase;">${eqL.Nombre||'?'}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:10px;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;">${partidoActual.Jornada ? 'Jornada '+partidoActual.Jornada : 'Jornada ?'}</div>
        <div style="font-size:${estado==='Jugado'?'28':'22'}px;font-weight:900;color:${estado==='Jugado'?'#d4f030':'#ffd700'};margin:4px 0;">
          ${estado==='Jugado' ? `${partidoActual.Goles_Local} - ${partidoActual.Goles_Visita}` : 'VS'}
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);">${partidoActual.Fecha||''} · ${partidoActual.Cancha||''}</div>
        ${estado==='Jugado' && partidoActual.Ganado_Por ? `<div style="font-size:11px;color:#ffd700;margin-top:4px;">${partidoActual.Ganado_Por}</div>` : ''}
        <div style="font-size:10px;color:${esEditable?'#39ff14':'rgba(255,255,255,0.3)'};margin-top:6px;letter-spacing:1px;">${esEditable?'✏️ MODO EDICIÓN':'👁 SOLO CONSULTA'}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <img src="${eqV.URL||''}" style="width:60px;height:60px;object-fit:contain;">
        <div style="font-size:13px;font-weight:700;color:#fff;text-align:center;text-transform:uppercase;">${eqV.Nombre||'?'}</div>
      </div>
    </div>`;

  // Jugadores
  const partLocal  = todasParticipaciones.filter(p => String(p.Partido).trim() === String(idPartido) && String(p.Equipo).trim() === String(partidoActual.Equipo_Local).trim());
  const partVisita = todasParticipaciones.filter(p => String(p.Partido).trim() === String(idPartido) && String(p.Equipo).trim() === String(partidoActual.Equipo_Visita).trim());

  function getEventosJugador(jugId) {
    const evs = todosEventosC.filter(e => String(e.Partido).trim() === String(idPartido) && String(e.Jugador).trim() === String(jugId).trim());
    return {
      goles:    evs.filter(e => e.Tipo_Evento === 'Gol').length,
      amarilla: evs.some(e => e.Tipo_Evento === 'Amarilla'),
      roja:     evs.some(e => e.Tipo_Evento === 'Roja')
    };
  }

  function jugadorHTML(part) {
    const jug = todosJugadores.find(j => String(j.ID_Jugador).trim() === String(part.Jugador).trim()) || {};
    const id  = String(part.Jugador).trim();
    const ev  = esEditable ? { goles:0, amarilla:false, roja:false } : getEventosJugador(id);
    if (esEditable) eventosRegistrados[id] = { goles:0, amarilla:false, roja:false };

    const iconos = !esEditable
      ? '⚽'.repeat(ev.goles) + (ev.amarilla ? '🟡' : '') + (ev.roja ? '🔴' : '')
      : '';

    return `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 4px;border-bottom:0.5px solid rgba(255,255,255,0.06);">
      <span style="font-size:12px;font-weight:700;color:rgba(57,255,20,0.6);min-width:24px;">${jug.Numero||'-'}</span>
      <span style="font-size:12px;color:#fff;flex:1;">${jug.Nombre||'#'+id}</span>
      ${esEditable ? `
        <div style="display:flex;gap:5px;align-items:center;">
          <button onclick="quitarGol('${id}')" style="background:rgba(255,255,255,0.1);border:none;border-radius:4px;color:#fff;width:22px;height:22px;cursor:pointer;font-size:13px;">−</button>
          <span id="goles-${id}" style="font-size:13px;font-weight:900;color:#d4f030;min-width:14px;text-align:center;">0</span>⚽
          <button onclick="agregarGol('${id}')" style="background:rgba(57,255,20,0.2);border:1px solid #39ff14;border-radius:4px;color:#39ff14;width:22px;height:22px;cursor:pointer;font-size:13px;">+</button>
          <button id="btn-am-${id}" onclick="toggleAmarilla('${id}')" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,215,0,0.3);border-radius:4px;width:26px;height:26px;cursor:pointer;font-size:13px;">🟡</button>
          <button id="btn-rj-${id}" onclick="toggleRoja('${id}')" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,68,68,0.3);border-radius:4px;width:26px;height:26px;cursor:pointer;font-size:13px;">🔴</button>
        </div>` : `
        <span style="font-size:13px;">${iconos || ''}</span>`}
    </div>`;
  }

  const htmlL = partLocal.length  ? partLocal.map(jugadorHTML).join('')  : '<div style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;padding:10px;">Sin jugadores</div>';
  const htmlV = partVisita.length ? partVisita.map(jugadorHTML).join('') : '<div style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;padding:10px;">Sin jugadores</div>';

  document.getElementById('cedula-equipos').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div>
        <div style="font-size:11px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;text-align:center;">${eqL.Nombre||'Local'}</div>
        ${htmlL}
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;text-align:center;">${eqV.Nombre||'Visita'}</div>
        ${htmlV}
      </div>
    </div>`;

  // Mostrar/ocultar sección firma y botones según modo
  document.getElementById('firma-section').style.display  = esEditable ? 'block' : 'none';
  document.getElementById('botones-section').style.display = esEditable ? 'block' : 'none';

  document.getElementById('partidos-section').style.display = 'none';
  document.getElementById('cedula-section').style.display   = 'block';
  if (esEditable) iniciarFirma();
}

// ===== EVENTOS JUGADORES =====
function agregarGol(id) {
  eventosRegistrados[id].goles++;
  document.getElementById(`goles-${id}`).textContent = eventosRegistrados[id].goles;
}
function quitarGol(id) {
  if (eventosRegistrados[id].goles > 0) {
    eventosRegistrados[id].goles--;
    document.getElementById(`goles-${id}`).textContent = eventosRegistrados[id].goles;
  }
}
function toggleAmarilla(id) {
  eventosRegistrados[id].amarilla = !eventosRegistrados[id].amarilla;
  const btn = document.getElementById(`btn-am-${id}`);
  btn.style.background = eventosRegistrados[id].amarilla ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)';
  btn.style.border     = eventosRegistrados[id].amarilla ? '1px solid #ffd700' : '1px solid rgba(255,215,0,0.3)';
}
function toggleRoja(id) {
  eventosRegistrados[id].roja = !eventosRegistrados[id].roja;
  const btn = document.getElementById(`btn-rj-${id}`);
  btn.style.background = eventosRegistrados[id].roja ? 'rgba(255,68,68,0.3)' : 'rgba(255,255,255,0.05)';
  btn.style.border     = eventosRegistrados[id].roja ? '1px solid #ff4444' : '1px solid rgba(255,68,68,0.3)';
}

// ===== FIRMA =====
function iniciarFirma() {
  const canvas = document.getElementById('firma-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#39ff14';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  let drawing = false;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) return { x:(e.touches[0].clientX-rect.left)*scaleX, y:(e.touches[0].clientY-rect.top)*scaleY };
    return { x:(e.clientX-rect.left)*scaleX, y:(e.clientY-rect.top)*scaleY };
  }

  canvas.onmousedown  = canvas.ontouchstart = e => { e.preventDefault(); drawing=true; const p=getPos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); };
  canvas.onmousemove  = canvas.ontouchmove  = e => { e.preventDefault(); if(!drawing)return; const p=getPos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); };
  canvas.onmouseup    = canvas.ontouchend   = () => drawing=false;
  canvas.onmouseleave = () => drawing=false;
}

function limpiarFirma() {
  const canvas = document.getElementById('firma-canvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// ===== GUARDAR =====
async function guardarCedula() {
  const statusEl = document.getElementById('cedula-status');
  const arbitroNombre = document.getElementById('arbitro-nombre').value.trim();
  if (!arbitroNombre) { statusEl.textContent = '⚠️ Escribe el nombre del árbitro'; return; }

  const eqMap = {};
  todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });
  const idCedula = 'CED-' + Date.now();
  const rows = [];

  for (const [jugId, ev] of Object.entries(eventosRegistrados)) {
    const jug = todosJugadores.find(j => String(j.ID_Jugador).trim() === jugId) || {};
    const eqNombre = eqMap[String(jug.Equipo||'').trim()]?.Nombre || '';
    for (let g=0; g<ev.goles; g++) rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eqNombre, 'Gol']);
    if (ev.amarilla) rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eqNombre, 'Amarilla']);
    if (ev.roja)     rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eqNombre, 'Roja']);
  }

  if (!rows.length) { statusEl.textContent = '⚠️ No hay eventos registrados'; return; }

  const header = 'ID_Cedula\tID_Partido\tID_Jugador\tNombre_Jugador\tEquipo\tTipo_Evento';
  const csvData = rows.map(r => r.join('\t')).join('\n');

  const wrap = document.getElementById('cedula-status').parentNode;
  const existing = wrap.querySelector('.cedula-data-wrap');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = 'cedula-data-wrap';
  div.innerHTML = `
    <pre style="background:rgba(0,0,0,0.5);border:1px solid #39ff14;border-radius:8px;padding:12px;color:#b8f030;font-size:11px;overflow-x:auto;margin-top:12px;">${header}\n${csvData}</pre>
    <button onclick="navigator.clipboard.writeText(document.querySelector('.cedula-data-wrap pre').textContent).then(()=>this.textContent='✅ Copiado!')"
      style="margin-top:8px;padding:8px 14px;background:rgba(57,255,20,0.2);border:1px solid #39ff14;border-radius:8px;color:#39ff14;cursor:pointer;font-size:12px;">
      📋 Copiar para pegar en Sheets
    </button>`;
  wrap.appendChild(div);
  statusEl.textContent = `✅ ${rows.length} evento(s) listos`;
}

// ===== PDF =====
async function descargarPDF() {
  const statusEl = document.getElementById('cedula-status');
  const arbitroNombre = document.getElementById('arbitro-nombre').value.trim() || 'Sin nombre';
  statusEl.textContent = '⏳ Generando PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    const eqMap = {};
    todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });
    const eqL = eqMap[String(partidoActual.Equipo_Local).trim()]  || {};
    const eqV = eqMap[String(partidoActual.Equipo_Visita).trim()] || {};

    doc.setFillColor(8,12,20); doc.rect(0,0,210,297,'F');
    doc.setFillColor(15,30,10); doc.rect(0,0,210,30,'F');
    doc.setTextColor(184,240,48); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('CÉDULA ARBITRAL', 105, 12, {align:'center'});
    doc.setFontSize(10); doc.setTextColor(150,200,80);
    doc.text('LIGA NEXT LEVEL 7', 105, 20, {align:'center'});
    doc.setFontSize(9); doc.setTextColor(100,150,60);
    doc.text(`Partido #${partidoActual.ID_Partido}  ·  ${partidoActual.Jornada?'Jornada '+partidoActual.Jornada:''}  ·  ${partidoActual.Fecha||''}  ·  ${partidoActual.Cancha||''}`, 105, 27, {align:'center'});

    doc.setFillColor(15,25,10); doc.rect(0,32,210,18,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont('helvetica','bold');
    doc.text((eqL.Nombre||'Local').toUpperCase(), 52, 43, {align:'center'});
    doc.setTextColor(212,240,48); doc.setFontSize(16);
    doc.text('VS', 105, 44, {align:'center'});
    doc.setTextColor(255,255,255); doc.setFontSize(13);
    doc.text((eqV.Nombre||'Visita').toUpperCase(), 158, 43, {align:'center'});

    const idPartido = String(partidoActual.ID_Partido);
    const partLocal  = todasParticipaciones.filter(p => String(p.Partido).trim()===idPartido && String(p.Equipo).trim()===String(partidoActual.Equipo_Local).trim());
    const partVisita = todasParticipaciones.filter(p => String(p.Partido).trim()===idPartido && String(p.Equipo).trim()===String(partidoActual.Equipo_Visita).trim());

    let y = 58;
    doc.setFontSize(8); doc.setTextColor(100,200,60); doc.setFont('helvetica','bold');
    doc.text('# JUGADOR', 15, y); doc.text('EVENTOS', 72, y);
    doc.text('# JUGADOR', 115, y); doc.text('EVENTOS', 172, y);
    y+=4; doc.setDrawColor(57,255,20); doc.line(10,y,200,y); y+=5;

    const maxRows = Math.max(partLocal.length, partVisita.length);
    for (let i=0; i<maxRows; i++) {
      if (y>240) { doc.addPage(); doc.setFillColor(8,12,20); doc.rect(0,0,210,297,'F'); y=20; }
      if (i%2===0) { doc.setFillColor(15,22,10); doc.rect(10,y-4,90,8,'F'); doc.rect(110,y-4,90,8,'F'); }

      function renderJugPDF(part, xBase) {
        if (!part) return;
        const jug = todosJugadores.find(j => String(j.ID_Jugador).trim()===String(part.Jugador).trim()) || {};
        const id  = String(part.Jugador).trim();
        const ev  = eventosRegistrados[id] || { goles:0, amarilla:false, roja:false };
        doc.setFont('helvetica','normal'); doc.setFontSize(8);
        doc.setTextColor(184,240,48); doc.text(jug.Numero||'-', xBase, y);
        doc.setTextColor(220,220,220); doc.text((jug.Nombre||'').substring(0,20), xBase+8, y);
        const iconStr = '⚽'.repeat(ev.goles) + (ev.amarilla?'🟡':'') + (ev.roja?'🔴':'');
        if (iconStr) { doc.setTextColor(255,215,0); doc.text(iconStr, xBase+62, y); }
      }

      renderJugPDF(partLocal[i], 15);
      renderJugPDF(partVisita[i], 115);
      y += 8;
    }

    y += 10;
    doc.setDrawColor(57,255,20); doc.line(10,y,200,y); y+=8;
    doc.setTextColor(184,240,48); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text('FIRMA DEL ÁRBITRO', 105, y, {align:'center'}); y+=6;

    const canvas = document.getElementById('firma-canvas');
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', 55, y, 100, 30); y+=35;

    doc.setTextColor(200,200,200); doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.text(arbitroNombre, 105, y, {align:'center'}); y+=5;
    doc.setTextColor(100,150,60); doc.setFontSize(8);
    doc.text(new Date().toLocaleString('es-MX'), 105, y, {align:'center'});

    doc.save(`cedula_partido_${partidoActual.ID_Partido}.pdf`);
    statusEl.textContent = '✅ PDF descargado';
  } catch(e) {
    statusEl.textContent = '❌ Error: ' + e.message;
    console.error(e);
  }
}

function volverALista() {
  document.getElementById('cedula-section').style.display   = 'none';
  document.getElementById('partidos-section').style.display = 'block';
  partidoActual = null;
  eventosRegistrados = {};
}
