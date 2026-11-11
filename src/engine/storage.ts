import type { Gallery, RunState, StoryData } from './types';
import { GALLERY_KEY, SAVE_KEY, normalize } from './narrative';
export class SaveService {
  available=true;
  private get(key:string):unknown {
    try {const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}
    catch {this.available=false;return null;}
  }
  private set(key:string, value:unknown):boolean {
    try {localStorage.setItem(key,JSON.stringify(value));this.available=true;return true;}
    catch {this.available=false;return false;}
  }
  load(data:StoryData):RunState|null {return normalize(this.get(SAVE_KEY),data);}
  save(state:RunState):boolean {return this.set(SAVE_KEY,state);}
  gallery(data:StoryData):Gallery {
    const object=this.get(GALLERY_KEY);
    const result:Gallery={};
    if(object && typeof object==='object'&&!Array.isArray(object)) {
      const raw=object as Record<string,unknown>;
      for(const id of Object.keys(data.endings)) if(Object.prototype.hasOwnProperty.call(raw,id)) {
        const val=raw[id] as {at?:unknown}|null;
        result[id]={at:typeof val?.at==='string'?val.at:''};
      }
    }
    return result;
  }
  unlock(id:string,gallery:Gallery):boolean {
    gallery[id]={at:new Date().toISOString()};return this.set(GALLERY_KEY,gallery);
  }
  backup(state:RunState|null,gallery:Gallery):string{
    return JSON.stringify({format:'entre-papeis-e-portais',version:3,exportedAt:new Date().toISOString(),state,gallery},null,2);
  }
  restore(raw:unknown,data:StoryData):{state:RunState|null;gallery:Gallery}|null{
    if(!raw||typeof raw!=='object')return null;
    const obj=raw as {format?:unknown;state?:unknown;gallery?:unknown};
    if(obj.format!=='entre-papeis-e-portais')return null;
    const state=obj.state===null?null:normalize(obj.state,data);if(obj.state!==null&&!state)return null;
    if(!obj.gallery||typeof obj.gallery!=='object'||Array.isArray(obj.gallery))return null;
    const gallery:Gallery={};
    for(const id of Object.keys(obj.gallery))if(data.endings[id]) {
      const item=(obj.gallery as Record<string,unknown>)[id] as {at?:unknown}|null;
      gallery[id]={at:typeof item?.at==='string'?item.at:''};
    }
    this.set(GALLERY_KEY,gallery);if(state)this.save(state);
    else {try{localStorage.removeItem(SAVE_KEY);}catch{this.available=false;}}
    return {state,gallery};
  }
}
