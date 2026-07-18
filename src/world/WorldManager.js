
import { TerrainGenerator } from './TerrainGenerator.js';
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
        
        this.layers = {};
        this.setupLayers();

        this.generator = new TerrainGenerator(Date.now());
        this.animTimer = 0;
        this.player = null;
    }

    setupLayers() {
        const sortedLayers = Object.entries(CONFIG.LAYERS).sort((a, b) => a[1] - b[1]);
        sortedLayers.forEach(([name]) => {
            const container = new PIXI.Container();
            if (name === 'WORLD_OBJECTS') container.sortableChildren = true;
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
    }

    setup(charData) {
        const charAssets = CharacterFactory.createRaceTexture(this.app, charData.race, charData.color);
        this.playerFrames = charAssets.frames;
        
        this.layers.SHADOWS.removeChildren();
        this.layers.WORLD_OBJECTS.removeChildren();

        this.playerShadow = new PIXI.Sprite(charAssets.shadow);
        this.playerShadow.anchor.set(0.5);
        this.layers.SHADOWS.addChild(this.playerShadow);

        this.player = new PIXI.Sprite(this.playerFrames[0]);
        this.player.anchor.set(0.5, 0.95);
        this.layers.WORLD_OBJECTS.addChild(this.player);
        
        this.player.position.set(window.innerWidth / 2, window.innerHeight / 2);
        this.playerShadow.position.set(window.innerWidth / 2, window.innerHeight / 2);

        this.moveSpeed = 220 + (charData.stats.dex * 10);
        this.manageChunks();
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
            const frame = Math.floor(this.animTimer * 10) % 2;
            this.player.texture = this.playerFrames[frame];
            this.player.y = (window.innerHeight / 2) + Math.sin(this.animTimer * 12) * 2;
        } else {
            this.player.texture = this.playerFrames[0];
            this.player.scale.y = 1.0 + Math.sin(this.animTimer * 2) * 0.015;
            this.player.y = (window.innerHeight / 2) + Math.sin(this.animTimer * 2) * 1;
        }

        this.player.zIndex = Math.floor(this.cameraPos.y);

        this.manageChunks();
        this.renderWorld();
        this.handleRoofTransparency();
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
        
        // Очистка старых чанков
        if (this.loadedChunks.size > 20) {
            for (const [key, chunk] of this.loadedChunks) {
                const [cx, cy] = key.split(',').map(Number);
                if (Math.abs(cx - curX) > 2 || Math.abs(cy - curY) > 2) {
                    chunk.floor.destroy({ children: true });
                    chunk.objects.forEach(obj => obj.destroy());
                    chunk.roof.destroy({ children: true });
                    this.loadedChunks.delete(key);
                }
            }
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
                
                const tile = new PIXI.Sprite(this.baseTileTex);
                tile.position.set(tx * 32, ty * 32);
                tile.tint = data.isRoad ? 0x3d3126 : data.biome.color;
                floorCont.addChild(tile);

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

                // Декор (Обычный или Анимированный)
                if (data.decoType) {
                    const texData = this.envTextures[data.decoType];
                    let deco;
                    
                    if (data.isAnimated && Array.isArray(texData)) {
                        deco = new PIXI.AnimatedSprite(texData);
                        deco.animationSpeed = 0.1 + (Math.random() * 0.05);
                        deco.play();
                    } else {
                        deco = new PIXI.Sprite(texData);
                    }

                    const worldX = (cx * chunkPx) + (tx * 32) + 16;
                    const worldY = (cy * chunkPx) + (ty * 32) + 32;
                    deco.anchor.set(0.5, 0.95);
                    deco.position.set(worldX, worldY);
                    deco.zIndex = worldY;
                    this.layers.WORLD_OBJECTS.addChild(deco);
                    objects.push(deco);
                }

                // Природные объекты (Статика)
                if (data.objectType && !data.structureType && !data.decoType) {
                    const suffix = this.getTexSuffix(data.objectType, (gx + gy) % 3);
                    const tex = this.envTextures[suffix];
                    if (tex) {
                        const obj = new PIXI.Sprite(tex);
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
        if (type === 'wasteland') return `forest_tree_2`; // Заглушка для пустоши
        if (type === 'mountains') return `mountains_rock_1`;
        if (type === 'swamp') return `forest_tree_1`;
        return null;
    }

    handleRoofTransparency() {
        const px = Math.floor(this.cameraPos.x / 32);
        const py = Math.floor(this.cameraPos.y / 32);
        this.layers.ROOFS.children.forEach(chunk => {
            chunk.children.forEach(roof => {
                const distSq = Math.pow(roof.userData.gx - px, 2) + Math.pow(roof.userData.gy - py, 2);
                roof.alpha = distSq < 5 ? 0.3 : 1.0;
            });
        });
    }

    renderWorld() {
        const ox = Math.floor(-this.cameraPos.x + window.innerWidth / 2);
        const oy = Math.floor(-this.cameraPos.y + window.innerHeight / 2);
        this.layers.FLOOR.position.set(ox, oy);
        this.layers.WORLD_OBJECTS.position.set(ox, oy);
        this.layers.ROOFS.position.set(ox, oy);
        this.player.x = this.cameraPos.x;
        this.player.y = this.cameraPos.y;
        this.playerShadow.x = this.cameraPos.x;
        this.playerShadow.y = this.cameraPos.y;
    }
}
