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
    const jornadaTxt = partido ? `${NL7Juegos.meta(partido)} · ${partido.Fecha || 'Sin fecha'}` : '';
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
  
  document.getElementById('groupFecha').style.display = tipo === 'fecha' ? 'flex' : 'none';
  document.getElementById('groupEquipo').style.display = tipo === 'equipo' ? 'flex' : 'none';
  document.getElementById('statusMsg').textContent = 'Selecciona opción y presiona Cargar Datos';
  document.getElementById('stackContainer').innerHTML = '<div class="empty-msg">CARGA LOS DATOS PARA VER LOS PARTIDOS</div>';
}

function poblarSelectores() {
  // Todos los partidos sin filtrar por vuelta
  const base = todosPartidos;

  const fechas = [...new Set(base.filter(p => p['Fecha'] && p['Fecha'].trim() !== '').map(p => p['Fecha'].trim()))];
  const selFecha = document.getElementById('filterFecha');
  selFecha.innerHTML = '<option value="">— Selecciona una fecha —</option>';
  fechas.sort((a,b)=>parseFecha(b)-parseFecha(a));
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
    todosPartidos        = NL7Juegos.correcciones(parseCSV(await resP.text()));
    todosEquipos         = parseCSV(await resE.text());
    todosJugadores       = parseCSV(await resJ.text());
    todasParticipaciones = parseCSV(await resPart.text());
    todosEventos         = parseCSV(await resEv.text());

    DESCANSOS = todosPartidos.some(p=>p.Jornada) ? calcularDescansos() : {};
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
  const jornada = NL7Juegos.meta(partido);
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
    if (tipo === 'fecha') {
      const fecha = document.getElementById('filterFecha').value;
      if (!fecha) { statusEl.textContent = '⚠️ Selecciona una fecha'; return; }
      filtrados = base.filter(p => p['Fecha'] && p['Fecha'].trim() === fecha);
      if (!filtrados.length) { statusEl.textContent = `⚠️ No hay partidos para el ${fecha}`; return; }
      filtrados = ordenarPorCampoHora(filtrados);
    } else if (tipo === 'equipo') {
      const equipoSel = document.getElementById('filterEquipo').value.trim().toUpperCase();
      if (!equipoSel) { statusEl.textContent = '⚠️ Selecciona un equipo'; return; }
      filtrados = base.filter(p => {
        const eqLocal  = (todosEquipos.find(e => String(e.ID_Equipo) === String(p.Equipo_Local))?.Nombre || '').toUpperCase();
        const eqVisita = (todosEquipos.find(e => String(e.ID_Equipo) === String(p.Equipo_Visita))?.Nombre || '').toUpperCase();
        return eqLocal === equipoSel || eqVisita === equipoSel;
      });
      if (!filtrados.length) { statusEl.textContent = `⚠️ No hay partidos para ${equipoSel}`; return; }
      filtrados.sort((a,b) => (parseFecha(a.Fecha)||9e15)-(parseFecha(b.Fecha)||9e15) || Number(a.ID_Partido)-Number(b.ID_Partido));
    } else {
      statusEl.textContent = '⚠️ Selecciona un tipo de filtro'; return;
    }
    const _act = new Set(todosEquipos.filter(e => (e['Status']||'').trim().toLowerCase() === 'activo').map(e => String(e['ID_Equipo']).trim()));
    const _ok = x => { x = String(x || '').trim(); return !x || _act.has(x); };
    filtrados = filtrados.filter(p => (p['Estado']||'').trim() === 'Jugado' || (_ok(p['Equipo_Local']) && _ok(p['Equipo_Visita'])));
    if (!filtrados.length) { statusEl.textContent = '⚠️ No hay partidos vigentes con ese filtro (los pendientes contra equipos dados de baja ya no cuentan)'; return; }
    filtrados = filtrados.filter(p=>!NL7Juegos.esCubierto(p,todosEquipos));
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
  if(document.getElementById('filterTipo').value==='equipo'&&filtrados.length){
    const nombre=document.getElementById('filterEquipo').value;
    const equipo=todosEquipos.find(e=>String(e.Nombre).toUpperCase()===nombre);
    if(equipo){const r=NL7Juegos.resumen(todosPartidos.filter(p=>!NL7Juegos.esCubierto(p,todosEquipos)&&(NL7Juegos.estado(p)==='jugado'||[p.Equipo_Local,p.Equipo_Visita].every(id=>todosEquipos.some(e=>String(e.ID_Equipo)===String(id)&&String(e.Status).toLowerCase()==='activo')))),equipo.ID_Equipo);cont.innerHTML+=NL7Juegos.resumenHTML(r,equipo,String(equipo.Nombre).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()==='deportivo azul'?1:0);}
  }
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
    const jornadaTxt = 'Encuentro';
    const vueltaTxt = p['Estado'] || '';
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
          <span class="stack-vuelta-tag">${vueltaTxt}</span>
          <span class="stack-id-tag">#${idPartido}</span>
        </div>
        <div class="stack-teams">
          <div class="stack-team">
            <img src="${urlL}" onerror="this.style.opacity='0.2'">
            <div class="stack-team-name">${nomL}</div><div class="juego-numero">${NL7Juegos.etiqueta(p,'local')}</div>
          </div>
          ${scoreHTML}
          <div class="stack-team">
            <img src="${urlV}" onerror="this.style.opacity='0.2'">
            <div class="stack-team-name">${nomV}</div><div class="juego-numero">${NL7Juegos.etiqueta(p,'visita')}</div>
          </div>
        </div>
        <div class="stack-bottom-row">
          ${fecha ? `<span>📅 ${fecha}</span>` : ''}
          ${hora ? `<span>⏰ ${hora}</span>` : ''}
          ${cancha ? `<span>📍 ${cancha}</span>` : ''}
          ${badgeHTML}
        </div>
        ${NL7Juegos.tarjetasExtra(p)}
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

// Jornadas que no se jugaron pero SE TOMAN COMO JUGADAS (cuentan en jornadas, no son descanso ni deuda).
// Deportivo Azul no jugó la J1: se toma como si hubiera jugado contra Puebla 450.
const JORNADAS_VIRTUALES = { 1: [{ equipo: 'Deportivo Azul', vs: 'Puebla 450' }] };
let VIRTUALES = {};       // "idEquipo|jornada" -> true
let VIRTUALES_INFO = [];
let HAY_DESCANSOS = true;  // solo hay descansos cuando los equipos activos son un número impar  // [{ id, nombre, jornada, vs }] para el recordatorio del reporte

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

  // jornadas que se toman como jugadas aunque no haya partido
  VIRTUALES = {}; VIRTUALES_INFO = [];
  Object.keys(JORNADAS_VIRTUALES).forEach(jStr => {
    const j = Number(jStr);
    JORNADAS_VIRTUALES[jStr].forEach(entrada => {
      const ref = typeof entrada === 'string' ? entrada : entrada.equipo;
      const eq = buscarEquipoPorRef(ref);
      if (!eq) return;
      const id = String(eq['ID_Equipo']).trim();
      VIRTUALES[id + '|' + j] = true;
      VIRTUALES_INFO.push({ id, nombre: eq['Nombre'] || ref, jornada: j, vs: typeof entrada === 'string' ? '' : (entrada.vs || '') });
      if (porJ[j]) porJ[j].ids.add(id);
    });
  });

  // con número PAR de equipos activos (p. ej. 16) nadie descansa
  HAY_DESCANSOS = activos.length % 2 === 1;
  if (!HAY_DESCANSOS) { AUSENCIAS = []; JORNADAS_SIN_CAPTURAR = []; DESCANSOS_AVISOS = []; return {}; }

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

function jornadaTomadaComoJugada(idEquipo, jornada) {
  return !!VIRTUALES[String(idEquipo).trim() + '|' + Number(jornada)];
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
  DESCANSOS = todosPartidos.some(p=>p.Jornada) ? calcularDescansos() : {};
  if (!HAY_DESCANSOS) {
    const n = todosEquipos.filter(e => (e['Status'] || '').trim().toLowerCase() === 'activo').length;
    document.getElementById('stackContainer').classList.remove('con-tarjetas');
    document.getElementById('stackContainer').innerHTML = `<div class="editor-panel"><h3>😴 Descansos</h3><div style="font-size:14px;line-height:1.5;color:#f3f5ee;">Con <b>${n} equipos activos</b> (número par) ya no descansa nadie: todos los equipos juegan cada domingo.</div></div>`;
    st.textContent = 'ℹ️ Sin descansos: la liga tiene un número par de equipos';
    return;
  }
  const colores = { 'DESCANSÓ': '#9aa89a', 'DESCANSARÁ': '#ddc530', 'SUGERIDO': '#29a6ff' };
  const listados = new Set();
  let filas = '';
  Object.keys(DESCANSOS).map(Number).sort((a, b) => a - b).forEach(j => {
    const d = DESCANSOS[j];
    d.equipos.forEach(eq => {
      listados.add(eq.id);
      const estado = d.sugerido ? 'SUGERIDO' : (d.jugada ? 'DESCANSÓ' : 'DESCANSARÁ');
      const fecha = d.fechas.length ? d.fechas.join(' / ') : 'Por definir';
      filas += `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:3px 10px;padding:9px 4px;border-bottom:1px dotted rgba(94,181,13,0.3);font-size:13px;">
        <span style="color:#5eb50d;font-weight:700;min-width:74px;">Jornada ${j}</span>
        <span style="color:#fff;font-weight:700;text-transform:uppercase;flex:1;min-width:130px;">${eq.nombre}</span>
        <span style="color:#ddd;font-size:12px;">${fecha}</span>
        <span style="color:${colores[estado]};font-weight:700;font-size:11px;letter-spacing:1px;margin-left:auto;">${estado}</span>
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

// ===== REPORTE PNG DE DESCANSOS · TAMAÑO CARTA (8.5 x 11 in) =====
// Cada página mide 816 x 1056 px (carta vertical a 96 dpi) y se exporta a ~240 dpi.
// Mismo formato del "Rol propuesto del domingo": encabezado verde, recordatorio amarillo, tablas y leyenda.
const LOGOS_ENCABEZADO = ['logo-liga.png.png', 'laregionallstars.png'];  // mismos logos de la página de reportes
const CARTA_ANCHO = 816, CARTA_ALTO = 1056, CARTA_ESCALA = 2.5;

function fechasTxt(fechas) {
  if (!fechas || !fechas.length) return 'Por definir';
  if (fechas.length > 2) return fechas[0] + ' al ' + fechas[fechas.length - 1];
  return fechas.join(' · ');
}

function pillCarta(texto, tipo) {
  const est = {
    gris: 'background:#eeeeee;border:1.5px solid #c4c4c4;color:#555555;',
    ambar: 'background:#fff4d6;border:1.5px solid #e0a82e;color:#8a5a00;',
    azul: 'background:#e8f0fe;border:1.5px solid #4a7fd0;color:#1f4f9c;'
  }[tipo];
  return `<span style="display:inline-block;${est}border-radius:999px;padding:2px 10px;font-size:10.5px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;white-space:nowrap;">${texto}</span>`;
}

function datosReporteDescansos() {
  const eqMap = {};
  todosEquipos.forEach(e => { eqMap[String(e['ID_Equipo']).trim()] = e; });
  const jugados = {};
  todosPartidos.forEach(p => {
    if ((p['Estado'] || '').trim() !== 'Jugado') return;
    [p['Equipo_Local'], p['Equipo_Visita']].forEach(id => { id = String(id || '').trim(); if (id) jugados[id] = (jugados[id] || 0) + 1; });
  });
  Object.keys(VIRTUALES).forEach(k => { const id = k.split('|')[0]; jugados[id] = (jugados[id] || 0) + 1; });

  const fechas = todosPartidos.map(p => (p['Fecha'] || '').trim()).filter(Boolean).sort((a, b) => parseFecha(a) - parseFecha(b));
  const inicio = fechas[0] || '';
  const hoy = new Date();
  const pad = n => String(n).padStart(2, '0');
  const emitido = `${pad(hoy.getDate())}/${pad(hoy.getMonth() + 1)}/${hoy.getFullYear()} ${pad(hoy.getHours())}:${pad(hoy.getMinutes())}`;
  const dias = inicio ? Math.floor((hoy.getTime() - parseFecha(inicio)) / 86400000) : 0;
  return {
    eqMap, jugados, inicio, emitido,
    fechaHoyNum: inicio ? Math.max(1, Math.floor(dias / 7) + 1) : 1,
    nActivos: todosEquipos.filter(e => (e['Status'] || '').trim().toLowerCase() === 'activo').length
  };
}

function escudoCarta(d, id, nombre, px) {
  const e = d.eqMap[id] || {};
  const url = e['URL'] || '';
  if (url) return `<img src="${url}" style="width:${px}px;height:${px}px;object-fit:contain;flex-shrink:0;" onerror="this.style.opacity='0.2'">`;
  return `<div style="width:${px}px;height:${px}px;flex-shrink:0;border-radius:50%;background:#e3e8dc;border:1.5px solid #c9d2bf;display:flex;align-items:center;justify-content:center;font-weight:900;color:#5a6b4a;font-size:${Math.round(px * 0.5)}px;">${(nombre || '?').charAt(0)}</div>`;
}

function encabezadoCarta(d, pagina, total) {
  const primera = pagina === 1;
  return `
    <div style="background:#1d3d06;color:#fff;padding:${primera ? 24 : 16}px 36px ${primera ? 18 : 12}px;display:flex;justify-content:space-between;align-items:center;gap:16px;">
      <div style="min-width:0;">
        <div style="font-size:10px;letter-spacing:3px;font-weight:700;color:#9fd16b;">LIGA NEXT LEVEL 7 · TORNEO DOMINICAL</div>
        <div style="font-size:${primera ? 28 : 22}px;font-weight:800;margin-top:5px;line-height:1.1;">Reporte de descansos${primera ? '' : ' <span style="font-weight:600;color:#cfe3b9;">· continuación</span>'}</div>
        ${primera ? `<div style="font-size:13px;color:#d9e8c8;margin-top:4px;">${d.nActivos} equipos · descansa un equipo por jornada</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0;">
        ${primera ? `<div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px;">${LOGOS_ENCABEZADO.map(u => `<img src="${u}" style="height:52px;width:auto;object-fit:contain;" onerror="this.style.display='none'">`).join('')}</div>` : ''}
        <div style="font-size:11px;color:#d9e8c8;line-height:1.45;">Torneo iniciado el <b style="color:#fff;">${d.inicio}</b><br>Hoy: Fecha ${d.fechaHoyNum} · Emitido ${d.emitido}</div>
      </div>
    </div>
    <div style="height:5px;background:#5eb50d;"></div>`;
}

function recordatorioCarta() {
  const t = [];
  const j1 = DESCANSOS[1];
  if (j1 && !j1.sugerido) j1.equipos.forEach(eq => t.push(`<b>${eq.nombre}</b> descansó en la <b>Jornada 1</b>.`));
  VIRTUALES_INFO.forEach(v => t.push(`<b>${(v.nombre || '').toUpperCase()}</b> <b>no jugó la Jornada ${v.jornada}</b>, pero se toma como si hubiera jugado${v.vs ? ' contra ' + v.vs : ''} (cuenta en jornadas y estadísticas; no es descanso).`));
  if (!t.length) return '';
  return `<div style="background:#fff3d4;border-bottom:2px solid #e0a82e;padding:9px 36px;font-size:11.5px;line-height:1.45;color:#7a5200;">📌 <b>Recordatorio:</b> ${t.join(' ')}</div>`;
}

const CELDA_TH = 'background:#e6efdc;color:#1b3a06;font-size:10.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;padding:7px 4px;border:1px solid #d5dccb;';
const CELDA_TD = 'background:#fff;border:1px solid #d5dccb;padding:4px 6px;vertical-align:middle;';

function tituloSeccionCarta(t) {
  return `<div style="margin:14px 0 6px;font-size:14px;font-weight:900;color:#1b3a06;letter-spacing:.5px;text-transform:uppercase;">${t}</div>`;
}

function tablaDescansoEquipoCarta(d, filas, desde) {
  const trs = filas.map((f, i) => {
    let pill, nota;
    if (f.d.sugerido) { pill = pillCarta('Propuesta', 'azul'); nota = 'Sugerido; falta capturar'; }
    else if (f.d.jugada) { pill = pillCarta('Descansó', 'gris'); nota = 'No tuvo partido'; }
    else { pill = pillCarta('Descansará', 'ambar'); nota = 'Sin partido esa fecha'; }
    const lleva = d.jugados[f.eq.id] || 0;
    return `<tr>
      <td style="${CELDA_TD}text-align:center;color:#6b7280;font-weight:700;font-size:11px;">${desde + i + 1}</td>
      <td style="${CELDA_TD}"><div style="display:flex;align-items:center;gap:8px;">${escudoCarta(d, f.eq.id, f.eq.nombre, 24)}
        <div><div style="font-size:12px;font-weight:800;color:#1f2a1a;text-transform:uppercase;line-height:1.1;">${f.eq.nombre}</div>
        <div style="font-size:9.5px;color:#6b7280;">Lleva ${lleva} jugado${lleva === 1 ? '' : 's'}</div></div></div></td>
      <td style="${CELDA_TD}text-align:center;font-size:15px;font-weight:900;color:#1f2a1a;">J${f.j}</td>
      <td style="${CELDA_TD}text-align:center;font-size:11px;color:#374151;line-height:1.25;">${f.d.sugerido ? 'Por definir' : fechasTxt(f.d.fechas).replace(' · ', '<br>').replace(' al ', '<br>al ')}</td>
      <td style="${CELDA_TD}"><div style="display:flex;align-items:center;gap:7px;">${pill}<span style="font-size:10.5px;color:#4b5563;">${nota}</span></div></td>
    </tr>`;
  }).join('');
  return `<table style="width:100%;border-collapse:collapse;table-layout:fixed;">
    <thead><tr>
      <th style="${CELDA_TH}width:7%;">No.</th><th style="${CELDA_TH}width:31%;">Equipo</th><th style="${CELDA_TH}width:10%;">Jornada</th>
      <th style="${CELDA_TH}width:17%;">Fecha</th><th style="${CELDA_TH}width:35%;">Estado</th>
    </tr></thead><tbody>${trs}</tbody></table>`;
}

function tablaAusenciasCarta(d, items) {
  const trs = items.map(a => {
    const chips = a.ausentes.map(x => {
      const e = d.eqMap[x.id] || {};
      const base = 'display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:3px 11px 3px 5px;margin:2px 4px 2px 0;';
      return x.descanso
        ? `<span style="${base}background:#e6f6e3;border:1.5px solid #5eb50d;">${escudoCarta(d, x.id, x.nombre, 20)}<span style="font-size:11px;font-weight:800;color:#1b6e1b;text-transform:uppercase;">😴 ${x.nombre}</span></span>`
        : `<span style="${base}background:#fdeeee;border:1.5px solid #e57373;">${escudoCarta(d, x.id, x.nombre, 20)}<span style="font-size:11px;font-weight:800;color:#b71c1c;text-transform:uppercase;">${x.nombre}</span><span style="font-size:10px;color:#b71c1c;">· ya descansó J${x.descansoEn}</span></span>`;
    }).join('') || '<span style="font-size:11px;color:#4b5563;">Jugaron todos los equipos.</span>';
    return `<tr>
      <td style="${CELDA_TD}text-align:center;font-size:16px;font-weight:900;color:#1f2a1a;">J${a.jornada}</td>
      <td style="${CELDA_TD}text-align:center;font-size:11px;color:#374151;line-height:1.3;">${fechasTxt(a.fechas).replace(' · ', '<br>').replace(' al ', '<br>al ')}</td>
      <td style="${CELDA_TD}padding:6px 8px;">${chips}</td>
    </tr>`;
  }).join('');
  return `<table style="width:100%;border-collapse:collapse;table-layout:fixed;">
    <thead><tr>
      <th style="${CELDA_TH}width:10%;">Jornada</th><th style="${CELDA_TH}width:17%;">Fecha</th>
      <th style="${CELDA_TH}width:73%;">Equipos que no jugaron · <span style="color:#1b6e1b;">verde = descanso</span> · <span style="color:#b71c1c;">rojo = partido pendiente</span></th>
    </tr></thead><tbody>${trs}</tbody></table>`;
}

function cajaCarta(estilo, html) {
  return `<div style="margin-top:12px;border-radius:10px;padding:10px 16px;font-size:11.5px;line-height:1.5;${estilo}">${html}</div>`;
}

// Devuelve el HTML de cada página tamaño carta
function paginasDescansosHTML() {
  const d = datosReporteDescansos();
  const lista = [];
  Object.keys(DESCANSOS).map(Number).sort((a, b) => a - b).forEach(j => {
    DESCANSOS[j].equipos.forEach(eq => lista.push({ j, d: DESCANSOS[j], eq }));
  });

  // páginas de "Descanso de cada equipo": 18 filas en la primera, 26 en las siguientes
  const bloques = [];
  const CAP1 = 18, CAPN = 26;
  bloques.push({ tipo: 'equipos', filas: lista.slice(0, CAP1), desde: 0 });
  for (let i = CAP1; i < lista.length; i += CAPN) bloques.push({ tipo: 'equipos', filas: lista.slice(i, i + CAPN), desde: i });

  // páginas de "Quién no jugó cada jornada": 8 jornadas por página
  const CAPA = 8;
  for (let i = 0; i < AUSENCIAS.length; i += CAPA) bloques.push({ tipo: 'ausencias', items: AUSENCIAS.slice(i, i + CAPA), primera: i === 0, ultima: i + CAPA >= AUSENCIAS.length });
  if (!AUSENCIAS.length) bloques.push({ tipo: 'ausencias', items: [], primera: true, ultima: true });

  const total = bloques.length;
  const leyenda = cajaCarta('background:#f7f7f4;border:1px solid #dadad2;color:#374151;',
    `<b>Cómo se lee:</b> <b style="color:#555;">Descansó</b>: la jornada ya se jugó y el equipo no tuvo partido. <b style="color:#8a5a00;">Descansará</b>: está en una jornada que aún no se juega. <b style="color:#1f4f9c;">Propuesta</b>: descanso sugerido, todavía sin capturar en la hoja. Cada equipo descansa <b>una vez</b> por vuelta; si vuelve a quedar sin partido, ese partido se considera pendiente.`);

  return bloques.map((b, idx) => {
    const pag = idx + 1;
    let cuerpo = '';
    if (b.tipo === 'equipos') {
      cuerpo = (idx === 0 ? '' : '') + tituloSeccionCarta(idx === 0 ? 'Descanso de cada equipo' : 'Descanso de cada equipo (continuación)') + tablaDescansoEquipoCarta(d, b.filas, b.desde);
      if (idx === bloques.filter(x => x.tipo === 'equipos').length - 1) cuerpo += leyenda;
    } else {
      if (b.primera) {
        cuerpo += cajaCarta('background:#eef3fc;border:1px solid #d3deef;border-left:6px solid #2f6db5;color:#33415c;margin-top:14px;',
          'Si un equipo no jugó una jornada, se toma como <b>descanso</b> la primera vez. Si vuelve a quedar sin partido, ese partido se considera <b>pendiente</b> y aparece en rojo.');
      }
      cuerpo += tituloSeccionCarta('Quién no jugó cada jornada') + tablaAusenciasCarta(d, b.items);
      if (b.ultima) {
        const pend = [];
        if (JORNADAS_SIN_CAPTURAR.length) {
          const ini = JORNADAS_SIN_CAPTURAR[0], fin = JORNADAS_SIN_CAPTURAR[JORNADAS_SIN_CAPTURAR.length - 1];
          pend.push(`<b>Jornada${ini !== fin ? 's ' + ini + ' a ' + fin : ' ' + ini}:</b> los partidos aún no están capturados completos, todavía no se puede saber quién no juega.`);
        }
        const listados = new Set(lista.map(f => f.eq.id));
        const sin = todosEquipos.filter(e => (e['Status'] || '').trim().toLowerCase() === 'activo' && !listados.has(String(e['ID_Equipo']).trim()));
        if (sin.length) pend.push(`<b>Sin descanso asignado:</b> ${sin.map(e => e['Nombre']).join(', ')}.`);
        if (pend.length) cuerpo += cajaCarta('background:#fdeeee;border:1px solid #f0a8a8;color:#b71c1c;', pend.join('<br>'));
      }
    }
    return `<div style="width:${CARTA_ANCHO}px;height:${CARTA_ALTO}px;position:relative;overflow:hidden;background:#fff;color:#1f2a1a;font-family:'Noto Sans','Segoe UI',Roboto,Arial,sans-serif;">
      ${encabezadoCarta(d, pag, total)}
      ${pag === 1 ? recordatorioCarta() : ''}
      <div data-contenido style="padding:0 36px;">${cuerpo}</div>
      <div style="position:absolute;left:0;right:0;bottom:0;border-top:1px solid #dadad2;padding:9px 36px;display:flex;justify-content:space-between;font-size:10px;color:#6b7280;background:#fff;">
        <span>Reporte generado desde los datos de partidos · Liga Next Level 7</span><span>${d.emitido} · Página ${pag} de ${total}</span>
      </div>
    </div>`;
  });
}

async function downloadPNGDescansos() {
  if (!todosEquipos.length || !todosPartidos.length) { alert('Aún no cargan los datos de la hoja, intenta en un momento.'); return; }
  DESCANSOS = todosPartidos.some(p=>p.Jornada) ? calcularDescansos() : {};
  if (!HAY_DESCANSOS) { alert('Con un número par de equipos activos ya no descansa nadie, así que no hay reporte de descansos.'); return; }
  const btn = document.getElementById('dlBtnDesc');
  btn.textContent = '⏳ Generando...';
  btn.disabled = true;
  try {
    DESCANSOS = todosPartidos.some(p=>p.Jornada) ? calcularDescansos() : {};
    const paginas = paginasDescansosHTML();
    for (let i = 0; i < paginas.length; i++) {
      const temp = document.createElement('div');
      temp.style.cssText = `position:fixed;left:-99999px;top:0;width:${CARTA_ANCHO}px;height:${CARTA_ALTO}px;background:#fff;`;
      temp.innerHTML = paginas[i];
      document.body.appendChild(temp);
      await esperarImagenesReporte(temp);
      const canvas = await html2canvas(temp.firstElementChild, {
        useCORS: true, allowTaint: true, scale: CARTA_ESCALA,
        width: CARTA_ANCHO, height: CARTA_ALTO, windowWidth: CARTA_ANCHO,
        backgroundColor: '#ffffff', imageTimeout: 20000, logging: false
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `descansos_nextlevel7_carta_pagina${i + 1}.png`;
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

// ===== PROPUESTA DE JUEGO PARA EQUIPOS QUE DESCANSAN (solo reportes "por fecha") =====
// Si un equipo no tiene partido ese domingo, se propone un juego extra (jornada doble) contra un equipo
// que de verdad deba jornadas (ya descontando los descansos) y con quien aún no haya jugado.
// Solo se calcula cuando la fecha está bien capturada (6 o más partidos y máximo 3 equipos sin partido).
function calcularPropuestas(partidosDia) {
  if (!partidosDia || !partidosDia.length) return null;
  const fecha = (partidosDia[0]['Fecha'] || '').trim();
  if (!fecha || partidosDia.some(p => (p['Fecha'] || '').trim() !== fecha)) return null;
  if (partidosDia.every(p => (p['Estado'] || '').trim() === 'Jugado')) return null;   // fecha ya jugada

  const activos = todosEquipos.filter(e => (e['Status'] || '').trim().toLowerCase() === 'activo');
  const idDe = e => String(e['ID_Equipo']).trim();
  const juegan = new Set();
  partidosDia.forEach(p => { [p['Equipo_Local'], p['Equipo_Visita']].forEach(x => { x = String(x || '').trim(); if (x) juegan.add(x); }); });
  const descansan = activos.filter(e => !juegan.has(idDe(e)));
  if (partidosDia.length < MIN_PARTIDOS_PARA_DETECTAR || descansan.length === 0 || descansan.length > 3) return null;

  const refJ = encabezadoPorFecha(fecha, partidosDia).jornadaRef;
  const deben = {};
  calcularEquiposAtrasados(refJ, partidosDia).forEach(a => { deben[a.id] = a.jornadas; });

  // el equipo que aparece en menos filas es el de los partidos con el rival en blanco (p. ej. Galácticos)
  const cuenta = {};
  todosPartidos.forEach(p => { [p['Equipo_Local'], p['Equipo_Visita']].forEach(x => { x = String(x || '').trim(); if (x) cuenta[x] = (cuenta[x] || 0) + 1; }); });
  const ladoVacio = activos.map(idDe).sort((a, b) => (cuenta[a] || 0) - (cuenta[b] || 0))[0];

  const est = p => (p['Estado'] || '').trim();
  const l = p => String(p['Equipo_Local'] || '').trim(), v = p => String(p['Equipo_Visita'] || '').trim();
  const yaJuegan = (a, b) => todosPartidos.some(p => (est(p) === 'Jugado' || est(p) === 'Programado') && ((l(p) === a && v(p) === b) || (l(p) === b && v(p) === a)));
  const filaPendiente = (a, b) => todosPartidos.find(p => est(p) !== 'Jugado' && est(p) !== 'Programado' && ((l(p) === a && v(p) === b) || (l(p) === b && v(p) === a)))
    || (b === ladoVacio ? todosPartidos.find(p => est(p) !== 'Jugado' && est(p) !== 'Programado' && ((l(p) === a && !v(p)) || (v(p) === a && !l(p)))) : null)
    || (a === ladoVacio ? todosPartidos.find(p => est(p) !== 'Jugado' && est(p) !== 'Programado' && ((l(p) === b && !v(p)) || (v(p) === b && !l(p)))) : null);
  const tiene = (id, jn) => todosPartidos.some(p => (est(p) === 'Jugado') && (l(p) === id || v(p) === id) && Number(p['Jornada']) === jn);

  const usados = new Set(), propuestas = [];
  descansan.forEach(R => {
    const idR = idDe(R);
    const cand = Object.keys(deben).filter(idO => idO !== idR && !usados.has(idO) && !yaJuegan(idR, idO) && filaPendiente(idR, idO))
      .sort((a, b) => deben[b].length - deben[a].length || Number(a) - Number(b));
    if (!cand.length) { propuestas.push({ R, O: null }); return; }
    const idO = cand[0]; usados.add(idO);
    const O = activos.find(e => idDe(e) === idO);
    const comunes = (deben[idO] || []).filter(jn => (deben[idR] || []).includes(jn));
    const libres = (deben[idO] || []).filter(jn => !tiene(idR, jn));
    const jn = comunes.length ? comunes[0] : (libres.length ? libres[0] : (deben[idO] || [])[0]);
    propuestas.push({ R, O, jornada: jn, ambos: comunes.includes(jn), debeO: deben[idO] || [], fila: filaPendiente(idR, idO) });
  });
  return { fecha, descansan, propuestas };
}

function bloquePropuestaHTML(opciones, estilo) {
  const d = opciones && opciones.propuestas;
  if (!d) return '';
  const px = estilo === '3d' ? 112 : (estilo === 'chico' ? 56 : 72);
  const nom = e => ((e && e['Nombre']) || '').toUpperCase();
  const escudo = (e, lado) => {
    const url = (estilo === '3d' ? colEquipo(e, lado === 'v' ? 'logo_visitante' : 'logo_local') : '') || colEquipo(e, 'logo_local') || (e && e['URL']) || '';
    return url
      ? `<img src="${url}" style="width:${px}px;height:${px}px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6));" onerror="this.style.opacity='0.2'">`
      : `<div style="width:${px}px;height:${px}px;display:flex;align-items:center;justify-content:center;text-align:center;border:3px solid #5eb50d;border-radius:16px;background:rgba(0,0,0,0.5);font-family:'Bebas Neue',sans-serif;font-size:${Math.round(px / 6)}px;color:#fff;padding:6px;">${nom(e)}</div>`;
  };
  const filas = d.propuestas.map(p => {
    if (!p.O) return `<div style="font-size:14px;font-weight:700;color:#f5f5f0;margin-top:10px;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${nom(p.R)}: sin rival disponible para jornada doble.</div>`;
    const nota = p.ambos ? `Ambos equipos deben la jornada ${p.jornada}: se ponen al corriente.` : `${nom(p.O)} debe jornada${p.debeO.length > 1 ? 's' : ''} ${p.debeO.join(', ')}; se adelanta la jornada ${p.jornada}.`;
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;">
        <div style="width:${px + 24}px;display:flex;flex-direction:column;align-items:center;gap:4px;">${escudo(p.R, 'l')}${estilo !== '3d' ? `<div style="font-size:12px;font-weight:800;color:#fff;text-transform:uppercase;line-height:1.1;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${nom(p.R)}</div>` : ''}</div>
        <div style="flex:1;text-align:center;display:flex;flex-direction:column;align-items:center;gap:3px;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;color:#5eb50d;">JORNADA ${p.jornada}</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:#f5f5f0;letter-spacing:1.5px;">${d.fecha}</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:32px;color:rgba(255,255,255,0.45);letter-spacing:3px;line-height:1;">VS</div>
          <div style="font-size:12px;font-weight:700;color:#ddc530;">Hora y campo por definir</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:#29a6ff;border:1.5px solid #29a6ff;border-radius:14px;padding:3px 12px 2px;background:rgba(0,0,0,0.45);">PROPUESTA${p.fila && p.fila['ID_Partido'] ? ' · #' + p.fila['ID_Partido'] : ''}</div>
        </div>
        <div style="width:${px + 24}px;display:flex;flex-direction:column;align-items:center;gap:4px;">${escudo(p.O, 'v')}${estilo !== '3d' ? `<div style="font-size:12px;font-weight:800;color:#fff;text-transform:uppercase;line-height:1.1;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${nom(p.O)}</div>` : ''}</div>
      </div>
      <div style="font-size:13px;font-weight:700;color:#f5f5f0;margin-top:8px;line-height:1.35;text-shadow:0 1px 3px rgba(0,0,0,0.95);">${nota}</div>`;
  }).join('');
  return `
    <div style="margin-top:20px;padding:16px 18px 14px;background:rgba(0,0,0,0.72);border:1.5px solid rgba(41,166,255,0.7);border-radius:18px;text-align:center;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:3px;color:#29a6ff;">💡 PROPUESTA · JORNADA DOBLE</div>
      <div style="font-size:14px;font-weight:700;color:#f5f5f0;margin-top:4px;text-shadow:0 1px 3px rgba(0,0,0,0.9);">${HAY_DESCANSOS ? '😴 ' + (d.descansan.length > 1 ? 'Descansan' : 'Descansa') : '🕒 Sin partido'} este domingo: ${d.descansan.map(nom).join(' · ')}</div>
      ${filas}
    </div>`;
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
      const debe = jornadasLigaArr.filter(jn => !jugadas.has(jn) && !programadas.has(jn) && !equipoDescansaEn(idE, jn) && !jornadaTomadaComoJugada(idE, jn));
      if (debe.length) atrasados.push({ id: idE, nombre: (e['Nombre']||'').toUpperCase(), jornadas: debe });
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



// ===== VARIANTE 2: escudo/nombre más chicos, usando el color de playera (Color_Playera) =====


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




function bannerDescansoHTML(){ return ''; }
function calcularPropuestas(){ return null; }
function calcularEquiposAtrasados(){ return []; }
function mostrarDescansos(){
 const lista=todosPartidos.filter(p=>NL7Juegos.estado(p)==='pendiente'&&!NL7Juegos.esCubierto(p,todosEquipos)&&[p.Equipo_Local,p.Equipo_Visita].every(id=>todosEquipos.some(e=>String(e.ID_Equipo)===String(id)&&String(e.Status).toLowerCase()==='activo')));
 document.getElementById('stackContainer').innerHTML=NL7Juegos.documento('Partidos pendientes',NL7Juegos.tabla(lista,todosEquipos));
}
async function downloadPNGDescansos(){
 const el=document.createElement('div');el.innerHTML=NL7Juegos.documento('Partidos pendientes',NL7Juegos.tabla(todosPartidos.filter(p=>NL7Juegos.estado(p)==='pendiente'&&!NL7Juegos.esCubierto(p,todosEquipos)&&[p.Equipo_Local,p.Equipo_Visita].every(id=>todosEquipos.some(e=>String(e.ID_Equipo)===String(id)&&String(e.Status).toLowerCase()==='activo'))),todosEquipos));el.style.cssText='position:absolute;left:-12000px;top:0;width:1000px';document.body.append(el);
 try{const c=await html2canvas(el,{scale:2,backgroundColor:'#fff',useCORS:true});const a=document.createElement('a');a.download='partidos-pendientes.png';a.href=c.toDataURL('image/png');a.click();}finally{el.remove();}
}
// Exportación acotada: cada equipo ocupa su propia columna y el centro no crece con sus etiquetas.
function pngPagina(tipo,partidos,pagina,total,titulo,opciones){
 const G=NL7Juegos,E=Object.fromEntries(todosEquipos.map(e=>[String(e.ID_Equipo).trim(),e]));opciones=opciones||{};
 const root=document.createElement('div');root.className='png-pagina';root.style.cssText="position:relative;width:816px;height:1056px;overflow:hidden;background-color:#071b10;background-image:linear-gradient(rgba(0,15,7,.25),rgba(0,15,7,.25)),url('fondonuevo.png');background-position:center bottom;background-size:100% 180%;padding:24px;box-sizing:border-box;color:#fff;font-family:Arial,sans-serif;";
 const content=document.createElement('div');content.style.cssText='position:relative;z-index:1;';
 const imagen=(url,w,h)=>`<img crossorigin="anonymous" src="${G.esc(url||'logo-liga.png.png')}" alt="" style="display:block;width:${w}px;height:${h}px;object-fit:contain;flex:none;" onerror="this.onerror=null;this.style.opacity='.25'">`;
 const h=document.createElement('div');h.className='png-cabecera';h.style.cssText='height:112px;display:flex;align-items:center;justify-content:center;gap:20px;text-align:center;border-bottom:1px solid #7da632;background:#071b10;box-sizing:border-box;padding:8px;margin-bottom:8px;';
 h.innerHTML=imagen('logo-liga.png.png',76,76)+`<div style="flex:1"><div style="font-size:25px;line-height:1.15;color:#a6dc53;font-weight:bold">${G.esc(titulo)}</div>${opciones.subtitulo?`<div style="font-size:19px;margin-top:5px">${G.esc(opciones.subtitulo)}</div>`:''}<div style="font-size:11px;color:#d4e7be;margin-top:5px">Página ${pagina} de ${total}</div></div>`+imagen('laregionallstars.png',76,76);content.append(h);
 const rows=document.createElement('div');rows.style.cssText='height:620px;';
 for(const p of partidos){
  const row=document.createElement('div');row.className='png-partido';row.dataset.id=String(p.ID_Partido);row.style.cssText='display:grid;grid-template-columns:270px 208px 270px;gap:10px;align-items:center;height:155px;border-bottom:1px dotted #6d922b;box-sizing:border-box;width:768px;';
  const team=lado=>{const e=E[String(p[lado==='local'?'Equipo_Local':'Equipo_Visita']).trim()]||{},nom=e.Nombre||'Equipo por definir',num=G.numero(p,lado),bloque=document.createElement('div');bloque.className='png-equipo';bloque.style.cssText='width:100%;min-width:0;text-align:center;display:flex;flex-direction:column;align-items:center;gap:3px;';
   const juego=num?'Juego '+num+' · '+(lado==='local'?'Local':'Visitante'):(lado==='local'?'Local':'Visitante')+' · Sin número';
   const logo=tipo===3?(colEquipo(e,lado==='local'?'logo_local':'logo_visitante')||e.URL):e.URL;
   const pics=tipo===2?`<div class="png-imagenes" style="display:flex;align-items:center;justify-content:center;gap:22px;${lado==='visita'?'flex-direction:row-reverse;':''}">${imagen(logo,86,92)}${e.Color_Playera?imagen(e.Color_Playera,86,92):''}</div>`:imagen(logo,tipo===3?108:96,96);
   bloque.innerHTML=`<div class="png-numero" style="font-size:12px;color:#c8ef9a;line-height:16px">${G.esc(juego)}</div>${pics}<div class="png-nombre" style="font-size:14px;line-height:16px;font-weight:bold;white-space:normal;overflow-wrap:break-word;max-width:260px;">${G.esc(nom.toUpperCase())}</div>`;return bloque;};
  const mid=document.createElement('div');mid.className='png-centro';mid.style.cssText='width:100%;min-width:0;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px;line-height:1.2;';
  const jugado=G.estado(p)==='jugado'&&p.Goles_Local!==''&&p.Goles_Visita!=='';
  mid.innerHTML=`<div style="font-size:13px">${G.esc(p.Fecha||'Fecha por definir')}</div><div style="font-size:25px;color:#e1e8dc">${jugado?G.esc(p.Goles_Local)+' – '+G.esc(p.Goles_Visita):'VS'}</div><div style="font-size:24px;font-weight:bold;color:#ffd83d">${G.esc(formatHora(p.Hora)||'Por definir')}</div><div style="font-size:14px;color:#c8ef9a">${G.esc(p.Cancha||'Campo por definir')}</div><div style="font-size:10px;color:#c8d7bb">ID ${G.esc(p.ID_Partido)}</div>`;
  row.append(team('local'),mid,team('visita'));rows.append(row);
 }content.append(rows);
 if(pagina===total&&opciones.fechaControl){const footer=document.createElement('div');footer.className='png-control-fechas';footer.style.cssText='margin-top:12px;padding:10px 12px;background:rgba(0,12,6,.92);border:1px solid #5b7c2d;border-radius:8px;font-size:11px;line-height:1.32;box-sizing:border-box;';footer.innerHTML=G.leyendaFechas(todosPartidos,todosEquipos,opciones.fechaControl);content.append(footer);}
 root.append(content);return root;
}
function pngAjustarPagina(root){if(root.firstElementChild.scrollHeight>1008)throw Error('El contenido excede la hoja carta. Reduce la selección.');}
function construirPaginaReporte(p,n,total,t,v,d,a,o){return pngPagina(1,p,n,total,t,o);}
function construirPaginaReporteV2(p,n,total,t,v,d,a,o){return pngPagina(2,p,n,total,t,o);}
function construirPaginaReporteV3(p,n,total,t,d,a,o){return pngPagina(3,p,n,total,t,o);}
let pngEnCurso=false;const pngDescargas=[];
async function pngExportar(tipo){
 if(pngEnCurso)return;pngEnCurso=true;const id=tipo===3?'dlBtnV3':tipo===2?'dlBtnV2':'dlBtn',btn=document.getElementById(id),original=btn?.textContent;let box=null;
 try{
  // Cada descarga usa la selección actual; no obliga a cargar el otro panel del reporte.
  ultimosFiltrados=[];await cargarDatos();if(!ultimosFiltrados.length)throw Error(document.getElementById('statusMsg')?.textContent||'Selecciona fecha o equipo.');
  if(btn){btn.disabled=true;btn.textContent='Preparando imágenes…';}
  if(document.fonts?.ready)await document.fonts.ready;
  const lista=document.getElementById('filterTipo').value==='equipo'?[...ultimosFiltrados]:ordenarPorCampoHora(ultimosFiltrados),porPagina=4,total=Math.ceil(lista.length/porPagina);
  const fecha=document.getElementById('filterTipo').value==='fecha'?document.getElementById('filterFecha').value:'',titulo=fecha?encabezadoPorFecha(fecha,lista).titulo:document.getElementById('filterEquipo').value||'Partidos';
  pngDescargas.splice(0).forEach(u=>URL.revokeObjectURL(u));document.getElementById('png-descargas-listas')?.remove();
  box=document.createElement('div');box.id='png-descargas-listas';box.style.cssText='display:flex;gap:8px;flex-wrap:wrap;padding:14px;border:1px solid #6a913e;border-radius:10px;margin:12px 0;color:#e1f0cf;';box.setAttribute('aria-live','polite');const msg=document.createElement('div');msg.style.width='100%';box.append(msg);(document.getElementById('panel-imagenes')||document.getElementById('stackContainer')).prepend(box);
  for(let i=0;i<total;i++){
   msg.textContent=`Generando página ${i+1} de ${total}…`;
   const temp=document.createElement('div');temp.style.cssText='position:absolute;left:-12000px;top:0;width:700px;';const page=pngPagina(tipo,lista.slice(i*porPagina,(i+1)*porPagina),i+1,total,titulo,{subtitulo:fecha,fechaControl:fecha});temp.append(page);document.body.append(temp);
   try{
    await esperarImagenesReporte(temp);pngAjustarPagina(page);
    const canvas=await html2canvas(page,{useCORS:true,allowTaint:false,scale:window.__NL7_PNG_TEST_SCALE||2,backgroundColor:'#071b10',imageTimeout:20000,logging:false,windowWidth:1200,scrollX:0,scrollY:0});
    const blob=await NL7Juegos.pngCarta(canvas);if(!blob)throw Error('No se pudo preparar la imagen.');const url=URL.createObjectURL(blob);pngDescargas.push(url);canvas.width=canvas.height=0;
    const a=document.createElement('a');a.href=url;a.download=`${tipo===3?'escudos_3d':tipo===2?'partidos_colores':'partidos_lista'}_pagina${i+1}.png`;a.textContent=`Descargar página ${i+1} de ${total}`;a.style.cssText='padding:11px;background:#25441a;color:#fff;border-radius:8px;text-decoration:none;';box.append(a);a.click();
   }finally{temp.remove();}
  }
  msg.textContent=`${total} página${total>1?'s':''} lista${total>1?'s':''}. Si el navegador bloqueó alguna descarga, usa estos botones.`;
 }catch(e){if(box)box.firstChild.textContent='No se completó la exportación: '+e.message;const st=document.getElementById('statusMsg');if(st)st.textContent='Error al generar PNG: '+e.message;}
 finally{pngEnCurso=false;if(btn){btn.disabled=false;btn.textContent=original;}}
}
async function downloadPNG(){return pngExportar(1);}
async function downloadPNGv2(){return pngExportar(2);}
async function downloadPNGv3(){return pngExportar(3);}

cargarFechasYEquipos();


