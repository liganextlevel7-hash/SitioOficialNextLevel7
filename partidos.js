document.getElementById('flyerBg').src = 'fondo-partidos.png';

const CSV_PARTIDOS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1362473459&single=true&output=csv';
const CSV_EQUIPOS  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1894947293&single=true&output=csv';

let todosPartidos = [], todosEquipos = [];

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

function phSVG() {
  return `<svg style="width:36px;height:36px;opacity:0.22;" viewBox="0 0 60 60"><circle cx="30" cy="22" r="12" fill="white" opacity="0.4"/><path d="M10 54c0-11 9-18 20-18s20 7 20 18" fill="white" opacity="0.4"/></svg>`;
}

function cambiarFiltro() {
  const tipo = document.getElementById('filterTipo').value;
  document.getElementById('groupJornada').style.display = tipo === 'jornada' ? 'flex' : 'none';
  document.getElementById('groupFecha').style.display = tipo === 'fecha' ? 'flex' : 'none';
  document.getElementById('groupEquipo').style.display = tipo === 'equipo' ? 'flex' : 'none';
  document.getElementById('statusMsg').textContent = 'Selecciona opción y presiona Cargar Datos';
  document.getElementById('encFlyer').innerHTML = '';
  document.getElementById('jornadaDisplay').textContent = 'DOMINICAL';
}

async function cargarFechasYEquipos() {
  try {
    const [resP, resE] = await Promise.all([fetch(CSV_PARTIDOS), fetch(CSV_EQUIPOS)]);
    todosPartidos = parseCSV(await resP.text());
    todosEquipos = parseCSV(await resE.text());
    document.getElementById('statusMsg').textContent = `📊 ${todosPartidos.length} partidos cargados`;

    const fechas = [...new Set(todosPartidos.filter(p => p['Fecha'] && p['Fecha'].trim() !== '').map(p => p['Fecha'].trim()))];
    const selFecha = document.getElementById('filterFecha');
    selFecha.innerHTML = '<option value="">— Selecciona una fecha —</option>';
    fechas.forEach(f => selFecha.innerHTML += `<option value="${f}">${f}</option>`);

    const equiposSet = new Set();
    todosEquipos.forEach(e => {
      if (e['Nombre']) equiposSet.add(e['Nombre'].toUpperCase());
    });
    const selEquipo = document.getElementById('filterEquipo');
    selEquipo.innerHTML = '<option value="">— Selecciona un equipo —</option>';
    Array.from(equiposSet).sort().forEach(eq => selEquipo.innerHTML += `<option value="${eq}">${eq}</option>`);

    document.getElementById('statusMsg').textContent = 'Selecciona filtro y presiona Cargar Datos';
  } catch(e) {
    document.getElementById('statusMsg').textContent = '❌ Error: ' + e.message;
  }
}

async function cargarDatos() {
  const tipo = document.getElementById('filterTipo').value;
  const statusEl = document.getElementById('statusMsg');
  statusEl.textContent = '⏳ Cargando datos...';

  try {
    let filtrados = [];
    if (tipo === 'jornada') {
      const jornada = document.getElementById('filterJornada').value;
      if (!jornada) { statusEl.textContent = '⚠️ Selecciona una jornada'; return; }
      filtrados = todosPartidos.filter(p => String(p['Jornada']).trim() === String(jornada));
      if (!filtrados.length) { statusEl.textContent = `⚠️ No hay partidos para Jornada ${jornada}`; return; }
      document.getElementById('jornadaDisplay').textContent = `DOMINICAL — JORNADA ${jornada}`;
    } else if (tipo === 'fecha') {
      const fecha = document.getElementById('filterFecha').value;
      if (!fecha) { statusEl.textContent = '⚠️ Selecciona una fecha'; return; }
      filtrados = todosPartidos.filter(p => p['Fecha'].trim() === fecha);
      if (!filtrados.length) { statusEl.textContent = `⚠️ No hay partidos para el ${fecha}`; return; }
      document.getElementById('jornadaDisplay').textContent = `DOMINICAL — ${fecha}`;
    } else if (tipo === 'equipo') {
      const equipoSel = document.getElementById('filterEquipo').value.trim().toUpperCase();
      if (!equipoSel) { statusEl.textContent = '⚠️ Selecciona un equipo'; return; }
      filtrados = todosPartidos.filter(p => {
        const eqLocal = (todosEquipos.find(e => String(e.ID_Equipo) === String(p.Equipo_Local))?.Nombre || '').toUpperCase();
        const eqVisita = (todosEquipos.find(e => String(e.ID_Equipo) === String(p.Equipo_Visita))?.Nombre || '').toUpperCase();
        return eqLocal === equipoSel || eqVisita === equipoSel;
      });
      if (!filtrados.length) { statusEl.textContent = `⚠️ No hay partidos para el equipo ${equipoSel}`; return; }
      document.getElementById('jornadaDisplay').textContent = `DOMINICAL — EQUIPO ${equipoSel}`;
    } else {
      statusEl.textContent = '⚠️ Selecciona un tipo de filtro';
      return;
    }

    const eqMap = {};
    todosEquipos.forEach(e => { eqMap[String(e['ID_Equipo']).trim()] = e; });

    const cont = document.getElementById('encFlyer');
    cont.innerHTML = '';

    filtrados.forEach(p => {
      const eqL = eqMap[String(p['Equipo_Local']).trim()] || {};
      const eqV = eqMap[String(p['Equipo_Visita']).trim()] || {};
      const nomL = (eqL['Nombre'] || `Equipo ${p['Equipo_Local']}`).toUpperCase();
      const nomV = (eqV['Nombre'] || `Equipo ${p['Equipo_Visita']}`).toUpperCase();
      const urlL = eqL['URL'] || '';
      const urlV = eqV['URL'] || '';
      const logoL = urlL ? `<img src="${urlL}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;">` : phSVG();
      const logoV = urlV ? `<img src="${urlV}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;">` : phSVG();
      const gL = p['Goles_Local'] !== '' ? p['Goles_Local'] : '-';
      const gV = p['Goles_Visita'] !== '' ? p['Goles_Visita'] : '-';
      const ganPor = (p['Ganado_Por'] || '').trim().toUpperCase();
      const ganPorClass = ganPor.toLowerCase();
      const hora = formatHora(p['Hora']);
      const jornada = p['Jornada'] ? `Jornada ${p['Jornada']}` : '';
      const cancha2 = p['Cancha'] || '';
      const fecha2 = p['Fecha'] || '';

      cont.innerHTML += `
      <div class="enc-row">
        <div class="teams-section">
          <div class="team-block">
            <div class="team-logo-sm">${logoL}</div>
            <div class="team-name-sm">${nomL}</div>
          </div>
          <div class="score-block">
            <div class="score-nums">${gL} - ${gV}</div>
          </div>
          <div class="team-block">
            <div class="team-logo-sm">${logoV}</div>
            <div class="team-name-sm">${nomV}</div>
          </div>
        </div>
        <div class="enc-divider-v"></div>
        <div class="info-section">
          <div class="info-col">
            ${jornada ? `<div class="info-item"><span class="icon">🏆</span><span class="val">${jornada}</span></div>` : ''}
            ${cancha2 ? `<div class="info-item"><span class="icon">📍</span><span class="val">${cancha2}</span></div>` : ''}
          </div>
          <div class="info-col">
            ${fecha2 ? `<div class="info-item"><span class="icon">📅</span><span class="val">${fecha2}</span></div>` : ''}
            ${hora ? `<div class="info-item"><span class="icon">⏰</span><span class="val">${hora}</span></div>` : ''}
          </div>
          ${ganPor ? `<div class="ganado-badge ${ganPorClass}">${ganPor}</div>` : ''}
        </div>
      </div>`;
    });

    statusEl.textContent = `✅ ${filtrados.length} partido(s) cargado(s)`;

  } catch(e) {
    statusEl.textContent = '❌ Error: ' + e.message;
  }
}

async function downloadPNG() {
  const btn = document.getElementById('dlBtn');
  const panel = document.querySelector('.editor-panel');
  const wrapper = document.getElementById('flyerRoot');
  const container = document.getElementById('flyerScaleContainer');
  panel.style.display = 'none';
  btn.textContent = '⏳ Generando...';
  btn.disabled = true;

  // Resetear escala para captura correcta
  wrapper.style.transform = 'scale(1)';
  wrapper.style.transformOrigin = 'top left';
  container.style.width = '900px';
  container.style.height = '1270px';

  const imgs = document.getElementById('flyerRoot').querySelectorAll('img');
  await Promise.all(Array.from(imgs).map(img => new Promise(resolve => {
    if (img.complete) resolve(); else { img.onload = resolve; img.onerror = resolve; }
  })));
  await new Promise(r => setTimeout(r, 800));
  try {
    const canvas = await html2canvas(document.getElementById('flyerRoot'), {
      useCORS: true, allowTaint: true, scale: 2,
      width: 900, height: 1600, backgroundColor: '#000', imageTimeout: 20000, logging: false
    });
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'dominical.png';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    }, 'image/png');
  } catch(e) { alert('❌ Error: ' + e.message); }
  panel.style.display = 'block';
  btn.textContent = '⬇ Descargar Flyer como PNG';
  btn.disabled = false;
  // Restaurar escala original
  escalarFlyer();
}

function escalarFlyer() {
  const wrapper = document.getElementById('flyerRoot');
  const container = document.getElementById('flyerScaleContainer');
  const disponible = document.documentElement.clientWidth - 16;
  const escala = disponible < 900 ? disponible / 900 : 1;
  wrapper.style.transform = `scale(${escala})`;
  wrapper.style.transformOrigin = 'top left';
  container.style.height = Math.round(1600 * escala) + 'px';
  container.style.width = Math.round(900 * escala) + 'px';
  container.style.overflow = 'hidden';
}

escalarFlyer();
window.addEventListener('resize', escalarFlyer);

cargarFechasYEquipos();
