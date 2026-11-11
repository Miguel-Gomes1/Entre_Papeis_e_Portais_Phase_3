import type { Ending, Gallery, RunState, StoryData } from '../engine/types';
import { available, choose, fresh, textFor, yearStep } from '../engine/narrative';
import { SaveService } from '../engine/storage';

export interface VisualAdapter { show(art:string, mode:'home'|'game'|'cinema'):void; }
const $=<T extends HTMLElement=HTMLElement>(id:string):T=>{
  const el=document.getElementById(id);
  if(!el)throw new Error(`Elemento de interface ausente: ${id}`);
  return el as T;
};
const safe=(val:unknown):string=>String(val).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const PAGE:Record<string,[string,string]>={
 porto_1822:['PORTO DO RECIFE','RECIFE • PERNAMBUCO'],salvador_1823:['RUA DE SALVADOR','BAHIA'],
 assembleia_1823:['ASSEMBLEIA CONSTITUINTE','RIO DE JANEIRO'],olinda_1824:['RUAS DE OLINDA','PERNAMBUCO'],
 tipografia_1824:['OFICINA TIPOGRÁFICA','RECIFE'],corte_1825:['GABINETE IMPERIAL','RIO DE JANEIRO'],
 cisplatina_1828:['NAVIOS NO RIO DA PRATA','REGIÃO DA CISPLATINA'],ruas_1831:['RUAS DO RIO','RIO DE JANEIRO'],
 portal_atualidade:['PASSAGEM TEMPORAL','ENTRE O PASSADO E O PRESENTE']
};
const SOURCES:[string,string][]=[
 ['Senado Federal — História do Primeiro Reinado','https://www.senado.leg.br/senado/hotsites/histsf/Primeiro-Reinado.asp'],
 ['Senado — Constituições brasileiras','https://www25.senado.leg.br/web/atividade/anais/constituintes'],
 ['Arquivo Nacional — Independência na Bahia','https://www.gov.br/arquivonacional/pt-br/sites_eventos/sites-tematicos-1/brasil-oitocentista/especial-bicentenario-da-independencia/apontamentos-sobre-a-independencia-do-brasil-na-bahia'],
 ['Fundação Joaquim Nabuco — Typhis Pernambucano','https://pesquisaescolar.fundaj.gov.br/pt-br/artigo/typhis-pernambucano-jornal/'],
 ['Arquivo Nacional — Cisplatina','https://www.gov.br/arquivonacional/pt-br/sites_eventos/sites-tematicos-1/brasil-oitocentista/conheca-o-acervo/cisplatina-1a'],
 ['Câmara — História do Parlamento','https://especial.camara.leg.br/historia-200-anos-da-camara-dos-deputados/']
];

export class UIController {
 private storage=new SaveService();
 private state:RunState|null;
 private cards:Gallery;
 private page:'home'|'game'='home';
 private modalOpen=false;
 private cinema:{id:string;replay:boolean}|null=null;
 private cinemaIdx=0;
 private voice=false;
 constructor(private readonly data:StoryData,private readonly visual:VisualAdapter){
   this.state=this.storage.load(data);this.cards=this.storage.gallery(data);
 }
 private art(art:string):string{return `/assets/${art}.webp`;}
 private progress():string{return `${Object.keys(this.cards).length} / ${Object.keys(this.data.endings).length}`;}
 private updateCounts():void{
  $('headerProgress').textContent=`${Object.keys(this.cards).length}/${Object.keys(this.data.endings).length}`;
  $('homeGalleryProgress').textContent=this.progress();
 }
 private save():void {
  if(!this.state)return;
  const ok=this.storage.save(this.state);
  $('saveLabel').textContent=ok?'● SALVO NESTE NAVEGADOR':'⚠ SALVAMENTO INDISPONÍVEL';
 }
 private renderHome():void{
  this.page='home';$('homeScreen').hidden=false;$('gameScreen').hidden=true;
  ($<HTMLButtonElement>('continueGame')).disabled=!this.state;
  this.updateCounts();this.visual.show('porto_1822','home');window.scrollTo?.(0,0);
 }
 private openGame():void{
  if(!this.state)this.state=fresh();
  this.page='game';$('homeScreen').hidden=true;$('gameScreen').hidden=false;
  this.renderNode();window.scrollTo?.(0,0);
 }
 private renderNode():void{
  if(!this.state||!this.data.nodes[this.state.node]) {this.renderHome();return;}
  const n=this.data.nodes[this.state.node];const txt=textFor(n,this.state);
  const sceneImg=$<HTMLImageElement>('sceneImage');sceneImg.src=this.art(n.where);
  sceneImg.alt=`Cenário em pixel art: ${PAGE[n.where]?.[0]?.toLocaleLowerCase('pt-BR')||n.where}`;
  $('scenePlace').textContent=PAGE[n.where]?.[0]||n.where;
  $('sceneLocation').textContent=PAGE[n.where]?.[1]||'';
  $('sceneYear').textContent=n.year;
  $('chapterEyebrow').textContent=n.chapter;
  $<HTMLElement>('timelineFill').style.width=`${Math.round((yearStep(n)+1)/8*100)}%`;
  $('storyChapter').textContent=n.chapter;$('speaker').textContent=n.speaker;$('storyBody').textContent=txt;
  $('docCount').textContent=`${this.state.docs.length} / ${Object.keys(this.data.docs).length}`;
  const list=$('choices');list.replaceChildren();
  available(n,this.state).forEach((c,i)=>{
    const b=document.createElement('button');b.type='button';b.className='choice';b.dataset.choice=String(i);
    b.innerHTML=`<span class="choice-number">${i+1}</span><span class="choice-text">${safe(c.label)}</span><span class="choice-arrow" aria-hidden="true">›</span>`;
    b.addEventListener('click',()=>this.choose(i));list.appendChild(b);
  });
  $('timelineText').textContent=`1822 — 1831  •  ${n.chapter}  •  ${this.state.docs.length} DOCUMENTOS`;
  this.visual.show(n.where,'game');this.save();
 }
 private say(message:string):void{
  if(!this.voice||!('speechSynthesis' in window))return;
  try{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(message);utterance.lang='pt-BR';utterance.rate=.95;speechSynthesis.speak(utterance);}catch{}
 }
 private choose(index:number):void{
  if(!this.state||this.page!=='game'||this.modalOpen||this.cinema)return;
  const n=this.data.nodes[this.state.node];const c=available(n,this.state)[index];if(!c)return;
  choose(this.state,c,this.data);
  if(c.to.startsWith('@')){this.save();this.startCinema(c.to.slice(1),false);return;}
  this.renderNode();this.say(textFor(this.data.nodes[this.state.node],this.state));
  if(window.innerWidth<850)document.querySelector('.story-column')?.scrollIntoView({block:'start',behavior:'instant'});
 }
 private startNew():void{
  if(this.state&&!window.confirm('Começar outra jornada? A partida anterior será substituída, mas suas cartas de finais serão mantidas.'))return;
  this.state=fresh();this.save();this.closeModal();this.openGame();
 }
 private closeModal():void{
  this.modalOpen=false;$('modal').hidden=true;document.body.style.overflow=this.cinema?'hidden':'';
 }
 private modal(title:string,html:string):void{
  this.modalOpen=true;$('modalHeading').textContent=title;$('modalContent').innerHTML=html;
  $('modal').hidden=false;document.body.style.overflow='hidden';$<HTMLButtonElement>('modalClose').focus();
 }
 private gallery():void{
  this.updateCounts();let html=`<p class="modal-intro">Cada carta é conquistada ao chegar a um final. Toque numa carta revelada para <strong>rever a cutscene completa</strong>. Começar outra rota não apaga as cartas.</p><div class="cards-overview"><b>${this.progress()}</b><span>FINAIS DESCOBERTOS · CARTAS SALVAS NESTE NAVEGADOR</span></div><div class="cards-grid">`;
  Object.entries(this.data.endings).forEach(([id,e],index)=>{
    const unlocked=Boolean(this.cards[id]);html+=`<button type="button" class="ending-card ${unlocked?'':'locked'}" ${unlocked?`data-ending="${id}" aria-label="Rever cutscene ${safe(e.name)}"`:'disabled aria-label="Final ainda não descoberto"'}><div class="card-art">${unlocked?`<img loading="lazy" alt="" src="${this.art(e.art)}"><span class="card-art-icon">${safe(e.icon)}</span>`:''}</div><div class="card-info"><span class="card-no">CARTA ${String(index+1).padStart(2,'0')} · ${unlocked?safe(e.rarity.toUpperCase()):'NÃO DESCOBERTA'}</span><strong class="card-name">${unlocked?safe(e.name):'???'}</strong><span class="card-hint">${unlocked?'▶ REVER CUTSCENE':'◇ CARTA BLOQUEADA'}</span></div></button>`;
  });html+='</div>';
  this.modal('CARTAS DOS FINAIS',html);
  $('modalContent').querySelectorAll<HTMLElement>('[data-ending]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.ending;if(id&&this.cards[id]){this.closeModal();this.startCinema(id,true);}
  }));
 }
 private diary():void{
  const count=this.state?.docs.length||0;
  let html=`<p class="modal-intro">Arquivo do viajante — ${count} de ${Object.keys(this.data.docs).length} papéis coletados. Cada ficha distingue <strong>fatos históricos</strong> de documentos criados para a aventura.</p>`;
  if(this.state&&this.data.nodes[this.state.node]){
   const n=this.data.nodes[this.state.node];const names:Record<string,string>={provincias:'Províncias',corte:'Corte imperial',imprensa:'Imprensa',povo:'Vida cotidiana',mar:'Conflitos marítimos'};
   html+=`<div class="modal-note"><strong>Última cena:</strong> ${safe(n.chapter)} · ${safe(n.year)}<br><strong>Perspectiva atual:</strong> ${safe(names[this.state.focus]||'Em formação')}<br><strong>Seus interesses:</strong> investigação ${this.state.meters.saber}, análise ${this.state.meters.prudencia}, escuta ${this.state.meters.escuta}, pressa ${this.state.meters.pressa}.</div>`;
  }
  html+='<div class="doc-list">';
  for(const [id,d] of Object.entries(this.data.docs)) {
    const open=this.state?.docs.includes(id);
    html+=open?`<article class="document-card"><span class="doc-label">${safe(d.category)} · ${safe(d.date)}</span><h3>${safe(d.name)}</h3><p>${safe(d.fact)}</p><p class="fiction">✧ ${safe(d.fiction)}</p></article>`:'<article class="document-card locked"><span class="doc-label">DOCUMENTO NÃO ENCONTRADO</span><h3>✧ &nbsp; ???</h3></article>';
  }
  html+='</div>';this.modal('ARQUIVO HISTÓRICO',html);
 }
 private about():void{
  let html=`<p class="modal-intro">Entre Papéis & Portais é uma <strong>ficção histórica interativa</strong> ambientada entre 1822 e 1831. Os personagens, os papéis e o portal são ficcionais; a cronologia histórica não muda com suas escolhas.</p><div class="modal-note"><strong>Como jogar:</strong> mouse, toque ou teclas 1–9 para escolher. O progresso fica salvo neste navegador, sem cadastro. Agora é possível exportar e importar seu progresso pelo menu.<br><strong>Compatibilidade:</strong> navegadores modernos de computador e celular; a versão 3.0 usa a engine Phaser 4.</div><h3>Linha do tempo</h3><p>1822 · Independência<br>1823 · Lutas na Bahia e dissolução da Constituinte<br>1824 · Constituição e Confederação do Equador<br>1825 · Reconhecimento por Portugal<br>1826 · Início da primeira legislatura<br>1825–1828 · Guerra da Cisplatina<br>1829–1830 · Crise e debates públicos<br>1831 · Abdicação</p><h3>Fontes históricas de referência</h3><ul class="modal-links">`;
  for(const [label,url] of SOURCES)html+=`<li><a href="${url}" target="_blank" rel="noreferrer noopener">${safe(label)}</a></li>`;
  html+='</ul><p style="font-size:12px">A arte pixelada é estilizada, não uma reconstrução exata de ruas ou edifícios.</p>';
  this.modal('CONTEXTO E FONTES',html);
 }
 private options():void{
  const html=`<div class="modal-action-list"><button type="button" class="modal-btn" data-action="resume">▶ Continuar a partida</button><button type="button" class="modal-btn" data-action="gallery">◇ Cartas dos finais (${this.progress()})</button><button type="button" class="modal-btn" data-action="diary">▤ Arquivo e documentos</button><button type="button" class="modal-btn" data-action="backup">↓ Exportar progresso (JSON)</button><button type="button" class="modal-btn" data-action="restore">↑ Importar progresso (JSON)</button><button type="button" class="modal-btn" data-action="about">ⓘ Como jogar e fontes</button><button type="button" class="modal-btn" data-action="home">⌂ Ir à tela inicial</button><button type="button" class="modal-btn" data-action="new">↺ Nova jornada (mantém as cartas)</button></div>`;
  this.modal('MENU DO VIAJANTE',html);
  $('modalContent').querySelectorAll<HTMLElement>('[data-action]').forEach(b=>b.addEventListener('click',()=>{
    const action=b.dataset.action;if(action==='backup'){this.exportSave();return;}
    if(action==='restore'){void this.importSave();return;}
    this.closeModal();
    if(action==='resume')this.openGame();
    else if(action==='gallery')this.gallery();
    else if(action==='diary')this.diary();
    else if(action==='about')this.about();
    else if(action==='home')this.renderHome();
    else if(action==='new')this.startNew();
  }));
 }
 private exportSave():void{
  const blob=new Blob([this.storage.backup(this.state,this.cards)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;
  anchor.download='entre-papeis-e-portais-salvamento.json';document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 private async importSave():Promise<void>{
  const chooser=document.createElement('input');chooser.type='file';chooser.accept='.json,application/json';
  chooser.onchange=async()=>{
    const file=chooser.files?.[0];if(!file)return;
    try{
      const parsed:unknown=JSON.parse(await file.text());
      if(!this.state||window.confirm('Importar este progresso? O progresso local atual será substituído.')){
        const result=this.storage.restore(parsed,this.data);
        if(!result){window.alert('Arquivo de salvamento inválido.');return;}
        this.state=result.state;this.cards=result.gallery;this.closeModal();this.renderHome();
        window.alert('Progresso importado.');
      }
    }catch{window.alert('Não foi possível ler este arquivo JSON.');}
  };
  chooser.click();
 }
 private startCinema(id:string,replay:boolean):void{
  const ending=this.data.endings[id];if(!ending)return;
  if(!replay){this.storage.unlock(id,this.cards);if(this.state){this.state.lastEnding=id;this.save();}}
  this.cinema={id,replay};this.cinemaIdx=0;this.closeModal();$('cinema').hidden=false;
  document.body.style.overflow='hidden';this.renderCinema();
 }
 private renderCinema():void{
  if(!this.cinema)return;
  const e:Ending=this.data.endings[this.cinema.id];const frames=e.frames;
  const [art,subtitle,description]=frames[this.cinemaIdx];
  const img=$<HTMLImageElement>('cinemaImage');img.src=this.art(art);img.alt=`Pixel art: ${PAGE[art]?.[0]||art}`;
  $('cinemaPosition').textContent=`CENA ${this.cinemaIdx+1} / ${frames.length}`;
  $('cinemaSubtitle').textContent=subtitle;
  $('cinemaTitle').textContent=this.cinemaIdx===frames.length-1?e.name:subtitle;
  $('cinemaText').textContent=description;
  $('cinemaNext').textContent=this.cinemaIdx===frames.length-1?'CONCLUIR  ✦':'CONTINUAR  →';
  const dialogue=$<HTMLElement>('cinema').querySelector<HTMLElement>('.cinema-dialogue');
  if(dialogue){dialogue.style.animation='none';void dialogue.offsetWidth;dialogue.style.animation='';}
  this.visual.show(art,'cinema');$<HTMLButtonElement>('cinemaNext').focus();
 }
 private cinemaNext():void{
  if(!this.cinema)return;const len=this.data.endings[this.cinema.id].frames.length;
  if(this.cinemaIdx<len-1){this.cinemaIdx++;this.renderCinema();}
  else this.finishCinema();
 }
 private finishCinema():void{
  if(!this.cinema)return;const {replay,id}=this.cinema;
  this.cinema=null;$('cinema').hidden=true;document.body.style.overflow='';
  if(replay){this.renderHome();this.gallery();return;}
  this.renderHome();
  this.modal('CARTA DESCOBERTA',`<div class="modal-note"><strong>✦ ${safe(this.data.endings[id].name)}</strong><p>Esse final foi adicionado à sua coleção. Sua cutscene pode ser vista novamente quando quiser.</p></div><div class="modal-action-list"><button type="button" class="modal-btn" id="viewCardsNow">◇ Ver cartas dos finais</button><button type="button" class="modal-btn" id="again">↺ Explorar outra rota</button><button type="button" class="modal-btn" id="backHome">⌂ Voltar ao menu</button></div>`);
  $('viewCardsNow').onclick=()=>this.gallery();$('again').onclick=()=>{this.closeModal();this.startNew();};$('backHome').onclick=()=>this.closeModal();
 }
 install():void{
  $('newGame').onclick=()=>this.startNew();$('continueGame').onclick=()=>this.openGame();
  $('homeGallery').onclick=()=>this.gallery();$('homeSources').onclick=()=>this.about();
  $('navHome').onclick=()=>{this.closeModal();if(this.cinema)this.finishCinema();this.renderHome();};
  $('navCards').onclick=()=>this.gallery();$('navDiary').onclick=()=>this.diary();$('navMenu').onclick=()=>this.options();$('gameDiary').onclick=()=>this.diary();
  $('modalClose').onclick=()=>this.closeModal();$('modal').addEventListener('click',e=>{if(e.target===$('modal'))this.closeModal();});
  $('cinemaNext').onclick=()=>this.cinemaNext();$('cinemaSkip').onclick=()=>this.finishCinema();
  $('voiceButton').onclick=()=>{
    this.voice=!this.voice;$('voiceButton').textContent=this.voice?'◖♪':'◖))';
    $('voiceButton').setAttribute('aria-label',this.voice?'Desativar leitura por voz':'Ativar leitura por voz');
    if(!this.voice){try{speechSynthesis.cancel();}catch{}}
    else if(this.state&&this.data.nodes[this.state.node])this.say(textFor(this.data.nodes[this.state.node],this.state));
  };
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(this.cinema){this.finishCinema();return;}if(this.modalOpen){this.closeModal();return;}if(this.page==='game'){this.renderHome();return;}}
    if(this.cinema){if(e.key==='ArrowRight'){e.preventDefault();this.cinemaNext();}return;}
    if(this.modalOpen)return;
    if(this.page==='game'&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&/^[1-9]$/.test(e.key)){
      const i=Number(e.key)-1;if($('choices').children[i]){e.preventDefault();this.choose(i);}
    }
    if(this.page==='game'&&e.key.toLowerCase()==='d')this.diary();
  });
  // Bridge exposed solely for deterministic QA (do not enable on production URLs).
  if(['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('qa')){
    Object.assign(window,{__PR_QA__:{getState:()=>structuredClone(this.state),getGallery:()=>Object.keys(this.cards),getNode:(id:string)=>this.data.nodes[id],allNodes:()=>Object.keys(this.data.nodes),endings:()=>Object.keys(this.data.endings)}});
  }
  this.renderHome();
 }
}
