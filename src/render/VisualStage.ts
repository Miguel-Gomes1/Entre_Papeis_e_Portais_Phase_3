import Phaser from 'phaser';
import type { VisualAdapter } from '../ui/UIController';

const ART = [
  'porto_1822', 'salvador_1823', 'assembleia_1823', 'olinda_1824',
  'tipografia_1824', 'corte_1825', 'cisplatina_1828', 'ruas_1831', 'portal_atualidade'
];
type Mode = 'home' | 'game' | 'cinema';
const REDUCED = window.matchMedia?.('(prefers-reduced-motion: reduce)');
const ART_WIDTH = 448;
const ART_HEIGHT = 252;

/** Phaser visual layer: the narrative and HTML UI remain independent. */
class AnimatedScene extends Phaser.Scene {
  private activeArt = 'porto_1822';
  private activeMode: Mode = 'home';
  private loaded = false;
  onSceneReady: () => void = () => {};

  constructor() { super({ key: 'AnimatedWorld' }); }

  preload(): void {
    for (const art of ART) this.load.image(art, `/assets/${art}.webp`);
    this.load.image('dust', '/assets/poeira.png');
  }

  create(): void {
    this.loaded = true;
    this.scale.on('resize', () => this.rebuild());
    this.rebuild();
    this.onSceneReady();
  }

  setArt(art: string, mode: Mode): void {
    if (!ART.includes(art)) art = 'porto_1822';
    if (this.activeArt === art && this.activeMode === mode && this.loaded) return;
    this.activeArt = art;
    this.activeMode = mode;
    if (!this.loaded) return;

    this.cameras.main.fadeOut(150, 14, 18, 28);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.rebuild();
      this.cameras.main.fadeIn(340, 14, 18, 28);
    });
  }

  private addWaterReflections(world: Phaser.GameObjects.Container): void {
    const art = this.activeArt;
    if (!['porto_1822', 'cisplatina_1828'].includes(art)) return;
    // Restrict reflections to *actual water portions of the painting*, instead of
    // scattering across the bottom of the viewport (which overlaps streets).
    const water = art === 'porto_1822'
      ? { xMin: 12, xMax: 107, yMin: 183, yMax: 237 }
      : { xMin: 35, xMax: 195, yMin: 137, yMax: 157 };
    for (let i = 0; i < 9; i++) {
      const x = water.xMin + Math.random() * (water.xMax - water.xMin);
      const y = water.yMin + Math.random() * (water.yMax - water.yMin);
      const line = this.add.rectangle(x - ART_WIDTH / 2, y - ART_HEIGHT / 2,
        4 + Math.random() * 8, 1, 0xf7d2a0, 0.08 + Math.random() * 0.16);
      world.add(line);
      if (!REDUCED?.matches) this.tweens.add({
        targets: line, x: line.x + 7, alpha: 0,
        duration: 2700 + i * 310, yoyo: true, repeat: -1
      });
    }
  }

  private rebuild(): void {
    if (!this.loaded) return;
    this.tweens.killAll();
    this.children.removeAll(true);

    const w = Math.max(320, this.scale.width);
    const h = Math.max(180, this.scale.height);
    const cinema = this.activeMode === 'cinema';

    // The background and water reflections move together during parallax.
    const world = this.add.container(w / 2, h / 2);
    const bg = this.add.image(0, 0, this.activeArt);
    world.add(bg);
    const fill = Math.max(w / bg.width, h / bg.height);
    world.setScale(fill * (cinema ? 1.12 : 1.045));

    this.addWaterReflections(world);

    if (!REDUCED?.matches) {
      const amplitude = Math.max(4, Math.round(w * 0.018));
      this.tweens.add({
        targets: world,
        x: w / 2 + amplitude, y: h / 2 + amplitude * 0.3,
        duration: cinema ? 15500 : 19000,
        yoyo: true, repeat: -1, ease: 'Sine.InOut'
      });
      const baseScale = world.scaleX;
      this.tweens.add({
        targets: world,
        scaleX: baseScale * 1.03, scaleY: baseScale * 1.03,
        duration: cinema ? 12500 : 22000,
        yoyo: true, repeat: -1, ease: 'Sine.InOut'
      });
    }

    // Atmospheric dust. Kept light for mobile devices.
    const particleCount = cinema ? 13 : Math.max(5, Math.round(w / 100));
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const dust = this.add.image(x, y, 'dust')
        .setAlpha(0.1 + Math.random() * 0.28)
        .setScale(0.5 + Math.random() * 0.7);
      if (!REDUCED?.matches) this.tweens.add({
        targets: dust, y: y - 20 - Math.random() * 45, alpha: 0,
        duration: 3000 + Math.random() * 4000, delay: i * 190, repeat: -1,
        onRepeat: () => {
          dust.y = h * (0.5 + Math.random() * 0.5);
          dust.x = Math.random() * w;
          dust.alpha = 0.12 + Math.random() * 0.18;
        }
      });
    }


  }
}

export class VisualStage implements VisualAdapter {
  private scene: AnimatedScene;
  private game: Phaser.Game;
  private stage: HTMLDivElement;
  private previous: HTMLElement | null = null;
  private ready = false;
  private resizeObserver: ResizeObserver | null = null;
  private lastArt = 'porto_1822';
  private lastMode: Mode = 'home';

  constructor() {
    this.stage = document.createElement('div');
    this.stage.id = 'phaserStage';
    this.stage.setAttribute('aria-hidden', 'true');
    const target = document.querySelector<HTMLElement>('.hero-scene');
    if (!target) throw new Error('Cena do menu não encontrada');
    target.prepend(this.stage);
    this.scene = new AnimatedScene();
    this.scene.onSceneReady = () => {
      this.ready = true;
      this.previous?.classList.add('phaser-active');
      this.scene.setArt(this.lastArt, this.lastMode);
      this.resize();
    };
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this.stage,
      backgroundColor: '#182735',
      render: { pixelArt: true, antialias: false, roundPixels: true },
      scale: { mode: Phaser.Scale.RESIZE, parent: this.stage, width: 960, height: 540 },
      scene: [this.scene],
    });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.previous = target;
    this.resizeObserver.observe(target);
  }

  private resize(): void {
    if (!this.previous) return;
    const w = this.previous.clientWidth;
    const h = this.previous.clientHeight;
    if (w > 0 && h > 0) this.game.scale.resize(w, h);
  }

  show(art: string, mode: Mode): void {
    this.lastArt = art;
    this.lastMode = mode;
    const selector = mode === 'home' ? '.hero-scene' : mode === 'game' ? '.scene-window' : '.cinema-visual';
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;
    if (this.stage.parentElement !== target) {
      this.previous?.classList.remove('phaser-active');
      this.resizeObserver?.disconnect();
      target.prepend(this.stage);
      this.previous = target;
      this.resizeObserver?.observe(target);
      this.resize();
    }
    if (this.ready) {
      target.classList.add('phaser-active');
      this.scene.setArt(art, mode);
    }
  }

  destroy(): void {
    this.resizeObserver?.disconnect();
    this.game.destroy(true);
  }
}
