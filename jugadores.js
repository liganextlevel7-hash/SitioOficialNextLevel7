const CAMISETA_GENERICA = "camiseta-generica.png"; // jersey de fondo cuando no hay foto del jugador
const URL_JUGADORES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1940220650&single=true&output=csv";
const URL_EVENTOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=645868286&single=true&output=csv";
const URL_PARTICIPACIONES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=626975401&single=true&output=csv";
const URL_PARTIDOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1362473459&single=true&output=csv";

const equiposID = {
  1:"Unión 8", 2:"Cuervos F.C", 3:"Pumas KAP", 4:"Soldados Del Amor",
  5:"Los Chipotles", 6:"La Garra", 7:"Gusanitos", 8:"Rivera F.C.",
  9:"Real Alcoholicos", 10:"Gambeta F.C.", 11:"USG Warriors",
  12:"Real Mala Copa", 13:"Puebla 450"
};

const logosEquipos = {
  1:"https://i.imgur.com/Qrx4JSj.png", 2:"https://i.imgur.com/fGQAhE5.png",
  3:"https://i.imgur.com/5TAVBS7.png", 4:"https://i.imgur.com/gBvmM4v.png",
  5:"https://i.imgur.com/KTMLCv9.png", 6:"https://i.imgur.com/8BWFWBW.png",
  7:"https://i.imgur.com/5TARJkD.png", 8:"https://i.imgur.com/5OdgpY3.png",
  9:"https://i.imgur.com/TUYE08R.png", 10:"https://i.imgur.com/V9MmhZh.png",
  11:"https://i.imgur.com/m3BIxVG.png", 12:"https://i.imgur.com/gBZxWD0.png",
  13:"https://i.imgur.com/YsJU3aK.png"
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
    <path fill="url(#jerseyGrad2)" stroke="#ffd700" stroke-width="6" d="M369.656,476.269h-227.31c-27.913,0-50.622-22.708-50.622-50.622V223.836
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
    <path fill="url(#jerseyGrad2)" stroke="#ffd700" stroke-width="6" d="M406.612,350.299c-7.548,0-13.667-6.119-13.667-13.667v-125.73c0-1.196-0.038-2.59-0.078-4.053
      c-0.294-11.209-0.599-22.8,10.243-26.967c4.77-1.831,11.868-1.45,17.486,5.122l11.166,13.052c2.292,2.679,5.491,4.257,9.012,4.443
      c3.522,0.198,6.87-1.043,9.431-3.464l30.459-28.789c4.72-4.461,5.335-11.738,1.431-16.927L418.477,68.76
      c-2.043-2.716-8.018-5.698-11.417-5.698h-51.377c-7.548,0-13.667-6.119-13.667-13.667s6.119-13.667,13.667-13.667h51.377
      c12.035,0,26.023,6.98,33.258,16.598l63.618,84.559c12.277,16.317,10.343,39.2-4.498,53.226l-30.46,28.789
      c-8.056,7.614-18.581,11.474-29.655,10.895c-6.888-0.366-13.385-2.424-19.048-5.959v112.797
      C420.278,344.181,414.16,350.299,406.612,350.299z"/>
    <text x="256" y="370" text-anchor="middle" font-family="Arial" font-weight="900" font-size="160" fill="#ffd700" opacity="0.9">${numero}</text>
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
          <img src="${CAMISETA_GENERICA}" class="pcard-jersey-svg">
          <img src="${j.foto || CAMISETA_GENERICA}" class="pcard-foto-circle" onerror="this.src='${CAMISETA_GENERICA}'">
        </div>
      </div>
    </div>
    <div class="pcard-footer">
      <div class="pcard-nombre">${j.nombre}</div>
      ${j.posicion ? `<span class="pcard-posicion">${j.posicion}</span>` : ''}
    </div>
  </div>`;
}

function jugadorCardHTML(j, goles, porcentaje, suspendido) {
  return `
  <div class="jugador-card">
    <img src="${j.foto || CAMISETA_GENERICA}" class="jugador-foto-full" onerror="this.src='${CAMISETA_GENERICA}'">
    <div class="jugador-stats-lateral">
      <div class="stat"><span>⚽</span><strong>${goles}</strong><small>GOLES</small></div>
      <div class="stat"><span>🎯</span><strong>${porcentaje}%</strong><small>ASIST</small></div>
      <div class="stat"><span>⛔</span><strong>${suspendido}</strong><small>SUSP</small></div>
    </div>
    <div class="jugador-info-bottom">
      <h3>${j.nombre}</h3>
      ${j.posicion ? `<span class="jugador-posicion">${j.posicion}</span>` : ''}
    </div>
  </div>`;
}

(function() {
  if (document.getElementById("jugadores-card-style")) return;
  const style = document.createElement("style");
  style.id = "jugadores-card-style";
  style.textContent = `
    /* ===== PLAYER CARD (base, sin cambios) ===== */
    .pcards-section { margin-bottom: 24px; }
    .pcards-title {
      font-size: 18px; font-weight: 900; color: #ffd700;
      letter-spacing: 3px; text-transform: uppercase;
      margin-bottom: 16px; text-align: center;
      text-shadow: 0 0 10px #ffd700;
    }
    .pcard {
      background: linear-gradient(160deg, #0a0f1e 0%, #050810 100%);
      border: 1px solid rgba(255,215,0,0.35);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 0 15px rgba(255,215,0,0.15);
      width: 100%; height: 100%;
    }
    .pcard-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px 6px;
      border-bottom: 1px solid rgba(255,215,0,0.1);
    }
    .pcard-equipo-nombre {
      font-size: 10px; font-weight: 700; color: rgba(255,215,0,0.7);
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
    .pcard-center { flex: 1; display: flex; justify-content: center; min-width: 0; }
    .pcard-jersey-wrap { position: relative; width: 120px; height: 130px; max-width: 100%; }
    .pcard-jersey-svg { width: 100%; height: 100%; object-fit: contain; object-position: bottom; }
    .pcard-foto-circle {
      position: absolute; top: -22px; left: 50%; transform: translateX(-50%);
      width: 62px; height: 62px; border-radius: 50%; object-fit: cover;
      border: 3px solid #ffd700; box-shadow: 0 0 12px rgba(255,215,0,0.6);
      background: #111;
    }
    .pcard-footer {
      background: rgba(0,0,0,0.5);
      border-top: 1px solid rgba(255,215,0,0.15);
      padding: 10px 14px; text-align: center;
    }
    .pcard-nombre {
      font-size: 13px; font-weight: 900; color: #fff;
      text-transform: uppercase; letter-spacing: 1px;
    }
    .pcard-posicion {
      display: inline-block; background: #ffd700; color: black;
      padding: 2px 10px; border-radius: 10px;
      font-size: 10px; font-weight: 700; margin-top: 5px;
    }

    /* ===== JUGADOR CARD (por equipo): foto completa, sin círculo ===== */
    .jugador-card {
      position: relative; width: 100%; aspect-ratio: 3 / 4;
      border: 2px solid #ffd700; border-radius: 18px;
      overflow: hidden; box-shadow: 0 0 12px #ffd700;
      background: #0a0a0a; box-sizing: border-box;
    }
    .jugador-foto-full {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; object-position: top center; display: block;
    }
    .jugador-stats-lateral {
      position: absolute; top: 10px; left: 8px; z-index: 2;
      display: flex; flex-direction: column; gap: 6px;
    }
    .jugador-stats-lateral .stat {
      background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
      border: 1px solid rgba(255,215,0,0.4); border-radius: 8px;
      padding: 5px 7px; text-align: center; min-width: 46px;
    }
    .jugador-stats-lateral .stat span { display: block; font-size: 12px; }
    .jugador-stats-lateral .stat strong { display: block; font-size: 13px; color: #ffd700; font-weight: 900; line-height: 1.15; }
    .jugador-stats-lateral .stat small { display: block; font-size: 7.5px; color: #ddd; letter-spacing: 0.5px; }
    .jugador-info-bottom {
      position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;
      padding: 26px 10px 10px;
      background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.92) 100%);
      text-align: center;
    }
    .jugador-info-bottom h3 {
      margin: 0; font-size: 13px; color: #fff; font-weight: 900;
      text-transform: uppercase; letter-spacing: 0.5px; text-shadow: 0 1px 3px #000;
    }
    .jugador-posicion {
      display: inline-block; background: #ffd700; color: black;
      padding: 2px 10px; border-radius: 12px; font-size: 10px;
      font-weight: bold; margin-top: 5px;
    }

    /* ===== CARRUSEL 3D ===== */
    .pj-carrusel-wrap {
      position: relative;
      width: 100%;
      max-width: 900px;
      margin: 0 auto 10px;
      height: 380px;
    }
    .pj-slide {
      position: absolute;
      top: 50%; left: 50%;
      width: 230px;
      transition: all 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
      transform: translate(-50%,-50%) scale(0.4);
      opacity: 0;
      pointer-events: none;
      cursor: pointer;
      filter: grayscale(1) brightness(0.55);
    }
    .pj-slide.pj-c {
      transform: translate(-50%,-50%) scale(1);
      opacity: 1; z-index: 5; pointer-events: all;
      filter: grayscale(0) brightness(1);
    }
    .pj-slide.pj-l1 {
      transform: translate(calc(-50% - 195px),-50%) scale(0.75) rotateY(18deg);
      opacity: 0.85; z-index: 4; pointer-events: all;
    }
    .pj-slide.pj-r1 {
      transform: translate(calc(-50% + 195px),-50%) scale(0.75) rotateY(-18deg);
      opacity: 0.85; z-index: 4; pointer-events: all;
    }
    .pj-slide.pj-l2 {
      transform: translate(calc(-50% - 330px),-50%) scale(0.55) rotateY(28deg);
      opacity: 0.4; z-index: 3; pointer-events: all;
    }
    .pj-slide.pj-r2 {
      transform: translate(calc(-50% + 330px),-50%) scale(0.55) rotateY(-28deg);
      opacity: 0.4; z-index: 3; pointer-events: all;
    }
    .pj-flecha {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(0,0,0,0.5); border: 1px solid rgba(255,215,0,0.4);
      border-radius: 50%; width: 38px; height: 38px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 17px; color: #ffd700; z-index: 10;
      transition: all 0.3s; touch-action: manipulation; user-select: none;
    }
    .pj-flecha:hover { background: rgba(255,215,0,0.2); }
    .pj-fl { left: 0; } .pj-fr { right: 0; }
    .pj-dots {
      display: flex; justify-content: center; gap: 7px; margin-top: 6px;
    }
    .pj-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: rgba(255,255,255,0.2); cursor: pointer; transition: all 0.3s;
    }
    .pj-dot.pj-on { background: #ffd700; transform: scale(1.3); }

    /* ===== MÓVIL: proporciones recalculadas para que el jersey ya no se recorte =====
       Antes el jersey-wrap tenía un ancho fijo mayor que el espacio real disponible
       dentro de la tarjeta angosta, y como .pcard tiene overflow:hidden, se veía cortado. */
    @media(max-width: 600px) {
      .pj-carrusel-wrap { height: 340px; }
      .pj-slide { width: 190px; }
      .pj-slide.pj-l1 { transform: translate(calc(-50% - 140px),-50%) scale(0.72) rotateY(18deg); }
      .pj-slide.pj-r1 { transform: translate(calc(-50% + 140px),-50%) scale(0.72) rotateY(-18deg); }
      .pj-slide.pj-l2 { transform: translate(calc(-50% - 215px),-50%) scale(0.5) rotateY(28deg); }
      .pj-slide.pj-r2 { transform: translate(calc(-50% + 215px),-50%) scale(0.5) rotateY(-28deg); }

      .pcard-body { padding: 10px 8px; gap: 6px; }
      .pcard-stats-left { width: 56px; gap: 4px; }
      .pcard-stat { padding: 4px 3px; }
      .pcard-lbl { font-size: 6.5px; }
      .pcard-val { font-size: 15px; }
      .pcard-jersey-wrap { width: 90px; height: 98px; }
      .pcard-foto-circle { width: 44px; height: 44px; top: -15px; }
      .pcard-nombre { font-size: 11px; }

      .jugador-stats-lateral .stat { padding: 4px 5px; min-width: 38px; }
      .jugador-stats-lateral .stat strong { font-size: 11px; }
      .jugador-stats-lateral .stat small { font-size: 6.5px; }
      .jugador-info-bottom h3 { font-size: 11px; }
    }
  `;
  document.head.appendChild(style);
})();

// ===== HELPER: crear carrusel generico =====
function crearCarrusel(containerId, cardsHTML) {
  const wrap = document.getElementById(containerId);
  if (!cardsHTML.length) {
    wrap.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">Sin datos disponibles</p>';
    return;
  }

  let activo = 0;
  const total = cardsHTML.length;

  const slidesHTML = cardsHTML.map((html, i) => `<div class="pj-slide" data-idx="${i}">${html}</div>`).join('');
  const dotsHTML = cardsHTML.map((_, i) => `<div class="pj-dot${i===0?' pj-on':''}" data-idx="${i}"></div>`).join('');

  wrap.innerHTML = `
    <div class="pj-carrusel-wrap">
      ${slidesHTML}
      ${total > 1 ? `<div class="pj-flecha pj-fl">&#8592;</div><div class="pj-flecha pj-fr">&#8594;</div>` : ''}
    </div>
    ${total > 1 ? `<div class="pj-dots">${dotsHTML}</div>` : ''}
  `;

  const slides = wrap.querySelectorAll('.pj-slide');
  const dots = wrap.querySelectorAll('.pj-dot');

  function actualizar() {
    slides.forEach((slide, i) => {
      slide.className = 'pj-slide';
      const diff = ((i - activo) % total + total) % total;
      let cls = '';
      if (diff === 0) cls = 'pj-c';
      else if (diff === 1) cls = 'pj-r1';
      else if (diff === 2) cls = 'pj-r2';
      else if (diff === total - 1) cls = 'pj-l1';
      else if (diff === total - 2) cls = 'pj-l2';
      if (cls) slide.classList.add(cls);
    });
    dots.forEach((d, i) => d.classList.toggle('pj-on', i === activo));
  }

  function mover(dir) {
    activo = ((activo + dir) % total + total) % total;
    actualizar();
  }

  slides.forEach((slide, i) => {
    slide.addEventListener('click', e => {
      if (!slide.classList.contains('pj-c')) {
        activo = i;
        actualizar();
      }
    });
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { activo = i; actualizar(); });
  });

  const flIzq = wrap.querySelector('.pj-fl');
  const flDer = wrap.querySelector('.pj-fr');
  if (flIzq) flIzq.addEventListener('click', () => mover(-1));
  if (flDer) flDer.addEventListener('click', () => mover(1));

  // Swipe
  let touchStartX = 0;
  const carruselWrap = wrap.querySelector('.pj-carrusel-wrap');
  carruselWrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
  carruselWrap.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) mover(diff > 0 ? 1 : -1);
  });

  actualizar();
}

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
      logo: c[5]?.trim(), foto: c[7]?.trim() || ''
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

  const htmlGolArr = goleadores.map(j => playerCardHTML(j,
    golesMap[j.id] || 0, asistMap[j.id] || 0,
    amarillasMap[j.id] || 0, rojasMap[j.id] || 0
  ));

  const htmlPortArr = porteros.map(j => playerCardHTML(
    {...j, numero: j.numero},
    j.golesRecibidos, asistMap[j.id] || 0,
    amarillasMap[j.id] || 0, rojasMap[j.id] || 0
  ));

  const listaJugadores = document.getElementById("lista-jugadores");

  listaJugadores.innerHTML = `
    <div id="tops-section">
      <div class="pcards-section">
        <div class="pcards-title">⚽ Top 5 Goleadores</div>
        <div id="carrusel-goleadores"></div>
      </div>
      <div class="pcards-section">
        <div class="pcards-title">🧤 Top 5 Porteros</div>
        <div id="carrusel-porteros"></div>
      </div>
    </div>
    <div id="equipo-jugadores-section" style="display:none;">
      <div class="pcards-section">
        <div class="pcards-title" id="titulo-equipo-jugadores">Jugadores</div>
        <div id="carrusel-equipo"></div>
      </div>
    </div>
  `;

  crearCarrusel('carrusel-goleadores', htmlGolArr);
  crearCarrusel('carrusel-porteros', htmlPortArr);

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
      return;
    }

    tops.style.display = 'none';
    equipoSection.style.display = 'block';

    document.getElementById('titulo-equipo-jugadores').textContent = '👕 ' + (equiposID[equipoID] || 'Jugadores');

    const lista = jugadores.filter(j =>
      j.equipo === equipoID &&
      j.nombre !== "Penal" && j.nombre !== "Default" && j.nombre !== "Autogol"
    );

    const htmlEquipoArr = lista.map(j => {
      const goles = golesMap[j.id] || 0;
      const rojas = rojasMap[j.id] || 0;
      const asist = asistMap[j.id] || 0;
      const porcentaje = Math.round((asist / 8) * 100);
      const suspendido = rojas > 0 ? "Sí" : "No";
      return jugadorCardHTML(j, goles, porcentaje, suspendido);
    });

    crearCarrusel('carrusel-equipo', htmlEquipoArr);
  });
}

cargarJugadores();
