import type { Choice, Effects, RunState, StoryData, StoryNode } from './types';

export const SAVE_KEY = 'epp_reinado_run_v2';
export const GALLERY_KEY = 'epp_reinado_ending_cards_v2';
export function fresh(): RunState {
  return { v:3,node:'p1',docs:[],flags:{},meters:{saber:0,prudencia:0,escuta:0,pressa:0},focus:'',visited:[],trace:[],lastEnding:null };
}
const ALLOWED_FLAGS = ['viu_bahia','viu_corte','viu_imprensa','ouviu_povo','viu_mar','pista1','pista2','pista3','chave_portal'];
const ALLOWED_FOCUS = ['provincias','corte','imprensa','povo','mar',''];
export function normalize(candidate:unknown, data: StoryData): RunState | null {
  if (!candidate || typeof candidate !== 'object') return null;
  const o = candidate as Partial<RunState>;
  if (typeof o.node !== 'string' || !data.nodes[o.node]) return null;
  const s = fresh();s.node = o.node;
  if (Array.isArray(o.docs)) s.docs = [...new Set(o.docs.filter((id):id is string=>typeof id==='string'&&Boolean(data.docs[id])))];
  if (o.flags && typeof o.flags==='object' && !Array.isArray(o.flags)) for(const flag of ALLOWED_FLAGS) s.flags[flag] = o.flags[flag]===true;
  if (o.meters && typeof o.meters==='object' && !Array.isArray(o.meters)) for(const k of Object.keys(s.meters)) {
    const value=o.meters[k];if(Number.isFinite(value))s.meters[k]=Math.min(99,Math.max(0,Math.trunc(value)));
  }
  if (typeof o.focus==='string' && ALLOWED_FOCUS.includes(o.focus))s.focus=o.focus;
  if (Array.isArray(o.trace))s.trace=o.trace.filter((x):x is string=>typeof x==='string').slice(-75);
  if (Array.isArray(o.visited))s.visited=[...new Set(o.visited.filter((x):x is string=>typeof x==='string'&&Boolean(data.nodes[x])))].slice(-100);
  if (typeof o.lastEnding==='string' && data.endings[o.lastEnding])s.lastEnding=o.lastEnding;
  return s;
}
export function available(node: StoryNode, s: RunState): Choice[] {
  const choices=typeof node.choices==='function'?node.choices(s):node.choices;
  return choices.filter(c=>!c.condition||c.condition(s));
}
export function textFor(node:StoryNode,s:RunState):string {
  return typeof node.text==='function'?node.text(s):node.text;
}
export function applyEffects(s:RunState, fx:Effects, data:StoryData): void {
  if(fx.focus)s.focus=fx.focus;
  for(const id of fx.docs||[])if(data.docs[id]&&!s.docs.includes(id))s.docs.push(id);
  for(const flag of fx.flags||[])s.flags[flag]=true;
  for(const [k,v] of Object.entries(fx.meters||{}))if(Object.prototype.hasOwnProperty.call(s.meters,k)&&Number.isFinite(v))s.meters[k]=Math.max(0,Math.min(99,s.meters[k]+v));
}
export function choose(s:RunState, choice:Choice, data:StoryData):void {
  const node=data.nodes[s.node];
  if(!node || !available(node,s).some(c=>c.to===choice.to && c.label===choice.label && JSON.stringify(c.fx)===JSON.stringify(choice.fx)))throw new Error('Escolha inválida neste estado');
  s.trace.push(`${node.id}: ${choice.label}`);s.trace=s.trace.slice(-75);
  if(!s.visited.includes(node.id))s.visited.push(node.id);
  applyEffects(s,choice.fx,data);
  if(choice.to.startsWith('@')) {
    const ending=choice.to.slice(1);if(!data.endings[ending])throw new Error('Final inválido');
    s.lastEnding=ending;s.node='portal_final';
    return;
  }
  if(!data.nodes[choice.to])throw new Error('Cena não encontrada: '+choice.to);
  s.node=choice.to;
}
export function yearStep(node:StoryNode):number{
 const y=node.year;return y.startsWith('1822')?0:y.startsWith('1823')?1:y.startsWith('1824')?2:y.startsWith('1825')?3:y.startsWith('1826')?4:y.startsWith('1827')||y.startsWith('1828')?5:y.startsWith('1829')||y.startsWith('1830')?6:7;
}
