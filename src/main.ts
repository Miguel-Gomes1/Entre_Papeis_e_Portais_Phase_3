import './style.css';
import { story } from './story';
import { UIController, type VisualAdapter } from './ui/UIController';
import { VisualStage } from './render/VisualStage';

// Preserve the narrative and saving system even if the GPU is unavailable.
let visual:VisualAdapter;
try{visual=new VisualStage();}
catch(error){
  console.warn('Phaser indisponível; usando as ilustrações estáticas de reserva.',error);
  visual={show:()=>{}};
}
new UIController(story,visual).install();
