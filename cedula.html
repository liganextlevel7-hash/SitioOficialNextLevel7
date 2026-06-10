const CSV_USUARIOS          = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=961328720&single=true&output=csv';
const CSV_PARTIDOS_C        = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1362473459&single=true&output=csv';
const CSV_EQUIPOS_C         = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1894947293&single=true&output=csv';
const CSV_JUGADORES_C       = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1940220650&single=true&output=csv';
const CSV_PARTICIPACIONES_C = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=626975401&single=true&output=csv';
const CSV_EVENTOS_C         = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=645868286&single=true&output=csv';

let usuarioActual = null, modoArbitro = false, partidoActual = null;
let todosJugadores = [], todasParticipaciones = [], todosEquiposC = [], todosPartidosC = [], todosEventosC = [];
let eventosRegistrados = {};

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

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('partidos-section').style.display = 'block';
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('cedula-section').style.display = 'none';
  await cargarDatos();
  renderListaPartidos();
});

async function cargarDatos() {
  document.getElementById('lista-partidos-cedula').innerHTML = '<div style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">Cargando...</div>';
  const [resP, resE, resJ, resPart, resEv] = await Promise.all([
    fetch(CSV_PARTIDOS_C), fetch(CSV_EQUIPOS_C),
    fetch(CSV_JUGADORES_C), fetch(CSV_PARTICIPACIONES_C), fetch(CSV_EVENTOS_C)
  ]);
  todosPartidosC       = parseCSV(await resP.text());
  todosEquiposC        = parseCSV(await resE.text());
  todosJugadores       = parseCSV(await resJ.text());
  todasParticipaciones = parseCSV(await resPart.text());
  todosEventosC        = parseCSV(await resEv.text());
}

function renderListaPartidos() {
  const eqMap = {};
  todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });
  const jugados     = todosPartidosC.filter(p => p.Estado?.trim() === 'Jugado');
  const programados = todosPartidosC.filter(p => p.Estado?.trim() === 'Programado');

  let html = `
  <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
    ${modoArbitro
      ? `<div style="display:flex;align-items:center;gap:10px;">
           <span style="font-size:12px;color:#39ff14;">Modo Arbitro: <b>${usuarioActual?.Nombre||'Arbitro'}</b></span>
           <button onclick="cerrarSesion()" style="padding:6px 12px;background:rgba(255,68,68,0.2);border:1px solid #ff4444;border-radius:8px;color:#ff4444;cursor:pointer;font-size:12px;">Salir</button>
         </div>`
      : `<button onclick="mostrarLogin()" style="padding:8px 16px;background:rgba(57,255,20,0.1);border:1px solid #39ff14;border-radius:8px;color:#39ff14;cursor:pointer;font-size:13px;font-weight:bold;letter-spacing:1px;">Modo Arbitro</button>`
    }
  </div>`;

  if (programados.length) {
    html += `<div style="color:#39ff14;font-size:12px;letter-spacing:2px;margin-bottom:12px;text-transform:uppercase;">PROGRAMADOS</div>`;
    programados.forEach(p => {
      const eqL = eqMap[String(p.Equipo_Local).trim()] || {};
      const eqV = eqMap[String(p.Equipo_Visita).trim()] || {};
      html += `
      <div onclick="abrirCedula('${p.ID_Partido}')" style="background:${modoArbitro?'rgba(57,255,20,0.07)':'rgba(255,255,255,0.04)'};border:1px solid ${modoArbitro?'rgba(57,255,20,0.3)':'rgba(255,255,255,0.1)'};border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="${eqL.URL||''}" style="width:36px;height:36px;object-fit:contain;">
            <span style="font-size:13px;font-weight:700;color:#fff;">${eqL.Nombre||'?'}</span>
          </div>
          <span style="color:#ffd700;font-weight:700;">VS</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:13px;font-weight:700;color:#fff;">${eqV.Nombre||'?'}</span>
            <img src="${eqV.URL||''}" style="width:36px;height:36px;object-fit:contain;">
          </div>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:6px;display:flex;gap:12px;">
          ${p.Jornada?`<span>Jornada ${p.Jornada}</span>`:''}
          ${p.Fecha?`<span>${p.Fecha}</span>`:''}
          ${p.Cancha?`<span>${p.Cancha}</span>`:''}
        </div>
        <div style="font-size:11px;color:${modoArbitro?'rgba(57,255,20,0.7)':'rgba(255,255,255,0.3)'};margin-top:4px;">${modoArbitro?'LLENAR CEDULA':'VER CEDULA'}</div>
      </div>`;
    });
  }

  if (jugados.length) {
    html += `<div style="color:rgba(255,255,255,0.4);font-size:12px;letter-spacing:2px;margin:20px 0 12px;text-transform:uppercase;">JUGADOS</div>`;
    jugados.forEach(p => {
      const eqL = eqMap[String(p.Equipo_Local).trim()] || {};
      const eqV = eqMap[String(p.Equipo_Visita).trim()] || {};
      html += `
      <div onclick="abrirCedula('${p.ID_Partido}')" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;">
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
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:6px;">${p.Jornada?`Jornada ${p.Jornada} · `:''} ${p.Fecha||''}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.25);margin-top:4px;">VER CEDULA</div>
      </div>`;
    });
  }

  document.getElementById('lista-partidos-cedula').innerHTML = html;
}

function mostrarLogin() {
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('login-section').scrollIntoView({behavior:'smooth'});
}

async function iniciarSesion() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const errEl = document.getElementById('login-error');
  errEl.textContent = 'Verificando...';
  try {
    const usuarios = parseCSV(await (await fetch(CSV_USUARIOS)).text());
    const found = usuarios.find(u => u.UsuarioID?.trim()===user && u.Contraseña?.trim()===pass && (u.Perfil?.trim()==='Arbitro'||u.Perfil?.trim()==='Desarrollador'));
    if (!found) { errEl.textContent = 'Usuario o contrasena incorrectos'; return; }
    usuarioActual = found; modoArbitro = true;
    errEl.textContent = '';
    document.getElementById('login-section').style.display = 'none';
    renderListaPartidos();
  } catch(e) { errEl.textContent = 'Error: ' + e.message; }
}

function cerrarSesion() { usuarioActual=null; modoArbitro=false; renderListaPartidos(); }

function actualizarMarcador() {
  let gLocal=0, gVisita=0;
  for (const [jugId, ev] of Object.entries(eventosRegistrados)) {
    const jug = todosJugadores.find(j => String(j.ID_Jugador).trim()===jugId);
    if (!jug) continue;
    if (String(jug.Equipo).trim() === String(partidoActual.Equipo_Local).trim()) gLocal += ev.goles;
    else gVisita += ev.goles;
  }
  const el = document.getElementById('marcador-live');
  if (el) el.textContent = `${gLocal} - ${gVisita}`;
}

function abrirCedula(idPartido) {
  partidoActual = todosPartidosC.find(p => String(p.ID_Partido).trim()===String(idPartido));
  if (!partidoActual) return;
  eventosRegistrados = {};

  const eqMap = {};
  todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });
  const eqL = eqMap[String(partidoActual.Equipo_Local).trim()] || {};
  const eqV = eqMap[String(partidoActual.Equipo_Visita).trim()] || {};
  const estado = partidoActual.Estado?.trim();
  const esEditable = modoArbitro && estado === 'Programado';

  document.getElementById('cedula-header').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;text-align:center;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <img src="${eqL.URL||''}" style="width:60px;height:60px;object-fit:contain;">
        <div style="font-size:13px;font-weight:700;color:#fff;text-transform:uppercase;">${eqL.Nombre||'?'}</div>
      </div>
      <div>
        <div style="font-size:10px;color:rgba(57,255,20,0.6);letter-spacing:2px;">${partidoActual.Jornada?'JORNADA '+partidoActual.Jornada:''}</div>
        <div id="marcador-live" style="font-size:32px;font-weight:900;color:#d4f030;margin:6px 0;">
          ${estado==='Jugado'?`${partidoActual.Goles_Local} - ${partidoActual.Goles_Visita}`:'0 - 0'}
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);">${partidoActual.Fecha||''} · ${partidoActual.Cancha||''}</div>
        <div style="font-size:11px;color:${esEditable?'#39ff14':'rgba(255,255,255,0.3)'};margin-top:4px;">${esEditable?'MODO EDICION':'SOLO CONSULTA'}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <img src="${eqV.URL||''}" style="width:60px;height:60px;object-fit:contain;">
        <div style="font-size:13px;font-weight:700;color:#fff;text-transform:uppercase;">${eqV.Nombre||'?'}</div>
      </div>
    </div>`;

  const partLocal  = todasParticipaciones.filter(p => String(p.Partido).trim()===String(idPartido) && String(p.Equipo).trim()===String(partidoActual.Equipo_Local).trim());
  const partVisita = todasParticipaciones.filter(p => String(p.Partido).trim()===String(idPartido) && String(p.Equipo).trim()===String(partidoActual.Equipo_Visita).trim());

  function getEvsConsulta(jugId) {
    const evs = todosEventosC.filter(e => String(e.Partido).trim()===String(idPartido) && String(e.Jugador).trim()===jugId);
    return { goles:evs.filter(e=>e.Tipo_Evento==='Gol').length, amarilla:evs.some(e=>e.Tipo_Evento==='Amarilla'), roja:evs.some(e=>e.Tipo_Evento==='Roja') };
  }

  function jugadorHTML(part) {
    const jug = todosJugadores.find(j => String(j.ID_Jugador).trim()===String(part.Jugador).trim()) || {};
    const id  = String(part.Jugador).trim();

    if (esEditable) {
      eventosRegistrados[id] = { goles:0, amarilla:false, roja:false, asistencia:false };
      return `
      <div style="display:flex;align-items:center;gap:6px;padding:7px 4px;border-bottom:0.5px solid rgba(255,255,255,0.06);">
        <span style="font-size:11px;font-weight:700;color:rgba(57,255,20,0.7);min-width:22px;">${jug.Numero||'-'}</span>
        <span style="font-size:11px;color:#fff;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${jug.Nombre||'#'+id}</span>
        <div style="display:flex;gap:4px;align-items:center;flex-shrink:0;">
          <button id="btn-asist-${id}" onclick="toggleAsistencia('${id}')" style="background:#111;border:1px solid #555;border-radius:4px;color:#555;width:28px;height:20px;cursor:pointer;font-size:13px;font-weight:700;padding:0;">✓</button>
          <button onclick="quitarGol('${id}')" style="background:#111;border:1px solid #444;border-radius:4px;color:#fff;width:20px;height:20px;cursor:pointer;font-size:12px;padding:0;">-</button>
          <span id="goles-${id}" style="font-size:13px;font-weight:900;color:#d4f030;min-width:14px;text-align:center;">0</span>
          <span style="font-size:10px;color:rgba(255,255,255,0.4);">GOL</span>
          <button onclick="agregarGol('${id}')" style="background:#1a3a1a;border:1px solid #39ff14;border-radius:4px;color:#39ff14;width:20px;height:20px;cursor:pointer;font-size:12px;padding:0;">+</button>
          <button id="btn-am-${id}" onclick="toggleAmarilla('${id}')" style="background:#111;border:1px solid #555;border-radius:4px;color:#888;width:32px;height:20px;cursor:pointer;font-size:10px;font-weight:700;padding:0;">AM</button>
          <button id="btn-rj-${id}" onclick="toggleRoja('${id}')" style="background:#111;border:1px solid #555;border-radius:4px;color:#888;width:32px;height:20px;cursor:pointer;font-size:10px;font-weight:700;padding:0;">RJ</button>
        </div>
      </div>`;
    } else {
      const ev = getEvsConsulta(id);
      const resumen = (ev.goles>0?`${ev.goles} GOL `:'') + (ev.amarilla?'AM ':'') + (ev.roja?'RJ':'');
      return `
      <div style="display:flex;align-items:center;gap:6px;padding:7px 4px;border-bottom:0.5px solid rgba(255,255,255,0.06);">
        <span style="font-size:11px;font-weight:700;color:rgba(57,255,20,0.7);min-width:22px;">${jug.Numero||'-'}</span>
        <span style="font-size:11px;color:#fff;flex:1;">${jug.Nombre||'#'+id}</span>
        <span style="font-size:11px;color:#d4f030;font-weight:700;">${resumen}</span>
      </div>`;
    }
  }

  const htmlL = partLocal.length  ? partLocal.map(jugadorHTML).join('')  : '<div style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;padding:10px;">Sin jugadores</div>';
  const htmlV = partVisita.length ? partVisita.map(jugadorHTML).join('') : '<div style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;padding:10px;">Sin jugadores</div>';

  if (esEditable) {
    document.getElementById('cedula-equipos').innerHTML = `
      <!-- Selector de equipo en movil -->
      <div class="equipo-tabs">
        <div id="tab-local" class="equipo-tab tab-activo" onclick="mostrarTabEquipo('local')">
          <img src="${eqL.URL||''}" style="width:36px;height:36px;object-fit:contain;">
          <span>${eqL.Nombre||'Local'}</span>
        </div>
        <div id="tab-visita" class="equipo-tab" onclick="mostrarTabEquipo('visita')">
          <img src="${eqV.URL||''}" style="width:36px;height:36px;object-fit:contain;">
          <span>${eqV.Nombre||'Visita'}</span>
        </div>
      </div>
      <style>
        .equipo-tabs { display:none; gap:10px; margin-bottom:14px; }
        .equipo-tab {
          flex:1; display:flex; flex-direction:column; align-items:center; gap:6px;
          padding:10px; border-radius:10px; cursor:pointer;
          border:2px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.03);
          transition:0.2s;
        }
        .equipo-tab span { font-size:11px; font-weight:700; color:rgba(255,255,255,0.5); text-transform:uppercase; text-align:center; }
        .equipo-tab.tab-activo { border-color:#39ff14; background:rgba(57,255,20,0.1); }
        .equipo-tab.tab-activo span { color:#39ff14; }
        @media(max-width:600px) { .equipo-tabs { display:flex; } .col-desktop { display:none; } .col-mobile { display:block; } }
        @media(min-width:601px) { .equipo-tabs { display:none; } .col-desktop { display:grid; } .col-mobile { display:none; } }
      </style>
      <!-- Vista desktop: dos columnas -->
      <div class="col-desktop" style="grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;">${eqL.Nombre||'Local'}</div>
          ${htmlL}
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;">${eqV.Nombre||'Visita'}</div>
          ${htmlV}
        </div>
      </div>
      <!-- Vista movil: una columna con tabs -->
      <div class="col-mobile">
        <div id="panel-local">
          <div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;">${eqL.Nombre||'Local'}</div>
          ${htmlL}
        </div>
        <div id="panel-visita" style="display:none;">
          <div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;">${eqV.Nombre||'Visita'}</div>
          ${htmlV}
        </div>
      </div>`;
  } else {
    document.getElementById('cedula-equipos').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;">${eqL.Nombre||'Local'}</div>
          ${htmlL}
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;">${eqV.Nombre||'Visita'}</div>
          ${htmlV}
        </div>
      </div>`;
  }

  document.getElementById('firma-section').style.display  = esEditable ? 'block' : 'none';
  document.getElementById('botones-section').style.display = esEditable ? 'block' : 'none';
  document.getElementById('partidos-section').style.display = 'none';
  document.getElementById('cedula-section').style.display   = 'block';
  if (esEditable) iniciarFirma();
}

function agregarGol(id) {
  eventosRegistrados[id].goles++;
  document.getElementById(`goles-${id}`).textContent = eventosRegistrados[id].goles;
  actualizarMarcador();
}
function quitarGol(id) {
  if (eventosRegistrados[id].goles>0) {
    eventosRegistrados[id].goles--;
    document.getElementById(`goles-${id}`).textContent = eventosRegistrados[id].goles;
    actualizarMarcador();
  }
}
function toggleAmarilla(id) {
  eventosRegistrados[id].amarilla = !eventosRegistrados[id].amarilla;
  const btn = document.getElementById(`btn-am-${id}`);
  btn.style.background = eventosRegistrados[id].amarilla ? '#b8860b' : '#111';
  btn.style.color      = eventosRegistrados[id].amarilla ? '#fff' : '#888';
  btn.style.border     = eventosRegistrados[id].amarilla ? '1px solid #ffd700' : '1px solid #555';
}
function toggleRoja(id) {
  eventosRegistrados[id].roja = !eventosRegistrados[id].roja;
  const btn = document.getElementById(`btn-rj-${id}`);
  btn.style.background = eventosRegistrados[id].roja ? '#8b0000' : '#111';
  btn.style.color      = eventosRegistrados[id].roja ? '#fff' : '#888';
  btn.style.border     = eventosRegistrados[id].roja ? '1px solid #ff4444' : '1px solid #555';
}

function mostrarTabEquipo(tab) {
  document.getElementById('panel-local').style.display  = tab === 'local'  ? 'block' : 'none';
  document.getElementById('panel-visita').style.display = tab === 'visita' ? 'block' : 'none';
  document.getElementById('tab-local').className  = 'equipo-tab' + (tab === 'local'  ? ' tab-activo' : '');
  document.getElementById('tab-visita').className = 'equipo-tab' + (tab === 'visita' ? ' tab-activo' : '');
  // Restaurar estado visual de botones
  for (const [id, ev] of Object.entries(eventosRegistrados)) {
    const btnAsist = document.getElementById(`btn-asist-${id}`);
    const btnAm    = document.getElementById(`btn-am-${id}`);
    const btnRj    = document.getElementById(`btn-rj-${id}`);
    const spanGol  = document.getElementById(`goles-${id}`);
    if (btnAsist) {
      btnAsist.style.background = ev.asistencia ? '#1a3a1a' : '#111';
      btnAsist.style.color      = ev.asistencia ? '#39ff14' : '#555';
      btnAsist.style.border     = ev.asistencia ? '1px solid #39ff14' : '1px solid #555';
    }
    if (btnAm) {
      btnAm.style.background = ev.amarilla ? '#b8860b' : '#111';
      btnAm.style.color      = ev.amarilla ? '#fff' : '#888';
      btnAm.style.border     = ev.amarilla ? '1px solid #ffd700' : '1px solid #555';
    }
    if (btnRj) {
      btnRj.style.background = ev.roja ? '#8b0000' : '#111';
      btnRj.style.color      = ev.roja ? '#fff' : '#888';
      btnRj.style.border     = ev.roja ? '1px solid #ff4444' : '1px solid #555';
    }
    if (spanGol) spanGol.textContent = ev.goles;
  }
}

function toggleAsistencia(id) {
  eventosRegistrados[id].asistencia = !eventosRegistrados[id].asistencia;
  const btn = document.getElementById(`btn-asist-${id}`);
  btn.style.background = eventosRegistrados[id].asistencia ? '#1a3a1a' : '#111';
  btn.style.color      = eventosRegistrados[id].asistencia ? '#39ff14' : '#555';
  btn.style.border     = eventosRegistrados[id].asistencia ? '1px solid #39ff14' : '1px solid #555';
}

function iniciarFirma() {
  ['firma-arbitro','firma-capitan-local','firma-capitan-visita'].forEach(id => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = '#39ff14'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    let drawing = false;
    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width/rect.width, sy = canvas.height/rect.height;
      if (e.touches) return {x:(e.touches[0].clientX-rect.left)*sx, y:(e.touches[0].clientY-rect.top)*sy};
      return {x:(e.clientX-rect.left)*sx, y:(e.clientY-rect.top)*sy};
    }
    canvas.onmousedown = canvas.ontouchstart = e => { e.preventDefault(); drawing=true; const p=getPos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); };
    canvas.onmousemove = canvas.ontouchmove  = e => { e.preventDefault(); if(!drawing)return; const p=getPos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); };
    canvas.onmouseup = canvas.ontouchend = canvas.onmouseleave = () => drawing=false;
  });
}

function limpiarFirma(id) {
  const canvas = document.getElementById(id);
  if (canvas) canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
}

async function guardarCedula() {
  const statusEl = document.getElementById('cedula-status');
  const arbitroNombre = document.getElementById('arbitro-nombre').value.trim();
  if (!arbitroNombre) { statusEl.textContent = 'Escribe el nombre del arbitro'; return; }

  const eqMap = {};
  todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });
  const idCedula = 'CED-' + Date.now();
  const rows = [];

  for (const [jugId, ev] of Object.entries(eventosRegistrados)) {
    const jug = todosJugadores.find(j => String(j.ID_Jugador).trim()===jugId) || {};
    const eqNombre = eqMap[String(jug.Equipo||'').trim()]?.Nombre || '';
    if (ev.asistencia) rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eqNombre, 'Asistencia']);
    for (let g=0; g<ev.goles; g++) rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eqNombre, 'Gol']);
    if (ev.amarilla) rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eqNombre, 'Amarilla']);
    if (ev.roja)     rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eqNombre, 'Roja']);
  }

  if (!rows.length) { statusEl.textContent = 'No hay eventos registrados'; return; }

  const header = 'ID_Cedula\tID_Partido\tID_Jugador\tNombre_Jugador\tEquipo\tTipo_Evento';
  const csvData = rows.map(r => r.join('\t')).join('\n');
  const wrap = document.getElementById('botones-section');
  const existing = wrap.querySelector('.cedula-data-wrap');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'cedula-data-wrap';
  div.innerHTML = `
    <pre style="background:rgba(0,0,0,0.5);border:1px solid #39ff14;border-radius:8px;padding:12px;color:#b8f030;font-size:11px;overflow-x:auto;margin-top:12px;white-space:pre-wrap;">${header}\n${csvData}</pre>
    <button onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent).then(()=>this.textContent='Copiado!')"
      style="margin-top:8px;padding:8px 14px;background:rgba(57,255,20,0.2);border:1px solid #39ff14;border-radius:8px;color:#39ff14;cursor:pointer;font-size:12px;">
      Copiar para pegar en Sheets
    </button>`;
  wrap.appendChild(div);
  statusEl.textContent = `${rows.length} evento(s) listos para copiar`;
}

async function descargarPDF() {
  const statusEl = document.getElementById('cedula-status');
  const arbitroNombre = document.getElementById('arbitro-nombre').value.trim() || 'Sin nombre';
  const capLocal  = document.getElementById('capitan-local-nombre').value.trim()  || 'Sin nombre';
  const capVisita = document.getElementById('capitan-visita-nombre').value.trim() || 'Sin nombre';
  const ganPor = document.getElementById('ganado-por-sel').value;
  statusEl.textContent = 'Generando PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({orientation:'portrait', unit:'mm', format:'a4'});
    const eqMap = {};
    todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });
    const eqL = eqMap[String(partidoActual.Equipo_Local).trim()]  || {};
    const eqV = eqMap[String(partidoActual.Equipo_Visita).trim()] || {};

    // Calcular marcador final
    let gLocal=0, gVisita=0;
    for (const [jugId, ev] of Object.entries(eventosRegistrados)) {
      const jug = todosJugadores.find(j => String(j.ID_Jugador).trim()===jugId);
      if (!jug) continue;
      if (String(jug.Equipo).trim()===String(partidoActual.Equipo_Local).trim()) gLocal+=ev.goles;
      else gVisita+=ev.goles;
    }

    // Fondo
    doc.setFillColor(8,12,20); doc.rect(0,0,210,297,'F');

    // Header
    doc.setFillColor(15,30,10); doc.rect(0,0,210,32,'F');
    doc.setTextColor(184,240,48); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('CEDULA ARBITRAL', 105, 13, {align:'center'});
    doc.setFontSize(10); doc.setTextColor(150,200,80);
    doc.text('LIGA NEXT LEVEL 7', 105, 21, {align:'center'});
    doc.setFontSize(8); doc.setTextColor(100,150,60);
    doc.text(`Partido #${partidoActual.ID_Partido}  |  ${partidoActual.Jornada?'Jornada '+partidoActual.Jornada:''}  |  ${partidoActual.Fecha||''}  |  ${partidoActual.Cancha||''}`, 105, 28, {align:'center'});

    // Equipos y marcador
    doc.setFillColor(12,25,8); doc.rect(0,34,210,20,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(12); doc.setFont('helvetica','bold');
    doc.text((eqL.Nombre||'Local').toUpperCase(), 52, 46, {align:'center'});
    doc.setTextColor(212,240,48); doc.setFontSize(18);
    doc.text(`${gLocal}  -  ${gVisita}`, 105, 47, {align:'center'});
    doc.setTextColor(255,255,255); doc.setFontSize(12);
    doc.text((eqV.Nombre||'Visita').toUpperCase(), 158, 46, {align:'center'});
    if (ganPor) {
      doc.setFontSize(8); doc.setTextColor(255,215,0);
      doc.text(`( ${ganPor} )`, 105, 52, {align:'center'});
    }

    // Columnas jugadores
    const idPartido = String(partidoActual.ID_Partido);
    const partLocal  = todasParticipaciones.filter(p => String(p.Partido).trim()===idPartido && String(p.Equipo).trim()===String(partidoActual.Equipo_Local).trim());
    const partVisita = todasParticipaciones.filter(p => String(p.Partido).trim()===idPartido && String(p.Equipo).trim()===String(partidoActual.Equipo_Visita).trim());

    let y = 62;
    doc.setFontSize(7); doc.setFont('helvetica','bold');
    doc.setTextColor(100,200,60);
    doc.text('NUM  JUGADOR', 13, y);
    doc.text('EVENTOS', 72, y);
    doc.text('NUM  JUGADOR', 113, y);
    doc.text('EVENTOS', 172, y);
    y+=3; doc.setDrawColor(57,255,20,0.5); doc.line(10,y,200,y); y+=4;

    const maxRows = Math.max(partLocal.length, partVisita.length);
    for (let i=0; i<maxRows; i++) {
      if (y>255) { doc.addPage(); doc.setFillColor(8,12,20); doc.rect(0,0,210,297,'F'); y=15; }
      if (i%2===0) { doc.setFillColor(14,22,8); doc.rect(10,y-3,88,7,'F'); doc.rect(110,y-3,88,7,'F'); }

      function renderJug(part, x) {
        if (!part) return;
        const jug = todosJugadores.find(j => String(j.ID_Jugador).trim()===String(part.Jugador).trim()) || {};
        const id  = String(part.Jugador).trim();
        const ev  = eventosRegistrados[id] || {goles:0, amarilla:false, roja:false};
        doc.setFont('helvetica','normal'); doc.setFontSize(7);
        doc.setTextColor(184,240,48); doc.text(String(jug.Numero||'-'), x, y);
        doc.setTextColor(210,210,210); doc.text((jug.Nombre||'').substring(0,20), x+8, y);
        const asistMark = ev.asistencia ? 'V ' : '  ';
        doc.setFont('helvetica','bold'); doc.setTextColor(57,255,20); doc.text(asistMark, x+6, y);
        doc.setTextColor(210,210,210); doc.setFont('helvetica','normal'); doc.text((jug.Nombre||'').substring(0,18), x+10, y);
        const evStr = (ev.goles>0?`${ev.goles}GOL `:'') + (ev.amarilla?'AM ':'') + (ev.roja?'RJ':'');
        if (evStr.trim()) { doc.setFont('helvetica','bold'); doc.setTextColor(212,240,48); doc.text(evStr.trim(), x+62, y); }
      }
      renderJug(partLocal[i], 13);
      renderJug(partVisita[i], 113);
      y+=7;
    }

    // Firmas
    y += 8;
    if (y>230) { doc.addPage(); doc.setFillColor(8,12,20); doc.rect(0,0,210,297,'F'); y=15; }
    doc.setDrawColor(57,255,20); doc.line(10,y,200,y); y+=6;
    doc.setTextColor(184,240,48); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('FIRMAS', 105, y, {align:'center'}); y+=8;

    // Firma arbitro
    const canvasArb = document.getElementById('firma-arbitro');
    doc.addImage(canvasArb.toDataURL('image/png'), 'PNG', 75, y, 60, 20);
    y+=22;
    doc.setTextColor(200,200,200); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text(arbitroNombre, 105, y, {align:'center'});
    doc.setTextColor(100,150,60); doc.setFontSize(7);
    doc.text('ARBITRO', 105, y+4, {align:'center'});
    y+=12;

    // Firmas capitanes
    const canvCapL = document.getElementById('firma-capitan-local');
    const canvCapV = document.getElementById('firma-capitan-visita');
    doc.addImage(canvCapL.toDataURL('image/png'), 'PNG', 15, y, 60, 20);
    doc.addImage(canvCapV.toDataURL('image/png'), 'PNG', 135, y, 60, 20);
    y+=22;
    doc.setTextColor(200,200,200); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text(capLocal,  45, y, {align:'center'});
    doc.text(capVisita, 165, y, {align:'center'});
    doc.setTextColor(100,150,60); doc.setFontSize(7);
    doc.text(`CAPITAN - ${(eqL.Nombre||'').toUpperCase()}`, 45, y+4, {align:'center'});
    doc.text(`CAPITAN - ${(eqV.Nombre||'').toUpperCase()}`, 165, y+4, {align:'center'});
    y+=10;
    doc.setTextColor(80,120,50); doc.setFontSize(7);
    doc.text(new Date().toLocaleString('es-MX'), 105, y, {align:'center'});

    doc.save(`cedula_partido_${partidoActual.ID_Partido}.pdf`);
    statusEl.textContent = 'PDF descargado correctamente';
  } catch(e) {
    statusEl.textContent = 'Error al generar PDF: ' + e.message;
    console.error(e);
  }
}

function volverALista() {
  document.getElementById('cedula-section').style.display   = 'none';
  document.getElementById('partidos-section').style.display = 'block';
  partidoActual = null; eventosRegistrados = {};
}
