const CSV_USUARIOS          = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=961328720&single=true&output=csv';
const CSV_PARTIDOS_C        = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1362473459&single=true&output=csv';
const CSV_EQUIPOS_C         = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1894947293&single=true&output=csv';
const CSV_JUGADORES_C       = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1940220650&single=true&output=csv';
const CSV_PARTICIPACIONES_C = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=626975401&single=true&output=csv';
const CSV_EVENTOS_C         = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=645868286&single=true&output=csv';

let usuarioActual = null, modoArbitro = false, partidoActual = null;
let todosJugadores = [], todasParticipaciones = [], todosEquiposC = [], todosPartidosC = [], todosEventosC = [];
let eventosRegistrados = {};
let cronSegundos = 0, cronActivo = false, cronInterval = null;
let datosListos = false;

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
  await cargarDatos();
  datosListos = true;
  renderListaPartidos();
});

async function cargarDatos() {
  document.getElementById('lista-partidos-cedula').innerHTML = '<div style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">Cargando...</div>';
  const [resP,resE,resJ,resPart,resEv] = await Promise.all([
    fetch(CSV_PARTIDOS_C), fetch(CSV_EQUIPOS_C),
    fetch(CSV_JUGADORES_C), fetch(CSV_PARTICIPACIONES_C), fetch(CSV_EVENTOS_C)
  ]);
  todosPartidosC       = parseCSV(await resP.text());
  todosEquiposC        = parseCSV(await resE.text());
  todosJugadores       = parseCSV(await resJ.text());
  todasParticipaciones = parseCSV(await resPart.text());
  todosEventosC        = parseCSV(await resEv.text());
}

// ===== LISTA =====
function renderListaPartidos() {
  const eqMap = {};
  todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });
  const jugados     = todosPartidosC.filter(p => p.Estado?.trim() === 'Jugado');
  const programados = todosPartidosC.filter(p => p.Estado?.trim() === 'Programado');

  let html = `<div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
    ${modoArbitro
      ? `<div style="display:flex;align-items:center;gap:10px;">
           <span style="font-size:12px;color:#39ff14;">Arbitro: <b>${usuarioActual?.Nombre||'Arbitro'}</b></span>
           <button onclick="cerrarSesion()" style="padding:6px 12px;background:rgba(255,68,68,0.2);border:1px solid #ff4444;border-radius:8px;color:#ff4444;cursor:pointer;font-size:12px;touch-action:manipulation;">Salir</button>
         </div>`
      : `<button onclick="mostrarLogin()" style="padding:8px 16px;background:rgba(57,255,20,0.1);border:1px solid #39ff14;border-radius:8px;color:#39ff14;cursor:pointer;font-size:13px;font-weight:bold;touch-action:manipulation;">Modo Arbitro</button>`
    }</div>`;

  if (programados.length) {
    html += `<div style="color:#39ff14;font-size:12px;letter-spacing:2px;margin-bottom:12px;">PROGRAMADOS</div>`;
    programados.forEach(p => {
      const eqL = eqMap[String(p.Equipo_Local).trim()] || {};
      const eqV = eqMap[String(p.Equipo_Visita).trim()] || {};
      html += `<div onclick="abrirCedula('${p.ID_Partido}')" style="background:${modoArbitro?'rgba(57,255,20,0.07)':'rgba(255,255,255,0.04)'};border:1px solid ${modoArbitro?'rgba(57,255,20,0.3)':'rgba(255,255,255,0.1)'};border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:8px;"><img src="${eqL.URL||''}" style="width:36px;height:36px;object-fit:contain;"><span style="font-size:13px;font-weight:700;color:#fff;">${eqL.Nombre||'?'}</span></div>
          <span style="color:#ffd700;font-weight:700;">VS</span>
          <div style="display:flex;align-items:center;gap:8px;"><span style="font-size:13px;font-weight:700;color:#fff;">${eqV.Nombre||'?'}</span><img src="${eqV.URL||''}" style="width:36px;height:36px;object-fit:contain;"></div>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:6px;">${p.Jornada?'Jornada '+p.Jornada+' · ':''} ${p.Fecha||''} ${p.Cancha?'· '+p.Cancha:''}</div>
        <div style="font-size:11px;color:${modoArbitro?'rgba(57,255,20,0.7)':'rgba(255,255,255,0.3)'};margin-top:4px;">${modoArbitro?'LLENAR CEDULA':'VER CEDULA'}</div>
      </div>`;
    });
  }

  if (jugados.length) {
    html += `<div style="color:rgba(255,255,255,0.4);font-size:12px;letter-spacing:2px;margin:20px 0 12px;">JUGADOS</div>`;
    jugados.forEach(p => {
      const eqL = eqMap[String(p.Equipo_Local).trim()] || {};
      const eqV = eqMap[String(p.Equipo_Visita).trim()] || {};
      html += `<div onclick="abrirCedula('${p.ID_Partido}')" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:8px;"><img src="${eqL.URL||''}" style="width:32px;height:32px;object-fit:contain;"><span style="font-size:12px;color:rgba(255,255,255,0.7);">${eqL.Nombre||'?'}</span></div>
          <span style="color:#d4f030;font-weight:900;font-size:18px;">${p.Goles_Local} - ${p.Goles_Visita}</span>
          <div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:rgba(255,255,255,0.7);">${eqV.Nombre||'?'}</span><img src="${eqV.URL||''}" style="width:32px;height:32px;object-fit:contain;"></div>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:6px;">${p.Jornada?'Jornada '+p.Jornada+' · ':''} ${p.Fecha||''}</div>
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
  if (!user || !pass) { errEl.textContent = 'Escribe usuario y contrasena'; return; }
  errEl.textContent = 'Verificando...';
  try {
    if (!datosListos) { await cargarDatos(); datosListos = true; }
    const usuarios = parseCSV(await (await fetch(CSV_USUARIOS)).text());
    const found = usuarios.find(u =>
      u.UsuarioID?.trim()===user &&
      u.Contraseña?.trim()===pass &&
      (u.Perfil?.trim()==='Arbitro' || u.Perfil?.trim()==='Desarrollador')
    );
    if (!found) { errEl.textContent = 'Usuario o contrasena incorrectos'; return; }
    usuarioActual = found; modoArbitro = true;
    errEl.textContent = '';
    document.getElementById('login-section').style.display = 'none';
    renderListaPartidos();
  } catch(e) { errEl.textContent = 'Error: '+e.message; }
}

function cerrarSesion() { usuarioActual=null; modoArbitro=false; renderListaPartidos(); }

// ===== CEDULA =====
function abrirCedula(idPartido) {
  partidoActual = todosPartidosC.find(p => String(p.ID_Partido).trim()===String(idPartido));
  if (!partidoActual) return;
  eventosRegistrados = {};
  cronSegundos = 0; cronActivo = false; clearInterval(cronInterval);

  const eqMap = {};
  todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });
  const eqL = eqMap[String(partidoActual.Equipo_Local).trim()]  || {};
  const eqV = eqMap[String(partidoActual.Equipo_Visita).trim()] || {};
  const estado = partidoActual.Estado?.trim();
  const esEditable = modoArbitro && estado === 'Programado';

  const gL = estado==='Jugado' ? partidoActual.Goles_Local : '0';
  const gV = estado==='Jugado' ? partidoActual.Goles_Visita : '0';

  document.getElementById('cedula-header').innerHTML = `
    ${esEditable ? `
    <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:12px;padding:10px;background:rgba(0,0,0,0.4);border-radius:10px;border:1px solid rgba(57,255,20,0.2);">
      <span id="cron-display" style="font-size:26px;font-weight:900;color:#39ff14;font-family:monospace;min-width:65px;text-align:center;">00:00</span>
      <button id="btn-cron" onclick="toggleCron()" style="padding:7px 14px;background:rgba(57,255,20,0.1);border:1px solid #39ff14;border-radius:8px;color:#39ff14;cursor:pointer;font-size:12px;font-weight:700;touch-action:manipulation;">INICIAR</button>
      <button onclick="resetCron()" style="padding:7px 14px;background:rgba(255,68,68,0.1);border:1px solid #ff4444;border-radius:8px;color:#ff4444;cursor:pointer;font-size:12px;font-weight:700;touch-action:manipulation;">RESET</button>
    </div>` : ''}
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;">
        <img src="${eqL.URL||''}" style="width:50px;height:50px;object-fit:contain;">
        <span style="font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;text-align:center;">${eqL.Nombre||'?'}</span>
      </div>
      <div style="text-align:center;flex:0 0 auto;">
        <div style="font-size:10px;color:rgba(57,255,20,0.6);letter-spacing:1px;">${partidoActual.Jornada?'JORNADA '+partidoActual.Jornada:''}</div>
        <div id="marcador-live" style="font-size:30px;font-weight:900;color:#d4f030;line-height:1.1;">${gL} - ${gV}</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.4);">${partidoActual.Fecha||''}</div>
        <div style="font-size:10px;color:${esEditable?'#39ff14':'rgba(255,255,255,0.3)'};">${esEditable?'MODO EDICION':'SOLO CONSULTA'}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;">
        <img src="${eqV.URL||''}" style="width:50px;height:50px;object-fit:contain;">
        <span style="font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;text-align:center;">${eqV.Nombre||'?'}</span>
      </div>
    </div>`;

  const idP = String(idPartido);
  const partLocal  = todasParticipaciones.filter(p => String(p.Partido).trim()===idP && String(p.Equipo).trim()===String(partidoActual.Equipo_Local).trim());
  const partVisita = todasParticipaciones.filter(p => String(p.Partido).trim()===idP && String(p.Equipo).trim()===String(partidoActual.Equipo_Visita).trim());

  function getEvsConsulta(jugId) {
    const evs = todosEventosC.filter(e => String(e.Partido).trim()===idP && String(e.Jugador).trim()===jugId);
    return {
      goles: evs.filter(e=>e.Tipo_Evento==='Gol').length,
      amarilla: evs.some(e=>e.Tipo_Evento==='Amarilla'),
      roja: evs.some(e=>e.Tipo_Evento==='Roja'),
      asistencia: evs.some(e=>e.Tipo_Evento==='Asistencia')
    };
  }

  function jugHTML(part) {
    const jug = todosJugadores.find(j => String(j.ID_Jugador).trim()===String(part.Jugador).trim()) || {};
    const id  = String(part.Jugador).trim();

    if (esEditable) {
      eventosRegistrados[id] = { goles:0, amarilla:false, amarillaMin:0, roja:false, rojaMin:0, asistencia:false };
      return `
      <div style="display:flex;align-items:center;gap:4px;padding:7px 2px;border-bottom:0.5px solid rgba(255,255,255,0.06);">
        <span style="font-size:11px;font-weight:700;color:rgba(57,255,20,0.7);min-width:20px;">${jug.Numero||'-'}</span>
        <span style="font-size:11px;color:#fff;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${jug.Nombre||'#'+id}</span>
        <button id="btn-v-${id}" onclick="tgV('${id}')" style="width:32px;height:28px;border-radius:4px;border:2px solid #444;background:#111;color:#666;font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">V</button>
        <button onclick="gMenos('${id}')" style="width:28px;height:28px;border-radius:4px;border:2px solid #444;background:#111;color:#fff;font-size:15px;cursor:pointer;line-height:1;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">-</button>
        <span id="g-${id}" style="font-size:14px;font-weight:900;color:#d4f030;min-width:18px;text-align:center;">0</span>
        <button onclick="gMas('${id}')" style="width:28px;height:28px;border-radius:4px;border:2px solid #39ff14;background:#1a3a1a;color:#39ff14;font-size:15px;cursor:pointer;line-height:1;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">+</button>
        <button id="btn-am-${id}" onclick="tgAm('${id}')" style="width:32px;height:28px;border-radius:4px;border:2px solid #444;background:#111;color:#666;font-size:10px;font-weight:700;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">AM</button>
        <button id="btn-rj-${id}" onclick="tgRj('${id}')" style="width:32px;height:28px;border-radius:4px;border:2px solid #444;background:#111;color:#666;font-size:10px;font-weight:700;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">RJ</button>
      </div>`;
    } else {
      const ev = getEvsConsulta(id);
      let res = '';
      if (ev.asistencia) res += 'V ';
      if (ev.goles>0) res += ev.goles+'GOL ';
      if (ev.amarilla) res += 'AM ';
      if (ev.roja) res += 'RJ';
      return `
      <div style="display:flex;align-items:center;gap:6px;padding:7px 2px;border-bottom:0.5px solid rgba(255,255,255,0.06);">
        <span style="font-size:11px;font-weight:700;color:rgba(57,255,20,0.7);min-width:20px;">${jug.Numero||'-'}</span>
        <span style="font-size:11px;color:#fff;flex:1;">${jug.Nombre||'#'+id}</span>
        <span style="font-size:11px;color:#d4f030;font-weight:700;">${res.trim()}</span>
      </div>`;
    }
  }

  const htmlL = partLocal.length  ? partLocal.map(jugHTML).join('')  : '<div style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;padding:10px;">Sin jugadores</div>';
  const htmlV = partVisita.length ? partVisita.map(jugHTML).join('') : '<div style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;padding:10px;">Sin jugadores</div>';

  if (esEditable) {
    document.getElementById('cedula-equipos').innerHTML = `
      <style>
        @media(max-width:600px){.col-desk{display:none!important;}.col-mob{display:block!important;}}
        @media(min-width:601px){.col-desk{display:grid!important;}.col-mob{display:none!important;}}
      </style>
      <div class="col-desk" style="grid-template-columns:1fr 1fr;gap:12px;">
        <div><div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;">${eqL.Nombre||'Local'}</div>${htmlL}</div>
        <div><div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;">${eqV.Nombre||'Visita'}</div>${htmlV}</div>
      </div>
      <div class="col-mob" style="display:none;">
        <div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;border-bottom:1px solid rgba(57,255,20,0.3);padding-bottom:6px;">${eqL.Nombre||'Local'}</div>
        ${htmlL}
        <div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin:14px 0 8px;text-align:center;border-bottom:1px solid rgba(57,255,20,0.3);padding-bottom:6px;">${eqV.Nombre||'Visita'}</div>
        ${htmlV}
      </div>`;
  } else {
    document.getElementById('cedula-equipos').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div><div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;">${eqL.Nombre||'Local'}</div>${htmlL}</div>
        <div><div style="font-size:10px;font-weight:700;color:rgba(57,255,20,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-align:center;">${eqV.Nombre||'Visita'}</div>${htmlV}</div>
      </div>`;
  }

  document.getElementById('firma-section').style.display   = esEditable ? 'block' : 'none';
  document.getElementById('botones-section').style.display = esEditable ? 'block' : 'none';
  document.getElementById('partidos-section').style.display = 'none';
  document.getElementById('cedula-section').style.display   = 'block';
  if (esEditable) iniciarFirma();
}

// ===== CRONOMETRO =====
function getMinuto() { return Math.floor(cronSegundos/60)+1; }
function toggleCron() {
  if (cronActivo) {
    cronActivo = false; clearInterval(cronInterval);
    document.getElementById('btn-cron').textContent = 'REANUDAR';
  } else {
    cronActivo = true;
    cronInterval = setInterval(() => {
      cronSegundos++;
      const m = String(Math.floor(cronSegundos/60)).padStart(2,'0');
      const s = String(cronSegundos%60).padStart(2,'0');
      const el = document.getElementById('cron-display');
      if (el) el.textContent = m+':'+s;
    }, 1000);
    document.getElementById('btn-cron').textContent = 'PAUSAR';
  }
}
function resetCron() {
  cronActivo = false; clearInterval(cronInterval); cronSegundos = 0;
  const el = document.getElementById('cron-display');
  if (el) el.textContent = '00:00';
  const btn = document.getElementById('btn-cron');
  if (btn) btn.textContent = 'INICIAR';
}

// ===== EVENTOS =====
function tgV(id) {
  eventosRegistrados[id].asistencia = !eventosRegistrados[id].asistencia;
  const btn = document.getElementById('btn-v-'+id);
  btn.style.background = eventosRegistrados[id].asistencia ? '#1a3a1a' : '#111';
  btn.style.color      = eventosRegistrados[id].asistencia ? '#39ff14' : '#666';
  btn.style.borderColor= eventosRegistrados[id].asistencia ? '#39ff14' : '#444';
}
function tgAm(id) {
  eventosRegistrados[id].amarilla = !eventosRegistrados[id].amarilla;
  if (eventosRegistrados[id].amarilla) eventosRegistrados[id].amarillaMin = getMinuto();
  const btn = document.getElementById('btn-am-'+id);
  btn.style.background = eventosRegistrados[id].amarilla ? '#b8860b' : '#111';
  btn.style.color      = eventosRegistrados[id].amarilla ? '#fff'    : '#666';
  btn.style.borderColor= eventosRegistrados[id].amarilla ? '#ffd700' : '#444';
}
function tgRj(id) {
  eventosRegistrados[id].roja = !eventosRegistrados[id].roja;
  if (eventosRegistrados[id].roja) eventosRegistrados[id].rojaMin = getMinuto();
  const btn = document.getElementById('btn-rj-'+id);
  btn.style.background = eventosRegistrados[id].roja ? '#8b0000' : '#111';
  btn.style.color      = eventosRegistrados[id].roja ? '#fff'    : '#666';
  btn.style.borderColor= eventosRegistrados[id].roja ? '#ff4444' : '#444';
}
function gMas(id) {
  eventosRegistrados[id].goles++;
  document.getElementById('g-'+id).textContent = eventosRegistrados[id].goles;
  actualizarMarcador();
}
function gMenos(id) {
  if (eventosRegistrados[id].goles > 0) {
    eventosRegistrados[id].goles--;
    document.getElementById('g-'+id).textContent = eventosRegistrados[id].goles;
    actualizarMarcador();
  }
}
function actualizarMarcador() {
  let gL=0, gV=0;
  for (const [jugId, ev] of Object.entries(eventosRegistrados)) {
    const jug = todosJugadores.find(j => String(j.ID_Jugador).trim()===jugId);
    if (!jug) continue;
    if (String(jug.Equipo).trim()===String(partidoActual.Equipo_Local).trim()) gL+=ev.goles;
    else gV+=ev.goles;
  }
  const el = document.getElementById('marcador-live');
  if (el) el.textContent = gL+' - '+gV;
}

// ===== FIRMA =====
function iniciarFirma() {
  ['firma-arbitro','firma-capitan-local','firma-capitan-visita'].forEach(cid => {
    const canvas = document.getElementById(cid);
    if (!canvas) return;
    canvas._init = false;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#39ff14'; ctx.lineWidth=2; ctx.lineCap='round';
    let drawing=false;
    function pos(e) {
      const r=canvas.getBoundingClientRect(), sx=canvas.width/r.width, sy=canvas.height/r.height;
      if(e.touches) return {x:(e.touches[0].clientX-r.left)*sx, y:(e.touches[0].clientY-r.top)*sy};
      return {x:(e.clientX-r.left)*sx, y:(e.clientY-r.top)*sy};
    }
    canvas.onmousedown=e=>{drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);};
    canvas.ontouchstart=e=>{e.preventDefault();drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);};
    canvas.onmousemove=e=>{if(!drawing)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();};
    canvas.ontouchmove=e=>{e.preventDefault();if(!drawing)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();};
    canvas.onmouseup=canvas.ontouchend=canvas.onmouseleave=()=>drawing=false;
  });
}

function limpiarFirma(id) {
  const c=document.getElementById(id);
  if(c) c.getContext('2d').clearRect(0,0,c.width,c.height);
}

// ===== GUARDAR =====
function guardarCedula() {
  const statusEl = document.getElementById('cedula-status');
  const arbitro = document.getElementById('arbitro-nombre').value.trim();
  if (!arbitro) { statusEl.textContent = 'Escribe el nombre del arbitro'; return; }

  const eqMap = {};
  todosEquiposC.forEach(e => { eqMap[String(e.ID_Equipo).trim()] = e; });
  const idCedula = 'CED-'+Date.now();
  const rows = [];

  for (const [jugId, ev] of Object.entries(eventosRegistrados)) {
    const jug = todosJugadores.find(j => String(j.ID_Jugador).trim()===jugId) || {};
    const eq = eqMap[String(jug.Equipo||'').trim()]?.Nombre || '';
    if (ev.asistencia) rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eq, 'Asistencia', '']);
    for (let g=0; g<ev.goles; g++) rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eq, 'Gol', getMinuto()]);
    if (ev.amarilla) rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eq, 'Amarilla', ev.amarillaMin]);
    if (ev.roja)     rows.push([idCedula, partidoActual.ID_Partido, jugId, jug.Nombre||'', eq, 'Roja', ev.rojaMin]);
  }

  if (!rows.length) { statusEl.textContent = 'No hay eventos registrados'; return; }

  const header = 'ID_Cedula\tID_Partido\tID_Jugador\tNombre\tEquipo\tTipo_Evento\tMinuto';
  const data   = rows.map(r=>r.join('\t')).join('\n');
  const wrap   = document.getElementById('cedula-data-wrap');
  wrap.innerHTML = `
    <pre style="background:rgba(0,0,0,0.5);border:1px solid #39ff14;border-radius:8px;padding:12px;color:#b8f030;font-size:11px;overflow-x:auto;white-space:pre-wrap;">${header}\n${data}</pre>
    <button onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent).then(()=>this.textContent='Copiado!')"
      style="margin-top:8px;padding:8px 14px;background:rgba(57,255,20,0.2);border:1px solid #39ff14;border-radius:8px;color:#39ff14;cursor:pointer;font-size:12px;touch-action:manipulation;">
      Copiar para pegar en Sheets
    </button>`;
  statusEl.textContent = rows.length+' evento(s) listos para copiar';
}

// ===== PDF =====
async function descargarPDF() {
  const statusEl = document.getElementById('cedula-status');
  const arbitro   = document.getElementById('arbitro-nombre').value.trim() || 'Sin nombre';
  const capLocal  = document.getElementById('capitan-local-nombre').value.trim()  || 'Sin nombre';
  const capVisita = document.getElementById('capitan-visita-nombre').value.trim() || 'Sin nombre';
  const ganPor    = document.getElementById('ganado-por-sel').value;
  statusEl.textContent = 'Generando PDF...';

  try {
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    const eqMap = {};
    todosEquiposC.forEach(e=>{eqMap[String(e.ID_Equipo).trim()]=e;});
    const eqL = eqMap[String(partidoActual.Equipo_Local).trim()]  || {};
    const eqV = eqMap[String(partidoActual.Equipo_Visita).trim()] || {};

    let gL=0, gV=0;
    for (const [jugId,ev] of Object.entries(eventosRegistrados)) {
      const jug=todosJugadores.find(j=>String(j.ID_Jugador).trim()===jugId);
      if(!jug) continue;
      if(String(jug.Equipo).trim()===String(partidoActual.Equipo_Local).trim()) gL+=ev.goles;
      else gV+=ev.goles;
    }

    doc.setFillColor(8,12,20); doc.rect(0,0,210,297,'F');
    doc.setFillColor(15,30,10); doc.rect(0,0,210,32,'F');
    doc.setTextColor(184,240,48); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('CEDULA ARBITRAL',105,13,{align:'center'});
    doc.setFontSize(10); doc.setTextColor(150,200,80);
    doc.text('LIGA NEXT LEVEL 7',105,21,{align:'center'});
    doc.setFontSize(8); doc.setTextColor(100,150,60);
    doc.text('Partido #'+partidoActual.ID_Partido+' | '+(partidoActual.Jornada?'Jornada '+partidoActual.Jornada:'')+' | '+(partidoActual.Fecha||'')+' | '+(partidoActual.Cancha||''),105,28,{align:'center'});

    doc.setFillColor(12,25,8); doc.rect(0,34,210,20,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(12); doc.setFont('helvetica','bold');
    doc.text((eqL.Nombre||'Local').toUpperCase(),52,46,{align:'center'});
    doc.setTextColor(212,240,48); doc.setFontSize(18);
    doc.text(gL+'  -  '+gV,105,47,{align:'center'});
    doc.setTextColor(255,255,255); doc.setFontSize(12);
    doc.text((eqV.Nombre||'Visita').toUpperCase(),158,46,{align:'center'});
    if(ganPor){doc.setFontSize(8);doc.setTextColor(255,215,0);doc.text('( '+ganPor+' )',105,52,{align:'center'});}

    const idP = String(partidoActual.ID_Partido);
    const pL  = todasParticipaciones.filter(p=>String(p.Partido).trim()===idP&&String(p.Equipo).trim()===String(partidoActual.Equipo_Local).trim());
    const pV  = todasParticipaciones.filter(p=>String(p.Partido).trim()===idP&&String(p.Equipo).trim()===String(partidoActual.Equipo_Visita).trim());

    let y=62;
    doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(100,200,60);
    doc.text('A  NUM  JUGADOR',13,y); doc.text('EVENTOS',75,y);
    doc.text('A  NUM  JUGADOR',113,y); doc.text('EVENTOS',175,y);
    y+=3; doc.setDrawColor(57,255,20); doc.line(10,y,200,y); y+=4;

    const maxR=Math.max(pL.length,pV.length);
    for(let i=0;i<maxR;i++){
      if(y>255){doc.addPage();doc.setFillColor(8,12,20);doc.rect(0,0,210,297,'F');y=15;}
      if(i%2===0){doc.setFillColor(14,22,8);doc.rect(10,y-3,88,7,'F');doc.rect(110,y-3,88,7,'F');}

      function rj(part,x){
        if(!part)return;
        const jug=todosJugadores.find(j=>String(j.ID_Jugador).trim()===String(part.Jugador).trim())||{};
        const id=String(part.Jugador).trim();
        const ev=eventosRegistrados[id]||{goles:0,amarilla:false,roja:false,asistencia:false};
        doc.setFontSize(7); doc.setFont('helvetica','bold');
        if(ev.asistencia){doc.setTextColor(57,255,20);doc.text('V',x,y);}
        else{doc.setTextColor(60,60,60);doc.text('-',x,y);}
        doc.setTextColor(184,240,48); doc.text(String(jug.Numero||'-'),x+5,y);
        doc.setFont('helvetica','normal'); doc.setTextColor(210,210,210);
        doc.text((jug.Nombre||'').substring(0,20),x+12,y);
        const evStr=(ev.goles>0?ev.goles+'GOL ':'')+(ev.amarilla?'AM ':'')+(ev.roja?'RJ':'');
        if(evStr.trim()){doc.setFont('helvetica','bold');doc.setTextColor(212,240,48);doc.text(evStr.trim(),x+62,y);}
      }
      rj(pL[i],13); rj(pV[i],113); y+=7;
    }

    y+=8;
    if(y>230){doc.addPage();doc.setFillColor(8,12,20);doc.rect(0,0,210,297,'F');y=15;}
    doc.setDrawColor(57,255,20); doc.line(10,y,200,y); y+=6;
    doc.setTextColor(184,240,48); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('FIRMAS',105,y,{align:'center'}); y+=8;

    const cArb=document.getElementById('firma-arbitro');
    doc.addImage(cArb.toDataURL('image/png'),'PNG',75,y,60,20); y+=22;
    doc.setTextColor(200,200,200); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text(arbitro,105,y,{align:'center'});
    doc.setTextColor(100,150,60); doc.setFontSize(7); doc.text('ARBITRO',105,y+4,{align:'center'}); y+=12;

    const cCL=document.getElementById('firma-capitan-local');
    const cCV=document.getElementById('firma-capitan-visita');
    doc.addImage(cCL.toDataURL('image/png'),'PNG',15,y,60,20);
    doc.addImage(cCV.toDataURL('image/png'),'PNG',135,y,60,20); y+=22;
    doc.setTextColor(200,200,200); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text(capLocal,45,y,{align:'center'}); doc.text(capVisita,165,y,{align:'center'});
    doc.setTextColor(100,150,60); doc.setFontSize(7);
    doc.text('CAPITAN - '+(eqL.Nombre||'').toUpperCase(),45,y+4,{align:'center'});
    doc.text('CAPITAN - '+(eqV.Nombre||'').toUpperCase(),165,y+4,{align:'center'});
    y+=10; doc.setTextColor(80,120,50); doc.setFontSize(7);
    doc.text(new Date().toLocaleString('es-MX'),105,y,{align:'center'});

    doc.save('cedula_partido_'+partidoActual.ID_Partido+'.pdf');
    statusEl.textContent = 'PDF descargado correctamente';
  } catch(e) {
    statusEl.textContent = 'Error: '+e.message;
    console.error(e);
  }
}

function volverALista() {
  document.getElementById('cedula-section').style.display   = 'none';
  document.getElementById('partidos-section').style.display = 'block';
  partidoActual=null; eventosRegistrados={};
}
