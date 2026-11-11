import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {story} from '../src/story.ts';
import {available,choose,fresh,normalize} from '../src/engine/narrative.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const arts=new Set(fs.readdirSync(path.join(root,'public/assets')).filter(x=>x.endsWith('.webp')).map(x=>x.slice(0,-5)));
const errors=[];
for(const [id,n] of Object.entries(story.nodes)){
 if(!arts.has(n.where))errors.push(`Arte ausente ${id} (${n.where})`);
 const choices=typeof n.choices==='function'?n.choices(fresh()):n.choices;
 for(const c of choices){if(c.to.startsWith('@')&&!story.endings[c.to.slice(1)])errors.push(`Final inexistente ${c.to}`);else if(!c.to.startsWith('@')&&!story.nodes[c.to])errors.push(`Nó inexistente ${id}->${c.to}`);}
}
for(const [id,e] of Object.entries(story.endings))for(const [art] of e.frames)if(!arts.has(art))errors.push(`Arte de final ausente ${id}/${art}`);
assert.deepEqual(errors,[]);
const paths={}, seen=new Set(), stack=[{s:fresh(),steps:[]}];let explored=0;
while(stack.length && Object.keys(paths).length<Object.keys(story.endings).length && explored<1200000){
 const {s,steps}=stack.pop();explored++;
 if(s.lastEnding && s.node==='portal_final'){if(!paths[s.lastEnding])paths[s.lastEnding]=steps;continue;}
 if(!story.nodes[s.node])throw new Error('Cena ausente: '+s.node);
 const sig=[s.node,s.docs.slice().sort().join(','),Object.keys(s.flags).filter(x=>s.flags[x]).sort().join(','),s.focus,...['saber','prudencia','escuta','pressa'].map(k=>Math.min(s.meters[k],k==='escuta'?4:5))].join('|');
 if(seen.has(sig))continue;seen.add(sig);
 const choices=available(story.nodes[s.node],s);
 for(const c of choices){const ns=structuredClone(s);choose(ns,c,story);stack.push({s:ns,steps:[...steps,{node:s.node,label:c.label,to:c.to}]});}
}
assert.equal(Object.keys(paths).length,Object.keys(story.endings).length,'Nem todos os finais são alcançáveis');
assert.equal(Object.keys(story.nodes).length,45);
assert.equal(Object.keys(story.endings).length,10);
// Validate migration from the existing v2 localStorage save shape.
const oldSave={v:2,node:'p1',docs:['carta1822','fake'],flags:{viu_corte:true},meters:{saber:4,pressa:0,escuta:0,prudencia:0},focus:'corte',visited:['p1'],trace:['p1: teste'],lastEnding:null};
const migrated=normalize(oldSave,story);
assert.equal(migrated?.node,'p1');assert.deepEqual(migrated.docs,['carta1822']);assert.equal(migrated?.meters.saber,4);
const invalid=normalize({node:'__missing'},story);assert.equal(invalid,null);
fs.writeFileSync(path.join(root,'tests/reachable_paths.json'),JSON.stringify(paths,null,2));
console.log(JSON.stringify({result:'PASS',nodes:Object.keys(story.nodes).length,documents:Object.keys(story.docs).length,endings:Object.keys(story.endings).length,reachable:Object.keys(paths).length,explored,distinct_states:seen.size,paths:Object.fromEntries(Object.entries(paths).map(([k,v])=>[k,v.length])),migration:'v2 save accepted'},null,2));
