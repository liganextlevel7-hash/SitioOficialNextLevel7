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
  const mapa = {
    "Portero": "POR",
    "Defensa": "DEF",
    "Medio": "MED",
    "Delantero": "DEL",
    "": "JUG"
  };
  return mapa[pos] || pos.substring(0, 3).toUpperCase();
}

function siluetaSVG(colorKey) {
  const fills = {
    gold: "rgba(120,70,0,0.55)",
    silver: "rgba(80,80,80,0.55)",
    blue: "rgba(255,255,255,0.35)",
    dark: "rgba(255,255,255,0.25)"
  };
  const fill = fills[colorKey] || fills.dark;
  return `
    <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
      <!-- Cabeza -->
      <ellipse cx="50" cy="28" rx="16" ry="18" fill="${fill}"/>
      <!-- Cuello -->
      <rect x="44" y="44" width="12" height="10" fill="${fill}"/>
      <!-- Cuerpo -->
      <path d="M20 120 Q25 75 50 70 Q75 75 80 120Z" fill="${fill}"/>
      <!-- Brazo izquierdo cruzado -->
      <path d="M20 75 Q30 68 45 72 Q50 74 50 78 Q35 80 25 85Z" fill="${fill}"/>
      <!-- Brazo derecho cruzado -->
      <path d="M80 75 Q70 68 55 72 Q50 74 50 78 Q65 80 75 85Z" fill="${fill}"/>
      <!-- Antebrazos cruzados -->
      <path d="M28 82 Q50 76 72 82 Q70 88 50 84 Q30 88 28 82Z" fill="${fill}"/>
    </svg>
  `;
}

function estilosCarta(rank) {
  if (rank === 1) return {
    bg: "linear-gradient(160deg, #ffe066 0%, #f5a500 35%, #b8720a 65%, #f5d020 100%)",
    border: "2px solid #ffd700",
    shadow: "0 0 30px #ffd700, 0 0 60px rgba(255,215,0,0.5)",
    textColor: "#3d2200",
    silhouetteColor: "gold",
    shimmer: "rgba(255,255,255,0.18)",
    label: "ORO",
    rankBg: "rgba(61,34,0,0.25)"
  };
  if (rank === 2) return {
    bg: "linear-gradient(160deg, #f0f0f0 0%, #c0c0c0 35%, #808080 65%, #d8d8d8 100%)",
    border: "2px solid #c0c0c0",
    shadow: "0 0 25px #bbb, 0 0 50px rgba(192,192,192,0.4)",
    textColor: "#1a1a1a",
    silhouetteColor: "silver",
    shimmer: "rgba(255,255,255,0.22)",
    label: "PLATA",
    rankBg: "rgba(0,0,0,0.12)"
  };
  if (rank === 3) return {
    bg: "linear-gradient(160deg, #64d0ff 0%, #0288d1 35%, #01579b 65%, #29b6f6 100%)",
    border: "2px solid #29b6f6",
    shadow: "0 0 25px #29b6f6, 0 0 50px rgba(41,182,246,0.4)",
    textColor: "#fff",
    silhouetteColor: "blue",
    shimmer: "rgba(255,255,255,0.15)",
    label: "BRONCE",
    rankBg: "rgba(255,255,255,0.15)"
  };
  return {
    bg: "linear-gradient(160deg, #2a2a2a 0%, #181818 50%, #0d0d0d 100%)",
    border: "1px solid #39ff14",
    shadow: "0 0 12px rgba(57,255,20,0.35)",
    textColor: "#fff",
    silhouetteColor: "dark",
    shimmer: "rgba(57,255,20,0.06)",
    label: "",
    rankBg: "rgba(57,255,20,0.15)"
  };
}

// Inyectar estilos responsive una sola vez
(function inyectarEstilos() {
  if (document.getElementById("goleadores-style")) return;
  const style = document.createElement("style");
  style.id = "goleadores-style";
  style.textContent = `
    #top-goleadores {
      width: 100%;
    }
    .goleadores-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      justify-content: center;
      padding: 10px 0;
    }
    .fifa-card {
      width: 150px;
      min-height: 230px;
      border-radius: 18px 18px 10px 10px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
      flex-shrink: 0;
    }
    .fifa-card:hover {
      transform: translateY(-8px) scale(1.05);
    }
    .fifa-card .shimmer {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      border-radius: inherit;
    }
    .fifa-card .card-top {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 10px 0 10px;
      box-sizing: border-box;
      position: relative;
      z-index: 1;
    }
    .fifa-card .card-pos {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 1px;
      opacity: 0.9;
    }
    .fifa-card .card-num {
      font-size: 20px;
      font-weight: 900;
      line-height: 1;
    }
    .fifa-card .card-escudo {
      width: 30px;
      height: 30px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
    }
    .fifa-card .card-silueta {
      width: 90px;
      height: 100px;
      position: relative;
      z-index: 1;
      margin-top: -4px;
    }
    .fifa-card .card-nombre {
      font-size: 10px;
      font-weight: 900;
      text-align: center;
      padding: 4px 8px 0;
      line-height: 1.2;
      position: relative;
      z-index: 1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      max-width: 140px;
      word-break: break-word;
    }
    .fifa-card .card-sep {
      width: 80%;
      height: 1px;
      opacity: 0.3;
      margin: 5px 0;
    }
    .fifa-card .card-stats {
      display: flex;
      gap: 14px;
      position: relative;
      z-index: 1;
      margin-bottom: 10px;
    }
    .fifa-card .stat-item {
      text-align: center;
    }
    .fifa-card .stat-val {
      font-size: 17px;
      font-weight: 900;
      line-height: 1;
    }
    .fifa-card .stat-lbl {
      font-size: 8px;
      opacity: 0.8;
      letter-spacing: 0.5px;
    }
    .fifa-card .card-badge {
      position: absolute;
      bottom: 7px;
      right: 8px;
      font-size: 7px;
      font-weight: 900;
      opacity: 0.6;
      letter-spacing: 1px;
    }

    /* === RESPONSIVE === */
    @media (max-width: 480px) {
      .goleadores-grid {
        gap: 10px;
      }
      .fifa-card {
        width: 120px;
        min-height: 190px;
      }
      .fifa-card .card-num { font-size: 16px; }
      .fifa-card .card-pos { font-size: 9px; }
      .fifa-card .card-escudo { width: 24px; height: 24px; }
      .fifa-card .card-silueta { width: 72px; height: 82px; }
      .fifa-card .card-nombre { font-size: 8px; }
      .fifa-card .stat-val { font-size: 14px; }
      .fifa-card .stat-lbl { font-size: 7px; }
    }

    @media (min-width: 481px) and (max-width: 768px) {
      .fifa-card {
        width: 135px;
        min-height: 210px;
      }
    }
  `;
  document.head.appendChild(style);
})();

function crearCartaGoleador(jugador, rank) {
  const s = estilosCarta(rank);
  const logoEquipo = logosEquipos[jugador.equipoID] || "";
  const pos = abreviarPosicion(jugador.posicion);
  const pct = jugador.partidos > 0
    ? Math.round((jugador.asistencias / jugador.partidos) * 100)
    : 0;

  const div = document.createElement("div");
  div.className = "fifa-card";
  div.style.cssText = `background:${s.bg};border:${s.border};box-shadow:${s.shadow};`;

  div.innerHTML = `
    <div class="shimmer" style="background:linear-gradient(135deg,${s.shimmer} 0%,transparent 50%,${s.shimmer} 100%);"></div>

    <div class="card-top">
      <div>
        <div class="card-pos" style="color:${s.textColor};">${pos}</div>
        <div class="card-num" style="color:${s.textColor};">${jugador.numero || "—"}</div>
      </div>
      <img class="card-escudo" src="${logoEquipo}" alt="">
    </div>

    <div class="card-silueta">${siluetaSVG(s.silhouetteColor)}</div>

    <div class="card-nombre" style="color:${s.textColor};">${jugador.nombre}</div>

    <div class="card-sep" style="background:${s.textColor};"></div>

    <div class="card-stats">
      <div class="stat-item">
        <div class="stat-val" style="color:${s.textColor};">${jugador.goles}</div>
        <div class="stat-lbl" style="color:${s.textColor};">GOLES</div>
      </div>
      <div class="stat-item">
        <div class="stat-val" style="color:${s.textColor};">${pct}%</div>
        <div class="stat-lbl" style="color:${s.textColor};">ASIST</div>
      </div>
    </div>

    ${rank <= 3 ? `<div class="card-badge" style="color:${s.textColor};">${s.label}</div>` : ""}
  `;

  return div;
}

async function cargarTopGoleadores() {
  const contenedor = document.getElementById("top-goleadores");
  if (!contenedor) return;
  contenedor.innerHTML = `<div style="text-align:center;color:#39ff14;padding:20px;">Cargando goleadores...</div>`;

  try {
    const [resJugadores, resEventos, resParticipaciones] = await Promise.all([
      fetch(URL_JUGADORES),
      fetch(URL_EVENTOS),
      fetch(URL_PARTICIPACIONES)
    ]);

    const [txtJugadores, txtEventos, txtParticipaciones] = await Promise.all([
      resJugadores.text(),
      resEventos.text(),
      resParticipaciones.text()
    ]);

    const jugadores = parseCSV(txtJugadores);
    const eventos = parseCSV(txtEventos);
    const participaciones = parseCSV(txtParticipaciones);

    // Contar goles
    const golesMap = {};
    eventos.forEach(e => {
      if (e.Tipo_Evento === "Gol") {
        golesMap[e.Jugador] = (golesMap[e.Jugador] || 0) + 1;
      }
    });

    // Contar partidos jugados
    const partidosMap = {};
    participaciones.forEach(p => {
      if (p.Asistio === "TRUE") {
        partidosMap[p.Jugador] = (partidosMap[p.Jugador] || 0) + 1;
      }
    });

    const goleadores = jugadores
      .filter(j => golesMap[j.ID_Jugador] > 0)
      .map(j => ({
        nombre: j.Nombre,
        equipoID: Number(j.Equipo),
        numero: j.Numero,
        posicion: j.Posicion || "",
        goles: golesMap[j.ID_Jugador] || 0,
        asistencias: partidosMap[j.ID_Jugador] || 0,
        partidos: partidosMap[j.ID_Jugador] || 0
      }))
      .sort((a, b) => b.goles - a.goles)
      .slice(0, 8);

    if (goleadores.length === 0) {
      contenedor.innerHTML = `<div style="text-align:center;color:#aaa;padding:20px;">Sin goleadores aún</div>`;
      return;
    }

    const grid = document.createElement("div");
    grid.className = "goleadores-grid";

    goleadores.forEach((j, i) => {
      grid.appendChild(crearCartaGoleador(j, i + 1));
    });

    contenedor.innerHTML = "";
    contenedor.appendChild(grid);

  } catch (err) {
    console.error("Error cargando goleadores:", err);
    contenedor.innerHTML = `<div style="text-align:center;color:#ff4444;padding:20px;">Error cargando goleadores</div>`;
  }
}

cargarTopGoleadores();
