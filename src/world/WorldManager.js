
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
        
        // Слои
        this.worldContainer = new PIXI.Container();
        this.roofContainer = new PIXI.Container();
        this.atmosContainer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();

        this.app.stage.addChild(this.worldContainer);
        this.app.stage.addChild(this.roofContainer);
        this.app.stage.addChild(this.atmosContainer);
        this.app.stage.addChild(this.uiLayer);
        
        // Шейдеры пост-обработки
        this.applyPostProcessing();

        this.generator = new TerrainGenerator(Date.now());
        this.kineticSystem = new KineticSystem();
        this.vfxSystem = new VfxSystem(this.app, this.app.stage);
        this.atmosphere = new AtmosphereSystem(this.app, this.atmosContainer);
        this.buildingSystem = new BuildingSystem(this);
        
        this.animTimer = 0;
    }

    applyPostProcessing() {
        // Виньетка и цветокоррекция
        const colorMatrix = new PIXI.ColorMatrixFilter();
        colorMatrix.contrast(0.2);
        colorMatrix.saturate(0.1);
        
        // Мягкое свечение (Bloom)
        // Примечание: В базовом PixiJS Bloom может требовать отдельного пакета, 
        // поэтому используем ColorMatrix для "теплого" RPG вида
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
        this.playerFrames = CharacterFactory.createRaceTexture(this.app, charData.race, charData.color);
        this.player = new PIXI.Sprite(this.playerFrames[0]);
        this.player.anchor.set(0.5, 1.0);
        this.app.stage.addChild(this.player);
        this.player.x = window.innerWidth / 2;
        this.player.y = window.innerHeight / 2;
        this.moveSpeed = 250 + (charData.stats.dex * 15);
        this.buildingSystem.setup();
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
            this.player.y = (window.innerHeight / 2) + Math.sin(this.animTimer * 10) * 3;
        } else {
            // Idle animation: дыхание
            this.player.texture = this.playerFrames[0];
            this.player.scale.y = 1.0 + Math.sin(this.animTimer * 3) * 0.02;
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
        const chunkCont = new PIXI.Container();
        const roofCont = new PIXI.Container();
        const chunkPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        chunkCont.x = roofCont.x = cx * chunkPx;
        chunkCont.y = roofCont.y = cy * chunkPx;

        for (let ty = 0; ty < CONFIG.CHUNK_SIZE; ty++) {
            for (let tx = 0; tx < CONFIG.CHUNK_SIZE; tx++) {
                const gx = cx * CONFIG.CHUNK_SIZE + tx;
                const gy = cy * CONFIG.CHUNK_SIZE + ty;
                const data = this.generator.getTileData(gx, gy);
                
                const tile = new PIXI.Sprite(this.baseTileTex);
                tile.position.set(tx * 32, ty * 32);
                tile.tint = data.isRoad ? 0x3d3d3d : data.biome.color;
                chunkCont.addChild(tile);

                if (data.structureType) {
                    const schema = BuildingTemplates.getHouseSchema(data.structureType);
                    schema.forEach(part => {
                        const s = new PIXI.Sprite(this.buildTextures[part.t]);
                        s.position.set((tx + part.x) * 32, (ty + part.y) * 32);
                        if (part.l === 'r') {
                            s.userData = { gx: gx + part.x, gy: gy + part.y };
                            roofCont.addChild(s);
                        } else chunkCont.addChild(s);
                    });
                }

                if (data.objectType && !data.structureType) {
                    const tex = this.envTextures[`${data.objectType}_tree_1`] || this.envTextures[`${data.objectType}_rock_1`];
                    if (tex) {
                        const obj = new PIXI.Sprite(tex);
                        obj.anchor.set(0.5, 1);
                        obj.position.set(tx * 32 + 16, ty * 32 + 32);
                        chunkCont.addChild(obj);
                    }
                }
            }
        }

        this.worldContainer.addChild(chunkCont);
        this.roofContainer.addChild(roofCont);
        this.loadedChunks.set(`${cx},${cy}`, { body: chunkCont, roof: roofCont });
    }

    handleRoofTransparency() {
        const px = Math.floor(this.cameraPos.x / 32);
        const py = Math.floor(this.cameraPos.y / 32);
        this.roofContainer.children.forEach(chunk => {
            chunk.children.forEach(roofTile => {
                const dist = Math.sqrt(Math.pow(roofTile.userData.gx - px, 2) + Math.pow(roofTile.userData.gy - py, 2));
                roofTile.alpha = dist < 2 ? 0.3 : 1.0;
            });
        });
    }

    renderChunks() {
        const ox = Math.floor(-this.cameraPos.x + window.innerWidth / 2);
        const oy = Math.floor(-this.cameraPos.y + window.innerHeight / 2);
        this.worldContainer.position.set(ox, oy);
        this.roofContainer.position.set(ox, oy);
        this.atmosContainer.position.set(0, 0); // Туман зафиксирован на экране, но сдвигает tilePosition
    }
}
