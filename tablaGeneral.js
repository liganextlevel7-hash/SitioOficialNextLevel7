const URL_ESTADISTICAS =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=979195152&single=true&output=csv";

const URL_EQUIPOS =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1894947293&single=true&output=csv";

let logos = {}; // nombre -> logo, se llena solo desde la hoja "Equipos"
let bajas = new Set(); // nombres de equipos con Status = Baja (no se muestran)

async function cargarCatalogoEquipos(){
  const respuesta = await fetch(URL_EQUIPOS);
  const texto = await respuesta.text();
  const filas = texto.trim().split("\n");
  const logosTmp = {};
  for(let i=1;i<filas.length;i++){
    const c = filas[i].split(",");
    const nombre = (c[1] || "").trim();
    if(!nombre) continue;
    if((c[5] || "").trim().toLowerCase() === "baja"){ bajas.add(nombre); continue; }
    const logoUrl = (c[4] || c[3] || "").trim();
    logosTmp[nombre] = logoUrl;
  }
  logos = logosTmp;
}

(function() {
  if (document.getElementById("tabla-gn-style")) return;
  const style = document.createElement("style");
  style.id = "tabla-gn-style";
  style.textContent = `
    .tbl-gn-wrap { width: 100%; overflow-x: auto; }
    .tbl-gn { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; background: #0a1830; }
    .tbl-gn thead tr { border-bottom: 1px solid rgba(255,215,0,0.3); }
    .tbl-gn thead th { font-size: 11px; font-weight: 700; color: rgba(255,215,0,0.6); letter-spacing: 2px; text-transform: uppercase; padding: 12px 10px; text-align: center; }
    .tbl-gn thead th.th-team { text-align: left; padding-left: 8px; }
    .tbl-gn tbody tr { border-bottom: 0.5px solid rgba(255,255,255,0.05); transition: background 0.15s; }
    .tbl-gn tbody tr:hover { background: rgba(255,215,0,0.05); }
    .tbl-gn tbody tr.row-lider { border-left: 3px solid #ffd700; }
    .tbl-gn tbody tr.row-clasificado { border-left: 3px solid #ffd700; }
    .tbl-gn tbody tr.sep-lider td { border-top: 1px solid rgba(255,215,0,0.3); }
    .tbl-gn tbody tr.sep-clasificado td { border-top: 1px solid rgba(255,215,0,0.3); }
    .tbl-gn td { padding: 10px; text-align: center; font-size: 13px; color: rgba(255,255,255,0.75); }
    .tbl-gn td.td-zone { padding: 0 4px !important; vertical-align: middle; width: 14px; }
    .tbl-gn td.td-team { text-align: left; }
    .zone-label { writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); white-space: nowrap; }
    .rank-circle { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
    .rank-1 { background: #ffd700; color: #3d2200; }
    .rank-2 { background: #c0c0c0; color: #1a1a1a; }
    .rank-3 { background: #cd7f32; color: #fff; }
    .rank-top { background: rgba(255,215,0,0.15); color: #ffd700; border: 1px solid rgba(255,215,0,0.4); }
    .rank-normal { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.4); }
    .team-inner { display: flex; align-items: center; gap: 10px; }
    .team-logo { width: 55px; height: 55px; object-fit: contain; }
    .team-name { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 0.5px; }
    .pill { display: inline-block; padding: 3px 8px; border-radius: 20px; font-size: 12px; font-weight: 500; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.6); min-width: 28px; }
    .td-pts { font-size: 17px !important; font-weight: 900 !important; color: #fff !important; }
    .dg-pos { color: #ffd700 !important; font-weight: 700 !important; }
    .dg-neg { color: #ff4444 !important; font-weight: 700 !important; }
    .dg-neu { color: rgba(255,255,255,0.4) !important; }

    .tbl-gn-bar { display: flex; justify-content: flex-end; margin-bottom: 10px; }
    .btn-png-tabla { background: #5eb50d; color: #142702; border: none; border-radius: 10px; padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-png-tabla:hover { background: #ddc530; }
    .btn-png-tabla:disabled { opacity: 0.6; cursor: default; }

    /* POPUP */
    .popup-overlay { display: none; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.85); z-index: 9999; justify-content: center; align-items: center; }
    .popup-overlay.active { display: flex; }
    .popup-card { background: #0a1830; border: 2px solid #ffd700; border-radius: 18px; padding: 24px 20px; width: 85%; max-width: 340px; box-shadow: 0 0 30px rgba(255,215,0,0.3); position: relative; }
    .popup-close { position: absolute; top: 12px; right: 16px; font-size: 24px; color: rgba(255,255,255,0.5); cursor: pointer; background: none; border: none; line-height: 1; }
    .popup-close:hover { color: #ffd700; }
    .popup-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,215,0,0.2); }
    .popup-logo { width: 52px; height: 52px; object-fit: contain; }
    .popup-nombre { font-size: 15px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
    .popup-rank { font-size: 12px; color: rgba(255,215,0,0.7); margin-top: 3px; }
    .popup-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .popup-stat { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px 6px; text-align: center; }
    .popup-stat-val { font-size: 20px; font-weight: 900; color: #fff; line-height: 1; }
    .popup-stat-val.green { color: #ffd700; }
    .popup-stat-val.red { color: #ff4444; }
    .popup-stat-lbl { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; }
    .popup-pts { margin-top: 14px; text-align: center; background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.3); border-radius: 12px; padding: 12px; }
    .popup-pts-val { font-size: 32px; font-weight: 900; color: #ffd700; line-height: 1; }
    .popup-pts-lbl { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }

    @media(max-width: 600px) {
      .tbl-gn thead th { font-size: 9px; padding: 8px 5px; letter-spacing: 1px; }
      .tbl-gn td { font-size: 11px; padding: 8px 4px; }
      .team-logo { width: 44px; height: 44px; }
      .team-name { font-size: 11px; }
      .td-pts { font-size: 14px !important; }
      .col-hide { display: none; }
      .pill { font-size: 10px; padding: 2px 5px; min-width: 20px; }
      .tbl-gn tbody tr { cursor: pointer; touch-action: manipulation; }
    }
    @media(min-width: 601px) {
      .tbl-gn tbody tr { cursor: default; }
    }
  `;
  document.head.appendChild(style);
})();

// Crear popup en el DOM
function crearPopup() {
  if (document.getElementById("equipo-popup")) return;
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  overlay.id = "equipo-popup";
  overlay.innerHTML = `
    <div class="popup-card">
      <button class="popup-close" id="popup-close-btn">&times;</button>
      <div class="popup-header">
        <img class="popup-logo" id="popup-logo" src="" alt="">
        <div>
          <div class="popup-nombre" id="popup-nombre"></div>
          <div class="popup-rank" id="popup-rank"></div>
        </div>
      </div>
      <div class="popup-stats">
        <div class="popup-stat"><div class="popup-stat-val" id="popup-jj"></div><div class="popup-stat-lbl">JJ</div></div>
        <div class="popup-stat"><div class="popup-stat-val green" id="popup-jg"></div><div class="popup-stat-lbl">JG</div></div>
        <div class="popup-stat"><div class="popup-stat-val" id="popup-je"></div><div class="popup-stat-lbl">JE</div></div>
        <div class="popup-stat"><div class="popup-stat-val red" id="popup-jp"></div><div class="popup-stat-lbl">JP</div></div>
        <div class="popup-stat"><div class="popup-stat-val" id="popup-gf"></div><div class="popup-stat-lbl">GF</div></div>
        <div class="popup-stat"><div class="popup-stat-val" id="popup-gc"></div><div class="popup-stat-lbl">GC</div></div>
      </div>
      <div class="popup-pts">
        <div class="popup-pts-val" id="popup-pts"></div>
        <div class="popup-pts-lbl">Puntos</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById("popup-close-btn").addEventListener("click", cerrarPopup);
  overlay.addEventListener("click", e => { if (e.target === overlay) cerrarPopup(); });
}

// En celular el popup se abre con doble toque (un toque suelto no hace nada, así no estorba al deslizar)
let ultimoToqueFila = { i: -1, t: 0 };
function tocarFilaEquipo(i) {
  if (window.innerWidth > 600) return;
  const ahora = Date.now();
  if (ultimoToqueFila.i === i && ahora - ultimoToqueFila.t < 450) {
    ultimoToqueFila = { i: -1, t: 0 };
    abrirPopup(window.equiposTabla[i]);
  } else {
    ultimoToqueFila = { i: i, t: ahora };
  }
}

function abrirPopup(e) {
  if (window.innerWidth > 600) return;
  crearPopup();
  const dg = Number(e.dg);
  const dgStr = dg > 0 ? `+${dg}` : `${dg}`;
  document.getElementById("popup-logo").src = logos[e.equipo] || '';
  document.getElementById("popup-nombre").textContent = e.equipo;
  document.getElementById("popup-rank").textContent = `Posición #${e.ranking}  •  DG: ${dgStr}`;
  document.getElementById("popup-jj").textContent = e.jj;
  document.getElementById("popup-jg").textContent = e.jg;
  document.getElementById("popup-je").textContent = e.je;
  document.getElementById("popup-jp").textContent = e.jp;
  document.getElementById("popup-pts").textContent = e.pts;
  document.getElementById("popup-gf").textContent = e.gf;
  document.getElementById("popup-gc").textContent = e.gc;
  document.getElementById("equipo-popup").classList.add("active");
}

function cerrarPopup() {
  const overlay = document.getElementById("equipo-popup");
  if (overlay) overlay.classList.remove("active");
}

async function cargarTablaCompleta() {
  await cargarCatalogoEquipos(); // primero traemos equipos/logos reales del Sheet
  const respuesta = await fetch(URL_ESTADISTICAS);
  const texto = await respuesta.text();
  const filas = texto.replace(/\r/g,'').trim().split("\n");
  const equipos = [];

  for (let i = 1; i < filas.length; i++) {
    const c = filas[i].split(",");
    const nombre = c[1]?.trim();
    if (!nombre || nombre === "Descansa" || bajas.has(nombre)) continue;
    equipos.push({
      ranking: c[10]?.trim() || "-",
      equipo:  nombre,
      jj:  c[2]?.trim() || 0,
      jg:  c[3]?.trim() || 0,
      je:  c[4]?.trim() || 0,
      jp:  c[5]?.trim() || 0,
      gf:  c[6]?.trim() || 0,
      gc:  c[7]?.trim() || 0,
      dg:  c[8]?.trim() || 0,
      pts: c[9]?.trim() || 0
    });
  }

  equipos.sort((a, b) => (Number(a.ranking) || 999) - (Number(b.ranking) || 999));
  equipos.forEach((e, i) => { e.ranking = i + 1; }); // posición real, sin depender del número que mande la hoja

  const n = equipos.length;
  const finClasif = Math.min(7, n - 1); // última fila (índice) que entra en "Clasificados"
  const inicioResto = 8;

  let rows = '';
  equipos.forEach((e, i) => {
    const logo = logos[e.equipo] || '';
    const dg = Number(e.dg);
    const dgStr = dg > 0 ? `+${dg}` : `${dg}`;
    const dgClass = dg > 0 ? 'dg-pos' : dg < 0 ? 'dg-neg' : 'dg-neu';
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : i < 8 ? 'rank-top' : 'rank-normal';
    const rowClass = i === 0 ? 'row-lider' : i < 8 ? 'row-clasificado' : '';
    const sepClass = i === 1 ? 'sep-lider' : i === 8 ? 'sep-clasificado' : '';
    // La etiqueta de zona usa rowspan para quedar centrada en TODAS sus filas, no solo en una
    let zoneCell = '';
    if (i === 0) {
      zoneCell = `<td class="td-zone" rowspan="1"><span class="zone-label">Líder</span></td>`;
    } else if (i === 1) {
      zoneCell = `<td class="td-zone" rowspan="${finClasif}"><span class="zone-label">Clasificados</span></td>`;
    } else if (i === inicioResto && n > inicioResto) {
      zoneCell = `<td class="td-zone" rowspan="${n - inicioResto}"><span class="zone-label">Resto</span></td>`;
    } else if (i > 1 && i <= finClasif) {
      zoneCell = ''; // cubierta por el rowspan de la fila 2
    } else if (i > inicioResto) {
      zoneCell = ''; // cubierta por el rowspan de la fila 9
    }

    rows += `
    <tr class="${rowClass} ${sepClass}" onclick="tocarFilaEquipo(${i})">
      ${zoneCell}
      <td><span class="rank-circle ${rankClass}">${i + 1}</span></td>
      <td class="td-team">
        <div class="team-inner">
          <img class="team-logo" src="${logo}" alt="${e.equipo}">
          <span class="team-name">${e.equipo}</span>
        </div>
      </td>
      <td class="col-hide"><span class="pill">${e.jj}</span></td>
      <td class="col-hide"><span class="pill">${e.jg}</span></td>
      <td class="col-hide"><span class="pill">${e.je}</span></td>
      <td class="col-hide"><span class="pill">${e.jp}</span></td>
      <td class="col-hide"><span class="pill">${e.gf}</span></td>
      <td class="col-hide"><span class="pill">${e.gc}</span></td>
      <td class="${dgClass}">${dgStr}</td>
      <td class="td-pts">${e.pts}</td>
    </tr>`;
  });

  window.equiposTabla = equipos;

  document.getElementById("tabla-general-completa").innerHTML = `
  <div class="tbl-gn-bar"><button id="btn-png-tabla" class="btn-png-tabla" onclick="descargarTablaPNG()">Descargar PNG para imprimir</button></div>
  <div class="tbl-gn-wrap">
    <table class="tbl-gn">
      <thead>
        <tr>
          <th></th>
          <th>NO</th>
          <th class="th-team">Equipo</th>
          <th class="col-hide">JJ</th>
          <th class="col-hide">JG</th>
          <th class="col-hide">JE</th>
          <th class="col-hide">JP</th>
          <th class="col-hide">GF</th>
          <th class="col-hide">GC</th>
          <th>+/-</th>
          <th>PTS</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ==================== PNG IMPRIMIBLE (horizontal, tamaño A4) ====================
// Mismo diseño que la tabla de la página: fondo azul marino, dorado, píldoras y zonas Líder / Clasificados / Resto
const PNG_FONDO = "fondo-tabla.png";   // opcional: si subes esta imagen al repo se usa de fondo
const PNG_LOGO  = "logo-liga.png.png"; // logo de la liga (opcional)

function cargarImagenPNG(src){
  return new Promise(res => {
    if(!src) return res(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

function rectRedondo(g, x, y, w, h, r){
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

async function descargarTablaPNG(){
  const lista = window.equiposTabla || [];
  if(!lista.length) return;
  const btn = document.getElementById("btn-png-tabla");
  if(btn){ btn.disabled = true; btn.textContent = "Generando PNG..."; }
  try{
    const W = 3508, H = 2480; // A4 horizontal a 300 dpi
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const F = "Arial, sans-serif";

    const [fondo, logoLiga, ...escudos] = await Promise.all([
      cargarImagenPNG(PNG_FONDO),
      cargarImagenPNG(PNG_LOGO),
      ...lista.map(e => cargarImagenPNG(logos[e.equipo]))
    ]);

    // Fondo exterior
    if(fondo){
      const r = Math.max(W / fondo.width, H / fondo.height);
      const w = fondo.width * r, h = fondo.height * r;
      g.drawImage(fondo, (W - w) / 2, (H - h) / 2, w, h);
      g.fillStyle = "rgba(5,12,24,0.55)";
      g.fillRect(0, 0, W, H);
    } else {
      const bg = g.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#06121f");
      bg.addColorStop(1, "#0d2a10");
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);
    }

    // Panel azul marino con borde verde
    const px = 110, pw = W - 220, pTop = 80, pBottom = 2370;
    g.save();
    g.shadowColor = "rgba(94,181,13,0.6)"; g.shadowBlur = 40;
    rectRedondo(g, px, pTop, pw, pBottom - pTop, 50);
    g.fillStyle = "#0a1830"; g.fill();
    g.restore();
    rectRedondo(g, px, pTop, pw, pBottom - pTop, 50);
    g.strokeStyle = "#5eb50d"; g.lineWidth = 6; g.stroke();

    // Título
    g.textBaseline = "middle";
    g.textAlign = "center";
    g.fillStyle = "#5eb50d";
    g.font = "bold 96px " + F;
    g.fillText("\uD83C\uDFC6 Tabla General Completa", W / 2, 195);
    if(logoLiga){
      const lh = 170, lw = logoLiga.width * (lh / logoLiga.height);
      g.drawImage(logoLiga, px + 70, 110, lw, lh);
    }
    g.textAlign = "right";
    g.fillStyle = "rgba(255,255,255,0.55)";
    g.font = "42px " + F;
    g.fillText("Actualizada al " + new Date().toLocaleDateString("es-MX"), px + pw - 70, 195);

    // Columnas
    const cols = [["JJ","jj",230],["JG","jg",230],["JE","je",230],["JP","jp",230],["GF","gf",230],["GC","gc",230],["+/-","dg",240],["PTS","pts",300]];
    const numW = cols.reduce((a, c) => a + c[2], 0);
    const numX = px + pw - 50 - numW;
    const headTop = 300, headH = 80;
    const rowsTop = headTop + headH;
    const n = lista.length;
    const rowH = Math.min(140, (pBottom - 30 - rowsTop) / n);

    // Encabezados
    g.fillStyle = "rgba(255,215,0,0.7)";
    g.font = "bold 42px " + F;
    if("letterSpacing" in g) g.letterSpacing = "6px";
    g.textAlign = "center";
    g.fillText("NO", px + 180, headTop + headH / 2);
    g.textAlign = "left";
    g.fillText("EQUIPO", px + 260, headTop + headH / 2);
    g.textAlign = "center";
    let hx = numX;
    cols.forEach(c => { g.fillText(c[0], hx + c[2] / 2, headTop + headH / 2); hx += c[2]; });
    if("letterSpacing" in g) g.letterSpacing = "0px";
    g.strokeStyle = "rgba(255,215,0,0.3)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(px + 30, rowsTop); g.lineTo(px + pw - 30, rowsTop); g.stroke();

    // Filas
    lista.forEach((e, i) => {
      const y = rowsTop + i * rowH;
      const cy = y + rowH / 2;

      // separador fino entre filas
      g.strokeStyle = "rgba(255,255,255,0.06)"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(px + 30, y + rowH); g.lineTo(px + pw - 30, y + rowH); g.stroke();
      // líneas doradas: después del líder y después del 4.º lugar
      if((i === 1 || i === 8) && n > i){
        g.strokeStyle = "rgba(255,215,0,0.45)"; g.lineWidth = 4;
        g.beginPath(); g.moveTo(px + 30, y); g.lineTo(px + pw - 30, y); g.stroke();
      }
      // borde dorado a la izquierda: líder y clasificados
      if(i < 8){ g.fillStyle = "#ffd700"; g.fillRect(px + 30, y, 8, rowH); }

      // Número de posición
      const rx = px + 180;
      g.beginPath(); g.arc(rx, cy, 38, 0, Math.PI * 2);
      let txt;
      if(i === 0){ g.fillStyle = "#ffd700"; g.fill(); txt = "#3d2200"; }
      else if(i === 1){ g.fillStyle = "#c0c0c0"; g.fill(); txt = "#1a1a1a"; }
      else if(i === 2){ g.fillStyle = "#cd7f32"; g.fill(); txt = "#ffffff"; }
      else if(i < 8){ g.fillStyle = "rgba(255,215,0,0.15)"; g.fill(); g.strokeStyle = "rgba(255,215,0,0.5)"; g.lineWidth = 3; g.stroke(); txt = "#ffd700"; }
      else { g.fillStyle = "rgba(255,255,255,0.08)"; g.fill(); txt = "rgba(255,255,255,0.5)"; }
      g.fillStyle = txt; g.textAlign = "center";
      g.font = "bold 42px " + F;
      g.fillText(String(i + 1), rx, cy + 2);

      // Escudo
      const sz = rowH - 24, sx = px + 260, sy = y + 12;
      const im = escudos[i];
      if(im){
        const k = Math.min(sz / im.width, sz / im.height);
        g.drawImage(im, sx + (sz - im.width * k) / 2, sy + (sz - im.height * k) / 2, im.width * k, im.height * k);
      } else {
        g.strokeStyle = "rgba(255,255,255,0.2)"; g.lineWidth = 3;
        g.beginPath(); g.arc(sx + sz / 2, cy, sz / 2 - 4, 0, Math.PI * 2); g.stroke();
      }

      // Nombre (mayúsculas como en la página; se achica si no cabe)
      const nx = sx + sz + 40, maxNombre = numX - nx - 30;
      const nombre = String(e.equipo).toUpperCase();
      let fs = 56;
      g.textAlign = "left"; g.fillStyle = "rgba(255,255,255,0.9)";
      g.font = "bold " + fs + "px " + F;
      while(g.measureText(nombre).width > maxNombre && fs > 30){ fs -= 2; g.font = "bold " + fs + "px " + F; }
      g.fillText(nombre, nx, cy + 2);

      // Números
      let cx = numX;
      cols.forEach(c => {
        const mid = cx + c[2] / 2;
        cx += c[2];
        g.textAlign = "center";
        if(c[1] === "pts"){
          g.fillStyle = "#ffffff"; g.font = "bold 76px " + F;
          g.fillText(String(e.pts), mid, cy + 3);
        } else if(c[1] === "dg"){
          const d = Number(e.dg);
          g.fillStyle = d > 0 ? "#ffd700" : d < 0 ? "#ff4444" : "rgba(255,255,255,0.4)";
          g.font = "bold 56px " + F;
          g.fillText(d > 0 ? "+" + d : String(d), mid, cy + 2);
        } else {
          rectRedondo(g, mid - 70, cy - 38, 140, 76, 36);
          g.fillStyle = "rgba(255,255,255,0.08)"; g.fill();
          g.fillStyle = "rgba(255,255,255,0.9)"; g.font = "bold 50px " + F;
          g.fillText(String(e[c[1]]), mid, cy + 3);
        }
      });
    });

    // Etiquetas verticales de zona (Líder / Clasificados / Resto)
    function zona(texto, filaIni, filaFin){
      const yMid = rowsTop + ((filaIni + filaFin + 1) / 2) * rowH;
      g.save();
      g.translate(px + 85, yMid);
      g.rotate(-Math.PI / 2);
      g.fillStyle = "rgba(255,255,255,0.4)";
      g.font = "bold 30px " + F;
      g.textAlign = "center"; g.textBaseline = "middle";
      if("letterSpacing" in g) g.letterSpacing = "4px";
      g.fillText(texto.toUpperCase(), 0, 0);
      g.restore();
    }
    zona("Líder", 0, 0);
    if(n > 1) zona("Clasificados", 1, Math.min(7, n - 1));
    if(n > 8) zona("Resto", 8, Math.min(10, n - 1));

    // Leyenda
    g.textBaseline = "middle"; g.textAlign = "center";
    if("letterSpacing" in g) g.letterSpacing = "0px";
    g.fillStyle = "rgba(255,255,255,0.6)"; g.font = "38px " + F;
    g.fillText("JJ jugados, JG ganados, JE empatados, JP perdidos, GF goles a favor, GC goles en contra, +/- diferencia de goles, PTS puntos", W / 2, 2425);

    const blob = await new Promise(res => cv.toBlob(res, "image/png"));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Tabla-General-Liga-Next-Level-7.png";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }catch(err){
    console.error("Error generando PNG:", err);
    alert("No se pudo generar el PNG. Revisa la consola.");
  }finally{
    if(btn){ btn.disabled = false; btn.textContent = "Descargar PNG para imprimir"; }
  }
}

cargarTablaCompleta();
