/* Datos compartidos de Partidos y reportes. No altera IDs, JJL/JJV ni marcadores. */
(function(){
'use strict';
const text=v=>String(v==null?'':v).trim(),esc=v=>text(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const estado=p=>text(p.Estado).toLowerCase();
function fecha(v){const m=text(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(!m)return null;const d=new Date(+m[3],+m[2]-1,+m[1],12);return d.getFullYear()===+m[3]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[1]?d:null;}
const fmt=d=>d?[d.getDate(),d.getMonth()+1,d.getFullYear()].map((n,i)=>i<2?String(n).padStart(2,'0'):n).join('/'):'—';
const id=e=>text(e.ID_Equipo),involucra=(p,t)=>text(p.Equipo_Local)===text(t)||text(p.Equipo_Visita)===text(t);
function numero(p,lado){const n=Number(text(p[lado==='local'?'JJL':'JJV']));return Number.isInteger(n)&&n>0?n:null;}
function etiqueta(p,lado){const n=numero(p,lado);return `${n?'Juego '+n:'Juego sin número'} como ${lado==='local'?'local':'visitante'}`;}
function prevista(p,lado){
 for(const k of [lado==='local'?'Fecha_Original_Local':'Fecha_Original_Visitante','Fecha_Original','Fecha_Prevista','Fecha_Correspondiente']){const d=fecha(p[k]);if(d)return {d,origen:'Fecha original registrada'};}
 // Compatibilidad con la referencia anterior: solo si Jornada todavía existe explícitamente.
 const n=Number(text(p.Jornada));if(Number.isInteger(n)&&n>0){const d=fecha('20/09/2026');d.setDate(d.getDate()+7*(n-1));return {d,origen:'Referencia del calendario anterior'};}
 return {d:null,origen:'Sin fecha prevista registrada'};
}
function control(p,lado,hoy=new Date()){
 const a=prevista(p,lado),b=fecha(p.Fecha),e=estado(p);const corte=new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate(),12);
 if(e==='jugado'){if(!a.d||!b)return {texto:!a.d?'Sin referencia original':'Sin fecha real',clase:'sinref',...a};return {texto:b<a.d?'Adelantado':b>a.d?'Recuperado':'En fecha',clase:b<a.d?'adelantado':b>a.d?'recuperado':'enfecha',...a};}
 if(e.includes('cancel'))return {texto:'Cancelado',clase:'cancelado',...a};
 const atrasado=(a.d&&a.d<corte)||(b&&b<corte);
 return {texto:atrasado?(e==='programado'?'Atrasado · programado':'Atrasado'):e==='programado'?'Programado':'Pendiente de programar',clase:atrasado?'atrasado':e==='programado'?'programado':'pendiente',...a};
}
function correcciones(lista){return lista.map(p=>{const q={...p},c=({'28':['5','12'],'70':['6','7']})[text(p.ID_Partido)];if(c){if(text(p.Penales)===text(p.Equipo_Local))q.Penales=c[0];else if(text(p.Penales)===text(p.Equipo_Visita))q.Penales=c[1];q.Equipo_Local=c[0];q.Equipo_Visita=c[1];}return q;});}
function esCubierto(p,equipos){
 const norm=s=>text(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const a=equipos.find(e=>norm(e.Nombre)==='deportivo azul'),b=equipos.find(e=>norm(e.Nombre)==='puebla 450');
 return estado(p)!=='jugado'&&a&&b&&involucra(p,id(a))&&involucra(p,id(b));
}
function resumen(partidos,t){const a=partidos.filter(p=>involucra(p,t)&&!estado(p).includes('cancel'));const jug=a.filter(p=>estado(p)==='jugado');return {total:a.length,jugados:jug.length,local:jug.filter(p=>text(p.Equipo_Local)===text(t)).length,visita:jug.filter(p=>text(p.Equipo_Visita)===text(t)).length,programados:a.filter(p=>estado(p)==='programado').length,pendientes:a.filter(p=>!['jugado','programado'].includes(estado(p))).length};}
function balance(r,e,contados=0){
 const nombre=text(e&&e.Nombre).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const especial=nombre.includes('galacticos'),meta=especial?null:15;
 const acreditados=r.jugados+contados,faltan=meta===null?null:Math.max(0,meta-acreditados);
 const registrados=r.total+contados;
 return {meta,especial,acreditados,faltan,registrados,excedentes:meta===null?0:Math.max(0,registrados-meta),sinCruce:meta===null?0:Math.max(0,meta-registrados),cupoProgramar:meta===null?null:Math.max(0,meta-acreditados-r.programados)};
}
function resumenHTML(r,e,contados=0){
 const b=balance(r,e,contados);
 return `<div class="juego-resumen"><strong>${r.jugados} jugados${contados?' + '+contados+' contado por regla especial':''} · ${b.especial?'Galácticos: formato por definir':b.faltan+' por jugar para completar 15'}</strong><div>${r.local} de local · ${r.visita} de visitante · ${r.programados} programados</div>${b.excedentes?`<div>Hay ${b.excedentes} cruce${b.excedentes===1?'':'s'} de más registrado${b.excedentes===1?'':'s'}; por revisar, sin eliminar partidos.</div>`:''}${b.sinCruce?`<div>Faltan ${b.sinCruce} cruces por registrar para completar el calendario.</div>`:''}</div>`;
}
function meta(p){return `${etiqueta(p,'local')} / ${etiqueta(p,'visita')}`;}
function fechasHTML(p){return ['local','visita'].map(l=>{const a=prevista(p,l);return a.d?`<span>${l==='local'?'Local':'Visitante'}: le correspondía ${esc(fmt(a.d))}</span>`:'';}).join('');}
function tarjetasExtra(p){return `<div class="juego-detalle">${fechasHTML(p)}<span>${esc(control(p,'local').texto)}${control(p,'local').texto!==control(p,'visita').texto?' / '+esc(control(p,'visita').texto):''}</span></div>`;}
function tabla(partidos,equipos,t){const E=Object.fromEntries(equipos.map(e=>[id(e),e.Nombre]));const filas=partidos.map(p=>{const local=!t||text(p.Equipo_Local)===text(t),lado=local?'local':'visita',c=control(p,lado),played=estado(p)==='jugado';return `<tr><td>${esc(p.ID_Partido)}</td><td>${esc(E[text(p.Equipo_Local)]||p.Equipo_Local)}<small>${esc(etiqueta(p,'local'))}</small></td><td>${esc(E[text(p.Equipo_Visita)]||p.Equipo_Visita)}<small>${esc(etiqueta(p,'visita'))}</small></td><td>${t?esc(fmt(c.d)):['local','visita'].map(l=>`${l==='local'?'L':'V'}: ${esc(fmt(prevista(p,l).d))}`).join('<br>')}</td><td>${esc(p.Fecha||'Por definir')}<small>${esc(p.Hora||'')} ${esc(p.Cancha||'')}</small></td><td>${played?esc(p.Goles_Local)+' – '+esc(p.Goles_Visita):'—'}<small>${esc(p.Ganado_Por||'')}</small></td><td>${esc(p.Estado)}<small>${esc(c.texto)}${!t&&c.texto!==control(p,'visita').texto?' / '+esc(control(p,'visita').texto):''}</small></td></tr>`;}).join('');return `<table class="jg-tabla"><thead><tr><th>ID</th><th>Local</th><th>Visitante</th><th>Le correspondía</th><th>Fecha real / programada</th><th>Marcador</th><th>Estado / control</th></tr></thead><tbody>${filas||'<tr><td colspan="7">Sin partidos.</td></tr>'}</tbody></table>`;}
function documento(titulo,contenido){return `<div class="rq-doc" style="width:1000px"><style>.jg-tabla{width:100%;border-collapse:collapse;font:12px Arial;color:#182a22;margin:14px 0}.jg-tabla th{background:#153323;color:white;padding:10px 6px}.jg-tabla td{padding:10px 6px;border-bottom:1px solid #cbd8ce;overflow-wrap:anywhere}.jg-tabla small{display:block;color:#526458;margin-top:4px}.jg-nota{background:#f1f5ee;padding:12px;font:12px/1.5 Arial;color:#415241}.jg-resumen{display:flex;flex-wrap:wrap;gap:12px;padding:14px;background:#edf4e9;color:#143220;font:14px Arial}.jg-title{font:bold 23px Arial;color:#143220;margin:0 0 14px}</style><div style="padding:24px;background:white;color:#172c20"><h1 class="jg-title">${esc(titulo)} · Next Level 7</h1>${contenido}<p class="jg-nota">JJL = número de juego del equipo local; JJV = número de juego del visitante. Los números se toman de la hoja y no se recalculan al filtrar. La fecha prevista se muestra únicamente si está registrada o existe la referencia del calendario anterior. Un dato faltante no se convierte en una fecha supuesta. Los partidos dobles conservan sus ID y sus horarios.</p></div></div>`;}
function controlFechas(partidos,equipos,valor){
 const corte=fecha(valor);if(!corte)return null;const inicio=fecha('20/09/2026'),dias=Math.round((corte-inicio)/86400000);
 const antes=Math.min(15,Math.max(0,Math.ceil(dias/7))),alCierre=Math.min(15,Math.max(0,Math.floor(dias/7)+1)),act=equipos.filter(e=>text(e.Status).toLowerCase()==='activo');
 const lista=act.map(e=>{const t=id(e),r=partidos.filter(p=>involucra(p,t)&&!esCubierto(p,equipos));const sinfecha=r.filter(p=>estado(p)==='jugado'&&!fecha(p.Fecha)).length;
 const nombre=text(e.Nombre).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),contado=nombre==='deportivo azul'&&corte>inicio?1:0;
 const previos=r.filter(p=>estado(p)==='jugado'&&fecha(p.Fecha)&&fecha(p.Fecha)<corte).length+contado;
 const delDia=r.filter(p=>['jugado','programado'].includes(estado(p))&&p.Fecha===valor).length;
 const especial=nombre.includes('galacticos');return {equipo:e.Nombre,antes:previos,delDia,esperadosAntes:antes,esperadosCierre:alCierre,atrasados:especial||sinfecha?null:Math.max(0,antes-previos),quedarian:especial||sinfecha?null:Math.max(0,alCierre-previos-delDia),especial,sinfecha};});
 return {fecha:valor,antes,alCierre,equipos:lista};
}
function leyendaFechas(partidos,equipos,valor){const d=controlFechas(partidos,equipos,valor);if(!d)return '';const atrasados=d.equipos.filter(e=>e.atrasados>0),res=atrasados.map(e=>`<div><b>${esc(e.equipo)}</b>: ${e.antes} jugados/contados; faltan <b>${e.atrasados}</b> para estar al corriente antes de esta fecha. ${e.delDia} en esta fecha; ${e.quedarian} quedarían atrasados si se juegan los programados.</div>`).join('');
 return `<div style="font-size:16px;font-weight:bold;color:#b5e874;margin-bottom:8px">Control de juegos por fechas · ${esc(valor)}</div><div>Antes de esta fecha debían llevar <b>${d.antes}</b> juegos; al concluirla, <b>${d.alCierre}</b>. Se conserva el inicio del torneo: 20/09/2026, un juego por domingo y meta de 15.</div><div style="margin-top:8px">${res||'Sin atraso por cantidad de juegos antes de esta fecha entre los equipos con fechas completas.'}</div><div style="margin-top:8px;color:#d5dfcc">Los partidos jugados contra bajas cuentan. Deportivo Azul conserva su juego contado. Galácticos: caso especial, sin atraso automático. Este control compara cantidades a la fecha; no asigna una fecha original a cada ID.</div>`;}

window.NL7Juegos={controlFechas,leyendaFechas,text,esc,estado,esCubierto,balance,resumenHTML,fecha,fmt,id,involucra,numero,etiqueta,prevista,control,correcciones,resumen,meta,fechasHTML,tarjetasExtra,tabla,documento};
})();

