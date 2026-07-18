
import { TerrainGenerator } from './TerrainGenerator.js';
import { AtmosphereSystem } from '../systems/AtmosphereSystem.js';
import { CharacterFactory } from '../entities/CharacterFactory.js';
import { ObjectTemplates } from './objects/ObjectTemplates.js';
import { BuildingTemplates } from './objects/BuildingTemplates.js';
import { CONFIG } from '../core/Constants.js';

export class WorldManager {
    constructor(app) {
        this.app = app;
        this.cameraPos = { x: 500000 * 32, y: 500000 * 32 };
        this.loadedChunks = new Map();
        
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        
        // Инициализация контейнеров слоев
        this.layers = {};
        this.setupLayers();

        this.generator = new TerrainGenerator(Date.now());
        this.atmosphere = new AtmosphereSystem(this.app, this.layers.ATMOSPHERE);
        this.animTimer = 0;
        this.player = null;
    }

    setupLayers() {
        // Создаем контейнеры и добавляем их в stage строго по порядку
        const layerEntries = Object.entries(CONFIG.LAYERS).sort((a, b) => a[1] - b[1]);
        layerEntries.forEach(([name]) => {
            const container = new PIXI.Container();
            // Слой WORLD_OBJECTS должен поддерживать Y-сортировку
            if (name === 'WORLD_OBJECTS') {
                container.sortableChildren = true;
            }
            this.app.stage.addChild(container);
            this.layers[name] = container;
        });
    }

    async loadResources() {
        this.envTextures = ObjectTemplates.generate(this.app);
        this.buildTextures = BuildingTemplates.getTemplates(this.app);
        
        const g = new PIXI.Graphics();
        g.beginFill(0xFFFFFF).drawRect(0, 0, 32, 32).endFill();
        this.baseTileTex = this.app.renderer.generateTexture(g);
        
        // Глобальный пост-процессинг
        const colorFilter = new PIXI.ColorMatrixFilter();
        colorFilter.contrast(0.1);
        this.app.stage.filters = [colorFilter];
    }

    setup(charData) {
        const charAssets = CharacterFactory.createRaceTexture(this.app, charData.race, charData.color);
        this.playerFrames = charAssets.frames;
        
        // Тень игрока
        this.playerShadow = new PIXI.Sprite(charAssets.shadow);
        this.playerShadow.anchor.set(0.5);
        this.layers.SHADOWS.addChild(this.playerShadow);

        // Игрок
        this.player = new PIXI.Sprite(this.playerFrames[0]);
        this.player.anchor.set(0.5, 0.95);
        this.layers.WORLD_OBJECTS.addChild(this.player);
        
        this.moveSpeed = 220 + (charData.stats.dex * 10);
        this.updateScreenPositions();
    }

    updateScreenPositions() {
        const centerX = Math.floor(window.innerWidth / 2);
        const centerY = Math.floor(window.innerHeight / 2);
        if (this.player) {
            this.player.position.set(centerX, centerY);
            this.playerShadow.position.set(centerX, centerY + 2);
        }
    }

    update(dt, input) {
        if (!this.player) return;

        let moving = false;
        if (input.isKeyDown('KeyW')) { this.cameraPos.y -= this.moveSpeed * dt; moving = true; }
        if (input.isKeyDown('KeyS')) { this.cameraPos.y += this.moveSpeed * dt; moving = true; }
        if (input.isKeyDown('KeyA')) { this.cameraPos.x -= this.moveSpeed * dt; this.player.scale.x = -1; moving = true; }
        if (input.isKeyDown('KeyD')) { this.cameraPos.x += this.moveSpeed * dt; this.player.scale.x = 1; moving = true; }

        this.animTimer += dt;
        if (moving) {
            const frame = Math.floor(this.animTimer * 12) % 2;
            this.player.texture = this.playerFrames[frame];
            this.player.y = Math.floor(window.innerHeight / 2) + Math.sin(this.animTimer * 15) * 2;
        } else {
            this.player.texture = this.playerFrames[0];
            this.player.y = Math.floor(window.innerHeight / 2);
            this.player.scale.y = 1.0 + Math.sin(this.animTimer * 2) * 0.02;
        }

        // Синхронизация zIndex игрока с его мировой Y позицией
        this.player.zIndex = Math.floor(this.cameraPos.y);

        this.atmosphere.update(dt, this.cameraPos);
        this.manageChunks();
        this.renderWorld();
    }

    manageChunks() {
        const chunkPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        const curX = Math.floor(this.cameraPos.x / chunkPx);
        const curY = Math.floor(this.cameraPos.y / chunkPx);

        for (let x = curX - 1; x <= curX + 1; x++) {
            for (let y = curY - 1; y <= curY + 1; y++) {
                const key = `${x},${y}`;
                if (!this.loadedChunks.has(key)) this.createChunk(x, y);
            }
        }
        
        // Оптимизированная выгрузка
        if (this.loadedChunks.size > 12) {
            this.loadedChunks.forEach((chunk, key) => {
                const [cx, cy] = key.split(',').map(Number);
                if (Math.abs(cx - curX) > 2 || Math.abs(cy - curY) > 2) {
                    chunk.floor.destroy({ children: true });
                    chunk.objects.forEach(obj => obj.destroy());
                    chunk.roof.destroy({ children: true });
                    this.loadedChunks.delete(key);
                }
            });
        }
    }

    createChunk(cx, cy) {
        const floorCont = new PIXI.Container();
        const roofCont = new PIXI.Container();
        const objects = [];
        
        const chunkPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        floorCont.x = roofCont.x = cx * chunkPx;
        floorCont.y = roofCont.y = cy * chunkPx;

        for (let ty = 0; ty < CONFIG.CHUNK_SIZE; ty++) {
            for (let tx = 0; tx < CONFIG.CHUNK_SIZE; tx++) {
                const gx = cx * CONFIG.CHUNK_SIZE + tx;
                const gy = cy * CONFIG.CHUNK_SIZE + ty;
                const data = this.generator.getTileData(gx, gy);
                
                // Тайлы земли
                const tile = new PIXI.Sprite(this.baseTileTex);
                tile.position.set(tx * 32, ty * 32);
                tile.tint = data.isRoad ? 0x3d3126 : data.biome.color;
                floorCont.addChild(tile);

                // Дома
                if (data.structureType) {
                    const schema = BuildingTemplates.getHouseSchema(data.structureType);
                    schema.forEach(part => {
                        const s = new PIXI.Sprite(this.buildTextures[part.t]);
                        const worldX = (cx * chunkPx) + (tx + part.x) * 32;
                        const worldY = (cy * chunkPx) + (ty + part.y) * 32;
                        
                        s.position.set(worldX, worldY);
                        if (part.l === 'r') {
                            s.userData = { gx: gx + part.x, gy: gy + part.y };
                            roofCont.addChild(s);
                        } else {
                            s.zIndex = worldY + 16;
                            this.layers.WORLD_OBJECTS.addChild(s);
                            objects.push(s);
                        }
                    });
                }

                // Декор и деревья
                if (data.objectType && !data.structureType) {
                    const suffix = this.getTexSuffix(data.objectType, (gx + gy) % 3);
                    if (this.envTextures[suffix]) {
                        const obj = new PIXI.Sprite(this.envTextures[suffix]);
                        const worldX = (cx * chunkPx) + (tx * 32) + 16;
                        const worldY = (cy * chunkPx) + (ty * 32) + 32;
                        
                        obj.anchor.set(0.5, 0.95);
                        obj.position.set(worldX, worldY);
                        obj.zIndex = worldY;
                        
                        this.layers.WORLD_OBJECTS.addChild(obj);
                        objects.push(obj);
                    }
                }
            }
        }

        this.layers.FLOOR.addChild(floorCont);
        this.layers.ROOFS.addChild(roofCont);
        this.loadedChunks.set(`${cx},${cy}`, { floor: floorCont, objects, roof: roofCont });
    }

    getTexSuffix(type, variation) {
        const v = (variation % 3) + 1;
        if (type === 'forest') return v === 3 ? 'forest_flower' : `forest_tree_${v}`;
        if (type === 'wasteland') return `wasteland_ruin`;
        if (type === 'mountains') return v === 3 ? 'mountains_crystal' : `mountains_rock_${v}`;
        if (type === 'swamp') return `forest_tree_2`;
        return null;
    }

    handleRoofTransparency() {
        const px = Math.floor(this.cameraPos.x / 32);
        const py = Math.floor(this.cameraPos.y / 32);
        this.layers.ROOFS.children.forEach(chunk => {
            chunk.children.forEach(roof => {
                const distSq = Math.pow(roof.userData.gx - px, 2) + Math.pow(roof.userData.gy - py, 2);
                roof.alpha = distSq < 5 ? 0.25 : 1.0;
            });
        });
    }

    renderWorld() {
        const ox = Math.floor(-this.cameraPos.x + window.innerWidth / 2);
        const oy = Math.floor(-this.cameraPos.y + window.innerHeight / 2);
        
        // Смещаем основные слои
        this.layers.FLOOR.position.set(ox, oy);
        this.layers.WORLD_OBJECTS.position.set(ox, oy);
        this.layers.ROOFS.position.set(ox, oy);
        
        // Игрок всегда в центре экрана, но его мировые координаты меняются для zIndex
        const centerX = Math.floor(window.innerWidth / 2);
        const centerY = Math.floor(window.innerHeight / 2);
        
        // Коррекция позиции игрока в контейнере Y_SORTED
        this.player.x = this.cameraPos.x;
        this.player.y = this.cameraPos.y;
    }
}
