const URL_JUGADORES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1940220650&single=true&output=csv";
const URL_EVENTOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=645868286&single=true&output=csv";
const URL_PARTICIPACIONES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=626975401&single=true&output=csv";
const URL_PARTIDOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1362473459&single=true&output=csv";

const SHEET_ID_EQUIPOS = "1BhDkqSWYzkahtaG19_uO28no5FQbQkDeomjZoMWBYfE";
const GID_EQUIPOS = "1894947293";
const URL_EQUIPOS_NL7 = `https://docs.google.com/spreadsheets/d/${SHEET_ID_EQUIPOS}/export?format=csv&gid=${GID_EQUIPOS}`;

let equiposID = {};
let logosEquipos = {};

async function cargarEquiposNL7() {
  const res = await fetch(URL_EQUIPOS_NL7);
  const txt = await res.text();
  const filas = txt.replace(/\r/g,'').trim().split("\n");
  const encabezado = filas[0].split(",").map(h => h.trim().toLowerCase());
  const colStatus = encabezado.indexOf("status");
  const idTmp = {}, logoTmp = {};
  for (let i = 1; i < filas.length; i++) {
    const c = filas[i].split(",");
    const id = c[0]?.trim();
    const nombre = c[1]?.trim();
    if (!id || !nombre) continue;
    const status = colStatus >= 0 ? (c[colStatus]?.trim().toLowerCase() || '') : '';
    if (status === 'baja') continue;
    idTmp[id] = nombre;
    logoTmp[id] = (c[4]?.trim() || c[3]?.trim() || '');
  }
  equiposID = idTmp;
  logosEquipos = logoTmp;
}

function tarjetaJugador(j, items) {
  return `<article class="pcard">
    <div class="pcard-header"><span class="pcard-equipo-nombre">${equiposID[Number(j.equipo)] || ''}</span><img class="pcard-logo-equipo" src="${logosEquipos[Number(j.equipo)] || j.logo}" alt="Escudo del equipo"></div>
    <div class="pcard-foto-wrap"><span class="pcard-numero">${j.numero ? '#' + j.numero : ''}</span><img src="${j.foto}" alt="${j.nombre}" class="pcard-foto-grande" onerror="this.onerror=null;this.src='${j.logo}';this.classList.add('pcard-foto-fallback')"></div>
    <div class="pcard-footer"><div class="pcard-nombre">${j.nombre}</div>${j.posicion ? `<span class="pcard-posicion">${j.posicion}</span>` : ''}</div>
    <div class="pcard-stats-left">${items.map(([l,v])=>`<div class="pcard-stat"><span class="pcard-val">${v}</span><span class="pcard-lbl">${l}</span></div>`).join('')}</div>
    <button type="button" class="pcard-ver-ficha">Ver ficha ↗</button>
  </article>`;
}
function playerCardHTML(j, goles, asistencias, amarillas, rojas) {
  return tarjetaJugador(j, [['Goles',goles],['Asistencia',asistencias],['Amarillas',amarillas],['Rojas',rojas]]);
}
function porteroCardHTML(j) {
  return tarjetaJugador(j, [['Goles recibidos',j.golesRecibidos],['Partidos',j.partidosJugados],['Promedio',j.promedio.toFixed(1)]]);
}
function jugadorCardHTML(j, goles, porcentaje, suspendido, golesRec, amarillas, rojas) {
  const esPortero = golesRec !== undefined && golesRec !== null;
  return tarjetaJugador(j, [[esPortero ? 'Goles recibidos' : 'Goles',esPortero ? golesRec : goles],['Asistencia',porcentaje+'%'],['Amarillas',amarillas||0],['Rojas',rojas||0],['Suspendido',suspendido]]);
}

(function() {
  if (document.getElementById("jugadores-card-style")) return;
  const style = document.createElement("style");
  style.id = "jugadores-card-style";
  style.textContent = `

    body { margin:0; background:#080f16; color:#edf3fc; font-family:Arial,sans-serif; }
    body > header { background:radial-gradient(ellipse at top,#193123,#0b1714); border-bottom:1px solid #293a28; padding:24px 16px; text-align:center; }
    header .logo-liga { width:80px; height:80px; object-fit:contain; }
    header h1 { font-size:clamp(25px,5vw,36px); color:#edf3fc; letter-spacing:3px; margin:10px 0; text-shadow:none; }
    header .subtitulo { color:#aebcae; margin:8px 0 18px; }
    header nav { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; }
    header nav a { color:#d0e8bd; background:#17261c; border:1px solid #34472c; padding:11px 16px; border-radius:10px; text-decoration:none; }
    .contenedor-jugadores { width:100%; max-width:1040px; margin:24px auto; padding:0 12px 32px; box-sizing:border-box; }
    .jugadores-tabs { display:flex; gap:5px; padding:5px; border:1px solid #28392b; border-radius:13px; background:#111f18; max-width:560px; margin:0 auto 22px; }
    .jugadores-tabs button { flex:1; min-width:0; padding:12px 6px; border:0; border-radius:9px; color:#b9c7b3; background:transparent; font:600 13px Arial; cursor:pointer; }
    .jugadores-tabs button[aria-selected=true] { background:#a7e267; color:#16240d; }
    #filtro-equipo { max-width:480px; margin:0 auto 18px; }
    #filtro-equipo label { display:block; color:#b9c7b3; margin-bottom:8px; }
    #selector-equipo-jugador { width:100%; box-sizing:border-box; padding:13px; font-size:16px; background:#132139; color:#edf3fc; border:1px solid #415571; border-radius:10px; }
    .pcards-section { margin-bottom:18px; }
    .pcards-title { font-size:18px; font-weight:700; color:#d8c58c; letter-spacing:1px; margin-bottom:10px; text-align:center; }
    .pcard { background:linear-gradient(150deg,#192f50,#0c1a30); border:1px solid #aa914e; border-radius:18px; overflow:hidden; width:100%; box-sizing:border-box; box-shadow:0 15px 36px #0005; }
    .pcard-header { display:flex; justify-content:space-between; align-items:center; gap:8px; padding:10px 16px; min-height:38px; border-bottom:1px solid #ffffff12; }
    .pcard-equipo-nombre { font-size:12px; color:#ddca92; text-transform:uppercase; letter-spacing:1px; overflow-wrap:anywhere; }
    .pcard-logo-equipo { width:36px; height:36px; object-fit:contain; }
    .pcard-foto-wrap { height:230px; position:relative; background:radial-gradient(ellipse,#355375,#10223c); }
    .pcard-numero { position:absolute; top:12px; left:14px; color:#fff; font-size:23px; font-weight:700; text-shadow:0 2px 5px #000; z-index:1; }
    .pcard-foto-grande { width:100%; height:100%; object-fit:contain; display:block; }
    .pcard-foto-fallback { padding:32px; box-sizing:border-box; }
    .pcard-footer { padding:13px 14px 8px; text-align:center; }
    .pcard-nombre { color:#f4f7ff; font-size:18px; font-weight:700; overflow-wrap:anywhere; line-height:1.25; }
    .pcard-posicion { display:inline-block; color:#b8e38f; font-size:12px; margin-top:6px; }
    .pcard-stats-left { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; padding:8px 14px 12px; }
    .pcard-stat { background:#ffffff07; border-radius:9px; padding:8px 3px; display:flex; flex-direction:column; align-items:center; gap:3px; text-align:center; }
    .pcard-lbl { font-size:11px; color:#bac9dd; }
    .pcard-val { font-size:23px; font-weight:700; color:#f4f7ff; }
    .pcard-ver-ficha { display:block; width:calc(100% - 28px); margin:0 14px 14px; padding:12px; border:0; border-radius:9px; background:#a7e267; color:#17240e; font-size:14px; font-weight:700; cursor:pointer; }
    .pj-carrusel-wrap { position:relative; width:100%; max-width:960px; margin:auto; height:610px; overflow:hidden; touch-action:pan-y; }
    .pj-slide { position:absolute; top:50%; left:50%; width:300px; transition:transform .4s,opacity .4s,filter .4s; transform:translate(-50%,-50%) scale(.4); opacity:0; pointer-events:none; filter:brightness(.45); }
    .pj-slide.pj-c { transform:translate(-50%,-50%); opacity:1; z-index:5; pointer-events:auto; filter:none; }
    .pj-slide.pj-l1 { transform:translate(calc(-50% - 245px),-50%) scale(.76); opacity:.65; z-index:4; pointer-events:auto; }
    .pj-slide.pj-r1 { transform:translate(calc(-50% + 245px),-50%) scale(.76); opacity:.65; z-index:4; pointer-events:auto; }
    .pj-slide.pj-l2 { transform:translate(calc(-50% - 390px),-50%) scale(.55); opacity:.3; z-index:3; }
    .pj-slide.pj-r2 { transform:translate(calc(-50% + 390px),-50%) scale(.55); opacity:.3; z-index:3; }
    .pj-flecha { position:absolute; top:50%; transform:translateY(-50%); width:44px; height:44px; border:1px solid #66834b; border-radius:50%; color:#d3efb5; background:#132518ed; font-size:22px; cursor:pointer; z-index:10; }
    .pj-fl { left:3px; } .pj-fr { right:3px; }
    .pj-dots { display:flex; justify-content:center; flex-wrap:wrap; gap:2px; }
    .pj-dot { width:28px; height:28px; border:0; background:transparent; cursor:pointer; padding:9px; }
    .pj-dot:after { content:''; display:block; width:8px; height:8px; border-radius:50%; background:#4c5a4c; }
    .pj-dot.pj-on:after { background:#a7e267; }
    .foto-lightbox-overlay { position:fixed; inset:0; z-index:99999; background:#050b15f5; display:none; align-items:center; justify-content:center; padding:65px 16px 20px; box-sizing:border-box; overflow-y:auto; }
    .foto-lightbox-overlay.activo { display:flex; }
    .foto-lightbox-wrap { width:100%; max-width:480px; max-height:100%; }
    .foto-lightbox-img { display:block; width:100%; max-height:48dvh; object-fit:contain; border-radius:12px; background:#122139; }
    .foto-lightbox-cerrar { position:absolute; top:12px; right:16px; width:44px; height:44px; background:#172a40; color:#edf3fc; border:1px solid #7d713e; border-radius:50%; font-size:26px; cursor:pointer; }
    .foto-lightbox-stats { margin-top:12px; padding:15px; border-radius:12px; background:#132139; }
    .fls-top { text-align:center; } .fls-nombre { display:block; font-size:19px; color:#fff; }
    .fls-equipo { color:#ddca92; text-align:center; margin:8px 0 12px; }
    .fls-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
    .fls-item { display:flex; flex-direction:column; align-items:center; gap:5px; padding:8px; background:#ffffff07; border-radius:8px; }
    [hidden] { display:none !important; }
    @media(max-width:600px) {
      body > header { padding:18px 12px; } header .logo-liga { width:65px; height:65px; }
      .contenedor-jugadores { margin-top:18px; padding-left:6px; padding-right:6px; }
      .pj-slide { width:min(300px,calc(100vw - 88px)); }
      .pj-slide:not(.pj-c) { opacity:0; pointer-events:none; }
      .pcard-foto-wrap { height:215px; } .pcard-nombre { font-size:17px; }
      .pj-carrusel-wrap { height:625px; }
    }
    @media(prefers-reduced-motion:reduce) { .pj-slide { transition:none; } }

  `;
  document.head.appendChild(style);
})();

// ===== HELPER: crear carrusel generico =====
function crearCarrusel(containerId, cardsHTML, statsArr) {
  const wrap = document.getElementById(containerId);
  if (!cardsHTML.length) {
    wrap.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:20px;">Sin datos disponibles</p>';
    return;
  }

  let activo = 0;
  const total = cardsHTML.length;

  const slidesHTML = cardsHTML.map((html, i) => `<div class="pj-slide" data-idx="${i}">${html}</div>`).join('');
  const dotsHTML = cardsHTML.map((_, i) => `<button type="button" aria-label="Ver jugador ${i+1}" class="pj-dot${i===0?' pj-on':''}" data-idx="${i}"></button>`).join('');

  wrap.innerHTML = `
    <div class="pj-carrusel-wrap">
      ${slidesHTML}
      ${total > 1 ? `<button type="button" class="pj-flecha pj-fl" aria-label="Jugador anterior">&#8592;</button><button type="button" class="pj-flecha pj-fr" aria-label="Siguiente jugador">&#8594;</button>` : ''}
    </div>
    ${total > 1 ? `<div class="pj-dots">${dotsHTML}</div>` : ''}
  `;

  const slides = wrap.querySelectorAll('.pj-slide');
  const dots = wrap.querySelectorAll('.pj-dot');

  function actualizar() {
    slides.forEach((slide, i) => {
      slide.className = 'pj-slide';
      slide.inert = i !== activo;
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
    slide.querySelector('.pcard-ver-ficha').addEventListener('click', e => {
      e.stopPropagation();
      abrirFotoCompleta(slide.querySelector('.pcard-foto-grande').src, statsArr && statsArr[i]);
    });
    slide.addEventListener('click', e => {
      if (!slide.classList.contains('pj-c')) {
        activo = i;
        actualizar();
      }
    });
    slide.addEventListener('dblclick', e => {
      const img = slide.querySelector('.pcard-foto-grande');
      if (img) abrirFotoCompleta(img.src, statsArr && statsArr[i]);
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

function statsFicha(j, items) {
  return { nombre: j.nombre, posicion: j.posicion, equipo: equiposID[Number(j.equipo)] || '', items };
}

function abrirFotoCompleta(src, stats) {
  if (!src) return;
  let overlay = document.getElementById('foto-lightbox-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'foto-lightbox-overlay';
    overlay.className = 'foto-lightbox-overlay';
    overlay.innerHTML = `
      <button type="button" class="foto-lightbox-cerrar" aria-label="Cerrar ficha">&times;</button>
      <div class="foto-lightbox-wrap" id="foto-lightbox-wrap">
        <img class="foto-lightbox-img" id="foto-lightbox-img">
        <div class="foto-lightbox-stats" id="foto-lightbox-stats"></div>
      </div>
    `;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Ficha del jugador');
    const cerrar = () => { overlay.classList.remove('activo'); if (overlay.returnFocus) overlay.returnFocus.focus(); };
    overlay.addEventListener('click', e => { if (e.target === overlay || e.target.closest('.foto-lightbox-cerrar')) cerrar(); });
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') cerrar();
      if (e.key === 'Tab') { e.preventDefault(); overlay.querySelector('button').focus(); }
    });
    document.body.appendChild(overlay);
  }
  document.getElementById('foto-lightbox-img').src = src;
  const wrap = document.getElementById('foto-lightbox-wrap');
  const box = document.getElementById('foto-lightbox-stats');
  if (stats && stats.items && stats.items.length) {
    box.innerHTML = `
      <div class="fls-top"><span class="fls-nombre">${stats.nombre}</span>${stats.posicion ? `<span class="pcard-posicion">${stats.posicion}</span>` : ''}</div>
      ${stats.equipo ? `<div class="fls-equipo">${stats.equipo}</div>` : ''}
      <div class="fls-grid">${stats.items.map(i => `<div class="fls-item"><span class="pcard-lbl">${i.l}</span><span class="pcard-val">${i.v}</span></div>`).join('')}</div>`;
    wrap.classList.add('con-stats');
  } else {
    box.innerHTML = '';
    wrap.classList.remove('con-stats');
  }
  overlay.returnFocus = document.activeElement;
  overlay.classList.add('activo');
  overlay.querySelector('button').focus();
}

async function cargarJugadores() {
  await cargarEquiposNL7();

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
      logo: c[5]?.trim(), foto: c[6]?.trim() ? c[6].trim() : c[7]?.trim()
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

  const golesRecibidosMap = {}, partidosEquipoMap = {}, partidosInfo = {};
  partidosFilas.slice(1).forEach(f => {
    const p = f.replace(/\r/g,'').split(",");
    if (p[6]?.trim() !== "Jugado") return;
    const idP = p[0]?.trim();
    const eqL = p[2]?.trim(), eqV = p[3]?.trim();
    const gL = parseInt(p[4]?.trim()) || 0, gV = parseInt(p[5]?.trim()) || 0;
    if (idP) partidosInfo[idP] = { eqL, eqV, gL, gV };
    if (eqL) {
      golesRecibidosMap[eqL] = (golesRecibidosMap[eqL] || 0) + gV;
      partidosEquipoMap[eqL] = (partidosEquipoMap[eqL] || 0) + 1;
    }
    if (eqV) {
      golesRecibidosMap[eqV] = (golesRecibidosMap[eqV] || 0) + gL;
      partidosEquipoMap[eqV] = (partidosEquipoMap[eqV] || 0) + 1;
    }
  });


  const goleadores = jugadores
    .filter(j => j.nombre !== "Penal" && j.nombre !== "Default" && j.nombre !== "Autogol")
    .filter(j => (golesMap[j.id] || 0) > 0)
    .sort((a, b) => (golesMap[b.id] || 0) - (golesMap[a.id] || 0))
    .slice(0, 5);

  const porteros = jugadores
    .filter(j => j.posicion === "Portero" && j.nombre !== "Penal" && j.nombre !== "Default")
    .map(j => {
      // A cada portero se le asignan TODOS los goles que recibió su equipo
      const rec = golesRecibidosMap[j.equipo] || 0;
      const pj  = partidosEquipoMap[j.equipo] || 0;
      return { ...j, golesRecibidos: rec, partidosJugados: pj, promedio: pj ? rec / pj : 0 };
    })
    .filter(j => j.partidosJugados > 0)   // sin partidos jugados no entra al ranking
    .sort((a, b) => a.golesRecibidos - b.golesRecibidos || a.promedio - b.promedio || b.partidosJugados - a.partidosJugados)
    .slice(0, 5);

  const htmlGolArr = goleadores.map(j => playerCardHTML(j,
    golesMap[j.id] || 0, asistMap[j.id] || 0,
    amarillasMap[j.id] || 0, rojasMap[j.id] || 0
  ));

  const htmlPortArr = porteros.map(j => porteroCardHTML(j));

  // Estadisticas que se ven al dar doble clic a la tarjeta
  const statsGolArr = goleadores.map(j => statsFicha(j, [
    { l: '⚽ GOLES', v: golesMap[j.id] || 0 }, { l: 'Asistencia', v: asistMap[j.id] || 0 },
    { l: '🟡 AMARILLAS', v: amarillasMap[j.id] || 0 }, { l: '🔴 ROJAS', v: rojasMap[j.id] || 0 }
  ]));
  const statsPortArr = porteros.map(j => statsFicha(j, [
    { l: '🥅 GOL REC', v: j.golesRecibidos }, { l: '🧤 PJ', v: j.partidosJugados }, { l: '📊 PROM', v: j.promedio.toFixed(1) },
    { l: '🟡 AMARILLAS', v: amarillasMap[j.id] || 0 }, { l: '🔴 ROJAS', v: rojasMap[j.id] || 0 }
  ]));

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

  crearCarrusel('carrusel-goleadores', htmlGolArr, statsGolArr);
  crearCarrusel('carrusel-porteros', htmlPortArr, statsPortArr);

  const tabs = document.querySelectorAll('[data-jugadores-tab]');
  let tabActual = 'goleadores';
  function mostrarTab(nombre) {
    tabActual = nombre;
    tabs.forEach(b => b.setAttribute('aria-selected', String(b.dataset.jugadoresTab === nombre)));
    document.getElementById('filtro-equipo').hidden = nombre !== 'equipo';
    document.getElementById('tops-section').style.display = nombre === 'equipo' ? 'none' : 'block';
    document.getElementById('carrusel-goleadores').parentElement.hidden = nombre !== 'goleadores';
    document.getElementById('carrusel-porteros').parentElement.hidden = nombre !== 'porteros';
    document.getElementById('equipo-jugadores-section').style.display = nombre === 'equipo' && document.getElementById('selector-equipo-jugador').value ? 'block' : 'none';
  }
  tabs.forEach(b => b.addEventListener('click', () => mostrarTab(b.dataset.jugadoresTab)));
  mostrarTab(tabActual);

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
      tops.style.display = 'none';
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

    const htmlEquipoArr = [], statsEquipoArr = [];
    lista.forEach(j => {
      const goles = golesMap[j.id] || 0;
      const rojas = rojasMap[j.id] || 0;
      const amarillas = amarillasMap[j.id] || 0;
      const asist = asistMap[j.id] || 0;
      const porcentaje = Math.round((asist / 15) * 100);
      const suspendido = rojas > 0 ? "Sí" : "No";
      // Si es portero, se le cargan todos los goles que recibió su equipo (misma regla que el Top 5 Porteros)
      const golesRec = j.posicion === "Portero" ? (golesRecibidosMap[j.equipo] || 0) : null;
      htmlEquipoArr.push(jugadorCardHTML(j, goles, porcentaje, suspendido, golesRec, amarillas, rojas));
      statsEquipoArr.push(statsFicha(j, [
        golesRec !== null ? { l: '🥅 GOL REC', v: golesRec } : { l: '⚽ GOLES', v: goles },
        ...(golesRec !== null ? [{ l: '🧤 PJ', v: partidosEquipoMap[j.equipo] || 0 }] : []),
        { l: '🎯 ASISTENCIA', v: porcentaje + '%' },
        { l: '🟡 AMARILLAS', v: amarillas },
        { l: '🔴 ROJAS', v: rojas },
        { l: '⛔ SUSPENDIDO', v: suspendido }
      ]));
    });

    crearCarrusel('carrusel-equipo', htmlEquipoArr, statsEquipoArr);
  });
}

cargarJugadores();

