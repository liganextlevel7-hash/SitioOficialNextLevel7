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
        ? `<img src="${url.trim()}" style="width:48px;height:48px;object-fit:contain;border-radius:50%;flex-shrink:0;filter:drop-shadow(0 0 6px ${color.border});" onerror="this.style.display='none'">`
        : `<div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">⚽</div>`;
    return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
        ${logo}
        <div style="border:2px solid ${color.border};border-radius:25px;padding:6px 14px;
            box-shadow:0 0 10px ${color.glow};background:transparent;flex:1;">
            <span style="color:#fff;font-weight:800;font-size:12px;letter-spacing:0.5px;
                text-transform:uppercase;white-space:nowrap;display:block;">${nom}</span>
        </div>
    </div>`;
}

function crearVS(p) {
    const esJ = (p.estado||"").trim().toLowerCase() === "jugado";
    const gl = (p.golesLocal||"0").trim();
    const gv = (p.golesVisita||"0").trim();
    return `<div style="text-align:center;padding:3px 0 3px 56px;font-weight:900;font-size:13px;
        color:${esJ?'#ffd700':'rgba(255,255,255,0.25)'};">${esJ?`${gl} - ${gv}`:"VS"}</div>`;
}

function crearCard(p, color, sub) {
    const d = document.createElement("div");
    d.style.cssText = `background:rgba(0,0,0,0.3);border:2px solid ${color.border};border-radius:14px;padding:10px 12px;box-shadow:0 0 16px ${color.glow};`;
    if (sub) {
        const s = document.createElement("div");
        s.style.cssText = "color:rgba(255,255,255,0.4);font-size:9px;letter-spacing:2px;text-align:center;margin-bottom:5px;font-weight:700;font-style:italic;";
        s.textContent = sub;
        d.appendChild(s);
    }
    d.innerHTML += crearEquipo(p.equipoLocal, p.urlLocal, color);
    d.innerHTML += crearVS(p);
    d.innerHTML += crearEquipo(p.equipoVisita, p.urlVisita, color);
    return d;
}

function crearCopa(ganador, urlG) {
    const hay = !esPD(ganador);
    const logo = (hay && urlG && urlG.trim().startsWith("http"))
        ? `<img src="${urlG.trim()}" style="width:56px;height:56px;object-fit:contain;border-radius:50%;border:2px solid #ffd700;box-shadow:0 0 12px rgba(255,215,0,0.8);" onerror="this.style.display='none'">`
        : `<div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.08);border:2px dashed rgba(255,215,0,0.4);display:flex;align-items:center;justify-content:center;font-size:24px;">⚽</div>`;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;">
        <div style="font-size:100px;line-height:1;filter:drop-shadow(0 0 24px rgba(255,215,0,0.9));">🏆</div>
        ${logo}
        <div style="color:${hay?'#ffd700':'rgba(255,255,255,0.35)'};font-weight:900;font-size:14px;
            letter-spacing:2px;text-transform:uppercase;text-shadow:0 0 10px rgba(255,215,0,0.6);">
            ${hay?ganador.trim():'Por Definir'}</div>
        <div style="color:#fff;font-weight:900;font-size:28px;letter-spacing:3px;">CAMPEÓN</div>
    </div>`;
}

function conector(color, alto) {
    // Dibuja el bracket en L usando borders CSS
    return `<div style="display:flex;flex-direction:column;width:30px;height:${alto}px;">
        <div style="flex:1;border-right:2px solid ${color};border-bottom:2px solid ${color};border-radius:0 0 8px 0;"></div>
        <div style="flex:1;border-right:2px solid ${color};border-top:2px solid ${color};border-radius:0 8px 0 0;"></div>
    </div>`;
}

function renderBracket(partidos, vista) {
    const contenedor = document.getElementById("contenedor-bracket");
    contenedor.innerHTML = "";

    const cuartos = partidos.filter(p => p.ronda.toLowerCase().trim() === "cuartos");
    const semi    = partidos.filter(p => p.ronda.toLowerCase().trim() === "semifinal");
    const finalP  = partidos.filter(p => p.ronda.toLowerCase().trim() === "final");

    const opQ = (vista==="Semifinal"||vista==="Final") ? "0.15" : "1";
    const opS = (vista==="Final") ? "0.15" : "1";

    const scroll = document.createElement("div");
    scroll.style.cssText = "overflow-x:auto;padding:10px 0 30px;";

    // Usamos TABLE para garantizar el centrado perfecto
    // Estructura:
    // | colQ par1 (Q0+Q1) | conn | colS semi1 | conn | colF final+copa |
    // |                   |      |            |      |                 |
    // | colQ par2 (Q2+Q3) |      | colS semi2 |      |                 |

    const tbl = document.createElement("table");
    tbl.style.cssText = "border-collapse:collapse;min-width:850px;";

    // Fila superior: Q0 | connQ top | S1 | connS top | F+copa (rowspan 2)
    // Fila inferior: Q1 |           |    |           |
    // Separador
    // Fila: Q2 | connQ top | S2 | connS bot |
    // Fila: Q3 |           |    |           |

    function td(content, style="", rowspan=1) {
        const cell = document.createElement("td");
        cell.style.cssText = style;
        if (rowspan > 1) cell.rowSpan = rowspan;
        if (typeof content === "string") cell.innerHTML = content;
        else cell.appendChild(content);
        return cell;
    }

    // Título row
    const trTit = document.createElement("tr");
    const tdTitQ = td(`<div style="color:#ffd700;font-weight:900;font-size:11px;letter-spacing:3px;text-align:center;padding:4px 8px;opacity:${opQ};">CUARTOS DE FINAL</div>`, "", 1);
    const tdTitQsp = td("", "width:30px;", 1);
    const tdTitS = td(`<div style="color:#ffd700;font-weight:900;font-size:11px;letter-spacing:3px;text-align:center;padding:4px 8px;font-style:italic;opacity:${opS};">SEMIFINALES</div>`, "", 1);
    const tdTitSsp = td("", "width:30px;", 1);
    const tdTitF = td(`<div style="color:#fff;font-weight:900;font-size:16px;letter-spacing:4px;text-align:center;padding:4px 8px;font-style:italic;">FINAL</div>`, "text-align:center;", 1);
    trTit.append(tdTitQ, tdTitQsp, tdTitS, tdTitSsp, tdTitF);
    tbl.appendChild(trTit);

    // Q0 row
    const trQ0 = document.createElement("tr");
    const tdQ0 = td(cuartos[0] ? crearCard(cuartos[0], coloresCuartos[0]) : "", `padding:4px 8px;vertical-align:bottom;opacity:${opQ};transition:opacity 0.4s;width:270px;`);
    // Conector Q→S: línea de Q0 baja hasta el centro → semi1
    const tdConnQ1 = td(`<div style="height:100%;border-right:2px solid rgba(255,255,255,0.25);border-bottom:2px solid rgba(255,255,255,0.25);border-radius:0 0 8px 0;min-height:80px;opacity:${opQ};transition:opacity 0.4s;"></div>`, "width:30px;padding:0;vertical-align:bottom;", 2);
    // Semi 1: rowspan 2 para estar centrada entre Q0 y Q1
    const tdS1 = td(semi[0] ? crearCard(semi[0], colorSemi, "SEMIFINAL 1") : "", `padding:4px 8px;vertical-align:middle;opacity:${opS};transition:opacity 0.4s;width:255px;`, 2);
    // Conector S→F top
    const tdConnS1 = td(`<div style="height:100%;border-right:2px solid rgba(255,152,0,0.5);border-bottom:2px solid rgba(255,152,0,0.5);border-radius:0 0 8px 0;min-height:80px;opacity:${opS};transition:opacity 0.4s;"></div>`, "width:30px;padding:0;vertical-align:bottom;", 2);
    // Final: rowspan 4 centrada entre las 2 semis
    const f = finalP[0];
    const urlG = f && !esPD(f.ganador) ? (f.urlLocal||"") : "";
    const tdF = document.createElement("td");
    tdF.rowSpan = 4;
    tdF.style.cssText = "padding:8px;vertical-align:middle;text-align:center;";
    if (f) {
        const wF = document.createElement("div");
        wF.style.cssText = "display:flex;flex-direction:row;align-items:center;gap:16px;justify-content:center;";
        wF.appendChild(crearCard(f, colorFinal));
        wF.innerHTML += `<div style="width:2px;height:60px;background:rgba(255,152,0,0.5);flex-shrink:0;"></div>`;
        const divC = document.createElement("div");
        divC.innerHTML = crearCopa(f.ganador, urlG);
        wF.appendChild(divC);
        tdF.appendChild(wF);
    }
    trQ0.append(tdQ0, tdConnQ1, tdS1, tdConnS1, tdF);
    tbl.appendChild(trQ0);

    // Q1 row
    const trQ1 = document.createElement("tr");
    const tdQ1 = td(cuartos[1] ? crearCard(cuartos[1], coloresCuartos[1]) : "", `padding:4px 8px;vertical-align:top;opacity:${opQ};transition:opacity 0.4s;`);
    // tdConnQ1 continua (rowspan 2)
    // tdS1 continua (rowspan 2)
    // Conector S→F bottom row 1
    const tdConnS1b = td(`<div style="height:100%;border-right:2px solid rgba(255,152,0,0.5);border-top:2px solid rgba(255,152,0,0.5);border-radius:0 8px 0 0;min-height:80px;opacity:${opS};transition:opacity 0.4s;"></div>`, "width:30px;padding:0;vertical-align:top;", 2);
    trQ1.append(tdQ1, tdConnS1b);
    tbl.appendChild(trQ1);

    // Separador row (espacio entre los dos pares)
    const trSep = document.createElement("tr");
    const tdSep = td("", `padding:5px;opacity:${opQ};`);
    const tdConnQ2 = td(`<div style="height:100%;border-right:2px solid rgba(255,255,255,0.25);border-bottom:2px solid rgba(255,255,255,0.25);border-radius:0 0 8px 0;min-height:80px;opacity:${opQ};transition:opacity 0.4s;"></div>`, "width:30px;padding:0;vertical-align:bottom;", 2);
    const tdS2 = td(semi[1] ? crearCard(semi[1], colorSemi, "SEMIFINAL 2") : "", `padding:4px 8px;vertical-align:middle;opacity:${opS};transition:opacity 0.4s;`, 2);
    const tdConnS2 = td(`<div style="height:100%;border-right:2px solid rgba(255,152,0,0.5);border-bottom:2px solid rgba(255,152,0,0.5);border-radius:0 0 8px 0;min-height:80px;opacity:${opS};transition:opacity 0.4s;"></div>`, "width:30px;padding:0;vertical-align:bottom;", 2);
    trSep.append(tdSep, tdConnQ2, tdS2, tdConnS2);
    tbl.appendChild(trSep);

    // Q2 row
    const trQ2 = document.createElement("tr");
    const tdQ2 = td(cuartos[2] ? crearCard(cuartos[2], coloresCuartos[2]) : "", `padding:4px 8px;vertical-align:bottom;opacity:${opQ};transition:opacity 0.4s;`);
    trQ2.append(tdQ2);
    tbl.appendChild(trQ2);

    // Q3 row
    const trQ3 = document.createElement("tr");
    const tdQ3 = td(cuartos[3] ? crearCard(cuartos[3], coloresCuartos[3]) : "", `padding:4px 8px;vertical-align:top;opacity:${opQ};transition:opacity 0.4s;`);
    const tdConnS2b = td(`<div style="height:100%;border-right:2px solid rgba(255,152,0,0.5);border-top:2px solid rgba(255,152,0,0.5);border-radius:0 8px 0 0;min-height:80px;opacity:${opS};transition:opacity 0.4s;"></div>`, "width:30px;padding:0;vertical-align:top;");
    trQ3.append(tdQ3, tdConnS2b);
    tbl.appendChild(trQ3);

    scroll.appendChild(tbl);
    contenedor.appendChild(scroll);
}

cargarLiguilla();
