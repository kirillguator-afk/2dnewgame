
import { KineticSystem } from '../systems/KineticSystem.js';
import { BuildingSystem } from './BuildingSystem.js';
import { TerrainGenerator } from './TerrainGenerator.js';
import { VfxSystem } from '../systems/VfxSystem.js';
import { AtmosphereSystem } from '../systems/AtmosphereSystem.js';
import { CharacterFactory } from '../entities/CharacterFactory.js';
import { ObjectTemplates } from './objects/ObjectTemplates.js';
import { BuildingTemplates } from './objects/BuildingTemplates.js';
import { CONFIG, BIOMES } from '../core/Constants.js';

export class WorldManager {
    constructor(app) {
        this.app = app;
        // Центр мира в пикселях
        this.cameraPos = { x: 500000 * 32, y: 500000 * 32 };
        this.loadedChunks = new Map();
        this.entities = new Map();
        
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        
        // Инициализация слоев (Containers)
        this.layers = {};
        Object.keys(CONFIG.LAYERS).forEach(key => {
            const container = new PIXI.Container();
            this.app.stage.addChild(container);
            this.layers[key] = container;
        });

        this.generator = new TerrainGenerator(Date.now());
        this.kineticSystem = new KineticSystem();
        this.vfxSystem = new VfxSystem(this.app, this.layers.VFX);
        this.atmosphere = new AtmosphereSystem(this.app, this.layers.ATMOSPHERE);
        this.buildingSystem = new BuildingSystem(this);
        
        this.animTimer = 0;
    }

    async loadResources() {
        this.envTextures = ObjectTemplates.generate(this.app);
        this.buildTextures = BuildingTemplates.getTemplates(this.app);
        const g = new PIXI.Graphics();
        g.beginFill(0xFFFFFF).drawRect(0, 0, 32, 32).endFill();
        this.baseTileTex = this.app.renderer.generateTexture(g);
    }

    setup(charData) {
        this.charData = charData;
        const charAssets = CharacterFactory.createRaceTexture(this.app, charData.race, charData.color);
        this.playerFrames = charAssets.frames;
        
        // Тень
        this.playerShadow = new PIXI.Sprite(charAssets.shadow);
        this.playerShadow.anchor.set(0.5);
        this.layers.PLAYER_SHADOW.addChild(this.playerShadow);

        // Персонаж
        this.player = new PIXI.Sprite(this.playerFrames[0]);
        this.player.anchor.set(0.5, 1.0);
        this.layers.PLAYER.addChild(this.player);
        
        // Фиксация позиции игрока по центру экрана
        this.player.position.set(window.innerWidth / 2, window.innerHeight / 2);
        this.playerShadow.position.set(window.innerWidth / 2, window.innerHeight / 2);

        this.moveSpeed = 220 + (charData.stats.dex * 10);
        this.buildingSystem.setup();
    }

    update(dt, input) {
        if (!this.player) return;

        let moving = false;
        if (input.isKeyDown('KeyW')) { this.cameraPos.y -= this.moveSpeed * dt; moving = true; }
        if (input.isKeyDown('KeyS')) { this.cameraPos.y += this.moveSpeed * dt; moving = true; }
        if (input.isKeyDown('KeyA')) { this.cameraPos.x -= this.moveSpeed * dt; this.player.scale.x = -1; moving = true; }
        if (input.isKeyDown('KeyD')) { this.cameraPos.x += this.moveSpeed * dt; this.player.scale.x = 1; moving = true; }

        if (moving) {
            this.animTimer += dt * 8;
            const frame = Math.floor(this.animTimer) % 2;
            this.player.texture = this.playerFrames[frame];
            this.player.y = (window.innerHeight / 2) + Math.sin(this.animTimer * 1.5) * 2;
        } else {
            this.animTimer += dt * 2;
            this.player.texture = this.playerFrames[0];
            this.player.scale.y = 1.0 + Math.sin(this.animTimer) * 0.015;
            this.player.y = window.innerHeight / 2;
        }

        this.atmosphere.update(dt, this.cameraPos);
        this.manageChunks();
        this.renderChunks();
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
    }

    createChunk(cx, cy) {
        const bodyCont = new PIXI.Container();
        const roofCont = new PIXI.Container();
        const chunkPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        bodyCont.x = roofCont.x = cx * chunkPx;
        bodyCont.y = roofCont.y = cy * chunkPx;

        for (let ty = 0; ty < CONFIG.CHUNK_SIZE; ty++) {
            for (let tx = 0; tx < CONFIG.CHUNK_SIZE; tx++) {
                const gx = cx * CONFIG.CHUNK_SIZE + tx;
                const gy = cy * CONFIG.CHUNK_SIZE + ty;
                const data = this.generator.getTileData(gx, gy);
                
                const tile = new PIXI.Sprite(this.baseTileTex);
                tile.position.set(tx * 32, ty * 32);
                tile.tint = data.isRoad ? 0x3a3a3a : data.biome.color;
                bodyCont.addChild(tile);

                if (data.structureType) {
                    const schema = BuildingTemplates.getHouseSchema(data.structureType);
                    schema.forEach(part => {
                        const s = new PIXI.Sprite(this.buildTextures[part.t]);
                        s.position.set((tx + part.x) * 32, (ty + part.y) * 32);
                        if (part.l === 'r') {
                            s.userData = { gx: gx + part.x, gy: gy + part.y };
                            roofCont.addChild(s);
                        } else bodyCont.addChild(s);
                    });
                }

                if (data.objectType && !data.structureType) {
                    const suffix = this.getTexSuffix(data.objectType, (gx + gy) % 3);
                    if (this.envTextures[suffix]) {
                        const obj = new PIXI.Sprite(this.envTextures[suffix]);
                        obj.anchor.set(0.5, 1);
                        obj.position.set(tx * 32 + 16, ty * 32 + 32);
                        bodyCont.addChild(obj);
                    }
                }
            }
        }

        this.layers.FLOOR.addChild(bodyCont);
        this.layers.STRUCTURE_ROOF.addChild(roofCont);
        this.loadedChunks.set(`${cx},${cy}`, { body: bodyCont, roof: roofCont });
    }

    getTexSuffix(type, variation) {
        const v = (variation % 3) + 1;
        if (type === 'forest') return v === 3 ? 'forest_flower' : `forest_tree_${v}`;
        if (type === 'wasteland') return v === 1 ? 'wasteland_bush' : v === 2 ? 'wasteland_bones' : 'wasteland_ruin';
        if (type === 'mountains') return v === 3 ? 'mountains_crystal' : `mountains_rock_${v}`;
        if (type === 'swamp') return v === 3 ? 'swamp_reeds' : `swamp_mushroom_${v}`;
        return null;
    }

    handleRoofTransparency() {
        const px = Math.floor(this.cameraPos.x / 32);
        const py = Math.floor(this.cameraPos.y / 32);
        
        this.loadedChunks.forEach(chunk => {
            chunk.roof.children.forEach(roofTile => {
                const distSq = Math.pow(roofTile.userData.gx - px, 2) + Math.pow(roofTile.userData.gy - py, 2);
                roofTile.alpha = distSq < 4 ? 0.2 : 1.0;
            });
        });
    }

    renderChunks() {
        const ox = Math.round(-this.cameraPos.x + window.innerWidth / 2);
        const oy = Math.round(-this.cameraPos.y + window.innerHeight / 2);
        
        this.layers.FLOOR.position.set(ox, oy);
        this.layers.STRUCTURE_ROOF.position.set(ox, oy);
        this.layers.VFX.position.set(ox, oy);
    }
}
