
import { TerrainGenerator } from './TerrainGenerator.js';
import { CharacterFactory } from '../entities/CharacterFactory.js';
import { NPCFactory } from '../entities/NPCFactory.js';
import { ObjectTemplates } from './objects/ObjectTemplates.js';
import { BuildingTemplates } from './objects/BuildingTemplates.js';
import { CONFIG, BIOMES } from '../core/Constants.js';

export class WorldManager {
    constructor(app) {
        this.app = app;
        this.cameraPos = { x: 500000 * 32, y: 500000 * 32 };
        this.loadedChunks = new Map();
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
        this.envTextures = ObjectTemplates.generate(this.app);
        this.buildTextures = BuildingTemplates.getTemplates(this.app);
    }

    setup(charData) {
        const assets = CharacterFactory.createRaceTexture(this.app, charData.race, charData.color);
        this.playerFrames = assets.frames;
        
        this.playerShadow = new PIXI.Sprite(assets.shadow);
        this.playerShadow.anchor.set(0.5);
        this.layers.SHADOWS.addChild(this.playerShadow);

        this.player = new PIXI.Sprite(this.playerFrames[0]);
        this.player.anchor.set(0.5, 0.95);
        this.layers.WORLD_OBJECTS.addChild(this.player);
        
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
            this.player.texture = this.playerFrames[Math.floor(this.animTimer * 10) % 2];
            // Плавное покачивание при ходьбе
            this.player.y = Math.floor(window.innerHeight / 2 + Math.sin(this.animTimer * 15) * 2);
        } else {
            this.player.texture = this.playerFrames[0];
            this.player.scale.y = 1.0 + Math.sin(this.animTimer * 2) * 0.02; // Дыхание
            this.player.y = Math.floor(window.innerHeight / 2);
        }

        this.updateNPCs(dt);

        this.player.x = Math.round(this.cameraPos.x);
        this.player.y = Math.round(this.cameraPos.y);
        this.player.zIndex = this.player.y;
        
        this.playerShadow.x = this.player.x;
        this.playerShadow.y = this.player.y + 2;

        this.manageChunks();
        this.renderWorld();
        this.handleTransparency();
    }

    updateNPCs(dt) {
        this.npcs.forEach(npc => {
            const data = npc.userData;
            data.timer -= dt;
            if (data.timer <= 0) {
                data.state = Math.random() > 0.6 ? 'walking' : 'idle';
                data.timer = 3 + Math.random() * 6;
                data.vx = data.state === 'walking' ? (Math.random() - 0.5) * 40 : 0;
                data.vy = data.state === 'walking' ? (Math.random() - 0.5) * 40 : 0;
            }

            if (data.state === 'walking') {
                npc.x += data.vx * dt;
                npc.y += data.vy * dt;
                if (data.vx !== 0) npc.scale.x = data.vx > 0 ? 1 : -1;
            }
            npc.zIndex = Math.floor(npc.y);
        });
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
                    chunk.worldObjects.forEach(obj => {
                        const index = this.npcs.indexOf(obj);
                        if (index > -1) this.npcs.splice(index, 1);
                        obj.destroy();
                    });
                    this.loadedChunks.delete(key);
                }
            }
        }
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
                
                const tileId = data.isRoad ? 'road' : data.biome.id;
                const tile = new PIXI.Sprite(this.envTextures[`tile_${tileId}`]);
                tile.position.set(tx * 32, ty * 32);
                floor.addChild(tile);

                if (data.structureType) {
                    BuildingTemplates.getHouseSchema(data.structureType).forEach(p => {
                        const wx = (cx * chunkPx) + (tx + p.x) * 32;
                        const wy = (cy * chunkPx) + (ty + p.y) * 32;
                        
                        if (p.l === 'r') {
                            const s = new PIXI.Sprite(this.buildTextures[p.t]);
                            s.position.set((tx + p.x) * 32, (ty + p.y) * 32);
                            s.userData = { gx: gx + p.x, gy: gy + p.y };
                            roofs.addChild(s);
                        } else {
                            const tex = p.l === 'd' ? this.envTextures[p.t] : this.buildTextures[p.t];
                            const s = new PIXI.Sprite(tex);
                            s.position.set(wx, wy);
                            s.zIndex = wy + 16;
                            this.layers.WORLD_OBJECTS.addChild(s);
                            worldObjects.push(s);
                        }
                    });

                    // Спавн NPC Жителя
                    if (gx % 15 === 0 && gy % 15 === 0) {
                        const npc = NPCFactory.createNPC(this.app, 'villager', '#3498db');
                        npc.position.set((cx * chunkPx) + tx * 32 + 16, (cy * chunkPx) + ty * 32 + 40);
                        this.layers.WORLD_OBJECTS.addChild(npc);
                        this.npcs.push(npc);
                        worldObjects.push(npc);
                    }
                }

                // Спавн NPC Рыцаря на дорогах
                if (data.isRoad && Math.random() > 0.99) {
                    const knight = NPCFactory.createNPC(this.app, 'knight', '#ecf0f1');
                    knight.position.set((cx * chunkPx) + tx * 32 + 16, (cy * chunkPx) + ty * 32 + 16);
                    this.layers.WORLD_OBJECTS.addChild(knight);
                    this.npcs.push(knight);
                    worldObjects.push(knight);
                }

                // Спавн Торговца возле таверн
                if (data.structureType === 'tavern' && tx === 0 && ty === 0) {
                    const merchant = NPCFactory.createNPC(this.app, 'merchant', '#f1c40f');
                    merchant.position.set((cx * chunkPx) + tx * 32 - 16, (cy * chunkPx) + ty * 32 + 48);
                    this.layers.WORLD_OBJECTS.addChild(merchant);
                    this.npcs.push(merchant);
                    worldObjects.push(merchant);
                }

                if (data.decoType && !data.structureType) {
                    const tex = this.envTextures[data.decoType];
                    const obj = data.isAnimated ? new PIXI.AnimatedSprite(tex) : new PIXI.Sprite(tex);
                    const wx = (cx * chunkPx) + tx * 32 + 16;
                    const wy = (cy * chunkPx) + ty * 32 + 32;
                    obj.anchor.set(0.5, 0.95);
                    obj.position.set(wx, wy);
                    obj.zIndex = wy;
                    if (data.isAnimated) { obj.animationSpeed = 0.1; obj.play(); }
                    this.layers.WORLD_OBJECTS.addChild(obj);
                    worldObjects.push(obj);
                }
            }
        }
        
        this.layers.FLOOR.addChild(floor);
        this.layers.ROOFS.addChild(roofs);
        this.loadedChunks.set(`${cx},${cy}`, { floor, roofs, worldObjects });
    }

    handleTransparency() {
        const px = Math.floor(this.cameraPos.x / 32);
        const py = Math.floor(this.cameraPos.y / 32);
        this.layers.ROOFS.children.forEach(chunk => {
            chunk.children.forEach(r => {
                const dx = r.userData.gx - px, dy = r.userData.gy - py;
                r.alpha = (dx*dx + dy*dy < 5) ? 0.3 : 1.0;
            });
        });
    }

    renderWorld() {
        const ox = Math.floor(window.innerWidth / 2 - this.cameraPos.x);
        const oy = Math.floor(window.innerHeight / 2 - this.cameraPos.y);
        this.layers.FLOOR.position.set(ox, oy);
        this.layers.SHADOWS.position.set(ox, oy);
        this.layers.WORLD_OBJECTS.position.set(ox, oy);
        this.layers.ROOFS.position.set(ox, oy);
    }
}
