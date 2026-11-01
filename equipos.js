/* Catálogo de Equipos. Conserva la hoja de estadísticas como fuente de sus cifras. */
(()=>{
'use strict';
const URL_ESTADISTICAS='https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=979195152&single=true&output=csv';
const URL_EQUIPOS='https://docs.google.com/spreadsheets/d/e/2PACX-1vRs55yHIAY-lWfU6XccheWIPHUjF4aRue0jy68FbZ9fNtPJfeO1glwsWI46cWv-6cxXy2slGty-DgMd/pub?gid=1894947293&single=true&output=csv';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function csv(text){const rows=[];let row=[],f='',q=false;for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===','){row.push(f);f=''}else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(f);if(row.some(x=>x.trim()))rows.push(row);row=[];f=''}else f+=c}if(f||row.length){row.push(f);rows.push(row)}const headers=(rows.shift()||[]).map(h=>norm(h.replace(/^\uFEFF/,'')));return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||'').trim()])));}
async function leer(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('La hoja respondió '+r.status);const data=csv(await r.text());if(!data.length||!('nombre' in data[0]))throw Error('La hoja no contiene el catálogo esperado.');return data;}
let equipos=[],estadisticas={},vista='escudos',detalle='escudos',seleccion=null,carga=0,token=0,visor=null,threePromise=null,errorStats='';
const imagen=(src,alt,cls='')=>`<img src="${esc(src)}" alt="${esc(alt)}" class="${cls}" loading="lazy" decoding="async">`;
function pintar(){
 $('lista-equipos').innerHTML=equipos.map(t=>{const src=vista==='playeras'?t.Color_Playera:t.URL;return `<button class="eq-card" data-id="${esc(t.id)}" data-modo="${vista}" aria-label="${esc(t.Nombre)}: ${vista==='3d'?'ver jugador 3D':'ver estadísticas'}"><span class="eq-picture">${src?imagen(src,vista==='playeras'?'Playera de '+t.Nombre:'Escudo de '+t.Nombre):'<span class="eq-sin">Playera aún no disponible</span>'}</span>${vista==='playeras'&&t.URL?imagen(t.URL,'','eq-mini'):''}<span class="eq-name">${esc(t.Nombre)}</span><span class="eq-action">${vista==='3d'?'Ver jugador 3D · estadísticas':'Ver equipo y estadísticas'}</span></button>`}).join('');
 $('lista-equipos').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>abrir(equipos.find(t=>t.id===b.dataset.id)));
 document.querySelectorAll('[data-vista]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vista===vista)));
 $('eq-count').textContent=equipos.length+' equipos participantes';
}
async function cargarEquipos(){const v=++carga;$('eq-status').textContent='Cargando equipos…';const [catalogo,stats]=await Promise.allSettled([leer(URL_EQUIPOS),leer(URL_ESTADISTICAS)]);if(v!==carga)return;
 if(catalogo.status==='rejected'){$('eq-status').innerHTML='No se pudieron cargar los equipos. <button class="eq-retry" id="eq-retry">Reintentar</button>';$('eq-retry').onclick=cargarEquipos;return;}
 equipos=catalogo.value.filter(r=>norm(r.status)!=='baja'&&r.nombre&&r.nombre!=='Descansa').map((r,i)=>({id:r.id_equipo||String(i+1),Nombre:r.nombre,Descripción:r.descripcion||'',URL:r.url||r.logo||'',Color_Playera:r.color_playera||''}));
 estadisticas={};errorStats='';if(stats.status==='fulfilled'){for(const r of stats.value)estadisticas[norm(r.nombre)]=r;}else errorStats='Las estadísticas no pudieron cargarse; los equipos y uniformes siguen disponibles.';
 window.datosEquipos=Object.fromEntries(equipos.filter(t=>estadisticas[norm(t.Nombre)]).map(t=>[t.Nombre,estadisticas[norm(t.Nombre)]]));
 pintar();$('eq-status').textContent=errorStats||'Elige un equipo para ver sus detalles.';
}
function pintarStats(t){const e=estadisticas[norm(t.Nombre)];if(!e){$('info-equipo').innerHTML='<h3 class="eq-stat-title">Estadísticas del equipo</h3><p class="eq-info">'+(errorStats?'No se pudieron cargar las estadísticas.':'Todavía no hay estadísticas registradas para este equipo.')+'</p>'+(errorStats?'<button class="eq-retry" id="eq-stats-retry">Reintentar estadísticas</button>':'');$('eq-stats-retry')?.addEventListener('click',async()=>{await cargarEquipos();if(seleccion)pintarStats(seleccion)});return;}
 const items=[['jj','Jugados'],['jg','Ganados'],['je','Empatados'],['jp','Perdidos'],['gf','Goles a favor'],['gc','Goles en contra'],['dg','Diferencia de goles']];
 $('info-equipo').innerHTML='<h3 class="eq-stat-title">Estadísticas del torneo</h3><div class="eq-lead"><div class="eq-kpi"><strong>'+esc(e.ranking||'—')+'</strong><span>POSICIÓN</span></div><div class="eq-kpi"><strong>'+esc(e.pts||'0')+'</strong><span>PUNTOS</span></div></div><div class="eq-stats">'+items.map(([k,t])=>'<div class="eq-stat"><b>'+esc(e[k]||'0')+'</b><span>'+t+'</span></div>').join('')+'</div><p class="eq-info">Cifras de la tabla de estadísticas del torneo.</p>';
}
function abrir(t){if(!t)return;seleccion=t;$('eq-dialog-name').textContent=t.Nombre;$('eq-dialog-desc').textContent=t.Descripción;$('eq-dialog-logo').src=t.URL;$('eq-dialog-logo').alt='Escudo de '+t.Nombre;pintarStats(t);if(!$('popup-equipo').open)$('popup-equipo').showModal();$('popup-equipo').scrollTop=0;verDetalle(vista);}
async function cargarThree(){if(window.THREE)return;if(!threePromise)threePromise=new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';s.onload=ok;s.onerror=()=>{s.remove();threePromise=null;no(Error('No se pudo cargar la vista 3D. Puedes volver a pulsar Jugador 3D.'))};document.head.append(s)});await threePromise;}
async function verDetalle(modo){detalle=modo;const v=++token,t=seleccion;if(!t)return;visor?.detener();document.querySelectorAll('[data-detalle]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.detalle===modo)));$('eq-stage').hidden=modo!=='3d';$('eq-controls').hidden=true;$('eq-detail-image').hidden=modo==='3d';$('eq-model-status').textContent='';
 if(modo!=='3d'){const src=modo==='playeras'?t.Color_Playera:t.URL;$('eq-detail-image').src=src||t.URL;$('eq-detail-image').alt=(modo==='playeras'&&src?'Playera':'Escudo')+' de '+t.Nombre;if(modo==='playeras'&&!src)$('eq-model-status').textContent='Este equipo todavía no tiene una playera registrada.';return;}
 $('eq-model-status').textContent='Preparando uniforme…';try{await cargarThree();if(v!==token||!$('popup-equipo').open)return;if(!visor)visor=crearVisor($('eq-stage'));const modelo=await visor.mostrar(t,equipos.indexOf(t),()=>v===token&&$('popup-equipo').open&&detalle==='3d');if(v!==token||!$('popup-equipo').open)return;$('eq-controls').hidden=false;$('eq-spin').setAttribute('aria-pressed','false');$('eq-spin').textContent='Activar giro';$('eq-model-status').textContent=modelo?.uniformeDisponible?'Arrastra horizontalmente para girar al jugador.':'No hay imagen de playera disponible: se muestra el escudo del equipo.';}catch(e){console.error('Vista 3D:',e);if(v===token)$('eq-model-status').textContent='No se pudo mostrar el jugador 3D. Puedes seguir viendo el escudo, la playera y sus estadísticas.';}
}
$('cerrar-popup').onclick=()=>$('popup-equipo').close();$('popup-equipo').addEventListener('close',()=>{token++;visor?.detener();seleccion=null;});$('popup-equipo').addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect();if(e.target===e.currentTarget&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))e.currentTarget.close()});
 document.querySelectorAll('[data-vista]').forEach(b=>b.onclick=()=>{vista=b.dataset.vista;pintar()});document.querySelectorAll('[data-detalle]').forEach(b=>b.onclick=()=>verDetalle(b.dataset.detalle));
 $('eq-spin').onclick=()=>{if(!visor)return;const s=visor.girar();$('eq-spin').textContent=s?'Pausar giro':'Activar giro';$('eq-spin').setAttribute('aria-pressed',String(s));};$('eq-front').onclick=()=>{visor?.frente();$('eq-spin').textContent='Activar giro';$('eq-spin').setAttribute('aria-pressed','false')};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)visor?.detener();else if(seleccion&&detalle==='3d'&&$('popup-equipo').open)visor?.iniciar()});
 window.mostrarEquipo=nombre=>abrir(equipos.find(t=>norm(t.Nombre)===norm(nombre)));window.tocarEquipo=window.mostrarEquipo;

function crearVisor(host){
const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
const fb=(txt,col)=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle=col;x.beginPath();x.arc(64,64,58,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=6;x.stroke();
  x.fillStyle='#fff';x.font='bold 64px Roboto,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,68);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t};
const cargar=(u,f)=>new Promise(ok=>{if(!u)return ok(f());loader.load(u,t=>{t.encoding=THREE.sRGBEncoding;ok(t)},undefined,()=>ok(f()))});
function prom(tex,def){try{const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');x.drawImage(tex.image,0,0,16,16);const d=x.getImageData(0,0,16,16).data;let r=0,g=0,b=0,n=0;
  for(let i=0;i<d.length;i+=4)if(d[i+3]>200){r+=d[i];g+=d[i+1];b+=d[i+2];n++}return n>8?new THREE.Color(r/n/255,g/n/255,b/n/255):def}catch(e){return def}}
const cache={};
function textura(t,i){return cache[t.id]||(cache[t.id]=(async()=>{const def=new THREE.Color().setHSL((i*.137)%1,.55,.42);
  const [esc,pla]=await Promise.all([cargar(t.URL,()=>fb((t.Nombre||'?').charAt(0),'#'+def.getHexString())),cargar(t.Color_Playera,()=>null)]);
  esc.nl7Compartida=true;if(pla)pla.nl7Compartida=true;return {esc,pla,col:pla?prom(pla,def):def}})())}
function texto(lineas,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
  lineas.forEach(([t,tam,col,y])=>{x.font=`bold ${tam}px Roboto,Arial`;x.lineWidth=tam/5;x.strokeStyle='#04100a';x.strokeText(t,w/2,y);x.fillStyle=col;x.fillText(t,w/2,y)});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));s.renderOrder=3;return s}
const pieles=[0xe1ad87,0xc18b63,0x9b6344,0x754a35];
const anatomiaGeo=new THREE.SphereGeometry(1,12,10);
function volumen(parent,mat,x,y,z,sx,sy,sz){const m=new THREE.Mesh(anatomiaGeo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m;}
function telaTorso(tex,col){
 // Se toma la zona de tela de la imagen de la playera, en vez de pegar su silueta completa.
 const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#'+col.getHexString();x.fillRect(0,0,512,256);
 if(tex?.image){const im=tex.image,w=im.width,h=im.height;for(let side=0;side<2;side++)x.drawImage(im,w*.20,h*.15,w*.60,h*.82,side*256,48,256,208);}
 const map=new THREE.CanvasTexture(c);map.encoding=THREE.sRGBEncoding;map.anisotropy=4;map.wrapS=THREE.RepeatWrapping;return new THREE.MeshStandardMaterial({map,roughness:.9});
}
function camisetaMesh(mat){
 const rings=[[1.18,.285,.17],[1.36,.30,.185],[1.62,.345,.195],[1.88,.39,.18],[2.02,.255,.135]],verts=[],uv=[],idx=[],N=20;
 rings.forEach(([y,rx,rz],r)=>{for(let a=0;a<=N;a++){const th=a/N*Math.PI*2;verts.push(Math.sin(th)*rx,y,Math.cos(th)*rz);const frontal=Math.cos(th)>=0;const u=(frontal?.25:.75)+Math.sin(th)*(frontal?.25:-.25);uv.push(u,(y-1.18)/.84);}});
 for(let r=0;r<rings.length-1;r++)for(let a=0;a<N;a++){const i=r*(N+1)+a;idx.push(i,i+1,i+N+1,i+1,i+N+2,i+N+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return new THREE.Mesh(geo,mat);
}
async function jugador(t,i,gk){
 const {esc,pla,col}=await textura(t,i),color=gk?new THREE.Color(gk):col,g=new THREE.Group();
 const piel=new THREE.MeshStandardMaterial({color:pieles[i%4],roughness:.88});
 const tela=new THREE.MeshStandardMaterial({color,roughness:.9}),shortMat=new THREE.MeshStandardMaterial({color:color.clone().multiplyScalar(.48),roughness:.9});
 const sock=new THREE.MeshStandardMaterial({color:0xe9e9db,roughness:.95}),boot=new THREE.MeshStandardMaterial({color:i%2?0x202827:0xeeeecc,roughness:.6});
 const torso=camisetaMesh(telaTorso(gk?null:pla,color));torso.castShadow=true;g.add(torso);
 // Cuello y ribete real de la camiseta.
 volumen(g,piel,0,2.035,0,.09,.12,.09);
 const collar=new THREE.Mesh(new THREE.TorusGeometry(.135,.027,6,18),new THREE.MeshStandardMaterial({color:0xe6e8d9,roughness:.8}));collar.rotation.x=Math.PI/2;collar.position.y=2.035;g.add(collar);
 volumen(g,shortMat,0,1.12,0,.30,.20,.18);
 const rodillas=[],codos=[];
 function pierna(sign){const hip=new THREE.Group();hip.position.set(sign*.16,1.15,0);g.add(hip);
  volumen(hip,shortMat,0,-.15,0,.145,.25,.16);volumen(hip,piel,0,-.34,0,.115,.20,.12);
  const knee=new THREE.Group();knee.position.y=-.51;hip.add(knee);volumen(knee,piel,0,0,0,.105,.105,.11);
  volumen(knee,sock,0,-.22,0,.09,.25,.10);volumen(knee,boot,0,-.48,.09,.12,.09,.22);
  rodillas.push(knee);return hip;
 }
 const piernaI=pierna(-1),piernaD=pierna(1);
 function brazo(sign){const shoulder=new THREE.Group();shoulder.position.set(sign*.37,1.91,0);shoulder.rotation.z=sign*.16;g.add(shoulder);
  volumen(shoulder,tela,sign*.025,-.10,0,.15,.20,.145);volumen(shoulder,piel,sign*.025,-.29,0,.095,.20,.10);
  const elbow=new THREE.Group();elbow.position.set(sign*.025,-.45,0);shoulder.add(elbow);volumen(elbow,piel,0,0,0,.085,.09,.085);volumen(elbow,piel,0,-.19,.025,.075,.19,.08);
  volumen(elbow,piel,0,-.39,.04,.073,.10,.045);volumen(elbow,piel,-sign*.062,-.38,.055,.025,.055,.03);
  for(let k=0;k<4;k++)volumen(elbow,piel,-.044+k*.029,-.48,.04,.013,.048,.019);
  elbow.rotation.x=-.18;codos.push(elbow);return shoulder;
 }
 const brazoI=brazo(-1),brazoD=brazo(1);
 // Cabeza lisa de una sola pieza, sin rasgos ni cabello.
 const cabeza=new THREE.Group();cabeza.position.set(0,2.30,0);g.add(cabeza);
 const cabezaLisa=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),piel);cabezaLisa.position.y=.04;cabezaLisa.scale.set(.175,.225,.172);cabeza.add(cabezaLisa);
 volumen(cabeza,piel,-.18,.025,0,.035,.06,.028);volumen(cabeza,piel,.18,.025,0,.035,.06,.028);

 if(!pla||gk){const badge=new THREE.Mesh(new THREE.PlaneGeometry(.115,.135),new THREE.MeshStandardMaterial({map:esc,transparent:true,roughness:.8}));badge.position.set(-.16,1.77,.177);g.add(badge);}
 const j={g,t,uniformeDisponible:!!pla,fase:Math.random()*9,pI:piernaI,pD:piernaD,bI:brazoI,bD:brazoD,cab:cabeza,rodillas,codos};
 const hit=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,4.4,8),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=2.1;hit.userData.j=j;g.add(hit);j.hit=hit;return j;
}


 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,30),renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputEncoding=THREE.sRGBEncoding;host.append(renderer.domElement);camera.position.set(0,1.4,5.3);camera.lookAt(0,1.25,0);scene.add(new THREE.HemisphereLight(0xffffff,0x405643,1.25));const key=new THREE.DirectionalLight(0xfff1dd,1.1);key.position.set(-3,5,5);scene.add(key);const fill=new THREE.DirectionalLight(0xc6e7ff,.45);fill.position.set(3,3,-2);scene.add(fill);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.8,.85,.08,48),new THREE.MeshStandardMaterial({color:0x203e32,roughness:.8}));base.position.y=.04;scene.add(base);const aro=new THREE.Mesh(new THREE.TorusGeometry(.79,.012,6,48),new THREE.MeshBasicMaterial({color:0x9ed665}));aro.rotation.x=Math.PI/2;aro.position.y=.086;scene.add(aro);
 let actual=null,frame=0,rotar=false,ultimo=0,gen=0,arrastre=null,disposed=false;const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 function ajustar(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();if(!frame)renderer.render(scene,camera);}
 const obs=new ResizeObserver(ajustar);obs.observe(host);
 function tick(t){if(disposed)return;const dt=Math.min((t-ultimo)/1000||0,.05);ultimo=t;if(actual){if(rotar)actual.g.rotation.y+=dt*.35;if(!reduced){actual.cab.position.y=2.30+Math.sin(t*.0018)*.008;actual.bI.rotation.x=-.05+Math.sin(t*.0015)*.015;actual.bD.rotation.x=-.05-Math.sin(t*.0015)*.015;}}renderer.render(scene,camera);frame=requestAnimationFrame(tick);}
 function detener(){cancelAnimationFrame(frame);frame=0;ultimo=0;arrastre=null;}
 function iniciar(){if(!frame&&!disposed&&!document.hidden){ajustar();frame=requestAnimationFrame(tick);}}
 function soltar(j){if(!j)return;const geos=new Set(),mats=new Set(),maps=new Set();j.g.traverse(o=>{if(o.geometry&&o.geometry!==anatomiaGeo)geos.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){mats.add(m);if(m.map&&m.map.isCanvasTexture&&!m.map.nl7Compartida)maps.add(m.map)}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());maps.forEach(m=>m.dispose());}
 host.addEventListener('pointerdown',e=>{if(!actual||e.button>0)return;arrastre={x:e.clientX,y:e.clientY,id:e.pointerId};rotar=false;$('eq-spin').textContent='Activar giro';$('eq-spin').setAttribute('aria-pressed','false')});
 host.addEventListener('pointermove',e=>{if(!arrastre||arrastre.id!==e.pointerId||!actual)return;const dx=e.clientX-arrastre.x,dy=e.clientY-arrastre.y;if(Math.abs(dx)>Math.abs(dy)){actual.g.rotation.y+=dx*.015;}arrastre.x=e.clientX;arrastre.y=e.clientY;});for(const event of ['pointerup','pointercancel','pointerleave'])host.addEventListener(event,()=>{arrastre=null});
 return {async mostrar(t,i,vigente){const n=++gen;detener();if(actual){scene.remove(actual.g);soltar(actual);actual=null;}const j=await jugador(t,i);if(n!==gen||!vigente()){soltar(j);return;}actual=j;actual.g.rotation.y=0;scene.add(j.g);rotar=false;ajustar();iniciar();return j;},detener,iniciar,girar(){rotar=!rotar;iniciar();return rotar;},frente(){rotar=false;if(actual)actual.g.rotation.y=0;iniciar();}};
}
cargarEquipos();
})();
