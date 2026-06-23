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
            id:            c[0]?.trim(),
            ronda:         c[1]?.trim(),
            idLocal:       c[2]?.trim(),
            equipoLocal:   c[3]?.trim(),
            golesLocal:    c[4]?.trim(),
            idVisita:      c[5]?.trim(),
            equipoVisita:  c[6]?.trim(),
            golesVisita:   c[7]?.trim(),
            ganador:       c[8]?.trim(),
            urlLocal:      c[9]?.trim(),
            urlVisita:     c[10]?.trim(),
            rankingLocal:  c[11]?.trim(),
            rankingVisita: c[12]?.trim(),
            estado:        c[13]?.trim(),
            fecha:         c[14]?.trim()
        });
    }

    const selector = document.getElementById("selector-ronda");
    selector.addEventListener("change", () => {
        const valor = selector.value;
        let filtrados = valor === "Completa" ? partidos : partidos.filter(p => p.ronda.toLowerCase() === valor.toLowerCase());
        renderBracket(filtrados, valor);
    });

    renderBracket(partidos, "Completa");
}

// Nombres de encuentros cuartos
const nombresCuartos = ["Encuentro 1-8","Encuentro 2-7","Encuentro 3-6","Encuentro 4-5"];

// Colores por grupo (cuartos)
const coloresGrupo = [
    { main:"#e91e8c", dark:"#9c0d5a", glow:"rgba(233,30,140,0.5)" },
    { main:"#29b6f6", dark:"#0277bd", glow:"rgba(41,182,246,0.5)" },
    { main:"#ff9800", dark:"#e65100", glow:"rgba(255,152,0,0.5)" },
    { main:"#9c27b0", dark:"#4a0072", glow:"rgba(156,39,176,0.5)" }
];

function logoOrPlaceholder(url, size=36) {
    if (url && url.startsWith("http")) {
        return `<img src="${url}" style="width:${size}px;height:${size}px;object-fit:contain;border-radius:50%;background:rgba(255,255,255,0.1);" onerror="this.style.display='none'">`;
    }
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:14px;">⚽</div>`;
}

function crearPildora(nombre, url, ranking, color) {
    const c = color || coloresGrupo[0];
    return `
    <div class="pildora-equipo" style="
        display:flex;align-items:center;gap:10px;
        background:linear-gradient(135deg,${c.main},${c.dark});
        border-radius:30px;padding:8px 16px 8px 8px;
        box-shadow:0 4px 15px ${c.glow};
        min-width:180px;max-width:240px;
    ">
        <div style="
            width:36px;height:36px;border-radius:50%;
            background:rgba(0,0,0,0.3);border:2px solid rgba(255,255,255,0.4);
            display:flex;align-items:center;justify-content:center;
            font-weight:900;font-size:14px;color:#fff;flex-shrink:0;
            overflow:hidden;
        ">
            ${url && url.startsWith("http") ? `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" onerror="this.outerHTML='<span style=color:#fff;font-weight:900;font-size:13px>${ranking||\'?\'}</span>'">` : `<span style="color:#fff;font-weight:900;font-size:13px">${ranking||'?'}</span>`}
        </div>
        <span style="color:#fff;font-weight:800;font-size:13px;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${nombre || "Por Definir"}
        </span>
    </div>`;
}

function crearTarjetaGanador(ganador, urlGanador) {
    return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:0;">
        <div style="font-size:clamp(40px,8vw,80px);line-height:1;">🏆</div>
        <div style="
            background:linear-gradient(135deg,#1a237e,#0d1b6e);
            border:3px solid #ff9800;border-radius:16px;
            padding:20px 30px;text-align:center;
            box-shadow:0 0 30px rgba(255,152,0,0.5);
            min-width:160px;
        ">
            ${ganador && ganador !== "Por Definir" && ganador !== "Por definir" ? `
            <div style="
                background:linear-gradient(135deg,#ff9800,#e65100);
                border-radius:25px;padding:8px 20px;
                font-weight:900;font-size:14px;color:#fff;
                letter-spacing:1px;text-transform:uppercase;
                margin-bottom:12px;display:inline-block;
            ">${ganador}</div>` : `
            <div style="
                background:rgba(255,152,0,0.2);border:1px dashed #ff9800;
                border-radius:25px;padding:8px 20px;
                font-weight:700;font-size:12px;color:rgba(255,255,255,0.5);
                letter-spacing:1px;margin-bottom:12px;display:inline-block;
            ">Por Definir</div>`}
            <div style="color:#fff;font-weight:900;font-size:clamp(16px,3vw,22px);letter-spacing:2px;">CAMPEÓN</div>
        </div>
    </div>`;
}

// Línea conectora SVG
function lineaConectora(tipo="horizontal") {
    return `<div style="display:flex;align-items:center;justify-content:center;padding:0 8px;">
        <div style="width:40px;height:2px;background:rgba(255,255,255,0.25);"></div>
    </div>`;
}

function renderBracket(partidos, vista) {
    const contenedor = document.getElementById("contenedor-bracket");
    contenedor.innerHTML = "";

    const cuartos  = partidos.filter(p => p.ronda?.toLowerCase() === "cuartos");
    const semi     = partidos.filter(p => p.ronda?.toLowerCase() === "semifinal");
    const finalP   = partidos.filter(p => p.ronda?.toLowerCase() === "final");

    if (vista === "Completa" || vista === "Cuartos") {
        renderCuartos(contenedor, cuartos, vista === "Completa" ? semi : [], vista === "Completa" ? finalP : []);
    } else if (vista === "Semifinal") {
        renderSemifinal(contenedor, semi);
    } else if (vista === "Final") {
        renderFinal(contenedor, finalP);
    }
}

function renderCuartos(contenedor, cuartos, semi, finalP) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
        display:flex;flex-direction:row;align-items:center;
        gap:0;overflow-x:auto;padding:20px 10px;
        min-height:500px;
    `;

    // ===== COLUMNA CUARTOS =====
    const colCuartos = document.createElement("div");
    colCuartos.style.cssText = `display:flex;flex-direction:column;gap:20px;min-width:280px;`;

    const titCuartos = document.createElement("div");
    titCuartos.style.cssText = `color:#ffd700;font-weight:900;font-size:14px;letter-spacing:3px;text-align:center;margin-bottom:10px;text-transform:uppercase;`;
    titCuartos.textContent = "CUARTOS DE FINAL";
    colCuartos.appendChild(titCuartos);

    const gruposCuartos = document.createElement("div");
    gruposCuartos.style.cssText = `display:flex;flex-direction:column;gap:16px;`;

    cuartos.forEach((p, i) => {
        const color = coloresGrupo[i % coloresGrupo.length];
        const grupo = document.createElement("div");
        grupo.style.cssText = `
            background:rgba(255,255,255,0.05);
            border-left:4px solid ${color.main};
            border-radius:0 12px 12px 0;
            padding:12px;
            box-shadow:0 2px 15px rgba(0,0,0,0.3);
        `;

        const etiqueta = document.createElement("div");
        etiqueta.style.cssText = `
            background:${color.main};color:#fff;
            font-weight:900;font-size:10px;letter-spacing:2px;
            padding:3px 10px;border-radius:10px;
            display:inline-block;margin-bottom:10px;
        `;
        etiqueta.textContent = nombresCuartos[i] || `Encuentro ${i+1}`;
        grupo.appendChild(etiqueta);

        grupo.innerHTML += crearPildora(p.equipoLocal, p.urlLocal, p.rankingLocal, color);

        const marcador = document.createElement("div");
        const esJugado = p.estado?.toLowerCase() === "jugado";
        marcador.style.cssText = `text-align:center;padding:6px 0;font-weight:900;font-size:16px;color:${esJugado ? '#ffd700' : 'rgba(255,255,255,0.3)'};`;
        marcador.textContent = esJugado ? `${p.golesLocal} - ${p.golesVisita}` : "VS";
        grupo.appendChild(marcador);

        grupo.innerHTML += crearPildora(p.equipoVisita, p.urlVisita, p.rankingVisita, color);

        if (p.estado) {
            const est = document.createElement("div");
            est.style.cssText = `text-align:center;font-size:10px;color:rgba(255,255,255,0.4);margin-top:8px;letter-spacing:1px;`;
            est.textContent = p.estado;
            grupo.appendChild(est);
        }

        gruposCuartos.appendChild(grupo);
    });

    colCuartos.appendChild(gruposCuartos);
    wrapper.appendChild(colCuartos);

    // Líneas conectoras cuartos→semi
    if (semi && semi.length) {
        const connCuartos = document.createElement("div");
        connCuartos.style.cssText = `display:flex;flex-direction:column;justify-content:space-around;align-self:stretch;padding:40px 0;`;
        for (let i = 0; i < 2; i++) {
            const lineaWrap = document.createElement("div");
            lineaWrap.style.cssText = `display:flex;flex-direction:column;align-items:flex-end;gap:0;`;
            // Línea superior del par
            lineaWrap.innerHTML = `
                <div style="display:flex;align-items:center;height:50%;position:relative;">
                    <div style="width:30px;height:2px;background:rgba(255,255,255,0.2);"></div>
                    <div style="width:2px;height:80px;background:rgba(255,255,255,0.2);"></div>
                </div>
                <div style="display:flex;align-items:center;">
                    <div style="width:30px;height:2px;background:rgba(255,255,255,0.2);"></div>
                </div>
                <div style="display:flex;align-items:center;height:50%;position:relative;">
                    <div style="width:30px;height:2px;background:rgba(255,255,255,0.2);"></div>
                    <div style="width:2px;height:80px;background:rgba(255,255,255,0.2);margin-top:-80px;"></div>
                </div>
            `;
            connCuartos.appendChild(lineaWrap);
        }
        wrapper.appendChild(connCuartos);

        // ===== COLUMNA SEMIFINALES =====
        const colSemi = document.createElement("div");
        colSemi.style.cssText = `display:flex;flex-direction:column;gap:20px;min-width:260px;justify-content:space-around;align-self:stretch;padding:30px 0;`;

        const titSemi = document.createElement("div");
        titSemi.style.cssText = `color:#ffd700;font-weight:900;font-size:14px;letter-spacing:3px;text-align:center;margin-bottom:10px;text-transform:uppercase;`;
        titSemi.textContent = "SEMIFINALES";
        colSemi.appendChild(titSemi);

        semi.forEach((p, i) => {
            const card = document.createElement("div");
            card.style.cssText = `
                background:rgba(255,255,255,0.05);border-radius:12px;
                padding:14px;border:1px solid rgba(255,255,255,0.1);
                box-shadow:0 4px 20px rgba(0,0,0,0.3);flex:1;
            `;

            const tit = document.createElement("div");
            tit.style.cssText = `color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:2px;text-align:center;margin-bottom:10px;text-transform:uppercase;font-weight:700;font-style:italic;`;
            tit.textContent = `SEMIFINAL ${i+1}`;
            card.appendChild(tit);

            const local = p.equipoLocal && p.equipoLocal !== "Por Definir" && p.equipoLocal !== "Por definir";
            const visita = p.equipoVisita && p.equipoVisita !== "Por Definir" && p.equipoVisita !== "Por definir";

            card.innerHTML += crearPildora(local ? p.equipoLocal : "Por Definir", local ? p.urlLocal : null, local ? p.rankingLocal : "?", coloresGrupo[i*2]);
            const marcador = document.createElement("div");
            const esJugado = p.estado?.toLowerCase() === "jugado";
            marcador.style.cssText = `text-align:center;padding:6px 0;font-weight:900;font-size:15px;color:${esJugado ? '#ffd700' : 'rgba(255,255,255,0.3)'};`;
            marcador.textContent = esJugado ? `${p.golesLocal} - ${p.golesVisita}` : "VS";
            card.appendChild(marcador);
            card.innerHTML += crearPildora(visita ? p.equipoVisita : "Por Definir", visita ? p.urlVisita : null, visita ? p.rankingVisita : "?", coloresGrupo[i*2+1]);

            colSemi.appendChild(card);
        });

        wrapper.appendChild(colSemi);

        // Líneas semi→final
        if (finalP && finalP.length) {
            const connSemi = document.createElement("div");
            connSemi.style.cssText = `display:flex;flex-direction:column;justify-content:center;align-self:stretch;align-items:center;`;
            connSemi.innerHTML = `
                <div style="display:flex;align-items:center;">
                    <div style="width:2px;height:120px;background:rgba(255,255,255,0.2);"></div>
                    <div style="width:30px;height:2px;background:rgba(255,255,255,0.2);"></div>
                </div>
            `;
            wrapper.appendChild(connSemi);

            // ===== COLUMNA FINAL =====
            const colFinal = document.createElement("div");
            colFinal.style.cssText = `display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:240px;gap:20px;`;

            const titFinal = document.createElement("div");
            titFinal.style.cssText = `color:#fff;font-weight:900;font-size:clamp(16px,3vw,22px);letter-spacing:4px;font-style:italic;text-align:center;`;
            titFinal.textContent = "FINAL";
            colFinal.appendChild(titFinal);

            if (finalP[0]) {
                const f = finalP[0];
                const card = document.createElement("div");
                card.style.cssText = `background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;border:1px solid rgba(255,152,0,0.3);box-shadow:0 4px 20px rgba(255,152,0,0.2);min-width:220px;`;

                const lf = f.equipoLocal && f.equipoLocal !== "Por Definir" && f.equipoLocal !== "Por definir";
                const vf = f.equipoVisita && f.equipoVisita !== "Por Definir" && f.equipoVisita !== "Por definir";

                card.innerHTML += crearPildora(lf ? f.equipoLocal : "Por Definir", lf ? f.urlLocal : null, lf ? f.rankingLocal : "?", {main:"#e91e8c",dark:"#9c0d5a",glow:"rgba(233,30,140,0.5)"});
                const marcF = document.createElement("div");
                const esJ = f.estado?.toLowerCase() === "jugado";
                marcF.style.cssText = `text-align:center;padding:6px 0;font-weight:900;font-size:15px;color:${esJ ? '#ffd700' : 'rgba(255,255,255,0.3)'};`;
                marcF.textContent = esJ ? `${f.golesLocal} - ${f.golesVisita}` : "VS";
                card.appendChild(marcF);
                card.innerHTML += crearPildora(vf ? f.equipoVisita : "Por Definir", vf ? f.urlVisita : null, vf ? f.rankingVisita : "?", {main:"#ff9800",dark:"#e65100",glow:"rgba(255,152,0,0.5)"});

                colFinal.appendChild(card);
            }

            // Campeón
            const connFinal = document.createElement("div");
            connFinal.style.cssText = `display:flex;align-items:center;gap:0;`;
            connFinal.innerHTML = `<div style="width:30px;height:2px;background:rgba(255,152,0,0.5);"></div>`;
            colFinal.appendChild(connFinal);

            const ganadorFinal = finalP[0]?.ganador;
            const urlGanador = finalP[0]?.urlLocal;
            colFinal.innerHTML += crearTarjetaGanador(ganadorFinal, urlGanador);

            wrapper.appendChild(colFinal);
        }
    }

    contenedor.appendChild(wrapper);
}

function renderSemifinal(contenedor, semi) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `display:flex;flex-direction:column;gap:30px;padding:20px;max-width:500px;margin:0 auto;`;

    const tit = document.createElement("div");
    tit.style.cssText = `color:#ffd700;font-weight:900;font-size:16px;letter-spacing:3px;text-align:center;font-style:italic;`;
    tit.textContent = "SEMIFINALES";
    wrapper.appendChild(tit);

    semi.forEach((p, i) => {
        const card = document.createElement("div");
        card.style.cssText = `background:rgba(255,255,255,0.05);border-radius:14px;padding:18px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 4px 20px rgba(0,0,0,0.3);`;

        const stit = document.createElement("div");
        stit.style.cssText = `color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;text-align:center;margin-bottom:12px;text-transform:uppercase;font-weight:700;font-style:italic;`;
        stit.textContent = `SEMIFINAL ${i+1}`;
        card.appendChild(stit);

        const lf = p.equipoLocal && p.equipoLocal !== "Por Definir" && p.equipoLocal !== "Por definir";
        const vf = p.equipoVisita && p.equipoVisita !== "Por Definir" && p.equipoVisita !== "Por definir";

        card.innerHTML += crearPildora(lf ? p.equipoLocal : "Por Definir", lf ? p.urlLocal : null, lf ? p.rankingLocal : "?", coloresGrupo[i*2]);
        const marc = document.createElement("div");
        const esJ = p.estado?.toLowerCase() === "jugado";
        marc.style.cssText = `text-align:center;padding:8px 0;font-weight:900;font-size:16px;color:${esJ ? '#ffd700' : 'rgba(255,255,255,0.3)'};`;
        marc.textContent = esJ ? `${p.golesLocal} - ${p.golesVisita}` : "VS";
        card.appendChild(marc);
        card.innerHTML += crearPildora(vf ? p.equipoVisita : "Por Definir", vf ? p.urlVisita : null, vf ? p.rankingVisita : "?", coloresGrupo[i*2+1]);

        wrapper.appendChild(card);
    });

    contenedor.appendChild(wrapper);
}

function renderFinal(contenedor, finalP) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:20px;padding:20px;max-width:400px;margin:0 auto;`;

    // Título estilo "NEXT LEVEL 7 / CAMPEÓN TORNEO DOMINICAL"
    const titWrap = document.createElement("div");
    titWrap.style.cssText = `text-align:center;margin-bottom:10px;`;
    titWrap.innerHTML = `
        <div style="color:#fff;font-weight:900;font-size:clamp(22px,5vw,36px);letter-spacing:4px;line-height:1;font-style:italic;">NEXT LEVEL 7</div>
        <div style="color:#ff9800;font-weight:900;font-size:clamp(14px,3vw,20px);letter-spacing:3px;font-style:italic;">CAMPEÓN TORNEO DOMINICAL</div>
    `;
    wrapper.appendChild(titWrap);

    if (finalP[0]) {
        const f = finalP[0];
        const card = document.createElement("div");
        card.style.cssText = `background:rgba(255,255,255,0.05);border-radius:14px;padding:18px;border:1px solid rgba(255,152,0,0.3);box-shadow:0 4px 30px rgba(255,152,0,0.2);min-width:260px;`;

        const stit = document.createElement("div");
        stit.style.cssText = `color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;text-align:center;margin-bottom:12px;font-weight:700;font-style:italic;`;
        stit.textContent = "FINAL";
        card.appendChild(stit);

        const lf = f.equipoLocal && f.equipoLocal !== "Por Definir" && f.equipoLocal !== "Por definir";
        const vf = f.equipoVisita && f.equipoVisita !== "Por Definir" && f.equipoVisita !== "Por definir";

        card.innerHTML += crearPildora(lf ? f.equipoLocal : "Por Definir", lf ? f.urlLocal : null, lf ? f.rankingLocal : "?", {main:"#e91e8c",dark:"#9c0d5a",glow:"rgba(233,30,140,0.5)"});
        const marc = document.createElement("div");
        const esJ = f.estado?.toLowerCase() === "jugado";
        marc.style.cssText = `text-align:center;padding:8px 0;font-weight:900;font-size:16px;color:${esJ ? '#ffd700' : 'rgba(255,255,255,0.3)'};`;
        marc.textContent = esJ ? `${f.golesLocal} - ${f.golesVisita}` : "VS";
        card.appendChild(marc);
        card.innerHTML += crearPildora(vf ? f.equipoVisita : "Por Definir", vf ? f.urlVisita : null, vf ? f.rankingVisita : "?", {main:"#ff9800",dark:"#e65100",glow:"rgba(255,152,0,0.5)"});

        wrapper.appendChild(card);

        // Línea → campeón
        wrapper.innerHTML += `<div style="width:2px;height:30px;background:rgba(255,152,0,0.5);"></div>`;
        wrapper.innerHTML += crearTarjetaGanador(f.ganador, f.urlLocal);
    }

    contenedor.appendChild(wrapper);
}

// Inicializar
cargarLiguilla();
