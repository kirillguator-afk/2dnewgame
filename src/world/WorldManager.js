
import { KineticSystem } from '../systems/KineticSystem.js';
import { BuildingSystem } from './BuildingSystem.js';
import { TerrainGenerator } from './TerrainGenerator.js';
import { VfxSystem } from '../systems/VfxSystem.js';
import { CharacterFactory } from '../entities/CharacterFactory.js';
import { ObjectTemplates } from './objects/ObjectTemplates.js';
import { CONFIG, BIOMES } from '../core/Constants.js';

export class WorldManager {
    constructor(app) {
        this.app = app;
        this.cameraPos = { x: 500000, y: 500000 };
        this.loadedChunks = new Map();
        this.entities = new Map();
        
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
        // Загрузка декораций
        this.envTextures = ObjectTemplates.generate(this.app);

        // Базовые плитки
        const createPixelTile = (color) => {
            const g = new PIXI.Graphics();
            const s = CONFIG.TILE_SIZE;
            g.beginFill(color);
            g.drawRect(0, 0, s, s);
            g.beginFill(0x000000, 0.05);
            g.drawRect(2, 2, 4, 4);
            g.drawRect(s-6, s-6, 4, 4);
            g.endFill();
            return this.app.renderer.generateTexture(g);
        };

        const createMachineTexture = (color) => {
            const g = new PIXI.Graphics();
            const s = CONFIG.TILE_SIZE;
            g.beginFill(color);
            g.drawRect(4, 4, s-8, s-8);
            g.beginFill(0x000000, 0.2);
            g.drawRect(s/2-4, s/2-4, 8, 8);
            g.endFill();
            return this.app.renderer.generateTexture(g);
        };

        this.textures = {
            floor: createPixelTile(0xffffff),
            gear: createMachineTexture(0x95a5a6),
            engine: createMachineTexture(0xd35400)
        };
    }

    setup(charData) {
        this.charData = charData;
        
        // Генерируем скин персонажа на лету
        const playerTex = CharacterFactory.createRaceTexture(this.app, charData.race, charData.color);
        this.player = new PIXI.Sprite(playerTex);
        this.player.anchor.set(0.5, 0.5);
        
        this.app.stage.addChild(this.player);
        this.player.x = window.innerWidth / 2;
        this.player.y = window.innerHeight / 2;
        
        this.moveSpeed = 250 + (charData.stats.dex * 15);
        this.buildingSystem.setup();
    }

    update(dt, input) {
        if (!this.player) return;

        const oldX = this.cameraPos.x;
        const oldY = this.cameraPos.y;

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
        
        for (const [key, container] of this.loadedChunks) {
            const [cx, cy] = key.split(',').map(Number);
            if (Math.abs(cx - currentChunkX) > 2 || Math.abs(cy - currentChunkY) > 2) {
                container.destroy({ children: true });
                this.loadedChunks.delete(key);
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
                
                // 1. Поверхность
                const tile = new PIXI.Sprite(this.textures.floor);
                tile.x = tx * CONFIG.TILE_SIZE;
                tile.y = ty * CONFIG.TILE_SIZE;
                tile.tint = data.isRoad ? 0x57606f : data.biome.color;
                container.addChild(tile);

                // 2. Объекты (деревья, камни и т.д.)
                if (data.objectType) {
                    const texKey = `${data.objectType}_${this.getTexSuffix(data.objectType)}`;
                    if (this.envTextures[texKey]) {
                        const obj = new PIXI.Sprite(this.envTextures[texKey]);
                        obj.x = tile.x;
                        obj.y = tile.y;
                        obj.anchor.set(0, 0.5); // Для легкого эффекта глубины
                        container.addChild(obj);
                    }
                }
            }
        }

        this.worldContainer.addChildAt(container, 0);
        this.loadedChunks.set(`${cx},${cy}`, container);
    }

    getTexSuffix(type) {
        if (type === 'forest') return 'tree';
        if (type === 'wasteland') return 'bush';
        if (type === 'mountains') return 'rock';
        if (type === 'swamp') return 'mushroom';
        return '';
    }

    renderChunks() {
        const ox = -this.cameraPos.x + window.innerWidth / 2;
        const oy = -this.cameraPos.y + window.innerHeight / 2;
        this.worldContainer.x = Math.round(ox);
        this.worldContainer.y = Math.round(oy);
        this.vfxLayer.x = this.worldContainer.x;
        this.vfxLayer.y = this.worldContainer.y;
    }
}
