
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
        
        // Основной контейнер с сортировкой слоев
        this.worldContainer = new PIXI.Container();
        this.vfxLayer = new PIXI.Container();
        
        this.app.stage.addChild(this.worldContainer);
        this.app.stage.addChild(this.vfxLayer);
        
        this.generator = new TerrainGenerator(Date.now());
        this.kineticSystem = new KineticSystem();
        this.vfxSystem = new VfxSystem(this.app, this.vfxLayer);
        this.buildingSystem = new BuildingSystem(this);
        
        this.moveSpeed = 300;
    }

    async loadResources() {
        this.envTextures = ObjectTemplates.generate(this.app);

        const createPixelTile = (color) => {
            const g = new PIXI.Graphics();
            const s = CONFIG.TILE_SIZE;
            g.beginFill(color).drawRect(0, 0, s, s);
            g.beginFill(0x000000, 0.05).drawRect(0, 0, s, 1).drawRect(0, 0, 1, s); // Сетка
            g.endFill();
            return this.app.renderer.generateTexture(g);
        };

        this.textures = {
            floor: createPixelTile(0xffffff),
            gear: this.generateMachineTexture(0x95a5a6),
            engine: this.generateMachineTexture(0xd35400)
        };
    }

    generateMachineTexture(color) {
        const g = new PIXI.Graphics();
        const s = CONFIG.TILE_SIZE;
        g.beginFill(color).drawRect(4, 4, s-8, s-8);
        g.beginFill(0x000000, 0.2).drawRect(s/2-4, s/2-4, 8, 8);
        return this.app.renderer.generateTexture(g);
    }

    setup(charData) {
        this.charData = charData;
        const playerTex = CharacterFactory.createRaceTexture(this.app, charData.race, charData.color);
        this.player = new PIXI.Sprite(playerTex);
        this.player.anchor.set(0.5, 1.0); // Ноги игрока на точке координат
        
        this.app.stage.addChild(this.player);
        this.player.x = window.innerWidth / 2;
        this.player.y = window.innerHeight / 2;
        
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
        
        this.manageChunks();
        this.renderChunks();
    }

    manageChunks() {
        const chunkTotalPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        const currentChunkX = Math.floor(this.cameraPos.x / chunkTotalPx);
        const currentChunkY = Math.floor(this.cameraPos.y / chunkTotalPx);

        // Загрузка
        for (let x = currentChunkX - 1; x <= currentChunkX + 1; x++) {
            for (let y = currentChunkY - 1; y <= currentChunkY + 1; y++) {
                const key = `${x},${y}`;
                if (!this.loadedChunks.has(key)) this.createChunk(x, y);
            }
        }
        
        // Выгрузка
        for (const [key, chunk] of this.loadedChunks) {
            const [cx, cy] = key.split(',').map(Number);
            if (Math.abs(cx - currentChunkX) > 2 || Math.abs(cy - currentChunkY) > 2) {
                chunk.destroy({ children: true });
                this.loadedChunks.delete(key);
            }
        }
    }

    createChunk(cx, cy) {
        const container = new PIXI.Container();
        const chunkTotalPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        container.x = cx * chunkTotalPx;
        container.y = cy * chunkTotalPx;

        const tileLayer = new PIXI.Container();
        const objectLayer = new PIXI.Container();
        container.addChild(tileLayer);
        container.addChild(objectLayer);

        for (let ty = 0; ty < CONFIG.CHUNK_SIZE; ty++) {
            for (let tx = 0; tx < CONFIG.CHUNK_SIZE; tx++) {
                const gx = cx * CONFIG.CHUNK_SIZE + tx;
                const gy = cy * CONFIG.CHUNK_SIZE + ty;
                const data = this.generator.getTileData(gx, gy);
                
                // Тайлы
                const tile = new PIXI.Sprite(this.textures.floor);
                tile.position.set(tx * CONFIG.TILE_SIZE, ty * CONFIG.TILE_SIZE);
                tile.tint = data.isRoad ? 0x57606f : data.biome.color;
                tileLayer.addChild(tile);

                // Объекты
                if (data.objectType) {
                    const suffix = this.getTexSuffix(data.objectType, data.objectVariation);
                    const texKey = `${data.objectType}_${suffix}`;
                    if (this.envTextures[texKey]) {
                        const obj = new PIXI.Sprite(this.envTextures[texKey]);
                        // Позиционируем объект по центру нижней грани тайла
                        obj.anchor.set(0.5, 1.0);
                        obj.position.set(
                            tx * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                            ty * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE
                        );
                        objectLayer.addChild(obj);
                    }
                }
            }
        }

        this.worldContainer.addChild(container);
        this.loadedChunks.set(`${cx},${cy}`, container);
    }

    getTexSuffix(type, variation) {
        if (type === 'forest') return variation === 3 ? 'flower' : `tree_${variation}`;
        if (type === 'wasteland') return variation === 1 ? 'bush' : variation === 2 ? 'bones' : 'ruin';
        if (type === 'mountains') return variation === 3 ? 'crystal' : `rock_${variation}`;
        if (type === 'swamp') return variation === 3 ? 'reeds' : `mushroom_${variation}`;
        return '';
    }

    renderChunks() {
        // Используем floored координаты для камеры, чтобы избежать субпиксельных щелей
        const viewX = Math.floor(-this.cameraPos.x + window.innerWidth / 2);
        const viewY = Math.floor(-this.cameraPos.y + window.innerHeight / 2);
        
        this.worldContainer.position.set(viewX, viewY);
        this.vfxLayer.position.set(viewX, viewY);
    }
}
