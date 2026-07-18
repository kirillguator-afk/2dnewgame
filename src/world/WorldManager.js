
import { KineticSystem } from '../systems/KineticSystem.js';
import { BuildingSystem } from './BuildingSystem.js';
import { TerrainGenerator } from './TerrainGenerator.js';
import { CONFIG, BIOMES } from '../core/Constants.js';

export class WorldManager {
    constructor(app) {
        this.app = app;
        this.cameraPos = { x: 500000, y: 500000 };
        this.loadedChunks = new Map();
        this.entities = new Map();
        
        this.worldContainer = new PIXI.Container();
        this.app.stage.addChild(this.worldContainer);
        
        this.generator = new TerrainGenerator(Math.random() * 99999);
        this.kineticSystem = new KineticSystem();
        this.buildingSystem = new BuildingSystem(this);
        
        this.moveSpeed = 400;
        this.charData = null;
    }

    async loadResources() {
        const createDecorTexture = (color, shape) => {
            const g = new PIXI.Graphics();
            g.beginFill(color);
            if (shape === 'rock') g.drawPolygon([4,12, 16,4, 28,12, 24,28, 8,28]);
            if (shape === 'scrap') g.drawRect(8, 8, 16, 16);
            if (shape === 'road') g.drawRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            g.endFill();
            return this.app.renderer.generateTexture(g);
        };

        this.textures = {
            floor: this.generateStaticTexture(0xFFFFFF), // Белый для тинта
            road: createDecorTexture(0x333344, 'road'),
            rock: createDecorTexture(0x555555, 'rock'),
            scrap: createDecorTexture(0xaaaaaa, 'scrap'),
            player: this.generateStaticTexture(0xffffff, 16),
            gear: this.generateGearTexture(0x444444, false),
            motor: this.generateGearTexture(0x00f2ff, true)
        };
    }

    generateGearTexture(color, isMotor) {
        const g = new PIXI.Graphics();
        const size = CONFIG.TILE_SIZE;
        g.beginFill(color);
        g.drawCircle(size/2, size/2, size/2 - 4);
        for(let i=0; i<8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            g.drawRect(size/2 + Math.cos(angle) * (size/2 - 4) - 2, size/2 + Math.sin(angle) * (size/2 - 4) - 2, 4, 4);
        }
        if (isMotor) {
            g.lineStyle(2, 0xff00ff);
            g.drawRect(size/4, size/4, size/2, size/2);
        }
        g.endFill();
        return this.app.renderer.generateTexture(g);
    }

    generateStaticTexture(color, size = CONFIG.TILE_SIZE) {
        const g = new PIXI.Graphics();
        g.beginFill(color);
        g.drawRect(0, 0, size, size);
        g.endFill();
        return this.app.renderer.generateTexture(g);
    }

    setup(charData) {
        this.charData = charData;
        this.player = new PIXI.Sprite(this.textures.player);
        this.player.anchor.set(0.5);
        this.player.zIndex = CONFIG.LAYERS.PLAYER;
        this.app.stage.addChild(this.player);
        this.player.x = window.innerWidth / 2;
        this.player.y = window.innerHeight / 2;
        this.player.tint = PIXI.utils.string2hex(charData.color);
        
        this.moveSpeed = 300 + (charData.stats.dex * 20);
        this.buildingSystem.setup();
    }

    update(dt, input) {
        if (!this.player) return;

        if (input.isKeyDown('KeyW')) this.cameraPos.y -= this.moveSpeed * dt;
        if (input.isKeyDown('KeyS')) this.cameraPos.y += this.moveSpeed * dt;
        if (input.isKeyDown('KeyA')) this.cameraPos.x -= this.moveSpeed * dt;
        if (input.isKeyDown('KeyD')) this.cameraPos.x += this.moveSpeed * dt;

        this.buildingSystem.handleInput(input, this.cameraPos);
        this.kineticSystem.update(dt);
        
        for (const [id, ent] of this.entities) {
            const kinetic = this.kineticSystem.getKineticData(id);
            if (kinetic && kinetic.rpm !== 0) {
                ent.sprite.rotation += (kinetic.rpm * Math.PI * 2 / 60) * dt;
            }
        }

        this.manageChunks();
        this.renderChunks();
    }

    manageChunks() {
        const chunkTotalPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        const currentChunkX = Math.floor(this.cameraPos.x / chunkTotalPx);
        const currentChunkY = Math.floor(this.cameraPos.y / chunkTotalPx);

        for (let x = currentChunkX - 1; x <= currentChunkX + 1; x++) {
            for (let y = currentChunkY - 1; y <= currentChunkY + 1; y++) {
                const key = `${x},${y}`;
                if (!this.loadedChunks.has(key)) this.createChunk(x, y);
            }
        }
        
        // Очистка старых чанков
        for (const [key, container] of this.loadedChunks) {
            const [cx, cy] = key.split(',').map(Number);
            if (Math.abs(cx - currentChunkX) > 2 || Math.abs(cy - currentChunkY) > 2) {
                container.destroy({ children: true });
                this.loadedChunks.delete(key);
            }
        }
    }

    createChunk(cx, cy) {
        const container = new PIXI.Container();
        const chunkTotalPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        container.x = cx * chunkTotalPx;
        container.y = cy * chunkTotalPx;

        // Отрисовка тайлов чанка
        for (let ty = 0; ty < CONFIG.CHUNK_SIZE; ty++) {
            for (let tx = 0; tx < CONFIG.CHUNK_SIZE; tx++) {
                const gx = cx * CONFIG.CHUNK_SIZE + tx;
                const gy = cy * CONFIG.CHUNK_SIZE + ty;
                
                const data = this.generator.getTileData(gx, gy);
                
                // 1. Слой пола
                const tile = new PIXI.Sprite(data.isRoad ? this.textures.road : this.textures.floor);
                tile.x = tx * CONFIG.TILE_SIZE;
                tile.y = ty * CONFIG.TILE_SIZE;
                tile.tint = data.isRoad ? 0x444455 : data.biome.color;
                container.addChild(tile);

                // 2. Слой декораций/ресурсов
                if (data.resource) {
                    const decor = new PIXI.Sprite(data.variation > 5 ? this.textures.rock : this.textures.scrap);
                    decor.x = tx * CONFIG.TILE_SIZE;
                    decor.y = ty * CONFIG.TILE_SIZE;
                    decor.scale.set(0.5 + Math.random() * 0.5);
                    decor.tint = data.biome.accent;
                    container.addChild(decor);
                }
            }
        }

        this.worldContainer.addChildAt(container, 0);
        this.loadedChunks.set(`${cx},${cy}`, container);
    }

    renderChunks() {
        this.worldContainer.x = -this.cameraPos.x + window.innerWidth / 2;
        this.worldContainer.y = -this.cameraPos.y + window.innerHeight / 2;
    }
}
