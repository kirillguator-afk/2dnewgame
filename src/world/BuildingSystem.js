
import { CONFIG, ENTITY_TYPES } from '../core/Constants.js';

export class BuildingSystem {
    constructor(world) {
        this.world = world;
        this.selectedType = ENTITY_TYPES.GEAR;
        this.ghostSprite = null;
    }

    setup() {
        const g = new PIXI.Graphics();
        g.lineStyle(2, 0x00f2ff, 0.5);
        g.drawRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        this.ghostSprite = new PIXI.Sprite(this.world.app.renderer.generateTexture(g));
        this.ghostSprite.alpha = 0.5;
        this.world.app.stage.addChild(this.ghostSprite);
    }

    handleInput(input, cameraPos) {
        const mouse = input.mouse;
        
        // Переводим экранные координаты в мировые
        const worldX = mouse.x + cameraPos.x - window.innerWidth / 2;
        const worldY = mouse.y + cameraPos.y - window.innerHeight / 2;
        
        // Сетка
        const gridX = Math.floor(worldX / CONFIG.TILE_SIZE);
        const gridY = Math.floor(worldY / CONFIG.TILE_SIZE);

        // Обновляем визуализатор (Ghost)
        this.ghostSprite.x = (gridX * CONFIG.TILE_SIZE) - cameraPos.x + window.innerWidth / 2;
        this.ghostSprite.y = (gridY * CONFIG.TILE_SIZE) - cameraPos.y + window.innerHeight / 2;

        if (input.isMouseJustPressed(0)) {
            this.placeBlock(gridX, gridY);
        }
    }

    placeBlock(gx, gy) {
        const id = `ent_${gx}_${gy}`;
        
        // Не ставим блоки друг на друга
        if (this.world.entities.has(id)) return;

        const type = gx % 5 === 0 ? ENTITY_TYPES.MOTOR : ENTITY_TYPES.GEAR;
        
        const container = new PIXI.Container();
        container.x = gx * CONFIG.TILE_SIZE;
        container.y = gy * CONFIG.TILE_SIZE;

        const sprite = new PIXI.Sprite(
            type === ENTITY_TYPES.MOTOR ? this.world.textures.motor : this.world.textures.gear
        );
        sprite.anchor.set(0.5);
        sprite.x = CONFIG.TILE_SIZE / 2;
        sprite.y = CONFIG.TILE_SIZE / 2;
        
        container.addChild(sprite);
        this.world.worldContainer.addChild(container);

        const entityData = {
            id,
            gx, gy,
            type,
            sprite: sprite,
            container: container
        };

        this.world.entities.set(id, entityData);
        this.world.kineticSystem.addEntity(id, type, gx, gy);
        
        console.log(`Placed ${type} at ${gx}:${gy}`);
    }
}
