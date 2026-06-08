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
    .tbl-gn thead th {
      font-size: 11px; font-weight: 700; color: rgba(57,255,20,0.6);
      letter-spacing: 2px; text-transform: uppercase;
      padding: 12px 10px; text-align: center;
    }
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
    .zone-label {
      writing-mode: vertical-rl; text-orientation: mixed;
      transform: rotate(180deg);
      font-size: 9px; letter-spacing: 1px; text-transform: uppercase;
      color: rgba(255,255,255,0.3); white-space: nowrap;
    }
    .rank-circle {
      width: 28px; height: 28px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
    }
    .rank-1 { background: #ffd700; color: #3d2200; }
    .rank-2 { background: #c0c0c0; color: #1a1a1a; }
    .rank-3 { background: #cd7f32; color: #fff; }
    .rank-top { background: rgba(57,255,20,0.15); color: #39ff14; border: 1px solid rgba(57,255,20,0.4); }
    .rank-normal { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.4); }
    .team-inner { display: flex; align-items: center; gap: 10px; }
    .team-logo { width: 38px; height: 38px; object-fit: contain; }
    .team-name { font-size: 13px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; }
    .pill {
      display: inline-block; padding: 3px 8px; border-radius: 20px;
      font-size: 12px; font-weight: 500;
      background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.6);
      min-width: 28px;
    }
    .td-pts { font-size: 17px !important; font-weight: 900 !important; color: #fff !important; }
    .dg-pos { color: #39ff14 !important; font-weight: 700 !important; }
    .dg-neg { color: #ff4444 !important; font-weight: 700 !important; }
    .dg-neu { color: rgba(255,255,255,0.4) !important; }
    @media(max-width: 600px) {
      .tbl-gn thead th { font-size: 9px; padding: 8px 5px; letter-spacing: 1px; }
      .tbl-gn td { font-size: 11px; padding: 8px 4px; }
      .team-logo { width: 28px; height: 28px; }
      .team-name { font-size: 11px; }
      .td-pts { font-size: 14px !important; }
      .col-hide { display: none; }
      .pill { font-size: 10px; padding: 2px 5px; min-width: 20px; }
    }
  `;
  document.head.appendChild(style);
})();

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
    const rankStr = String(i + 1).padStart(3, '0');
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : i < 4 ? 'rank-top' : 'rank-normal';
    const rowClass = i === 0 ? 'row-lider' : i < 4 ? 'row-clasificado' : '';
    const sepClass = i === 1 ? 'sep-lider' : i === 4 ? 'sep-clasificado' : '';
    const zoneLabel = i === 0 ? 'Líder' : i === 1 ? 'Clasificados' : i === 4 ? 'Resto' : '';

    rows += `
    <tr class="${rowClass} ${sepClass}">
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
