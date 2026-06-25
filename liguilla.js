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
            id:c[0],ronda:c[1],idLocal:c[2],equipoLocal:c[3],
            golesLocal:c[4],idVisita:c[5],equipoVisita:c[6],
            golesVisita:c[7],ganador:c[8],urlLocal:c[9],
            urlVisita:c[10],rankingLocal:c[11],rankingVisita:c[12],
            estado:c[13],fecha:c[14]
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

const CQ = [
    {border:"#ffd700",glow:"rgba(255,215,0,0.7)"},
    {border:"#c0c0c0",glow:"rgba(192,192,192,0.7)"},
    {border:"#b87333",glow:"rgba(184,115,51,0.7)"},
    {border:"#39ff14",glow:"rgba(57,255,20,0.7)"},
];
const CS = {border:"rgba(255,255,255,0.5)",glow:"rgba(255,255,255,0.2)"};
const CF = {border:"#ff9800",glow:"rgba(255,152,0,0.6)"};

function esPD(v){return !v||v.trim().toLowerCase().replace(/p+or/,"por")==="por definir";}

function equipo(nom,url,col){
    nom = esPD(nom)?"Por Definir":nom.trim();
    const lg = (url&&url.trim().startsWith("http"))
        ?`<img src="${url.trim()}" style="width:48px;height:48px;object-fit:contain;border-radius:50%;flex-shrink:0;filter:drop-shadow(0 0 6px ${col.border});" onerror="this.style.display='none'">`
        :`<div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">⚽</div>`;
    return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0;">${lg}
        <div style="border:2px solid ${col.border};border-radius:25px;padding:6px 14px;box-shadow:0 0 10px ${col.glow};background:transparent;flex:1;min-width:140px;">
        <span style="color:#fff;font-weight:800;font-size:12px;text-transform:uppercase;white-space:nowrap;display:block;">${nom}</span></div></div>`;
}

function vs(p){
    const j=(p.estado||"").trim().toLowerCase()==="jugado";
    return `<div style="text-align:center;padding:3px 0 3px 56px;font-weight:900;font-size:13px;color:${j?'#ffd700':'rgba(255,255,255,0.25)'};">${j?`${(p.golesLocal||0).toString().trim()} - ${(p.golesVisita||0).toString().trim()}`:"VS"}</div>`;
}

function card(p,col,sub){
    const d=document.createElement("div");
    d.style.cssText=`background:rgba(0,0,0,0.3);border:2px solid ${col.border};border-radius:14px;padding:10px 12px;box-shadow:0 0 16px ${col.glow};`;
    if(sub){const s=document.createElement("div");s.style.cssText="color:rgba(255,255,255,0.4);font-size:9px;letter-spacing:2px;text-align:center;margin-bottom:5px;font-weight:700;font-style:italic;";s.textContent=sub;d.appendChild(s);}
    d.innerHTML+=equipo(p.equipoLocal,p.urlLocal,col);
    d.innerHTML+=vs(p);
    d.innerHTML+=equipo(p.equipoVisita,p.urlVisita,col);
    return d;
}

function copa(ganador,urlG){
    const hay=!esPD(ganador);
    const lg=(hay&&urlG&&urlG.trim().startsWith("http"))
        ?`<img src="${urlG.trim()}" style="width:60px;height:60px;object-fit:contain;border-radius:50%;border:2px solid #ffd700;box-shadow:0 0 14px rgba(255,215,0,0.8);" onerror="this.style.display='none'">`
        :`<div style="width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.08);border:2px dashed rgba(255,215,0,0.4);display:flex;align-items:center;justify-content:center;font-size:26px;">⚽</div>`;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:0 10px;">
        <div style="font-size:120px;line-height:1;filter:drop-shadow(0 0 28px rgba(255,215,0,0.95));">🏆</div>
        ${lg}
        <div style="color:${hay?'#ffd700':'rgba(255,255,255,0.4)'};font-weight:900;font-size:15px;letter-spacing:2px;text-transform:uppercase;text-shadow:0 0 12px rgba(255,215,0,0.7);">${hay?ganador.trim():'Por Definir'}</div>
        <div style="color:#fff;font-weight:900;font-size:30px;letter-spacing:3px;text-shadow:0 0 12px rgba(255,255,255,0.4);">CAMPEÓN</div>
    </div>`;
}

function renderBracket(partidos, vista){
    const cont = document.getElementById("contenedor-bracket");
    cont.innerHTML = "";

    const Q = partidos.filter(p=>p.ronda.toLowerCase().trim()==="cuartos");
    const S = partidos.filter(p=>p.ronda.toLowerCase().trim()==="semifinal");
    const F = partidos.filter(p=>p.ronda.toLowerCase().trim()==="final");

    const oQ = (vista==="Semifinal"||vista==="Final")?"0.15":"1";
    const oS = (vista==="Final")?"0.15":"1";

    const scroll=document.createElement("div");
    scroll.style.cssText="overflow-x:auto;padding:10px 0 30px;";

    // TABLA con estructura exacta:
    // Row 1: Q[0]  | borde-abajo  | S[0] rowspan=2 | borde-abajo  | F rowspan=4 + copa
    // Row 2: Q[1]  | borde-arriba |                | borde-arriba |
    // Row 3: Q[2]  | borde-abajo  | S[1] rowspan=2 | borde-abajo  |
    // Row 4: Q[3]  | borde-arriba |                | borde-arriba |

    const tbl=document.createElement("table");
    tbl.style.cssText="border-collapse:collapse;";

    function tdEl(content,style,rowspan){
        const c=document.createElement("td");
        c.style.cssText=style||"";
        if(rowspan)c.rowSpan=rowspan;
        if(content instanceof HTMLElement)c.appendChild(content);
        else c.innerHTML=content||"";
        return c;
    }

    const linW="rgba(255,255,255,0.28)";
    const linO="rgba(255,152,0,0.55)";
    const connH="50px"; // altura mínima de cada celda conector

    // Fila títulos
    const rTit=document.createElement("tr");
    rTit.append(
        tdEl(`<div style="color:#ffd700;font-weight:900;font-size:11px;letter-spacing:3px;text-align:center;padding-bottom:6px;opacity:${oQ};">CUARTOS DE FINAL</div>`,"padding:0 8px;"),
        tdEl("","width:32px;"),
        tdEl(`<div style="color:#ffd700;font-weight:900;font-size:11px;letter-spacing:3px;text-align:center;padding-bottom:6px;font-style:italic;opacity:${oS};">SEMIFINALES</div>`,"padding:0 8px;"),
        tdEl("","width:32px;"),
        tdEl(`<div style="color:#fff;font-weight:900;font-size:17px;letter-spacing:4px;text-align:center;padding-bottom:6px;font-style:italic;">FINAL</div>`,"padding:0 8px;")
    );
    tbl.appendChild(rTit);

    // Fila Q[0] — conector baja hacia centro
    const r0=document.createElement("tr");
    const f=F[0];
    const urlG=f&&!esPD(f.ganador)?(f.urlLocal||""):"";

    r0.append(
        tdEl(Q[0]?card(Q[0],CQ[0]):null,`padding:4px 8px;vertical-align:bottom;opacity:${oQ};transition:opacity 0.4s;width:280px;`),
        tdEl(`<div style="display:flex;flex-direction:column;min-height:calc(${connH} * 2);height:100%;opacity:${oQ};transition:opacity 0.4s;"><div style="flex:1;border-right:2px solid ${linW};border-bottom:2px solid ${linW};border-radius:0 0 8px 0;"></div><div style="flex:1;border-right:2px solid ${linW};border-top:2px solid ${linW};border-radius:0 8px 0 0;"></div></div>`,"padding:0;width:32px;",2),
        tdEl(S[0]?card(S[0],CS,"SEMIFINAL 1"):null,`padding:4px 8px;vertical-align:middle;opacity:${oS};transition:opacity 0.4s;width:260px;`,2),
        tdEl(`<div style="display:flex;flex-direction:column;min-height:calc(${connH} * 2);height:100%;opacity:${oS};transition:opacity 0.4s;"><div style="flex:1;border-right:2px solid ${linO};border-bottom:2px solid ${linO};border-radius:0 0 8px 0;"></div><div style="flex:1;border-right:2px solid ${linO};border-top:2px solid ${linO};border-radius:0 8px 0 0;"></div></div>`,"padding:0;width:32px;",2),
        (()=>{const c=document.createElement("td");c.rowSpan=4;c.style.cssText="padding:8px;vertical-align:middle;text-align:center;";
            if(f){const w=document.createElement("div");w.style.cssText="display:flex;flex-direction:row;align-items:center;gap:16px;justify-content:center;";
                w.appendChild(card(f,CF));
                w.innerHTML+=`<div style="width:2px;height:70px;background:rgba(255,152,0,0.5);flex-shrink:0;"></div>`;
                const dc=document.createElement("div");dc.innerHTML=copa(f.ganador,urlG);w.appendChild(dc);c.appendChild(w);}
            return c;})()
    );
    tbl.appendChild(r0);

    // Fila Q[1] — conector sube al centro
    const r1=document.createElement("tr");
    r1.append(
        tdEl(Q[1]?card(Q[1],CQ[1]):null,`padding:4px 8px;vertical-align:top;opacity:${oQ};transition:opacity 0.4s;`)
        // conector Q col (rowspan 2) ya insertado
        // S[0] (rowspan 2) ya insertado
        // conector S col (rowspan 2) ya insertado
        // Final (rowspan 4) ya insertado
    );
    // Agregar celda que "sube" (border-top + border-right)
    // connQ y connS tienen rowspan=2, no agregar más celdas
    tbl.appendChild(r1);

    // Fila Q[2]
    const r2=document.createElement("tr");
    r2.append(
        tdEl(Q[2]?card(Q[2],CQ[2]):null,`padding:4px 8px;vertical-align:bottom;opacity:${oQ};transition:opacity 0.4s;`),
        tdEl(`<div style="display:flex;flex-direction:column;min-height:calc(${connH} * 2);height:100%;opacity:${oQ};transition:opacity 0.4s;"><div style="flex:1;border-right:2px solid ${linW};border-bottom:2px solid ${linW};border-radius:0 0 8px 0;"></div><div style="flex:1;border-right:2px solid ${linW};border-top:2px solid ${linW};border-radius:0 8px 0 0;"></div></div>`,"padding:0;width:32px;",2),
        tdEl(S[1]?card(S[1],CS,"SEMIFINAL 2"):null,`padding:4px 8px;vertical-align:middle;opacity:${oS};transition:opacity 0.4s;`,2),
        tdEl(`<div style="display:flex;flex-direction:column;min-height:calc(${connH} * 2);height:100%;opacity:${oS};transition:opacity 0.4s;"><div style="flex:1;border-right:2px solid ${linO};border-bottom:2px solid ${linO};border-radius:0 0 8px 0;"></div><div style="flex:1;border-right:2px solid ${linO};border-top:2px solid ${linO};border-radius:0 8px 0 0;"></div></div>`,"padding:0;width:32px;",2)
    );
    tbl.appendChild(r2);

    // Fila Q[3]
    const r3=document.createElement("tr");
    r3.append(
        tdEl(Q[3]?card(Q[3],CQ[3]):null,`padding:4px 8px;vertical-align:top;opacity:${oQ};transition:opacity 0.4s;`)
    );
    // connQ y connS tienen rowspan=2, no agregar más celdas en r3
    tbl.appendChild(r3);

    scroll.appendChild(tbl);
    cont.appendChild(scroll);
}

cargarLiguilla();
