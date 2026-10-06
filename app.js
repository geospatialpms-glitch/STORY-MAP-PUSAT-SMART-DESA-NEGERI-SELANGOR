
let APP = {data:null,map:null,markers:[],selected:null};

const $ = s => document.querySelector(s);
function markerColor(x){ return x.priority ? '#f4b51b' : x.shortlisted ? '#7c3aed' : '#0a72b8'; }
function markerIcon(x){
  const c=markerColor(x);
  return L.divIcon({
    className:'',
    html:`<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${c};border:3px solid white;box-shadow:0 5px 12px #082e4d55"><span style="display:block;transform:rotate(45deg);text-align:center;color:white;font-weight:900;font-size:13px;line-height:24px">⌂</span></div>`,
    iconSize:[30,30],iconAnchor:[15,30]
  });
}
function profile(x){
  APP.selected=x;
  $('#pName').textContent=x.name;
  $('#pDistrict').textContent=x.district;
  $('#pMukim').textContent=x.mukim||'—';
  $('#pDun').textContent=x.dun||'—';
  $('#pStatus').textContent=x.status;
  $('#pCoord').textContent=(x.lat||0).toFixed(4)+', '+(x.lng||0).toFixed(4)+'*';
  $('#pSummary').textContent=x.summary || 'Maklumat profil terperinci akan diisi berdasarkan data rasmi.';
  $('#pDetails').textContent=x.details || 'Profil terperinci, aktiviti, KPI dan galeri rasmi akan dipaparkan selepas pengesahan data.';
  $('#pChips').innerHTML=(x.components||['Maklumat akan dikemas kini']).map(c=>`<span class="chip">${c}</span>`).join('');
  $('#profileImage').textContent='FOTO RASMI • '+x.name.toUpperCase();
}
function drawMarkers(list){
  APP.markers.forEach(m=>m.remove()); APP.markers=[];
  list.forEach(x=>{
    const m=L.marker([x.lat,x.lng],{icon:markerIcon(x)}).addTo(APP.map);
    m.bindTooltip(x.name,{direction:'top',offset:[0,-24]});
    m.on('click',()=>{profile(x);APP.map.setView([x.lat,x.lng],11,{animate:true})});
    APP.markers.push(m);
  });
  $('#count').textContent=list.length+' lokasi dipaparkan';
}
function filtered(){
  const q=$('#search').value.trim().toLowerCase(), d=$('#district').value, s=$('#status').value;
  return APP.data.locations.filter(x=>(!q||(x.name+' '+x.district+' '+(x.dun||'')).toLowerCase().includes(q))&&(!d||x.district===d)&&(!s||x.status===s));
}
function apply(){const f=filtered();drawMarkers(f);renderList(f);}
function renderList(list){
  const el=$('#siteCards');el.innerHTML='';
  const featured=list.filter(x=>x.shortlisted).slice(0,6);
  (featured.length?featured:list.slice(0,6)).forEach(x=>{
    const c=document.createElement('article');c.className='siteCard';
    c.innerHTML=`<div class="siteImg">FOTO RASMI<br>${x.name}</div><div class="siteBody"><span class="tag">${x.district} • ${x.status}</span><span class="siteArrow">→</span><h4>${x.name}</h4><p>${x.summary||'Profil akan dikemas kini dengan data rasmi.'}</p></div>`;
    c.onclick=()=>{profile(x);$('#mapSection').scrollIntoView({behavior:'smooth'});APP.map.setView([x.lat,x.lng],11,{animate:true})};
    el.appendChild(c);
  });
}
async function init(){
  APP.data=await fetch('data.json').then(r=>r.json());
  APP.map=L.map('map',{zoomControl:true}).setView([3.12,101.55],9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(APP.map);
  const ds=[...new Set(APP.data.locations.map(x=>x.district))].sort();
  ds.forEach(d=>{const o=document.createElement('option');o.value=d;o.textContent=d;$('#district').appendChild(o)});
  $('#total').textContent=APP.data.locations.length;
  $('#short').textContent=APP.data.locations.filter(x=>x.shortlisted).length;
  $('#priority').textContent=APP.data.locations.filter(x=>x.priority).length;
  drawMarkers(APP.data.locations); renderList(APP.data.locations);
  profile(APP.data.locations[0]);
  $('#search').oninput=apply;$('#district').onchange=apply;$('#status').onchange=apply;
  $('#reset').onclick=()=>{$('#search').value='';$('#district').value='';$('#status').value='';apply()};
}
init();
