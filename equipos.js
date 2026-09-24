const URL_ESTADISTICAS =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=979195152&single=true&output=csv";

const URL_EQUIPOS =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1894947293&single=true&output=csv";

// Se llenan solos al cargar, jalando la hoja "Equipos" — ya no hace falta tocarlos a mano
let equiposData = {}; // nombre -> { id, descripcion, logo }
let logos = {};        // nombre -> logo (compatibilidad con el resto del código)

async function cargarCatalogoEquipos(){
  const respuesta = await fetch(URL_EQUIPOS);
  const texto = await respuesta.text();
  const filas = texto.trim().split("\n");

  const datosTmp = {};
  const logosTmp = {};

  for(let i=1;i<filas.length;i++){
    const c = filas[i].split(",");
    const id = c[0] || "";
    const nombre = (c[1] || "").trim();
    if(!nombre) continue;
    if((c[5] || "").trim().toLowerCase() === "baja") continue; // Status = Baja: no se muestra
    const descripcion = (c[2] || "").trim();
    const logoUrl = (c[4] || c[3] || "").trim(); // columna "URL" (o "Logo" si esa es la que trae el link)
    datosTmp[nombre] = { id, descripcion, logo: logoUrl };
    logosTmp[nombre] = logoUrl;
  }

  equiposData = datosTmp;
  logos = logosTmp;
}

async function cargarEquipos(){

  await cargarCatalogoEquipos(); // primero traemos equipos/logos/descripciones reales del Sheet

  const respuesta = await fetch(URL_ESTADISTICAS);
  const texto = await respuesta.text();

  const filas = texto.trim().split("\n");

  const datosEquipos = {};

  for(let i=1;i<filas.length;i++){

    const c = filas[i].split(",");

    const nombre = c[1];

    if(nombre === "Descansa") continue;

    datosEquipos[nombre] = {
      jj: c[2] || 0,
      jg: c[3] || 0,
      je: c[4] || 0,
      jp: c[5] || 0,
      gf: c[6] || 0,
      gc: c[7] || 0,
      dg: c[8] || 0,
      pts: c[9] || 0,
      ranking: c[10] || "-"
    };

  }

  const contenedor = document.getElementById("lista-equipos");

  let html = "";

  Object.keys(logos).forEach(nombre=>{

    html += `
    <div class="equipo-card" onclick="tocarEquipo('${nombre}')">
      <img src="${logos[nombre]}" class="equipo-logo">
      <div class="equipo-nombre">${nombre}</div>
    </div>
    `;

  });

  contenedor.innerHTML = html;

  window.datosEquipos = datosEquipos;

}

// En celular el popup se abre con doble toque (un toque suelto no hace nada, así no estorba al deslizar).
// En computadora sigue abriendo con un clic.
let ultimoToque = { nombre: null, t: 0 };
function tocarEquipo(nombre){
  const esTactil = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if(!esTactil){ mostrarEquipo(nombre); return; }
  const ahora = Date.now();
  if(ultimoToque.nombre === nombre && ahora - ultimoToque.t < 450){
    ultimoToque = { nombre: null, t: 0 };
    mostrarEquipo(nombre);
  } else {
    ultimoToque = { nombre: nombre, t: ahora };
  }
}

function mostrarEquipo(nombre){

  const e = window.datosEquipos[nombre] || {};
  const info = equiposData[nombre] || {};

  document.getElementById("info-equipo").innerHTML = `

    <h2>${nombre}</h2>

    ${info.descripcion ? `<p class="equipo-descripcion">${info.descripcion}</p>` : ""}

    <img src="${logos[nombre] || ''}"
    style="width:120px;height:120px;object-fit:contain;">

    <p><strong>Posición:</strong> ${e.ranking ?? "-"}</p>

    <p><strong>Puntos:</strong> ${e.pts ?? 0}</p>

    <p><strong>JJ:</strong> ${e.jj ?? 0}</p>

    <p><strong>JG:</strong> ${e.jg ?? 0}</p>

    <p><strong>JE:</strong> ${e.je ?? 0}</p>

    <p><strong>JP:</strong> ${e.jp ?? 0}</p>

    <p><strong>GF:</strong> ${e.gf ?? 0}</p>

    <p><strong>GC:</strong> ${e.gc ?? 0}</p>

    <p><strong>DG:</strong> ${e.dg ?? 0}</p>

  `;

  document.getElementById("popup-equipo").style.display = "flex";

}

document.addEventListener("click", function(e){

  if(e.target.id === "cerrar-popup"){
    document.getElementById("popup-equipo").style.display = "none";
  }

  if(e.target.id === "popup-equipo"){
    document.getElementById("popup-equipo").style.display = "none";
  }

});

cargarEquipos();
