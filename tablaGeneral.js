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

// Inyectar estilos
(function() {
  if (document.getElementById("tabla-style")) return;
  const style = document.createElement("style");
  style.id = "tabla-style";
  style.textContent = `
    .tabla-wrap {
      width: 100%;
      overflow-x: auto;
      border-radius: 16px;
      box-shadow: 0 0 30px rgba(57,255,20,0.2);
    }

    .tabla-moderna {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Arial', sans-serif;
      background: #080c10;
      border-radius: 16px;
      overflow: hidden;
    }

    .tabla-moderna thead tr {
      background: rgba(57,255,20,0.08);
      border-bottom: 2px solid rgba(57,255,20,0.4);
    }

    .tabla-moderna thead th {
      padding: 16px 12px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(57,255,20,0.7);
      text-align: center;
    }

    .tabla-moderna thead th.th-equipo {
      text-align: left;
      padding-left: 20px;
    }

    .tabla-moderna tbody tr {
      border-bottom: 1px solid rgba(255,255,255,0.05);
      transition: 0.2s;
    }

    .tabla-moderna tbody tr:nth-child(even) {
      background: rgba(255,255,255,0.03);
    }

    .tabla-moderna tbody tr:hover {
      background: rgba(57,255,20,0.06);
    }

    .tabla-moderna tbody tr.lider {
      background: rgba(255,215,0,0.07);
      border-left: 3px solid gold;
    }

    .tabla-moderna tbody tr.clasificado {
      background: rgba(57,255,20,0.05);
      border-left: 3px solid #39ff14;
    }

    .tabla-moderna td {
      padding: 14px 12px;
      text-align: center;
      color: rgba(255,255,255,0.75);
      font-size: 14px;
    }

    .td-rank {
      font-size: 13px;
      font-weight: 700;
      color: rgba(255,255,255,0.35) !important;
      letter-spacing: 1px;
      width: 60px;
    }

    .td-equipo {
      text-align: left !important;
      padding-left: 16px !important;
    }

    .equipo-inner {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .equipo-logo {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: contain;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(57,255,20,0.3);
      flex-shrink: 0;
    }

    .equipo-nombre {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .td-pts {
      font-size: 18px !important;
      font-weight: 900 !important;
      color: #fff !important;
    }

    .td-dg-pos { color: #39ff14 !important; font-weight: 700 !important; }
    .td-dg-neg { color: #ff4444 !important; font-weight: 700 !important; }
    .td-dg-neu { color: rgba(255,255,255,0.5) !important; }

    @media(max-width: 600px) {
      .tabla-moderna thead th { font-size: 9px; padding: 10px 6px; letter-spacing: 1px; }
      .tabla-moderna td { font-size: 11px; padding: 10px 5px; }
      .equipo-logo { width: 32px; height: 32px; }
      .equipo-nombre { font-size: 11px; }
      .td-pts { font-size: 14px !important; }
      .col-hide { display: none; }
    }
  `;
  document.head.appendChild(style);
})();

async function cargarTablaCompleta() {
  const respuesta = await fetch(URL_ESTADISTICAS);
  const texto = await respuesta.text();
  const filas = texto.trim().split("\n");
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
  equipos.forEach((e, idx) => {
    const rankStr = String(idx + 1).padStart(3, '0');
    const logo = logos[e.equipo] || '';
    const dg = Number(e.dg);
    const dgClass = dg > 0 ? 'td-dg-pos' : dg < 0 ? 'td-dg-neg' : 'td-dg-neu';
    const dgStr = dg > 0 ? `+${dg}` : `${dg}`;
    const rowClass = idx === 0 ? 'lider' : idx < 4 ? 'clasificado' : '';

    rows += `
    <tr class="${rowClass}">
      <td class="td-rank">${rankStr}</td>
      <td class="td-equipo">
        <div class="equipo-inner">
          <img class="equipo-logo" src="${logo}" alt="${e.equipo}">
          <span class="equipo-nombre">${e.equipo}</span>
        </div>
      </td>
      <td class="col-hide">${e.jj}</td>
      <td class="col-hide">${e.jg}</td>
      <td class="col-hide">${e.je}</td>
      <td class="col-hide">${e.jp}</td>
      <td class="col-hide">${e.gf}</td>
      <td class="col-hide">${e.gc}</td>
      <td class="${dgClass}">${dgStr}</td>
      <td class="td-pts">${e.pts}</td>
    </tr>`;
  });

  const html = `
  <div class="tabla-wrap">
    <table class="tabla-moderna">
      <thead>
        <tr>
          <th>RANK</th>
          <th class="th-equipo">EQUIPO</th>
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

  document.getElementById("tabla-general-completa").innerHTML = html;
}

cargarTablaCompleta();
