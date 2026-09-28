const P=6; // lanes
const laneX=[95,260,425,590,755,920];
const BW=150, BH=42;
const boxes=[];
const lines=[];
const labels=[];

// helper
function box(x,y,cls,title,sub){boxes.push({x:x-BW/2,y,cls,title,sub});}
function vline(x1,y1,x2,y2){lines.push({x1,y1,x2,y2});}

// ---- spine (centered 420) ----
const cx=420;
box(cx,44,'ctl','Telegram · Receive','trigger');
box(cx,104,'code','Extract message','raw_text · chat_id');
box(cx,164,'code','Fast route','/cmd · prompt grande');
box(cx,224,'ctl','Needs classification?','IF');
box(cx,344,'code','Parse intent','route · intent · conf');
box(cx,404,'ctl','Router','Switch · 8 salidas');
// hermes classify branch (right)
box(700,224,'http','Hermes · Classify','qwen 1.7b');

// spine connectors
vline(cx,86,cx,104);
vline(cx,146,cx,164);
vline(cx,206,cx,224);
// IF true -> Parse intent
vline(cx,266,cx,344); labels.push({x:cx+8,y:300,t:'decidido',anchor:'start'});
// IF false -> classify
lines.push({x1:cx+BW/2,y1:245,x2:700-BW/2,y2:245}); labels.push({x:600,y:238,t:'clasificar',anchor:'middle'});
// classify -> parse intent (elbow)
lines.push({x1:700,y1:266,x2:700,y2:310});
lines.push({x1:700,y1:310,x2:cx+BW/2,y2:310});
lines.push({x1:cx+BW/2-1,y1:310,x2:cx+BW/2-1,y2:344});
// parse intent -> router
vline(cx,386,cx,404);

// ---- lanes ----
const laneTop=520;
// lane defs: array of [cls,title,sub]
const lanes=[
 [['http','Hermes · Claude','sonnet / fallback'],['code','Parse Claude','response_text']],
 [['code','Build task','title · desc'],['http','Linear · Create issue','GraphQL'],['code','Parse task','✅ / ⚠️']],
 [['code','Build note','title · body'],['http','Hermes · Save note','note_save'],['code','Parse note','📝 / ⚠️']],
 [['code','Content Agent','TODO fase 4']],
 [['code','Progress Agent','TODO fase 5']],
 [['http','Hermes · Ollama','qwen 3.5b'],['code','Parse Ollama','response_text']],
];
const routeLbl=['CLAUDE','TASK','NOTE','CONTENT','PROGRESS','CHAT/SIMPLE·fb'];
const termBottom=[];
for(let i=0;i<P;i++){
  let y=laneTop;
  const lane=lanes[i];
  // router -> first box
  lines.push({x1:cx,y1:446,x2:laneX[i],y2:y}); 
  labels.push({x:laneX[i],y:y-6,t:routeLbl[i],anchor:'middle',small:true});
  for(let j=0;j<lane.length;j++){
    box(laneX[i],y,lane[j][0],lane[j][1],lane[j][2]);
    if(j>0) vline(laneX[i],y-18,laneX[i],y);
    y+=80;
  }
  termBottom.push(y-80+BH); // bottom of last box
}

// ---- merge bus ----
const busY=760;
for(let i=0;i<P;i++){ vline(laneX[i],termBottom[i],laneX[i],busY); }
lines.push({x1:laneX[0],y1:busY,x2:laneX[P-1],y2:busY});
box(cx,795,'code','Merge response','footer + icon');
vline(cx,busY,cx,795);
box(cx,865,'ctl','Telegram · Send','reply');
vline(cx,837,cx,865);

// ---- emit ----
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let s='';
s+=`<svg viewBox="0 0 1040 930" xmlns="http://www.w3.org/2000/svg" role="img" font-family="ui-sans-serif,system-ui,-apple-system,sans-serif">`;
s+=`<title>Cerebro workflow — code nodes and data flow</title>`;
s+=`<desc>Pipeline from Telegram through Fast route, classifier, Router and agent lanes to Merge and reply. Code nodes in blue, HTTP nodes in green, control nodes in gray.</desc>`;
s+=`<defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/></marker></defs>`;
s+=`<style>
.ln{stroke:#94a3b8;stroke-width:1.6;fill:none;marker-end:url(#a);}
.busln{stroke:#94a3b8;stroke-width:1.6;fill:none;}
text{fill:#e2e8f0;}
.t{font-size:13px;font-weight:600;}
.s{font-size:10px;fill:#cbd5e1;}
.rl{font-size:10px;font-weight:700;fill:#93c5fd;}
.lg{font-size:11px;fill:#94a3b8;}
.hd{font-size:16px;font-weight:700;fill:#94a3b8;}
.code rect{fill:#1e40af;stroke:#60a5fa;}
.http rect{fill:#166534;stroke:#4ade80;}
.ctl rect{fill:#3f3f46;stroke:#a1a1aa;}
rect{rx:8;stroke-width:1.4;}
</style>`;
// title
s+=`<text class="hd" x="24" y="30">Cerebro · flujo y Code nodes</text>`;
// legend
const lg=[['#1e40af','#60a5fa','Code node (JS)'],['#166534','#4ade80','HTTP Request'],['#3f3f46','#a1a1aa','Trigger / IF / Switch']];
let lx=660;
lg.forEach((g,i)=>{const y=18+i*20;s+=`<rect x="${lx}" y="${y}" width="14" height="14" rx="3" fill="${g[0]}" stroke="${g[1]}"/><text class="lg" x="${lx+20}" y="${y+11}">${g[2]}</text>`;});
// lines first
lines.forEach(l=>{const cls=(l.y1===l.y2&&l.x1!==cx)?'busln':(l.marker===false?'busln':'ln');s+=`<path class="${(l.y1===busY&&l.y2===busY)?'busln':'ln'}" d="M${l.x1},${l.y1} L${l.x2},${l.y2}"/>`;});
// labels
labels.forEach(l=>{s+=`<text class="${l.small?'rl':'s'}" x="${l.x}" y="${l.y}" text-anchor="${l.anchor}">${esc(l.t)}</text>`;});
// boxes
boxes.forEach(b=>{
  s+=`<g class="${b.cls}"><rect x="${b.x}" y="${b.y}" width="${BW}" height="${BH}"/>`;
  s+=`<text class="t" x="${b.x+BW/2}" y="${b.y+18}" text-anchor="middle">${esc(b.title)}</text>`;
  s+=`<text class="s" x="${b.x+BW/2}" y="${b.y+33}" text-anchor="middle">${esc(b.sub)}</text></g>`;
});
s+=`</svg>`;
require('fs').writeFileSync('cerebro_flow.svg',s);
console.log(s.length,'bytes written');
