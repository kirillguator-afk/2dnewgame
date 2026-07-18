
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
        this.cameraPos = { x: 500000 * 32, y: 500000 * 32 };
        this.loadedChunks = new Map();
        this.entities = new Map();
        
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        
        this.worldContainer = new PIXI.Container();
        this.roofContainer = new PIXI.Container();
        this.atmosContainer = new PIXI.Container();

        this.app.stage.addChild(this.worldContainer);
        this.app.stage.addChild(this.roofContainer);
        this.app.stage.addChild(this.atmosContainer);
        
        this.generator = new TerrainGenerator(Date.now());
        this.kineticSystem = new KineticSystem();
        this.vfxSystem = new VfxSystem(this.app, this.app.stage);
        this.atmosphere = new AtmosphereSystem(this.app, this.atmosContainer);
        this.buildingSystem = new BuildingSystem(this);
        
        this.animTimer = 0;
        this.applyPostProcessing();
    }

    applyPostProcessing() {
        const colorMatrix = new PIXI.ColorMatrixFilter();
        colorMatrix.contrast(0.15);
        colorMatrix.saturate(0.05);
        this.app.stage.filters = [colorMatrix];
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
        
        // Shadow Sprite
        this.playerShadow = new PIXI.Sprite(charAssets.shadow);
        this.playerShadow.anchor.set(0.5);
        this.playerShadow.position.set(window.innerWidth / 2, window.innerHeight / 2);
        this.app.stage.addChildAt(this.playerShadow, CONFIG.LAYERS.PLAYER_SHADOW);

        // Player Sprite
        this.player = new PIXI.Sprite(this.playerFrames[0]);
        this.player.anchor.set(0.5, 1.0);
        this.player.position.set(window.innerWidth / 2, window.innerHeight / 2);
        this.app.stage.addChildAt(this.player, CONFIG.LAYERS.PLAYER);
        
        this.moveSpeed = 220 + (charData.stats.dex * 12);
        this.buildingSystem.setup();
    }

    update(dt, input) {
        if (!this.player) return;

        let moving = false;
        const prevPos = { ...this.cameraPos };

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

        // Оптимизированная выгрузка
        if (this.loadedChunks.size > 16) {
            for (const [key, chunk] of this.loadedChunks) {
                const [cx, cy] = key.split(',').map(Number);
                if (Math.abs(cx - curX) > 2 || Math.abs(cy - curY) > 2) {
                    chunk.body.destroy({ children: true });
                    chunk.roof.destroy({ children: true });
                    this.loadedChunks.delete(key);
                }
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
                tile.tint = data.isRoad ? 0x4a4e52 : data.biome.color;
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
                    const tex = this.envTextures[suffix];
                    if (tex) {
                        const obj = new PIXI.Sprite(tex);
                        obj.anchor.set(0.5, 1);
                        obj.position.set(tx * 32 + 16, ty * 32 + 32);
                        bodyCont.addChild(obj);
                    }
                }
            }
        }

        this.worldContainer.addChild(bodyCont);
        this.roofContainer.addChild(roofCont);
        this.loadedChunks.set(`${cx},${cy}`, { body: bodyCont, roof: roofCont });
    }

    getTexSuffix(type, variation) {
        const v = variation + 1;
        if (type === 'forest') return v === 3 ? 'forest_flower' : `forest_tree_${v}`;
        if (type === 'wasteland') return v === 1 ? 'wasteland_bush' : v === 2 ? 'wasteland_bones' : 'wasteland_ruin';
        if (type === 'mountains') return v === 3 ? 'mountains_crystal' : `mountains_rock_${v}`;
        if (type === 'swamp') return v === 3 ? 'swamp_reeds' : `swamp_mushroom_${v}`;
        return null;
    }

    handleRoofTransparency() {
        const px = Math.floor(this.cameraPos.x / 32);
        const py = Math.floor(this.cameraPos.y / 32);
        
        // Проверяем только ближайшие к игроку чанки (центральный + соседи)
        const chunkPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        const curX = Math.floor(this.cameraPos.x / chunkPx);
        const curY = Math.floor(this.cameraPos.y / chunkPx);

        for(let x = curX-1; x <= curX+1; x++) {
            for(let y = curY-1; y <= curY+1; y++) {
                const chunk = this.loadedChunks.get(`${x},${y}`);
                if (chunk) {
                    chunk.roof.children.forEach(roofTile => {
                        const dx = roofTile.userData.gx - px;
                        const dy = roofTile.userData.gy - py;
                        const distSq = dx*dx + dy*dy;
                        roofTile.alpha = distSq < 5 ? 0.25 : 1.0;
                    });
                }
            }
        }
    }

    renderChunks() {
        const ox = -this.cameraPos.x + window.innerWidth / 2;
        const oy = -this.cameraPos.y + window.innerHeight / 2;
        // Используем Math.round только для финальной отрисовки, чтобы избежать щелей
        this.worldContainer.position.set(Math.round(ox), Math.round(oy));
        this.roofContainer.position.set(Math.round(ox), Math.round(oy));
    }
}
