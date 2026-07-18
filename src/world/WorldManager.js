
import { TerrainGenerator } from './TerrainGenerator.js';
import { CharacterFactory } from '../entities/CharacterFactory.js';
import { NPCFactory } from '../entities/NPCFactory.js';
import { ObjectTemplates } from './objects/ObjectTemplates.js';
import { BuildingTemplates } from './objects/BuildingTemplates.js';
import { CONFIG, BIOMES } from '../core/Constants.js';

export class WorldManager {
    constructor(app) {
        this.app = app;
        this.cameraPos = { x: CONFIG.KINGDOM_CENTER * 32, y: CONFIG.KINGDOM_CENTER * 32 };
        this.loadedChunks = new Map();
        
        // ФИКС: Гарантированная установка BIOMES до начала работы других систем
        window.BIOMES_REF = BIOMES;
        
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this.layers = {};
        this.initLayers();
        this.generator = new TerrainGenerator(Date.now());
        this.animTimer = 0;
        this.player = null;
        this.npcs = [];
    }

    initLayers() {
        const sorted = Object.entries(CONFIG.LAYERS).sort((a,b) => a[1] - b[1]);
        sorted.forEach(([name]) => {
            const c = new PIXI.Container();
            if (name === 'WORLD_OBJECTS') c.sortableChildren = true;
            this.app.stage.addChild(c);
            this.layers[name] = c;
        });
    }

    async loadResources() {
        this.envTextures = ObjectTemplates.generate(this.app, BIOMES);
        this.buildTextures = BuildingTemplates.getTemplates(this.app);
    }

    setup(charData) {
        const assets = CharacterFactory.createRaceTexture(this.app, charData.raceId || 'HUMAN', charData.color);
        this.playerFrames = assets.frames;
        this.playerShadow = new PIXI.Sprite(assets.shadow);
        this.playerShadow.anchor.set(0.5);
        this.layers.SHADOWS.addChild(this.playerShadow);
        
        this.player = new PIXI.Sprite(this.playerFrames[0]);
        this.player.anchor.set(0.5, 0.95);
        this.layers.WORLD_OBJECTS.addChild(this.player);
        
        this.moveSpeed = 240 + (charData.stats.dex * 10);
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
            this.player.texture = this.playerFrames[Math.floor(this.animTimer * 10) % 2];
            this.player.y = Math.floor(window.innerHeight / 2 + Math.sin(this.animTimer * 15) * 2);
        } else {
            this.player.texture = this.playerFrames[0];
            this.player.y = Math.floor(window.innerHeight / 2);
        }

        this.player.x = Math.round(this.cameraPos.x);
        this.player.y = Math.round(this.cameraPos.y);
        this.player.zIndex = this.player.y;
        this.playerShadow.position.set(this.player.x, this.player.y + 2);

        this.manageChunks();
        this.renderWorld();
        this.handleTransparency();
    }

    createChunk(cx, cy) {
        const floor = new PIXI.Container();
        const roofs = new PIXI.Container();
        const worldObjects = [];
        const chunkPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        floor.position.set(cx * chunkPx, cy * chunkPx);
        roofs.position.set(cx * chunkPx, cy * chunkPx);

        for (let ty = 0; ty < CONFIG.CHUNK_SIZE; ty++) {
            for (let tx = 0; tx < CONFIG.CHUNK_SIZE; tx++) {
                const gx = cx * CONFIG.CHUNK_SIZE + tx;
                const gy = cy * CONFIG.CHUNK_SIZE + ty;
                const data = this.generator.getTileData(gx, gy);
                
                const tile = new PIXI.Sprite(this.envTextures[`tile_${data.isRoad?'road':data.biome.id}`]);
                tile.position.set(tx * 32, ty * 32);
                floor.addChild(tile);

                if (data.structure) {
                    BuildingTemplates.getHouseSchema(data.structure).forEach(p => {
                        const wx = (gx + p.x) * 32;
                        const wy = (gy + p.y) * 32;
                        const tex = this.envTextures[p.t] || this.buildTextures[p.t] || this.envTextures.floor_planks;
                        if (p.l === 'r') {
                            const s = new PIXI.Sprite(tex);
                            s.position.set((tx + p.x) * 32, (ty + p.y) * 32);
                            s.userData = { gx: gx + p.x, gy: gy + p.y };
                            roofs.addChild(s);
                        } else {
                            const s = new PIXI.Sprite(tex);
                            s.position.set(wx, wy); s.zIndex = wy + 16;
                            this.layers.WORLD_OBJECTS.addChild(s);
                            worldObjects.push(s);
                        }
                    });
                }

                if (data.deco) {
                    const tex = this.envTextures[data.deco];
                    if (tex) {
                        const obj = new PIXI.Sprite(tex);
                        obj.anchor.set(0.5, 0.95);
                        obj.position.set(gx * 32 + 16, gy * 32 + 32);
                        obj.zIndex = obj.y;
                        this.layers.WORLD_OBJECTS.addChild(obj);
                        worldObjects.push(obj);
                    }
                }
            }
        }
        this.layers.FLOOR.addChild(floor);
        this.layers.STRUCTURE_ROOF.addChild(roofs);
        this.loadedChunks.set(`${cx},${cy}`, { floor, roofs, worldObjects });
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
        if (this.loadedChunks.size > 12) {
            for (const [key, chunk] of this.loadedChunks) {
                const [cx, cy] = key.split(',').map(Number);
                if (Math.abs(cx - curX) > 2 || Math.abs(cy - curY) > 2) {
                    chunk.floor.destroy({ children: true });
                    chunk.roofs.destroy({ children: true });
                    chunk.worldObjects.forEach(obj => obj.destroy());
                    this.loadedChunks.delete(key);
                }
            }
        }
    }

    handleTransparency() {
        const px = Math.floor(this.cameraPos.x / 32);
        const py = Math.floor(this.cameraPos.y / 32);
        this.layers.STRUCTURE_ROOF.children.forEach(c => c.children.forEach(r => {
            const dx = r.userData.gx - px, dy = r.userData.gy - py;
            r.alpha = (dx*dx + dy*dy < 9) ? 0.3 : 1.0;
        }));
    }

    renderWorld() {
        const ox = Math.floor(window.innerWidth / 2 - this.cameraPos.x);
        const oy = Math.floor(window.innerHeight / 2 - this.cameraPos.y);
        this.layers.FLOOR.position.set(ox, oy);
        this.layers.SHADOWS.position.set(ox, oy);
        this.layers.WORLD_OBJECTS.position.set(ox, oy);
        this.layers.STRUCTURE_ROOF.position.set(ox, oy);
    }
}
