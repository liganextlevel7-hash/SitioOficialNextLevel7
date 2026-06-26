const URL_ESTADISTICAS =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=979195152&single=true&output=csv";

const logos = {
  "Soldados Del Amor":"https://i.imgur.com/gBvmM4v.png",
  "Cuervos F.C":"https://i.imgur.com/fGQAhE5.png",
  "Unión 8":"https://i.imgur.com/Qrx4JSj.png",
  "La Garra":"https://i.imgur.com/8BWFWBW.png",
  "Pumas KAP":"https://i.imgur.com/5TAVBS7.png",
  "Los Chipotles":"https://i.imgur.com/KTMLCv9.png",
  "Deportivo CT":"https://i.imgur.com/hqOAa7J.png",
  "Gusanitos":"https://i.imgur.com/5TARJkD.png",
  "Bacachitos":"https://i.imgur.com/ddKmNL6.png"
};

(function() {
  if (document.getElementById("tabla-gn-style")) return;
  const style = document.createElement("style");
  style.id = "tabla-gn-style";
  style.textContent = `
    .tbl-gn-wrap { width: 100%; overflow-x: auto; }
    .tbl-gn { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; background: #080c10; }
    .tbl-gn thead tr { border-bottom: 1px solid rgba(57,255,20,0.3); }
    .tbl-gn thead th { font-size: 11px; font-weight: 700; color: rgba(57,255,20,0.6); letter-spacing: 2px; text-transform: uppercase; padding: 12px 10px; text-align: center; }
    .tbl-gn thead th.th-team { text-align: left; padding-left: 8px; }
    .tbl-gn tbody tr { border-bottom: 0.5px solid rgba(255,255,255,0.05); transition: background 0.15s; }
    .tbl-gn tbody tr:hover { background: rgba(57,255,20,0.05); }
    .tbl-gn tbody tr.row-lider { border-left: 3px solid #ffd700; }
    .tbl-gn tbody tr.row-clasificado { border-left: 3px solid #39ff14; }
    .tbl-gn tbody tr.sep-lider td { border-top: 1px solid rgba(255,215,0,0.3); }
    .tbl-gn tbody tr.sep-clasificado td { border-top: 1px solid rgba(57,255,20,0.3); }
    .tbl-gn td { padding: 10px; text-align: center; font-size: 13px; color: rgba(255,255,255,0.75); }
    .tbl-gn td.td-zone { padding: 0 4px !important; vertical-align: middle; width: 14px; }
    .tbl-gn td.td-team { text-align: left; }
    .zone-label { writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg); font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.3); white-space: nowrap; }
    .rank-circle { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
    .rank-1 { background: #ffd700; color: #3d2200; }
    .rank-2 { background: #c0c0c0; color: #1a1a1a; }
    .rank-3 { background: #cd7f32; color: #fff; }
    .rank-top { background: rgba(57,255,20,0.15); color: #39ff14; border: 1px solid rgba(57,255,20,0.4); }
    .rank-normal { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.4); }
    .team-inner { display: flex; align-items: center; gap: 10px; }
    .team-logo { width: 55px; height: 55px; object-fit: contain; }
    .team-name { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 0.5px; }
    .pill { display: inline-block; padding: 3px 8px; border-radius: 20px; font-size: 12px; font-weight: 500; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.6); min-width: 28px; }
    .td-pts { font-size: 17px !important; font-weight: 900 !important; color: #fff !important; }
    .dg-pos { color: #39ff14 !important; font-weight: 700 !important; }
    .dg-neg { color: #ff4444 !important; font-weight: 700 !important; }
    .dg-neu { color: rgba(255,255,255,0.4) !important; }

    /* POPUP */
    .popup-overlay { display: none; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.85); z-index: 9999; justify-content: center; align-items: center; }
    .popup-overlay.active { display: flex; }
    .popup-card { background: #080c10; border: 2px solid #39ff14; border-radius: 18px; padding: 24px 20px; width: 85%; max-width: 340px; box-shadow: 0 0 30px rgba(57,255,20,0.3); position: relative; }
    .popup-close { position: absolute; top: 12px; right: 16px; font-size: 24px; color: rgba(255,255,255,0.5); cursor: pointer; background: none; border: none; line-height: 1; }
    .popup-close:hover { color: #39ff14; }
    .popup-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid rgba(57,255,20,0.2); }
    .popup-logo { width: 52px; height: 52px; object-fit: contain; }
    .popup-nombre { font-size: 15px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
    .popup-rank { font-size: 12px; color: rgba(57,255,20,0.7); margin-top: 3px; }
    .popup-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .popup-stat { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px 6px; text-align: center; }
    .popup-stat-val { font-size: 20px; font-weight: 900; color: #fff; line-height: 1; }
    .popup-stat-val.green { color: #39ff14; }
    .popup-stat-val.red { color: #ff4444; }
    .popup-stat-lbl { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; }
    .popup-pts { margin-top: 14px; text-align: center; background: rgba(57,255,20,0.08); border: 1px solid rgba(57,255,20,0.3); border-radius: 12px; padding: 12px; }
    .popup-pts-val { font-size: 32px; font-weight: 900; color: #39ff14; line-height: 1; }
    .popup-pts-lbl { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }

    @media(max-width: 600px) {
      .tbl-gn thead th { font-size: 9px; padding: 8px 5px; letter-spacing: 1px; }
      .tbl-gn td { font-size: 11px; padding: 8px 4px; }
      .team-logo { width: 44px; height: 44px; }
      .team-name { font-size: 11px; }
      .td-pts { font-size: 14px !important; }
      .col-hide { display: none; }
      .pill { font-size: 10px; padding: 2px 5px; min-width: 20px; }
      .tbl-gn tbody tr { cursor: pointer; }
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
  const respuesta = await fetch(URL_ESTADISTICAS);
  const texto = await respuesta.text();
  const filas = texto.replace(/\r/g,'').trim().split("\n");
  const equipos = [];

  for (let i = 1; i < filas.length; i++) {
    const c = filas[i].split(",");
    const nombre = c[1]?.trim();
    if (!nombre || nombre === "Descansa") continue;
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

  let rows = '';
  equipos.forEach((e, i) => {
    const logo = logos[e.equipo] || '';
    const dg = Number(e.dg);
    const dgStr = dg > 0 ? `+${dg}` : `${dg}`;
    const dgClass = dg > 0 ? 'dg-pos' : dg < 0 ? 'dg-neg' : 'dg-neu';
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : i < 4 ? 'rank-top' : 'rank-normal';
    const rowClass = i === 0 ? 'row-lider' : i < 4 ? 'row-clasificado' : '';
    const sepClass = i === 1 ? 'sep-lider' : i === 4 ? 'sep-clasificado' : '';
    const zoneLabel = i === 0 ? 'Líder' : i === 1 ? 'Clasificados' : i === 4 ? 'Resto' : '';

    rows += `
    <tr class="${rowClass} ${sepClass}" onclick="abrirPopup(equiposTabla[${i}])" ontouchstart="abrirPopup(equiposTabla[${i}])">
      <td class="td-zone">${zoneLabel ? `<span class="zone-label">${zoneLabel}</span>` : ''}</td>
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

cargarTablaCompleta();
