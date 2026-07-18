
import { WorldManager } from '../world/WorldManager.js';
import { InputHandler } from './InputHandler.js';

export class Engine {
    constructor() {
        this.app = null;
        this.world = null;
        this.input = null;
    }

    async init(containerId) {
        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x050505,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
        });

        document.getElementById(containerId).appendChild(this.app.view);

        this.input = new InputHandler();
        this.world = new WorldManager(this.app);
        
        await this.world.loadResources();
        this.world.setup();

        this.app.ticker.add((delta) => this.update(delta));
    }

    update(delta) {
        const dt = Math.min(delta / 60, 0.1); // Ограничиваем шаг времени
        
        this.input.update();
        this.world.update(dt, this.input);
        
        const pos = this.world.cameraPos;
        const rpmInfo = "RPM: 256 (Motor Mode Every 5th Tile)";
        document.getElementById('coords').innerHTML = `
            X: ${Math.floor(pos.x)} Y: ${Math.floor(pos.y)}<br>
            <span class="text-cyan-600 text-[10px]">${rpmInfo}</span>
        `;
    }
}
