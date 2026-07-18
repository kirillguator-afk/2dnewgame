
import { KineticSystem } from '../systems/KineticSystem.js';
import { BuildingSystem } from './BuildingSystem.js';
import { TerrainGenerator } from './TerrainGenerator.js';
import { VfxSystem } from '../systems/VfxSystem.js';
import { CONFIG, BIOMES } from '../core/Constants.js';

export class WorldManager {
    constructor(app) {
        this.app = app;
        this.cameraPos = { x: 500000, y: 500000 };
        this.loadedChunks = new Map();
        this.entities = new Map();
        
        // Слои рендеринга
        this.worldContainer = new PIXI.Container();
        this.lightingLayer = new PIXI.Container();
        this.vfxLayer = new PIXI.Container();
        
        // Настройка освещения
        this.darknessOverlay = new PIXI.Graphics();
        this.darknessOverlay.beginFill(0x000000, 0.85);
        this.darknessOverlay.drawRect(0, 0, window.innerWidth, window.innerHeight);
        this.darknessOverlay.endFill();
        
        this.app.stage.addChild(this.worldContainer);
        this.app.stage.addChild(this.darknessOverlay);
        this.app.stage.addChild(this.lightingLayer);
        this.app.stage.addChild(this.vfxLayer);
        
        this.lightingLayer.blendMode = PIXI.BLEND_MODES.ADD;

        this.generator = new TerrainGenerator(Math.random() * 99999);
        this.kineticSystem = new KineticSystem();
        this.vfxSystem = new VfxSystem(this.app, this.vfxLayer);
        this.buildingSystem = new BuildingSystem(this);
        
        this.moveSpeed = 400;
        this.charData = null;
    }

    async loadResources() {
        const createLightTexture = () => {
            const size = 128;
            const canvas = document.createElement('canvas');
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);
            return PIXI.Texture.from(canvas);
        };

        const createTileTexture = (isRoad) => {
            const g = new PIXI.Graphics();
            const size = CONFIG.TILE_SIZE;
            g.beginFill(0xFFFFFF);
            g.drawRect(0, 0, size, size);
            // Добавляем микро-шум
            for(let i=0; i<10; i++) {
                g.beginFill(0x000000, 0.1);
                g.drawRect(Math.random()*size, Math.random()*size, 2, 2);
            }
            g.endFill();
            return this.app.renderer.generateTexture(g);
        };

        this.textures = {
            floor: createTileTexture(false),
            light: createLightTexture(),
            player: this.generateCircleTexture(0xffffff, 12),
            gear: this.generateGearTexture(0x444444, false),
            motor: this.generateGearTexture(0x00f2ff, true)
        };
    }

    generateCircleTexture(color, radius) {
        const g = new PIXI.Graphics();
        g.beginFill(color);
        g.drawCircle(radius, radius, radius);
        g.endFill();
        return this.app.renderer.generateTexture(g);
    }

    generateGearTexture(color, isMotor) {
        const g = new PIXI.Graphics();
        const size = CONFIG.TILE_SIZE;
        g.beginFill(color);
        g.drawCircle(size/2, size/2, size/2 - 4);
        for(let i=0; i<8; i++) {
            const angle = (i/8)*Math.PI*2;
            g.drawRect(size/2 + Math.cos(angle)*(size/2-4)-2, size/2 + Math.sin(angle)*(size/2-4)-2, 4, 4);
        }
        g.endFill();
        return this.app.renderer.generateTexture(g);
    }

    setup(charData) {
        this.charData = charData;
        this.player = new PIXI.Sprite(this.textures.player);
        this.player.anchor.set(0.5);
        this.app.stage.addChild(this.player);
        this.player.x = window.innerWidth / 2;
        this.player.y = window.innerHeight / 2;
        this.player.tint = PIXI.utils.string2hex(charData.color);

        // Фонарик игрока
        this.playerLight = new PIXI.Sprite(this.textures.light);
        this.playerLight.anchor.set(0.5);
        this.playerLight.scale.set(2.0);
        this.playerLight.tint = this.player.tint;
        this.lightingLayer.addChild(this.playerLight);
        
        this.moveSpeed = 300 + (charData.stats.dex * 20);
        this.buildingSystem.setup();
    }

    update(dt, input) {
        if (!this.player) return;

        // Движение
        const oldX = this.cameraPos.x;
        const oldY = this.cameraPos.y;

        if (input.isKeyDown('KeyW')) this.cameraPos.y -= this.moveSpeed * dt;
        if (input.isKeyDown('KeyS')) this.cameraPos.y += this.moveSpeed * dt;
        if (input.isKeyDown('KeyA')) this.cameraPos.x -= this.moveSpeed * dt;
        if (input.isKeyDown('KeyD')) this.cameraPos.x += this.moveSpeed * dt;

        // Эффекты при движении (пыль)
        if (Math.abs(oldX - this.cameraPos.x) > 1 || Math.abs(oldY - this.cameraPos.y) > 1) {
            if (Math.random() > 0.7) {
                this.vfxSystem.spawn(window.innerWidth/2 + (Math.random()-0.5)*20, 
                                     window.innerHeight/2 + 10, 
                                     'dust', 0x333333);
            }
        }

        this.buildingSystem.handleInput(input, this.cameraPos);
        this.kineticSystem.update(dt);
        this.vfxSystem.update(dt);
        
        // Обновление света игрока
        this.playerLight.x = this.player.x;
        this.playerLight.y = this.player.y;
        this.playerLight.alpha = 0.8 + Math.sin(Date.now()*0.01)*0.05; // Мерцание

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
    }

    createChunk(cx, cy) {
        const container = new PIXI.Container();
        const lightContainer = new PIXI.Container();
        const chunkTotalPx = CONFIG.CHUNK_SIZE * CONFIG.TILE_SIZE;
        
        container.x = cx * chunkTotalPx;
        container.y = cy * chunkTotalPx;
        lightContainer.x = container.x;
        lightContainer.y = container.y;

        for (let ty = 0; ty < CONFIG.CHUNK_SIZE; ty++) {
            for (let tx = 0; tx < CONFIG.CHUNK_SIZE; tx++) {
                const gx = cx * CONFIG.CHUNK_SIZE + tx;
                const gy = cy * CONFIG.CHUNK_SIZE + ty;
                const data = this.generator.getTileData(gx, gy);
                
                const tile = new PIXI.Sprite(this.textures.floor);
                tile.x = tx * CONFIG.TILE_SIZE;
                tile.y = ty * CONFIG.TILE_SIZE;
                tile.tint = data.isRoad ? 0x222225 : data.biome.color;
                container.addChild(tile);

                // Добавляем редкие светящиеся элементы (техно-детали)
                if (data.variation > 8) {
                    const l = new PIXI.Sprite(this.textures.light);
                    l.anchor.set(0.5);
                    l.x = tile.x + 16;
                    l.y = tile.y + 16;
                    l.scale.set(0.4);
                    l.tint = data.biome.accent;
                    lightContainer.addChild(l);
                }
            }
        }

        this.worldContainer.addChildAt(container, 0);
        this.lightingLayer.addChild(lightContainer);
        this.loadedChunks.set(`${cx},${cy}`, { container, lightContainer });
    }

    renderChunks() {
        const ox = -this.cameraPos.x + window.innerWidth / 2;
        const oy = -this.cameraPos.y + window.innerHeight / 2;
        
        this.worldContainer.x = ox;
        this.worldContainer.y = oy;
        this.lightingLayer.x = ox;
        this.lightingLayer.y = oy;
        this.vfxLayer.x = ox;
        this.vfxLayer.y = oy;
        
        // Обновляем оверлей тьмы под размер экрана
        this.darknessOverlay.width = window.innerWidth;
        this.darknessOverlay.height = window.innerHeight;
    }
}
