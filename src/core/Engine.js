
import { WorldManager } from '../world/WorldManager.js';
import { InputHandler } from './InputHandler.js';
import { CharacterCreator } from '../ui/CharacterCreator.js';

export class Engine {
    constructor() {
        this.app = null;
        this.world = null;
        this.input = null;
        this.gameState = 'SPLASH';
        this.isInitialized = false;
    }

    async init(containerId) {
        try {
            // 1. Привязка UI кнопок ДО загрузки PIXI
            const enterBtn = document.getElementById('enter-btn');
            if (enterBtn) {
                enterBtn.onclick = () => {
                    if (this.isInitialized) {
                        this.showCharacterCreator();
                    } else {
                        enterBtn.innerText = "ЗАГРУЗКА...";
                    }
                };
            }

            // 2. Старт PIXI
            this.app = new PIXI.Application({
                resizeTo: window,
                backgroundColor: 0x050505,
                antialias: false,
                resolution: window.devicePixelRatio || 1,
            });

            const container = document.getElementById(containerId);
            if (container) container.appendChild(this.app.view);

            this.input = new InputHandler();
            this.world = new WorldManager(this.app);
            
            // 3. Загрузка ресурсов мира
            await this.world.loadResources();
            
            // 4. Инициализация логики создания персонажа
            this.creator = new CharacterCreator((data) => this.startGame(data));

            this.isInitialized = true;
            if (enterBtn) enterBtn.innerText = "ВОЙТИ В МИР";

            // 5. Главный цикл
            this.app.ticker.add((delta) => this.update(delta));
            
        } catch (error) {
            console.error("Критическая ошибка инициализации:", error);
        }
    }

    showCharacterCreator() {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('creator-overlay').classList.remove('hidden');
        this.gameState = 'CREATOR';
    }

    startGame(data) {
        this.gameState = 'PLAYING';
        document.getElementById('hud-name').innerText = data.name;
        document.getElementById('hud-race-label').innerText = data.race;
        document.getElementById('ui-layer').classList.remove('hidden');
        
        this.world.setup(data);
    }

    update(delta) {
        if (this.gameState !== 'PLAYING') return;

        const dt = Math.min(delta / 60, 0.1);
        this.input.update();
        this.world.update(dt, this.input);
        
        const pos = this.world.cameraPos;
        const coordsEl = document.getElementById('coords');
        if (coordsEl) {
            coordsEl.innerText = `X: ${Math.floor(pos.x / 32)} Y: ${Math.floor(pos.y / 32)}`;
        }
    }
}
