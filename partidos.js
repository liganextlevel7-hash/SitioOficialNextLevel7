const CSV_PARTIDOS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1362473459&single=true&output=csv';
const CSV_EQUIPOS  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1894947293&single=true&output=csv';
const CSV_JUGADORES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1940220650&single=true&output=csv';
const CSV_PARTICIPACIONES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=626975401&single=true&output=csv';
const CSV_EVENTOS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=645868286&single=true&output=csv';
const CSV_EQUIPOSLOGIN = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1768443342&single=true&output=csv';
const FB_BASE = 'https://liga-next-level-7-default-rtdb.firebaseio.com';

let todosPartidos = [], todosEquipos = [], todosJugadores = [], todasParticipaciones = [], todosEventos = [];
let ultimosFiltrados = [];
let CLAVES_EQUIPOS = {}; // ID_Equipo -> contraseña actual (hoja EquiposLogin + cambios en Firebase)
let S_CONFIRM = {};      // ID_Partido -> { local:true/false, visita:true/false }

async function cargarClavesEquipos() {
  try {
    const texto = await (await fetch(CSV_EQUIPOSLOGIN)).text();
    const filas = parseCSV(texto);
    const mapa = {};
    filas.forEach(f => { if (f['ID_Equipo']) mapa[String(f['ID_Equipo']).trim()] = f['Contraseña'] || f['Contrasena'] || ''; });
    try {
      const overrides = await (await fetch(FB_BASE + '/passwordOverrides.json')).json();
      if (overrides) Object.keys(overrides).forEach(id => { mapa[String(id)] = overrides[id]; });
    } catch (eOv) { /* seguimos con las de la hoja si Firebase falla */ }
    CLAVES_EQUIPOS = mapa;
  } catch (e) { console.error('No se pudieron cargar las contraseñas de equipos:', e); }
}

async function cargarConfirmaciones() {
  try { S_CONFIRM = (await (await fetch(FB_BASE + '/confirmaciones.json')).json()) || {}; }
  catch (e) { console.error('No se pudieron leer las confirmaciones:', e); }
}

// ---- Aviso por WhatsApp (CallMeBot) ----
const WHATSAPP_PHONE = '5212217613594';
const WHATSAPP_APIKEY = '2019087';
function avisarWhatsApp(texto) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(texto)}&apikey=${WHATSAPP_APIKEY}`;
  fetch(url).catch(() => { /* si falla el aviso, no interrumpimos el flujo normal */ });
}

async function confirmarAsistencia(idPartido, lado, idEquipo, nombreEquipo) {
  const inputId = `clave-${idPartido}-${lado}`;
  const clave = (document.getElementById(inputId)?.value || '').trim();
  if (!clave) { alert('Escribe la contraseña de ' + nombreEquipo + '.'); return; }
  const claveReal = CLAVES_EQUIPOS[String(idEquipo)] || '';
  if (clave.toUpperCase() !== claveReal.trim().toUpperCase()) {
    alert('Contraseña incorrecta para ' + nombreEquipo + '.');
    return;
  }
  try {
    await fetch(`${FB_BASE}/confirmaciones/${idPartido}/${lado}.json`, { method: 'PUT', body: JSON.stringify(true) });
    await cargarConfirmaciones();
    renderStack(ultimosFiltrados);

    const partido = todosPartidos.find(p => String(p['ID_Partido']) === String(idPartido));
    const jornadaTxt = partido?.Jornada ? `Jornada ${partido.Jornada}` : '';
    avisarWhatsApp(`✅ Confirmación de asistencia\nEquipo: ${nombreEquipo}\n${jornadaTxt}`);
  } catch (e) { alert('No se pudo guardar, revisa tu conexión.'); }
}

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,''));
  return lines.slice(1).filter(line => line.trim() !== '').map(line => {
    const vals = []; let cur = '', inQ = false;
    for (let ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h,i) => obj[h] = (vals[i]||'').replace(/^"|"$/g,'').trim());
    return obj;
  });
}

function formatHora(t) {
  if (!t) return '';
  const parts = t.split(':');
  let h = parseInt(parts[0]);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function cambiarFiltro() {
  const tipo = document.getElementById('filterTipo').value;
  document.getElementById('groupJornada').style.display = tipo === 'jornada' ? 'flex' : 'none';
  document.getElementById('groupFecha').style.display = tipo === 'fecha' ? 'flex' : 'none';
  document.getElementById('groupEquipo').style.display = tipo === 'equipo' ? 'flex' : 'none';
  document.getElementById('statusMsg').textContent = 'Selecciona opción y presiona Cargar Datos';
  document.getElementById('stackContainer').innerHTML = '<div class="empty-msg">CARGA LOS DATOS PARA VER LOS PARTIDOS</div>';
}

function poblarSelectores() {
  // Todos los partidos sin filtrar por vuelta
  const base = todosPartidos;

  const jornadas = [...new Set(base.filter(p => p['Jornada']).map(p => Number(p['Jornada'])))].sort((a,b)=>a-b);
  const selJornada = document.getElementById('filterJornada');
  selJornada.innerHTML = '<option value="">— Selecciona —</option>';
  jornadas.forEach(j => selJornada.innerHTML += `<option value="${j}">Jornada ${j}</option>`);

  const fechas = [...new Set(base.filter(p => p['Fecha'] && p['Fecha'].trim() !== '').map(p => p['Fecha'].trim()))];
  const selFecha = document.getElementById('filterFecha');
  selFecha.innerHTML = '<option value="">— Selecciona una fecha —</option>';
  fechas.forEach(f => selFecha.innerHTML += `<option value="${f}">${f}</option>`);

  const equiposSet = new Set();
  todosEquipos.forEach(e => { if (e['Nombre']) equiposSet.add(e['Nombre'].toUpperCase()); });
  const selEquipo = document.getElementById('filterEquipo');
  selEquipo.innerHTML = '<option value="">— Selecciona un equipo —</option>';
  Array.from(equiposSet).sort().forEach(eq => selEquipo.innerHTML += `<option value="${eq}">${eq}</option>`);
}

async function cargarFechasYEquipos() {
  try {
    const [resP, resE, resJ, resPart, resEv] = await Promise.all([
      fetch(CSV_PARTIDOS), fetch(CSV_EQUIPOS), fetch(CSV_JUGADORES),
      fetch(CSV_PARTICIPACIONES), fetch(CSV_EVENTOS)
    ]);
    todosPartidos        = parseCSV(await resP.text());
    todosEquipos         = parseCSV(await resE.text());
    todosJugadores       = parseCSV(await resJ.text());
    todasParticipaciones = parseCSV(await resPart.text());
    todosEventos         = parseCSV(await resEv.text());

    DESCANSOS = calcularDescansos();
    poblarSelectores();
    document.getElementById('statusMsg').textContent = 'Selecciona filtro y presiona Cargar Datos';
  } catch(e) {
    document.getElementById('statusMsg').textContent = '❌ Error: ' + e.message;
  }
}

// ===== POPUP =====
function crearPopupStyles() {
  if (document.getElementById('partido-popup-style')) return;
  const style = document.createElement('style');
  style.id = 'partido-popup-style';
  style.textContent = `
    .partido-popup-overlay {
      display: none; position: fixed; top:0; left:0; right:0; bottom:0;
      background: rgba(0,0,0,0.9); z-index: 99999;
      justify-content: center; align-items: center;
      padding: 16px; box-sizing: border-box;
    }
    .partido-popup-overlay.active { display: flex; }
    .partido-popup {
      background: #1c3204; border: 2px solid rgba(94,181,13,0.4);
      border-radius: 18px; width: 100%; max-width: 560px;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 0 30px rgba(94,181,13,0.2);
    }
    .pp-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 10px;
      border-bottom: 1px solid rgba(94,181,13,0.2);
      position: sticky; top:0; background: #1c3204; z-index: 1;
    }
    .pp-encuentro {
      font-size: 11px; font-weight: 700; color: rgba(94,181,13,0.6);
      letter-spacing: 2px; text-transform: uppercase; text-align: center; flex:1;
    }
    .pp-close {
      background: none; border: none; color: rgba(255,255,255,0.4);
      font-size: 22px; cursor: pointer; line-height:1; padding: 0 4px;
    }
    .pp-close:hover { color: #5eb50d; }
    .pp-teams {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; gap: 8px;
      border-bottom: 1px solid rgba(94,181,13,0.15);
    }
    .pp-team { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
    .pp-team-logo { width: 52px; height: 52px; object-fit: contain; }
    .pp-team-name { font-size: 11px; font-weight: 700; color: #fff; text-transform: uppercase; text-align: center; letter-spacing: 0.5px; }
    .pp-score { font-size: 38px; font-weight: 900; color: #ddc530; text-shadow: 0 0 12px rgba(94,181,13,0.5); letter-spacing: 2px; text-align: center; min-width: 90px; }
    .pp-score.programado { font-size: 20px; color: rgba(255,255,255,0.3); }
    .pp-players { display: grid; grid-template-columns: 1fr 1fr; gap: 0; padding: 0; }
    .pp-col { padding: 12px 10px; }
    .pp-col:first-child { border-right: 1px solid rgba(94,181,13,0.15); }
    .pp-col-title { font-size: 9px; font-weight: 700; color: rgba(94,181,13,0.5); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; text-align: center; }
    .pp-player { display: flex; align-items: center; gap: 6px; padding: 5px 4px; border-radius: 6px; border-bottom: 0.5px solid rgba(255,255,255,0.04); }
    .pp-player-num { font-size: 11px; font-weight: 700; color: rgba(94,181,13,0.6); min-width: 20px; text-align: right; }
    .pp-player-name { font-size: 11px; color: rgba(255,255,255,0.85); flex:1; }
    .pp-player-icons { display: flex; gap: 2px; flex-wrap: wrap; }
    .pp-icon { font-size: 11px; }
  `;
  document.head.appendChild(style);
}

function abrirPopupPartido(partido) {
  const estado = (partido.Estado || '').trim();
  if (estado === 'Pendiente') return;
  crearPopupStyles();
  let overlay = document.getElementById('partido-popup-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'partido-popup-overlay';
    overlay.id = 'partido-popup-overlay';
    overlay.innerHTML = `<div class="partido-popup" id="partido-popup-inner"></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrarPopupPartido(); });
  }
  const eqMap = {};
  todosEquipos.forEach(e => { eqMap[String(e['ID_Equipo']).trim()] = e; });
  const eqL = eqMap[String(partido.Equipo_Local).trim()] || {};
  const eqV = eqMap[String(partido.Equipo_Visita).trim()] || {};
  const nomL = (eqL['Nombre'] || `Equipo ${partido.Equipo_Local}`).toUpperCase();
  const nomV = (eqV['Nombre'] || `Equipo ${partido.Equipo_Visita}`).toUpperCase();
  const urlL = eqL['URL'] || '';
  const urlV = eqV['URL'] || '';
  const idPartido = String(partido.ID_Partido).trim();
  const gL = partido.Goles_Local !== '' ? partido.Goles_Local : '-';
  const gV = partido.Goles_Visita !== '' ? partido.Goles_Visita : '-';
  const jornada = partido.Jornada ? `Encuentro · Jornada ${partido.Jornada}` : 'Encuentro · Jornada ?';
  const partLocal  = todasParticipaciones.filter(p => String(p.Partido).trim() === idPartido && String(p.Equipo).trim() === String(partido.Equipo_Local).trim());
  const partVisita = todasParticipaciones.filter(p => String(p.Partido).trim() === idPartido && String(p.Equipo).trim() === String(partido.Equipo_Visita).trim());
  const eventosPartido = todosEventos.filter(e => String(e.Partido).trim() === idPartido);
  function getJugador(id) { return todosJugadores.find(j => String(j.ID_Jugador).trim() === String(id).trim()) || {}; }
  function renderJugadores(participaciones) {
    if (!participaciones.length) return '<div style="color:rgba(255,255,255,0.3);font-size:11px;text-align:center;padding:8px;">Sin registro</div>';
    return participaciones.map(p => {
      const jug = getJugador(p.Jugador);
      const nombre = jug.Nombre || `#${p.Jugador}`;
      const numero = jug.Numero || '';
      const evJug = eventosPartido.filter(e => String(e.Jugador).trim() === String(p.Jugador).trim());
      const goles = evJug.filter(e => e.Tipo_Evento === 'Gol').length;
      const amarillas = evJug.filter(e => e.Tipo_Evento === 'Amarilla').length;
      const rojas = evJug.filter(e => e.Tipo_Evento === 'Roja').length;
      const iconos = '⚽'.repeat(goles) + (amarillas ? '🟡' : '') + (rojas ? '🔴' : '');
      return `<div class="pp-player"><span class="pp-player-num">${numero}</span><span class="pp-player-name">${nombre}</span>${iconos ? `<span class="pp-player-icons">${iconos}</span>` : ''}</div>`;
    }).join('');
  }
  const scoreHTML = estado === 'Jugado'
    ? `<div class="pp-score">${gL} - ${gV}</div>`
    : `<div class="pp-score programado">VS</div>`;
  document.getElementById('partido-popup-inner').innerHTML = `
    <div class="pp-header">
      <div style="width:28px;"></div>
      <div class="pp-encuentro">${jornada}</div>
      <button class="pp-close" onclick="cerrarPopupPartido()">✕</button>
    </div>
    <div class="pp-teams">
      <div class="pp-team"><img class="pp-team-logo" src="${urlL}" onerror="this.style.opacity='0.3'"><div class="pp-team-name">${nomL}</div></div>
      ${scoreHTML}
      <div class="pp-team"><img class="pp-team-logo" src="${urlV}" onerror="this.style.opacity='0.3'"><div class="pp-team-name">${nomV}</div></div>
    </div>
    <div class="pp-players">
      <div class="pp-col"><div class="pp-col-title">${nomL}</div>${renderJugadores(partLocal)}</div>
      <div class="pp-col"><div class="pp-col-title">${nomV}</div>${renderJugadores(partVisita)}</div>
    </div>`;
  overlay.classList.add('active');
}

function cerrarPopupPartido() {
  const overlay = document.getElementById('partido-popup-overlay');
  if (overlay) overlay.classList.remove('active');
}

// ===== CARGAR DATOS =====
async function cargarDatos() {
  const tipo = document.getElementById('filterTipo').value;
  const statusEl = document.getElementById('statusMsg');
  statusEl.textContent = '⏳ Cargando datos...';
  try {
    const base = todosPartidos; // todos, sin filtro de vuelta
    let filtrados = [];
    if (tipo === 'jornada') {
      const jornada = document.getElementById('filterJornada').value;
      if (!jornada) { statusEl.textContent = '⚠️ Selecciona una jornada'; return; }
      filtrados = base.filter(p => p['Jornada'] && String(p['Jornada']).trim() === String(jornada));
      if (!filtrados.length) { statusEl.textContent = `⚠️ No hay partidos para Jornada ${jornada}`; return; }
      filtrados.sort((a,b) => Number(a.Jornada) - Number(b.Jornada) || Number(a.ID_Partido) - Number(b.ID_Partido));
    } else if (tipo === 'fecha') {
      const fecha = document.getElementById('filterFecha').value;
      if (!fecha) { statusEl.textContent = '⚠️ Selecciona una fecha'; return; }
      filtrados = base.filter(p => p['Fecha'] && p['Fecha'].trim() === fecha);
      if (!filtrados.length) { statusEl.textContent = `⚠️ No hay partidos para el ${fecha}`; return; }
      filtrados.sort((a,b) => parseFecha(b.Fecha) - parseFecha(a.Fecha));
    } else if (tipo === 'equipo') {
      const equipoSel = document.getElementById('filterEquipo').value.trim().toUpperCase();
      if (!equipoSel) { statusEl.textContent = '⚠️ Selecciona un equipo'; return; }
      filtrados = base.filter(p => {
        const eqLocal  = (todosEquipos.find(e => String(e.ID_Equipo) === String(p.Equipo_Local))?.Nombre || '').toUpperCase();
        const eqVisita = (todosEquipos.find(e => String(e.ID_Equipo) === String(p.Equipo_Visita))?.Nombre || '').toUpperCase();
        return eqLocal === equipoSel || eqVisita === equipoSel;
      });
      if (!filtrados.length) { statusEl.textContent = `⚠️ No hay partidos para ${equipoSel}`; return; }
      filtrados.sort((a,b) => {
        const ja = a.Jornada ? Number(a.Jornada) : 999;
        const jb = b.Jornada ? Number(b.Jornada) : 999;
        return ja - jb;
      });
    } else {
      statusEl.textContent = '⚠️ Selecciona un tipo de filtro'; return;
    }
    ultimosFiltrados = filtrados;
    await Promise.all([cargarClavesEquipos(), cargarConfirmaciones()]);
    renderStack(filtrados);
    statusEl.textContent = `✅ ${filtrados.length} partido(s) cargado(s)`;
  } catch(e) {
    statusEl.textContent = '❌ Error: ' + e.message;
  }
}

function parseFecha(f) {
  if (!f) return 0;
  const parts = f.split('/');
  if (parts.length !== 3) return 0;
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
}

function renderStack(filtrados) {
  const eqMap = {};
  todosEquipos.forEach(e => { eqMap[String(e['ID_Equipo']).trim()] = e; });
  const cont = document.getElementById('stackContainer');
  cont.innerHTML = bannerDescansoHTML(filtrados);
  filtrados.forEach((p, idx) => {
    const eqL = eqMap[String(p['Equipo_Local']).trim()] || {};
    const eqV = eqMap[String(p['Equipo_Visita']).trim()] || {};
    const nomL = (eqL['Nombre'] || `Equipo ${p['Equipo_Local']}`).toUpperCase();
    const nomV = (eqV['Nombre'] || `Equipo ${p['Equipo_Visita']}`).toUpperCase();
    const urlL = eqL['URL'] || '';
    const urlV = eqV['URL'] || '';
    const gL = p['Goles_Local'] !== '' ? p['Goles_Local'] : '-';
    const gV = p['Goles_Visita'] !== '' ? p['Goles_Visita'] : '-';
    const estado = (p['Estado'] || '').trim();
    const ganPor = (p['Ganado_Por'] || '').trim();
    const ganPorClass = ganPor.toLowerCase();
    const hora = formatHora(p['Hora']);
    const cancha = p['Cancha'] || '';
    const fecha = p['Fecha'] || '';
    const jornadaTxt = p['Jornada'] ? `Jornada ${p['Jornada']}` : 'Jornada ?';
    const vueltaTxt = p['Vuelta'] === '2' ? 'SEGUNDA VUELTA' : 'PRIMERA VUELTA';
    const idPartido = p['ID_Partido'];
    const scoreHTML = estado === 'Jugado'
      ? `<div class="stack-score">${gL} - ${gV}</div>`
      : `<div class="stack-score programado">VS</div>`;
    const badgeHTML = estado === 'Pendiente'
      ? `<span class="stack-badge pendiente">PENDIENTE</span>`
      : (ganPor ? `<span class="stack-badge ${ganPorClass}">${ganPor.toUpperCase()}</span>` : '');
    const clickable = (estado === 'Jugado' || estado === 'Programado');
    const idxReal = todosPartidos.indexOf(p);
    let confirmHTML = '';
    if (estado === 'Programado') {
      const conf = S_CONFIRM[idPartido] || {};
      confirmHTML = `<div class="stack-confirm">${bloqueConfirmarLado(idPartido,'local',p['Equipo_Local'],nomL,!!conf.local)}${bloqueConfirmarLado(idPartido,'visita',p['Equipo_Visita'],nomV,!!conf.visita)}</div>`;
    }

    const estadoClass = estado === 'Programado' ? 'estado-programado' : estado === 'Jugado' ? 'estado-jugado' : 'estado-pendiente';
    let bordeClass = '';
    if (estado === 'Programado') bordeClass = 'borde-programado';
    else if (ganPorClass === 'normal') bordeClass = 'borde-normal';
    else if (ganPorClass === 'penales') bordeClass = 'borde-penales';
    else if (ganPorClass === 'default') bordeClass = 'borde-default';
    cont.innerHTML += `
    <div class="stack-card" style="top:${16 + idx * 4}px; z-index:${idx+1};">
      <div class="stack-card-inner ${estadoClass} ${bordeClass}" ${clickable ? `onclick="abrirPopupPartido(todosPartidos[${idxReal}])"` : ''}>
        <div class="stack-top-row">
          <span class="stack-jornada-tag">${jornadaTxt}</span>
          <span class="stack-vuelta-tag">${vueltaTxt}</span>
          <span class="stack-id-tag">#${idPartido}</span>
        </div>
        <div class="stack-teams">
          <div class="stack-team">
            <img src="${urlL}" onerror="this.style.opacity='0.2'">
            <div class="stack-team-name">${nomL}</div>
          </div>
          ${scoreHTML}
          <div class="stack-team">
            <img src="${urlV}" onerror="this.style.opacity='0.2'">
            <div class="stack-team-name">${nomV}</div>
          </div>
        </div>
        <div class="stack-bottom-row">
          ${fecha ? `<span>📅 ${fecha}</span>` : ''}
          ${hora ? `<span>⏰ ${hora}</span>` : ''}
          ${cancha ? `<span>📍 ${cancha}</span>` : ''}
          ${badgeHTML}
        </div>
        ${confirmHTML}
      </div>
    </div>`;
  });
}

function bloqueConfirmarLado(idPartido, lado, idEquipo, nombre, confirmado) {
  if (confirmado) return `<div class="confirm-ok">✅ ${nombre}<br>confirmó</div>`;
  return `<div class="confirm-lado">
    <input type="text" id="clave-${idPartido}-${lado}" placeholder="Contraseña de ${nombre}" onclick="event.stopPropagation()">
    <button onclick="event.stopPropagation();confirmarAsistencia('${idPartido}','${lado}','${idEquipo}','${nombre.replace(/'/g,"")}')">Confirmar ${nombre}</button>
  </div>`;
}

// ===== DESCANSOS (17 equipos: cada jornada descansa un equipo) =====
// Descansos fijados a mano: { numeroJornada: ['Nombre del equipo' (o ID_Equipo)', ...] }
// Galácticos (equipo nuevo) descansó en la jornada 1.
const DESCANSOS_MANUALES = { 1: ['Galacticos'] };

// Una jornada solo se usa para detectar descansos "naturales" si ya tiene al menos
// este número de partidos capturados (con 17 equipos una jornada completa tiene 8).
// Así una jornada a medio capturar no hace que "descansen" todos los demás.
const MIN_PARTIDOS_PARA_DETECTAR = 6;

let DESCANSOS = {};        // jornada -> { jornada, equipos:[{id,nombre,descripcion}], fechas:[], jugada, sugerido, vuelta }
let DESCANSOS_AVISOS = []; // avisos para que revises la hoja
let AUSENCIAS = [];             // por jornada cerrada: equipos que no jugaron y si cuenta como descanso
let JORNADAS_SIN_CAPTURAR = []; // jornadas con partidos incompletos (no se puede saber quién no juega)

function normTxt(t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase(); }
function claveVuelta(v) { return String(v || '').trim() === '2' ? '2' : '1'; }

function buscarEquipoPorRef(ref) {
  const r = String(ref).trim();
  const porId = todosEquipos.find(e => String(e['ID_Equipo']).trim() === r);
  if (porId) return porId;
  const n = normTxt(r);
  return todosEquipos.find(e => normTxt(e['Nombre']) === n)
      || todosEquipos.find(e => normTxt(e['Nombre']).includes(n))
      || null;
}

// Regla: cada equipo descansa UNA vez por vuelta.
//  1) Se respetan los descansos manuales (DESCANSOS_MANUALES).
//  2) Descanso "natural" = la primera jornada de la vuelta en la que el equipo no tiene partido en la hoja.
//  3) Los equipos que aún no tienen descanso se SUGIEREN en las jornadas (1..N equipos) que siguen libres.
function calcularDescansos() {
  const avisos = [];
  const activos = todosEquipos.filter(e => (e['Status'] || '').trim().toLowerCase() === 'activo');
  const info = e => ({
    id: String(e['ID_Equipo']).trim(),
    nombre: (e['Nombre'] || '').toUpperCase(),
    descripcion: e['Descripción'] || e['Descripcion'] || ''
  });

  const porJ = {};
  todosPartidos.forEach(p => {
    const j = Number(p['Jornada']); if (!j) return;
    if (!porJ[j]) porJ[j] = { ids: new Set(), fechas: [], vuelta: claveVuelta(p['Vuelta']), jugado: false, n: 0, incompleta: false, filasIncompletas: [] };
    const o = porJ[j];
    o.n++;
    const l = String(p['Equipo_Local'] || '').trim(), v = String(p['Equipo_Visita'] || '').trim();
    if (!l || !v) { o.incompleta = true; o.filasIncompletas.push(p['ID_Partido']); }
    if (l) o.ids.add(l);
    if (v) o.ids.add(v);
    const f = (p['Fecha'] || '').trim();
    if (f && !o.fechas.includes(f)) o.fechas.push(f);
    if ((p['Estado'] || '').trim() === 'Jugado') o.jugado = true;
  });

  const res = {};
  const asegurar = j => {
    if (!res[j]) res[j] = {
      jornada: j, equipos: [], sugerido: false,
      fechas: porJ[j] ? porJ[j].fechas.slice().sort((a, b) => parseFecha(a) - parseFecha(b)) : [],
      jugada: porJ[j] ? porJ[j].jugado : false,
      vuelta: porJ[j] ? porJ[j].vuelta : '1'
    };
    return res[j];
  };
  const yaDescanso = {}; // "idEquipo|vuelta" -> true

  // 1) manuales
  Object.keys(DESCANSOS_MANUALES).forEach(jStr => {
    const j = Number(jStr);
    DESCANSOS_MANUALES[jStr].forEach(ref => {
      const eq = buscarEquipoPorRef(ref);
      if (!eq) { avisos.push(`No encontré el equipo "${ref}" en la hoja Equipos (descanso manual de la jornada ${j}).`); return; }
      const inf = info(eq);
      if (porJ[j] && porJ[j].ids.has(inf.id)) {
        avisos.push(`${inf.nombre} aparece con partido en la jornada ${j}, por eso no se marcó el descanso manual. Revisa la hoja Partidos.`);
        return;
      }
      const d = asegurar(j);
      d.equipos.push(inf);
      yaDescanso[inf.id + '|' + d.vuelta] = true;
    });
  });

  // 2) naturales (primera ausencia de cada equipo por vuelta)
  Object.keys(porJ).map(Number).sort((a, b) => a - b).forEach(j => {
    if (porJ[j].incompleta || porJ[j].n < MIN_PARTIDOS_PARA_DETECTAR) return;
    activos.forEach(e => {
      const inf = info(e);
      if (porJ[j].ids.has(inf.id)) return;
      const k = inf.id + '|' + porJ[j].vuelta;
      if (yaDescanso[k]) return;
      asegurar(j).equipos.push(inf);
      yaDescanso[k] = true;
    });
  });

  // avisos por filas sin Equipo_Local o Equipo_Visita
  const filasInc = [];
  Object.keys(porJ).forEach(j => porJ[j].filasIncompletas.forEach(id => filasInc.push(id)));
  if (filasInc.length) {
    avisos.push(`Hay ${filasInc.length} partido(s) sin Equipo_Local o Equipo_Visita (ID ${filasInc[0]} a ${filasInc[filasInc.length - 1]}). Esas jornadas no se usan para detectar descansos; completa el equipo que falta (¿Galácticos?).`);
  }

  // avisos por jornadas con varios descansos
  Object.keys(res).map(Number).sort((a, b) => a - b).forEach(j => {
    if (res[j].equipos.length > 1) {
      avisos.push(`Jornada ${j}: descansan ${res[j].equipos.length} equipos (${res[j].equipos.map(e => e.nombre).join(', ')}). Si debería descansar solo uno, revisa que no falten partidos por capturar.`);
    }
  });

  // ausencias por jornada (para el reporte "quién no jugó")
  const restReal = {};
  Object.keys(res).forEach(j => res[j].equipos.forEach(e => { restReal[e.id] = Number(j); }));
  const jornadasOrden = Object.keys(porJ).map(Number).sort((a, b) => a - b);
  const detectable = j => !porJ[j].incompleta && porJ[j].n >= MIN_PARTIDOS_PARA_DETECTAR;
  AUSENCIAS = jornadasOrden.filter(detectable).map(j => ({
    jornada: j,
    fechas: porJ[j].fechas.slice().sort((a, b) => parseFecha(a) - parseFecha(b)),
    ausentes: activos.filter(e => !porJ[j].ids.has(String(e['ID_Equipo']).trim())).map(e => {
      const inf = info(e);
      return Object.assign({}, inf, { descanso: restReal[inf.id] === j, descansoEn: restReal[inf.id] || null });
    }).sort((a, b) => (b.descanso ? 1 : 0) - (a.descanso ? 1 : 0))
  }));
  JORNADAS_SIN_CAPTURAR = jornadasOrden.filter(j => !detectable(j));

  // 3) sugerencias para los que aún no descansan (vuelta 1)
  const total = activos.length;
  const libres = [];
  for (let j = 1; j <= total; j++) if (!res[j] || !res[j].equipos.length) libres.push(j);
  activos.map(info).filter(i => !yaDescanso[i.id + '|1']).forEach(inf => {
    const idx = libres.findIndex(j => !(porJ[j] && porJ[j].ids.has(inf.id)));
    if (idx === -1) return;
    const d = asegurar(libres.splice(idx, 1)[0]);
    d.equipos.push(inf);
    d.sugerido = true;
  });

  DESCANSOS_AVISOS = avisos;
  return res;
}

function equipoDescansaEn(idEquipo, jornada) {
  const d = DESCANSOS[Number(jornada)];
  return !!d && !d.sugerido && d.equipos.some(e => e.id === String(idEquipo).trim());
}

// Equipos que descansan (reales, no sugeridos) en la jornada, o null si ninguno
function descansoParaReporte(jornadaNum) {
  const d = DESCANSOS[Number(jornadaNum)];
  return (d && !d.sugerido && d.equipos.length) ? d.equipos : null;
}

function descansoBloqueHTML(equipos) {
  const varios = equipos.length > 1;
  const filas = equipos.map(eq => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:${varios ? 20 : 22}px;letter-spacing:2px;color:#5eb50d;text-shadow:0 0 10px rgba(94,181,13,0.5),0 1px 3px rgba(0,0,0,0.8);">${eq.nombre}</div>
        ${eq.descripcion ? `<div style="font-family:'Roboto',Arial,sans-serif;font-size:13px;font-weight:700;color:#d5a610;text-shadow:0 1px 3px rgba(0,0,0,0.8);">${eq.descripcion}</div>` : ''}
      </div>`).join('');
  return `
    <div style="text-align:center;margin-top:14px;margin-bottom:6px;display:flex;flex-direction:column;align-items:center;gap:6px;">
      ${filas}
      <div style="font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:2px;color:#f5f5f5;text-shadow:0 1px 3px rgba(0,0,0,0.8);">${varios ? 'DESCANSAN ESTA JORNADA' : 'DESCANSA ESTA JORNADA'}</div>
    </div>`;
}

// Aviso arriba de las tarjetas cuando se filtra por jornada
function bannerDescansoHTML(filtrados) {
  const tipo = document.getElementById('filterTipo');
  if (!tipo || tipo.value !== 'jornada' || !filtrados.length) return '';
  const eqs = descansoParaReporte(filtrados[0]['Jornada']);
  if (!eqs) return '';
  return `<div style="text-align:center;margin-bottom:16px;padding:10px 14px;background:rgba(0,0,0,0.6);border:1px solid #d5a610;border-radius:12px;color:#ddc530;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">😴 ${eqs.length > 1 ? 'Descansan' : 'Descansa'} esta jornada: ${eqs.map(e => e.nombre).join(' · ')}</div>`;
}

// Calendario completo de descansos (botón "Ver calendario de descansos")
function mostrarDescansos() {
  const st = document.getElementById('statusMsg');
  if (!todosEquipos.length || !todosPartidos.length) { st.textContent = '⚠️ Aún no cargan los datos de la hoja, intenta en un momento'; return; }
  DESCANSOS = calcularDescansos();
  const colores = { 'DESCANSÓ': '#9aa89a', 'DESCANSARÁ': '#ddc530', 'SUGERIDO': '#29a6ff' };
  const listados = new Set();
  let filas = '';
  Object.keys(DESCANSOS).map(Number).sort((a, b) => a - b).forEach(j => {
    const d = DESCANSOS[j];
    d.equipos.forEach(eq => {
      listados.add(eq.id);
      const estado = d.sugerido ? 'SUGERIDO' : (d.jugada ? 'DESCANSÓ' : 'DESCANSARÁ');
      const fecha = d.fechas.length ? d.fechas.join(' / ') : 'Por definir';
      filas += `<div style="display:grid;grid-template-columns:70px 1fr 110px 100px;gap:8px;align-items:center;padding:9px 4px;border-bottom:1px dotted rgba(94,181,13,0.3);font-size:13px;">
        <span style="color:#5eb50d;font-weight:700;">Jornada ${j}</span>
        <span style="color:#fff;font-weight:700;text-transform:uppercase;">${eq.nombre}</span>
        <span style="color:#ddd;">${fecha}</span>
        <span style="color:${colores[estado]};font-weight:700;font-size:11px;letter-spacing:1px;text-align:right;">${estado}</span>
      </div>`;
    });
  });
  const sin = todosEquipos.filter(e => (e['Status'] || '').trim().toLowerCase() === 'activo' && !listados.has(String(e['ID_Equipo']).trim()));
  const sinHTML = sin.length ? `<div style="margin-top:12px;color:#ff8a8a;font-size:13px;">Sin descanso asignado: ${sin.map(e => (e['Nombre'] || '').toUpperCase()).join(', ')}</div>` : '';
  const avisosHTML = DESCANSOS_AVISOS.length
    ? `<div style="margin-top:12px;padding:10px 12px;border:1px solid #d5a610;border-radius:10px;color:#ddc530;font-size:12px;line-height:1.5;">⚠️ ${DESCANSOS_AVISOS.join('<br>⚠️ ')}</div>` : '';
  document.getElementById('stackContainer').innerHTML = `
    <div class="editor-panel" style="max-width:700px;">
      <h3>😴 Calendario de descansos</h3>
      ${filas || '<div class="empty-msg">No hay descansos para mostrar</div>'}
      ${sinHTML}${avisosHTML}
    </div>`;
  st.textContent = '✅ Calendario de descansos (los SUGERIDOS son propuesta, no están en la hoja)';
}

// ===== REPORTE PNG: ¿QUIÉN NO JUGÓ? + DESCANSO POR EQUIPO (formato oficial) =====
function fechasTxt(fechas) { return (fechas && fechas.length) ? fechas.join(' · ') : 'Por definir'; }

function chipDescansoHTML(texto, color) {
  return `<div style="flex-shrink:0;font-size:12px;font-weight:800;letter-spacing:1px;color:${color};border:1.5px solid ${color};border-radius:14px;padding:4px 11px;text-transform:uppercase;background:rgba(0,0,0,0.45);text-shadow:0 1px 3px rgba(0,0,0,0.9);white-space:nowrap;">${texto}</div>`;
}

function htmlPaginaDescansos(numPagina, totalPaginas) {
  const eqMap = {};
  todosEquipos.forEach(e => { eqMap[String(e['ID_Equipo']).trim()] = e; });
  const logo = (id, px) => `<img src="${(eqMap[id] && eqMap[id]['URL']) || ''}" style="width:${px}px;height:${px}px;object-fit:contain;flex-shrink:0;" onerror="this.style.opacity='0.2'">`;
  const sep = `<hr style="border:none;border-top:1px dotted rgba(94,181,13,0.4);margin:0;">`;
  const nota = t => `<div style="margin-top:16px;padding:12px 14px;background:rgba(0,0,0,0.6);border:1px solid rgba(213,166,16,0.5);border-radius:12px;font-size:13px;line-height:1.45;font-weight:700;color:#ffffff;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.95);">${t}</div>`;

  let cuerpo = '';
  let subtitulo = '';

  if (numPagina === 1) {
    subtitulo = 'QUIÉN NO JUGÓ CADA JORNADA';
    cuerpo = AUSENCIAS.map((a, i) => {
      const lineas = a.ausentes.map(x => `
        <div style="display:flex;align-items:center;gap:10px;padding:5px 0;">
          ${logo(x.id, 38)}
          <div style="flex:1;min-width:0;font-size:15px;font-weight:900;color:#f5f5f0;text-transform:uppercase;line-height:1.2;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${x.nombre}</div>
          ${x.descanso
            ? chipDescansoHTML('😴 Sí · cuenta como descanso', '#5eb50d')
            : chipDescansoHTML('⚠️ No · ' + (x.descansoEn ? 'ya descansó J' + x.descansoEn : 'partido pendiente'), '#ff6666')}
        </div>`).join('') || `<div style="font-size:14px;color:#f5f5f0;font-weight:700;">Jugaron todos los equipos</div>`;
      return `
        <div style="padding:14px 4px 12px;">
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px;">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:3px;color:#5eb50d;text-shadow:0 0 14px rgba(94,181,13,0.5),0 2px 4px rgba(0,0,0,0.7);">JORNADA ${a.jornada}</div>
            <div style="font-size:13px;color:#ffd83d;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${fechasTxt(a.fechas)}</div>
          </div>
          ${lineas}
        </div>
        ${i < AUSENCIAS.length - 1 ? sep : ''}`;
    }).join('');
    if (JORNADAS_SIN_CAPTURAR.length) {
      const ini = JORNADAS_SIN_CAPTURAR[0], fin = JORNADAS_SIN_CAPTURAR[JORNADAS_SIN_CAPTURAR.length - 1];
      cuerpo += nota(`🕒 Jornada${ini !== fin ? 's ' + ini + ' a ' + fin : ' ' + ini}: partidos aún sin capturar completos, todavía no se puede saber quién no juega.`);
    }
    cuerpo += nota('📌 Nota: un equipo que no jugó una jornada se toma como descanso solo la primera vez (cada equipo descansa una vez). Si vuelve a quedar sin partido en otra jornada, ese partido se considera pendiente.');
  } else {
    subtitulo = 'DESCANSO DE CADA EQUIPO';
    const filas = [];
    Object.keys(DESCANSOS).map(Number).sort((a, b) => a - b).forEach(j => {
      const d = DESCANSOS[j];
      d.equipos.forEach(eq => filas.push({ j, d, eq }));
    });
    cuerpo = filas.map((f, i) => {
      const chip = f.d.sugerido ? chipDescansoHTML('Propuesta', '#29a6ff')
        : (f.d.jugada ? chipDescansoHTML('Descansó', '#5eb50d') : chipDescansoHTML('Descansará', '#ffd83d'));
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 4px;">
          ${logo(f.eq.id, 52)}
          <div style="flex:1;min-width:0;font-size:16px;font-weight:900;color:#f5f5f0;text-transform:uppercase;line-height:1.2;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${f.eq.nombre}</div>
          <div style="text-align:center;min-width:120px;">
            <div style="font-size:11px;color:#5eb50d;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;text-shadow:0 1px 3px rgba(0,0,0,0.85);">Jornada ${f.j}</div>
            <div style="font-size:13px;color:#f0f0f0;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${f.d.sugerido ? 'Por definir' : fechasTxt(f.d.fechas)}</div>
          </div>
          ${chip}
        </div>
        ${i < filas.length - 1 ? sep : ''}`;
    }).join('');
    cuerpo += nota('📌 Propuesta = descanso sugerido, todavía no está capturado en la hoja de partidos. Cada equipo descansa una vez por vuelta.');
  }

  const titulo = `DESCANSOS${totalPaginas > 1 ? ' · Página ' + numPagina + '/' + totalPaginas : ''}`;
  return `
    <div style="text-align:center;margin-top:220px;margin-bottom:8px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:5px;color:#5eb50d;text-shadow:0 0 18px rgba(94,181,13,0.55),0 2px 4px rgba(0,0,0,0.7);">${titulo}</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:4px;color:#f5f5f0;margin-top:2px;text-shadow:0 2px 4px rgba(0,0,0,0.8);">${subtitulo}</div>
    </div>
    <div style="margin-top:10px;">${cuerpo}</div>`;
}

function construirPaginaDescansos(numPagina, totalPaginas) {
  const inner = document.createElement('div');
  inner.style.cssText = `
    position:relative;
    width:700px;
    min-height:900px;
    background-image:url('fondonuevo.png');
    background-size:cover;
    background-position:center;
    padding:28px 24px 32px;
    box-sizing:border-box;
  `;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.15);z-index:0;';
  inner.appendChild(overlay);
  const content = document.createElement('div');
  content.style.cssText = 'position:relative;z-index:1;display:flex;flex-direction:column;min-height:844px;';
  content.innerHTML = htmlPaginaDescansos(numPagina, totalPaginas);
  inner.appendChild(content);
  return inner;
}

async function downloadPNGDescansos() {
  if (!todosEquipos.length || !todosPartidos.length) { alert('Aún no cargan los datos de la hoja, intenta en un momento.'); return; }
  const btn = document.getElementById('dlBtnDesc');
  btn.textContent = '⏳ Generando...';
  btn.disabled = true;
  DESCANSOS = calcularDescansos();
  const totalPaginas = 2;
  try {
    for (let p = 1; p <= totalPaginas; p++) {
      const temp = document.createElement('div');
      temp.style.position = 'fixed';
      temp.style.left = '-9999px';
      temp.style.top = '0';
      temp.appendChild(construirPaginaDescansos(p, totalPaginas));
      document.body.appendChild(temp);
      await esperarImagenesReporte(temp);
      const canvas = await html2canvas(temp, {
        useCORS: true, allowTaint: true, scale: 3,
        backgroundColor: '#142702', imageTimeout: 20000, logging: false
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `descansos_nextlevel7_pagina${p}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      document.body.removeChild(temp);
      await new Promise(r => setTimeout(r, 400));
    }
  } catch (e) {
    alert('❌ Error: ' + e.message);
  }
  btn.textContent = '⬇ Descargar reporte de descansos (PNG)';
  btn.disabled = false;
}

// ===== DESCARGAR PNG (paginado: 4 partidos por página) =====
const REPORTE_POR_PAGINA = 7;

async function esperarImagenesReporte(el) {
  const imgs = el.querySelectorAll('img');
  await Promise.all(Array.from(imgs).map(img => new Promise(resolve => {
    if (img.complete) resolve(); else { img.onload = resolve; img.onerror = resolve; }
  })));
  await new Promise(r => setTimeout(r, 200));
}


function bloqueEquiposAtrasadosHTML(equiposAtrasados) {
  if (!equiposAtrasados || !equiposAtrasados.length) return '';
  const filas = equiposAtrasados.map(e =>
    `<div style="font-size:13px;color:#f5f5f0;text-align:center;line-height:1.5;">
      <strong style="color:#ff8a8a;">${e.nombre}</strong> — debe jornada${e.jornadas.length>1?'s':''} ${e.jornadas.join(', ')}
    </div>`
  ).join('');
  return `
    <div style="margin-top:16px;padding:14px 16px;background:rgba(0,0,0,0.6);border:1px solid rgba(255,68,68,0.45);border-radius:12px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;color:#ff6666;text-align:center;margin-bottom:8px;text-shadow:0 1px 3px rgba(0,0,0,0.8);">⚠️ EQUIPOS CON JORNADAS PENDIENTES</div>
      <div style="display:flex;flex-direction:column;gap:4px;">${filas}</div>
      <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.35);font-size:14px;line-height:1.45;font-weight:700;color:#ffffff;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.95);">
        📌 Nota: la jornada de cada partido se aplica según los rivales que se enfrentan en esa fecha, y cada equipo juega la jornada que le toca según los partidos que lleva. Si un equipo adelantó partidos (por ejemplo, jugó dos el domingo pasado), puede jugar una jornada más avanzada que otros equipos aunque todavía deba una jornada anterior.
      </div>
    </div>`;
}

function calcularEquiposAtrasados(jornadaActual, partidosDia) {
  const n = Number(jornadaActual) || 0;
  if (n <= 1) return [];
  const jornadasLiga = new Set();
  todosPartidos.forEach(p => {
    const jn = Number(p['Jornada']);
    if ((p['Estado']||'').trim() === 'Jugado' && jn && jn < n) jornadasLiga.add(jn);
  });
  const jornadasLigaArr = [...jornadasLiga].sort((a,b)=>a-b);
  if (!jornadasLigaArr.length) return [];

  const atrasados = [];
  todosEquipos
    .filter(e => (e['Status']||'').trim().toLowerCase() === 'activo')
    .forEach(e => {
      const idE = String(e['ID_Equipo']).trim();
      const jugadas = new Set();
      todosPartidos.forEach(p => {
        if ((p['Estado']||'').trim() === 'Jugado' &&
            (String(p['Equipo_Local']).trim() === idE || String(p['Equipo_Visita']).trim() === idE)) {
          jugadas.add(Number(p['Jornada']));
        }
      });
      // En modo "por fecha": si el equipo ya tiene programada esa jornada en los
      // partidos del día, no se cuenta como pendiente (la está pagando ese día).
      const programadas = new Set();
      (partidosDia || []).forEach(p => {
        if (String(p['Equipo_Local']).trim() === idE || String(p['Equipo_Visita']).trim() === idE) {
          programadas.add(Number(p['Jornada']));
        }
      });
      const debe = jornadasLigaArr.filter(jn => !jugadas.has(jn) && !programadas.has(jn) && !equipoDescansaEn(idE, jn));
      if (debe.length) atrasados.push({ nombre: (e['Nombre']||'').toUpperCase(), jornadas: debe });
    });
  return atrasados;
}

// Encabezado para el modo "por fecha": "JUEGOS DEL DOMINGO" + la fecha debajo.
function encabezadoPorFecha(fechaStr, partidos) {
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const pf = (fechaStr || '').split('/').map(n => parseInt(n, 10));
  const dia = pf.length === 3 && pf.every(n => !isNaN(n)) ? dias[new Date(Date.UTC(pf[2], pf[1]-1, pf[0])).getUTCDay()] : '';
  const jornadas = partidos.map(p => Number(p['Jornada'])).filter(n => n);
  return {
    titulo: dia ? `Juegos del ${dia}` : 'Juegos del día',
    subtitulo: fechaStr || '',
    jornadaRef: jornadas.length ? Math.max(...jornadas) : 0
  };
}

function construirPaginaReporte(paginaPartidos, numPagina, totalPaginas, jornadaTitulo, vueltaTitulo, equipoDescansa, equiposAtrasados, opciones) {
  const eqMap = {};
  todosEquipos.forEach(e => { eqMap[String(e['ID_Equipo']).trim()] = e; });

  const inner = document.createElement('div');
  inner.style.cssText = `
    position:relative;
    width:700px;
    min-height:900px;
    background-image:url('fondonuevo.png');
    background-size:cover;
    background-position:center;
    padding:28px 24px 32px;
    box-sizing:border-box;
  `;

  const overlay = document.createElement('div');
  overlay.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,0.15);z-index:0;`;
  inner.appendChild(overlay);

  const content = document.createElement('div');
  content.style.cssText = 'position:relative;z-index:1;display:flex;flex-direction:column;min-height:844px;';

  opciones = opciones || {};
  const paginaTxt = (totalPaginas > 1 && !opciones.ocultarPagina) ? ` · Página ${numPagina}/${totalPaginas}` : '';
  const subtituloHTML = opciones.subtitulo
    ? `<div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:4px;color:#f5f5f0;margin-top:2px;text-shadow:0 2px 4px rgba(0,0,0,0.8);">${opciones.subtitulo}</div>`
    : '';
  const descansaHTML = (equipoDescansa && numPagina === 1) ? descansoBloqueHTML(equipoDescansa) : '';
  content.innerHTML = `
    <div style="text-align:center;margin-top:220px;margin-bottom:8px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:5px;color:#5eb50d;text-shadow:0 0 18px rgba(94,181,13,0.55),0 2px 4px rgba(0,0,0,0.7);">${jornadaTitulo}${paginaTxt}</div>
      ${subtituloHTML}
    </div>
    ${descansaHTML}
    <div id="reporte-filas" style="flex:1;display:flex;flex-direction:column;justify-content:center;"></div>
    ${numPagina === totalPaginas ? bloqueEquiposAtrasadosHTML(equiposAtrasados) : ''}
  `;

  const filasWrap = content.querySelector('#reporte-filas');
  paginaPartidos.forEach((p, i) => {
    const eqL = eqMap[String(p['Equipo_Local']).trim()] || {};
    const eqV = eqMap[String(p['Equipo_Visita']).trim()] || {};
    const nomL = (eqL['Nombre'] || `Equipo ${p['Equipo_Local']}`).toUpperCase();
    const nomV = (eqV['Nombre'] || `Equipo ${p['Equipo_Visita']}`).toUpperCase();
    const urlL = eqL['URL'] || '';
    const urlV = eqV['URL'] || '';
    const gL = p['Goles_Local'] !== '' ? p['Goles_Local'] : null;
    const gV = p['Goles_Visita'] !== '' ? p['Goles_Visita'] : null;
    const estado = (p['Estado'] || '').trim();
    const fecha = p['Fecha'] || '';
    const jornadaFila = p['Jornada'] ? `Jornada ${p['Jornada']}${p['Vuelta'] ? ' · Vuelta ' + (p['Vuelta']==='2'?'2':'1') : ''}` : '';
    const hora = p['Hora'] ? formatHora(p['Hora']) : '';
    const cancha = p['Cancha'] || '';
    const jugado = estado === 'Jugado' && gL !== null && gV !== null;
    const centerHTML = jugado
      ? `<div style="font-family:'Bebas Neue',sans-serif;font-size:36px;color:#ddc530;text-shadow:0 0 10px rgba(94,181,13,0.5);letter-spacing:2px;line-height:1;">${gL} - ${gV}</div>`
      : `<div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:rgba(255,255,255,0.5);letter-spacing:2px;">VS</div>`;

    const sep = i < paginaPartidos.length - 1
      ? `<hr style="border:none;border-top:1px dotted rgba(94,181,13,0.4);margin:0;">`
      : '';

    const fila = document.createElement('div');
    fila.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;padding:16px 4px;">
        <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;flex:1;min-width:0;">
          <div style="width:173px;flex-shrink:0;font-size:15px;font-weight:900;color:#f5f5f0;text-transform:uppercase;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;">${nomL}</div>
          <img src="${urlL}" style="width:88px;height:88px;object-fit:contain;flex-shrink:0;" onerror="this.style.opacity='0.2'">
        </div>
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:90px;text-align:center;gap:3px;">
          ${jornadaFila ? `<div style="font-size:10px;color:#5eb50d;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;text-shadow:0 1px 3px rgba(0,0,0,0.85);">${jornadaFila}</div>` : ''}
          ${fecha ? `<div style="font-size:13px;color:#f0f0f0;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${fecha}</div>` : ''}
          <div style="width:18px;height:2px;background:#5eb50d;border-radius:2px;margin:2px auto;"></div>
          ${centerHTML}
          ${hora ? `<div style="font-size:14px;color:#ffd83d;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${hora}</div>` : ''}
          ${cancha ? `<div style="font-size:11px;color:#5eb50d;font-weight:700;letter-spacing:0.5px;text-shadow:0 1px 3px rgba(0,0,0,0.8);">${cancha}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;justify-content:flex-start;gap:8px;flex:1;min-width:0;">
          <img src="${urlV}" style="width:88px;height:88px;object-fit:contain;flex-shrink:0;" onerror="this.style.opacity='0.2'">
          <div style="width:173px;flex-shrink:0;font-size:15px;font-weight:900;color:#f5f5f0;text-transform:uppercase;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;">${nomV}</div>
        </div>
      </div>
      ${sep}
    `;
    filasWrap.appendChild(fila);
  });

  inner.appendChild(content);
  return inner;
}

// Ordena por Horario primero (comparación numérica real, ya que la hora en la
// hoja viene como texto "9:00:00" / "10:00:00" y comparada como texto salía mal)
// y dentro de la misma hora, por Campo (Campo 1, Campo 2, ...).
function minutosDeHora(hora) {
  if (!hora) return 99999;
  const partes = hora.split(':');
  const h = parseInt(partes[0],10) || 0;
  const m = parseInt(partes[1],10) || 0;
  return h*60+m;
}
function ordenarPorCampoHora(lista) {
  return [...lista].sort((a,b) => {
    const ha = minutosDeHora(a['Hora']);
    const hb = minutosDeHora(b['Hora']);
    if (ha !== hb) return ha - hb;
    const ca = (a['Cancha']||'').trim();
    const cb = (b['Cancha']||'').trim();
    if (!ca) return 1;
    if (!cb) return -1;
    return ca.localeCompare(cb, 'es', {numeric:true, sensitivity:'base'});
  });
}

async function downloadPNG() {
  if (!ultimosFiltrados.length) { alert('Primero carga los datos de los partidos.'); return; }
  const btn = document.getElementById('dlBtn');
  btn.textContent = '⏳ Generando...';
  btn.disabled = true;

  const tipoFiltro = document.getElementById('filterTipo').value;
  const partidosOrdenados = tipoFiltro === 'equipo'
    ? [...ultimosFiltrados]
    : ordenarPorCampoHora(ultimosFiltrados);
  const firstP = partidosOrdenados[0];
  let jornadaTitulo;
  if (tipoFiltro === 'equipo') {
    const equipoNombre = document.getElementById('filterEquipo').value.trim();
    jornadaTitulo = equipoNombre ? equipoNombre.toUpperCase() : 'Calendario del Equipo';
  } else if (tipoFiltro === 'fecha') {
    jornadaTitulo = encabezadoPorFecha(firstP?.Fecha, partidosOrdenados).titulo;
  } else {
    jornadaTitulo = firstP?.Jornada ? `Jornada ${firstP.Jornada}` : 'Partidos';
  }
  const vueltaTitulo = firstP?.Vuelta === '2' ? 'Segunda Vuelta' : 'Primera Vuelta';

  let equipoDescansa = null;
  let equiposAtrasados = [];
  if (tipoFiltro === 'jornada') {
    const jornadaNum = String(firstP?.Jornada || '').trim();
    equipoDescansa = descansoParaReporte(jornadaNum);
    equiposAtrasados = calcularEquiposAtrasados(jornadaNum);
  } else if (tipoFiltro === 'fecha') {
    equiposAtrasados = calcularEquiposAtrasados(encabezadoPorFecha(firstP?.Fecha, partidosOrdenados).jornadaRef, partidosOrdenados);
  }
  const opcionesPng = tipoFiltro === 'fecha'
    ? { ocultarPagina: true, subtitulo: encabezadoPorFecha(firstP?.Fecha, partidosOrdenados).subtitulo }
    : {};

  const totalPaginas = Math.ceil(partidosOrdenados.length / REPORTE_POR_PAGINA);

  try {
    for (let p = 0; p < totalPaginas; p++) {
      const pagina = partidosOrdenados.slice(p*REPORTE_POR_PAGINA, (p+1)*REPORTE_POR_PAGINA);
      const temp = document.createElement('div');
      temp.style.position = 'fixed';
      temp.style.left = '-9999px';
      temp.style.top = '0';

      const inner = construirPaginaReporte(pagina, p+1, totalPaginas, jornadaTitulo, vueltaTitulo, equipoDescansa, equiposAtrasados, opcionesPng);
      temp.appendChild(inner);
      document.body.appendChild(temp);

      await esperarImagenesReporte(temp);

      const canvas = await html2canvas(temp, {
        useCORS: true, allowTaint: true, scale: 4,
        backgroundColor: '#142702', imageTimeout: 20000, logging: false
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = totalPaginas > 1 ? `partidos_nextlevel7_pagina${p+1}.png` : `partidos_nextlevel7.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);

      document.body.removeChild(temp);
      await new Promise(r => setTimeout(r, 400));
    }
  } catch(e) {
    alert('❌ Error: ' + e.message);
  }

  btn.textContent = '⬇ Descargar Lista como PNG';
  btn.disabled = false;
}


// ===== VARIANTE 2: escudo/nombre más chicos, usando el color de playera (Color_Playera) =====
function construirPaginaReporteV2(paginaPartidos, numPagina, totalPaginas, jornadaTitulo, vueltaTitulo, equipoDescansa, equiposAtrasados, opciones) {
  const eqMap = {};
  todosEquipos.forEach(e => { eqMap[String(e['ID_Equipo']).trim()] = e; });

  const inner = document.createElement('div');
  inner.style.cssText = `
    position:relative;
    width:700px;
    min-height:900px;
    background-image:url('fondonuevo.png');
    background-size:cover;
    background-position:center;
    padding:28px 24px 32px;
    box-sizing:border-box;
  `;

  const overlay = document.createElement('div');
  overlay.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,0.15);z-index:0;`;
  inner.appendChild(overlay);

  const content = document.createElement('div');
  content.style.cssText = 'position:relative;z-index:1;display:flex;flex-direction:column;min-height:844px;';

  opciones = opciones || {};
  const paginaTxt = (totalPaginas > 1 && !opciones.ocultarPagina) ? ` · Página ${numPagina}/${totalPaginas}` : '';
  const subtituloHTML = opciones.subtitulo
    ? `<div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:4px;color:#f5f5f0;margin-top:2px;text-shadow:0 2px 4px rgba(0,0,0,0.8);">${opciones.subtitulo}</div>`
    : '';
  const descansaHTML = (equipoDescansa && numPagina === 1) ? descansoBloqueHTML(equipoDescansa) : '';
  content.innerHTML = `
    <div style="text-align:center;margin-top:220px;margin-bottom:8px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:5px;color:#5eb50d;text-shadow:0 0 18px rgba(94,181,13,0.55),0 2px 4px rgba(0,0,0,0.7);">${jornadaTitulo}${paginaTxt}</div>
      ${subtituloHTML}
    </div>
    ${descansaHTML}
    <div id="reporte-filas-v2" style="flex:1;display:flex;flex-direction:column;justify-content:center;"></div>
    ${numPagina === totalPaginas ? bloqueEquiposAtrasadosHTML(equiposAtrasados) : ''}
  `;

  const filasWrap = content.querySelector('#reporte-filas-v2');
  paginaPartidos.forEach((p, i) => {
    const eqL = eqMap[String(p['Equipo_Local']).trim()] || {};
    const eqV = eqMap[String(p['Equipo_Visita']).trim()] || {};
    const nomL = (eqL['Nombre'] || `Equipo ${p['Equipo_Local']}`).toUpperCase();
    const nomV = (eqV['Nombre'] || `Equipo ${p['Equipo_Visita']}`).toUpperCase();
    // Color_Playera (columna G de Equipos); si un equipo aún no la tiene cargada, usamos su escudo (URL) de respaldo
    const colorL = eqL['Color_Playera'] || '';
    const colorV = eqV['Color_Playera'] || '';
    const urlL = eqL['URL'] || '';
    const urlV = eqV['URL'] || '';
    const gL = p['Goles_Local'] !== '' ? p['Goles_Local'] : null;
    const gV = p['Goles_Visita'] !== '' ? p['Goles_Visita'] : null;
    const estado = (p['Estado'] || '').trim();
    const fecha = p['Fecha'] || '';
    const jornadaFila = p['Jornada'] ? `Jornada ${p['Jornada']}${p['Vuelta'] ? ' · Vuelta ' + (p['Vuelta']==='2'?'2':'1') : ''}` : '';
    const hora = p['Hora'] ? formatHora(p['Hora']) : '';
    const cancha = p['Cancha'] || '';
    const jugado = estado === 'Jugado' && gL !== null && gV !== null;
    const centerHTML = jugado
      ? `<div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:#ddc530;text-shadow:0 0 10px rgba(94,181,13,0.5);letter-spacing:2px;line-height:1;">${gL} - ${gV}</div>`
      : `<div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:rgba(255,255,255,0.5);letter-spacing:2px;">VS</div>`;

    const sep = i < paginaPartidos.length - 1
      ? `<hr style="border:none;border-top:1px dotted rgba(94,181,13,0.4);margin:0;">`
      : '';

    const equipoBloque = (nombre, urlEscudo, align) => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;min-width:0;">
        <img src="${urlEscudo}" style="width:56px;height:56px;object-fit:contain;" onerror="this.style.opacity='0.2';">
        <div style="max-width:140px;font-size:13px;font-weight:900;color:#f5f5f0;text-transform:uppercase;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:${align};">${nombre}</div>
      </div>`;

    const playeraBloque = (colorImg) => colorImg
      ? `<div style="flex-shrink:0;display:flex;align-items:center;justify-content:center;"><img src="${colorImg}" style="width:76px;height:76px;object-fit:contain;" onerror="this.parentElement.style.display='none';"></div>`
      : '';

    const fila = document.createElement('div');
    fila.innerHTML = `
      <div style="display:flex;align-items:center;gap:5px;padding:8px 4px;">
        ${equipoBloque(nomL, urlL, 'center')}
        ${playeraBloque(colorL)}
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:74px;text-align:center;gap:1px;">
          ${jornadaFila ? `<div style="font-size:10px;color:#5eb50d;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;text-shadow:0 1px 3px rgba(0,0,0,0.85);">${jornadaFila}</div>` : ''}
          ${fecha ? `<div style="font-size:13px;color:#f0f0f0;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${fecha}</div>` : ''}
          <div style="width:14px;height:2px;background:#5eb50d;border-radius:2px;margin:2px auto;"></div>
          ${centerHTML}
          ${hora ? `<div style="font-size:14px;color:#ffd83d;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${hora}</div>` : ''}
          ${cancha ? `<div style="font-size:11px;color:#5eb50d;font-weight:700;letter-spacing:0.5px;text-shadow:0 1px 3px rgba(0,0,0,0.8);">${cancha}</div>` : ''}
        </div>
        ${playeraBloque(colorV)}
        ${equipoBloque(nomV, urlV, 'center')}
      </div>
      ${sep}
    `;
    filasWrap.appendChild(fila);
  });

  inner.appendChild(content);
  return inner;
}

async function downloadPNGv2() {
  if (!ultimosFiltrados.length) { alert('Primero carga los datos de los partidos.'); return; }
  const btn = document.getElementById('dlBtnV2');
  if (btn) { btn.textContent = '⏳ Generando...'; btn.disabled = true; }

  const tipoFiltro = document.getElementById('filterTipo').value;
  const partidosOrdenados = tipoFiltro === 'equipo'
    ? [...ultimosFiltrados]
    : ordenarPorCampoHora(ultimosFiltrados);
  const firstP = partidosOrdenados[0];
  let jornadaTitulo;
  if (tipoFiltro === 'equipo') {
    const equipoNombre = document.getElementById('filterEquipo').value.trim();
    jornadaTitulo = equipoNombre ? equipoNombre.toUpperCase() : 'Calendario del Equipo';
  } else if (tipoFiltro === 'fecha') {
    jornadaTitulo = encabezadoPorFecha(firstP?.Fecha, partidosOrdenados).titulo;
  } else {
    jornadaTitulo = firstP?.Jornada ? `Jornada ${firstP.Jornada}` : 'Partidos';
  }
  const vueltaTitulo = firstP?.Vuelta === '2' ? 'Segunda Vuelta' : 'Primera Vuelta';

  let equipoDescansa = null;
  let equiposAtrasadosV2 = [];
  if (tipoFiltro === 'jornada') {
    const jornadaNum = String(firstP?.Jornada || '').trim();
    equipoDescansa = descansoParaReporte(jornadaNum);
    equiposAtrasadosV2 = calcularEquiposAtrasados(jornadaNum);
  } else if (tipoFiltro === 'fecha') {
    equiposAtrasadosV2 = calcularEquiposAtrasados(encabezadoPorFecha(firstP?.Fecha, partidosOrdenados).jornadaRef, partidosOrdenados);
  }
  const opcionesPng = tipoFiltro === 'fecha'
    ? { ocultarPagina: true, subtitulo: encabezadoPorFecha(firstP?.Fecha, partidosOrdenados).subtitulo }
    : {};

  const totalPaginas = Math.ceil(partidosOrdenados.length / REPORTE_POR_PAGINA);

  try {
    for (let p = 0; p < totalPaginas; p++) {
      const pagina = partidosOrdenados.slice(p*REPORTE_POR_PAGINA, (p+1)*REPORTE_POR_PAGINA);
      const temp = document.createElement('div');
      temp.style.position = 'fixed';
      temp.style.left = '-9999px';
      temp.style.top = '0';

      const inner = construirPaginaReporteV2(pagina, p+1, totalPaginas, jornadaTitulo, vueltaTitulo, equipoDescansa, equiposAtrasadosV2, opcionesPng);
      temp.appendChild(inner);
      document.body.appendChild(temp);

      await esperarImagenesReporte(temp);

      const canvas = await html2canvas(temp, {
        useCORS: true, allowTaint: true, scale: 4,
        backgroundColor: '#142702', imageTimeout: 20000, logging: false
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = totalPaginas > 1 ? `partidos_nextlevel7_colores_pagina${p+1}.png` : `partidos_nextlevel7_colores.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);

      document.body.removeChild(temp);
      await new Promise(r => setTimeout(r, 400));
    }
  } catch(e) {
    alert('❌ Error: ' + e.message);
  }

  if (btn) { btn.textContent = '⬇ Descargar (escudos chicos)'; btn.disabled = false; }
}

// ===== VARIANTE 3: "escudos 3d" =====
// Sin nombres de equipo, escudos grandes, fecha/jornada/hora en letra grande y 4 partidos por hoja
// (9 y 10 en la primera hoja; 11 y 12 en la segunda). Usa los escudos de las columnas
// logo_local (cuando el equipo juega de local) y logo_visitante (cuando juega de visitante).
const REPORTE_POR_PAGINA_V3 = 4;

// Busca una columna de la hoja Equipos sin importar mayúsculas, guiones bajos o espacios (logo_local, Logo_Local, Logo Local...)
function colEquipo(eq, nombre) {
  const norm = t => String(t || '').toLowerCase().replace(/[\s_\-]/g, '');
  const k = Object.keys(eq || {}).find(c => norm(c) === norm(nombre));
  return k ? String(eq[k] || '').trim() : '';
}

function construirPaginaReporteV3(paginaPartidos, numPagina, totalPaginas, jornadaTitulo, equipoDescansa, equiposAtrasados, opciones) {
  const eqMap = {};
  todosEquipos.forEach(e => { eqMap[String(e['ID_Equipo']).trim()] = e; });

  const inner = document.createElement('div');
  inner.style.cssText = `
    position:relative;
    width:700px;
    min-height:900px;
    background-image:url('fondonuevo.png');
    background-size:cover;
    background-position:center;
    padding:28px 24px 32px;
    box-sizing:border-box;
  `;
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,0.15);z-index:0;`;
  inner.appendChild(overlay);

  const content = document.createElement('div');
  content.style.cssText = 'position:relative;z-index:1;display:flex;flex-direction:column;min-height:844px;';

  opciones = opciones || {};
  const paginaTxt = (totalPaginas > 1 && !opciones.ocultarPagina) ? ` · Página ${numPagina}/${totalPaginas}` : '';
  const subtituloHTML = opciones.subtitulo
    ? `<div style="font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:4px;color:#f5f5f0;margin-top:2px;text-shadow:0 2px 4px rgba(0,0,0,0.8);">${opciones.subtitulo}</div>`
    : '';
  const descansaHTML = (equipoDescansa && numPagina === 1) ? descansoBloqueHTML(equipoDescansa) : '';
  content.innerHTML = `
    <div style="text-align:center;margin-top:220px;margin-bottom:8px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:5px;color:#5eb50d;text-shadow:0 0 18px rgba(94,181,13,0.55),0 2px 4px rgba(0,0,0,0.7);">${jornadaTitulo}${paginaTxt}</div>
      ${subtituloHTML}
    </div>
    ${descansaHTML}
    <div id="reporte-filas" style="flex:1;display:flex;flex-direction:column;justify-content:center;"></div>
    ${numPagina === totalPaginas ? bloqueEquiposAtrasadosHTML(equiposAtrasados) : ''}
  `;

  const filasWrap = content.querySelector('#reporte-filas');
  paginaPartidos.forEach((p, i) => {
    const eqL = eqMap[String(p['Equipo_Local']).trim()] || {};
    const eqV = eqMap[String(p['Equipo_Visita']).trim()] || {};
    // escudo según juegue de local o de visitante (si falta, se usa el escudo normal)
    const urlL = colEquipo(eqL, 'logo_local') || eqL['URL'] || '';
    const urlV = colEquipo(eqV, 'logo_visitante') || eqV['URL'] || '';
    const gL = p['Goles_Local'] !== '' ? p['Goles_Local'] : null;
    const gV = p['Goles_Visita'] !== '' ? p['Goles_Visita'] : null;
    const estado = (p['Estado'] || '').trim();
    const fecha = p['Fecha'] || '';
    const jornadaFila = p['Jornada'] ? `Jornada ${p['Jornada']}${p['Vuelta'] ? ' · Vuelta ' + (p['Vuelta']==='2'?'2':'1') : ''}` : '';
    const hora = p['Hora'] ? formatHora(p['Hora']) : '';
    const cancha = p['Cancha'] || '';
    const jugado = estado === 'Jugado' && gL !== null && gV !== null;
    const centerHTML = jugado
      ? `<div style="font-family:'Bebas Neue',sans-serif;font-size:50px;color:#ddc530;text-shadow:0 0 12px rgba(94,181,13,0.5),0 2px 4px rgba(0,0,0,0.8);letter-spacing:3px;line-height:1;">${gL} - ${gV}</div>`
      : `<div style="font-family:'Bebas Neue',sans-serif;font-size:34px;color:rgba(255,255,255,0.6);letter-spacing:3px;line-height:1;text-shadow:0 2px 4px rgba(0,0,0,0.8);">VS</div>`;

    const sep = i < paginaPartidos.length - 1
      ? `<hr style="border:none;border-top:1px dotted rgba(94,181,13,0.4);margin:0;">`
      : '';

    const fila = document.createElement('div');
    fila.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:14px 0;">
        <div style="width:190px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
          <img src="${urlL}" style="width:182px;height:182px;object-fit:contain;" onerror="this.style.opacity='0.2'">
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:5px;">
          ${jornadaFila ? `<div style="font-family:'Bebas Neue',sans-serif;font-size:27px;color:#5eb50d;letter-spacing:2px;line-height:1.05;text-transform:uppercase;text-shadow:0 2px 4px rgba(0,0,0,0.9);">${jornadaFila}</div>` : ''}
          ${fecha ? `<div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:#f5f5f0;letter-spacing:1.5px;line-height:1;text-shadow:0 2px 4px rgba(0,0,0,0.9);">${fecha}</div>` : ''}
          <div style="width:26px;height:3px;background:#5eb50d;border-radius:2px;margin:1px auto;"></div>
          ${centerHTML}
          ${hora ? `<div style="font-family:'Bebas Neue',sans-serif;font-size:40px;color:#ffd83d;letter-spacing:2px;line-height:1;text-shadow:0 2px 4px rgba(0,0,0,0.9);">${hora}</div>` : ''}
          ${cancha ? `<div style="font-size:16px;color:#5eb50d;font-weight:700;letter-spacing:0.5px;text-shadow:0 2px 4px rgba(0,0,0,0.9);">${cancha}</div>` : ''}
        </div>
        <div style="width:190px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
          <img src="${urlV}" style="width:182px;height:182px;object-fit:contain;" onerror="this.style.opacity='0.2'">
        </div>
      </div>
      ${sep}
    `;
    filasWrap.appendChild(fila);
  });

  inner.appendChild(content);
  return inner;
}

async function downloadPNGv3() {
  if (!ultimosFiltrados.length) { alert('Primero carga los datos de los partidos.'); return; }
  const btn = document.getElementById('dlBtnV3');
  if (btn) { btn.textContent = '⏳ Generando...'; btn.disabled = true; }

  const tipoFiltro = document.getElementById('filterTipo').value;
  const partidosOrdenados = tipoFiltro === 'equipo'
    ? [...ultimosFiltrados]
    : ordenarPorCampoHora(ultimosFiltrados);     // 9:00, 10:00, 11:00, 12:00 (y por campo dentro de la misma hora)
  const firstP = partidosOrdenados[0];
  let jornadaTitulo;
  if (tipoFiltro === 'equipo') {
    const equipoNombre = document.getElementById('filterEquipo').value.trim();
    jornadaTitulo = equipoNombre ? equipoNombre.toUpperCase() : 'Calendario del Equipo';
  } else if (tipoFiltro === 'fecha') {
    jornadaTitulo = encabezadoPorFecha(firstP?.Fecha, partidosOrdenados).titulo;
  } else {
    jornadaTitulo = firstP?.Jornada ? `Jornada ${firstP.Jornada}` : 'Partidos';
  }

  let equipoDescansa = null;
  let equiposAtrasadosV3 = [];
  if (tipoFiltro === 'jornada') {
    const jornadaNum = String(firstP?.Jornada || '').trim();
    equipoDescansa = descansoParaReporte(jornadaNum);
    equiposAtrasadosV3 = calcularEquiposAtrasados(jornadaNum);
  } else if (tipoFiltro === 'fecha') {
    equiposAtrasadosV3 = calcularEquiposAtrasados(encabezadoPorFecha(firstP?.Fecha, partidosOrdenados).jornadaRef, partidosOrdenados);
  }
  const opcionesPng = tipoFiltro === 'fecha'
    ? { ocultarPagina: true, subtitulo: encabezadoPorFecha(firstP?.Fecha, partidosOrdenados).subtitulo }
    : {};

  const totalPaginas = Math.ceil(partidosOrdenados.length / REPORTE_POR_PAGINA_V3);

  try {
    for (let p = 0; p < totalPaginas; p++) {
      const pagina = partidosOrdenados.slice(p*REPORTE_POR_PAGINA_V3, (p+1)*REPORTE_POR_PAGINA_V3);
      const temp = document.createElement('div');
      temp.style.position = 'fixed';
      temp.style.left = '-9999px';
      temp.style.top = '0';

      const inner = construirPaginaReporteV3(pagina, p+1, totalPaginas, jornadaTitulo, equipoDescansa, equiposAtrasadosV3, opcionesPng);
      temp.appendChild(inner);
      document.body.appendChild(temp);

      await esperarImagenesReporte(temp);

      const canvas = await html2canvas(temp, {
        useCORS: true, allowTaint: true, scale: 4,
        backgroundColor: '#142702', imageTimeout: 20000, logging: false
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = totalPaginas > 1 ? `escudos_3d_pagina${p+1}.png` : `escudos_3d.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);

      document.body.removeChild(temp);
      await new Promise(r => setTimeout(r, 400));
    }
  } catch(e) {
    alert('❌ Error: ' + e.message);
  }

  if (btn) { btn.textContent = '⬇ Descargar (escudos 3d)'; btn.disabled = false; }
}

cargarFechasYEquipos();
