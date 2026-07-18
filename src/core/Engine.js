
import { WorldManager } from '../world/WorldManager.js';
import { InputHandler } from './InputHandler.js';
import { CharacterCreator } from '../ui/CharacterCreator.js';

export class Engine {
    constructor() {
        this.app = null;
        this.world = null;
        this.input = null;
        this.gameState = 'CREATOR';
    }

    async init(containerId) {
        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x1e272e,
            antialias: false, // Отключаем для пиксель-арта
            resolution: 1,
        });

        document.getElementById(containerId).appendChild(this.app.view);

        this.input = new InputHandler();
        this.world = new WorldManager(this.app);
        
        await this.world.loadResources();
        new CharacterCreator((data) => this.startGame(data));

        this.app.ticker.add((delta) => this.update(delta));
    }

    startGame(data) {
        this.gameState = 'PLAYING';
        document.getElementById('hud-name').innerText = data.name;
        document.getElementById('hud-race-label').innerText = `Origin: ${data.race}`;
        this.world.setup(data);
    }

    update(delta) {
        if (this.gameState !== 'PLAYING') return;

        const dt = Math.min(delta / 60, 0.1);
        this.input.update();
        this.world.update(dt, this.input);
        
        const pos = this.world.cameraPos;
        document.getElementById('coords').innerText = `X: ${Math.floor(pos.x / 32)} Y: ${Math.floor(pos.y / 32)}`;
    }
}
