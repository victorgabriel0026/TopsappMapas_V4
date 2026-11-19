var TYPES={cliente:{n:"Clientes",c:"var(--blue)"},chamado:{n:"Chamados",c:"var(--orange)"},viab:{n:"Viabilidades",c:"var(--green)"}};
var D=[
{id:1,t:"cliente",wx:-180,wy:630,x:0,y:0,name:"Mercado Bom Preço",addr:"Rua das Acácias, 45",plano:"Fibra 500 Mega",status:"Ativo",fat:"Em dia"},
{id:2,t:"cliente",wx:90,wy:810,x:0,y:0,name:"Clínica Vida",addr:"Av. dos Ipês, 800",plano:"Fibra 1 Giga",status:"Ativo",fat:"Em dia"},
{id:3,t:"cliente",wx:270,wy:450,x:0,y:0,name:"Maria Souza",addr:"Rua Pará, 12",plano:"Fibra 300 Mega",status:"Ativo",fat:"1 fatura vencida"},
{id:4,t:"cliente",wx:-270,wy:450,x:0,y:0,name:"Carlos Lima",addr:"Rua Bahia, 330",plano:"Fibra 200 Mega",status:"Suspenso",fat:"2 faturas vencidas"},
{id:5,t:"cliente",wx:0,wy:540,x:0,y:0,name:"Padaria Central",addr:"Rua Goiás, 77",plano:"Fibra 500 Mega",status:"Ativo",fat:"Em dia"},
{id:6,t:"chamado",wx:-90,wy:720,x:0,y:0,name:"Chamado #2847",addr:"Rua das Flores, 120",cli:"Ana Paula",tipo:"Sem conexão",status:"Em aberto"},
{id:7,t:"chamado",wx:180,wy:630,x:0,y:0,name:"Chamado #2851",addr:"Av. Principal, 1540",cli:"Escola Aprender",tipo:"Lentidão",status:"Em aberto"},
{id:8,t:"chamado",wx:270,wy:360,x:0,y:0,name:"Chamado #2839",addr:"Rua do Porto, 9",cli:"Pedro Alves",tipo:"Troca de roteador",status:"Em andamento"},
{id:9,t:"viab",wx:-180,wy:450,x:0,y:0,name:"Viabilidade #318",addr:"Rua Mato Grosso, 410",cli:"Novo cliente: Lucas M.",tipo:"Aguardando análise",status:"Pendente"},
{id:10,t:"viab",wx:0,wy:360,x:0,y:0,name:"Viabilidade #321",addr:"Rua Tocantins, 25",cli:"Novo cliente: Studio Foco",tipo:"Poste a 40 m",status:"Pendente"}
];
var off={},sel=null,q="",st={},navOn=false,tilt=false;var mode="3d",ME={x:0,y:0},MEw={x:45,y:540};var CAM={"3d": {"x": 0, "y": 0, "H": 300, "F": 420, "cy": 330, "t": 50}, "2d": {"x": 0, "y": 480, "H": 680, "F": 420, "cy": 300, "t": 90}};function proj(m,x,y,z){var c=CAM[m],t=c.t*Math.PI/180,dx=x-c.x,dy=y-c.y,dz=(z||0)-c.H,d=dy*Math.cos(t)-dz*Math.sin(t),u=dy*Math.sin(t)+dz*Math.cos(t);return [180+c.F*dx/d,c.cy-c.F*u/d]}
var $=function(i){return document.getElementById(i)};
var pins=$("pins"),sheet=$("sheet"),route=$("route"),toast=$("toast"),stage=$("stage");
function cur(p){return st[p.id]||p.status}
function byId(i){return D.filter(function(x){return x.id===i})[0]}
function esc(s){return String(s).replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}
function vis(p){if(off[p.t])return false;if(!q)return true;return (p.name+" "+p.addr+" "+(p.cli||"")).toLowerCase().indexOf(q)>-1}
var tt;function say(m){toast.textContent=m;toast.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove("on")},1800)}
function drawPins(){
var h="";D.forEach(function(p){if(!vis(p))return;var s=sel===p.id,r=s?15:11,c=TYPES[p.t].c;
h+='<g class="pin" data-id="'+p.id+'" style="cursor:pointer"><circle cx="'+p.x+'" cy="'+p.y+'" r="'+r+'" fill="'+c+'" stroke="#fff" stroke-width="'+(s?4:2.5)+'"/>';
if(p.t!=="cliente")h+='<text x="'+p.x+'" y="'+(p.y+4)+'" font-size="'+(s?13:11)+'" font-weight="600" fill="#fff" text-anchor="middle">'+(p.t==="chamado"?"!":"?")+'</text>';
h+='</g>'});
pins.innerHTML=h;
}
function badge(s){
var m={"Ativo":["--okb","--okt"],"Em dia":["--okb","--okt"],"Concluído":["--okb","--okt"],"Viável":["--okb","--okt"],"Suspenso":["--bad","--badt"],"Inviável":["--bad","--badt"]};
var k=m[s]||["--wb","--wt"];
return '<span class="badge" style="background:var('+k[0]+');color:var('+k[1]+')">'+esc(s)+'</span>';
}
var KIND={cliente:"Cliente",chamado:"Chamado",viab:"Viabilidade"};
function drawSheet(){
if(navOn){sheet.style.display="none";return}
sheet.style.display="";
if(sel===null){
route.setAttribute("d","");
var n=D.filter(vis).length;
sheet.innerHTML='<div class="handle"></div><div class="srch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="q" type="search" placeholder="Buscar no TopSapp" value="'+esc(q)+'"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg><div class="av">TS</div></div><p class="hint">'+n+' itens no mapa. Toque em um pin para ver os detalhes.</p>';
$("q").addEventListener("input",function(e){q=e.target.value.trim().toLowerCase();drawPins();var c=sheet.querySelector(".hint");if(c)c.textContent=D.filter(vis).length+" itens no mapa. Toque em um pin para ver os detalhes."});
return;
}
var p=byId(sel),s=cur(p),a1,info="";
if(p.t==="cliente"){info='<div><span>Plano</span><b>'+esc(p.plano)+'</b></div><div><span>Faturas</span><b>'+esc(p.fat)+'</b></div>';a1="Ver faturas"}
if(p.t==="chamado"){info='<div><span>Cliente</span><b>'+esc(p.cli)+'</b></div><div><span>Tipo</span><b>'+esc(p.tipo)+'</b></div>';a1=s==="Em aberto"?"Iniciar atendimento":s==="Em andamento"?"Concluir chamado":"Reabrir"}
if(p.t==="viab"){info='<div><span>Solicitante</span><b>'+esc(p.cli)+'</b></div><div><span>Análise</span><b>'+esc(p.tipo)+'</b></div>';a1=s==="Pendente"?"Marcar viável":s==="Viável"?"Marcar inviável":"Voltar a pendente"}
sheet.innerHTML='<div class="handle"></div><div class="row"><div><p class="t">'+esc(p.name)+'</p><p class="s">'+KIND[p.t]+' · <span class="lnk">'+esc(p.addr)+', Sinop</span></p>'+badge(s)+'</div><button class="x" id="bX" aria-label="Fechar">&#10005;</button></div><div class="info">'+info+'</div><div class="btns"><button class="p" id="b0">Rota</button><button id="b1">'+a1+'</button></div>';
$("bX").onclick=function(){sel=null;drawPins();drawSheet()};
$("b0").onclick=function(){startNav(p)};
$("b1").onclick=function(){act(p)};
var mx=(ME.x+p.x)/2,my=(ME.y+p.y)/2+20;
route.setAttribute("d","M"+ME.x+" "+ME.y+" Q"+mx+" "+my+" "+p.x+" "+p.y);
route.setAttribute("stroke-width","6");
}
function act(p){
var s=cur(p),n;
if(p.t==="cliente"){say("Abrindo faturas de "+p.name);return}
if(p.t==="chamado"){n=s==="Em aberto"?"Em andamento":s==="Em andamento"?"Concluído":"Em aberto"}
else{n=s==="Pendente"?"Viável":s==="Viável"?"Inviável":"Pendente"}
st[p.id]=n;say("Status: "+n);drawSheet();
}
function setTilt(v){}
function startNav(p){
navOn=true;$("s3d").style.display="none";$("s2d").style.display="none";$("imgNav").style.display="";pins.style.display="none";route.style.display="none";$("me").style.display="none";
var dx=p.wx-MEw.x,dy=p.wy-MEw.y,km=Math.sqrt(dx*dx+dy*dy)*0.004,min=Math.max(2,Math.ceil(km*3+1));
var d=new Date(Date.now()+min*60000);
$("ea").textContent=("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);
$("em").textContent=min;$("ek").textContent=km.toFixed(1).replace(".",",");
$("nd").textContent=Math.min(km,0.2).toFixed(1).replace(".",",")+" km";
$("ns").textContent=p.addr.split(",")[0];

["nav","sp","eta"].forEach(function(i){$(i).classList.add("on")});
document.querySelector(".ctl").style.display="none";$("layers").classList.remove("on");
drawSheet();
}
function endNav(){
navOn=false;showMode();$("imgNav").style.display="none";pins.style.display="";route.style.display="";$("me").style.display="";
["nav","sp","eta"].forEach(function(i){$(i).classList.remove("on")});
document.querySelector(".ctl").style.display="";
drawSheet();
}
$("bE").onclick=endNav;
$("bT").onclick=function(){mode=mode==="3d"?"2d":"3d";$("bT").textContent=mode==="3d"?"2D":"3D";showMode();placeAll();drawPins();drawSheet()};
$("bC").onclick=function(){say("Norte para cima")};
$("bG").onclick=function(){sel=null;drawPins();drawSheet();say("Centralizado na sua posição")};
$("bL").onclick=function(){$("layers").classList.toggle("on")};
var L=$("layers");
Object.keys(TYPES).forEach(function(k){
var b=document.createElement("button");b.className="lay";b.innerHTML='<i style="background:'+TYPES[k].c+'"></i>'+TYPES[k].n;
b.onclick=function(){off[k]=!off[k];b.classList.toggle("off",!!off[k]);var p=sel&&byId(sel);if(p&&!vis(p))sel=null;drawPins();drawSheet()};
L.appendChild(b);
});
pins.addEventListener("click",function(e){if(navOn)return;var g=e.target.closest(".pin");if(!g)return;sel=+g.dataset.id;drawPins();drawSheet()});
function showMode(){$("s3d").style.display=mode==="3d"?"":"none";$("s2d").style.display=mode==="2d"?"":"none"}
function placeAll(){D.forEach(function(p){var q=proj(mode,p.wx,p.wy,0);p.x=q[0];p.y=q[1]});var m=proj(mode,MEw.x,MEw.y,0);ME.x=m[0];ME.y=m[1];["me1","me2"].forEach(function(i){$(i).setAttribute("cx",ME.x);$(i).setAttribute("cy",ME.y)})}
placeAll();showMode();drawPins();drawSheet();
