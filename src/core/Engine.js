
import { WorldManager } from '../world/WorldManager.js';
import { InputHandler } from './InputHandler.js';
import { CharacterCreator } from '../ui/CharacterCreator.js';

export class Engine {
    constructor() {
        this.app = null;
        this.world = null;
        this.input = null;
        this.gameState = 'CREATOR'; // CREATOR | PLAYING
        this.characterData = null;
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
        
        // Запускаем создатель персонажа
        new CharacterCreator((data) => this.startGame(data));

        this.app.ticker.add((delta) => this.update(delta));
    }

    startGame(data) {
        this.characterData = data;
        this.gameState = 'PLAYING';
        
        // Обновляем HUD
        document.getElementById('hud-name').innerText = `USER: ${data.name}`;
        document.getElementById('hud-race').innerText = `RACE: ${data.race}`;
        
        this.world.setup(data);
        console.log("Neon-Gear Engine: Playing Mode", data);
    }

    update(delta) {
        if (this.gameState !== 'PLAYING') return;

        const dt = Math.min(delta / 60, 0.1);
        this.input.update();
        this.world.update(dt, this.input);
        
        const pos = this.world.cameraPos;
        document.getElementById('coords').innerHTML = `
            X: ${Math.floor(pos.x)} Y: ${Math.floor(pos.y)}<br>
            <span class="text-cyan-600 text-[10px]">RPM Simulation Active</span>
        `;
    }
}
