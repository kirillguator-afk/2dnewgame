
import { CONFIG } from '../core/Constants.js';

export class VfxSystem {
    constructor(app, container) {
        this.app = app;
        this.container = container;
        this.particles = [];
    }

    spawn(x, y, type, color) {
        const p = new PIXI.Graphics();
        p.beginFill(color || 0xFFFFFF);
        p.drawRect(0, 0, 2, 2);
        p.endFill();
        p.x = x;
        p.y = y;
        p.alpha = 0.8;
        
        const particle = {
            sprite: p,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1.0,
            decay: 0.01 + Math.random() * 0.02
        };
        
        this.container.addChild(p);
        this.particles.push(particle);
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= p.decay;
            p.sprite.x += p.vx;
            p.sprite.y += p.vy;
            p.sprite.alpha = p.life;
            
            if (p.life <= 0) {
                this.container.removeChild(p.sprite);
                p.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
}
