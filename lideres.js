// ==================== LÍDERES ====================

const URL_ESTADISTICAS_LID =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=979195152&single=true&output=csv";

const logosLideres = {
  "Unión 8":            "https://i.imgur.com/Qrx4JSj.png",
  "Cuervos F.C":        "https://i.imgur.com/fGQAhE5.png",
  "Pumas KAP":          "https://i.imgur.com/5TAVBS7.png",
  "Soldados Del Amor":  "https://i.imgur.com/gBvmM4v.png",
  "Los Chipotles":      "https://i.imgur.com/KTMLCv9.png",
  "La Garra":           "https://i.imgur.com/8BWFWBW.png",
  "Gusanitos":          "https://i.imgur.com/5TARJkD.png",
  "Rivera F.C.":        "https://i.imgur.com/5OdgpY3.png",
  "Real Alcoholicos":   "https://i.imgur.com/TUYE08R.png",
  "Gambeta F.C.":       "https://i.imgur.com/V9MmhZh.png",
  "USG Warriors":       "https://i.imgur.com/m3BIxVG.png",
  "Real Mala Copa":     "https://i.imgur.com/gBZxWD0.png",
  "Puebla 450":         "https://i.imgur.com/YsJU3aK.png"
};

// Inyectar estilos
(function() {
  if (document.getElementById("lideres-style")) return;
  const style = document.createElement("style");
  style.id = "lideres-style";
  style.textContent = `
    .lideres-podio {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 10px;
      padding: 10px 0 20px;
      flex-wrap: nowrap;
    }

    .lider-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    /* Laureles SVG container */
    .lider-laurel {
      position: relative;
      width: 160px;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: -10px;
    }

    .lider-laurel svg.laurel-svg {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
    }

    .lider-escudo-wrap {
      position: relative;
      z-index: 2;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lider-escudo {
      width: 75px;
      height: 75px;
      object-fit: contain;
      filter: drop-shadow(0 0 10px rgba(255,215,0,0.6));
    }

    /* Pedestal */
    .lider-pedestal {
      width: 140px;
      border-radius: 8px 8px 4px 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 8px;
      position: relative;
      overflow: hidden;
    }

    .lider-pedestal::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      border-radius: 8px 8px 0 0;
    }

    /* Oro */
    .lider-item.gold .lider-pedestal {
      background: linear-gradient(160deg, #2a2000 0%, #1a1400 100%);
      border: 1px solid #ffd700;
      box-shadow: 0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.2);
      height: 110px;
    }
    .lider-item.gold .lider-pedestal::before { background: linear-gradient(90deg, #ffd700, #ffe566, #ffd700); }
    .lider-item.gold .lider-laurel svg path { fill: #ffd700; }
    .lider-item.gold .lider-numero { color: #ffd700; text-shadow: 0 0 10px #ffd700; }
    .lider-item.gold .lider-nombre { color: #ffe566; }
    .lider-item.gold .lider-pts { color: #ffd700; }
    .lider-item.gold .lider-escudo { filter: drop-shadow(0 0 12px rgba(255,215,0,0.8)); }

    /* Plata */
    .lider-item.silver .lider-pedestal {
      background: linear-gradient(160deg, #1a1a1a 0%, #111 100%);
      border: 1px solid #c0c0c0;
      box-shadow: 0 0 15px rgba(192,192,192,0.4), 0 0 30px rgba(192,192,192,0.15);
      height: 90px;
    }
    .lider-item.silver .lider-pedestal::before { background: linear-gradient(90deg, #c0c0c0, #e8e8e8, #c0c0c0); }
    .lider-item.silver .lider-laurel svg path { fill: #c0c0c0; }
    .lider-item.silver .lider-numero { color: #c0c0c0; text-shadow: 0 0 8px #c0c0c0; }
    .lider-item.silver .lider-nombre { color: #d8d8d8; }
    .lider-item.silver .lider-pts { color: #c0c0c0; }
    .lider-item.silver .lider-escudo { filter: drop-shadow(0 0 10px rgba(192,192,192,0.6)); }

    /* Bronce */
    .lider-item.bronze .lider-pedestal {
      background: linear-gradient(160deg, #1a0f00 0%, #110a00 100%);
      border: 1px solid #cd7f32;
      box-shadow: 0 0 15px rgba(205,127,50,0.4), 0 0 30px rgba(205,127,50,0.15);
      height: 75px;
    }
    .lider-item.bronze .lider-pedestal::before { background: linear-gradient(90deg, #cd7f32, #e8a45a, #cd7f32); }
    .lider-item.bronze .lider-laurel svg path { fill: #cd7f32; }
    .lider-item.bronze .lider-numero { color: #cd7f32; text-shadow: 0 0 8px #cd7f32; }
    .lider-item.bronze .lider-nombre { color: #e8a45a; }
    .lider-item.bronze .lider-pts { color: #cd7f32; }
    .lider-item.bronze .lider-escudo { filter: drop-shadow(0 0 10px rgba(205,127,50,0.6)); }

    .lider-numero {
      font-size: 22px;
      font-weight: 900;
      line-height: 1;
      margin-bottom: 4px;
    }

    .lider-nombre {
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      line-height: 1.2;
      margin-bottom: 4px;
      max-width: 130px;
    }

    .lider-pts {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 1px;
    }

    .lider-dg {
      font-size: 10px;
      color: #aaa;
      margin-top: 2px;
    }

    /* Laurel size por posición */
    .lider-item.gold .lider-laurel { width: 170px; height: 170px; }
    .lider-item.silver .lider-laurel { width: 150px; height: 150px; }
    .lider-item.bronze .lider-laurel { width: 135px; height: 135px; }
    .lider-item.gold .lider-escudo { width: 85px; height: 85px; }
    .lider-item.silver .lider-escudo { width: 72px; height: 72px; }
    .lider-item.bronze .lider-escudo { width: 62px; height: 62px; }

    /* Responsive móvil */
    @media(max-width: 500px) {
      .lideres-podio { gap: 4px; }
      .lider-item.gold .lider-laurel { width: 120px; height: 120px; }
      .lider-item.silver .lider-laurel { width: 105px; height: 105px; }
      .lider-item.bronze .lider-laurel { width: 92px; height: 92px; }
      .lider-pedestal { width: 100px; }
      .lider-item.gold .lider-pedestal { height: 85px; }
      .lider-item.silver .lider-pedestal { height: 70px; }
      .lider-item.bronze .lider-pedestal { height: 58px; }
      .lider-item.gold .lider-escudo { width: 58px; height: 58px; }
      .lider-item.silver .lider-escudo { width: 50px; height: 50px; }
      .lider-item.bronze .lider-escudo { width: 44px; height: 44px; }
      .lider-numero { font-size: 17px; }
      .lider-nombre { font-size: 9px; }
      .lider-pts { font-size: 11px; }
    }
  `;
  document.head.appendChild(style);
})();

// SVG de laureles dorados
function laurelSVG() {
  return `
  <svg class="laurel-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Rama izquierda -->
    <g transform="translate(100,105) rotate(-10)">
      <path d="M0,0 Q-15,-20 -30,-15 Q-15,-10 0,0Z" opacity="0.9"/>
      <path d="M-5,-8 Q-25,-35 -42,-32 Q-25,-20 -5,-8Z" opacity="0.9"/>
      <path d="M-10,-18 Q-32,-50 -50,-50 Q-32,-32 -10,-18Z" opacity="0.85"/>
      <path d="M-15,-30 Q-38,-65 -56,-68 Q-38,-46 -15,-30Z" opacity="0.85"/>
      <path d="M-18,-43 Q-40,-78 -58,-84 Q-40,-60 -18,-43Z" opacity="0.8"/>
      <path d="M-20,-56 Q-38,-88 -55,-97 Q-38,-72 -20,-56Z" opacity="0.8"/>
      <path d="M-18,-68 Q-33,-96 -48,-108 Q-33,-83 -18,-68Z" opacity="0.75"/>
      <path d="M-14,-79 Q-24,-104 -36,-118 Q-24,-93 -14,-79Z" opacity="0.7"/>
      <!-- Tallo -->
      <path d="M0,0 Q-20,-40 -30,-85 Q-25,-40 0,0Z" opacity="0.4"/>
    </g>
    <!-- Rama derecha (espejo) -->
    <g transform="translate(100,105) rotate(10) scale(-1,1)">
      <path d="M0,0 Q-15,-20 -30,-15 Q-15,-10 0,0Z" opacity="0.9"/>
      <path d="M-5,-8 Q-25,-35 -42,-32 Q-25,-20 -5,-8Z" opacity="0.9"/>
      <path d="M-10,-18 Q-32,-50 -50,-50 Q-32,-32 -10,-18Z" opacity="0.85"/>
      <path d="M-15,-30 Q-38,-65 -56,-68 Q-38,-46 -15,-30Z" opacity="0.85"/>
      <path d="M-18,-43 Q-40,-78 -58,-84 Q-40,-60 -18,-43Z" opacity="0.8"/>
      <path d="M-20,-56 Q-38,-88 -55,-97 Q-38,-72 -20,-56Z" opacity="0.8"/>
      <path d="M-18,-68 Q-33,-96 -48,-108 Q-33,-83 -18,-68Z" opacity="0.75"/>
      <path d="M-14,-79 Q-24,-104 -36,-118 Q-24,-93 -14,-79Z" opacity="0.7"/>
      <path d="M0,0 Q-20,-40 -30,-85 Q-25,-40 0,0Z" opacity="0.4"/>
    </g>
  </svg>`;
}

function crearLider(equipo, tipo) {
  const numeros = { gold: "1", silver: "2", bronze: "3" };
  const logo = logosLideres[equipo.equipo] || "";

  const div = document.createElement("div");
  div.className = `lider-item ${tipo}`;

  div.innerHTML = `
    <div class="lider-laurel">
      ${laurelSVG()}
      <div class="lider-escudo-wrap">
        <img class="lider-escudo" src="${logo}" alt="${equipo.equipo}">
      </div>
    </div>
    <div class="lider-pedestal">
      <div class="lider-numero">${numeros[tipo]}</div>
      <div class="lider-nombre">${equipo.equipo}</div>
      <div class="lider-pts">⚽ ${equipo.pts} PTS</div>
      <div class="lider-dg">DG: ${equipo.dg}</div>
    </div>
  `;
  return div;
}

async function cargarLideres() {
  const contenedor = document.getElementById("tabla-general");
  if (!contenedor) return;
  contenedor.innerHTML = `<div style="text-align:center;color:#ffd700;padding:20px;">Cargando líderes...</div>`;

  try {
    const res = await fetch(URL_ESTADISTICAS_LID);
    const texto = await res.text();
    const filas = texto.trim().split("\n");
    const equipos = [];

    for (let i = 1; i < filas.length; i++) {
      const c = filas[i].split(",");
      const nombre = (c[1] || "").trim().replace(/\r/g, "");
      if (nombre === "Descansa" || !nombre) continue;
      equipos.push({
        ranking: Number(c[10]) || 999,
        equipo: nombre,
        pts: Number(c[9]) || 0,
        dg: Number(c[8]) || 0
      });
    }

    equipos.sort((a, b) => a.ranking - b.ranking);
    const top3 = equipos.slice(0, 3);

    if (top3.length === 0) {
      contenedor.innerHTML = `<div style="text-align:center;color:#aaa;padding:20px;">Sin datos aún</div>`;
      return;
    }

    const podio = document.createElement("div");
    podio.className = "lideres-podio";

    // Orden visual: 2do - 1ro - 3ro (como podio olímpico)
    const orden = [
      { data: top3[1], tipo: "silver" },
      { data: top3[0], tipo: "gold"   },
      { data: top3[2], tipo: "bronze" }
    ].filter(x => x.data);

    orden.forEach(({ data, tipo }) => {
      podio.appendChild(crearLider(data, tipo));
    });

    contenedor.innerHTML = "";
    contenedor.appendChild(podio);

  } catch (err) {
    console.error("Error cargando líderes:", err);
    contenedor.innerHTML = `<div style="text-align:center;color:#ff4444;padding:20px;">Error cargando líderes</div>`;
  }
}

cargarLideres();
