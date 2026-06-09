const URL_JUGADORES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1940220650&single=true&output=csv";
const URL_EVENTOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=645868286&single=true&output=csv";
const URL_PARTICIPACIONES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=626975401&single=true&output=csv";
const URL_PARTIDOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1362473459&single=true&output=csv";

const equiposID = {
  1:"Soldados Del Amor", 2:"Cuervos F.C", 3:"Unión 8", 4:"La Garra",
  5:"Pumas KAP", 6:"Los Chipotles", 7:"Deportivo CT", 8:"Gusanitos", 9:"Bacachitos"
};

const logosEquipos = {
  1:"https://i.imgur.com/gBvmM4v.png", 2:"https://i.imgur.com/fGQAhE5.png",
  3:"https://i.imgur.com/Qrx4JSj.png", 4:"https://i.imgur.com/8BWFWBW.png",
  5:"https://i.imgur.com/5TAVBS7.png", 6:"https://i.imgur.com/KTMLCv9.png",
  7:"https://i.imgur.com/hqOAa7J.png", 8:"https://i.imgur.com/5TARJkD.png",
  9:"https://i.imgur.com/ddKmNL6.png"
};

function jerseySVG(numero) {
  return `
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
    <defs>
      <linearGradient id="jerseyGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0d0d1a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <path fill="url(#jerseyGrad2)" stroke="#39ff14" stroke-width="6" d="M369.656,476.269h-227.31c-27.913,0-50.622-22.708-50.622-50.622V223.836
      c-5.662,3.533-12.161,5.594-19.048,5.959c-11.077,0.585-21.6-3.281-29.655-10.895l-30.459-28.789
      c-14.842-14.026-16.774-36.908-4.498-53.226L71.68,52.326c7.236-9.617,21.224-16.597,33.258-16.597h51.088
      c9.351,0,17.572,5.032,22.557,13.806c8.006,14.096,37.169,28.365,77.416,28.365c11.392,0,22.428-1.163,32.797-3.458
      c7.373-1.628,14.666,3.023,16.296,10.392c1.63,7.37-3.022,14.666-10.392,16.296c-12.304,2.722-25.326,4.101-38.701,4.101
      c-46.89,0-86.594-16.552-101.167-42.171h-49.892c-3.398,0-9.373,2.982-11.417,5.698l-63.616,84.558
      c-3.905,5.191-3.29,12.468,1.43,16.929l30.459,28.789c2.562,2.42,5.926,3.65,9.431,3.464c3.521-0.187,6.72-1.764,9.01-4.443
      l11.167-13.054c5.621-6.571,12.719-6.951,17.488-5.121c10.842,4.167,10.537,15.758,10.242,26.967
      c-0.038,1.465-0.077,2.858-0.077,4.053v214.744c0,12.841,10.448,23.289,23.289,23.289h227.311
      c12.841,0,23.289-10.448,23.289-23.289c0-7.548,6.118-13.667,13.667-13.667s13.667,6.118,13.667,13.667
      C420.278,453.561,397.569,476.269,369.656,476.269z"/>
    <path fill="url(#jerseyGrad2)" stroke="#39ff14" stroke-width="6" d="M406.612,350.299c-7.548,0-13.667-6.119-13.667-13.667v-125.73c0-1.196-0.038-2.59-0.078-4.053
      c-0.294-11.209-0.599-22.8,10.243-26.967c4.77-1.831,11.868-1.45,17.486,5.122l11.166,13.052c2.292,2.679,5.491,4.257,9.012,4.443
      c3.522,0.198,6.87-1.043,9.431-3.464l30.459-28.789c4.72-4.461,5.335-11.738,1.431-16.927L418.477,68.76
      c-2.043-2.716-8.018-5.698-11.417-5.698h-51.377c-7.548,0-13.667-6.119-13.667-13.667s6.119-13.667,13.667-13.667h51.377
      c12.035,0,26.023,6.98,33.258,16.598l63.618,84.559c12.277,16.317,10.343,39.2-4.498,53.226l-30.46,28.789
      c-8.056,7.614-18.581,11.474-29.655,10.895c-6.888-0.366-13.385-2.424-19.048-5.959v112.797
      C420.278,344.181,414.16,350.299,406.612,350.299z"/>
    <text x="256" y="370" text-anchor="middle" font-family="Arial" font-weight="900" font-size="160" fill="#39ff14" opacity="0.9">${numero}</text>
  </svg>`;
}

function playerCardHTML(j, goles, asistencias, amarillas, rojas) {
  const equipoNombre = equiposID[Number(j.equipo)] || '';
  const logoEquipo = logosEquipos[Number(j.equipo)] || '';
  return `
  <div class="pcard">
    <div class="pcard-header">
      <span class="pcard-equipo-nombre">${equipoNombre}</span>
      <img src="${logoEquipo}" class="pcard-logo-equipo">
    </div>
    <div class="pcard-body">
      <div class="pcard-stats-left">
        <div class="pcard-stat"><span class="pcard-lbl">GOLES</span><span class="pcard-val">${goles}</span></div>
        <div class="pcard-stat"><span class="pcard-lbl">ASIST</span><span class="pcard-val">${asistencias}</span></div>
        <div class="pcard-stat"><span class="pcard-lbl">🟡 AM</span><span class="pcard-val">${amarillas}</span></div>
        <div class="pcard-stat"><span class="pcard-lbl">🔴 RJ</span><span class="pcard-val">${rojas}</span></div>
      </div>
      <div class="pcard-center">
        <div class="pcard-jersey-wrap">
          <div class="pcard-jersey-svg">${jerseySVG(j.numero || '-')}</div>
          <img src="${j.foto}" class="pcard-foto-circle" onerror="this.src='${j.logo}'">
        </div>
      </div>
    </div>
    <div class="pcard-footer">
      <div class="pcard-nombre">${j.nombre}</div>
      ${j.posicion ? `<span class="pcard-posicion">${j.posicion}</span>` : ''}
    </div>
  </div>`;
}

(function() {
  if (document.getElementById("jugadores-card-style")) return;
  const style = document.createElement("style");
  style.id = "jugadores-card-style";
  style.textContent = `
    /* ===== PLAYER CARD ===== */
    .pcards-section { margin-bottom: 24px; }
    .pcards-title {
      font-size: 18px; font-weight: 900; color: #39ff14;
      letter-spacing: 3px; text-transform: uppercase;
      margin-bottom: 16px; text-align: center;
      text-shadow: 0 0 10px #39ff14;
    }
    .pcards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 18px;
    }
    .pcard {
      background: linear-gradient(160deg, #0a0f1e 0%, #050810 100%);
      border: 1px solid rgba(57,255,20,0.35);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 0 15px rgba(57,255,20,0.15);
      transition: 0.3s;
    }
    .pcard:hover { transform: translateY(-5px); box-shadow: 0 0 28px rgba(57,255,20,0.4); }
    .pcard-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px 6px;
      border-bottom: 1px solid rgba(57,255,20,0.1);
    }
    .pcard-equipo-nombre {
      font-size: 10px; font-weight: 700; color: rgba(57,255,20,0.7);
      text-transform: uppercase; letter-spacing: 1px;
    }
    .pcard-logo-equipo { width: 36px; height: 36px; object-fit: contain; }
    .pcard-body {
      display: flex; gap: 10px; padding: 12px 14px;
      align-items: center;
    }
    .pcard-stats-left {
      display: flex; flex-direction: column; gap: 6px;
      width: 75px; flex-shrink: 0;
    }
    .pcard-stat {
      background: rgba(255,255,255,0.06);
      border-radius: 8px; padding: 5px 7px;
      display: flex; flex-direction: column; align-items: center;
    }
    .pcard-lbl { font-size: 8px; color: rgba(255,255,255,0.4); letter-spacing: 1px; text-transform: uppercase; }
    .pcard-val { font-size: 20px; font-weight: 900; color: #fff; line-height: 1.1; }
    .pcard-center { flex: 1; display: flex; justify-content: center; }
    .pcard-jersey-wrap {
      position: relative;
      width: 120px; height: 130px;
    }
    .pcard-jersey-svg { width: 100%; height: 100%; }
    .pcard-foto-circle {
      position: absolute; top: -22px; left: 50%; transform: translateX(-50%);
      width: 62px; height: 62px; border-radius: 50%; object-fit: cover;
      border: 3px solid #39ff14; box-shadow: 0 0 12px rgba(57,255,20,0.6);
      background: #111;
    }
    .pcard-footer {
      background: rgba(0,0,0,0.5);
      border-top: 1px solid rgba(57,255,20,0.15);
      padding: 10px 14px; text-align: center;
    }
    .pcard-nombre {
      font-size: 13px; font-weight: 900; color: #fff;
      text-transform: uppercase; letter-spacing: 1px;
    }
    .pcard-posicion {
      display: inline-block; background: #39ff14; color: black;
      padding: 2px 10px; border-radius: 10px;
      font-size: 10px; font-weight: 700; margin-top: 5px;
    }

    /* ===== JUGADOR CARD (por equipo) ===== */
    .jugadores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 20px; margin-top: 20px;
    }
    .jugador-card {
      background: rgba(0,0,0,0.75); border: 2px solid #39ff14;
      border-radius: 18px; padding: 12px; text-align: center;
      color: white; box-shadow: 0 0 12px #39ff14;
      transition: 0.3s; display: flex; flex-direction: column;
      align-items: center; gap: 8px;
    }
    .jugador-card:hover { transform: translateY(-4px); box-shadow: 0 0 22px #39ff14; }
    .jugador-jersey-wrap { position: relative; width: 130px; height: 140px; }
    .jugador-jersey-svg { width: 100%; height: 100%; }
    .jugador-foto-circle {
      position: absolute; top: -28px; left: 50%; transform: translateX(-50%);
      width: 60px; height: 60px; border-radius: 50%; object-fit: cover;
      border: 3px solid #39ff14; box-shadow: 0 0 10px #39ff14; background: #111;
    }
    .jugador-info h3 { margin: 4px 0 0 0; font-size: 13px; color: #fff; font-weight: bold; }
    .jugador-posicion {
      display: inline-block; background: #39ff14; color: black;
      padding: 2px 10px; border-radius: 12px; font-size: 11px;
      font-weight: bold; margin-top: 4px;
    }
    .jugador-stats {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 4px; width: 100%; margin-top: 4px;
    }
    .jugador-stats .stat { background: rgba(255,255,255,0.07); border-radius: 8px; padding: 5px 3px; text-align: center; }
    .jugador-stats .stat span { display: block; font-size: 14px; }
    .jugador-stats .stat strong { display: block; font-size: 13px; color: #39ff14; font-weight: 900; }
    .jugador-stats .stat small { display: block; font-size: 9px; color: #aaa; }

    @media(max-width: 600px) {
      .pcards-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .pcard-jersey-wrap { width: 95px; height: 105px; }
      .pcard-foto-circle { width: 50px; height: 50px; top: -18px; }
      .pcard-val { font-size: 16px; }
      .jugadores-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .jugador-jersey-wrap { width: 110px; height: 118px; }
      .jugador-foto-circle { width: 50px; height: 50px; top: -24px; }
      .jugador-info h3 { font-size: 11px; }
    }
  `;
  document.head.appendChild(style);
})();

async function cargarJugadores() {
  const [resJ, resE, resP, resPart] = await Promise.all([
    fetch(URL_JUGADORES), fetch(URL_EVENTOS),
    fetch(URL_PARTICIPACIONES), fetch(URL_PARTIDOS)
  ]);
  const [txtJ, txtE, txtP, txtPart] = await Promise.all([
    resJ.text(), resE.text(), resP.text(), resPart.text()
  ]);

  const jugadoresFilas = txtJ.replace(/\r/g,'').trim().split("\n");
  const eventosFilas   = txtE.replace(/\r/g,'').trim().split("\n");
  const partFilas      = txtP.replace(/\r/g,'').trim().split("\n");
  const partidosFilas  = txtPart.replace(/\r/g,'').trim().split("\n");

  const jugadores = [];
  for (let i = 1; i < jugadoresFilas.length; i++) {
    const c = jugadoresFilas[i].split(",");
    if (!c[1]?.trim()) continue;
    jugadores.push({
      id: c[0]?.trim(), nombre: c[1]?.trim(), equipo: c[2]?.trim(),
      numero: c[3]?.trim(), posicion: c[4]?.trim() || '',
      logo: c[5]?.trim(), foto: c[7]?.trim() ? c[7].trim() : c[5]?.trim()
    });
  }

  const golesMap = {}, amarillasMap = {}, rojasMap = {};
  eventosFilas.slice(1).forEach(f => {
    const e = f.split(",");
    const id = e[2]?.trim(), tipo = e[3]?.trim();
    if (!id) return;
    if (tipo === "Gol")      golesMap[id]     = (golesMap[id]     || 0) + 1;
    if (tipo === "Amarilla") amarillasMap[id] = (amarillasMap[id] || 0) + 1;
    if (tipo === "Roja")     rojasMap[id]     = (rojasMap[id]     || 0) + 1;
  });

  const asistMap = {};
  partFilas.slice(1).forEach(f => {
    const p = f.split(",");
    const id = p[4]?.trim();
    if (p[5]?.trim() === "TRUE" && id) asistMap[id] = (asistMap[id] || 0) + 1;
  });

  const golesRecibidosMap = {};
  partidosFilas.slice(1).forEach(f => {
    const p = f.replace(/\r/g,'').split(",");
    if (p[6]?.trim() !== "Jugado") return;
    const eqL = p[2]?.trim(), eqV = p[3]?.trim();
    const gL = parseInt(p[4]?.trim()) || 0, gV = parseInt(p[5]?.trim()) || 0;
    if (eqL && eqL !== '10') golesRecibidosMap[eqL] = (golesRecibidosMap[eqL] || 0) + gV;
    if (eqV && eqV !== '10') golesRecibidosMap[eqV] = (golesRecibidosMap[eqV] || 0) + gL;
  });

  const goleadores = jugadores
    .filter(j => j.nombre !== "Penal" && j.nombre !== "Default" && j.nombre !== "Autogol")
    .filter(j => (golesMap[j.id] || 0) > 0)
    .sort((a, b) => (golesMap[b.id] || 0) - (golesMap[a.id] || 0))
    .slice(0, 5);

  const porteros = jugadores
    .filter(j => j.posicion === "Portero" && j.nombre !== "Penal" && j.nombre !== "Default")
    .map(j => ({ ...j, golesRecibidos: golesRecibidosMap[j.equipo] || 0 }))
    .sort((a, b) => a.golesRecibidos - b.golesRecibidos)
    .slice(0, 5);

  // Renderizar secciones
  let htmlGol = goleadores.map(j => playerCardHTML(j,
    golesMap[j.id] || 0, asistMap[j.id] || 0,
    amarillasMap[j.id] || 0, rojasMap[j.id] || 0
  )).join('');

  let htmlPort = porteros.length
    ? porteros.map(j => playerCardHTML(
        {...j, numero: j.numero},
        j.golesRecibidos, asistMap[j.id] || 0,
        amarillasMap[j.id] || 0, rojasMap[j.id] || 0
      )).join('')
    : '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">Sin porteros registrados aún</p>';

  const listaJugadores = document.getElementById("lista-jugadores");

  // Secciones de tops
  listaJugadores.innerHTML = `
    <div id="tops-section">
      <div class="pcards-section">
        <div class="pcards-title">⚽ Top 5 Goleadores</div>
        <div class="pcards-grid">${htmlGol}</div>
      </div>
      <div class="pcards-section">
        <div class="pcards-title">🧤 Top 5 Porteros</div>
        <div class="pcards-grid">${htmlPort}</div>
      </div>
    </div>
    <div id="equipo-jugadores-section" style="display:none;"></div>
  `;

  // Selector equipo
  const selector = document.getElementById("selector-equipo-jugador");
  Object.entries(equiposID).forEach(([id, nombre]) => {
    selector.innerHTML += `<option value="${id}">${nombre}</option>`;
  });

  selector.addEventListener("change", () => {
    const equipoID = selector.value;
    const tops = document.getElementById("tops-section");
    const equipoSection = document.getElementById("equipo-jugadores-section");

    if (!equipoID) {
      tops.style.display = 'block';
      equipoSection.style.display = 'none';
      equipoSection.innerHTML = '';
      return;
    }

    // Ocultar tops, mostrar jugadores del equipo
    tops.style.display = 'none';
    equipoSection.style.display = 'block';

    const lista = jugadores.filter(j =>
      j.equipo === equipoID &&
      j.nombre !== "Penal" && j.nombre !== "Default" && j.nombre !== "Autogol"
    );

    let html = '<div class="jugadores-grid">';
    lista.forEach(j => {
      const goles = golesMap[j.id] || 0;
      const rojas = rojasMap[j.id] || 0;
      const asist = asistMap[j.id] || 0;
      const porcentaje = Math.round((asist / 8) * 100);
      const suspendido = rojas > 0 ? "Sí" : "No";
      html += `
      <div class="jugador-card">
        <div class="jugador-jersey-wrap">
          <div class="jugador-jersey-svg">${jerseySVG(j.numero)}</div>
          <img src="${j.foto}" class="jugador-foto-circle" onerror="this.src='${j.logo}'">
        </div>
        <div class="jugador-info">
          <h3>${j.nombre}</h3>
          <span class="jugador-posicion">${j.posicion}</span>
        </div>
        <div class="jugador-stats">
          <div class="stat"><span>⚽</span><strong>${goles}</strong><small>Goles</small></div>
          <div class="stat"><span>🎯</span><strong>${porcentaje}%</strong><small>Asist</small></div>
          <div class="stat"><span>⛔</span><strong>${suspendido}</strong><small>Susp</small></div>
        </div>
      </div>`;
    });
    html += '</div>';
    equipoSection.innerHTML = html;
  });
}

cargarJugadores();
