
import { KineticSystem } from '../systems/KineticSystem.js';
import { BuildingSystem } from './BuildingSystem.js';
import { TerrainGenerator } from './TerrainGenerator.js';
import { VfxSystem } from '../systems/VfxSystem.js';
import { CONFIG, BIOMES } from '../core/Constants.js';

export class WorldManager {
    constructor(app) {
        this.app = app;
        this.cameraPos = { x: 500000, y: 500000 };
        this.loadedChunks = new Map();
        this.entities = new Map();
        
        // Включаем пиксельный рендеринг
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        
        this.worldContainer = new PIXI.Container();
        this.vfxLayer = new PIXI.Container();
        
        this.app.stage.addChild(this.worldContainer);
        this.app.stage.addChild(this.vfxLayer);
        
        this.generator = new TerrainGenerator(Date.now());
        this.kineticSystem = new KineticSystem();
        this.vfxSystem = new VfxSystem(this.app, this.vfxLayer);
        this.buildingSystem = new BuildingSystem(this);
        
        this.moveSpeed = 300;
        this.charData = null;
    }

    async loadResources() {
        const createPixelTile = (color) => {
            const g = new PIXI.Graphics();
            const s = CONFIG.TILE_SIZE;
            g.beginFill(color);
            g.drawRect(0, 0, s, s);
            // Пиксельная текстура (грязь/трава)
            g.beginFill(0x000000, 0.05);
            for(let i=0; i<4; i++) {
                g.drawRect(Math.random()*(s-4), Math.random()*(s-4), 4, 4);
            }
            g.endFill();
            return this.app.renderer.generateTexture(g);
        };

        const createGearTexture = (isWood) => {
            const g = new PIXI.Graphics();
            const s = CONFIG.TILE_SIZE;
            const color = isWood ? 0x8e44ad : 0xd35400; // Цвета для отличия
            g.beginFill(color);
            g.drawRect(4, 4, s-8, s-8); // Квадратная "пиксельная" шестерня
            g.beginFill(0x000000, 0.2);
            g.drawRect(s/2-4, s/2-4, 8, 8);
            g.endFill();
            return this.app.renderer.generateTexture(g);
        };

        this.textures = {
            floor: createPixelTile(0xffffff),
            player: this.generatePixelHero(0xffffff),
            gear: createGearTexture(true),
            engine: createGearTexture(false)
        };
    }

    generatePixelHero(color) {
        const g = new PIXI.Graphics();
        g.beginFill(color);
        g.drawRect(8, 4, 16, 24); // Тело
        g.beginFill(0x000000, 0.3);
        g.drawRect(10, 8, 4, 4); // Глаза
        g.drawRect(18, 8, 4, 4);
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
        this.player.tint = PIXI.utils.string2hex(charData.color);
        
        this.moveSpeed = 250 + (charData.stats.dex * 15);
        this.buildingSystem.setup();
    }

    update(dt, input) {
        if (!this.player) return;

        if (input.isKeyDown('KeyW')) this.cameraPos.y -= this.moveSpeed * dt;
        if (input.isKeyDown('KeyS')) this.cameraPos.y += this.moveSpeed * dt;
        if (input.isKeyDown('KeyA')) { 
            this.cameraPos.x -= this.moveSpeed * dt;
            this.player.scale.x = -1;
        }
        if (input.isKeyDown('KeyD')) {
            this.cameraPos.x += this.moveSpeed * dt;
            this.player.scale.x = 1;
        }

        this.buildingSystem.handleInput(input, this.cameraPos);
        this.kineticSystem.update(dt);
        this.vfxSystem.update(dt);
        
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
        const container = new PIXI.Container();
        const chunkTotalPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        container.x = cx * chunkTotalPx;
        container.y = cy * chunkTotalPx;

        for (let ty = 0; ty < CONFIG.CHUNK_SIZE; ty++) {
            for (let tx = 0; tx < CONFIG.CHUNK_SIZE; tx++) {
                const gx = cx * CONFIG.CHUNK_SIZE + tx;
                const gy = cy * CONFIG.CHUNK_SIZE + ty;
                const data = this.generator.getTileData(gx, gy);
                
                const tile = new PIXI.Sprite(this.textures.floor);
                tile.x = tx * CONFIG.TILE_SIZE;
                tile.y = ty * CONFIG.TILE_SIZE;
                tile.tint = data.isRoad ? 0x57606f : data.biome.color;
                container.addChild(tile);
            }
        }

        this.worldContainer.addChildAt(container, 0);
        this.loadedChunks.set(`${cx},${cy}`, container);
    }

    renderChunks() {
        const ox = -this.cameraPos.x + window.innerWidth / 2;
        const oy = -this.cameraPos.y + window.innerHeight / 2;
        this.worldContainer.x = Math.round(ox); // Округление для избежания дрожания пикселей
        this.worldContainer.y = Math.round(oy);
        this.vfxLayer.x = this.worldContainer.x;
        this.vfxLayer.y = this.worldContainer.y;
    }
}
