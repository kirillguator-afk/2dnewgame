
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
        this.generator = new TerrainGenerator(Date.now());
        
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        
        this.layers = {};
        this.setupLayers();
        this.animTimer = 0;
    }

    setupLayers() {
        Object.entries(CONFIG.LAYERS).sort((a,b)=>a[1]-b[1]).forEach(([name]) => {
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
        const charAssets = CharacterFactory.createRaceTexture(this.app, charData.race, charData.color);
        this.playerFrames = charAssets.frames;
        this.playerShadow = new PIXI.Sprite(charAssets.shadow);
        this.playerShadow.anchor.set(0.5);
        this.layers.SHADOWS.addChild(this.playerShadow);

        this.player = new PIXI.Sprite(this.playerFrames[0]);
        this.player.anchor.set(0.5, 0.95);
        this.layers.WORLD_OBJECTS.addChild(this.player);
        
        this.player.position.set(window.innerWidth/2, window.innerHeight/2);
        this.playerShadow.position.set(window.innerWidth/2, window.innerHeight/2);
        this.moveSpeed = 250 + (charData.stats.dex * 10);
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
            this.player.y = (window.innerHeight/2) + Math.sin(this.animTimer * 15) * 2;
        } else {
            this.player.texture = this.playerFrames[0];
            this.player.scale.y = 1.0 + Math.sin(this.animTimer * 2) * 0.02;
        }

        this.player.zIndex = Math.floor(this.cameraPos.y);
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
                        s.position.set((cx*chunkPx)+(tx+p.x)*32, (cy*chunkPx)+(ty+p.y)*32);
                        if (p.l === 'r') roofs.addChild(s);
                        else { s.zIndex = s.y + 16; this.layers.WORLD_OBJECTS.addChild(s); }
                    });
                }

                if (data.decoType) {
                    const tex = this.envTextures[data.decoType];
                    const obj = data.isAnimated ? new PIXI.AnimatedSprite(tex) : new PIXI.Sprite(tex);
                    obj.anchor.set(0.5, 0.95);
                    obj.position.set((cx*chunkPx)+tx*32+16, (cy*chunkPx)+ty*32+32);
                    obj.zIndex = obj.y;
                    if (data.isAnimated) { obj.animationSpeed = 0.1; obj.play(); }
                    this.layers.WORLD_OBJECTS.addChild(obj);
                }
            }
        }
        this.layers.FLOOR.addChild(floor);
        this.layers.ROOFS.addChild(roofs);
        this.loadedChunks.set(`${cx},${cy}`, { floor, roofs });
    }

    renderWorld() {
        const ox = Math.floor(-this.cameraPos.x + window.innerWidth/2);
        const oy = Math.floor(-this.cameraPos.y + window.innerHeight/2);
        this.layers.FLOOR.position.set(ox, oy);
        this.layers.WORLD_OBJECTS.position.set(ox, oy);
        this.layers.ROOFS.position.set(ox, oy);
        this.player.x = this.cameraPos.x;
        this.player.y = this.cameraPos.y;
        this.playerShadow.x = this.cameraPos.x;
        this.playerShadow.y = this.cameraPos.y;
    }
}
