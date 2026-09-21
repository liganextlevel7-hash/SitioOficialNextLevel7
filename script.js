const URL_ESTADISTICAS =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=979195152&single=true&output=csv";

const URL_PARTIDOS =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1362473459&single=true&output=csv";

// ==================== EQUIPOS (dinámico desde el Sheet) ====================
const GID_EQUIPOS = '1894947293';
function csvUrl(gid){ return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid='+gid+'&single=true&output=csv'; }

function parseCSV(text){
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,'').replace(/\r/g,''));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++){
      const ch = line[i];
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ){ vals.push(cur.trim()); cur=''; }
      else cur += ch;
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h,i) => { obj[h] = (vals[i]||'').replace(/^"|"$/g,'').replace(/\r/g,'').trim(); });
    return obj;
  });
}

let logos = {};
let equiposID = {};
let bajas = new Set();    // nombres con Status = Baja
let bajasID = new Set();  // IDs con Status = Baja

async function cargarEquiposDesdeSheet(){
  try{
    const texto = await (await fetch(csvUrl(GID_EQUIPOS))).text();
    parseCSV(texto).forEach(e => {
      const id = e.ID_Equipo || e.id_equipo || e.ID || e.id;
      const nombre = e.Nombre || e.nombre;
      const url = e.URL || e.url || e.Logo || e.logo;
      if ((e.Status || e.status || '').toLowerCase() === 'baja') { if (nombre) bajas.add(nombre); if (id) bajasID.add(String(id)); return; }
      if (nombre) logos[nombre] = url;
      if (id) equiposID[id] = nombre;
    });
  }catch(err){
    console.error("Error cargando equipos:", err);
  }
}

// ==================== TABLA GENERAL ====================
async function cargarTablaGeneral(){
  try{
    const respuesta = await fetch(URL_ESTADISTICAS);
    const texto = await respuesta.text();
    const filas = texto.trim().split("\n");
    const equipos = [];

    for(let i=1;i<filas.length;i++){
      const c = filas[i].split(",");
      const nombre = c[1];
      if(nombre === "Descansa" || bajas.has((nombre||"").trim())) continue;
      equipos.push({
        ranking: Number(c[10]) || 999,
        equipo: nombre,
        pts: Number(c[9]) || 0,
        dg: Number(c[8]) || 0
      });
    }

  equipos.sort((a,b)=>a.ranking-b.ranking);
const top3equipos = equipos.slice(0, 3);
    
    let html = `
      <table class="tabla">
      <thead>
        <tr>
          <th>#</th>
          <th>Equipo</th>
          <th>PTS</th>
          <th>DG</th>
        </tr>
      </thead>
      <tbody>
    `;

  equipos.slice(0,3).forEach((e,index)=>{

  let posicion =
    index == 0 ? "🥇" :
    index == 1 ? "🥈" :
    index == 2 ? "🥉" :
    index + 1;

  html += `
    <tr>

      <td style="font-size:13px;font-weight:bold;">
        ${posicion}
      </td>

      <td style="text-align:left;font-size:14px;">
        <img
          src="${logos[e.equipo] || ""}"
          style="
            width:70px;
            height:70px;
            object-fit:contain;
            margin-right:12px;
            vertical-align:middle;
          "
        >
        ${e.equipo}
      </td>

      <td style="font-size:14px;font-weight:bold;">
        ${e.pts}
      </td>

      <td style="font-size:14px;font-weight:bold;">
        ${e.dg}
      </td>

    </tr>
  `;
});

html += `
  </tbody>
</table>
`;

document.getElementById("tabla-general").innerHTML = html;
    document.getElementById("tabla-general").innerHTML = html;

  }catch(error){
    console.error(error);
    document.getElementById("tabla-general").innerHTML = "Error cargando tabla";
  }
}

// ==================== PARTIDOS ====================
async function cargarPartidos(){
  try{
    const respuesta = await fetch(URL_PARTIDOS);
    const texto = await respuesta.text();
    const filas = texto.trim().split("\n");
    const programados = [];
    const jugados = [];

    for(let i=1;i<filas.length;i++){
      const c = filas[i].split(",");
      const estado = (c[6] || "").trim();
      if(bajasID.has((c[2]||"").trim()) || bajasID.has((c[3]||"").trim())) continue; // partido con equipo de baja: no se muestra
      const local = equiposID[Number(c[2])] || "";
      const visita = equiposID[Number(c[3])] || "";
      const partido = {
        local,
        visita,
        gl: c[4] || "",
        gv: c[5] || "",
         fecha: c[8] || ""
      };
      if(estado === "Programado") programados.push(partido);
      if(estado === "Jugado") jugados.push(partido);
    }

// Próxima Jornada
if(programados.length > 0){

  const fechaProxima = programados[0].fecha;

  const lista = programados
    .filter(p => p.fecha === fechaProxima)
    .slice(0,4);

  let html = `<div class="fecha-bloque">${fechaProxima}</div>`;

  lista.forEach(p=>{

    html += `
    <div class="partido">
      <div class="partido-top">

        <div class="equipo">
          <img src="${logos[p.local] || ""}" style="width:100px;height:100px;object-fit:contain;">
          <div class="nombre" style="font-size:12px;">${p.local}</div>
        </div>

        <div class="centro">
          <strong class="marcador" style="font-size:18px;">VS</strong>
        </div>

        <div class="equipo">
          <img src="${logos[p.visita] || ""}" style="width:80px;height:80px;object-fit:contain;">
          <div class="nombre" style="font-size:12px;">${p.visita}</div>
        </div>

      </div>
    </div>
    `;

  });

  document.getElementById("proxima-jornada").innerHTML = html;
}

// Últimos Resultados
if(jugados.length > 0){

  const fechaResultado = jugados[jugados.length - 1].fecha;

  const lista = jugados
    .filter(p => p.fecha === fechaResultado)
    .slice(0,4);

  let html = `<div class="fecha-bloque">${fechaResultado}</div>`;

  lista.forEach(p=>{

    html += `
    <div class="partido">
      <div class="partido-top">

        <div class="equipo">
          <img src="${logos[p.local] || ""}" style="width:80px;height:80px;object-fit:contain;">
          <div class="nombre" style="font-size:12px;">${p.local}</div>
        </div>

        <div class="centro">
          <strong class="marcador" style="font-size:18px;">${p.gl} - ${p.gv}</strong>
        </div>

        <div class="equipo">
          <img src="${logos[p.visita] || ""}" style="width:80px;height:80px;object-fit:contain;">
          <div class="nombre" style="font-size:12px;">${p.visita}</div>
        </div>

      </div>
    </div>
    `;

  });

  document.getElementById("ultimos-resultados").innerHTML = html;
}

  }catch(error){
    console.error(error);
  }
}

// ==================== INICIO ====================
(async function iniciar(){
  await cargarEquiposDesdeSheet();
  cargarTablaGeneral();
  cargarPartidos();
  cargarEquipos();
})();

// ==================== EQUIPOS ====================
function cargarEquipos(){
  const contenedor = document.getElementById("lista-equipos");
  if(!contenedor) return;
  let html = "";
  Object.keys(logos).forEach(nombre=>{
    html += `
    <div class="equipo-card">
      <img src="${logos[nombre]}" class="equipo-logo">
      <div class="equipo-nombre">${nombre}</div>
    </div>
    `;
  });
  contenedor.innerHTML = html;
}
