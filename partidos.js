const CSV_PARTIDOS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1362473459&single=true&output=csv';
const CSV_EQUIPOS  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1894947293&single=true&output=csv';
const CSV_JUGADORES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1940220650&single=true&output=csv';
const CSV_PARTICIPACIONES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=626975401&single=true&output=csv';
const CSV_EVENTOS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=645868286&single=true&output=csv';

let todosPartidos = [], todosEquipos = [], todosJugadores = [], todasParticipaciones = [], todosEventos = [];
let ultimosFiltrados = [];

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
      background: #080c14; border: 2px solid rgba(184,240,48,0.4);
      border-radius: 18px; width: 100%; max-width: 560px;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 0 30px rgba(184,240,48,0.2);
    }
    .pp-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 10px;
      border-bottom: 1px solid rgba(184,240,48,0.2);
      position: sticky; top:0; background: #080c14; z-index: 1;
    }
    .pp-encuentro {
      font-size: 11px; font-weight: 700; color: rgba(184,240,48,0.6);
      letter-spacing: 2px; text-transform: uppercase; text-align: center; flex:1;
    }
    .pp-close {
      background: none; border: none; color: rgba(255,255,255,0.4);
      font-size: 22px; cursor: pointer; line-height:1; padding: 0 4px;
    }
    .pp-close:hover { color: #b8f030; }
    .pp-teams {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; gap: 8px;
      border-bottom: 1px solid rgba(184,240,48,0.15);
    }
    .pp-team { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
    .pp-team-logo { width: 52px; height: 52px; object-fit: contain; }
    .pp-team-name { font-size: 11px; font-weight: 700; color: #fff; text-transform: uppercase; text-align: center; letter-spacing: 0.5px; }
    .pp-score { font-size: 38px; font-weight: 900; color: #d4f030; text-shadow: 0 0 12px rgba(120,220,0,0.5); letter-spacing: 2px; text-align: center; min-width: 90px; }
    .pp-score.programado { font-size: 20px; color: rgba(255,255,255,0.3); }
    .pp-players { display: grid; grid-template-columns: 1fr 1fr; gap: 0; padding: 0; }
    .pp-col { padding: 12px 10px; }
    .pp-col:first-child { border-right: 1px solid rgba(184,240,48,0.15); }
    .pp-col-title { font-size: 9px; font-weight: 700; color: rgba(184,240,48,0.5); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; text-align: center; }
    .pp-player { display: flex; align-items: center; gap: 6px; padding: 5px 4px; border-radius: 6px; border-bottom: 0.5px solid rgba(255,255,255,0.04); }
    .pp-player-num { font-size: 11px; font-weight: 700; color: rgba(184,240,48,0.6); min-width: 20px; text-align: right; }
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
        const ja = a.Jornada ? Number(a.Jornada) : -1;
        const jb = b.Jornada ? Number(b.Jornada) : -1;
        if (ja === -1 && jb === -1) return Number(b.ID_Partido) - Number(a.ID_Partido);
        if (ja === -1) return 1; if (jb === -1) return -1;
        return jb - ja;
      });
    } else {
      statusEl.textContent = '⚠️ Selecciona un tipo de filtro'; return;
    }
    ultimosFiltrados = filtrados;
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
  cont.innerHTML = '';
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
      </div>
    </div>`;
  });
}

// ===== DESCARGAR PNG =====
async function downloadPNG() {
  if (!ultimosFiltrados.length) { alert('Primero carga los datos de los partidos.'); return; }
  const btn = document.getElementById('dlBtn');
  btn.textContent = '⏳ Generando...';
  btn.disabled = true;
  const eqMap = {};
  todosEquipos.forEach(e => { eqMap[String(e['ID_Equipo']).trim()] = e; });
  const temp = document.createElement('div');
  temp.style.position = 'fixed';
  temp.style.left = '-9999px';
  temp.style.top = '0';
  temp.style.width = '700px';
  temp.style.background = '#0a0a0a';
  temp.style.padding = '24px';
  temp.style.fontFamily = "'Roboto', Arial, sans-serif";
  let html = `<div style="text-align:center;color:#b8f030;font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:3px;margin-bottom:20px;">⚽ DOMINICAL — NEXT LEVEL 7</div>`;
  ultimosFiltrados.forEach(p => {
    const eqL = eqMap[String(p['Equipo_Local']).trim()] || {};
    const eqV = eqMap[String(p['Equipo_Visita']).trim()] || {};
    const nomL = (eqL['Nombre'] || `Equipo ${p['Equipo_Local']}`).toUpperCase();
    const nomV = (eqV['Nombre'] || `Equipo ${p['Equipo_Visita']}`).toUpperCase();
    const urlL = eqL['URL'] || '';
    const urlV = eqV['URL'] || '';
    const gL = p['Goles_Local'] !== '' ? p['Goles_Local'] : '-';
    const gV = p['Goles_Visita'] !== '' ? p['Goles_Visita'] : '-';
    const estado = (p['Estado'] || '').trim();
    const fecha = p['Fecha'] || '';
    const jornadaTxt = p['Jornada'] ? `Jornada ${p['Jornada']}` : 'Jornada ?';
    const scoreTxt = estado === 'Jugado' ? `${gL} - ${gV}` : 'VS';
    html += `
    <div style="background:linear-gradient(160deg,#0d1810,#0a1a0d);border:1px solid rgba(57,255,20,0.3);border-radius:14px;padding:16px;margin-bottom:14px;">
      <div style="font-size:11px;color:#ffd700;font-weight:700;margin-bottom:10px;">#${p.ID_Partido} · ${jornadaTxt} ${fecha?' · '+fecha:''}</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:16px;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:140px;">
          <img src="${urlL}" style="width:50px;height:50px;object-fit:contain;" onerror="this.style.display='none'">
          <div style="font-size:12px;font-weight:700;color:#fff;text-align:center;">${nomL}</div>
        </div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:#d4f030;min-width:70px;text-align:center;">${scoreTxt}</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:140px;">
          <img src="${urlV}" style="width:50px;height:50px;object-fit:contain;" onerror="this.style.display='none'">
          <div style="font-size:12px;font-weight:700;color:#fff;text-align:center;">${nomV}</div>
        </div>
      </div>
    </div>`;
  });
  temp.innerHTML = html;
  document.body.appendChild(temp);
  const imgs = temp.querySelectorAll('img');
  await Promise.all(Array.from(imgs).map(img => new Promise(resolve => {
    if (img.complete) resolve(); else { img.onload = resolve; img.onerror = resolve; }
  })));
  await new Promise(r => setTimeout(r, 500));
  try {
    const canvas = await html2canvas(temp, {
      useCORS: true, allowTaint: true, scale: 2,
      backgroundColor: '#0a0a0a', imageTimeout: 20000, logging: false
    });
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `partidos.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    }, 'image/png');
  } catch(e) { alert('❌ Error: ' + e.message); }
  document.body.removeChild(temp);
  btn.textContent = '⬇ Descargar Lista como PNG';
  btn.disabled = false;
}

cargarFechasYEquipos();
