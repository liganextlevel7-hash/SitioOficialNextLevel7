// ==================== liguilla.js ====================

const URL_LIGUILLA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1783955716&single=true&output=csv";

// Función para cargar la liguilla
async function cargarLiguilla() {
    const respuesta = await fetch(URL_LIGUILLA);
    const texto = await respuesta.text();
    const filas = texto.trim().split("\n");

    // Convertimos CSV a objetos
    const partidos = [];
    for (let i = 1; i < filas.length; i++) {
        const c = filas[i].split(",");
        partidos.push({
            id: c[0],
            ronda: c[1],
            idLocal: c[2],
            equipoLocal: c[3],
            golesLocal: c[4],
            idVisita: c[5],
            equipoVisita: c[6],
            golesVisita: c[7],
            ganador: c[8],
            urlLocal: c[9],
            urlVisita: c[10],
            rankingLocal: c[11],
            rankingVisita: c[12],
            estado: c[13],
            fecha: c[14]
        });
    }

    // Selector de ronda
    const selector = document.getElementById("selector-ronda");
    selector.innerHTML = `
        <option value="Completa">Liguilla Completa</option>
        <option value="Cuartos">Cuartos</option>
        <option value="Semifinal">Semifinales</option>
        <option value="Final">Final</option>
    `;

    selector.addEventListener("change", () => {
        const valor = selector.value;
        let filtrados = [];

        if (valor === "Completa") filtrados = partidos;
        else filtrados = partidos.filter(p => p.ronda.toLowerCase() === valor.toLowerCase());

        renderBracket(filtrados);
    });

    // Render inicial: Liguilla Completa
    renderBracket(partidos);
}

// Función para renderizar el bracket
function renderBracket(partidos) {
    const contenedor = document.getElementById("contenedor-bracket");
    contenedor.innerHTML = "";

    // Separar por rondas
    const cuartos = partidos.filter(p => p.ronda.toLowerCase() === "cuartos");
    const semi = partidos.filter(p => p.ronda.toLowerCase() === "semifinal");
    const final = partidos.filter(p => p.ronda.toLowerCase() === "final");

    const crearColumna = (titulo, listaPartidos) => {
        const col = document.createElement("div");
        col.className = "columna-bracket";
        const h = document.createElement("h3");
        h.textContent = titulo;
        col.appendChild(h);

        listaPartidos.forEach(p => {
            const match = document.createElement("div");
            match.className = "liguilla-match";

            const local = document.createElement("div");
            local.className = "liguilla-equipo";
            local.innerHTML = `<img src="${p.urlLocal}" class="liguilla-logo"><span>${p.equipoLocal || "TBD"}</span>`;
            match.appendChild(local);

            const vs = document.createElement("div");
            vs.className = "liguilla-vs";
            const marcador = p.estado && p.estado.toLowerCase() === "jugado" ? `${p.golesLocal || 0} - ${p.golesVisita || 0}` : "VS";
            vs.innerHTML = `<span class="liguilla-marcador">${marcador}</span>`;
            match.appendChild(vs);

            const visita = document.createElement("div");
            visita.className = "liguilla-equipo";
            visita.innerHTML = `<img src="${p.urlVisita}" class="liguilla-logo"><span>${p.equipoVisita || "TBD"}</span>`;
            match.appendChild(visita);

            const estado = document.createElement("div");
            estado.className = "liguilla-estado";
            estado.textContent = p.estado || "Por Definir";
            match.appendChild(estado);

            col.appendChild(match);
        });

        return col;
    };

    const bracket = document.createElement("div");
    bracket.className = "bracket";

    if (cuartos.length) bracket.appendChild(crearColumna("CUARTOS", cuartos));
    if (semi.length) bracket.appendChild(crearColumna("SEMIFINALES", semi));
    if (final.length) bracket.appendChild(crearColumna("FINAL", final));

    contenedor.appendChild(bracket);
}

// Inicializar liguilla
cargarLiguilla();
