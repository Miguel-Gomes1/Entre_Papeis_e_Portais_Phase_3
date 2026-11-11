export interface Effects {
  focus?: string;
  docs?: string[];
  flags?: string[];
  meters?: Record<string, number>;
}
export interface RunState {
  v: number;
  node: string;
  docs: string[];
  flags: Record<string, boolean>;
  meters: Record<string, number>;
  focus: string;
  visited: string[];
  trace: string[];
  lastEnding: string | null;
}
export type Condition = (state: RunState) => boolean;
export interface Choice { label: string; to: string; fx: Effects; condition: Condition | null; }
export interface StoryNode {
  id: string;
  where: string;
  year: string;
  chapter: string;
  speaker: string;
  text: string | ((s: RunState) => string);
  choices: Choice[] | ((s: RunState) => Choice[]);
}
export interface DocumentEntry { name:string; date:string; category:string; fact:string; fiction:string; }
export type CinemaFrame = [art:string, subtitle:string, text:string];
export interface Ending { name:string; subtitle:string; rarity:string; art:string; icon:string; frames:CinemaFrame[]; }
export interface StoryData {
 nodes:Record<string, StoryNode>;
 docs:Record<string, DocumentEntry>;
 endings:Record<string, Ending>;
}
export type Gallery = Record<string, { at: string }>;
