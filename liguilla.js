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

    selector.addEventListener("change", () => {
        const valor = selector.value;
        let filtrados = valor === "Completa" ? partidos : partidos.filter(p => p.ronda.toLowerCase() === valor.toLowerCase());
        renderBracket(filtrados, valor);
    });

    renderBracket(partidos, "Completa");
}

// Colores cuartos - solo línea/borde neón
const coloresCuartos = [
    { border:"#ffd700", glow:"rgba(255,215,0,0.7)",   label:"#ffd700" },  // 1-8 oro
    { border:"#c0c0c0", glow:"rgba(192,192,192,0.7)", label:"#c0c0c0" },  // 2-7 plata
    { border:"#b87333", glow:"rgba(184,115,51,0.7)",  label:"#b87333" },  // 3-6 cobre
    { border:"#39ff14", glow:"rgba(57,255,20,0.7)",   label:"#39ff14" },  // 4-5 verde neón
];

// Colores semifinal/final - solo línea blanca/naranja
const colorSemi  = { border:"rgba(255,255,255,0.6)", glow:"rgba(255,255,255,0.3)" };
const colorFinal = { border:"#ff9800", glow:"rgba(255,152,0,0.5)" };

const nombresCuartos = ["Encuentro 1-8","Encuentro 2-7","Encuentro 3-6","Encuentro 4-5"];

function esPorDefinir(val) {
    if (!val) return true;
    return val.trim().toLowerCase().replace(/p+or/, "por") === "por definir";
}

function crearPildora(nombre, url, ranking, color, size) {
    const nom = esPorDefinir(nombre) ? "Por Definir" : nombre.trim();
    const logoSize = size || 40;
    const logoHTML = (url && url.trim().startsWith("http"))
        ? `<img src="${url.trim()}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none'">`
        : `<span style="color:${color.border};font-weight:900;font-size:13px;">${ranking||'?'}</span>`;
    return `<div style="
        display:flex;align-items:center;gap:10px;
        background:transparent;
        border:2px solid ${color.border};
        border-radius:30px;
        padding:6px 16px 6px 6px;
        box-shadow:0 0 10px ${color.glow}, inset 0 0 8px rgba(0,0,0,0.4);
        min-width:170px;max-width:240px;margin:4px 0;
    ">
        <div style="
            width:${logoSize}px;height:${logoSize}px;border-radius:50%;flex-shrink:0;
            background:rgba(0,0,0,0.4);
            border:2px solid ${color.border};
            box-shadow:0 0 8px ${color.glow};
            display:flex;align-items:center;justify-content:center;overflow:hidden;
        ">${logoHTML}</div>
        <span style="color:#fff;font-weight:800;font-size:12px;letter-spacing:0.5px;
            text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${nom}
        </span>
    </div>`;
}

function crearMarcador(p) {
    const esJugado = (p.estado||"").trim().toLowerCase() === "jugado";
    return `<div style="text-align:center;padding:5px 0;font-weight:900;font-size:15px;
        color:${esJugado ? '#ffd700' : 'rgba(255,255,255,0.25)'};">
        ${esJugado ? `${p.golesLocal} - ${p.golesVisita}` : "VS"}
    </div>`;
}

function crearCampeon(ganador) {
    const hay = !esPorDefinir(ganador);
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="font-size:clamp(36px,6vw,56px);line-height:1;">🏆</div>
        <div style="
            background:linear-gradient(135deg,#1a237e,#0d1b5e);
            border:3px solid #ff9800;border-radius:14px;
            padding:14px 22px;text-align:center;
            box-shadow:0 0 30px rgba(255,152,0,0.4);
            min-width:150px;
        ">
            ${hay
                ? `<div style="background:linear-gradient(135deg,#ff9800,#e65100);border-radius:20px;
                    padding:5px 14px;font-weight:900;font-size:12px;color:#fff;
                    letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;display:inline-block;">
                    ${ganador.trim()}</div>`
                : `<div style="background:rgba(255,152,0,0.15);border:1px dashed #ff9800;border-radius:20px;
                    padding:5px 14px;font-weight:700;font-size:11px;color:rgba(255,255,255,0.4);
                    letter-spacing:1px;margin-bottom:8px;display:inline-block;">Por Definir</div>`
            }
            <div style="color:#fff;font-weight:900;font-size:clamp(14px,3vw,20px);letter-spacing:2px;">CAMPEÓN</div>
        </div>
    </div>`;
}

function renderBracket(partidos, vista) {
    const contenedor = document.getElementById("contenedor-bracket");
    contenedor.innerHTML = "";

    const cuartos = partidos.filter(p => p.ronda.toLowerCase().trim() === "cuartos");
    const semi    = partidos.filter(p => p.ronda.toLowerCase().trim() === "semifinal");
    const finalP  = partidos.filter(p => p.ronda.toLowerCase().trim() === "final");

    if (vista === "Completa" || vista === "Cuartos") {
        renderCompleta(contenedor, cuartos, semi, finalP, vista);
    } else if (vista === "Semifinal") {
        renderSemis(contenedor, semi);
    } else if (vista === "Final") {
        renderFinalView(contenedor, finalP);
    }
}

function crearCardCuarto(p, i) {
    const c = coloresCuartos[i % 4];
    const card = document.createElement("div");
    card.style.cssText = `
        background:rgba(0,0,0,0.35);
        border:2px solid ${c.border};
        border-radius:12px;
        padding:12px;
        box-shadow:0 0 14px ${c.glow};
        flex:1;
    `;
    const etq = document.createElement("div");
    etq.style.cssText = `
        color:${c.label};font-weight:900;font-size:9px;letter-spacing:2px;
        padding:2px 10px;border-radius:10px;display:inline-block;margin-bottom:8px;
        border:1px solid ${c.border};
        box-shadow:0 0 6px ${c.glow};
        text-transform:uppercase;
    `;
    etq.textContent = nombresCuartos[i] || `Encuentro ${i+1}`;
    card.appendChild(etq);
    card.innerHTML += crearPildora(p.equipoLocal, p.urlLocal, p.rankingLocal, c, 40);
    card.innerHTML += crearMarcador(p);
    card.innerHTML += crearPildora(p.equipoVisita, p.urlVisita, p.rankingVisita, c, 40);
    return card;
}

function renderCompleta(contenedor, cuartos, semi, finalP, vista) {
    const scroll = document.createElement("div");
    scroll.style.cssText = "overflow-x:auto;padding:10px 0 20px;";

    const row = document.createElement("div");
    row.style.cssText = "display:flex;flex-direction:row;align-items:center;gap:0;min-width:740px;";

    // ---- CUARTOS ----
    const colQ = document.createElement("div");
    colQ.style.cssText = "display:flex;flex-direction:column;gap:10px;min-width:240px;padding:10px;align-self:stretch;";

    const titQ = document.createElement("div");
    titQ.style.cssText = "color:#ffd700;font-weight:900;font-size:11px;letter-spacing:3px;text-align:center;margin-bottom:8px;";
    titQ.textContent = "CUARTOS DE FINAL";
    colQ.appendChild(titQ);

    cuartos.forEach((p, i) => {
        colQ.appendChild(crearCardCuarto(p, i));
    });
    row.appendChild(colQ);

    if (vista === "Cuartos" || !semi.length) {
        scroll.appendChild(row); contenedor.appendChild(scroll); return;
    }

    // ---- CONECTOR Q→S (líneas) ----
    const connQS = document.createElement("div");
    connQS.style.cssText = "display:flex;flex-direction:column;justify-content:space-around;align-items:flex-end;align-self:stretch;padding:52px 0;min-width:30px;";
    // Líneas para 4 cuartos → 2 semis
    // Par superior (cuartos 0 y 1 → semi 0)
    // Par inferior (cuartos 2 y 3 → semi 1)
    connQS.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0;flex:1;justify-content:space-around;">
            <div style="width:25px;height:2px;background:rgba(255,255,255,0.2);"></div>
            <div style="width:25px;height:2px;background:rgba(255,255,255,0.2);"></div>
        </div>
        <div style="width:2px;flex:0.5;background:rgba(255,255,255,0.15);align-self:flex-end;margin-right:0;"></div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0;flex:1;justify-content:space-around;">
            <div style="width:25px;height:2px;background:rgba(255,255,255,0.2);"></div>
            <div style="width:25px;height:2px;background:rgba(255,255,255,0.2);"></div>
        </div>
    `;
    row.appendChild(connQS);

    // ---- SEMIS ----
    const colS = document.createElement("div");
    colS.style.cssText = "display:flex;flex-direction:column;justify-content:space-around;gap:10px;min-width:220px;padding:10px;align-self:stretch;";

    const titS = document.createElement("div");
    titS.style.cssText = "color:#ffd700;font-weight:900;font-size:11px;letter-spacing:3px;text-align:center;margin-bottom:8px;font-style:italic;";
    titS.textContent = "SEMIFINALES";
    colS.appendChild(titS);

    semi.forEach((p, i) => {
        const card = document.createElement("div");
        card.style.cssText = `
            background:rgba(0,0,0,0.35);border-radius:10px;padding:12px;
            border:2px solid ${colorSemi.border};
            box-shadow:0 0 10px ${colorSemi.glow};
            flex:1;
        `;
        const tit = document.createElement("div");
        tit.style.cssText = "color:rgba(255,255,255,0.5);font-size:9px;letter-spacing:2px;text-align:center;margin-bottom:8px;font-weight:700;font-style:italic;";
        tit.textContent = `SEMIFINAL ${i+1}`;
        card.appendChild(tit);
        card.innerHTML += crearPildora(p.equipoLocal, p.urlLocal, p.rankingLocal, colorSemi, 40);
        card.innerHTML += crearMarcador(p);
        card.innerHTML += crearPildora(p.equipoVisita, p.urlVisita, p.rankingVisita, colorSemi, 40);
        colS.appendChild(card);
    });
    row.appendChild(colS);

    if (!finalP.length) { scroll.appendChild(row); contenedor.appendChild(scroll); return; }

    // ---- CONECTOR S→F ----
    const connSF = document.createElement("div");
    connSF.style.cssText = "display:flex;flex-direction:column;justify-content:center;align-items:center;align-self:stretch;min-width:30px;padding:60px 0;";
    connSF.innerHTML = `
        <div style="flex:1;width:2px;background:rgba(255,152,0,0.4);"></div>
        <div style="width:25px;height:2px;background:rgba(255,152,0,0.4);"></div>
        <div style="flex:1;width:2px;background:rgba(255,152,0,0.4);"></div>
    `;
    row.appendChild(connSF);

    // ---- FINAL ----
    const colF = document.createElement("div");
    colF.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:230px;padding:10px;gap:10px;align-self:stretch;";

    const titF = document.createElement("div");
    titF.style.cssText = "color:#fff;font-weight:900;font-size:clamp(14px,2.5vw,20px);letter-spacing:4px;font-style:italic;text-align:center;";
    titF.textContent = "FINAL";
    colF.appendChild(titF);

    const f = finalP[0];
    if (f) {
        const cardF = document.createElement("div");
        cardF.style.cssText = `
            background:rgba(0,0,0,0.35);border-radius:10px;padding:12px;
            border:2px solid ${colorFinal.border};
            box-shadow:0 0 16px ${colorFinal.glow};
            min-width:200px;
        `;
        cardF.innerHTML += crearPildora(f.equipoLocal, f.urlLocal, f.rankingLocal, colorFinal, 40);
        cardF.innerHTML += crearMarcador(f);
        cardF.innerHTML += crearPildora(f.equipoVisita, f.urlVisita, f.rankingVisita, colorFinal, 40);
        colF.appendChild(cardF);
        colF.innerHTML += `<div style="width:2px;height:16px;background:rgba(255,152,0,0.5);"></div>`;
        colF.innerHTML += crearCampeon(f.ganador);
    }
    row.appendChild(colF);

    scroll.appendChild(row);
    contenedor.appendChild(scroll);
}

function renderSemis(contenedor, semi) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-direction:column;gap:20px;padding:20px;max-width:440px;margin:0 auto;";
    const tit = document.createElement("div");
    tit.style.cssText = "color:#ffd700;font-weight:900;font-size:16px;letter-spacing:3px;text-align:center;font-style:italic;";
    tit.textContent = "SEMIFINALES";
    wrap.appendChild(tit);
    semi.forEach((p, i) => {
        const card = document.createElement("div");
        card.style.cssText = `background:rgba(0,0,0,0.35);border-radius:12px;padding:16px;border:2px solid ${colorSemi.border};box-shadow:0 0 10px ${colorSemi.glow};`;
        const stit = document.createElement("div");
        stit.style.cssText = "color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:2px;text-align:center;margin-bottom:10px;font-weight:700;font-style:italic;";
        stit.textContent = `SEMIFINAL ${i+1}`;
        card.appendChild(stit);
        card.innerHTML += crearPildora(p.equipoLocal, p.urlLocal, p.rankingLocal, colorSemi, 40);
        card.innerHTML += crearMarcador(p);
        card.innerHTML += crearPildora(p.equipoVisita, p.urlVisita, p.rankingVisita, colorSemi, 40);
        wrap.appendChild(card);
    });
    contenedor.appendChild(wrap);
}

function renderFinalView(contenedor, finalP) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:14px;padding:20px;max-width:380px;margin:0 auto;";
    wrap.innerHTML = `<div style="text-align:center;margin-bottom:4px;">
        <div style="color:#fff;font-weight:900;font-size:clamp(20px,5vw,34px);letter-spacing:4px;font-style:italic;line-height:1;">NEXT LEVEL 7</div>
        <div style="color:#ff9800;font-weight:900;font-size:clamp(12px,3vw,18px);letter-spacing:2px;font-style:italic;">CAMPEÓN TORNEO DOMINICAL</div>
    </div>`;
    if (finalP[0]) {
        const f = finalP[0];
        const card = document.createElement("div");
        card.style.cssText = `background:rgba(0,0,0,0.35);border-radius:12px;padding:16px;border:2px solid ${colorFinal.border};box-shadow:0 0 20px ${colorFinal.glow};min-width:240px;`;
        const stit = document.createElement("div");
        stit.style.cssText = "color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:2px;text-align:center;margin-bottom:10px;font-weight:700;font-style:italic;";
        stit.textContent = "FINAL";
        card.appendChild(stit);
        card.innerHTML += crearPildora(f.equipoLocal, f.urlLocal, f.rankingLocal, colorFinal, 40);
        card.innerHTML += crearMarcador(f);
        card.innerHTML += crearPildora(f.equipoVisita, f.urlVisita, f.rankingVisita, colorFinal, 40);
        wrap.appendChild(card);
        wrap.innerHTML += `<div style="width:2px;height:22px;background:rgba(255,152,0,0.5);"></div>`;
        wrap.innerHTML += crearCampeon(f.ganador);
    }
    contenedor.appendChild(wrap);
}

cargarLiguilla();
