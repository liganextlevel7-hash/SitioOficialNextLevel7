body{
background:
linear-gradient(rgba(0,0,0,.75),rgba(0,0,0,.85)),
url("fondodominical.png");

background-size:cover;
background-position:center;
background-attachment:fixed;
background-repeat:no-repeat;

color:white;
font-family:Arial,sans-serif;
margin:0;
min-height:100vh;
}

header{
text-align:center;
padding:30px 20px;
}

.logo-liga{
width:250px;
max-width:80%;
filter:drop-shadow(0 0 20px #39ff14);
}

h1{
font-size:55px;
margin:10px 0;
color:#7fff00;
text-shadow:
0 0 10px #7fff00,
0 0 20px #7fff00,
0 0 30px #7fff00,
0 0 40px #7fff00;
}

.subtitulo{
font-size:22px;
color:#ffd700;
font-weight:bold;
margin-bottom:20px;
}

nav{
margin-top:20px;
}

nav a{
display:inline-block;
margin:6px;
padding:12px 22px;
background:rgba(0,0,0,.75);
border:1px solid #39ff14;
border-radius:12px;
color:white;
text-decoration:none;
font-weight:bold;
transition:.3s;
}

nav a:hover{
transform:translateY(-3px);
background:#39ff14;
color:black;
box-shadow:
0 0 10px #39ff14,
0 0 20px #39ff14;
}

.contenedor{
max-width:1400px;
margin:auto;
padding:20px;
display:grid;
grid-template-columns:repeat(auto-fit,minmax(350px,1fr));
gap:20px;
}

.card{
background:rgba(0,0,0,.75);
border:1px solid #39ff14;
border-radius:18px;
padding:20px;
backdrop-filter:blur(5px);

box-shadow:
0 0 10px #39ff14,
0 0 20px rgba(57,255,20,.4);

transition:.3s;
}

.card:hover{
transform:translateY(-4px);
box-shadow:
0 0 15px #39ff14,
0 0 30px rgba(57,255,20,.6);
}

.card h2{
text-align:center;
color:#8cff00;
font-size:20px;
margin-bottom:20px;
}

.fecha-bloque{
text-align:center;
font-size:18px;
font-weight:bold;
color:#ffd700;
margin-bottom:15px;
}

.partido{
background:rgba(255,255,255,.05);
border:1px solid rgba(255,255,255,.12);
border-radius:15px;
padding:15px;
margin-bottom:15px;
}

.partido-top{
display:flex;
justify-content:space-between;
align-items:center;
}

.equipo{
width:35%;
text-align:center;
}

.equipo img{
width:80px;
height:80px;
object-fit:contain;
filter:drop-shadow(0 0 8px rgba(255,255,255,.4));
}

.nombre{
margin-top:8px;
font-size:16px;
font-weight:bold;
line-height:1.2;
}

.centro{
width:30%;
text-align:center;
font-size:20px;
font-weight:bold;
color:#ffd700;
}

.campo{
text-align:center;
margin-top:10px;
font-size:15px;
color:#ddd;
}

.tabla{
width:100%;
border-collapse:collapse;
margin-top:10px;
}

.tabla th{
background:#39ff14;
color:black;
padding:12px;
font-size:15px;
}

.tabla td{
padding:12px 8px;
border-bottom:1px solid rgba(255,255,255,.15);
text-align:center;
}

.tabla tr:hover{
background:rgba(255,255,255,.05);
}

.tabla img{
width:24px;
height:24px;
vertical-align:middle;
margin-right:8px;
}

@media(max-width:768px){

h1{
font-size:36px;
}

.logo-liga{
width:180px;
}

.equipo img{
width:65px;
height:65px;
}

.nombre{
font-size:13px;
}

.centro{
font-size:18px;
}

  #lista-equipos{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(120px,1fr));
gap:15px;
}

.equipo-card{
text-align:center;
background:rgba(255,255,255,.05);
border-radius:12px;
padding:10px;
transition:.3s;
}

.equipo-card:hover{
transform:scale(1.05);
background:rgba(255,255,255,.1);
}

.equipo-logo{
width:70px;
height:70px;
object-fit:contain;
}

.equipo-nombre{
margin-top:8px;
font-size:14px;
font-weight:bold;
}

}

#lista-equipos{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
gap:20px;
}

.equipo-card{
text-align:center;
background:rgba(255,255,255,.05);
border-radius:15px;
padding:15px;
cursor:pointer;
transition:.3s;
}

.equipo-card:hover{
transform:scale(1.05);
background:rgba(255,255,255,.1);
box-shadow:0 0 15px #39ff14;
}

.equipo-logo{
width:120px;
height:120px;
object-fit:contain;
}

.equipo-nombre{
margin-top:10px;
font-size:16px;
font-weight:bold;
color:white;
}
.popup{
display:none;
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,.8);
justify-content:center;
align-items:center;
z-index:9999;
}

.popup-contenido{
background:#111;
border:2px solid #39ff14;
border-radius:20px;
padding:30px;
width:90%;
max-width:450px;
text-align:center;
box-shadow:0 0 25px #39ff14;
position:relative;
}

#cerrar-popup{
position:absolute;
right:15px;
top:10px;
font-size:30px;
cursor:pointer;
color:white;
}

#cerrar-popup:hover{
color:#39ff14;
}

#info-equipo h2{
color:#39ff14;
margin-bottom:15px;
}

#info-equipo p{
margin:8px 0;
font-size:16px;
}
@media(max-width:768px){

.tabla th:nth-child(5),
.tabla td:nth-child(5),
.tabla th:nth-child(7),
.tabla td:nth-child(7),
.tabla th:nth-child(8),
.tabla td:nth-child(8){
display:none;
}

}
@media(max-width:768px){
    .tabla{
        font-size:10px !important;
    }

    .tabla th{
        padding:10px 6px !important;
        font-size:10px !important;
    }

    .tabla td{
        padding:10px 6px !important;
        font-size:10px !important;
    }

    .tabla img{
        width:30px !important;
        height:30px !important;
        margin-right:6px !important;
    }
}

}
.contenedor-jugadores{
max-width:1400px;
margin:auto;
padding:20px;
}

#selector-equipo-jugador{
width:100%;
padding:15px;
border-radius:12px;
border:1px solid #39ff14;
background:#111;
color:white;
font-size:16px;
}

.jugadores-grid{
display:grid;
grid-template-columns:
repeat(3,1fr);
gap:20px;
margin-top:20px;
}

.jugador-card{
background:rgba(0,0,0,.75);
border:1px solid #39ff14;
border-radius:20px;
padding:20px;
text-align:center;
box-shadow:
0 0 10px #39ff14;
}

.jugador-foto{
width:140px;
height:140px;
border-radius:50%;
object-fit:cover;
margin-bottom:15px;
border:3px solid #39ff14;
}

.jugador-card h3{
margin-bottom:15px;
color:#39ff14;
}

.jugador-card p{
margin:8px 0;
}

@media(max-width:768px){

.jugadores-grid{
grid-template-columns:1fr;
}

}
.lider{
background:rgba(255,215,0,.15);
border-left:5px solid gold;
font-weight:bold;
}

.clasificado{
background:rgba(57,255,20,.10);
border-left:5px solid #39ff14;
}

.tabla{
overflow:hidden;
border-radius:15px;
}

.tabla th{
background:linear-gradient(
90deg,
#39ff14,
#7fff00
);
color:black;
font-weight:bold;
}

.tabla tr:hover{
background:rgba(255,255,255,.08);
}

.tabla td:first-child{
font-weight:bold;
color:#ffd700;
}
/* JUGADORES */

#selector-equipo-jugador{
width:100%;
max-width:500px;
margin:auto;
display:block;
padding:15px;
border-radius:15px;
border:2px solid #39ff14;
background:#111;
color:white;
font-size:18px;
font-weight:bold;
text-align:center;
}

.jugadores-grid{
display:grid;
grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
gap:20px;
margin-top:20px;
}

.jugador-card{
background:rgba(0,0,0,.75);
border:2px solid #39ff14;
border-radius:20px;
padding:15px;
text-align:center;
}

.jugador-foto{
width:180px;
height:180px;
object-fit:cover;
border-radius:15px;
border:3px solid #39ff14;
}

.jugador-card h3{
margin-top:10px;
font-size:18px;
color:white;
}

@media(max-width:768px){

.jugadores-grid{
grid-template-columns:repeat(2,1fr);
gap:15px;
}

.jugador-foto{
width:120px;
height:120px;
}

.jugador-card h3{
font-size:14px;
}

}
.jugador-card-pro{
background:#050505;
border:2px solid #39ff14;
border-radius:22px;
padding:20px;
margin-bottom:20px;
box-shadow:0 0 20px rgba(57,255,20,.35);
transition:.3s;
}

.jugador-card-pro:hover{
transform:translateY(-4px);
box-shadow:0 0 30px rgba(57,255,20,.6);
}

.jugador-header{
display:flex;
align-items:center;
gap:18px;
margin-bottom:18px;
}

.jugador-foto-pro{
width:90px;
height:90px;
border-radius:50%;
object-fit:cover;
border:3px solid #39ff14;
}

.jugador-info h3{
margin:0;
font-size:22px;
color:white;
}

.jugador-posicion{
display:inline-block;
margin-top:5px;
padding:4px 10px;
background:#39ff14;
color:black;
border-radius:20px;
font-size:12px;
font-weight:bold;
}

.jugador-stats{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:12px;
}

.stat{
background:#111;
border-radius:15px;
padding:12px;
text-align:center;
}

.stat span{
display:block;
font-size:22px;
margin-bottom:5px;
}

.stat strong{
display:block;
font-size:22px;
color:#39ff14;
}

.stat small{
color:#ccc;
font-size:11px;
}

@media(max-width:768px){

.jugador-header{
flex-direction:column;
text-align:center;
}

.jugador-stats{
grid-template-columns:repeat(2,1fr);
}

}
.jugadores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.jugador-card {
  background: #111;
  border: 2px solid #39ff14;
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  color: white;
  box-shadow: 0 0 15px #39ff14;
}

.jugador-foto {
  width: 100%;
  max-height: 180px;
  object-fit: contain;
  margin-bottom: 10px;
}

.jugador-info h3 {
  margin: 5px 0;
  color: #39ff14;
}

.jugador-posicion {
  display: inline-block;
  background: #39ff14;
  color: black;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-bottom: 10px;
}

.jugador-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.stat {
  background: #222;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
  flex: 1;
  margin: 0 2px;
}

.stat span {
  display: block;
  font-size: 16px;
  margin-bottom: 2px;
}

.stat small {
  display: block;
  color: #ccc;
  font-size: 10px;
}
/* =========================
   PARTIDOS NUEVO DISEÑO
========================= */

.filtros-partidos{
display:flex;
gap:15px;
flex-wrap:wrap;
justify-content:center;
margin-top:15px;
}

.filtros-partidos select{
background:#111;
color:white;
border:2px solid #39ff14;
border-radius:15px;
padding:12px 18px;
font-size:15px;
font-weight:bold;
cursor:pointer;
min-width:220px;
box-shadow:0 0 10px rgba(57,255,20,.35);
transition:.3s;
}

.filtros-partidos select:hover{
box-shadow:0 0 15px #39ff14;
}

.filtros-partidos select:focus{
outline:none;
box-shadow:
0 0 10px #39ff14,
0 0 20px #39ff14;
}

/* =========================
   TARJETA PARTIDO
========================= */

.partido-tarjeta{
background:rgba(0,0,0,.75);
border:1px solid #39ff14;
border-radius:20px;
padding:20px;
margin-bottom:20px;

box-shadow:
0 0 10px rgba(57,255,20,.35);

transition:.3s;
}

.partido-tarjeta:hover{
box-shadow:
0 0 15px #39ff14,
0 0 25px rgba(57,255,20,.35);
}

.partido-info{
display:flex;
justify-content:space-between;
align-items:center;
gap:20px;
}

.partido-equipo{
display:flex;
flex-direction:column;
align-items:center;
width:35%;
}

.escudo-partido{
width:90px;
height:90px;
object-fit:contain;
}

.nombre-equipo{
margin-top:8px;
font-size:14px;
font-weight:bold;
text-align:center;
}

.partido-marcador{
width:30%;
text-align:center;
}

.marcador-texto{
font-size:28px;
font-weight:bold;
color:#ffd700;
}

.partido-detalles{
margin-top:15px;
padding-top:15px;
border-top:1px solid rgba(57,255,20,.25);

display:flex;
justify-content:center;
gap:25px;
flex-wrap:wrap;
}

.detalle{
font-size:14px;
font-weight:bold;
color:#ddd;
}

.partido-estatus{
margin-top:15px;
display:flex;
justify-content:center;
gap:20px;
flex-wrap:wrap;
}

.tipo-encuentro{
background:#39ff14;
color:black;
padding:8px 15px;
border-radius:30px;
font-weight:bold;
font-size:13px;
}

.estado-partido{
background:#ffd700;
color:black;
padding:8px 15px;
border-radius:30px;
font-weight:bold;
font-size:13px;
}

/* =========================
   MOVIL
========================= */

@media(max-width:768px){

.partido-info{
flex-direction:row;
gap:10px;
}

.escudo-partido{
width:65px;
height:65px;
}

.nombre-equipo{
font-size:11px;
}

.marcador-texto{
font-size:22px;
}

.partido-detalles{
gap:10px;
font-size:12px;
}

.detalle{
font-size:12px;
}

.tipo-encuentro,
.estado-partido{
font-size:11px;
padding:6px 12px;
}

.filtros-partidos select{
width:100%;
min-width:100%;
}

}
/* ==================== Partidos - Tabla tipo liga ==================== */
.contenedor-partidos {
  max-width: 1400px;
  margin: auto;
  padding: 20px;
}

.filtros-card {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid #39ff14;
  box-shadow: 0 0 10px #39ff14;
}

.filtros-partidos select {
  margin: 5px;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #39ff14;
  background: #111;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.filtros-partidos select:hover {
  background: #39ff14;
  color: black;
  border-color: #7fff00;
}

.tabla-partidos {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.75);
  box-shadow: 0 0 15px #39ff14;
}

.tabla-partidos th, .tabla-partidos td {
  padding: 12px 8px;
  text-align: center;
  font-size: 14px;
  color: white;
}

.tabla-partidos th {
  background: linear-gradient(90deg, #39ff14, #7fff00);
  color: black;
  font-weight: bold;
}

.tabla-partidos tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.05);
}

.tabla-partidos tr:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tabla-partidos .escudo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  vertical-align: middle;
  margin: 0 5px;
}

.tabla-partidos .tipo-encuentro {
  font-weight: bold;
  color: #ffd700;
  margin-top: 4px;
  display: block;
}

.tabla-partidos .estado-partido {
  font-size: 12px;
  color: #39ff14;
  display: block;
  margin-top: 2px;
}

@media(max-width:768px){
  .tabla-partidos th, .tabla-partidos td {
    font-size: 12px;
    padding: 6px 4px;
  }
  .escudo {
    width: 30px;
    height: 30px;
  }
}
/* ===================================
   LIGUILLA
=================================== */

.card-liguilla{
    text-align:center;
    margin-bottom:25px;
}

#selector-ronda{
    background:#111;
    color:#fff;
    border:2px solid #39ff14;
    border-radius:12px;
    padding:12px 18px;
    font-size:16px;
    font-weight:700;
    cursor:pointer;
    min-width:240px;
}

#selector-ronda:hover{
    box-shadow:0 0 15px #39ff14;
}

#contenedor-bracket{
    width:100%;
    overflow-x:auto;
    padding:20px;
}

.bracket{
    display:flex;
    justify-content:space-between;
    gap:50px;
    min-width:1100px;
}

.columna-bracket{
    flex:1;
}

.columna-bracket h3{
    text-align:center;
    color:#39ff14;
    font-size:26px;
    margin-bottom:25px;
    text-shadow:0 0 10px #39ff14;
}

.liguilla-match{
    background:#0a0a0a;
    border:2px solid #39ff14;
    border-radius:15px;
    padding:12px;
    margin-bottom:20px;
    box-shadow:0 0 15px rgba(57,255,20,.25);
}

.liguilla-equipo{
    display:flex;
    align-items:center;
    gap:10px;
    margin:8px 0;
}

.liguilla-logo{
    width:32px;
    height:32px;
    object-fit:contain;
    flex-shrink:0;
}

.liguilla-equipo span{
    color:#fff;
    font-size:16px;
    font-weight:700;
}

.liguilla-vs{
    text-align:center;
    margin:10px 0;
}

.liguilla-marcador{
    color:#ffd700;
    font-size:22px;
    font-weight:bold;
}

.liguilla-estado{
    text-align:center;
    color:#39ff14;
    font-size:13px;
    margin-top:8px;
    font-weight:bold;
}

/* SEMIFINALES BAJAN UN POCO */

.columna-bracket:nth-child(2){
    padding-top:90px;
}

/* FINAL BAJA MÁS */

.columna-bracket:nth-child(3){
    padding-top:180px;
}

/* MOVIL */

@media(max-width:768px){

.bracket{
    flex-direction:column;
    min-width:100%;
}

.columna-bracket:nth-child(2),
.columna-bracket:nth-child(3){
    padding-top:0;
}

.columna-bracket h3{
    font-size:22px;
}

.liguilla-equipo span{
    font-size:14px;
}

.liguilla-logo{
    width:28px;
    height:28px;
}

}
