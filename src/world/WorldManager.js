
import { KineticSystem } from '../systems/KineticSystem.js';
import { BuildingSystem } from './BuildingSystem.js';
import { CONFIG } from '../core/Constants.js';

export class WorldManager {
    constructor(app) {
        this.app = app;
        this.cameraPos = { x: 500000, y: 500000 };
        this.loadedChunks = new Map();
        this.entities = new Map();
        
        this.worldContainer = new PIXI.Container();
        this.app.stage.addChild(this.worldContainer);
        
        this.kineticSystem = new KineticSystem();
        this.buildingSystem = new BuildingSystem(this);
        
        this.moveSpeed = 400;
        this.charData = null;
    }

    async loadResources() {
        const createGearTexture = (color, isMotor) => {
            const g = new PIXI.Graphics();
            const size = CONFIG.TILE_SIZE;
            g.beginFill(color);
            g.drawCircle(size/2, size/2, size/2 - 4);
            for(let i=0; i<8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                g.drawRect(size/2 + Math.cos(angle) * (size/2 - 4) - 2, size/2 + Math.sin(angle) * (size/2 - 4) - 2, 4, 4);
            }
            if (isMotor) {
                g.lineStyle(2, 0xff00ff);
                g.drawRect(size/4, size/4, size/2, size/2);
            }
            g.endFill();
            return this.app.renderer.generateTexture(g);
        };

        this.textures = {
            floor: this.generateStaticTexture(0x111111),
            gear: createGearTexture(0x444444, false),
            motor: createGearTexture(0x00f2ff, true),
            player: this.generateStaticTexture(0xffffff, 16)
        };
    }

    generateStaticTexture(color, size = CONFIG.TILE_SIZE) {
        const g = new PIXI.Graphics();
        g.beginFill(color);
        g.drawRect(0, 0, size, size);
        g.endFill();
        return this.app.renderer.generateTexture(g);
    }

    setup(charData) {
        this.charData = charData;
        this.player = new PIXI.Sprite(this.textures.player);
        this.player.anchor.set(0.5);
        this.app.stage.addChild(this.player);
        this.player.x = window.innerWidth / 2;
        this.player.y = window.innerHeight / 2;
        
        // Применяем цвет из редактора персонажа
        this.player.tint = PIXI.utils.string2hex(charData.color);
        
        // Модифицируем скорость на основе DEX
        this.moveSpeed = 300 + (charData.stats.dex * 20);

        this.buildingSystem.setup();
    }

    update(dt, input) {
        if (!this.player) return;

        if (input.isKeyDown('KeyW')) this.cameraPos.y -= this.moveSpeed * dt;
        if (input.isKeyDown('KeyS')) this.cameraPos.y += this.moveSpeed * dt;
        if (input.isKeyDown('KeyA')) this.cameraPos.x -= this.moveSpeed * dt;
        if (input.isKeyDown('KeyD')) this.cameraPos.x += this.moveSpeed * dt;

        this.buildingSystem.handleInput(input, this.cameraPos);
        this.kineticSystem.update(dt);
        
        for (const [id, ent] of this.entities) {
            const kinetic = this.kineticSystem.getKineticData(id);
            if (kinetic && kinetic.rpm !== 0) {
                ent.sprite.rotation += (kinetic.rpm * Math.PI * 2 / 60) * dt;
            }
        }

        this.manageChunks();
        this.renderChunks();
    }

    manageChunks() {
        const chunkTotalPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        const currentChunkX = Math.floor(this.cameraPos.x / chunkTotalPx);
        const currentChunkY = Math.floor(this.cameraPos.y / chunkTotalPx);

        for (let x = currentChunkX - 1; x <= currentChunkX + 1; x++) {
            for (let y = currentChunkY - 1; y <= currentChunkY + 1; y++) {
                const key = `${x},${y}`;
                if (!this.loadedChunks.has(key)) this.createChunk(x, y);
            }
        }
    }

    createChunk(cx, cy) {
        const chunkTotalPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        const container = new PIXI.Container();
        container.x = cx * chunkTotalPx;
        container.y = cy * chunkTotalPx;
        const bg = new PIXI.TilingSprite(this.textures.floor, chunkTotalPx, chunkTotalPx);
        container.addChild(bg);
        this.worldContainer.addChildAt(container, 0);
        this.loadedChunks.set(`${cx},${cy}`, container);
    }

    renderChunks() {
        this.worldContainer.x = -this.cameraPos.x + window.innerWidth / 2;
        this.worldContainer.y = -this.cameraPos.y + window.innerHeight / 2;
    }
}
