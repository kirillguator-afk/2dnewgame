
import { TerrainGenerator } from './TerrainGenerator.js';
import { CharacterFactory } from '../entities/CharacterFactory.js';
import { ObjectTemplates } from './objects/ObjectTemplates.js';
import { BuildingTemplates } from './objects/BuildingTemplates.js';
import { CONFIG, BIOMES } from '../core/Constants.js';

export class WorldManager {
    constructor(app) {
        this.app = app;
        this.cameraPos = { x: 500000 * 32, y: 500000 * 32 };
        this.loadedChunks = new Map();
        window.BIOMES_REF = BIOMES; // Для ObjectTemplates
        
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        
        this.layers = {};
        this.initLayers();

        this.generator = new TerrainGenerator(Date.now());
        this.animTimer = 0;
        this.player = null;
    }

    initLayers() {
        Object.entries(CONFIG.LAYERS).sort((a,b) => a[1] - b[1]).forEach(([name]) => {
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
            this.player.y = Math.floor(window.innerHeight / 2 + Math.sin(this.animTimer * 15) * 2);
        } else {
            this.player.texture = this.playerFrames[0];
            this.player.scale.y = 1.0 + Math.sin(this.animTimer * 2) * 0.02;
            this.player.y = Math.floor(window.innerHeight / 2);
        }

        this.player.zIndex = Math.floor(this.cameraPos.y);
        this.manageChunks();
        this.renderWorld();
        this.handleTransparency();
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
    }

    createChunk(cx, cy) {
        const floor = new PIXI.Container();
        const roofs = new PIXI.Container();
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

                if (data.structureType) {
                    BuildingTemplates.getHouseSchema(data.structureType).forEach(p => {
                        const s = new PIXI.Sprite(this.buildTextures[p.t]);
                        const wx = (cx * chunkPx) + (tx + p.x) * 32;
                        const wy = (cy * chunkPx) + (ty + p.y) * 32;
                        if (p.l === 'r') {
                            s.position.set((tx + p.x) * 32, (ty + p.y) * 32);
                            s.userData = { gx: gx + p.x, gy: gy + p.y };
                            roofs.addChild(s);
                        } else {
                            s.position.set(wx, wy);
                            s.zIndex = wy + 16;
                            this.layers.WORLD_OBJECTS.addChild(s);
                        }
                    });
                }

                if (data.decoType) {
                    const tex = this.envTextures[data.decoType];
                    const obj = data.isAnimated ? new PIXI.AnimatedSprite(tex) : new PIXI.Sprite(tex);
                    const wx = (cx * chunkPx) + tx * 32 + 16;
                    const wy = (cy * chunkPx) + ty * 32 + 32;
                    obj.anchor.set(0.5, 0.95);
                    obj.position.set(wx, wy);
                    obj.zIndex = wy;
                    if (data.isAnimated) { obj.animationSpeed = 0.1; obj.play(); }
                    this.layers.WORLD_OBJECTS.addChild(obj);
                }
            }
        }
        this.layers.FLOOR.addChild(floor);
        this.layers.ROOFS.addChild(roofs);
        this.loadedChunks.set(`${cx},${cy}`, { floor, roofs });
    }

    handleTransparency() {
        const px = Math.floor(this.cameraPos.x / 32);
        const py = Math.floor(this.cameraPos.y / 32);
        this.layers.ROOFS.children.forEach(chunk => {
            chunk.children.forEach(r => {
                const dx = r.userData.gx - px;
                const dy = r.userData.gy - py;
                r.alpha = (dx*dx + dy*dy < 4) ? 0.3 : 1.0;
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
        this.player.position.set(this.cameraPos.x, this.cameraPos.y);
        this.playerShadow.position.set(this.cameraPos.x, this.cameraPos.y + 2);
    }
}
