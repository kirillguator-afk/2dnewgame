
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
            this.player.scale.y = 1.0 + Math.sin(this.animTimer * 2) * 0.02;
            this.player.y = Math.floor(window.innerHeight / 2);
        }

        this.updateAI(dt);
        this.player.x = Math.round(this.cameraPos.x);
        this.player.y = Math.round(this.cameraPos.y);
        this.player.zIndex = this.player.y;
        this.playerShadow.position.set(this.player.x, this.player.y + 2);

        this.manageChunks();
        this.renderWorld();
        this.handleTransparency();
    }

    updateAI(dt) {
        this.npcs.forEach(npc => {
            const d = npc.userData;
            d.timer -= dt;
            if (d.timer <= 0) {
                d.state = Math.random() > 0.6 ? 'walking' : 'idle';
                d.timer = 4 + Math.random() * 6;
                d.vx = d.state === 'walking' ? (Math.random() - 0.5) * 30 : 0;
                d.vy = d.state === 'walking' ? (Math.random() - 0.5) * 30 : 0;
            }
            if (d.state === 'walking') {
                npc.x += d.vx * dt; npc.y += d.vy * dt;
                if (d.vx !== 0) npc.scale.x = d.vx > 0 ? 1 : -1;
            }
            npc.zIndex = Math.floor(npc.y);
        });
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
                
                const tile = new PIXI.Sprite(this.envTextures[`tile_${data.biome.id}`]);
                tile.position.set(tx * 32, ty * 32);
                floor.addChild(tile);

                if (data.structure) {
                    BuildingTemplates.getHouseSchema(data.structure).forEach(p => {
                        const wx = (gx + p.x) * 32;
                        const wy = (gy + p.y) * 32;
                        const tex = p.anim ? (this.envTextures[p.t] || this.envTextures.animated_magic_fire) : (this.envTextures[p.t] || this.buildTextures[p.t]);
                        
                        if (p.l === 'r') {
                            const s = new PIXI.Sprite(tex);
                            s.position.set((gx - cx * CONFIG.CHUNK_SIZE + p.x) * 32, (gy - cy * CONFIG.CHUNK_SIZE + p.y) * 32);
                            s.userData = { gx: gx + p.x, gy: gy + p.y };
                            roofs.addChild(s);
                        } else {
                            const s = p.anim ? new PIXI.AnimatedSprite(tex) : new PIXI.Sprite(tex);
                            s.position.set(wx, wy); s.zIndex = wy + 16;
                            if(p.anim) { s.animationSpeed=0.1; s.play(); }
                            this.layers.WORLD_OBJECTS.addChild(s);
                            worldObjects.push(s);
                        }
                    });

                    // Спавн NPC Стражников у Цитадели
                    if (data.biome.id === 'citadel' && gx % 8 === 0) {
                        const guard = NPCFactory.createNPC(this.app, 'knight', '#ecf0f1');
                        guard.position.set(gx * 32 + 16, gy * 32 + 48);
                        this.layers.WORLD_OBJECTS.addChild(guard);
                        this.npcs.push(guard);
                        worldObjects.push(guard);
                    }
                }

                if (data.deco && !data.structure) {
                    const tex = this.envTextures[data.deco];
                    const obj = Array.isArray(tex) ? new PIXI.AnimatedSprite(tex) : new PIXI.Sprite(tex);
                    obj.anchor.set(0.5, 0.95);
                    obj.position.set(gx * 32 + 16, gy * 32 + 32);
                    obj.zIndex = obj.y;
                    if (Array.isArray(tex)) { obj.animationSpeed = 0.1; obj.play(); }
                    this.layers.WORLD_OBJECTS.addChild(obj);
                    worldObjects.push(obj);
                }

                if (data.npc && !data.structure) {
                    const npc = NPCFactory.createNPC(this.app, data.npc, '#ffffff');
                    npc.position.set(gx * 32 + 16, gy * 32 + 16);
                    this.layers.WORLD_OBJECTS.addChild(npc);
                    this.npcs.push(npc);
                    worldObjects.push(npc);
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
                    chunk.worldObjects.forEach(obj => {
                        const idx = this.npcs.indexOf(obj);
                        if(idx > -1) this.npcs.splice(idx, 1);
                        obj.destroy();
                    });
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
            r.alpha = (dx*dx + dy*dy < 12) ? 0.3 : 1.0;
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
