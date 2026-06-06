// ==================== TOP GOLEADORES ====================

const URL_JUGADORES =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1940220650&single=true&output=csv";

const URL_EVENTOS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=645868286&single=true&output=csv";

const URL_PARTICIPACIONES =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=626975401&single=true&output=csv";

const logosEquipos = {
  1: "https://i.imgur.com/gBvmM4v.png",
  2: "https://i.imgur.com/fGQAhE5.png",
  3: "https://i.imgur.com/Qrx4JSj.png",
  4: "https://i.imgur.com/8BWFWBW.png",
  5: "https://i.imgur.com/5TAVBS7.png",
  6: "https://i.imgur.com/KTMLCv9.png",
  7: "https://i.imgur.com/hqOAa7J.png",
  8: "https://i.imgur.com/5TARJkD.png",
  9: "https://i.imgur.com/ddKmNL6.png"
};

function parseCSV(texto) {
  const filas = texto.trim().split("\n");
  const headers = filas[0].split(",").map(h => h.trim().replace(/\r/g, ""));
  return filas.slice(1).map(fila => {
    const cols = fila.split(",").map(c => c.trim().replace(/\r/g, ""));
    const obj = {};
    headers.forEach((h, i) => obj[h] = cols[i] || "");
    return obj;
  });
}

function abreviarPosicion(pos) {
  const mapa = { "Portero":"POR","Defensa":"DEF","Medio":"MED","Delantero":"DEL","":"JUG" };
  return mapa[pos] || pos.substring(0,3).toUpperCase();
}

function siluetaSVG(tipo) {
  // Colores de silueta según tipo de carta
  const colores = {
    gold:   { body: "rgba(120,70,0,0.6)",   glow: "#ffd700" },
    silver: { body: "rgba(80,80,80,0.6)",    glow: "#c0c0c0" },
    blue:   { body: "rgba(255,255,255,0.35)", glow: "#29b6f6" }
  };
  const c = colores[tipo] || colores.gold;
  return `
    <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 0 6px ${c.glow});">
      <ellipse cx="50" cy="26" rx="15" ry="17" fill="${c.body}"/>
      <rect x="43" y="41" width="14" height="9" fill="${c.body}"/>
      <path d="M18 130 Q24 78 50 72 Q76 78 82 130Z" fill="${c.body}"/>
      <path d="M18 80 Q28 65 44 72 Q50 75 50 80 Q34 83 22 90Z" fill="${c.body}"/>
      <path d="M82 80 Q72 65 56 72 Q50 75 50 80 Q66 83 78 90Z" fill="${c.body}"/>
      <path d="M25 87 Q50 80 75 87 Q73 94 50 90 Q27 94 25 87Z" fill="${c.body}"/>
    </svg>`;
}

// Inyectar estilos una sola vez
(function() {
  if (document.getElementById("goleadores-style")) return;
  const style = document.createElement("style");
  style.id = "goleadores-style";
  style.textContent = `
    .goleadores-wrap {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      padding: 10px 0;
    }

    /* Contenedor de cada carta con brillo exterior igual que la página */
    .gol-card-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .gol-rank-label {
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    /* La carta FIFA dentro del contenedor estilo página */
    .gol-outer {
      background: rgba(0,0,0,0.75);
      border-radius: 20px;
      padding: 14px;
      box-shadow: 0 0 10px #39ff14, 0 0 20px rgba(57,255,20,0.4);
      border: 1px solid #39ff14;
      transition: 0.3s;
    }

    .gol-outer:hover {
      transform: translateY(-6px);
      box-shadow: 0 0 18px #39ff14, 0 0 35px rgba(57,255,20,0.6);
    }

    /* La carta FIFA interior */
    .fifa-carta {
      width: 150px;
      height: 230px;
      border-radius: 16px 16px 10px 10px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
    }

    .fifa-carta.gold {
      background: linear-gradient(160deg, #ffe566 0%, #f5a500 35%, #b8720a 65%, #f5d020 100%);
      border: 2px solid #ffd700;
      box-shadow: 0 0 20px #ffd700, inset 0 1px 0 rgba(255,255,255,0.4);
    }

    .fifa-carta.silver {
      background: linear-gradient(160deg, #f0f0f0 0%, #c0c0c0 35%, #808080 65%, #d8d8d8 100%);
      border: 2px solid #c0c0c0;
      box-shadow: 0 0 18px #bbb, inset 0 1px 0 rgba(255,255,255,0.5);
    }

    .fifa-carta.blue {
      background: linear-gradient(160deg, #64d0ff 0%, #0288d1 35%, #01579b 65%, #29b6f6 100%);
      border: 2px solid #29b6f6;
      box-shadow: 0 0 18px #29b6f6, inset 0 1px 0 rgba(255,255,255,0.3);
    }

    .fifa-shimmer {
      position: absolute;
      top:0;left:0;right:0;bottom:0;
      background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(255,255,255,0.1) 100%);
      pointer-events: none;
      border-radius: inherit;
    }

    .fifa-top {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 10px 0 10px;
      box-sizing: border-box;
      position: relative;
      z-index: 1;
    }

    .fifa-pos { font-size: 10px; font-weight: 900; letter-spacing: 1px; opacity: 0.85; }
    .fifa-num { font-size: 22px; font-weight: 900; line-height: 1; }
    .fifa-escudo { width: 32px; height: 32px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }

    .fifa-silueta {
      width: 95px;
      height: 105px;
      position: relative;
      z-index: 1;
      margin-top: -4px;
    }

    .fifa-nombre {
      font-size: 10px;
      font-weight: 900;
      text-align: center;
      padding: 3px 8px 0;
      line-height: 1.2;
      position: relative;
      z-index: 1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      max-width: 144px;
      word-break: break-word;
    }

    .fifa-sep {
      width: 78%;
      height: 1px;
      opacity: 0.3;
      margin: 5px 0;
    }

    .fifa-stats {
      display: flex;
      gap: 18px;
      position: relative;
      z-index: 1;
      margin-bottom: 8px;
    }

    .fifa-stat { text-align: center; }
    .fifa-stat-val { font-size: 18px; font-weight: 900; line-height: 1; }
    .fifa-stat-lbl { font-size: 8px; opacity: 0.8; letter-spacing: 0.5px; }

    /* Colores de texto por tipo */
    .fifa-carta.gold .fifa-pos,
    .fifa-carta.gold .fifa-num,
    .fifa-carta.gold .fifa-nombre,
    .fifa-carta.gold .fifa-sep,
    .fifa-carta.gold .fifa-stat-val,
    .fifa-carta.gold .fifa-stat-lbl { color: #3d2200; }
    .fifa-carta.gold .fifa-sep { background: #3d2200; }

    .fifa-carta.silver .fifa-pos,
    .fifa-carta.silver .fifa-num,
    .fifa-carta.silver .fifa-nombre,
    .fifa-carta.silver .fifa-stat-val,
    .fifa-carta.silver .fifa-stat-lbl { color: #1a1a1a; }
    .fifa-carta.silver .fifa-sep { background: #1a1a1a; }

    .fifa-carta.blue .fifa-pos,
    .fifa-carta.blue .fifa-num,
    .fifa-carta.blue .fifa-nombre,
    .fifa-carta.blue .fifa-stat-val,
    .fifa-carta.blue .fifa-stat-lbl { color: #fff; }
    .fifa-carta.blue .fifa-sep { background: #fff; }

    /* Labels ranking */
    .gold-label  { color: #ffd700; text-shadow: 0 0 8px #ffd700; }
    .silver-label{ color: #c0c0c0; text-shadow: 0 0 8px #c0c0c0; }
    .blue-label  { color: #29b6f6; text-shadow: 0 0 8px #29b6f6; }

    /* Responsive móvil */
    @media(max-width: 600px) {
      .goleadores-wrap {
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }
      .gol-card-wrap {
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .gol-rank-label { font-size: 11px; }
      .fifa-carta { width: 115px; height: 185px; }
      .fifa-num { font-size: 17px; }
      .fifa-escudo { width: 26px; height: 26px; }
      .fifa-silueta { width: 75px; height: 85px; }
      .fifa-nombre { font-size: 8px; }
      .fifa-stat-val { font-size: 14px; }
      .fifa-stat-lbl { font-size: 7px; }
    }
  `;
  document.head.appendChild(style);
})();

function crearCarta(jugador, tipo) {
  const tipos = { gold: "gold", silver: "silver", blue: "blue" };
  const labels = { gold: "🥇 1er Lugar", silver: "🥈 2do Lugar", blue: "🥉 3er Lugar" };
  const labelClass = { gold: "gold-label", silver: "silver-label", blue: "blue-label" };

  const pos = abreviarPosicion(jugador.posicion);
  const logo = logosEquipos[jugador.equipoID] || "";
  const pct = jugador.partidos > 0 ? Math.round((jugador.asistencias / jugador.partidos) * 100) : 0;

  const wrap = document.createElement("div");
  wrap.className = "gol-card-wrap";

  wrap.innerHTML = `
    <div class="gol-rank-label ${labelClass[tipo]}">${labels[tipo]}</div>
    <div class="gol-outer">
      <div class="fifa-carta ${tipo}">
        <div class="fifa-shimmer"></div>
        <div class="fifa-top">
          <div>
            <div class="fifa-pos">${pos}</div>
            <div class="fifa-num">${jugador.numero || "—"}</div>
          </div>
          <img class="fifa-escudo" src="${logo}" alt="">
        </div>
        <div class="fifa-silueta">${siluetaSVG(tipo)}</div>
        <div class="fifa-nombre">${jugador.nombre}</div>
        <div class="fifa-sep"></div>
        <div class="fifa-stats">
          <div class="fifa-stat">
            <div class="fifa-stat-val">${jugador.goles}</div>
            <div class="fifa-stat-lbl">GOLES</div>
          </div>
          <div class="fifa-stat">
            <div class="fifa-stat-val">${pct}%</div>
            <div class="fifa-stat-lbl">ASIST</div>
          </div>
        </div>
      </div>
    </div>
  `;
  return wrap;
}

async function cargarTopGoleadores() {
  const contenedor = document.getElementById("top-goleadores");
  if (!contenedor) return;
  contenedor.innerHTML = `<div style="text-align:center;color:#39ff14;padding:20px;">Cargando goleadores...</div>`;

  try {
    const [resJ, resE, resP] = await Promise.all([
      fetch(URL_JUGADORES),
      fetch(URL_EVENTOS),
      fetch(URL_PARTICIPACIONES)
    ]);
    const [txtJ, txtE, txtP] = await Promise.all([resJ.text(), resE.text(), resP.text()]);

    const jugadores     = parseCSV(txtJ);
    const eventos       = parseCSV(txtE);
    const participaciones = parseCSV(txtP);

    // Contar goles
    const golesMap = {};
    eventos.forEach(e => {
      if (e.Tipo_Evento === "Gol") golesMap[e.Jugador] = (golesMap[e.Jugador] || 0) + 1;
    });

    // Contar partidos jugados
    const partidosMap = {};
    participaciones.forEach(p => {
      if (p.Asistio === "TRUE") partidosMap[p.Jugador] = (partidosMap[p.Jugador] || 0) + 1;
    });

    const top3 = jugadores
      .filter(j => golesMap[j.ID_Jugador] > 0)
      .map(j => ({
        nombre:    j.Nombre,
        equipoID:  Number(j.Equipo),
        numero:    j.Numero,
        posicion:  j.Posicion || "",
        goles:     golesMap[j.ID_Jugador] || 0,
        asistencias: partidosMap[j.ID_Jugador] || 0,
        partidos:  partidosMap[j.ID_Jugador] || 0
      }))
      .sort((a, b) => b.goles - a.goles)
      .slice(0, 3);

    if (top3.length === 0) {
      contenedor.innerHTML = `<div style="text-align:center;color:#aaa;padding:20px;">Sin goleadores aún</div>`;
      return;
    }

    const tipos = ["gold", "silver", "blue"];
    const grid = document.createElement("div");
    grid.className = "goleadores-wrap";

    top3.forEach((j, i) => grid.appendChild(crearCarta(j, tipos[i])));

    contenedor.innerHTML = "";
    contenedor.appendChild(grid);

  } catch (err) {
    console.error("Error cargando goleadores:", err);
    contenedor.innerHTML = `<div style="text-align:center;color:#ff4444;padding:20px;">Error cargando goleadores</div>`;
  }
}

cargarTopGoleadores();
