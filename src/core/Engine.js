
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
        // 1. СРАЗУ вешаем обработчик на главную кнопку, не дожидаясь PIXI
        const enterBtn = document.getElementById('enter-btn');
        if (enterBtn) {
            enterBtn.onclick = () => {
                if (!this.isInitialized) {
                    console.warn("Мир еще загружается...");
                    return;
                }
                this.showCharacterCreator();
            };
        }

        // 2. Инициализируем PIXI
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
        
        // 3. Загружаем ресурсы
        try {
            await this.world.loadResources();
            this.isInitialized = true;
            console.log("Engine: Ресурсы загружены");
        } catch (e) {
            console.error("Engine: Ошибка загрузки ресурсов", e);
        }

        // 4. Инициализируем создатель персонажа (он скрыт в HTML)
        this.creator = new CharacterCreator((data) => this.startGame(data));

        // 5. Запускаем тикер
        this.app.ticker.add((delta) => this.update(delta));
    }

    showCharacterCreator() {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('creator-overlay').classList.remove('hidden');
        this.gameState = 'CREATOR';
    }

    startGame(data) {
        this.gameState = 'PLAYING';
        document.getElementById('hud-name').innerText = data.name;
        document.getElementById('hud-race-label').innerText = data.race;
        this.world.setup(data);
        console.log("Engine: Игра началась");
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
