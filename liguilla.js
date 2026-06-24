// ==================== liguilla.js ====================

const URL_LIGUILLA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1783955716&single=true&output=csv";

async function cargarLiguilla() {
    const respuesta = await fetch(URL_LIGUILLA);
    const texto = await respuesta.text();
    const filas = texto.trim().split("\n");
    const partidos = [];
    for (let i = 1; i < filas.length; i++) {
        const c = filas[i].split(",");
        partidos.push({
            id: c[0], ronda: c[1], idLocal: c[2], equipoLocal: c[3],
            golesLocal: c[4], idVisita: c[5], equipoVisita: c[6],
            golesVisita: c[7], ganador: c[8], urlLocal: c[9],
            urlVisita: c[10], rankingLocal: c[11], rankingVisita: c[12],
            estado: c[13], fecha: c[14]
        });
    }
    const selector = document.getElementById("selector-ronda");
    selector.innerHTML = `
        <option value="Completa">Liguilla Completa</option>
        <option value="Cuartos">Cuartos</option>
        <option value="Semifinal">Semifinales</option>
        <option value="Final">Final</option>
    `;
    selector.addEventListener("change", () => renderBracket(partidos, selector.value));
    renderBracket(partidos, "Completa");
}

const coloresCuartos = [
    { border:"#ffd700", glow:"rgba(255,215,0,0.7)"   },
    { border:"#c0c0c0", glow:"rgba(192,192,192,0.7)" },
    { border:"#b87333", glow:"rgba(184,115,51,0.7)"  },
    { border:"#39ff14", glow:"rgba(57,255,20,0.7)"   },
];
const colorSemi  = { border:"rgba(255,255,255,0.5)", glow:"rgba(255,255,255,0.2)" };
const colorFinal = { border:"#ff9800", glow:"rgba(255,152,0,0.6)" };

function esPD(val) {
    if (!val) return true;
    return val.trim().toLowerCase().replace(/p+or/,"por") === "por definir";
}

function crearEquipo(nombre, url, color) {
    const nom = esPD(nombre) ? "Por Definir" : nombre.trim();
    const logo = (url && url.trim().startsWith("http"))
        ? `<img src="${url.trim()}" style="width:52px;height:52px;object-fit:contain;border-radius:50%;flex-shrink:0;filter:drop-shadow(0 0 6px ${color.border});" onerror="this.style.display='none'">`
        : `<div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">⚽</div>`;
    return `<div style="display:flex;align-items:center;gap:10px;margin:5px 0;">
        ${logo}
        <div style="border:2px solid ${color.border};border-radius:25px;padding:7px 16px;
            box-shadow:0 0 10px ${color.glow};background:transparent;flex:1;min-width:0;">
            <span style="color:#fff;font-weight:800;font-size:13px;letter-spacing:0.5px;
                text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;">
                ${nom}</span>
        </div>
    </div>`;
}

function crearVS(p) {
    const esJ = (p.estado||"").trim().toLowerCase() === "jugado";
    const marcador = esJ ? `${(p.golesLocal||0).trim()} - ${(p.golesVisita||0).trim()}` : "VS";
    return `<div style="text-align:center;padding:4px 0 4px 62px;font-weight:900;font-size:14px;
        color:${esJ ? '#ffd700' : 'rgba(255,255,255,0.25)'};">${marcador}</div>`;
}

function crearCard(p, color, subtitulo) {
    const card = document.createElement("div");
    card.style.cssText = `background:rgba(0,0,0,0.3);border:2px solid ${color.border};
        border-radius:14px;padding:12px 14px;box-shadow:0 0 16px ${color.glow};`;
    if (subtitulo) {
        const s = document.createElement("div");
        s.style.cssText = "color:rgba(255,255,255,0.4);font-size:9px;letter-spacing:2px;text-align:center;margin-bottom:6px;font-weight:700;font-style:italic;";
        s.textContent = subtitulo;
        card.appendChild(s);
    }
    card.innerHTML += crearEquipo(p.equipoLocal, p.urlLocal, color);
    card.innerHTML += crearVS(p);
    card.innerHTML += crearEquipo(p.equipoVisita, p.urlVisita, color);
    return card;
}

function crearCopa(ganador) {
    const hay = !esPD(ganador);
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;">
        <div style="font-size:clamp(60px,9vw,100px);line-height:1;filter:drop-shadow(0 0 18px rgba(255,215,0,0.8));">🏆</div>
        <div style="color:${hay ? '#ffd700' : 'rgba(255,255,255,0.35)'};font-weight:900;
            font-size:${hay ? 'clamp(14px,2.5vw,18px)' : '12px'};letter-spacing:2px;
            text-transform:uppercase;text-shadow:0 0 10px rgba(255,215,0,0.5);">
            ${hay ? ganador.trim() : 'Por Definir'}</div>
        <div style="color:#fff;font-weight:900;font-size:clamp(18px,3vw,26px);letter-spacing:3px;">CAMPEÓN</div>
    </div>`;
}

function renderBracket(partidos, vista) {
    const contenedor = document.getElementById("contenedor-bracket");
    contenedor.innerHTML = "";

    const cuartos = partidos.filter(p => p.ronda.toLowerCase().trim() === "cuartos");
    const semi    = partidos.filter(p => p.ronda.toLowerCase().trim() === "semifinal");
    const finalP  = partidos.filter(p => p.ronda.toLowerCase().trim() === "final");

    // Opacidad por sección según vista
    // Completa: todo normal
    // Cuartos:  todo normal
    // Semifinal: cuartos desvanecidos, semis+final normales
    // Final:    cuartos+semis desvanecidos, final normal
    const opQ = (vista === "Semifinal" || vista === "Final") ? "0.18" : "1";
    const opS = (vista === "Final") ? "0.18" : "1";
    const opF = "1";

    const scroll = document.createElement("div");
    scroll.style.cssText = "overflow-x:auto;padding:10px 0 20px;";

    const row = document.createElement("div");
    row.style.cssText = "display:flex;flex-direction:row;align-items:stretch;gap:0;min-width:760px;";

    // ======== CUARTOS ========
    const colQ = document.createElement("div");
    colQ.style.cssText = `display:flex;flex-direction:column;gap:10px;min-width:255px;padding:10px;opacity:${opQ};transition:opacity 0.4s;`;
    const titQ = document.createElement("div");
    titQ.style.cssText = "color:#ffd700;font-weight:900;font-size:11px;letter-spacing:3px;text-align:center;margin-bottom:6px;";
    titQ.textContent = "CUARTOS DE FINAL";
    colQ.appendChild(titQ);
    cuartos.forEach((p, i) => colQ.appendChild(crearCard(p, coloresCuartos[i%4])));
    row.appendChild(colQ);

    // Conector Q→S
    const connQS = document.createElement("div");
    connQS.style.cssText = `display:flex;flex-direction:column;align-self:stretch;min-width:28px;padding-top:34px;opacity:${opQ};transition:opacity 0.4s;`;
    connQS.innerHTML = `
        <div style="flex:1;display:flex;flex-direction:column;">
            <div style="flex:1;border-right:2px solid rgba(255,255,255,0.2);border-top:2px solid rgba(255,255,255,0.2);border-radius:0 6px 0 0;"></div>
            <div style="height:2px;background:rgba(255,255,255,0.2);width:100%;"></div>
            <div style="flex:1;border-right:2px solid rgba(255,255,255,0.2);border-bottom:2px solid rgba(255,255,255,0.2);border-radius:0 0 6px 0;"></div>
        </div>
        <div style="height:10px;"></div>
        <div style="flex:1;display:flex;flex-direction:column;">
            <div style="flex:1;border-right:2px solid rgba(255,255,255,0.2);border-top:2px solid rgba(255,255,255,0.2);border-radius:0 6px 0 0;"></div>
            <div style="height:2px;background:rgba(255,255,255,0.2);width:100%;"></div>
            <div style="flex:1;border-right:2px solid rgba(255,255,255,0.2);border-bottom:2px solid rgba(255,255,255,0.2);border-radius:0 0 6px 0;"></div>
        </div>
    `;
    row.appendChild(connQS);

    // ======== SEMIS ========
    const colS = document.createElement("div");
    colS.style.cssText = `display:flex;flex-direction:column;justify-content:space-around;gap:10px;min-width:235px;padding:10px;align-self:stretch;opacity:${opS};transition:opacity 0.4s;`;
    const titS = document.createElement("div");
    titS.style.cssText = "color:#ffd700;font-weight:900;font-size:11px;letter-spacing:3px;text-align:center;margin-bottom:6px;font-style:italic;";
    titS.textContent = "SEMIFINALES";
    colS.appendChild(titS);
    semi.forEach((p, i) => colS.appendChild(crearCard(p, colorSemi, `SEMIFINAL ${i+1}`)));
    row.appendChild(colS);

    // Conector S→F
    const connSF = document.createElement("div");
    connSF.style.cssText = `display:flex;flex-direction:column;align-self:stretch;min-width:28px;padding-top:34px;opacity:${opS};transition:opacity 0.4s;`;
    connSF.innerHTML = `
        <div style="flex:1;display:flex;flex-direction:column;">
            <div style="flex:1;border-right:2px solid rgba(255,152,0,0.4);border-top:2px solid rgba(255,152,0,0.4);border-radius:0 6px 0 0;"></div>
            <div style="height:2px;background:rgba(255,152,0,0.4);width:100%;"></div>
            <div style="flex:1;border-right:2px solid rgba(255,152,0,0.4);border-bottom:2px solid rgba(255,152,0,0.4);border-radius:0 0 6px 0;"></div>
        </div>
    `;
    row.appendChild(connSF);

    // ======== FINAL + COPA ========
    const colF = document.createElement("div");
    colF.style.cssText = `display:flex;flex-direction:row;align-items:center;justify-content:center;min-width:300px;padding:10px;gap:16px;align-self:stretch;opacity:${opF};transition:opacity 0.4s;`;

    const f = finalP[0];
    if (f) {
        const wFinal = document.createElement("div");
        wFinal.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:8px;";
        const titF = document.createElement("div");
        titF.style.cssText = "color:#fff;font-weight:900;font-size:clamp(13px,2vw,18px);letter-spacing:4px;font-style:italic;text-align:center;";
        titF.textContent = "FINAL";
        wFinal.appendChild(titF);
        wFinal.appendChild(crearCard(f, colorFinal));
        colF.appendChild(wFinal);

        colF.innerHTML += `<div style="width:20px;height:2px;background:rgba(255,152,0,0.5);flex-shrink:0;"></div>`;

        const wCopa = document.createElement("div");
        wCopa.innerHTML = crearCopa(f.ganador);
        colF.appendChild(wCopa);
    }
    row.appendChild(colF);

    scroll.appendChild(row);
    contenedor.appendChild(scroll);
}

cargarLiguilla();
